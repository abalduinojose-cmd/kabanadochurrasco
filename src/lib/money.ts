/**
 * Dinheiro.
 *
 * Regra única do projeto: TODA aritmética acontece em centavos inteiros.
 * `menu.ts` e `loja.ts` guardam reais porque o dono edita à mão; a conversão
 * acontece na entrada (`toCents`) e a formatação na saída (`formatBRL`).
 * Nunca somar float. Nunca usar toFixed() dentro de um cálculo.
 */

/** Centavos. Sempre inteiro. */
export type Cents = number;

/**
 * Reais (como o dono digita no menu.ts) para centavos inteiros.
 *
 * Recusa valor com mais de duas casas decimais em vez de arredondar calado:
 * um 29.905 digitado por engano no cardápio vira erro na hora do build, e não
 * uma diferença de um centavo que só aparece no fechamento do caixa.
 */
export function toCents(reais: number): Cents {
  if (!Number.isFinite(reais)) {
    throw new TypeError(`toCents: valor inválido (${reais})`);
  }
  const escalado = reais * 100;
  const arredondado = Math.round(escalado);
  if (Math.abs(escalado - arredondado) > 1e-6) {
    throw new RangeError(
      `toCents: ${reais} tem mais de duas casas decimais. ` +
        'Preço se escreve com centavos exatos (ex.: 29.90).',
    );
  }
  return arredondado;
}

/** Centavos de volta para reais. Só para exibição ou interoperação. */
export function toReais(cents: Cents): number {
  return cents / 100;
}

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formata centavos como moeda brasileira: 12880 → "R$ 128,80".
 * O Intl usa espaço não separável (U+00A0) entre o símbolo e o número.
 */
export function formatBRL(cents: Cents): string {
  return BRL.format(cents / 100);
}

/**
 * Mesma formatação, com espaço comum no lugar do não separável.
 * Usada na mensagem do WhatsApp, onde o U+00A0 vira %C2%A0 na URL e
 * atrapalha quem for copiar o valor do celular.
 */
export function formatBRLPlain(cents: Cents): string {
  return formatBRL(cents).replace(/\u00A0/g, ' ');
}

/** Soma segura de centavos. */
export function sum(values: readonly Cents[]): Cents {
  let total = 0;
  for (const v of values) total += v;
  return total;
}

/** Multiplica centavos por uma quantidade inteira. */
export function times(cents: Cents, quantidade: number): Cents {
  return cents * Math.trunc(quantidade);
}

/**
 * Lê um valor digitado pelo cliente ("150", "150,00", "R$ 150,00") em centavos.
 * Devolve null quando não dá para interpretar ─ usado no campo "troco para".
 */
export function parseBRL(input: string): Cents | null {
  const limpo = input
    .replace(/[R$\s\u00A0]/gi, '')
    .replace(/\./g, '')
    .replace(',', '.');
  if (limpo === '' || !/^\d*\.?\d*$/.test(limpo)) return null;
  const n = Number(limpo);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}
