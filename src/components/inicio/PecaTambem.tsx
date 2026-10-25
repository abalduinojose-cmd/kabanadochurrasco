import { CartaoProduto } from './CartaoProduto';
import { sugestoesPara } from '@/lib/sugestoes';

/**
 * Trilho de sugestões ("Peça também" na página do item, "Complete seu
 * pedido" na sacola): itens de categorias que ainda não estão no pedido,
 * cada um com o [+] de adicionar na hora.
 */

type Props = { titulo: string; categorias: readonly string[]; excluir: readonly string[]; className?: string };

export function PecaTambem({ titulo, categorias, excluir, className = '' }: Props) {
  const sugestoes = sugestoesPara(categorias, excluir);
  if (sugestoes.length === 0) return null;

  return (
    <section className={className} aria-label={titulo}>
      <h2 className="px-4 text-[15px] font-bold text-texto">{titulo}</h2>
      <ul className="trilho mt-3 pb-1">
        {sugestoes.map(({ item, categoriaId }) => (
          <CartaoProduto key={item.id} item={item} categoriaId={categoriaId} />
        ))}
      </ul>
    </section>
  );
}
