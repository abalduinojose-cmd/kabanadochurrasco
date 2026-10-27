import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { formatBRL } from '@/lib/money';
import type { SecaoMontada } from '@/lib/cardapio';

/**
 * "O que vai pedir hoje?": faixa de retângulos para arrastar para o lado.
 * Cada seção num cartão de foto deitado e grande, com a foto mais forte da
 * seção (`foto` em `data/secoes.ts`), o nome, o "a partir de" real do cardápio
 * e a seta da marca. O véu escuro fica só no pé do cartão, para a foto
 * aparecer inteira. Encaixa a cada cartão ao soltar e deixa o próximo
 * aparecendo na borda; um toque leva à seção e, quando a faixa sai da tela,
 * a barra fixa assume.
 */

const NA_FAIXA = ['lanches', 'espetinhos', 'tabuas', 'sobremesas', 'doces'] as const;

export function AtalhosCardapio({ secoes }: { secoes: readonly SecaoMontada[] }) {
  const lista = NA_FAIXA.map((id) => secoes.find((s) => s.id === id && s.foto)).filter((s): s is SecaoMontada => s !== undefined);
  if (lista.length === 0) return null;

  return (
    <nav id="atalhos" aria-labelledby="titulo-atalhos" className="mx-auto max-w-2xl pt-6">
      <div className="px-4">
        <h2 id="titulo-atalhos" className="text-[21px] font-extrabold leading-tight tracking-[-0.02em] text-texto">
          O que vai pedir hoje?
        </h2>
        <p className="mt-0.5 text-[13px] text-texto-2">Arraste para o lado e toque numa seção</p>
      </div>

      <ul className="trilho mt-3.5 pb-3 pr-4">
        {lista.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="group relative block h-[176px] w-[264px] overflow-hidden rounded-[24px] bg-carvao text-white shadow-[0_14px_30px_-18px_rgba(0,0,0,0.65)] outline-offset-2 transition-transform duration-150 ease-out active:scale-[0.97]"
            >
              <Image
                src={s.foto}
                alt=""
                fill
                priority={i < 2}
                sizes="264px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
              />
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
              <span aria-hidden className="absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/10" />

              <span className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4">
                <span className="min-w-0 flex-1">
                  <span className="block text-[20px] font-extrabold leading-[1.05] tracking-[-0.025em] [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
                    {s.rotulo ?? s.nome}
                  </span>
                  {s.aPartirDe !== null && (
                    <span className="mt-1.5 block text-[12.5px] font-semibold tabular-nums text-white/85">a partir de {formatBRL(s.aPartirDe)}</span>
                  )}
                </span>
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-fogo text-carvao shadow-[0_8px_18px_-8px_rgba(255,106,0,0.9)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                >
                  <ArrowUpRight className="size-5" strokeWidth={2.5} />
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
