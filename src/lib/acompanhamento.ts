/**
 * O que a tela de acompanhamento sabe dizer sem backend: a janela prevista
 * de entrega (a partir da hora do pedido e da faixa de loja.ts), se o pedido
 * ainda conta como "em andamento" e as etapas que a loja cumpre pelo WhatsApp.
 */

import { LOJA } from '@/data/loja';
import { horaDe, partesEmSaoPaulo } from './store-hours';
import { FAIXA_ENTREGA } from './delivery';
import type { ModoEntrega } from './delivery';
import type { Pedido } from '@/types/pedido';

/** Depois disso o pedido vai para "Anteriores". */
export const EM_ANDAMENTO_MS = 3 * 60 * 60 * 1000;

const MINUTO = 60_000;

function horaEm(ms: number): string {
  return horaDe(partesEmSaoPaulo(new Date(ms)).minutos);
}

/** "21:40" a "22:10": hora do pedido mais a faixa de entrega da loja. */
export function janelaDeEntrega(criadoEm: number): { de: string; ate: string } {
  return {
    de: horaEm(criadoEm + LOJA.tempoEntregaMin * MINUTO),
    ate: horaEm(criadoEm + LOJA.tempoEntregaMax * MINUTO),
  };
}

/** "21:40 a 22:10", ou "por volta das 21:40" quando a loja dá uma estimativa só. */
export function textoDaJanela(j: { de: string; ate: string }): string {
  return j.de === j.ate ? `por volta das ${j.de}` : `${j.de} a ${j.ate}`;
}

export function emAndamento(pedido: Pedido, agora: Date): boolean {
  return agora.getTime() - pedido.criadoEm < EM_ANDAMENTO_MS;
}

export type Etapa = { readonly id: string; readonly titulo: string; readonly texto: string };

/** As etapas na ordem. Só a primeira o app sabe que aconteceu. */
export function etapasDoPedido(modo: ModoEntrega): readonly Etapa[] {
  return [
    { id: 'enviado', titulo: 'Pedido enviado', texto: 'A mensagem foi montada e aberta no WhatsApp.' },
    { id: 'confirmado', titulo: 'Confirmação da loja', texto: 'A Kabana responde na conversa confirmando o pedido.' },
    { id: 'preparo', titulo: 'Na brasa', texto: 'Os espetos vão para o fogo depois da confirmação.' },
    modo === 'entrega'
      ? { id: 'saiu', titulo: 'Saiu para entrega', texto: `Previsão de ${FAIXA_ENTREGA} desde o pedido.` }
      : { id: 'pronto', titulo: 'Pronto para retirar', texto: 'A loja avisa pelo WhatsApp quando estiver pronto.' },
  ];
}
