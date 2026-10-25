'use client';

import { Bike, ChevronRight, Store } from 'lucide-react';
import { useEntrega } from '@/store/entrega';
import { useEscolhaEntrega } from './EscolhaEntrega';
import { LOJA } from '@/data/loja';
import { formatBRL, toCents } from '@/lib/money';
import { FAIXA_ENTREGA_CURTA, taxaEntrega } from '@/lib/delivery';

const menorTaxa = Math.min(...LOJA.fretes.map((f) => f.taxa));

/**
 * A linha "Entrega em {bairro} • 40-70 min • R$ 10,00" do cartão da loja,
 * o "Entregar em" do iFood. Toca para trocar o bairro ou passar a retirada.
 * Antes da hidratação mostra o estado neutro (sem bairro), igual ao servidor.
 */
export function LinhaEntrega() {
  const modo = useEntrega((s) => s.modo);
  const bairro = useEntrega((s) => s.bairro);
  const abrir = useEscolhaEntrega((s) => s.abrir);

  const retirada = LOJA.retiradaNoLocal && modo === 'retirada';
  const taxa = !retirada && bairro ? taxaEntrega('entrega', bairro) : null;
  const tempo = FAIXA_ENTREGA_CURTA;

  return (
    <button
      type="button"
      onClick={abrir}
      className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-2.5 text-left active:bg-fundo-2"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-fundo-2 text-texto">
        {retirada ? <Store className="size-5" aria-hidden /> : <Bike className="size-5" aria-hidden />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold text-texto">
          {retirada ? 'Retirar na loja' : bairro ? <>Entrega em {bairro}</> : 'Escolha seu bairro'}
        </span>
        <span className="block text-[13px] text-texto-2">
          {retirada ? (
            <span className="font-semibold text-verde">Sem taxa de entrega</span>
          ) : (
            <>
              {tempo} •{' '}
              {taxa !== null ? (
                <span className="font-semibold text-verde">{taxa === 0 ? 'Grátis' : formatBRL(taxa)}</span>
              ) : (
                `a partir de ${formatBRL(toCents(menorTaxa))}`
              )}
            </>
          )}
        </span>
      </span>
      <span className="shrink-0 text-[13px] font-bold text-fogo-texto">{retirada || bairro ? 'Trocar' : 'Escolher'}</span>
      <ChevronRight className="size-5 shrink-0 text-texto-3" aria-hidden />
    </button>
  );
}
