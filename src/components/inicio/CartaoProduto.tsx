import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { FotoProduto } from './FotoProduto';
import { BotaoMais } from './BotaoMais';
import { fotoDoItem } from '@/data/fotos';
import { formatBRL, toCents } from '@/lib/money';
import { precoVaria } from '@/lib/opcoes';
import type { MenuItem } from '@/types/menu';

/**
 * Cartão de produto, sem moldura: a foto com cantos de 16px, o [+] no canto da
 * foto, o preço em destaque e o nome em duas linhas. O link cobre o cartão.
 *
 * - `trilho`: 152px, nos carrosséis (Destaques, Favoritos, Complete seu pedido).
 * - `vitrine`: 128px, nas prateleiras de bebidas e doces.
 * - `grade`: ocupa a célula, quando a prateleira abre em "Ver todos".
 */

type Props = {
  item: MenuItem;
  categoriaId: string;
  prioridade?: boolean;
  variante?: 'trilho' | 'vitrine' | 'grade';
};

const LARGURA = { trilho: 'w-[152px]', vitrine: 'w-[128px]', grade: 'w-full' } as const;
const TAMANHO = { trilho: '152px', vitrine: '128px', grade: '(max-width: 672px) 31vw, 200px' } as const;

export function CartaoProduto({ item, categoriaId, prioridade = false, variante = 'trilho' }: Props) {
  const preco = formatBRL(toCents(item.preco));
  const indisponivel = !item.available;

  return (
    <li className={`relative ${LARGURA[variante]} ${indisponivel ? 'opacity-50' : ''}`}>
      <div className="relative">
        <FotoProduto
          src={fotoDoItem(item.id, item.imageUrl)}
          alt={item.nome}
          sizes={TAMANHO[variante]}
          prioridade={prioridade}
          className="aspect-square rounded-[16px]"
        />
        {item.badges?.includes('mais-pedido') && (
          <Badge tom="fogo" className="pointer-events-none absolute left-2 top-2 z-10">
            Mais pedido
          </Badge>
        )}
        {!indisponivel && <BotaoMais itemId={item.id} tamanho="sm" className="absolute bottom-1.5 right-1.5" />}
      </div>
      <p className="mt-2 text-[15px] font-extrabold tabular-nums leading-none text-texto">
        {precoVaria(item, categoriaId) && <span className="text-legenda font-medium text-texto-2">a partir de </span>}
        {preco}
      </p>
      <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-texto-2">{item.nome}</p>
      {indisponivel ? (
        <Badge className="mt-1">Indisponível</Badge>
      ) : (
        <Link href={`/item?id=${encodeURIComponent(item.id)}`} aria-label={`${item.nome}, ${preco}`} className="absolute inset-0 rounded-[16px]" />
      )}
    </li>
  );
}
