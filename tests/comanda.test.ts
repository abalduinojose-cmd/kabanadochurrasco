import test from 'node:test';
import assert from 'node:assert/strict';
import { resumoDaComanda, useComanda } from '../src/store/comanda.ts';
import type { LinhaCarrinho } from '../src/types/carrinho.ts';

const linha: Omit<LinhaCarrinho, 'uid'> = { itemId: 'x-frango-bacon', categoriaId: 'especiais', nome: 'X-Frango Bacon', precoBaseCents: 2490, quantidade: 2, opcoes: [], alcoolico: false };

test('o tablet guarda a mesa ao voltar às mesas e retoma de onde parou', () => {
  const c = useComanda.getState();
  c.abrirMesa('3', 'Paulo');
  useComanda.getState().adicionar(linha);
  useComanda.getState().registrarEnvio('garcom');
  useComanda.getState().adicionar({ ...linha, quantidade: 1 });
  useComanda.getState().voltarAsMesas();

  let s = useComanda.getState();
  assert.equal(s.mesa, null);
  assert.deepEqual(Object.keys(s.emAtendimento), ['3']);
  assert.deepEqual(resumoDaComanda(s.emAtendimento['3']!), { itensNoPedido: 1, pedidosEnviados: 1, contaCents: 4980 });

  // Outra mesa abre sem misturar com a 3.
  s.abrirMesa('7', 'Ana');
  s = useComanda.getState();
  assert.equal(s.mesa, '7');
  assert.equal(s.linhas.length, 0);
  assert.deepEqual(Object.keys(s.emAtendimento), ['3']);

  // Retomar a 3 guarda a 7 e traz tudo da 3, com o atendente dela.
  s.abrirMesa('3', 'Outro');
  s = useComanda.getState();
  assert.equal(s.garcom, 'Paulo');
  assert.equal(s.enviados.length, 1);
  assert.equal(s.linhas[0]?.quantidade, 1);
  assert.deepEqual(Object.keys(s.emAtendimento), ['7']);

  // Encerrar limpa só a mesa da tela.
  s.encerrarMesa();
  s = useComanda.getState();
  assert.equal(s.mesa, null);
  assert.deepEqual(Object.keys(s.emAtendimento), ['7']);
});
