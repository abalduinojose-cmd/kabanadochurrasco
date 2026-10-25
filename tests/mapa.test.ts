import test from 'node:test';
import assert from 'node:assert/strict';
import { coordenadaDaPeca, mosaico, urlDaPeca } from '../src/lib/mapa.ts';

test('a origem (0,0) cai no meio do mundo em qualquer zoom', () => {
  assert.deepEqual(coordenadaDaPeca(0, 0, 1), { x: 1, y: 1 });
  const z5 = coordenadaDaPeca(0, 0, 5);
  assert.equal(z5.x, 16);
  assert.equal(z5.y, 16);
});

test('longitude -180 e o limite norte caem na peca 0,0', () => {
  const c = coordenadaDaPeca(85.0511, -180, 1);
  assert.equal(Math.floor(c.x), 0);
  assert.equal(Math.floor(c.y), 0);
});

test('Petropolis (Posse) fica no hemisferio sul e a oeste de Greenwich', () => {
  // y cresce para o sul, x cresce para o leste
  const c = coordenadaDaPeca(-22.22, -43.05, 16);
  const centro = coordenadaDaPeca(0, 0, 16);
  assert.ok(c.y > centro.y, 'deveria estar abaixo do equador');
  assert.ok(c.x < centro.x, 'deveria estar a oeste');
});

test('o mosaico 3x2 tem seis pecas contiguas e o pino dentro', () => {
  const m = mosaico(-22.22, -43.05, 16);
  assert.equal(m.pecas.length, 6);
  assert.equal(m.largura, 768);
  assert.equal(m.altura, 512);
  const xs = [...new Set(m.pecas.map((p) => p.x))].sort((a, b) => a - b);
  assert.equal(xs[2]! - xs[0]!, 2);
  assert.ok(m.pino.x > 0 && m.pino.x < m.largura);
  assert.ok(m.pino.y > 0 && m.pino.y < m.altura);
  assert.equal(urlDaPeca(1, 2, 3), 'https://tile.openstreetmap.org/3/1/2.png');
});
