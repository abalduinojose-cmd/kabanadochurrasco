'use client';

import { Check, MessageCircle } from 'lucide-react';
import { etapasDoPedido, janelaDeEntrega, textoDaJanela } from '@/lib/acompanhamento';
import { FAIXA_ENTREGA } from '@/lib/delivery';
import { LOJA } from '@/data/loja';
import type { Pedido } from '@/types/pedido';

/**
 * O acompanhamento que dá para prometer sem backend: a previsão de entrega
 * (hora do pedido mais a faixa da loja) e as etapas, com só a primeira
 * marcada como feita. As outras a loja cumpre e avisa pelo WhatsApp.
 */
export function Acompanhamento({ pedido }: { pedido: Pedido }) {
  const etapas = etapasDoPedido(pedido.modo);
  const janela = janelaDeEntrega(pedido.criadoEm);
  const falar = `https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(`Olá! Sobre o pedido #${pedido.id}: `)}`;

  return (
    <section className="px-4" aria-label="Acompanhamento do pedido">
      {pedido.modo === 'entrega' ? (
        <div className="rounded-cartao bg-verde-suave px-3.5 py-3">
          <p className="text-legenda font-bold uppercase tracking-wide text-verde">Previsão de entrega</p>
          <p className="mt-0.5 text-[18px] font-extrabold tabular-nums text-texto">{textoDaJanela(janela)}</p>
          <p className="text-legenda text-texto-2">Previsão de {FAIXA_ENTREGA} a partir do pedido. A loja confirma na conversa.</p>
        </div>
      ) : (
        <div className="rounded-cartao bg-verde-suave px-3.5 py-3">
          <p className="text-legenda font-bold uppercase tracking-wide text-verde">Retirada na loja</p>
          <p className="mt-0.5 text-[15px] font-bold text-texto">A loja avisa pelo WhatsApp quando estiver pronto</p>
        </div>
      )}

      <ol className="mt-5">
        {etapas.map((e, i) => {
          const feita = i === 0;
          const ultima = i === etapas.length - 1;
          return (
            <li key={e.id} className="relative flex gap-3 pb-5 last:pb-0">
              {!ultima && <span aria-hidden className="absolute left-[11px] top-6 h-[calc(100%-8px)] w-0.5 bg-divisor" />}
              <span
                aria-hidden
                className={`relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 ${
                  feita ? 'border-verde bg-verde text-fundo' : 'border-borda bg-cartao'
                }`}
              >
                {feita && <Check className="size-3.5" strokeWidth={3.5} />}
              </span>
              <div>
                <p className={`text-[14px] font-bold ${feita ? 'text-texto' : 'text-texto-2'}`}>{e.titulo}</p>
                <p className="text-[13px] leading-snug text-texto-2">{e.texto}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <a href={falar} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 text-[13px] font-bold text-fogo-texto">
        <MessageCircle className="size-4" aria-hidden />
        Falar com a loja sobre este pedido
      </a>
    </section>
  );
}
