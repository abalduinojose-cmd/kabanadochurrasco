'use client';

import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { FotoProduto } from '@/components/inicio/FotoProduto';
import { fotoDoItem } from '@/data/fotos';
import { formatBRL, toCents } from '@/lib/money';
import { iconeDaCategoria } from '@/lib/icones-categoria';
import { ehAlcoolico, ehDireto, precoVaria } from '@/lib/opcoes';
import type { MenuItem } from '@/types/menu';

/**
 * Cartão de prato no tablet: foto 4:3 grande, nome, descrição em duas linhas,
 * preço e o [+]. Tocar no cartão abre o prato (foto grande e escolhas); o [+]
 * põe direto no pedido quando o prato não tem escolha obrigatória. O selo
 * escuro no canto mostra quantos já estão no pedido.
 */

type Props = {
  item: MenuItem;
  categoriaId: string;
  noPedido: number;
  aoAbrir: () => void;
  aoAdicionarDireto: (botao: HTMLElement) => void;
};

export function CartaoMesa({ item, categoriaId, noPedido, aoAbrir, aoAdicionarDireto }: Props) {
  const preco = formatBRL(toCents(item.preco));
  const direto = ehDireto(item, categoriaId);
  const indisponivel = !item.available;

  return (
    <li className={`relative ${indisponivel ? 'opacity-50' : ''}`}>
      <button
        type="button"
        onClick={aoAbrir}
        disabled={indisponivel}
        aria-label={`${item.nome}, ${preco}`}
        className="group flex h-full w-full flex-col overflow-hidden rounded-[22px] bg-cartao text-left shadow-[0_0_0_1px_var(--color-borda),0_14px_28px_-22px_rgba(0,0,0,0.45)] transition-transform duration-150 ease-out active:scale-[0.985]"
      >
        <FotoProduto
          src={fotoDoItem(item.id, item.imageUrl)}
          alt=""
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
          className="aspect-[4/3] w-full"
          icone={iconeDaCategoria(categoriaId)}
        />
        <span className="flex flex-1 flex-col px-4 pb-4 pt-3">
          <span className="line-clamp-2 text-[16px] font-extrabold leading-tight tracking-[-0.01em] text-texto">{item.nome}</span>
          {item.descricao && <span className="mt-1 line-clamp-2 text-[13px] leading-snug text-texto-2">{item.descricao}</span>}
          <span className="mt-auto flex min-h-11 items-center gap-2 pr-12 pt-3.5">
            <span className="text-[17px] font-extrabold tabular-nums text-texto">
              {precoVaria(item, categoriaId) && <span className="text-[12px] font-medium text-texto-2">a partir de </span>}
              {preco}
            </span>
            {ehAlcoolico(item) && <Badge>+18</Badge>}
          </span>
        </span>
      </button>

      {!indisponivel && (
        <button
          type="button"
          onClick={(e) => (direto ? aoAdicionarDireto(e.currentTarget) : aoAbrir())}
          aria-label={direto ? `Adicionar ${item.nome} ao pedido` : `Escolher opções de ${item.nome}`}
          className="absolute bottom-3.5 right-3.5 grid size-11 place-items-center rounded-full bg-fogo text-carvao shadow-[0_8px_18px_-8px_rgba(255,106,0,0.9)] transition-transform duration-150 active:scale-90"
        >
          <Plus className="size-5" strokeWidth={2.75} aria-hidden />
        </button>
      )}

      {noPedido > 0 && (
        <span className="pointer-events-none absolute right-3 top-3 grid h-8 min-w-8 place-items-center rounded-full bg-carvao px-2 text-[14px] font-extrabold tabular-nums text-white ring-2 ring-white">
          {noPedido}
        </span>
      )}
    </li>
  );
}
