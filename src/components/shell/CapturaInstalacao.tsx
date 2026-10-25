'use client';

import { useEffect } from 'react';
import { useInstalacao } from '@/store/instalacao';

/** Segura o banner nativo e guarda o evento para oferecer no nosso tempo. */
export function CapturaInstalacao() {
  const guardar = useInstalacao((s) => s.guardar);
  const marcarInstalado = useInstalacao((s) => s.marcarInstalado);

  useEffect(() => {
    const aoPoder = (e: Event) => {
      e.preventDefault();
      guardar(e as Parameters<typeof guardar>[0]);
    };
    const aoInstalar = () => marcarInstalado();
    window.addEventListener('beforeinstallprompt', aoPoder);
    window.addEventListener('appinstalled', aoInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', aoPoder);
      window.removeEventListener('appinstalled', aoInstalar);
    };
  }, [guardar, marcarInstalado]);

  return null;
}
