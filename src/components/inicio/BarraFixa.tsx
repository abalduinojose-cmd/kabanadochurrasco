'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { BotaoCompartilhar } from './BotaoCompartilhar';
import { LOJA } from '@/data/loja';
import { querMovimento } from '@/lib/motion/reduce';

/**
 * A barra fixa do topo, que aparece quando os atalhos do cardápio saem da
 * tela: nome da loja, busca, compartilhar e as seções em pílulas, com a seção
 * da vez acesa (scroll-spy) e centralizada. Um toque leva à seção.
 */

type Props = { secoes: readonly { id: string; nome: string }[] };

const ALTURA = 56 + 52; // linha do nome + linha das pílulas

export function BarraFixa({ secoes }: Props) {
  const [visivel, setVisivel] = useState(false);
  const [ativa, setAtiva] = useState(secoes[0]?.id ?? '');
  const trilho = useRef<HTMLDivElement>(null);

  // Aparece quando os atalhos (ou a capa, se não houver atalhos) somem atrás dela.
  useEffect(() => {
    const alvo = document.getElementById('atalhos') ?? document.getElementById('capa');
    if (!alvo) return;
    const obs = new IntersectionObserver(([e]) => setVisivel(!(e?.isIntersecting ?? true)), {
      threshold: 0,
      rootMargin: `-${ALTURA}px 0px 0px 0px`,
    });
    obs.observe(alvo);
    return () => obs.disconnect();
  }, []);

  // Scroll-spy: a primeira seção cujo topo passou da barra.
  useEffect(() => {
    const alvos = secoes.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => el !== null);
    if (alvos.length === 0) return;
    const visiveis = new Set<string>();
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) visiveis.add(e.target.id);
          else visiveis.delete(e.target.id);
        }
        const primeira = secoes.find((s) => visiveis.has(s.id));
        if (primeira) setAtiva(primeira.id);
      },
      { rootMargin: `-${ALTURA + 8}px 0px -55% 0px`, threshold: 0 },
    );
    for (const a of alvos) obs.observe(a);
    return () => obs.disconnect();
  }, [secoes]);

  useEffect(() => {
    const caixa = trilho.current;
    const alvo = caixa?.querySelector<HTMLElement>(`[data-sec="${ativa}"]`);
    if (!caixa || !alvo) return;
    caixa.scrollTo({ left: Math.max(0, alvo.offsetLeft - caixa.clientWidth / 2 + alvo.clientWidth / 2), behavior: querMovimento() ? 'smooth' : 'auto' });
  }, [ativa]);

  return (
    <header
      inert={!visivel}
      className={`fixed inset-x-0 top-0 z-30 border-b border-divisor bg-cartao/95 backdrop-blur-md transition-[opacity,transform] duration-200 ease-out ${
        visivel ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-1 pl-4 pr-2">
        <p className="min-w-0 flex-1 truncate text-[17px] font-extrabold tracking-[-0.01em] text-texto">{LOJA.nome}</p>
        <Link href="/busca" aria-label="Buscar no cardápio" className="grid size-11 place-items-center rounded-full text-texto hover:bg-fundo-2">
          <Search className="size-5" aria-hidden />
        </Link>
        <BotaoCompartilhar className="grid size-11 place-items-center rounded-full text-texto hover:bg-fundo-2" />
      </div>
      <nav aria-label="Seções do cardápio">
        <div ref={trilho} className="sem-barra mx-auto flex h-[52px] max-w-2xl items-start gap-2 overflow-x-auto px-4">
          {secoes.map((s) => {
            const on = ativa === s.id;
            return (
              <button
                key={s.id}
                type="button"
                data-sec={s.id}
                aria-current={on ? 'true' : undefined}
                onClick={() => {
                  setAtiva(s.id);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: querMovimento() ? 'smooth' : 'auto', block: 'start' });
                }}
                className={`inline-flex h-9 min-h-9 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-[13.5px] font-bold transition-colors ${
                  on ? 'bg-carvao text-white' : 'bg-fundo-2 text-texto-2 hover:text-texto'
                }`}
              >
                {s.nome}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
