import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { FotoProduto } from './FotoProduto';
import { BotaoMais } from './BotaoMais';
import { fotoDoItem } from '@/data/fotos';
import { formatBRL, toCents } from '@/lib/money';
import { precoVaria } from '@/lib/opcoes';
import type { MenuItem } from '@/types/menu';

/**
 * Card de produto dos trilhos (Destaques, Favoritos): foto quadrada, nome em
 * duas linhas, preço e o [+] sobre o canto da foto. O link cobre o card.
 */

type Props = { item: MenuItem; categoriaId: string; prioridade?: boolean };

export function CartaoProduto({ item, categoriaId, prioridade = false }: Props) {
  const preco = formatBRL(toCents(item.preco));
  return (
    <li className="relative w-[150px] overflow-hidden rounded-cartao border border-borda bg-cartao">
      <FotoProduto src={fotoDoItem(item.id, item.imageUrl)} alt={item.nome} sizes="150px" prioridade={prioridade} />
      <div className="px-2.5 pb-3 pt-2.5">
        <p className="line-clamp-2 h-[35px] text-[14px] font-semibold leading-tight text-texto">{item.nome}</p>
        <p className="mt-1.5 text-[15px] font-extrabold tabular-nums text-texto">
          {precoVaria(item, categoriaId) && <span className="text-legenda font-medium text-texto-2">a partir de </span>}
          {preco}
        </p>
      </div>
      {item.badges?.includes('mais-pedido') && (
        <Badge tom="fogo" className="pointer-events-none absolute left-2 top-2 z-10">
          Mais pedido
        </Badge>
      )}
      <Link href={`/item?id=${encodeURIComponent(item.id)}`} aria-label={`${item.nome}, ${preco}`} className="absolute inset-0 rounded-cartao" />
      <BotaoMais itemId={item.id} tamanho="sm" className="absolute right-2 top-[106px]" />
    </li>
  );
}
