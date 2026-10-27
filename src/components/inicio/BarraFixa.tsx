'use client';

import { useEffect, useRef, useState } from 'react';
import { BotaoCompartilhar } from './BotaoCompartilhar';
import { BotaoBusca } from '@/components/busca/BotaoBusca';
import { LogoKabana } from '@/components/layout/LogoKabana';
import { LOJA } from '@/data/loja';
import { querMovimento } from '@/lib/motion/reduce';
import { statusDaLoja } from '@/lib/store-hours';
import { useAgora } from '@/lib/use-agora';

/**
 * A barra fixa do topo, no carvão da fachada, que aparece quando os atalhos do
 * cardápio saem da tela.
 *
 * - Em cima: o logo, o nome e o status ao vivo ("Aberto até 23:00" em verde,
 *   ou "Fechado, abre hoje às 17:00"), busca e compartilhar.
 * - Embaixo: as seções, com uma cápsula de vidro que DESLIZA até a seção da
 *   vez (scroll-spy) e centraliza o trilho nela; as bordas esmaecem para dizer
 *   que dá para arrastar. Um toque leva à seção.
 * - No pé, um fio laranja que enche conforme a página rola (scroll-driven, só
 *   CSS: `.progresso-rolagem` em globals.css; sem suporte, não aparece).
 *
 * A cápsula é posicionada direto no estilo (ref), sem estado: mede o botão
 * ativo e anda com transform + largura.
 */

type Props = { secoes: readonly { id: string; nome: string }[] };

const ALTURA = 52 + 48; // linha do logo + linha das abas

export function BarraFixa({ secoes }: Props) {
  const [visivel, setVisivel] = useState(false);
  const [ativa, setAtiva] = useState(secoes[0]?.id ?? '');
  const trilho = useRef<HTMLDivElement>(null);
  const capsula = useRef<HTMLSpanElement>(null);
  const agora = useAgora();
  const status = agora ? statusDaLoja(agora) : null;

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

  // A cápsula vai até a seção da vez e o trilho centraliza nela. Remede quando
  // a barra aparece e quando a janela muda (a fonte pode chegar depois).
  useEffect(() => {
    const caixa = trilho.current;
    const pilula = capsula.current;
    if (!caixa || !pilula) return;
    const posicionar = () => {
      const alvo = caixa.querySelector<HTMLElement>(`[data-sec="${ativa}"]`);
      if (!alvo) return;
      pilula.style.width = `${alvo.offsetWidth}px`;
      pilula.style.transform = `translateX(${alvo.offsetLeft}px)`;
      pilula.style.opacity = '1';
    };
    posicionar();
    const alvo = caixa.querySelector<HTMLElement>(`[data-sec="${ativa}"]`);
    if (alvo) {
      caixa.scrollTo({ left: Math.max(0, alvo.offsetLeft - caixa.clientWidth / 2 + alvo.offsetWidth / 2), behavior: querMovimento() ? 'smooth' : 'auto' });
    }
    window.addEventListener('resize', posicionar);
    return () => window.removeEventListener('resize', posicionar);
  }, [ativa, visivel]);

  return (
    <header
      inert={!visivel}
      className={`fixed inset-x-0 top-0 z-30 bg-brasa/90 text-white shadow-[0_12px_28px_-16px_rgba(0,0,0,0.7)] backdrop-blur-xl backdrop-saturate-150 transition-[opacity,transform] duration-200 ease-out ${
        visivel ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto flex h-[52px] max-w-2xl items-center gap-2.5 pl-3 pr-1.5">
        <LogoKabana sizes="40px" alt="" className="w-10 shrink-0" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[15px] font-extrabold tracking-[-0.01em]">{LOJA.nome}</p>
          {status ? (
            <p className={`mt-0.5 flex items-center gap-1.5 truncate text-[11.5px] font-semibold ${status.aberta ? 'text-[#6fe0a0]' : 'text-white/55'}`}>
              <i aria-hidden className={`size-1.5 shrink-0 rounded-full ${status.aberta ? 'bg-[#6fe0a0]' : 'bg-white/40'}`} />
              {status.texto}
            </p>
          ) : (
            <span aria-hidden className="mt-1 block h-3 w-28 rounded-full bg-white/10" />
          )}
        </div>
        <BotaoBusca className="grid size-10 min-h-10 place-items-center rounded-full bg-white/[0.07] text-white ring-1 ring-inset ring-white/10 hover:bg-white/[0.12]" />
        <BotaoCompartilhar className="grid size-10 min-h-10 place-items-center rounded-full bg-white/[0.07] text-white ring-1 ring-inset ring-white/10 hover:bg-white/[0.12]" />
      </div>

      <nav aria-label="Seções do cardápio">
        <div
          ref={trilho}
          className="sem-barra relative mx-auto flex h-12 max-w-2xl items-center gap-0.5 overflow-x-auto px-2 [mask-image:linear-gradient(to_right,transparent,#000_14px,#000_calc(100%-28px),transparent)]"
        >
          <span
            ref={capsula}
            aria-hidden
            className="pointer-events-none absolute left-0 top-1.5 h-9 rounded-full bg-white/[0.12] opacity-0 ring-1 ring-inset ring-white/15 transition-[transform,width,opacity] duration-300 ease-[var(--ease-brasa)]"
          />
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
                className={`relative inline-flex h-9 min-h-9 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 text-[13.5px] font-bold transition-colors duration-200 ${
                  on ? 'text-white' : 'text-white/55 hover:text-white/85'
                }`}
              >
                {s.nome}
              </button>
            );
          })}
        </div>
      </nav>

      <span aria-hidden className="progresso-rolagem pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left bg-fogo" />
    </header>
  );
}
