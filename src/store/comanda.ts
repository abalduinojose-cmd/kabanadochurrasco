'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { chaveDaLinha } from '@/store/cart';
import { MENU } from '@/data/cardapio';
import { toCents, type Cents } from '@/lib/money';
import { precoLinha, type LinhaCarrinho } from '@/types/carrinho';

/**
 * As comandas do atendimento na mesa (tablet do garçom), separadas da sacola
 * do delivery. O tablet cuida de várias mesas ao mesmo tempo:
 *
 * - a mesa ABERTA na tela fica nos campos do topo (`mesa`, `garcom`,
 *   `linhas`, `enviados`, `abertaEm`), que é o que o cardápio lê;
 * - as outras mesas em atendimento ficam guardadas em `emAtendimento`, com o
 *   pedido em montagem e a conta, e aparecem na tela das mesas.
 *
 * Voltar às mesas guarda a mesa aberta (não apaga nada); abrir uma mesa em
 * atendimento traz tudo de volta; só "encerrar a mesa" limpa. O /atendimento
 * sempre começa na tela das mesas: recarregar a página guarda a mesa que
 * estava aberta. Tudo fica no aparelho (sem servidor, um tablet não vê as
 * mesas de outro).
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

/** Uma mesa em atendimento guardada enquanto outra está na tela. */
export type ComandaGuardada = {
  readonly garcom: string;
  readonly linhas: readonly LinhaCarrinho[];
  readonly enviados: readonly PedidoEnviado[];
  readonly abertaEm: number;
};

type Estado = {
  mesa: string | null;
  garcom: string;
  linhas: readonly LinhaCarrinho[];
  enviados: readonly PedidoEnviado[];
  abertaEm: number | null;
  emAtendimento: Readonly<Record<string, ComandaGuardada>>;
  hidratado: boolean;
};

type Acoes = {
  /** Abre a mesa: retoma a comanda guardada ou começa uma nova. */
  abrirMesa: (mesa: string, garcom: string) => void;
  adicionar: (linha: Omit<LinhaCarrinho, 'uid'>) => void;
  alterarQuantidade: (uid: string, quantidade: number) => void;
  remover: (uid: string) => void;
  /** Fecha o pedido em montagem como enviado e devolve o registro. */
  registrarEnvio: (via: PedidoEnviado['via'], nome?: string) => PedidoEnviado | null;
  /** Garçom: limpa tudo da mesa e volta à escolha de mesa. */
  encerrarMesa: () => void;
  /** Volta à tela das mesas guardando a mesa aberta (continua em atendimento). */
  voltarAsMesas: () => void;
};

/** A mesa da tela, pronta para guardar (null se não há mesa aberta). */
function guardarAberta(s: Estado): Record<string, ComandaGuardada> {
  if (!s.mesa) return { ...s.emAtendimento };
  return {
    ...s.emAtendimento,
    [s.mesa]: { garcom: s.garcom, linhas: s.linhas, enviados: s.enviados, abertaEm: s.abertaEm ?? Date.now() },
  };
}

const SEM_MESA = { mesa: null, linhas: [], enviados: [], abertaEm: null } as const;

export const useComanda = create<Estado & Acoes>()(
  persist(
    (set, get) => ({
      mesa: null,
      garcom: '',
      linhas: [],
      enviados: [],
      abertaEm: null,
      emAtendimento: {},
      hidratado: false,

      abrirMesa: (mesa, garcom) => {
        const guardadas = guardarAberta(get());
        const retomada = guardadas[mesa];
        delete guardadas[mesa];
        set({
          mesa,
          garcom: retomada?.garcom || garcom.trim(),
          linhas: retomada?.linhas ?? [],
          enviados: retomada?.enviados ?? [],
          abertaEm: retomada?.abertaEm ?? Date.now(),
          emAtendimento: guardadas,
        });
      },

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

      encerrarMesa: () => {
        const { mesa, emAtendimento } = get();
        const resto = { ...emAtendimento };
        if (mesa) delete resto[mesa];
        set({ ...SEM_MESA, emAtendimento: resto });
      },

      voltarAsMesas: () => set({ ...SEM_MESA, emAtendimento: guardarAberta(get()) }),
    }),
    {
      name: 'kabana:atendimento',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ mesa: s.mesa, garcom: s.garcom, linhas: s.linhas, enviados: s.enviados, abertaEm: s.abertaEm, emAtendimento: s.emAtendimento }),
      onRehydrateStorage: () => (estado) => {
        if (!estado) return;
        // O /atendimento sempre começa na tela das mesas: a mesa que estava aberta é guardada.
        estado.emAtendimento = guardarAberta({ ...estado, emAtendimento: estado.emAtendimento ?? {} });
        Object.assign(estado, SEM_MESA);
        // Cardápio mudou: item que saiu cai do pedido em montagem, preço volta ao de hoje.
        estado.emAtendimento = Object.fromEntries(
          Object.entries(estado.emAtendimento).map(([mesa, c]) => [mesa, { ...c, linhas: atualizarLinhas(c.linhas) }]),
        );
      },
    },
  ),
);

if (typeof window !== 'undefined') {
  const marcar = () => useComanda.setState({ hidratado: true });
  if (useComanda.persist.hasHydrated()) marcar();
  useComanda.persist.onFinishHydration(marcar);
}

/** Item que saiu do cardápio cai do pedido em montagem; preço volta ao de hoje. */
function atualizarLinhas(linhas: readonly LinhaCarrinho[]): LinhaCarrinho[] {
  return linhas.flatMap((l) => {
    for (const c of MENU) {
      const item = c.items.find((i) => i.id === l.itemId);
      if (item) return item.available ? [{ ...l, categoriaId: c.id, nome: item.nome, precoBaseCents: toCents(item.preco) }] : [];
    }
    return [];
  });
}

export const selTotalComanda = (s: Estado): Cents => s.linhas.reduce((t, l) => t + precoLinha(l), 0);
export const selItensComanda = (s: Estado): number => s.linhas.reduce((t, l) => t + l.quantidade, 0);
export const selContaMesa = (s: Estado): Cents => s.enviados.reduce((t, p) => t + p.totalCents, 0);

/** O resumo de uma mesa em atendimento para a tela das mesas. */
export function resumoDaComanda(c: ComandaGuardada): { itensNoPedido: number; pedidosEnviados: number; contaCents: Cents } {
  return {
    itensNoPedido: c.linhas.reduce((t, l) => t + l.quantidade, 0),
    pedidosEnviados: c.enviados.length,
    contaCents: c.enviados.reduce((t, p) => t + p.totalCents, 0),
  };
}
