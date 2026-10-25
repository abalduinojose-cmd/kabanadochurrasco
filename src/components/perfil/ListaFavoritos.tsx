'use client';

import { Heart } from 'lucide-react';
import { LinhaProduto } from '@/components/inicio/LinhaProduto';
import { LinkBotao } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useFavoritos } from '@/store/favoritos';
import { acharItem, type ItemComCategoria } from '@/lib/opcoes';

/** Os favoritos em lista, com o [+] de cada linha. */
export function ListaFavoritos() {
  const hidratado = useFavoritos((s) => s.hidratado);
  const ids = useFavoritos((s) => s.ids);

  if (!hidratado) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const achados = ids.map((id) => acharItem(id)).filter((a): a is ItemComCategoria => a !== undefined);

  if (achados.length === 0) {
    return (
      <div className="px-6 py-20 text-center">
        <Heart className="mx-auto size-12 text-texto-3" strokeWidth={1.5} aria-hidden />
        <p className="mt-4 text-[18px] font-extrabold text-texto">Nenhum favorito ainda</p>
        <p className="mx-auto mt-2 max-w-[30ch] text-[14px] text-texto-2">
          Toque no coração na página de um item e ele aparece aqui e no Início.
        </p>
        <LinkBotao href="/" className="mt-6">
          Ver cardápio
        </LinkBotao>
      </div>
    );
  }

  return (
    <ul className="px-4">
      {achados.map(({ item, categoria }) => (
        <LinhaProduto key={item.id} item={item} categoriaId={categoria.id} />
      ))}
    </ul>
  );
}
