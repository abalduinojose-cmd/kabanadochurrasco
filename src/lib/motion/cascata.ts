/**
 * Entrada em cascata: cada item começa antes do anterior assentar, com vãos
 * que ENCOLHEM (×0,84). A cascata inteira cabe em ≤ 500 ms seja qual for a
 * contagem; com muitos itens o passo aperta sozinho.
 */

export type OpcoesCascata = {
  /** atraso do primeiro item (nada começa em t = 0) */
  inicio?: number;
  /** vão inicial entre itens, em ms */
  vao?: number;
  /** fator de encolhimento do vão */
  fator?: number;
  /** teto para o atraso do último item, em ms, contado a partir de `inicio` */
  teto?: number;
};

export function atrasosEmCascata(
  n: number,
  { inicio = 120, vao = 90, fator = 0.84, teto = 500 }: OpcoesCascata = {},
): number[] {
  if (n <= 0) return [];
  const brutos: number[] = [];
  let t = 0;
  let v = vao;
  for (let i = 0; i < n; i++) {
    brutos.push(t);
    t += v;
    v *= fator;
  }
  // Comprime proporcionalmente se o último passar do teto.
  const ultimo = brutos[brutos.length - 1] ?? 0;
  const escala = ultimo > teto ? teto / ultimo : 1;
  return brutos.map((a) => Math.round(inicio + a * escala));
}

/** Passo de um spring-pop em grupo: min(60 ms, 500 / N). */
export function passoSpringPop(n: number): number {
  return n <= 0 ? 0 : Math.min(60, 500 / n);
}

/** Faixas de escalonamento para scroll-driven (percentuais que encolhem). */
export const FAIXAS_SCROLL = [0, 2.5, 4.6, 6.4, 7.9, 9.2] as const;
