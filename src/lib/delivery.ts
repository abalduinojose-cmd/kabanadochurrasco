/**
 * Regras de entrega: taxa por bairro, pedido mínimo, retirada no local.
 * Tudo lido de LOJA, tudo em centavos.
 */

import { LOJA } from '@/data/loja';
import { toCents, type Cents } from './money';

export type ModoEntrega = 'entrega' | 'retirada';

/* Anotado como string[] de propósito: serve para validar o que veio do
   formulário, que é string qualquer, não a união literal de loja.ts. */
export const BAIRROS: readonly string[] = LOJA.fretes.map((f) => f.bairro);

export const PEDIDO_MINIMO: Cents = toCents(LOJA.pedidoMinimo);

/**
 * Taxa do bairro em centavos. Retirada no local é sempre zero.
 * Bairro desconhecido devolve null ─ quem chama trata como bloqueio,
 * nunca como frete grátis.
 */
export function taxaEntrega(modo: ModoEntrega, bairro: string | null): Cents | null {
  if (modo === 'retirada') return 0;
  if (!bairro) return null;
  const achado = LOJA.fretes.find((f) => f.bairro === bairro);
  return achado ? toCents(achado.taxa) : null;
}

/** Quanto ainda falta para bater o pedido mínimo. Zero quando já bateu. */
export function faltaParaMinimo(subtotal: Cents, minimo: Cents = PEDIDO_MINIMO): Cents {
  return Math.max(0, minimo - subtotal);
}

export function atingiuPedidoMinimo(subtotal: Cents, minimo: Cents = PEDIDO_MINIMO): boolean {
  return subtotal >= minimo;
}

/** Total final: subtotal + frete. */
export function totalDoPedido(subtotal: Cents, taxa: Cents): Cents {
  return subtotal + taxa;
}

/** Troco a levar. Null quando o valor informado não cobre o total. */
export function trocoPara(total: Cents, valorPago: Cents | null): Cents | null {
  if (valorPago === null || valorPago < total) return null;
  return valorPago - total;
}

const TEMPO_MIN: number = LOJA.tempoEntregaMin;
const TEMPO_MAX: number = LOJA.tempoEntregaMax;

/** "cerca de 50 min" quando a loja dá uma estimativa só; "40 a 60 min" quando dá faixa. */
export const FAIXA_ENTREGA = TEMPO_MIN === TEMPO_MAX ? `cerca de ${TEMPO_MIN} min` : `${TEMPO_MIN} a ${TEMPO_MAX} min`;

/** Versão curta para linhas apertadas: "~50 min" ou "40-60 min". */
export const FAIXA_ENTREGA_CURTA = TEMPO_MIN === TEMPO_MAX ? `~${TEMPO_MIN} min` : `${TEMPO_MIN}-${TEMPO_MAX} min`;
