'use client';

import { Bike, ChevronRight, Store } from 'lucide-react';
import { EscolhaEntrega, useEscolhaEntrega } from '@/components/inicio/EscolhaEntrega';
import { useEntrega } from '@/store/entrega';
import { LOJA } from '@/data/loja';
import { formatBRL } from '@/lib/money';
import { FAIXA_ENTREGA_CURTA, taxaEntrega } from '@/lib/delivery';

/** "Como receber" na sacola: a escolha feita na loja, com Trocar abrindo a mesma folha. */
export function ResumoEntrega() {
  const modo = useEntrega((s) => s.modo);
  const bairro = useEntrega((s) => s.bairro);
  const abrir = useEscolhaEntrega((s) => s.abrir);
  const retirada = LOJA.retiradaNoLocal && modo === 'retirada';
  const taxa = !retirada && bairro ? taxaEntrega('entrega', bairro) : null;

  return (
    <section className="px-4 py-4" aria-label="Como receber">
      <h2 className="text-[15px] font-bold text-texto">Como receber</h2>
      <button
        type="button"
        onClick={abrir}
        className="mt-2 flex w-full items-center gap-3 rounded-cartao border border-borda bg-cartao px-3 py-3 text-left active:bg-fundo-2"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-fundo-2 text-texto">
          {retirada ? <Store className="size-5" aria-hidden /> : <Bike className="size-5" aria-hidden />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold text-texto">
            {retirada ? 'Retirar na loja' : bairro ? `Entrega em ${bairro}` : 'Escolha o bairro da entrega'}
          </span>
          <span className="block text-[13px] text-texto-2">
            {retirada
              ? 'Sem taxa de entrega'
              : taxa !== null
                ? `${FAIXA_ENTREGA_CURTA} • taxa ${taxa === 0 ? 'grátis' : formatBRL(taxa)}`
                : 'A taxa depende do bairro'}
          </span>
        </span>
        <span className="shrink-0 text-[13px] font-bold text-fogo-texto">{retirada || bairro ? 'Trocar' : 'Escolher'}</span>
        <ChevronRight className="size-5 shrink-0 text-texto-3" aria-hidden />
      </button>
      <EscolhaEntrega />
    </section>
  );
}
