'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BrandMark } from '@/components/layout/BrandMark';
import { useToast } from '@/components/ui/Toast';
import { useEntrega } from '@/store/entrega';
import { querMovimento } from '@/lib/motion/reduce';
import { BANNERS, type Banner, type TomBanner } from '@/data/banners';

/**
 * Carrossel de banners, como o do topo do iFood: cards largos com encaixe,
 * pontos embaixo e avanço automático a cada 5 s até a pessoa tocar. Sem foto,
 * o banner usa a cor do tom e a marca como decoração.
 */

const TONS: Record<TomBanner, string> = {
  noite: 'bg-carvao text-fundo',
  fogo: 'bg-fogo text-carvao',
  claro: 'border border-borda bg-cartao text-texto',
};

const CTA: Record<TomBanner, string> = {
  noite: 'bg-fogo text-carvao',
  fogo: 'bg-carvao text-fundo',
  claro: 'bg-fogo text-carvao',
};

const INTERVALO_MS = 5000;

function Decoracao({ tom }: { tom: TomBanner }) {
  if (tom === 'noite') {
    return (
      <>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 55% 80% at 88% 100%, rgba(255,106,0,.5), transparent 70%)' }}
        />
        <BrandMark className="absolute -bottom-1 right-3 w-[120px]" />
      </>
    );
  }
  if (tom === 'fogo') {
    return <BrandMark comFogo={false} cor="rgba(11,11,11,0.16)" className="absolute -bottom-3 -right-6 w-[220px]" />;
  }
  return <BrandMark comFogo={false} cor="var(--color-fogo-suave)" className="absolute -bottom-3 -right-6 w-[220px]" />;
}

function Chamada({ banner }: { banner: Banner }) {
  const confirmar = useEntrega((s) => s.confirmar);
  const bairro = useEntrega((s) => s.bairro);
  const mostrar = useToast((s) => s.mostrar);
  const classes = `relative z-10 mt-3 inline-flex h-9 min-h-9 items-center rounded-botao px-3.5 text-[13px] font-bold ${CTA[banner.tom]}`;

  if (banner.acao) {
    const modo = banner.acao;
    return (
      <button
        type="button"
        className={classes}
        onClick={() => {
          confirmar({ modo, bairro });
          mostrar(modo === 'retirada' ? 'Retirada na loja selecionada' : 'Entrega selecionada');
        }}
      >
        {banner.cta}
      </button>
    );
  }
  return (
    <Link href={banner.href ?? '/'} className={classes}>
      {banner.cta}
    </Link>
  );
}

export function Banners() {
  const trilho = useRef<HTMLUListElement>(null);
  const [atual, setAtual] = useState(0);
  const pausado = useRef(false);

  useEffect(() => {
    const ul = trilho.current;
    if (!ul) return;
    const slides = Array.from(ul.children);
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) setAtual(slides.indexOf(e.target));
        }
      },
      { root: ul, threshold: 0.6 },
    );
    slides.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (BANNERS.length < 2) return;
    const t = window.setInterval(() => {
      const ul = trilho.current;
      if (!ul || pausado.current || document.hidden) return;
      const proximo = (atual + 1) % BANNERS.length;
      const alvo = ul.children[proximo] as HTMLElement | undefined;
      if (alvo) ul.scrollTo({ left: alvo.offsetLeft - 16, behavior: querMovimento() ? 'smooth' : 'auto' });
    }, INTERVALO_MS);
    return () => window.clearInterval(t);
  }, [atual]);

  if (BANNERS.length === 0) return null;

  return (
    <section aria-label="Destaques da loja" className="pt-4">
      <ul
        ref={trilho}
        className="trilho"
        onPointerDown={() => {
          pausado.current = true;
        }}
      >
        {BANNERS.map((b) => (
          <li
            key={b.id}
            className={`relative min-h-[136px] w-[86%] max-w-[420px] overflow-hidden rounded-cartao ${b.imagem ? 'bg-carvao text-white' : TONS[b.tom]}`}
          >
            {b.imagem ? (
              <>
                <Image src={b.imagem} alt="" fill sizes="(max-width: 672px) 86vw, 420px" className="object-cover" />
                {/* Véu escuro da esquerda para o texto ler sobre a foto. */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(90deg, rgba(0,0,0,.78) 0%, rgba(0,0,0,.55) 45%, rgba(0,0,0,.08) 100%)' }}
                />
              </>
            ) : (
              <Decoracao tom={b.tom} />
            )}
            <div className={`relative z-10 flex h-full min-h-[136px] flex-col justify-center p-4 ${b.imagem ? 'pr-16' : 'pr-28'}`}>
              <p className="text-[18px] font-extrabold leading-tight tracking-[-0.01em]">{b.titulo}</p>
              <p className={`mt-1 text-[13px] leading-snug ${b.tom === 'claro' && !b.imagem ? 'text-texto-2' : 'opacity-90'}`}>{b.texto}</p>
              <div>
                <Chamada banner={b} />
              </div>
            </div>
          </li>
        ))}
      </ul>
      {BANNERS.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
          {BANNERS.map((b, i) => (
            <span key={b.id} className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ${i === atual ? 'w-4 bg-fogo' : 'w-1.5 bg-borda'}`} />
          ))}
        </div>
      )}
    </section>
  );
}
