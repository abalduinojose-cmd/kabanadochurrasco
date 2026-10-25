import type { Cents } from '@/lib/money';

/** Uma opção efetivamente escolhida pelo cliente, com o preço congelado. */
export type OpcaoEscolhida = {
  readonly grupoId: string;
  readonly grupoNome: string;
  readonly opcaoId: string;
  readonly nome: string;
  readonly precoCents: Cents;
};

export type LinhaCarrinho = {
  /** Identidade da linha: mesmo item com as mesmas opções soma quantidade. */
  readonly uid: string;
  readonly itemId: string;
  readonly categoriaId: string;
  readonly nome: string;
  readonly precoBaseCents: Cents;
  readonly quantidade: number;
  readonly opcoes: readonly OpcaoEscolhida[];
  readonly observacao?: string;
  readonly alcoolico: boolean;
};

/** Preço de uma unidade, já com os adicionais. */
export const precoUnitario = (l: LinhaCarrinho): Cents =>
  l.precoBaseCents + l.opcoes.reduce((s, o) => s + o.precoCents, 0);

/** Preço da linha inteira. */
export const precoLinha = (l: LinhaCarrinho): Cents => precoUnitario(l) * l.quantidade;
