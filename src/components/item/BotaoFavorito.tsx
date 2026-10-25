'use client';

import { Heart } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useFavoritos, selFavorito } from '@/store/favoritos';
import { esmagar } from '@/lib/motion/toque';

/** O coração do item: guarda nos favoritos deste aparelho, com toque e toast. */
export function BotaoFavorito({ itemId, className = '' }: { itemId: string; className?: string }) {
  const favorito = useFavoritos(selFavorito(itemId));
  const alternar = useFavoritos((s) => s.alternar);
  const mostrar = useToast((s) => s.mostrar);

  return (
    <button
      type="button"
      aria-pressed={favorito}
      aria-label={favorito ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      onClick={(e) => {
        void esmagar(e.currentTarget);
        alternar(itemId);
        mostrar(favorito ? 'Removido dos favoritos' : 'Salvo nos favoritos');
      }}
      className={className}
    >
      <Heart className={`size-5 transition-colors ${favorito ? 'fill-fogo text-fogo' : ''}`} aria-hidden />
    </button>
  );
}
