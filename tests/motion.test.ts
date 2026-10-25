import test from 'node:test';
import assert from 'node:assert/strict';
import { springEase, easeParaLinear } from '../src/lib/motion/curvas.ts';
import { atrasosEmCascata, passoSpringPop } from '../src/lib/motion/cascata.ts';
import { indiceDaAba, direcaoDaAba } from '../src/components/shell/abas.ts';

test('mola critica assenta em 1 sem passar do valor', () => {
  const { duration, ease } = springEase({ response: 0.42, dampingFraction: 1 });
  assert.ok(duration > 0.2 && duration < 1.5, `duracao estranha: ${duration}`);
  let max = 0;
  for (let i = 0; i <= 200; i++) max = Math.max(max, ease(i / 200));
  assert.ok(max <= 1.0005, `passou do valor: ${max}`);
  assert.equal(ease(0), 0);
  assert.ok(Math.abs(ease(1) - 1) < 1e-9);
});

test('toque iOS (zeta 0,85) tem sobressalto sentido, nao visto: <= 1,5%', () => {
  const { ease } = springEase({ response: 0.3, dampingFraction: 0.85 });
  let max = 0;
  for (let i = 0; i <= 400; i++) max = Math.max(max, ease(i / 400));
  assert.ok(max > 1.0, 'nao teve sobressalto nenhum');
  assert.ok(max <= 1.015, `sobressalto demais: ${((max - 1) * 100).toFixed(2)}%`);
});

test('a curva vira linear() do CSS com pontas 0 e 1', () => {
  const { ease } = springEase();
  const css = easeParaLinear(ease, 10);
  assert.ok(css.startsWith('linear(0.0000, '));
  assert.ok(css.endsWith('1.0000)'));
  assert.equal(css.split(',').length, 11);
});

test('cascata encolhe os vaos por 0,84 e nao comeca em t=0', () => {
  const a = atrasosEmCascata(4, { inicio: 120, vao: 100, fator: 0.84, teto: 10_000 });
  assert.deepEqual(a, [120, 220, 304, 375]);
  const vaos = [a[1]! - a[0]!, a[2]! - a[1]!, a[3]! - a[2]!];
  assert.ok(vaos[1]! < vaos[0]! && vaos[2]! < vaos[1]!, 'vaos nao encolhem');
});

test('cascata com muitos itens cabe em 500 ms', () => {
  const a = atrasosEmCascata(12);
  const total = a[a.length - 1]! - a[0]!;
  assert.ok(total <= 500, `cascata de ${total} ms`);
  assert.equal(a[0], 120);
});

test('passo do spring-pop aperta com o grupo', () => {
  assert.equal(passoSpringPop(3), 60);
  assert.equal(passoSpringPop(10), 50);
  assert.equal(passoSpringPop(0), 0);
});

test('a troca de aba anda na direcao da aba de destino', () => {
  assert.equal(indiceDaAba('/'), 0);
  assert.equal(indiceDaAba('/busca'), 1);
  assert.equal(indiceDaAba('/pedidos'), 2);
  assert.equal(indiceDaAba('/perfil'), 3);
  assert.equal(indiceDaAba('/checkout'), -1);
  assert.equal(direcaoDaAba(0, 3), 'dir');
  assert.equal(direcaoDaAba(3, 0), 'esq');
  assert.equal(direcaoDaAba(1, 1), null);
  assert.equal(direcaoDaAba(-1, 1), null);
});
