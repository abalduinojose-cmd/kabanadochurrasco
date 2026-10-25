'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/** Itens favoritos deste aparelho (o coração da página do item). */
type FavoritosStore = {
  ids: readonly string[];
  hidratado: boolean;
  alternar: (id: string) => void;
};

export const useFavoritos = create<FavoritosStore>()(
  persist(
    (set, get) => ({
      ids: [],
      hidratado: false,
      alternar: (id) => {
        const { ids } = get();
        set({ ids: ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids] });
      },
    }),
    {
      name: 'kabana:favoritos',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ ids: s.ids }),
    },
  ),
);

if (typeof window !== 'undefined') {
  const marcar = () => useFavoritos.setState({ hidratado: true });
  if (useFavoritos.persist.hasHydrated()) marcar();
  useFavoritos.persist.onFinishHydration(marcar);
}

export const selFavorito =
  (id: string) =>
  (s: FavoritosStore): boolean =>
    s.ids.includes(id);
