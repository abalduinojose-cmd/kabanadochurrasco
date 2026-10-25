import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizar, indexar, buscar } from '../src/lib/busca.ts';
import type { MenuCategoria } from '../src/types/menu.ts';

const MENU: readonly MenuCategoria[] = [
  {
    id: 'espetinhos',
    nome: 'Espetinhos',
    items: [
      { id: 'a', nome: 'Linguiça', preco: 10, available: true },
      { id: 'b', nome: 'Coração', preco: 12, available: false },
    ],
  },
  {
    id: 'burgers',
    nome: 'Burgers',
    items: [
      {
        id: 'c',
        nome: 'Kabana 2.0',
        descricao: 'Pão brioche, blend 180g, cheddar, bacon e maionese da casa.',
        preco: 29.9,
        available: true,
      },
    ],
  },
  {
    id: 'bebidas',
    nome: 'Bebidas',
    items: [{ id: 'd', nome: 'Coca-Cola 2L', preco: 17, available: true }],
  },
];

const indice = indexar(MENU);
const ids = (t: string) => buscar(indice, t).map((e) => e.item.id);

test('normalizar tira acento e caixa', () => {
  assert.equal(normalizar('  LINGUIÇA  '), 'linguica');
  assert.equal(normalizar('Pão'), 'pao');
});

test('acha sem acento e sem caixa', () => {
  assert.deepEqual(ids('linguica'), ['a']);
  assert.deepEqual(ids('LINGUIÇA'), ['a']);
});

test('acha pela descricao e pela categoria', () => {
  assert.deepEqual(ids('bacon'), ['c']);
  assert.deepEqual(ids('bebida'), ['d']);
});

test('todas as palavras precisam bater', () => {
  assert.deepEqual(ids('kabana bacon'), ['c']);
  assert.deepEqual(ids('kabana coca'), []);
});

test('item esgotado continua aparecendo', () => {
  assert.deepEqual(ids('coracao'), ['b']);
});

test('termo vazio nao devolve nada', () => {
  assert.deepEqual(ids(''), []);
  assert.deepEqual(ids('   '), []);
});
