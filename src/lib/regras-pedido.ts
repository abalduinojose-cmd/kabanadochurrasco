/**
 * As regras que impedem um pedido de ser enviado.
 *
 * Ficam todas aqui, em um lugar só, porque duas telas precisam delas: o
 * carrinho avisa cedo (para o cliente ter chance de resolver) e o checkout
 * bloqueia. Se cada tela tivesse a sua cópia, uma ia divergir da outra.
 *
 * Cada bloqueio traz uma mensagem específica e, quando faz sentido, um atalho
 * para resolver ─ nunca um alerta seco.
 */

import { LOJA } from '@/data/loja';
import { CATEGORIAS_DE_ESPETO } from '@/data/grupos-extra';
import { formatBRL, toCents, type Cents } from './money';
import { atingiuPedidoMinimo, faltaParaMinimo, type ModoEntrega } from './delivery';
import type { ProximaAbertura } from './store-hours';

export type Bloqueio = {
  readonly id: string;
  readonly mensagem: string;
  readonly atalho?: { readonly texto: string; readonly href: string };
};

/** Os números das regras, lidos de loja.ts; os testes passam outros para exercitar a lógica. */
export type RegrasDoPedido = {
  readonly pedidoMinimoCents: Cents;
  readonly minEspetinhos: number;
};

export const REGRAS_DA_LOJA: RegrasDoPedido = {
  pedidoMinimoCents: toCents(LOJA.pedidoMinimo),
  minEspetinhos: LOJA.minEspetinhos,
};

export type EstadoDoPedido = {
  readonly subtotal: Cents;
  readonly unidadesDeEspeto: number;
  readonly itens: number;
  /** null enquanto o cliente ainda não resolveu o relógio (servidor). */
  readonly lojaAberta: boolean | null;
  readonly proximaAbertura: ProximaAbertura | null;
  readonly modo: ModoEntrega;
  readonly bairro: string | null;
};

export function bloqueiosDoPedido(e: EstadoDoPedido, regras: RegrasDoPedido = REGRAS_DA_LOJA): readonly Bloqueio[] {
  const bloqueios: Bloqueio[] = [];

  if (e.itens === 0) {
    bloqueios.push({ id: 'vazio', mensagem: 'Seu carrinho está vazio.' });
    return bloqueios;
  }

  if (!atingiuPedidoMinimo(e.subtotal, regras.pedidoMinimoCents)) {
    bloqueios.push({
      id: 'pedido-minimo',
      mensagem: `O pedido mínimo é ${formatBRL(regras.pedidoMinimoCents)}. Faltam ${formatBRL(
        faltaParaMinimo(e.subtotal, regras.pedidoMinimoCents),
      )} para fechar.`,
      atalho: { texto: 'Voltar ao cardápio', href: '/' },
    });
  }

  // Espeto tem mínimo somado por pedido, não por item.
  if (regras.minEspetinhos > 1 && e.unidadesDeEspeto > 0 && e.unidadesDeEspeto < regras.minEspetinhos) {
    const faltam = regras.minEspetinhos - e.unidadesDeEspeto;
    bloqueios.push({
      id: 'minimo-espetinhos',
      mensagem: `Espetinho sai a partir de ${regras.minEspetinhos} unidades por pedido. Você tem ${e.unidadesDeEspeto}, ${
        faltam === 1 ? 'falta 1' : `faltam ${faltam}`
      }.`,
      atalho: { texto: 'Escolher mais espetos', href: `/#${CATEGORIAS_DE_ESPETO[0] ?? ''}` },
    });
  }

  if (e.lojaAberta === false) {
    bloqueios.push({
      id: 'loja-fechada',
      mensagem: e.proximaAbertura
        ? `A loja está fechada agora. Abre ${e.proximaAbertura.label}.`
        : 'A loja está fechada agora.',
    });
  }

  if (e.modo === 'entrega' && !e.bairro) {
    bloqueios.push({
      id: 'bairro',
      mensagem: 'Escolha o bairro para calcularmos a taxa de entrega.',
    });
  }

  return bloqueios;
}

/** Só os avisos que o carrinho mostra: lá o cliente ainda não escolheu entrega. */
export function avisosDoCarrinho(
  subtotal: Cents,
  unidadesDeEspeto: number,
  regras: RegrasDoPedido = REGRAS_DA_LOJA,
): readonly Bloqueio[] {
  return bloqueiosDoPedido(
    {
    subtotal,
    unidadesDeEspeto,
    itens: 1,
    lojaAberta: null,
    proximaAbertura: null,
    modo: 'retirada',
    bairro: null,
    },
    regras,
  );
}

export { CATEGORIAS_DE_ESPETO };
