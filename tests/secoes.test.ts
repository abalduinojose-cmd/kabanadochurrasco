import test from 'node:test';
import assert from 'node:assert/strict';
import { MENU } from '../src/data/cardapio.ts';
import { SECOES } from '../src/data/secoes.ts';
import { destaquesDoCardapio, montarCardapio } from '../src/lib/cardapio.ts';

test('toda categoria com itens do menu.ts aparece numa seção, uma vez só', () => {
  const citadas = SECOES.flatMap((s) => s.categorias.map((c) => c.categoriaId));
  assert.equal(new Set(citadas).size, citadas.length, 'categoria repetida em data/secoes.ts');
  for (const c of MENU.filter((m) => m.items.length > 0)) {
    assert.ok(citadas.includes(c.id), `categoria ${c.id} fora de data/secoes.ts`);
  }
});

test('o cardápio montado tem todos os itens do menu, sem "Mais itens"', () => {
  const secoes = montarCardapio();
  const total = secoes.reduce((t, s) => t + s.total, 0);
  const noMenu = MENU.reduce((t, c) => t + c.items.length, 0);
  assert.equal(total, noMenu);
  assert.ok(!secoes.some((s) => s.id === 'mais-itens'));
});

test('destaques só trazem pratos: nenhuma bebida nem doce', () => {
  const vitrine = new Set(SECOES.filter((s) => !s.destaques).flatMap((s) => s.categorias.map((c) => c.categoriaId)));
  for (const d of destaquesDoCardapio()) assert.ok(!vitrine.has(d.categoriaId), `${d.item.id} não devia estar nos destaques`);
});
