'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Os dados da pessoa: o cadastro (feito em /cadastro) ou o que ela digitou no
 * último pedido, para o checkout seguinte vir preenchido (o "Seus dados" dos
 * apps grandes). `cadastroEm` marca quem fez o cadastro (o checkout regrava
 * os dados sem apagar a marca). Só neste aparelho: sem servidor, a loja não
 * recebe o cadastro, só a mensagem de cada pedido.
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
  /** Data do cadastro (ISO), ou null para quem ainda não fez. */
  cadastroEm: string | null;
  /** O convite do cadastro no Início foi fechado no X. */
  conviteFechado: boolean;
  hidratado: boolean;
  salvar: (dados: DadosSalvos) => void;
  cadastrar: (dados: DadosSalvos) => void;
  fecharConvite: () => void;
  apagar: () => void;
};

export const useCliente = create<ClienteStore>()(
  persist(
    (set) => ({
      dados: null,
      cadastroEm: null,
      conviteFechado: false,
      hidratado: false,
      salvar: (dados) => set({ dados }),
      cadastrar: (dados) => set((s) => ({ dados, cadastroEm: s.cadastroEm ?? new Date().toISOString() })),
      fecharConvite: () => set({ conviteFechado: true }),
      apagar: () => set({ dados: null, cadastroEm: null }),
    }),
    {
      name: 'kabana:cliente',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ dados: s.dados, cadastroEm: s.cadastroEm, conviteFechado: s.conviteFechado }),
    },
  ),
);

if (typeof window !== 'undefined') {
  const marcar = () => useCliente.setState({ hidratado: true });
  if (useCliente.persist.hasHydrated()) marcar();
  useCliente.persist.onFinishHydration(marcar);
}
