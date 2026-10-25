'use client';

import { Bike, ChevronRight, MapPin, Store } from 'lucide-react';
import { EscolhaEntrega, useEscolhaEntrega } from '@/components/inicio/EscolhaEntrega';
import { useEntrega } from '@/store/entrega';
import { LOJA } from '@/data/loja';
import { formatBRL } from '@/lib/money';
import { FAIXA_ENTREGA_CURTA, taxaEntrega, type ModoEntrega } from '@/lib/delivery';

/**
 * "Como você quer receber?", no fim do pedido (pedido do dono: nada de
 * perguntar na abertura do app). Dois cartões, Entrega e Retirada; na
 * entrega, a linha do bairro abre a lista com a taxa de cada um.
 */
export function ComoReceber() {
  const modo = useEntrega((s) => s.modo);
  const bairro = useEntrega((s) => s.bairro);
  const confirmar = useEntrega((s) => s.confirmar);
  const abrirBairro = useEscolhaEntrega((s) => s.abrirBairro);
  const retirada = LOJA.retiradaNoLocal && modo === 'retirada';
  const taxa = !retirada && bairro ? taxaEntrega('entrega', bairro) : null;

  function escolher(m: ModoEntrega) {
    confirmar({ modo: m, bairro });
    if (m === 'entrega' && !bairro) abrirBairro();
  }

  const opcoes = [
    { id: 'entrega' as const, titulo: 'Entrega', detalhe: `${FAIXA_ENTREGA_CURTA} • taxa por bairro`, icone: Bike },
    ...(LOJA.retiradaNoLocal ? [{ id: 'retirada' as const, titulo: 'Retirada', detalhe: 'Na loja • sem taxa', icone: Store }] : []),
  ];

  return (
    <section aria-labelledby="como-receber" className="px-4 pt-7">
      <h2 id="como-receber" className="text-[18px] font-extrabold tracking-[-0.01em] text-texto">
        Como você quer receber?
      </h2>

      <div role="radiogroup" aria-label="Forma de receber" className={`mt-3 grid gap-2.5 ${opcoes.length > 1 ? 'grid-cols-2' : ''}`}>
        {opcoes.map((o) => {
          const ativo = (o.id === 'retirada') === retirada;
          const Icone = o.icone;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={ativo}
              onClick={() => escolher(o.id)}
              className={`flex min-h-[84px] flex-col items-start gap-1.5 rounded-[16px] p-3.5 text-left transition-[box-shadow,background-color] duration-150 ${
                ativo ? 'bg-cartao shadow-[inset_0_0_0_2px_var(--color-carvao)]' : 'bg-fundo-2 shadow-[inset_0_0_0_1px_transparent]'
              }`}
            >
              <span className="flex w-full items-center justify-between">
                <Icone className={`size-5 ${ativo ? 'text-texto' : 'text-texto-2'}`} aria-hidden />
                <span
                  aria-hidden
                  className={`grid size-5 place-items-center rounded-full border-2 ${ativo ? 'border-carvao bg-carvao' : 'border-texto-3'}`}
                >
                  {ativo && <span className="size-2 rounded-full bg-fogo" />}
                </span>
              </span>
              <span className="text-[15px] font-bold text-texto">{o.titulo}</span>
              <span className="text-[12.5px] leading-tight text-texto-2">{o.detalhe}</span>
            </button>
          );
        })}
      </div>

      {retirada ? (
        <div className="mt-2.5 flex items-start gap-3 rounded-[16px] bg-fundo-2 px-4 py-3.5">
          <MapPin className="mt-0.5 size-5 shrink-0 text-texto-2" aria-hidden />
          <p className="text-[13px] leading-snug text-texto-2">
            <span className="block text-[14px] font-semibold text-texto">Retirar em {LOJA.endereco}</span>
            {LOJA.cidade}/{LOJA.uf}. A loja avisa pelo WhatsApp quando estiver pronto.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={abrirBairro}
          className={`mt-2.5 flex min-h-[60px] w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left active:brightness-95 ${
            bairro ? 'bg-fundo-2' : 'bg-fogo-suave shadow-[inset_0_0_0_1px_var(--color-fogo)]'
          }`}
        >
          <MapPin className={`size-5 shrink-0 ${bairro ? 'text-texto-2' : 'text-fogo-texto'}`} aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] font-medium text-texto-2">{bairro ? 'Entregar em' : 'Falta só o bairro'}</span>
            <span className="block truncate text-[15px] font-bold text-texto">{bairro ?? 'Escolha o seu bairro'}</span>
          </span>
          {taxa !== null && (
            <span className={`shrink-0 text-[14px] font-bold ${taxa === 0 ? 'text-verde' : 'text-texto'}`}>{taxa === 0 ? 'Grátis' : formatBRL(taxa)}</span>
          )}
          <ChevronRight className="size-5 shrink-0 text-texto-3" aria-hidden />
        </button>
      )}

      <EscolhaEntrega />
    </section>
  );
}
