import test from 'node:test';
import assert from 'node:assert/strict';
import { avaliarCupom, condicoesDoCupom, cuponsNaVitrine, normalizarCodigo, rotuloDesconto } from '../src/lib/cupom.ts';
import type { CupomDaCasa } from '../src/data/cupons.ts';

const LISTA: readonly CupomDaCasa[] = [
  { codigo: 'DEZ', tipo: 'percentual', valor: 10, titulo: '10%', minimo: 50, vitrine: true, ativo: true },
  { codigo: 'CINCO', tipo: 'valor', valor: 5, titulo: 'R$ 5', ativo: true },
  { codigo: 'FRETE', tipo: 'entrega', valor: 0, titulo: 'Entrega grátis', validoAte: '2026-10-31', vitrine: true, ativo: true },
  { codigo: 'VELHO', tipo: 'valor', valor: 5, titulo: 'R$ 5', ativo: false },
];

const AGORA = new Date('2026-10-27T20:00:00-03:00');
const ctx = (subtotalCents: number, extra: Partial<{ taxaCents: number | null; modo: 'entrega' | 'retirada'; agora: Date }> = {}) => ({
  subtotalCents,
  taxaCents: 700,
  modo: 'entrega' as const,
  agora: AGORA,
  ...extra,
});

test('o codigo vale com espaco, acento e minuscula', () => {
  assert.equal(normalizarCodigo(' de z '), 'DEZ');
  const r = avaliarCupom('dez', ctx(6000), LISTA);
  assert.equal(r.status, 'valido');
});

test('percentual desconta so dos itens e arredonda no centavo', () => {
  const r = avaliarCupom('DEZ', ctx(5990), LISTA);
  assert.deepEqual(r.status === 'valido' && r.descontoCents, 599);
});

test('abaixo do minimo o cupom fica pendente e diz quanto falta', () => {
  const r = avaliarCupom('DEZ', ctx(4200), LISTA);
  assert.equal(r.status, 'pendente');
  assert.match(r.status === 'pendente' ? r.motivo : '', /Faltam R\$\s8,00/);
});

test('valor fixo nunca passa do subtotal', () => {
  const r = avaliarCupom('CINCO', ctx(300), LISTA);
  assert.deepEqual(r.status === 'valido' && r.descontoCents, 300);
});

test('entrega gratis tira a taxa e nao vale na retirada', () => {
  const entrega = avaliarCupom('FRETE', ctx(2000), LISTA);
  assert.deepEqual(entrega.status === 'valido' && entrega.descontoCents, 700);
  assert.equal(avaliarCupom('FRETE', ctx(2000, { modo: 'retirada', taxaCents: 0 }), LISTA).status, 'pendente');
});

test('vencido, desligado ou inexistente e invalido', () => {
  const depois = new Date('2026-11-01T10:00:00-03:00');
  assert.equal(avaliarCupom('FRETE', ctx(2000, { agora: depois }), LISTA).status, 'invalido');
  assert.equal(avaliarCupom('VELHO', ctx(2000), LISTA).status, 'invalido');
  assert.equal(avaliarCupom('NADA', ctx(2000), LISTA).status, 'invalido');
  assert.equal(avaliarCupom('   ', ctx(2000), LISTA).status, 'invalido');
});

test('o ultimo dia ainda vale no horario de Brasilia', () => {
  const ultimaHora = new Date('2026-10-31T23:30:00-03:00');
  assert.equal(avaliarCupom('FRETE', ctx(2000, { agora: ultimaHora }), LISTA).status, 'valido');
});

test('a vitrine mostra so os ativos marcados e esconde os vencidos', () => {
  assert.deepEqual(
    cuponsNaVitrine(AGORA, LISTA).map((c) => c.codigo),
    ['DEZ', 'FRETE'],
  );
  assert.deepEqual(
    cuponsNaVitrine(new Date('2026-12-01T12:00:00-03:00'), LISTA).map((c) => c.codigo),
    ['DEZ'],
  );
});

test('selo e condicoes para o cartao do cupom', () => {
  assert.equal(rotuloDesconto(LISTA[0]!), '10%');
  assert.equal(rotuloDesconto(LISTA[1]!).replace(/\s/g, ' '), 'R$ 5');
  assert.equal(condicoesDoCupom(LISTA[2]!), 'Sem pedido mínimo • só na entrega • até 31/10');
});
