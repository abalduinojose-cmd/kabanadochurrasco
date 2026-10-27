'use client';

import { useEffect, useRef, useState } from 'react';
import { BotaoCompartilhar } from './BotaoCompartilhar';
import { BotaoBusca } from '@/components/busca/BotaoBusca';
import { LogoKabana } from '@/components/layout/LogoKabana';
import { LOJA } from '@/data/loja';
import { querMovimento } from '@/lib/motion/reduce';

/**
 * A barra fixa do topo, no carvão da fachada, que aparece quando os atalhos do
 * cardápio saem da tela: o logo pequeno com o nome, busca, compartilhar e as
 * seções em abas de texto, com a da vez acesa e sublinhada em laranja
 * (scroll-spy) e centralizada. Um toque leva à seção.
 */

type Props = { secoes: readonly { id: string; nome: string }[] };

const ALTURA = 56 + 48; // linha do logo + linha das abas

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
      className={`fixed inset-x-0 top-0 z-30 bg-brasa/95 text-white shadow-[0_10px_24px_-14px_rgba(0,0,0,0.6)] backdrop-blur-md transition-[opacity,transform] duration-200 ease-out ${
        visivel ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-2.5 pl-3 pr-2">
        <LogoKabana sizes="46px" alt="" className="w-[46px] shrink-0" />
        <p className="min-w-0 flex-1 truncate text-[16px] font-extrabold tracking-[-0.01em]">{LOJA.nome}</p>
        <BotaoBusca className="grid size-11 place-items-center rounded-full text-white hover:bg-white/10" />
        <BotaoCompartilhar className="grid size-11 place-items-center rounded-full text-white hover:bg-white/10" />
      </div>
      <nav aria-label="Seções do cardápio" className="border-t border-white/[0.07]">
        <div ref={trilho} className="sem-barra mx-auto flex h-12 max-w-2xl items-stretch gap-1 overflow-x-auto px-2">
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
                className={`relative inline-flex shrink-0 items-center whitespace-nowrap px-3 text-[14px] font-bold transition-colors ${
                  on ? 'text-white' : 'text-white/55 hover:text-white/80'
                }`}
              >
                {s.nome}
                <span
                  aria-hidden
                  className={`absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-fogo transition-opacity duration-200 ${on ? 'opacity-100' : 'opacity-0'}`}
                />
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
