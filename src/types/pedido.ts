import type { Cents } from '@/lib/money';
import type { ModoEntrega } from '@/lib/delivery';
import type { LinhaCarrinho } from './carrinho';

export type DadosCliente = {
  readonly nome: string;
  /** Como o cliente digitou, com máscara: (24) 99999-0000 */
  readonly telefone: string;
};

export type DadosEntrega = {
  readonly bairro: string;
  readonly rua: string;
  readonly numero: string;
  readonly complemento?: string;
  readonly referencia?: string;
};

export type DadosPagamento = {
  readonly id: string;
  readonly label: string;
  /** Quanto o cliente vai dar, quando paga em dinheiro. */
  readonly trocoParaCents?: Cents;
  /** Quanto o entregador precisa levar de volta. */
  readonly trocoCents?: Cents;
};

/**
 * O pedido fechado.
 *
 * Guarda os valores já calculados em vez de recalcular na hora de exibir: o
 * preço do cardápio pode mudar depois, e o que o cliente combinou foi isto.
 */
export type Pedido = {
  readonly id: string;
  readonly criadoEm: number;
  readonly cliente: DadosCliente;
  readonly linhas: readonly LinhaCarrinho[];
  readonly modo: ModoEntrega;
  readonly entrega?: DadosEntrega;
  readonly subtotalCents: Cents;
  readonly taxaEntregaCents: Cents;
  readonly totalCents: Cents;
  readonly pagamento: DadosPagamento;
  readonly temAlcool: boolean;
  readonly maiorDeIdade: boolean;
};
