import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toCents,
  toReais,
  formatBRL,
  formatBRLPlain,
  sum,
  times,
  parseBRL,
} from '../src/lib/money.ts';

test('toCents converte reais em centavos inteiros', () => {
  assert.equal(toCents(12.34), 1234);
  assert.equal(toCents(17), 1700);
  assert.equal(toCents(0.1), 10);
  assert.equal(toCents(0), 0);
  assert.equal(toCents(59.8), 5980);
});

test('toCents nao herda o erro de ponto flutuante', () => {
  // 29.9 * 100 = 2989.9999999999995 em float; 3.3 * 100 = 330.00000000000006
  assert.equal(toCents(29.9), 2990);
  assert.equal(toCents(3.3), 330);
  assert.equal(toCents(8.7), 870);
  assert.ok(Number.isInteger(toCents(12.35)));
});

test('toCents recusa preco com mais de duas casas', () => {
  // arredondar calado esconderia um erro de digitacao no cardapio
  assert.throws(() => toCents(1.005), RangeError);
  assert.throws(() => toCents(29.905), RangeError);
  assert.throws(() => toCents(Number.NaN), TypeError);
});

test('somar em centavos nao acumula erro', () => {
  const linhas = [toCents(0.1), toCents(0.2)];
  assert.equal(sum(linhas), 30);
  assert.equal(toReais(sum(linhas)), 0.3);
  // o mesmo em float daria 0.30000000000000004
  assert.notEqual(0.1 + 0.2, 0.3);
});

test('total do pedido de exemplo da secao 7 fecha exato', () => {
  const itens = [
    times(toCents(29.9), 2), // 2x Kabana 2.0 = 59,80
    times(toCents(12.0), 1),
    times(toCents(10.0), 3),
    times(toCents(17.0), 1),
  ];
  const subtotal = sum(itens);
  assert.equal(subtotal, 11880);
  const total = subtotal + toCents(10.0);
  assert.equal(total, 12880);
  assert.equal(formatBRLPlain(total), 'R$ 128,80');
});

test('formatBRL usa o padrao pt-BR', () => {
  assert.equal(formatBRL(12880).replace(/\u00A0/g, ' '), 'R$ 128,80');
  assert.equal(formatBRLPlain(0), 'R$ 0,00');
  assert.equal(formatBRLPlain(5), 'R$ 0,05');
  assert.equal(formatBRLPlain(100000), 'R$ 1.000,00');
});

test('formatBRLPlain troca o espaco nao separavel', () => {
  assert.ok(formatBRL(1234).includes('\u00A0'));
  assert.ok(!formatBRLPlain(1234).includes('\u00A0'));
});

test('parseBRL le o que o cliente digita no campo de troco', () => {
  assert.equal(parseBRL('150'), 15000);
  assert.equal(parseBRL('150,00'), 15000);
  assert.equal(parseBRL('R$ 150,00'), 15000);
  assert.equal(parseBRL('1.234,56'), 123456);
  assert.equal(parseBRL(''), null);
  assert.equal(parseBRL('abc'), null);
});

test('times so aceita quantidade inteira', () => {
  assert.equal(times(1200, 3), 3600);
  assert.equal(times(1200, 0), 0);
});
