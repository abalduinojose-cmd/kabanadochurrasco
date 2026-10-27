import test from 'node:test';
import assert from 'node:assert/strict';
import { CADASTRO_VAZIO, clienteDesde, dadosDoCadastro, errosDoPasso1, errosDoPasso2, type CamposCadastro } from '../src/lib/cadastro.ts';

const BAIRROS = ['Posse', 'Areal cedro'] as const;
const campos = (extra: Partial<CamposCadastro>): CamposCadastro => ({ ...CADASTRO_VAZIO, ...extra });

test('passo 1 pede nome e WhatsApp completo', () => {
  assert.deepEqual(errosDoPasso1(campos({})), { nome: 'Escreva seu nome.', telefone: 'Escreva seu WhatsApp.' });
  assert.deepEqual(errosDoPasso1(campos({ nome: 'A', telefone: '(24) 9928' })), {
    nome: 'Escreva seu nome.',
    telefone: 'Confira o WhatsApp: faltou algum número.',
  });
  assert.deepEqual(errosDoPasso1(campos({ nome: 'Ana', telefone: '(24) 99281-1184' })), {});
});

test('passo 2 para entregar pede bairro da lista, rua e número', () => {
  assert.deepEqual(errosDoPasso2(campos({ bairro: 'Centro' }), BAIRROS), {
    bairro: 'Escolha o bairro.',
    rua: 'Escreva a rua.',
    numero: 'Escreva o número.',
  });
  assert.deepEqual(errosDoPasso2(campos({ bairro: 'Posse', rua: 'Estrada da Posse', numero: '10' }), BAIRROS), {});
});

test('quem retira na loja não precisa de endereço', () => {
  assert.deepEqual(errosDoPasso2(campos({ modo: 'retirada' }), BAIRROS), {});
  assert.equal(dadosDoCadastro(campos({ nome: 'Ana', telefone: '(24) 99281-1184', modo: 'retirada', rua: 'sobrou' })).endereco, null);
});

test('os dados saem limpos: espaços cortados e opcionais vazios somem', () => {
  const dados = dadosDoCadastro(
    campos({ nome: '  Ana   Paula ', telefone: '(24) 99281-1184', bairro: 'Posse', rua: ' Rua A ', numero: ' 5 ', complemento: '  ', referencia: 'Perto da padaria' }),
  );
  assert.deepEqual(dados, {
    nome: 'Ana Paula',
    telefone: '(24) 99281-1184',
    endereco: { bairro: 'Posse', rua: 'Rua A', numero: '5', complemento: undefined, referencia: 'Perto da padaria' },
  });
});

test('cliente desde: mês e ano em Brasília', () => {
  assert.equal(clienteDesde('2026-10-27T23:00:00-03:00'), 'Cliente desde outubro de 2026');
  // 1º de novembro às 01h em UTC ainda é 31 de outubro em Brasília.
  assert.equal(clienteDesde('2026-11-01T01:00:00Z'), 'Cliente desde outubro de 2026');
});
