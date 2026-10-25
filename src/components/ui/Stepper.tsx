'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';

/**
 * Seletor de quantidade em pílula: menos, número, mais. Com `aoRemover`, o
 * menos vira lixeira quando chega ao mínimo (na sacola); sem ele, o menos só
 * desabilita (página do item). O mais é o botão cheio da marca.
 */

type Props = {
  valor: number;
  aoMudar: (valor: number) => void;
  rotulo: string;
  min?: number;
  max?: number;
  aoRemover?: () => void;
  compacto?: boolean;
};

export function Stepper({ valor, aoMudar, rotulo, min = 1, max = 99, aoRemover, compacto = false }: Props) {
  const noMinimo = valor <= min;
  const removeNoMinimo = noMinimo && aoRemover !== undefined;
  const lado = compacto ? 'size-8' : 'size-10';
  const icone = compacto ? 'size-4' : 'size-[18px]';

  return (
    <div
      role="group"
      aria-label={`Quantidade de ${rotulo}`}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-fundo-2 p-1 ${compacto ? 'h-10' : 'h-12'}`}
    >
      <button
        type="button"
        onClick={() => (removeNoMinimo ? aoRemover?.() : aoMudar(valor - 1))}
        disabled={noMinimo && !removeNoMinimo}
        aria-label={removeNoMinimo ? `Remover ${rotulo}` : `Diminuir ${rotulo}`}
        className={`grid ${lado} min-h-0 place-items-center rounded-full bg-cartao text-texto shadow-[0_1px_2px_rgba(0,0,0,0.1)] disabled:bg-transparent disabled:text-texto-3 disabled:shadow-none`}
      >
        {removeNoMinimo ? <Trash2 className={`${icone} text-vermelho`} aria-hidden /> : <Minus className={icone} strokeWidth={2.5} aria-hidden />}
      </button>
      <output aria-live="polite" className={`text-center font-extrabold tabular-nums text-texto ${compacto ? 'min-w-6 text-[14px]' : 'min-w-8 text-[16px]'}`}>
        {valor}
      </output>
      <button
        type="button"
        onClick={() => aoMudar(Math.min(max, valor + 1))}
        disabled={valor >= max}
        aria-label={`Aumentar ${rotulo}`}
        className={`grid ${lado} min-h-0 place-items-center rounded-full bg-fogo text-carvao disabled:bg-fundo-2 disabled:text-texto-3`}
      >
        <Plus className={icone} strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}
