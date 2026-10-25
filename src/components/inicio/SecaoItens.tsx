import { LinhaProduto } from './LinhaProduto';
import type { MenuCategoria } from '@/types/menu';

/** Uma categoria do cardápio: título e as linhas de produto. */
export function SecaoItens({ categoria }: { categoria: MenuCategoria }) {
  return (
    <section id={categoria.id} className="scroll-mt-[104px] px-4 pt-6">
      <h2 className="text-secao font-extrabold tracking-[-0.01em]">{categoria.nome}</h2>
      {categoria.descricao && <p className="mt-1 text-[13px] text-texto-2">{categoria.descricao}</p>}
      <ul className="mt-1">
        {categoria.items.map((item) => (
          <LinhaProduto key={item.id} item={item} categoriaId={categoria.id} />
        ))}
      </ul>
    </section>
  );
}
