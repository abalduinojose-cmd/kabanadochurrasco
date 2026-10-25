'use client';

import { Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { LOJA } from '@/data/loja';
import { comBase } from '@/lib/base-path';

/**
 * Compartilhar a loja (ou um item, com `url` e `titulo`): Web Share onde
 * existe; senão copia o link e avisa no toast.
 */
export function BotaoCompartilhar({
  className = 'grid size-10 min-h-10 place-items-center rounded-full bg-white/92 text-texto shadow-sm',
  url,
  titulo,
}: {
  className?: string;
  url?: string;
  titulo?: string;
}) {
  const mostrar = useToast((s) => s.mostrar);

  async function compartilhar() {
    const dados = {
      title: titulo ? `${titulo} • ${LOJA.nome}` : LOJA.nome,
      text: titulo ? `${titulo} na ${LOJA.nome}` : `${LOJA.nome}, ${LOJA.tagline}`,
      url: url ?? `${window.location.origin}${comBase('/')}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(dados);
        return;
      }
      await navigator.clipboard?.writeText(dados.url);
      mostrar('Link copiado');
    } catch {
      // cancelado pela pessoa: nada a fazer
    }
  }

  return (
    <button type="button" onClick={() => void compartilhar()} aria-label={titulo ? `Compartilhar ${titulo}` : 'Compartilhar a loja'} className={className}>
      <Share2 className="size-5" aria-hidden />
    </button>
  );
}
