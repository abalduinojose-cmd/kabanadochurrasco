'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { chaveDaLinha } from '@/store/cart';
import { MENU } from '@/data/cardapio';
import { toCents, type Cents } from '@/lib/money';
import { precoLinha, type LinhaCarrinho } from '@/types/carrinho';

/**
 * A comanda do atendimento na mesa (tablet do garçom), separada da sacola do
 * delivery: a mesa e o atendente que o garçom escolheu, o pedido em montagem
 * e os pedidos já enviados (a conta da mesa). Fica no aparelho até o garçom
 * encerrar a mesa, então sobrevive a recarregar a página ou a voltar do
 * WhatsApp.
 */

export type PedidoEnviado = {
  readonly numero: number;
  readonly em: number;
  readonly nome?: string;
  readonly linhas: readonly LinhaCarrinho[];
  readonly totalCents: Cents;
  /** 'whatsapp' foi pelo WhatsApp da loja; 'garcom' foi mostrado na tela. */
  readonly via: 'whatsapp' | 'garcom';
};

type Estado = {
  mesa: string | null;
  garcom: string;
  linhas: readonly LinhaCarrinho[];
  enviados: readonly PedidoEnviado[];
  hidratado: boolean;
};

type Acoes = {
  abrirMesa: (mesa: string, garcom: string) => void;
  adicionar: (linha: Omit<LinhaCarrinho, 'uid'>) => void;
  alterarQuantidade: (uid: string, quantidade: number) => void;
  remover: (uid: string) => void;
  /** Fecha o pedido em montagem como enviado e devolve o registro. */
  registrarEnvio: (via: PedidoEnviado['via'], nome?: string) => PedidoEnviado | null;
  /** Garçom: limpa tudo da mesa e volta à escolha de mesa. */
  encerrarMesa: () => void;
  /** Garçom: troca a mesa sem apagar o atendente. */
  trocarMesa: () => void;
};

export const useComanda = create<Estado & Acoes>()(
  persist(
    (set, get) => ({
      mesa: null,
      garcom: '',
      linhas: [],
      enviados: [],
      hidratado: false,

      abrirMesa: (mesa, garcom) => set({ mesa, garcom: garcom.trim() }),

      adicionar: (nova) => {
        const uid = chaveDaLinha(nova.itemId, nova.opcoes, nova.observacao);
        const { linhas } = get();
        const existente = linhas.find((l) => l.uid === uid);
        set({
          linhas: existente
            ? linhas.map((l) => (l.uid === uid ? { ...l, quantidade: l.quantidade + nova.quantidade } : l))
            : [...linhas, { ...nova, uid }],
        });
      },

      alterarQuantidade: (uid, quantidade) => {
        if (quantidade < 1) return get().remover(uid);
        set({ linhas: get().linhas.map((l) => (l.uid === uid ? { ...l, quantidade } : l)) });
      },

      remover: (uid) => set({ linhas: get().linhas.filter((l) => l.uid !== uid) }),

      registrarEnvio: (via, nome) => {
        const { linhas, enviados } = get();
        if (linhas.length === 0) return null;
        const pedido: PedidoEnviado = {
          numero: enviados.length + 1,
          em: Date.now(),
          nome: nome?.trim() || undefined,
          linhas,
          totalCents: linhas.reduce((t, l) => t + precoLinha(l), 0),
          via,
        };
        set({ linhas: [], enviados: [...enviados, pedido] });
        return pedido;
      },

      encerrarMesa: () => set({ mesa: null, linhas: [], enviados: [] }),

      trocarMesa: () => set({ mesa: null }),
    }),
    {
      name: 'kabana:atendimento',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ mesa: s.mesa, garcom: s.garcom, linhas: s.linhas, enviados: s.enviados }),
      onRehydrateStorage: () => (estado) => {
        if (!estado) return;
        // Cardápio mudou: item que saiu cai do pedido em montagem, preço volta ao de hoje.
        estado.linhas = estado.linhas.flatMap((l) => {
          for (const c of MENU) {
            const item = c.items.find((i) => i.id === l.itemId);
            if (item) return item.available ? [{ ...l, categoriaId: c.id, nome: item.nome, precoBaseCents: toCents(item.preco) }] : [];
          }
          return [];
        });
      },
    },
  ),
);

if (typeof window !== 'undefined') {
  const marcar = () => useComanda.setState({ hidratado: true });
  if (useComanda.persist.hasHydrated()) marcar();
  useComanda.persist.onFinishHydration(marcar);
}

export const selTotalComanda = (s: Estado): Cents => s.linhas.reduce((t, l) => t + precoLinha(l), 0);
export const selItensComanda = (s: Estado): number => s.linhas.reduce((t, l) => t + l.quantidade, 0);
export const selContaMesa = (s: Estado): Cents => s.enviados.reduce((t, p) => t + p.totalCents, 0);
