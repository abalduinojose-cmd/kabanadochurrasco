'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { normalizarCodigo } from '@/lib/cupom';

/**
 * O cupom que o cliente aplicou. Fica guardado (inclusive se ainda falta
 * chegar ao mínimo) até o pedido sair ou ele remover.
 */
type CupomStore = {
  codigo: string | null;
  hidratado: boolean;
  aplicar: (codigo: string) => void;
  remover: () => void;
};

export const useCupom = create<CupomStore>()(
  persist(
    (set) => ({
      codigo: null,
      hidratado: false,
      aplicar: (codigo) => set({ codigo: normalizarCodigo(codigo) || null }),
      remover: () => set({ codigo: null }),
    }),
    {
      name: 'kabana:cupom',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ codigo: s.codigo }),
    },
  ),
);

// Mesma razão do carrinho: marcar a hidratação de fora, onde a store já existe.
if (typeof window !== 'undefined') {
  const marcar = () => useCupom.setState({ hidratado: true });
  if (useCupom.persist.hasHydrated()) marcar();
  useCupom.persist.onFinishHydration(marcar);
}
