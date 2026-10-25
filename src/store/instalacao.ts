'use client';

import { create } from 'zustand';

/**
 * O evento `beforeinstallprompt`, guardado uma vez para quem quiser oferecer
 * a instalação (o convite do cardápio e o botão da aba Loja).
 */

type EventoInstalar = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type InstalacaoStore = {
  evento: EventoInstalar | null;
  instalado: boolean;
  guardar: (e: EventoInstalar) => void;
  marcarInstalado: () => void;
  instalar: () => Promise<void>;
};

export const useInstalacao = create<InstalacaoStore>((set, get) => ({
  evento: null,
  instalado: false,
  guardar: (evento) => set({ evento }),
  marcarInstalado: () => set({ instalado: true, evento: null }),
  instalar: async () => {
    const e = get().evento;
    if (!e) return;
    await e.prompt();
    const escolha = await e.userChoice?.catch(() => undefined);
    if (escolha?.outcome === 'accepted') set({ instalado: true });
    set({ evento: null });
  },
}));
