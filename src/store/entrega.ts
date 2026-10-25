'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BAIRROS, type ModoEntrega } from '@/lib/delivery';

/**
 * Como e onde receber: entrega ou retirada e o bairro escolhido. É o
 * "Entregar em" do iFood, decidido na loja e lembrado para a sacola e o
 * checkout. `escolhido` marca que a pessoa já respondeu (ou dispensou) a
 * pergunta da primeira visita.
 */

type Escolha = { modo: ModoEntrega; bairro: string | null };

type EntregaStore = Escolha & {
  escolhido: boolean;
  hidratado: boolean;
  definir: (modo: ModoEntrega) => void;
  definirBairro: (bairro: string | null) => void;
  confirmar: (escolha: Escolha) => void;
  dispensar: () => void;
};

export const useEntrega = create<EntregaStore>()(
  persist(
    (set) => ({
      modo: 'entrega',
      bairro: null,
      escolhido: false,
      hidratado: false,
      definir: (modo) => set({ modo }),
      definirBairro: (bairro) => set({ bairro }),
      confirmar: ({ modo, bairro }) => set({ modo, bairro, escolhido: true }),
      dispensar: () => set({ escolhido: true }),
    }),
    {
      name: 'kabana:entrega',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ modo: s.modo, bairro: s.bairro, escolhido: s.escolhido }),
    },
  ),
);

// Mesma razão do carrinho: marcar a hidratação de fora, onde a store já existe.
// Bairro lembrado que saiu da lista de fretes (a loja mudou as zonas) é
// descartado e a pergunta volta, em vez de ficar "Entrega em X" sem taxa.
if (typeof window !== 'undefined') {
  const marcar = () => {
    const { bairro } = useEntrega.getState();
    const sumiu = bairro !== null && !BAIRROS.includes(bairro);
    useEntrega.setState(sumiu ? { hidratado: true, bairro: null, escolhido: false } : { hidratado: true });
  };
  if (useEntrega.persist.hasHydrated()) marcar();
  useEntrega.persist.onFinishHydration(marcar);
}
