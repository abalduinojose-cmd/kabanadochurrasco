'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';

/**
 * Seletor de quantidade do iFood: caixa com borda, menos à esquerda, mais à
 * direita. Com `aoRemover`, o menos vira lixeira quando chega ao mínimo
 * (é assim na sacola); sem ele, o menos só desabilita (página do item).
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
  const caixa = compacto ? 'h-9' : 'h-12';
  const botao = `grid ${compacto ? 'size-9' : 'size-12'} min-h-0 place-items-center rounded-botao text-fogo-texto disabled:text-texto-3`;

  return (
    <div role="group" aria-label={`Quantidade de ${rotulo}`} className={`inline-flex ${caixa} shrink-0 items-center rounded-botao border border-borda bg-cartao`}>
      <button
        type="button"
        onClick={() => (removeNoMinimo ? aoRemover?.() : aoMudar(valor - 1))}
        disabled={noMinimo && !removeNoMinimo}
        aria-label={removeNoMinimo ? `Remover ${rotulo}` : `Diminuir ${rotulo}`}
        className={botao}
      >
        {removeNoMinimo ? <Trash2 className="size-[18px]" aria-hidden /> : <Minus className="size-[18px]" aria-hidden />}
      </button>
      <output aria-live="polite" className="min-w-7 text-center text-[15px] font-bold tabular-nums text-texto">
        {valor}
      </output>
      <button
        type="button"
        onClick={() => aoMudar(Math.min(max, valor + 1))}
        disabled={valor >= max}
        aria-label={`Aumentar ${rotulo}`}
        className={botao}
      >
        <Plus className="size-[18px]" aria-hidden />
      </button>
    </div>
  );
}
