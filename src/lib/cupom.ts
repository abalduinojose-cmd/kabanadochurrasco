import { CUPONS, type CupomDaCasa } from '@/data/cupons';
import { formatBRL, toCents, type Cents } from './money';
import type { ModoEntrega } from './delivery';

/**
 * A regra do cupom: acha o código, confere validade e mínimo e calcula o
 * desconto sobre o pedido de agora. Função pura (a lista e o relógio entram
 * por parâmetro), então os testes não dependem dos cupons reais.
 *
 * Três respostas: `valido` (desconta), `pendente` (o cupom existe mas falta
 * uma condição, como o mínimo; fica guardado e passa a valer sozinho quando o
 * pedido chega lá) e `invalido` (não existe ou venceu).
 */

export type ContextoCupom = {
  readonly subtotalCents: Cents;
  /** null = ainda sem bairro, taxa desconhecida. */
  readonly taxaCents: Cents | null;
  readonly modo: ModoEntrega;
  readonly agora: Date;
};

export type Avaliacao =
  | { readonly status: 'valido'; readonly cupom: CupomDaCasa; readonly descontoCents: Cents }
  | { readonly status: 'pendente'; readonly cupom: CupomDaCasa; readonly motivo: string }
  | { readonly status: 'invalido'; readonly motivo: string };

/** "  kabana 10 " → "KABANA10" (sem espaço, sem acento, maiúsculo). */
export function normalizarCodigo(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '')
    .toUpperCase();
}

/** A data de hoje em Brasília, 'AAAA-MM-DD', para comparar com `validoAte`. */
function hojeEmBrasilia(agora: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(agora);
}

const diaMes = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

export function venceu(cupom: CupomDaCasa, agora: Date): boolean {
  return cupom.validoAte !== undefined && hojeEmBrasilia(agora) > cupom.validoAte;
}

export function acharCupom(codigo: string, lista: readonly CupomDaCasa[] = CUPONS): CupomDaCasa | undefined {
  const alvo = normalizarCodigo(codigo);
  return lista.find((c) => c.ativo && normalizarCodigo(c.codigo) === alvo);
}

/** Os cupons sugeridos no checkout. Sem relógio (servidor), não filtra a validade. */
export function cuponsNaVitrine(agora: Date | null, lista: readonly CupomDaCasa[] = CUPONS): readonly CupomDaCasa[] {
  return lista.filter((c) => c.ativo && c.vitrine && (agora === null || !venceu(c, agora)));
}

/** O selo do canhoto: "10%", "R$ 5", "Grátis". */
export function rotuloDesconto(cupom: CupomDaCasa): string {
  if (cupom.tipo === 'percentual') return `${cupom.valor}%`;
  if (cupom.tipo === 'valor') return formatBRL(toCents(cupom.valor)).replace(',00', '');
  return 'Grátis';
}

/** "Pedidos a partir de R$ 50,00 • até 30/11", ou "Sem pedido mínimo". */
export function condicoesDoCupom(cupom: CupomDaCasa): string {
  const partes = [cupom.minimo !== undefined ? `Pedidos a partir de ${formatBRL(toCents(cupom.minimo))}` : 'Sem pedido mínimo'];
  if (cupom.tipo === 'entrega') partes.push('só na entrega');
  if (cupom.validoAte) partes.push(`até ${diaMes(cupom.validoAte)}`);
  return partes.join(' • ');
}

export function avaliarCupom(codigo: string, ctx: ContextoCupom, lista: readonly CupomDaCasa[] = CUPONS): Avaliacao {
  if (!normalizarCodigo(codigo)) return { status: 'invalido', motivo: 'Digite o código do cupom.' };

  const cupom = acharCupom(codigo, lista);
  if (!cupom) return { status: 'invalido', motivo: 'Cupom não encontrado. Confira o código.' };
  if (cupom.validoAte && venceu(cupom, ctx.agora)) return { status: 'invalido', motivo: `Esse cupom venceu em ${diaMes(cupom.validoAte)}.` };

  if (cupom.minimo !== undefined) {
    const minimo = toCents(cupom.minimo);
    if (ctx.subtotalCents < minimo) {
      return {
        status: 'pendente',
        cupom,
        motivo: `Vale a partir de ${formatBRL(minimo)} em itens. Faltam ${formatBRL(minimo - ctx.subtotalCents)}.`,
      };
    }
  }

  if (cupom.tipo === 'entrega') {
    if (ctx.modo === 'retirada') return { status: 'pendente', cupom, motivo: 'É de entrega grátis: vale quando o pedido é para entregar.' };
    return { status: 'valido', cupom, descontoCents: ctx.taxaCents ?? 0 };
  }

  const bruto = cupom.tipo === 'percentual' ? Math.round((ctx.subtotalCents * cupom.valor) / 100) : toCents(cupom.valor);
  return { status: 'valido', cupom, descontoCents: Math.min(bruto, ctx.subtotalCents) };
}
