'use client';

import { Heart } from 'lucide-react';
import { CartaoProduto } from './CartaoProduto';
import { useFavoritos } from '@/store/favoritos';
import { acharItem, type ItemComCategoria } from '@/lib/opcoes';

/** "Seus favoritos": os itens com coração deste aparelho, em trilho. Só aparece com algum. */
export function Favoritos() {
  const ids = useFavoritos((s) => s.ids);
  const achados = ids
    .map((id) => acharItem(id))
    .filter((a): a is ItemComCategoria => a !== undefined && a.item.available);

  if (achados.length === 0) return null;

  return (
    <section id="favoritos" className="scroll-mt-[104px] pt-6">
      <h2 className="flex items-center gap-2 px-4 text-secao font-extrabold tracking-[-0.01em]">
        <Heart className="size-5 fill-fogo text-fogo" aria-hidden />
        Seus favoritos
      </h2>
      <ul className="trilho mt-3 pb-1">
        {achados.map(({ item, categoria }) => (
          <CartaoProduto key={item.id} item={item} categoriaId={categoria.id} />
        ))}
      </ul>
    </section>
  );
}
