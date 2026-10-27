'use client';

import { flushSync } from 'react-dom';
import { Search } from 'lucide-react';
import { useBusca } from '@/store/busca';

/**
 * A lupa da página inicial: abre a busca por cima do cardápio com o campo já
 * ativo. A camada monta e recebe o foco no mesmo toque (flushSync), senão o
 * iPhone não abre o teclado.
 */
export function BotaoBusca({ className }: { className: string }) {
  return (
    <button
      type="button"
      aria-label="Buscar no cardápio"
      aria-haspopup="dialog"
      onClick={() => {
        flushSync(() => useBusca.getState().abrir());
        document.getElementById('busca')?.focus({ preventScroll: true });
      }}
      className={className}
    >
      <Search className="size-5" aria-hidden />
    </button>
  );
}
