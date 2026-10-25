'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CartaoProduto } from './CartaoProduto';
import type { MenuItem } from '@/types/menu';

/**
 * Uma prateleira de bebidas ou doces, como no mercado do iFood: o título com
 * a contagem, os produtos em trilho e "Ver todos", que abre a mesma
 * prateleira em grade de três colunas (e fecha de volta).
 */

type Props = { titulo: string; categoriaId: string; itens: readonly MenuItem[] };

const MINIMO_PARA_ABRIR = 4;

export function Vitrine({ titulo, categoriaId, itens }: Props) {
  const [aberta, setAberta] = useState(false);
  const podeAbrir = itens.length >= MINIMO_PARA_ABRIR;
  const emGrade = aberta || !podeAbrir;

  return (
    <div className="pt-5">
      <div className="flex min-h-11 items-center justify-between gap-3 pl-4 pr-2">
        <h3 className="text-[16px] font-bold text-texto">
          {titulo} <span className="font-medium text-texto-3">{itens.length}</span>
        </h3>
        {podeAbrir && (
          <button
            type="button"
            onClick={() => setAberta((a) => !a)}
            aria-expanded={aberta}
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-[13px] font-bold text-fogo-texto active:bg-fogo-suave"
          >
            {aberta ? 'Ver menos' : 'Ver todos'}
            <ChevronDown className={`size-4 transition-transform duration-200 ${aberta ? 'rotate-180' : ''}`} aria-hidden />
          </button>
        )}
      </div>
      {emGrade ? (
        <ul className="mt-2 grid grid-cols-3 gap-x-3 gap-y-5 px-4 sm:grid-cols-4">
          {itens.map((item) => (
            <CartaoProduto key={item.id} item={item} categoriaId={categoriaId} variante="grade" />
          ))}
        </ul>
      ) : (
        <ul className="trilho mt-2 pb-1">
          {itens.map((item) => (
            <CartaoProduto key={item.id} item={item} categoriaId={categoriaId} variante="vitrine" />
          ))}
        </ul>
      )}
    </div>
  );
}
