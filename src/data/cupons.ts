/**
 * Os cupons de desconto da casa. Para criar um cupom, some um objeto aqui;
 * para tirar do ar, `ativo: false` (ou apague a linha). O cliente digita o
 * código no checkout, sem diferença entre maiúsculas e minúsculas, e o código
 * sai na mensagem do pedido para a loja conferir.
 *
 * - `percentual`: `valor` em % sobre os itens (a entrega não entra);
 * - `valor`: `valor` em reais tirados dos itens;
 * - `entrega`: zera a taxa de entrega (só vale em pedido para entregar).
 *
 * `minimo` (reais, sobre os itens) e `validoAte` ('AAAA-MM-DD', último dia
 * valendo, horário de Brasília) são opcionais. `vitrine: true` sugere o cupom
 * no checkout para um toque; sem ele, só vale para quem tem o código.
 *
 * Exemplo: { codigo: 'KABANA10', tipo: 'percentual', valor: 10,
 *            titulo: '10% de desconto nos itens', minimo: 50, ativo: true }
 *
 * Sem servidor, o app não sabe quem já usou: cupom de "uso único" ou "primeira
 * compra" a loja confere na mensagem.
 */

export type TipoCupom = 'percentual' | 'valor' | 'entrega';

export type CupomDaCasa = {
  readonly codigo: string;
  readonly tipo: TipoCupom;
  readonly valor: number;
  /** O que o cliente lê: "10% de desconto nos itens". */
  readonly titulo: string;
  readonly minimo?: number;
  readonly validoAte?: string;
  readonly vitrine?: boolean;
  readonly ativo: boolean;
};

// Nenhum cupom no ar: a loja cria os seus aqui.
export const CUPONS: readonly CupomDaCasa[] = [];
