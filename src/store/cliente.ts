'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Os dados que a pessoa digitou no último pedido, para o checkout seguinte
 * vir preenchido (o "Seus dados" dos apps grandes). Só neste aparelho.
 */

export type EnderecoSalvo = {
  readonly bairro: string;
  readonly rua: string;
  readonly numero: string;
  readonly complemento?: string;
  readonly referencia?: string;
};

export type DadosSalvos = {
  readonly nome: string;
  readonly telefone: string;
  readonly endereco: EnderecoSalvo | null;
};

type ClienteStore = {
  dados: DadosSalvos | null;
  hidratado: boolean;
  salvar: (dados: DadosSalvos) => void;
  apagar: () => void;
};

export const useCliente = create<ClienteStore>()(
  persist(
    (set) => ({
      dados: null,
      hidratado: false,
      salvar: (dados) => set({ dados }),
      apagar: () => set({ dados: null }),
    }),
    {
      name: 'kabana:cliente',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ dados: s.dados }),
    },
  ),
);

if (typeof window !== 'undefined') {
  const marcar = () => useCliente.setState({ hidratado: true });
  if (useCliente.persist.hasHydrated()) marcar();
  useCliente.persist.onFinishHydration(marcar);
}
