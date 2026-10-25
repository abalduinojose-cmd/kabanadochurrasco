import { CartaoProduto } from './CartaoProduto';
import { MENU } from '@/data/cardapio';
import { fotoDoItem } from '@/data/fotos';
import type { MenuItem } from '@/types/menu';

const ehDestaque = (i: MenuItem) => i.available && (i.destaque === true || Boolean(fotoDoItem(i.id, i.imageUrl)));

/** Itens de destaque com a categoria: lista pura, usada pela seção e pelas abas. */
export function destaques() {
  return MENU.flatMap((c) => c.items.filter(ehDestaque).map((item) => ({ item, categoriaId: c.id })));
}

/** O carrossel "Destaques" do iFood: cards de 150px com foto, nome, preço e [+]. */
export function Destaques() {
  const itens = destaques();
  if (itens.length === 0) return null;

  return (
    <section id="destaques" className="scroll-mt-[104px] pt-6">
      <h2 className="px-4 text-secao font-extrabold tracking-[-0.01em]">Destaques</h2>
      <ul className="trilho mt-3 pb-1">
        {itens.map(({ item, categoriaId }, i) => (
          <CartaoProduto key={item.id} item={item} categoriaId={categoriaId} prioridade={i === 0} />
        ))}
      </ul>
    </section>
  );
}
