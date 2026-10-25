import { CartaoProduto } from './CartaoProduto';
import { destaquesDoCardapio } from '@/lib/cardapio';

/** O carrossel "Destaques": os pratos com foto (bebida e doce não entram). */
export function Destaques() {
  const itens = destaquesDoCardapio();
  if (itens.length === 0) return null;

  return (
    <section id="destaques" aria-labelledby="titulo-destaques" className="scroll-mt-[118px] pt-7">
      <h2 id="titulo-destaques" className="px-4 text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-texto">
        Destaques
      </h2>
      <ul className="trilho mt-3 pb-1">
        {itens.map(({ item, categoriaId }, i) => (
          <CartaoProduto key={item.id} item={item} categoriaId={categoriaId} prioridade={i === 0} />
        ))}
      </ul>
    </section>
  );
}
