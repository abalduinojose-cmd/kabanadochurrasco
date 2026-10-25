'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Pedido } from '@/types/pedido';

/**
 * Histórico de pedidos.
 *
 * Guarda os dez últimos. É o que sustenta o "Pedir de novo" ─ recompra em dois
 * toques, a função que mais devolve dinheiro num delivery de bairro.
 */

const LIMITE = 10;

type PedidosStore = {
  pedidos: readonly Pedido[];
  hidratado: boolean;
  registrar: (pedido: Pedido) => void;
  achar: (id: string) => Pedido | undefined;
};

export const usePedidos = create<PedidosStore>()(
  persist(
    (set, get) => ({
      pedidos: [],
      hidratado: false,

      registrar: (pedido) =>
        set((s) => ({ pedidos: [pedido, ...s.pedidos].slice(0, LIMITE) })),

      achar: (id) => get().pedidos.find((p) => p.id === id),
    }),
    {
      name: 'kabana:pedidos',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ pedidos: s.pedidos }),
    },
  ),
);

// Mesma razão do carrinho: marcar a hidratação de fora, onde a store já existe.
if (typeof window !== 'undefined') {
  const marcar = () => usePedidos.setState({ hidratado: true });
  if (usePedidos.persist.hasHydrated()) marcar();
  usePedidos.persist.onFinishHydration(marcar);
}

export const selUltimoPedido = (s: PedidosStore): Pedido | undefined => s.pedidos[0];
