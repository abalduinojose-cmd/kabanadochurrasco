'use client';

import { useSyncExternalStore } from 'react';
import { Check, Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useInstalacao } from '@/store/instalacao';

/**
 * Instalar o app, no Perfil. Android/desktop: o botão dispara o prompt
 * nativo guardado. iPhone não tem esse evento: mostra o caminho
 * (Compartilhar, Adicionar à Tela de Início). Já instalado: confirma.
 */

type Ambiente = 'standalone' | 'ios' | 'outro' | null;

const assinar = () => () => {};
const lerAmbiente = (): Ambiente => {
  if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) return 'ios';
  return 'outro';
};
const noServidor = (): Ambiente => null;

export function BotaoInstalar() {
  const ambiente = useSyncExternalStore(assinar, lerAmbiente, noServidor);
  const evento = useInstalacao((s) => s.evento);
  const instalado = useInstalacao((s) => s.instalado);
  const instalar = useInstalacao((s) => s.instalar);

  if (ambiente === null) return null;

  if (ambiente === 'standalone' || instalado) {
    return (
      <p className="inline-flex items-center gap-2 text-[14px] font-semibold text-verde">
        <Check className="size-4" aria-hidden />
        App instalado neste aparelho
      </p>
    );
  }

  if (ambiente === 'ios') {
    return (
      <div className="rounded-cartao bg-fundo-2 p-4">
        <p className="text-[15px] font-bold text-texto">Instalar no iPhone</p>
        <ol className="mt-2 space-y-1.5 text-[14px] leading-snug text-texto-2">
          <li className="flex items-center gap-2">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-cartao text-[11px] font-bold text-texto">1</span>
            Toque em <Share className="inline size-4 text-texto" aria-label="Compartilhar" /> na barra do Safari
          </li>
          <li className="flex items-center gap-2">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-cartao text-[11px] font-bold text-texto">2</span>
            Escolha <span className="font-semibold text-texto">Adicionar à Tela de Início</span>
          </li>
        </ol>
      </div>
    );
  }

  if (!evento) return null;

  return (
    <Button onClick={() => void instalar()} className="w-full">
      <Download className="size-5" aria-hidden />
      Instalar o app Kabana
    </Button>
  );
}
