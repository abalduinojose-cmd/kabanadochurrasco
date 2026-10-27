'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Janela do atendimento na mesa: centrada no tablet (ou de baixo para cima no
 * telefone), véu escurecido com desfoque, Esc e o X fecham, o foco entra na
 * janela e volta ao botão de origem, a página atrás não rola.
 */

type Props = {
  aoFechar?: () => void;
  titulo: string;
  /** Esconde o título visualmente (continua para leitor de tela). */
  tituloOculto?: boolean;
  largura?: string;
  children: React.ReactNode;
  rodape?: React.ReactNode;
  semPadding?: boolean;
};

export function Janela({ aoFechar, titulo, tituloOculto = false, largura = 'max-w-[560px]', children, rodape, semPadding = false }: Props) {
  const caixa = useRef<HTMLDivElement>(null);
  const tituloId = useId();

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    caixa.current?.focus();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && aoFechar) {
        e.preventDefault();
        aoFechar();
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => {
      window.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
  }, [aoFechar]);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Fechar"
        onClick={aoFechar}
        className="anima-veu absolute inset-0 cursor-default bg-black/55 backdrop-blur-[3px]"
      />
      <div
        ref={caixa}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className={`anima-janela relative flex max-h-[92dvh] w-full ${largura} flex-col overflow-hidden rounded-t-[28px] bg-cartao shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] outline-none sm:rounded-[28px]`}
      >
        <div className={`flex items-start gap-3 px-6 pt-5 ${tituloOculto ? 'sr-only' : 'pb-3'}`}>
          <h2 id={tituloId} className="flex-1 text-[20px] font-extrabold leading-tight tracking-[-0.02em] text-texto">
            {titulo}
          </h2>
        </div>
        {aoFechar && (
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-white/90 text-texto shadow-sm backdrop-blur hover:bg-fundo-2"
          >
            <X className="size-5" aria-hidden />
          </button>
        )}
        <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${semPadding ? '' : 'px-6 pb-6'}`}>{children}</div>
        {rodape && <div className="pb-seguro border-t border-divisor bg-cartao px-6 pt-4">{rodape}</div>}
      </div>
    </div>,
    document.body,
  );
}
