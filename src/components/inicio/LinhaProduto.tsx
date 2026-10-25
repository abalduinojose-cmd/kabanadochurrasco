import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { BrandMark } from '@/components/layout/BrandMark';
import { BotaoMais } from './BotaoMais';
import { fotoDoItem } from '@/data/fotos';
import { formatBRL, toCents } from '@/lib/money';
import { precoVaria } from '@/lib/opcoes';
import type { MenuItem } from '@/types/menu';

/**
 * A linha de produto do iFood: nome, descrição em duas linhas, preço em
 * negrito, miniatura de 90px à direita quando há foto e o [+] de adicionar
 * com um toque. O link cobre a linha inteira (abre a página do item); o [+]
 * fica por cima dele. Indisponível fica apagado, sem link e sem [+].
 *
 * Em desenvolvimento, um `destaque` sem foto mostra o quadro da miniatura com
 * a marca, para o layout ser revisado; em produção só entra foto real.
 */
export function LinhaProduto({ item, categoriaId }: { item: MenuItem; categoriaId: string }) {
  const indisponivel = !item.available;
  const foto = fotoDoItem(item.id, item.imageUrl);
  const slotDemo = !foto && item.destaque === true && process.env.NODE_ENV !== 'production';
  const temMiniatura = Boolean(foto) || slotDemo;
  const preco = formatBRL(toCents(item.preco));
  const varia = precoVaria(item, categoriaId);

  return (
    <li className={`relative flex gap-3.5 border-b border-divisor py-4 last:border-b-0 ${indisponivel ? 'opacity-50' : ''}`}>
      <div className={`min-w-0 flex-1 ${temMiniatura || indisponivel ? '' : 'pr-12'}`}>
        <p className="text-item font-semibold leading-tight text-texto">{item.nome}</p>
        {item.descricao && <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-texto-2">{item.descricao}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-extrabold tabular-nums text-texto">
            {varia && <span className="text-legenda font-medium text-texto-2">a partir de </span>}
            {preco}
          </span>
          {indisponivel && <Badge>Indisponível</Badge>}
          {item.badges?.includes('alcoolico') && <Badge>+18</Badge>}
          {item.badges?.includes('mais-pedido') && <Badge tom="fogo">Mais pedido</Badge>}
          {item.badges?.includes('novidade') && <Badge tom="verde">Novidade</Badge>}
        </div>
      </div>

      {temMiniatura && (
        <div className="relative size-[90px] shrink-0 overflow-hidden rounded-[10px] bg-foto">
          {foto ? (
            <Image src={foto} alt="" fill sizes="90px" className="object-cover" />
          ) : (
            <div aria-hidden className="grid h-full place-items-center">
              <BrandMark className="w-3/5 opacity-30" />
            </div>
          )}
        </div>
      )}

      {!indisponivel && (
        <>
          <Link href={`/item?id=${encodeURIComponent(item.id)}`} aria-label={`${item.nome}, ${preco}`} className="absolute inset-0" />
          <BotaoMais
            itemId={item.id}
            tamanho="sm"
            className={temMiniatura ? 'absolute bottom-[22px] right-1.5' : 'absolute right-0 top-1/2 -translate-y-1/2'}
          />
        </>
      )}
    </li>
  );
}
