'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { CURVA, mola } from '@/lib/motion/curvas';
import { querMovimento } from '@/lib/motion/reduce';
import { animar, aoTerminar, pausa } from '@/lib/motion/waapi';

/**
 * Bottom sheet claro, como as folhas do iFood. Entra em mola crítica, sai em
 * power3.in; arrasta para fechar pelo cabeçalho; foco preso; Esc fecha; toda
 * espera por animação tem teto de relógio.
 */

type Props = { aoFechar: () => void; titulo: string; children: React.ReactNode; rodape?: React.ReactNode };

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Folha({ aoFechar, titulo, children, rodape }: Props) {
  const folha = useRef<HTMLDivElement>(null);
  const veu = useRef<HTMLButtonElement>(null);
  const devolverFoco = useRef<HTMLElement | null>(null);
  const fechando = useRef(false);
  const tituloId = useId();

  const fechar = useCallback(
    async (desde = 0) => {
      if (fechando.current) return;
      fechando.current = true;
      const el = folha.current;
      const v = veu.current;
      if (el && v) {
        const altura = el.getBoundingClientRect().height;
        const a = animar(el, [{ transform: `translateY(${desde}px)` }, { transform: `translateY(${altura + 24}px)` }], {
          duration: querMovimento() ? 280 : 160,
          easing: CURVA.power3in,
        });
        const b = animar(v, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'linear' });
        await Promise.race([Promise.all([aoTerminar(a), aoTerminar(b)]), pausa(600)]);
      }
      aoFechar();
    },
    [aoFechar],
  );

  useEffect(() => {
    const el = folha.current;
    const v = veu.current;
    if (!el || !v) return;
    devolverFoco.current = document.activeElement as HTMLElement | null;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const pleno = querMovimento();
    const m = mola({ response: 0.42, dampingFraction: 1 });
    const entrada = animar(
      el,
      pleno
        ? [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }]
        : [{ transform: 'translateY(12px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: pleno ? m.duration : 200, easing: pleno ? m.easing : CURVA.power3out },
    );
    animar(v, [{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: 'linear' });
    void Promise.race([aoTerminar(entrada), pausa(1200)]).then(() => entrada.cancel());

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        void fechar();
        return;
      }
      if (e.key !== 'Tab') return;
      const alvos = Array.from(el.querySelectorAll<HTMLElement>(FOCAVEIS)).filter((x) => x.offsetParent !== null);
      const primeiro = alvos[0];
      const ultimo = alvos[alvos.length - 1];
      if (!primeiro || !ultimo) return;
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener('keydown', aoTeclar);
    const t = window.setTimeout(() => (el.querySelector<HTMLElement>(FOCAVEIS) ?? el).focus(), 0);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflowAnterior;
      devolverFoco.current?.focus?.();
    };
  }, [fechar]);

  const arrasto = useRef<{ y0: number; dy: number; ultimoT: number; ultimoY: number } | null>(null);
  const aoPegar = (e: React.PointerEvent) => {
    if (fechando.current) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    arrasto.current = { y0: e.clientY, dy: 0, ultimoT: e.timeStamp, ultimoY: e.clientY };
    folha.current?.getAnimations().forEach((a) => a.cancel());
  };
  const aoMover = (e: React.PointerEvent) => {
    const a = arrasto.current;
    const el = folha.current;
    if (!a || !el) return;
    a.dy = Math.max(0, e.clientY - a.y0);
    a.ultimoT = e.timeStamp;
    a.ultimoY = e.clientY;
    el.style.transform = `translateY(${a.dy}px)`;
  };
  const aoSoltar = (e: React.PointerEvent) => {
    const a = arrasto.current;
    const el = folha.current;
    arrasto.current = null;
    if (!a || !el) return;
    const altura = el.getBoundingClientRect().height;
    const velocidade = (e.clientY - a.ultimoY) / Math.max(1, e.timeStamp - a.ultimoT);
    el.style.transform = '';
    if (a.dy > altura * 0.35 || velocidade > 0.5) {
      void fechar(a.dy);
      return;
    }
    const m = mola({ response: 0.3, dampingFraction: 0.85 });
    const volta = animar(el, [{ transform: `translateY(${a.dy}px)` }, { transform: 'translateY(0)' }], {
      duration: m.duration,
      easing: m.easing,
    });
    void Promise.race([aoTerminar(volta), pausa(m.duration + 100)]).then(() => volta.cancel());
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button ref={veu} type="button" aria-label="Fechar" tabIndex={-1} onClick={() => void fechar()} className="absolute inset-0 cursor-default bg-black/45" />
      <div
        ref={folha}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className="relative flex max-h-[88dvh] w-full max-w-2xl flex-col rounded-t-folha bg-cartao will-change-transform"
      >
        <header
          onPointerDown={aoPegar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoSoltar}
          className="flex touch-none select-none items-start gap-3 border-b border-divisor px-4 pb-3 pt-4"
        >
          <span aria-hidden className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-borda" />
          <h2 id={tituloId} className="mt-1 flex-1 text-[18px] font-extrabold leading-tight text-texto">
            {titulo}
          </h2>
          <button type="button" onClick={() => void fechar()} aria-label="Fechar" className="-mr-1 -mt-1 grid size-11 shrink-0 place-items-center rounded-full text-texto-2 hover:bg-fundo-2">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">{children}</div>
        {rodape && <footer className="pb-seguro border-t border-divisor bg-cartao px-4 pt-3">{rodape}</footer>}
      </div>
    </div>,
    document.body,
  );
}
