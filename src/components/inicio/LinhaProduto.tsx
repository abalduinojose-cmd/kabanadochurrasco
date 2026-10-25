import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { BotaoMais } from './BotaoMais';
import { FotoProduto } from './FotoProduto';
import { fotoDoItem } from '@/data/fotos';
import { formatBRL, toCents } from '@/lib/money';
import { precoVaria } from '@/lib/opcoes';
import { iconeDaCategoria } from '@/lib/icones-categoria';
import type { MenuItem } from '@/types/menu';

/**
 * A linha de prato: nome, descrição em duas linhas, preço em negrito e o
 * quadro de 96px à direita (a foto, ou o ícone da seção quando não há foto),
 * com o [+] no canto. O link cobre a linha inteira (abre a página do item); o
 * [+] fica por cima dele. Indisponível fica apagado.
 */
export function LinhaProduto({ item, categoriaId }: { item: MenuItem; categoriaId: string }) {
  const indisponivel = !item.available;
  const foto = fotoDoItem(item.id, item.imageUrl);
  const preco = formatBRL(toCents(item.preco));
  const varia = precoVaria(item, categoriaId);

  return (
    <li className={`relative flex min-h-[112px] items-center gap-4 py-3.5 ${indisponivel ? 'opacity-50' : ''}`}>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold leading-tight text-texto">{item.nome}</p>
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

      <FotoProduto src={foto} alt="" sizes="96px" className="size-24 rounded-[18px]" respiro="p-2" icone={iconeDaCategoria(categoriaId)} />

      {!indisponivel && (
        <>
          <Link href={`/item?id=${encodeURIComponent(item.id)}`} aria-label={`${item.nome}, ${preco}`} className="absolute inset-0" />
          <BotaoMais itemId={item.id} tamanho="sm" className="absolute bottom-[18px] right-1.5" />
        </>
      )}
    </li>
  );
}
