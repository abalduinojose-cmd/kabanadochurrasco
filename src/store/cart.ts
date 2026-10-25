'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Cents } from '@/lib/money';
import {
  precoLinha,
  type LinhaCarrinho,
  type OpcaoEscolhida,
} from '@/types/carrinho';

/**
 * Carrinho.
 *
 * Vive no localStorage e **expira em 12 horas**: cliente que volta três dias
 * depois com preço velho é erro de negócio, não conveniência.
 *
 * Nada aqui calcula em real. Toda soma é em centavos inteiros.
 */

const VALIDADE_MS = 12 * 60 * 60 * 1000;
const JANELA_DESFAZER_MS = 5_000;

/** Identidade da linha: item + opções escolhidas + observação. */
export function chaveDaLinha(
  itemId: string,
  opcoes: readonly OpcaoEscolhida[],
  observacao?: string,
): string {
  const ops = [...opcoes]
    .map((o) => `${o.grupoId}:${o.opcaoId}`)
    .sort()
    .join('|');
  const obs = (observacao ?? '').trim().toLowerCase();
  return `${itemId}#${ops}#${obs}`;
}

type Removida = { readonly linha: LinhaCarrinho; readonly indice: number; readonly em: number };

type Estado = {
  linhas: readonly LinhaCarrinho[];
  /** Quando o carrinho começou a existir. Base da expiração de 12h. */
  criadoEm: number | null;
  /** Falso até o localStorage voltar. Impede divergência de hidratação. */
  hidratado: boolean;
  /** Última linha removida, para o desfazer. */
  removida: Removida | null;
};

type Acoes = {
  adicionar: (linha: Omit<LinhaCarrinho, 'uid'>) => void;
  alterarQuantidade: (uid: string, quantidade: number) => void;
  remover: (uid: string) => void;
  desfazerRemocao: () => void;
  descartarDesfazer: () => void;
  limpar: () => void;
  restaurar: (linhas: readonly LinhaCarrinho[]) => void;
};

export type CarrinhoStore = Estado & Acoes;

const VAZIO: Estado = {
  linhas: [],
  criadoEm: null,
  hidratado: false,
  removida: null,
};

export const useCarrinho = create<CarrinhoStore>()(
  persist(
    (set, get) => ({
      ...VAZIO,

      adicionar: (nova) => {
        const uid = chaveDaLinha(nova.itemId, nova.opcoes, nova.observacao);
        const { linhas, criadoEm } = get();
        const existente = linhas.find((l) => l.uid === uid);

        set({
          criadoEm: criadoEm ?? Date.now(),
          removida: null,
          linhas: existente
            ? linhas.map((l) =>
                l.uid === uid ? { ...l, quantidade: l.quantidade + nova.quantidade } : l,
              )
            : [...linhas, { ...nova, uid }],
        });
      },

      alterarQuantidade: (uid, quantidade) => {
        if (quantidade < 1) {
          get().remover(uid);
          return;
        }
        set({
          linhas: get().linhas.map((l) => (l.uid === uid ? { ...l, quantidade } : l)),
        });
      },

      remover: (uid) => {
        const { linhas } = get();
        const indice = linhas.findIndex((l) => l.uid === uid);
        if (indice < 0) return;
        const linha = linhas[indice];
        if (!linha) return;

        const restantes = linhas.filter((l) => l.uid !== uid);
        set({
          linhas: restantes,
          // Desfazer no lugar de modal de confirmação.
          removida: { linha, indice, em: Date.now() },
          criadoEm: restantes.length === 0 ? null : get().criadoEm,
        });
      },

      desfazerRemocao: () => {
        const { removida, linhas, criadoEm } = get();
        if (!removida) return;
        if (Date.now() - removida.em > JANELA_DESFAZER_MS) {
          set({ removida: null });
          return;
        }
        const volta = [...linhas];
        volta.splice(Math.min(removida.indice, volta.length), 0, removida.linha);
        set({ linhas: volta, removida: null, criadoEm: criadoEm ?? Date.now() });
      },

      descartarDesfazer: () => set({ removida: null }),

      limpar: () => set({ linhas: [], criadoEm: null, removida: null }),

      restaurar: (linhas) =>
        set({ linhas: [...linhas], criadoEm: Date.now(), removida: null }),
    }),
    {
      name: 'kabana:carrinho',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // O desfazer e a flag de hidratação são de sessão, não se guardam.
      partialize: (s) => ({ linhas: s.linhas, criadoEm: s.criadoEm }),
      /*
       * Mexe no estado reidratado direto, e não via `useCarrinho.setState`:
       * a reidratação roda durante a criação da store, quando a constante
       * `useCarrinho` ainda não existe. Chamar o setState dali falha calado e
       * a flag `hidratado` nunca vira true ─ a barra do carrinho não aparece
       * nunca, mesmo com item guardado.
       */
      onRehydrateStorage: () => (estado) => {
        if (!estado) return;

        const vencido = estado.criadoEm !== null && Date.now() - estado.criadoEm > VALIDADE_MS;
        if (vencido) {
          estado.linhas = [];
          estado.criadoEm = null;
        }
        estado.removida = null;
        estado.hidratado = true;
      },
    },
  ),
);

/*
 * Marca a hidratação de fora da store, onde `useCarrinho` já existe.
 *
 * Só o `onRehydrateStorage` não bastaria: com o localStorage vazio a
 * persistência pode não chegar a aplicar um `set`, e a flag ficaria presa em
 * false ─ a barra do carrinho nunca apareceria para quem começa do zero.
 */
if (typeof window !== 'undefined') {
  const marcar = () => useCarrinho.setState({ hidratado: true });
  if (useCarrinho.persist.hasHydrated()) marcar();
  useCarrinho.persist.onFinishHydration(marcar);
}

/* ---------- seletores derivados (nunca guardados no estado) ---------- */

export const selQuantidade = (s: CarrinhoStore): number =>
  s.linhas.reduce((t, l) => t + l.quantidade, 0);

export const selSubtotal = (s: CarrinhoStore): Cents =>
  s.linhas.reduce((t, l) => t + precoLinha(l), 0);

export const selTemAlcool = (s: CarrinhoStore): boolean => s.linhas.some((l) => l.alcoolico);

/** Unidades somadas das categorias que contam para o mínimo de espeto. */
export const selUnidadesDeEspeto =
  (categorias: readonly string[]) =>
  (s: CarrinhoStore): number =>
    s.linhas
      .filter((l) => categorias.includes(l.categoriaId))
      .reduce((t, l) => t + l.quantidade, 0);

export { JANELA_DESFAZER_MS };
