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
 * Cartão grande de prato, dois por linha (os Burgers especiais): foto 4:3 com
 * o [+] no canto, nome, o que vai no pão em duas linhas e o preço. Sem foto,
 * o quadro quente da marca com o ícone da seção. O link cobre o cartão.
 */
export function CartaoPrato({ item, categoriaId }: { item: MenuItem; categoriaId: string }) {
  const preco = formatBRL(toCents(item.preco));
  const indisponivel = !item.available;

  return (
    <li className={`relative flex flex-col overflow-hidden rounded-[20px] bg-cartao shadow-[0_0_0_1px_var(--color-borda),0_10px_24px_-18px_rgba(0,0,0,0.35)] ${indisponivel ? 'opacity-50' : ''}`}>
      <div className="relative">
        <FotoProduto
          src={fotoDoItem(item.id, item.imageUrl)}
          alt={item.nome}
          sizes="(max-width: 672px) 46vw, 300px"
          className="aspect-[4/3] w-full"
          icone={iconeDaCategoria(categoriaId)}
        />
        {!indisponivel && <BotaoMais itemId={item.id} tamanho="sm" className="absolute bottom-2 right-2" />}
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        <p className="text-[14.5px] font-extrabold leading-tight tracking-[-0.01em] text-texto">{item.nome}</p>
        {item.descricao && <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-texto-2">{item.descricao}</p>}
        <p className="mt-auto pt-2 text-[15px] font-extrabold tabular-nums text-texto">
          {precoVaria(item, categoriaId) && <span className="text-legenda font-medium text-texto-2">a partir de </span>}
          {preco}
        </p>
        {indisponivel && <Badge className="mt-1 self-start">Indisponível</Badge>}
      </div>
      {!indisponivel && <Link href={`/item?id=${encodeURIComponent(item.id)}`} aria-label={`${item.nome}, ${preco}`} className="absolute inset-0 rounded-[20px]" />}
    </li>
  );
}
