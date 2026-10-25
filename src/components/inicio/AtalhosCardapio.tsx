import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { SecaoMontada } from '@/lib/cardapio';

/**
 * "O que vai pedir hoje?": os atalhos das seções e os banners antigos num
 * bloco só, em bento (cartões de foto de tamanhos diferentes, como a skill
 * ui-ux-pro-max indica para vitrines organizadas). Cada cartão tem a foto da
 * seção, o nome, uma frase com fatos do cardápio, a contagem e a seta; um toque
 * leva à seção. Lanches abre grande; as bebidas em faixa larga; os três menores
 * fecham embaixo. Quando o bloco sai da tela, a barra fixa com as abas assume.
 */

type Tamanho = 'alto' | 'medio' | 'largo' | 'pequeno';

const ORDEM_DESTAQUE = ['lanches', 'espetinhos', 'tabuas', 'bebidas'] as const;

function Cartao({ s, tamanho, prioridade = false }: { s: SecaoMontada; tamanho: Tamanho; prioridade?: boolean }) {
  const grande = tamanho === 'alto' || tamanho === 'largo';
  const sizes = tamanho === 'largo' ? '(max-width: 672px) 92vw, 640px' : tamanho === 'pequeno' ? '(max-width: 672px) 30vw, 200px' : '(max-width: 672px) 46vw, 320px';

  return (
    <a
      href={`#${s.id}`}
      className="group relative flex h-full overflow-hidden rounded-[22px] bg-carvao text-white shadow-[0_10px_24px_-14px_rgba(0,0,0,0.55)] outline-offset-2 transition-transform duration-150 ease-out active:scale-[0.98]"
    >
      <Image src={s.foto} alt="" fill priority={prioridade} sizes={sizes} className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/0" />

      {tamanho !== 'pequeno' && (
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold tabular-nums text-texto backdrop-blur">
          {s.total} {s.total === 1 ? 'item' : 'itens'}
        </span>
      )}

      <span className={`relative mt-auto flex w-full items-end gap-2 ${tamanho === 'pequeno' ? 'p-2.5' : 'p-3.5'}`}>
        <span className="min-w-0 flex-1">
          <span
            className={`block font-extrabold leading-[1.05] tracking-[-0.02em] ${
              tamanho === 'alto' ? 'text-[24px]' : tamanho === 'largo' ? 'text-[20px]' : tamanho === 'medio' ? 'text-[17px]' : 'text-[13px]'
            }`}
          >
            {tamanho === 'pequeno' ? (s.rotulo ?? s.nome) : s.nome}
          </span>
          {grande && s.chamada && <span className="mt-1 block text-[12.5px] leading-snug text-white/80">{s.chamada}</span>}
        </span>
        {tamanho !== 'pequeno' && (
          <span
            aria-hidden
            className={`grid shrink-0 place-items-center rounded-full bg-fogo text-carvao transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${grande ? 'size-9' : 'size-7'}`}
          >
            <ArrowUpRight className={grande ? 'size-5' : 'size-4'} strokeWidth={2.5} />
          </span>
        )}
      </span>
    </a>
  );
}

export function AtalhosCardapio({ secoes }: { secoes: readonly SecaoMontada[] }) {
  const comFoto = secoes.filter((s) => s.foto);
  if (comFoto.length === 0) return null;
  const achar = (id: string) => comFoto.find((s) => s.id === id);
  const [lanches, espetinhos, tabuas, bebidas] = ORDEM_DESTAQUE.map(achar);
  const usados = new Set<string>(ORDEM_DESTAQUE);
  const menores = comFoto.filter((s) => !usados.has(s.id));
  const total = comFoto.reduce((t, s) => t + s.total, 0);

  return (
    <nav id="atalhos" aria-labelledby="titulo-atalhos" className="mx-auto max-w-2xl px-4 pt-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="titulo-atalhos" className="text-[20px] font-extrabold tracking-[-0.02em] text-texto">
          O que vai pedir hoje?
        </h2>
        <span className="shrink-0 text-[13px] font-medium text-texto-3">{total} itens</span>
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-2.5 [grid-auto-rows:112px]">
        {lanches && (
          <li className="row-span-2">
            <Cartao s={lanches} tamanho="alto" prioridade />
          </li>
        )}
        {espetinhos && (
          <li>
            <Cartao s={espetinhos} tamanho="medio" />
          </li>
        )}
        {tabuas && (
          <li>
            <Cartao s={tabuas} tamanho="medio" />
          </li>
        )}
        {bebidas && (
          <li className="col-span-2">
            <Cartao s={bebidas} tamanho="largo" />
          </li>
        )}
        {menores.length > 0 && (
          <li className="col-span-2 h-[96px]">
            <ul className="grid h-full gap-2.5" style={{ gridTemplateColumns: `repeat(${menores.length}, minmax(0, 1fr))` }}>
              {menores.map((s) => (
                <li key={s.id}>
                  <Cartao s={s} tamanho="pequeno" />
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>
    </nav>
  );
}
