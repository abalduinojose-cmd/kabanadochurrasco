import Image from 'next/image';
import Link from 'next/link';
import { BotaoMais } from './BotaoMais';
import { fotoDoItem } from '@/data/fotos';
import { destaquesDoCardapio, secaoDaCategoria } from '@/lib/cardapio';
import { formatBRL, toCents } from '@/lib/money';
import { precoVaria } from '@/lib/opcoes';
import type { MenuItem } from '@/types/menu';

/**
 * "Destaques": os pratos com foto (bebida e doce não entram) em cartões altos,
 * a foto inteira com o nome e o preço por cima, a seção em vidro no alto e o
 * [+] no canto. Trilho com encaixe; o primeiro carrega com prioridade.
 */

function CartaoDestaque({ item, categoriaId, prioridade }: { item: MenuItem; categoriaId: string; prioridade: boolean }) {
  const foto = fotoDoItem(item.id, item.imageUrl);
  const preco = formatBRL(toCents(item.preco));
  const secao = secaoDaCategoria(categoriaId);
  if (!foto) return null;

  return (
    <li className="relative isolate h-[264px] w-[212px] overflow-hidden rounded-[24px] bg-carvao text-white shadow-[0_18px_34px_-22px_rgba(0,0,0,0.75)]">
      <Image src={foto} alt={item.nome} fill priority={prioridade} sizes="212px" className="-z-10 object-cover" />
      <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/25 to-black/0" />
      {secao && (
        <span className="absolute left-2.5 top-2.5 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-inset ring-white/20 backdrop-blur-md">
          {secao}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-3.5 pr-14">
        <p className="line-clamp-2 text-[16px] font-extrabold leading-[1.15] tracking-[-0.01em]">{item.nome}</p>
        <p className="mt-1 text-[14px] font-bold tabular-nums text-white/90">
          {precoVaria(item, categoriaId) && <span className="text-[11.5px] font-medium text-white/70">a partir de </span>}
          {preco}
        </p>
      </div>
      <Link href={`/item?id=${encodeURIComponent(item.id)}`} aria-label={`${item.nome}, ${preco}`} className="absolute inset-0 rounded-[24px]" />
      <BotaoMais itemId={item.id} className="absolute bottom-3 right-3" />
    </li>
  );
}

export function Destaques() {
  const itens = destaquesDoCardapio();
  if (itens.length === 0) return null;

  return (
    <section id="destaques" aria-labelledby="titulo-destaques" className="scroll-mt-[118px] pt-8">
      <div className="flex items-end justify-between gap-3 px-4">
        <div>
          <h2 id="titulo-destaques" className="text-[21px] font-extrabold leading-tight tracking-[-0.02em] text-texto">
            Destaques
          </h2>
          <p className="mt-0.5 text-[13px] text-texto-2">Direto da brasa, do jeito que sai da cozinha</p>
        </div>
        <span className="shrink-0 pb-0.5 text-[13px] font-medium text-texto-3">{itens.length} pratos</span>
      </div>
      <ul className="trilho mt-3.5 pb-2">
        {itens.map(({ item, categoriaId }, i) => (
          <CartaoDestaque key={item.id} item={item} categoriaId={categoriaId} prioridade={i === 0} />
        ))}
      </ul>
    </section>
  );
}
