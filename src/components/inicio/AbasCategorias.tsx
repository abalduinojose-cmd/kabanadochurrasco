'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Abas de categoria com sublinhado, grudadas no topo ao rolar (como no iFood),
 * com scroll-spy por IntersectionObserver e a aba ativa centralizada.
 */

type Props = { secoes: readonly { id: string; nome: string }[] };

const ALTURA = 56 + 48; // cabeçalho compacto + abas

export function AbasCategorias({ secoes }: Props) {
  const [ativa, setAtiva] = useState(secoes[0]?.id ?? '');
  const trilho = useRef<HTMLDivElement>(null);

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
        else if (window.scrollY < 200 && secoes[0]) setAtiva(secoes[0].id);
      },
      { rootMargin: `-${ALTURA + 8}px 0px -60% 0px`, threshold: 0 },
    );
    for (const a of alvos) obs.observe(a);
    return () => obs.disconnect();
  }, [secoes]);

  useEffect(() => {
    const caixa = trilho.current;
    const alvo = caixa?.querySelector<HTMLElement>(`[data-sec="${ativa}"]`);
    if (!caixa || !alvo) return;
    caixa.scrollTo({ left: Math.max(0, alvo.offsetLeft - caixa.clientWidth / 2 + alvo.clientWidth / 2), behavior: 'smooth' });
  }, [ativa]);

  return (
    <nav aria-label="Categorias" className="sticky top-14 z-20 border-b border-divisor bg-cartao">
      <div ref={trilho} className="sem-barra mx-auto flex max-w-2xl gap-1 overflow-x-auto px-2">
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
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`min-h-12 shrink-0 whitespace-nowrap border-b-2 px-2.5 pb-2.5 pt-3.5 text-[14px] font-semibold transition-colors ${
                on ? 'border-fogo-texto text-fogo-texto' : 'border-transparent text-texto-2 hover:text-texto'
              }`}
            >
              {s.nome}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
