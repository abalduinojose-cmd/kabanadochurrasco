import test from 'node:test';
import assert from 'node:assert/strict';
import { mensagemPedidoMesa, mensagemPedirConta, rotuloMesa, urlWhatsAppLoja } from '../src/lib/mensagem-mesa.ts';
import type { LinhaCarrinho } from '../src/types/carrinho.ts';

const linha: LinhaCarrinho = {
  uid: 'costela#ponto:ao-ponto#',
  itemId: 'costela-burguer',
  categoriaId: 'especiais',
  nome: 'Costela Burguer',
  precoBaseCents: 2990,
  quantidade: 2,
  opcoes: [
    { grupoId: 'pontoDaCarne', grupoNome: 'Ponto da carne', opcaoId: 'ao-ponto', nome: 'Ao ponto', precoCents: 0 },
    { grupoId: 'adicionais', grupoNome: 'Adicionais', opcaoId: 'bacon', nome: 'Bacon', precoCents: 400 },
  ],
  observacao: 'sem cebola',
  alcoolico: false,
};

test('mesa numérica vira MESA com dois dígitos; nome livre vai em caixa alta', () => {
  assert.equal(rotuloMesa('5'), 'MESA 05');
  assert.equal(rotuloMesa('12'), 'MESA 12');
  assert.equal(rotuloMesa('Varanda'), 'VARANDA');
});

test('a mensagem do pedido traz mesa, atendente, itens com opções e o total', () => {
  const m = mensagemPedidoMesa({
    mesa: '5',
    garcom: 'Paulo',
    nome: 'Ana',
    numero: 2,
    linhas: [linha],
    totalCents: 6780,
    contaAnteriorCents: 5000,
    agora: new Date('2026-10-27T23:15:00Z'),
  });
  assert.match(m, /^\*PEDIDO NA MESA 05\*/);
  assert.match(m, /Pedido 2 da mesa/);
  assert.match(m, /Atendente: Paulo/);
  assert.match(m, /Cliente: Ana/);
  assert.match(m, /2x Costela Burguer \.+ R\$ 67,80/);
  assert.match(m, /Ponto: Ao ponto/);
  assert.match(m, /\+ Bacon \(R\$ 4,00\)/);
  assert.match(m, /Obs: sem cebola/);
  assert.match(m, /TOTAL DESTE PEDIDO: R\$ 67,80/);
  assert.match(m, /Conta da mesa com este pedido: R\$ 117,80/);
  assert.doesNotMatch(m, /—/, 'sem travessão no texto novo');
});

test('pedir a conta soma os pedidos e o link vai para o WhatsApp da loja', () => {
  const m = mensagemPedirConta('7', '', 3, 15990);
  assert.match(m, /MESA 07 pediu a conta/);
  assert.match(m, /3 pedidos pelo tablet: R\$ 159,90/);
  assert.match(urlWhatsAppLoja('oi'), /^https:\/\/wa\.me\/\d+\?text=oi$/);
});
