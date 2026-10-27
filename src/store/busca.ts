'use client';

import { create } from 'zustand';

/**
 * O termo da busca do cardápio (vazio = cardápio normal) e se a busca está
 * aberta por cima da página inicial (a lupa da capa e da barra fixa).
 */
type BuscaStore = {
  termo: string;
  aberta: boolean;
  definir: (termo: string) => void;
  limpar: () => void;
  abrir: () => void;
  fechar: () => void;
};

export const useBusca = create<BuscaStore>((set) => ({
  termo: '',
  aberta: false,
  definir: (termo) => set({ termo }),
  limpar: () => set({ termo: '' }),
  abrir: () => set({ aberta: true }),
  fechar: () => set({ aberta: false }),
}));

export const selBuscando = (s: BuscaStore): boolean => s.termo.trim().length > 0;
