'use client';

import { create } from 'zustand';

/** O termo da busca do cardápio. Vazio = cardápio normal. */
type BuscaStore = {
  termo: string;
  definir: (termo: string) => void;
  limpar: () => void;
};

export const useBusca = create<BuscaStore>((set) => ({
  termo: '',
  definir: (termo) => set({ termo }),
  limpar: () => set({ termo: '' }),
}));

export const selBuscando = (s: BuscaStore): boolean => s.termo.trim().length > 0;
