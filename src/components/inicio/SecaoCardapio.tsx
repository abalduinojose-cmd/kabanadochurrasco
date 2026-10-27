import { CartaoPrato } from './CartaoPrato';
import { SeloBrasa } from './SeloBrasa';
import { LinhaProduto } from './LinhaProduto';
import { Vitrine } from './Vitrine';
import type { SecaoMontada } from '@/lib/cardapio';

/**
 * Uma seção do cardápio (Lanches, Espetinhos, Bebidas...): o selo da chama
 * à frente do título grande, a contagem numa pílula e, dentro, cada categoria
 * com o seu subtítulo. Pratos em linhas
 * (ou em cartões grandes, quando a categoria pede: os Burgers especiais);
 * bebidas e doces em prateleiras de produto.
 */
export function SecaoCardapio({ secao }: { secao: SecaoMontada }) {
  const varias = secao.blocos.length > 1;

  return (
    <section id={secao.id} aria-labelledby={`titulo-${secao.id}`} className="scroll-mt-[112px] pt-10">
      <header className="flex items-center gap-2.5 px-4">
        <SeloBrasa />
        <h2 id={`titulo-${secao.id}`} className="min-w-0 flex-1 text-[23px] font-extrabold leading-tight tracking-[-0.025em] text-texto">
          {secao.nome}
        </h2>
        <span className="shrink-0 rounded-full bg-fundo-2 px-2.5 py-1 text-[12px] font-bold tabular-nums text-texto-2">
          {secao.total} {secao.total === 1 ? 'item' : 'itens'}
        </span>
      </header>

      {secao.formato === 'vitrine'
        ? secao.blocos.map((b) => <Vitrine key={b.categoria.id} titulo={b.titulo} categoriaId={b.categoria.id} itens={b.categoria.items} />)
        : secao.blocos.map((b) => (
            <div key={b.categoria.id} id={b.categoria.id} className="scroll-mt-[112px] px-4 pt-4">
              {varias && (
                <h3 className="flex items-center gap-2 pb-1 text-[13px] font-bold uppercase tracking-[0.06em] text-fogo-texto">
                  {b.titulo}
                  <span aria-hidden className="h-px flex-1 bg-divisor" />
                </h3>
              )}
              {b.categoria.descricao && <p className="text-[13px] text-texto-2">{b.categoria.descricao}</p>}
              {b.cartoes ? (
                <ul className="mt-2 grid grid-cols-2 gap-3 pb-1 sm:grid-cols-3">
                  {b.categoria.items.map((item) => (
                    <CartaoPrato key={item.id} item={item} categoriaId={b.categoria.id} />
                  ))}
                </ul>
              ) : (
                <ul className="divide-y divide-divisor">
                  {b.categoria.items.map((item) => (
                    <LinhaProduto key={item.id} item={item} categoriaId={b.categoria.id} />
                  ))}
                </ul>
              )}
            </div>
          ))}
    </section>
  );
}
