import test from 'node:test';
import assert from 'node:assert/strict';
import { bloqueiosDoPedido, avisosDoCarrinho, REGRAS_DA_LOJA } from '../src/lib/regras-pedido.ts';
import { taxaEntrega, trocoPara, faltaParaMinimo } from '../src/lib/delivery.ts';
import { nextOpening } from '../src/lib/store-hours.ts';
import { toCents } from '../src/lib/money.ts';
import { LOJA } from '../src/data/loja.ts';

/**
 * Regras apertadas para exercitar a lógica. A loja de verdade (loja.ts) não
 * tem pedido mínimo nem mínimo de espeto hoje; a lógica continua testada aqui.
 */
const REGRAS = { pedidoMinimoCents: toCents(25), minEspetinhos: 3 };
const SEM_MINIMOS = { pedidoMinimoCents: 0, minEspetinhos: 1 };
const zona = LOJA.fretes[0];

/** Pedido saudável, do qual cada teste estraga um detalhe de cada vez. */
const base = {
  subtotal: toCents(50),
  unidadesDeEspeto: 0,
  itens: 2,
  lojaAberta: true,
  proximaAbertura: null,
  modo: 'entrega' as const,
  bairro: zona.bairro,
};

const ids = (e: Parameters<typeof bloqueiosDoPedido>[0], regras = REGRAS) =>
  bloqueiosDoPedido(e, regras).map((b) => b.id);

test('pedido saudavel nao tem bloqueio', () => {
  assert.deepEqual(ids(base), []);
});

test('carrinho vazio bloqueia e nem checa o resto', () => {
  assert.deepEqual(ids({ ...base, itens: 0 }), ['vazio']);
});

test('abaixo do pedido minimo bloqueia dizendo quanto falta', () => {
  const b = bloqueiosDoPedido({ ...base, subtotal: toCents(18) }, REGRAS);
  const minimo = b.find((x) => x.id === 'pedido-minimo');
  assert.ok(minimo, 'não bloqueou abaixo do mínimo');
  // R$ 25,00 de mínimo menos R$ 18,00 = faltam R$ 7,00
  assert.ok(minimo.mensagem.includes('7,00'), `mensagem sem o valor que falta: "${minimo.mensagem}"`);
  assert.equal(faltaParaMinimo(toCents(18), REGRAS.pedidoMinimoCents), toCents(7));
  // E oferece um caminho de volta, não só o "não".
  assert.equal(minimo.atalho?.href, '/');
});

test('sem pedido minimo configurado, nenhum valor bloqueia', () => {
  assert.deepEqual(ids({ ...base, subtotal: toCents(1) }, SEM_MINIMOS), []);
  assert.equal(faltaParaMinimo(toCents(1), 0), 0);
});

test('espeto abaixo do minimo bloqueia com atalho para completar', () => {
  const b = bloqueiosDoPedido({ ...base, unidadesDeEspeto: REGRAS.minEspetinhos - 1 }, REGRAS);
  const espeto = b.find((x) => x.id === 'minimo-espetinhos');
  assert.ok(espeto, 'não bloqueou espeto abaixo do mínimo');
  assert.ok(espeto.mensagem.includes(String(REGRAS.minEspetinhos)));
  assert.ok(espeto.atalho, 'bloqueio sem atalho para resolver');
});

test('espeto no minimo exato passa', () => {
  assert.deepEqual(ids({ ...base, unidadesDeEspeto: REGRAS.minEspetinhos }), []);
});

test('minimo de espeto 1 desliga a regra', () => {
  assert.deepEqual(ids({ ...base, unidadesDeEspeto: 1 }, SEM_MINIMOS), []);
});

test('pedido sem espeto nenhum nao cai na regra do espeto', () => {
  assert.deepEqual(ids({ ...base, unidadesDeEspeto: 0 }), []);
});

test('loja fechada bloqueia e informa o proximo horario', () => {
  // segunda 31/08/2026 às 20:00 em São Paulo: dia de folga na grade real
  const proxima = nextOpening(new Date('2026-08-31T23:00:00Z'));
  assert.ok(proxima, 'a loja abre em algum dia da semana');
  const b = bloqueiosDoPedido({ ...base, lojaAberta: false, proximaAbertura: proxima });
  const fechada = b.find((x) => x.id === 'loja-fechada');
  assert.ok(fechada, 'não bloqueou com a loja fechada');
  assert.ok(fechada.mensagem.includes(proxima.label), `não informou quando abre: "${fechada.mensagem}"`);
});

test('entrega sem bairro bloqueia', () => {
  assert.ok(ids({ ...base, bairro: null }).includes('bairro'));
});

test('retirada nao exige bairro nem cobra taxa', () => {
  assert.deepEqual(ids({ ...base, modo: 'retirada', bairro: null }), []);
  assert.equal(taxaEntrega('retirada', null), 0);
});

test('bairro fora da area devolve null, nunca frete gratis', () => {
  assert.equal(taxaEntrega('entrega', 'Bairro Que Nao Existe'), null);
  assert.equal(taxaEntrega('entrega', null), null);
  assert.equal(taxaEntrega('entrega', zona.bairro), toCents(zona.taxa));
});

test('troco so existe quando o valor cobre o total', () => {
  const total = toCents(39.9);
  assert.equal(trocoPara(total, toCents(100)), toCents(60.1));
  assert.equal(trocoPara(total, toCents(39.9)), 0);
  assert.equal(trocoPara(total, toCents(20)), null);
  assert.equal(trocoPara(total, null), null);
});

test('varios problemas ao mesmo tempo aparecem todos', () => {
  const ruim = {
    ...base,
    subtotal: toCents(10),
    unidadesDeEspeto: 1,
    lojaAberta: false,
    proximaAbertura: null,
    bairro: null,
  };
  // O cliente vê tudo o que precisa resolver de uma vez, não um por vez.
  assert.deepEqual(ids(ruim).sort(), ['bairro', 'loja-fechada', 'minimo-espetinhos', 'pedido-minimo']);
});

test('as regras padrao vem de loja.ts', () => {
  assert.equal(REGRAS_DA_LOJA.pedidoMinimoCents, toCents(LOJA.pedidoMinimo));
  assert.equal(REGRAS_DA_LOJA.minEspetinhos, LOJA.minEspetinhos);
});

test('os avisos do carrinho usam as mesmas regras do checkout', () => {
  const avisos = avisosDoCarrinho(toCents(10), 1, REGRAS).map((a) => a.id);
  assert.deepEqual(avisos.sort(), ['minimo-espetinhos', 'pedido-minimo']);
});
