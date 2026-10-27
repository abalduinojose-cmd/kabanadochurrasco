'use client';

import { createPortal } from 'react-dom';
import { ArrowLeft, Check, MessageCircle, ScrollText } from 'lucide-react';
import { Janela } from './Janela';
import { formatBRL } from '@/lib/money';
import { rotuloMesa } from '@/lib/mensagem-mesa';
import { precoLinha, type LinhaCarrinho } from '@/types/carrinho';
import type { PedidoEnviado } from '@/store/comanda';

/**
 * O envio do pedido em três telas:
 * - Conferir: a lista com o total e os dois caminhos, enviar para a cozinha
 *   pelo WhatsApp da loja ou mostrar na tela para o garçom anotar;
 * - Mostrar ao garçom: tela cheia em letra grande, para ler de pé;
 * - Enviado: a confirmação com o check que se desenha.
 */

function Resumo({ linhas, grande = false }: { linhas: readonly LinhaCarrinho[]; grande?: boolean }) {
  return (
    <ul className="divide-y divide-divisor">
      {linhas.map((l) => {
        const detalhes = [
          ...l.opcoes.filter((o) => o.precoCents === 0).map((o) => `${o.grupoNome}: ${o.nome}`),
          ...l.opcoes.filter((o) => o.precoCents > 0).map((o) => `+ ${o.nome}`),
          ...(l.observacao ? [`Obs: ${l.observacao}`] : []),
        ];
        return (
          <li key={l.uid} className={`flex items-start gap-3 ${grande ? 'py-4' : 'py-3'}`}>
            <span className={`grid shrink-0 place-items-center rounded-[10px] bg-carvao font-extrabold tabular-nums text-white ${grande ? 'h-11 min-w-11 px-2 text-[20px]' : 'h-8 min-w-8 px-1.5 text-[14px]'}`}>
              {l.quantidade}x
            </span>
            <div className="min-w-0 flex-1">
              <p className={`font-bold leading-tight text-texto ${grande ? 'text-[24px]' : 'text-[15px]'}`}>{l.nome}</p>
              {detalhes.length > 0 && <p className={`mt-0.5 leading-snug text-texto-2 ${grande ? 'text-[17px]' : 'text-[13px]'}`}>{detalhes.join(' • ')}</p>}
            </div>
            <span className={`shrink-0 font-extrabold tabular-nums text-texto ${grande ? 'text-[20px]' : 'text-[15px]'}`}>{formatBRL(precoLinha(l))}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function ConferirEnvio({
  mesa,
  nome,
  linhas,
  totalCents,
  aoFechar,
  aoEnviarWhatsApp,
  aoMostrarGarcom,
}: {
  mesa: string;
  nome: string;
  linhas: readonly LinhaCarrinho[];
  totalCents: number;
  aoFechar: () => void;
  aoEnviarWhatsApp: () => void;
  aoMostrarGarcom: () => void;
}) {
  return (
    <Janela
      aoFechar={aoFechar}
      titulo="Conferir e enviar"
      largura="max-w-[620px]"
      rodape={
        <div className="space-y-2.5 pb-1">
          <button
            type="button"
            onClick={aoEnviarWhatsApp}
            className="flex h-15 w-full items-center justify-center gap-2.5 rounded-[18px] bg-fogo py-4 text-[17px] font-extrabold text-carvao shadow-[0_14px_30px_-16px_rgba(255,106,0,0.95)] active:scale-[0.99]"
          >
            <MessageCircle className="size-5" strokeWidth={2.5} aria-hidden />
            Enviar para a cozinha
          </button>
          <button
            type="button"
            onClick={aoMostrarGarcom}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-[16px] bg-fundo-2 py-3.5 text-[15px] font-bold text-texto active:brightness-95"
          >
            <ScrollText className="size-[18px]" aria-hidden />
            Mostrar o pedido ao garçom
          </button>
        </div>
      }
    >
      <p className="-mt-1 text-[14px] text-texto-2">
        {rotuloMesa(mesa)}
        {nome.trim() ? ` • para ${nome.trim()}` : ''}. O pedido vai pelo WhatsApp da casa; confirme o envio lá.
      </p>
      <div className="mt-3 rounded-[20px] bg-fundo-2 px-4">
        <Resumo linhas={linhas} />
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-[15px] font-semibold text-texto-2">Total</span>
        <span className="text-[26px] font-extrabold tabular-nums tracking-[-0.02em] text-texto">{formatBRL(totalCents)}</span>
      </div>
    </Janela>
  );
}

export function MostrarGarcom({
  mesa,
  nome,
  linhas,
  totalCents,
  aoVoltar,
  aoConfirmar,
}: {
  mesa: string;
  nome: string;
  linhas: readonly LinhaCarrinho[];
  totalCents: number;
  aoVoltar: () => void;
  aoConfirmar: () => void;
}) {
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Pedido para o garçom" className="anima-veu fixed inset-0 z-[70] flex flex-col bg-cartao">
      <header className="flex items-center justify-between gap-4 bg-carvao px-6 py-5 text-white sm:px-10">
        <button type="button" onClick={aoVoltar} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-[15px] font-bold">
          <ArrowLeft className="size-5" aria-hidden />
          Voltar
        </button>
        <p className="text-[30px] font-extrabold tracking-[0.04em] sm:text-[40px]">{rotuloMesa(mesa)}</p>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-10">
        {nome.trim() && <p className="text-[18px] font-semibold text-texto-2">Para {nome.trim()}</p>}
        <Resumo linhas={linhas} grande />
      </div>
      <footer className="pb-seguro flex flex-wrap items-center justify-between gap-4 border-t border-divisor px-6 pt-5 sm:px-10">
        <p className="text-[28px] font-extrabold tabular-nums tracking-[-0.02em] text-texto">Total {formatBRL(totalCents)}</p>
        <button
          type="button"
          onClick={aoConfirmar}
          className="mb-4 flex h-15 items-center gap-2.5 rounded-[18px] bg-verde px-8 py-4 text-[17px] font-extrabold text-white active:scale-[0.99]"
        >
          <Check className="size-5" strokeWidth={3} aria-hidden />
          Garçom anotou
        </button>
      </footer>
    </div>,
    document.body,
  );
}

export function PedidoEnviadoAviso({
  mesa,
  pedido,
  urlWhatsApp,
  aoContinuar,
}: {
  mesa: string;
  pedido: PedidoEnviado;
  urlWhatsApp: string | null;
  aoContinuar: () => void;
}) {
  return (
    <Janela titulo="Pedido enviado" tituloOculto largura="max-w-[480px]">
      <div className="flex flex-col items-center pt-8 text-center">
        <span className="grid size-24 place-items-center rounded-full bg-verde-suave">
          <svg viewBox="0 0 48 48" className="size-14 text-verde" aria-hidden>
            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path
              d="M14 25 l7 7 l13 -15"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 48, animation: 'check-traca 420ms var(--ease-expo) 120ms both' }}
            />
          </svg>
        </span>
        <p className="mt-5 text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-texto">
          {pedido.via === 'garcom' ? 'Pedido com o garçom!' : 'Pedido enviado!'}
        </p>
        <p className="mt-1.5 text-[15px] text-texto-2">
          {rotuloMesa(mesa)} • Pedido {pedido.numero} • {formatBRL(pedido.totalCents)}
        </p>
        <p className="mt-3 max-w-[30ch] text-[15px] leading-snug text-texto">Já já chega na sua mesa. Quer mais alguma coisa? É só pedir de novo por aqui.</p>
        <button
          type="button"
          onClick={aoContinuar}
          className="mt-7 flex h-15 w-full items-center justify-center rounded-[18px] bg-fogo py-4 text-[17px] font-extrabold text-carvao active:scale-[0.99]"
        >
          Voltar ao cardápio
        </button>
        {urlWhatsApp && (
          <a href={urlWhatsApp} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-[14px] font-bold text-fogo-texto">
            O WhatsApp não abriu? Toque para enviar de novo
          </a>
        )}
      </div>
    </Janela>
  );
}
