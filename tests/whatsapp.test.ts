import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOrderMessage, buildWhatsAppUrl } from '../src/lib/whatsapp.ts';
import type { Pedido } from '../src/types/pedido.ts';
import type { LinhaCarrinho } from '../src/types/carrinho.ts';

/**
 * O pedido de exemplo da seção 7 do briefing, reconstruído item a item.
 *
 * Kabana 2.0 custa 26,90 de base; com o bacon de 3,00 a unidade fecha em
 * 29,90 e a linha de 2 unidades em 59,80 ─ que é o valor impresso no exemplo.
 * É assim que o adicional "entra no preço da linha e aparece discriminado".
 */
const linha = (p: Partial<LinhaCarrinho> & Pick<LinhaCarrinho, 'nome' | 'precoBaseCents'>) =>
  ({
    uid: p.nome,
    itemId: p.nome,
    categoriaId: 'x',
    quantidade: 1,
    opcoes: [],
    alcoolico: false,
    ...p,
  }) as LinhaCarrinho;

const PEDIDO: Pedido = {
  id: 'KB-260829-014',
  // 29/08/2026 às 20:14 em São Paulo (UTC-3)
  criadoEm: Date.parse('2026-08-29T23:14:00Z'),
  cliente: { nome: 'João da Silva', telefone: '(24) 99999-0000' },
  linhas: [
    linha({
      nome: 'Kabana 2.0',
      precoBaseCents: 2690,
      quantidade: 2,
      opcoes: [
        {
          grupoId: 'pontoDaCarne',
          grupoNome: 'Ponto da carne',
          opcaoId: 'ao-ponto',
          nome: 'Ao ponto',
          precoCents: 0,
        },
        {
          grupoId: 'adicionais',
          grupoNome: 'Adicionais',
          opcaoId: 'bacon',
          nome: 'Bacon',
          precoCents: 300,
        },
      ],
      observacao: 'sem cebola',
    }),
    linha({ nome: 'Espetinho Bovino', precoBaseCents: 1200 }),
    linha({ nome: 'Espetinho Frango', precoBaseCents: 1000, quantidade: 3 }),
    linha({ nome: 'Coca-Cola 2L', precoBaseCents: 1700 }),
  ],
  modo: 'entrega',
  entrega: {
    bairro: 'Aterrado',
    rua: 'Rua das Palmeiras',
    numero: '123',
    complemento: 'apto 302',
    referencia: 'ao lado da padaria',
  },
  subtotalCents: 11880,
  taxaEntregaCents: 1000,
  totalCents: 12880,
  pagamento: {
    id: 'dinheiro',
    label: 'Dinheiro',
    trocoParaCents: 15000,
    trocoCents: 2120,
  },
  temAlcool: true,
  maiorDeIdade: true,
};

const ESPERADO = [
  '*NOVO PEDIDO — KABANA DO CHURRASCO*',
  '#KB-260829-014 · 29/08 às 20:14',
  '*CLIENTE*',
  'João da Silva',
  '(24) 99999-0000',
  '*ITENS*',
  '────────────────────',
  '2x Kabana 2.0 ......... R$ 59,80',
  '   • Ponto: Ao ponto',
  '   • + Bacon (R$ 3,00)',
  '   • Obs: sem cebola',
  '1x Espetinho Bovino ... R$ 12,00',
  '3x Espetinho Frango ... R$ 30,00',
  '1x Coca-Cola 2L ....... R$ 17,00',
  '────────────────────',
  'Subtotal: R$ 118,80',
  'Entrega — Aterrado: R$ 10,00',
  '*TOTAL: R$ 128,80*',
  '*ENTREGA*',
  'Rua das Palmeiras, 123 — Aterrado',
  'Compl.: apto 302',
  'Ref.: ao lado da padaria',
  '*PAGAMENTO*',
  'Dinheiro — troco para R$ 150,00',
  '_(levar R$ 21,20 de troco)_',
  'Cliente confirmou ser maior de 18 anos.',
  '_Pedido gerado pelo app Kabana_ 🔥',
].join('\n');

test('a mensagem bate caractere a caractere com a secao 7', () => {
  assert.equal(buildOrderMessage(PEDIDO), ESPERADO);
});

test('a coluna de precos fecha sempre na mesma posicao', () => {
  const itens = buildOrderMessage(PEDIDO)
    .split('\n')
    .filter((l) => /^\d+x /.test(l));
  assert.equal(itens.length, 4);
  for (const l of itens) assert.equal(l.length, 32, `coluna torta: "${l}"`);
});

test('a soma das linhas bate com o subtotal impresso', () => {
  // Mesma conferência que o atendente faria de olho.
  const valores = buildOrderMessage(PEDIDO)
    .split('\n')
    .filter((l) => /^\d+x /.test(l))
    .map((l) => Number(l.slice(-8).replace('R$ ', '').replace('.', '').replace(',', '')));
  assert.equal(
    valores.reduce((a, b) => a + b, 0),
    PEDIDO.subtotalCents,
  );
  assert.equal(PEDIDO.subtotalCents + PEDIDO.taxaEntregaCents, PEDIDO.totalCents);
});

test('retirada troca o bloco de entrega e some com a taxa', () => {
  const msg = buildOrderMessage({
    ...PEDIDO,
    modo: 'retirada',
    entrega: undefined,
    taxaEntregaCents: 0,
    totalCents: 11880,
  });
  assert.ok(msg.includes('*RETIRADA NO LOCAL*'));
  assert.ok(!msg.includes('*ENTREGA*'));
  assert.ok(!msg.includes('Entrega —'));
  assert.ok(msg.includes('*TOTAL: R$ 118,80*'));
});

test('cupom aplicado sai entre a entrega e o total, e sem cupom nao ha linha', () => {
  const msg = buildOrderMessage({ ...PEDIDO, cupom: 'KABANA10', descontoCents: 1188, totalCents: PEDIDO.totalCents - 1188 });
  const linhas = msg.split('\n');
  const iCupom = linhas.findIndex((l) => l.startsWith('Cupom KABANA10: -R$'));
  assert.ok(iCupom > linhas.findIndex((l) => l.startsWith('Entrega —')));
  assert.ok(linhas[iCupom + 1]?.startsWith('*TOTAL:'));
  assert.ok(!buildOrderMessage(PEDIDO).includes('Cupom'));
});

test('sem alcool no carrinho a linha do +18 nao aparece', () => {
  const msg = buildOrderMessage({ ...PEDIDO, temAlcool: false, maiorDeIdade: false });
  assert.ok(!msg.includes('maior de 18 anos'));
});

test('pagamento sem troco nao imprime a linha do troco', () => {
  const msg = buildOrderMessage({
    ...PEDIDO,
    pagamento: { id: 'pix', label: 'Pix' },
  });
  assert.ok(msg.includes('\n*PAGAMENTO*\nPix\n'));
  assert.ok(!msg.includes('troco'));
});

test('a URL do WhatsApp aponta para o numero da loja e vai codificada', () => {
  const url = buildWhatsAppUrl(PEDIDO);
  assert.ok(url.startsWith('https://wa.me/5524992811184?text='));
  const texto = decodeURIComponent(url.split('?text=')[1] ?? '');
  assert.equal(texto, ESPERADO);
});

test('nome comprido nao quebra a coluna, so encurta a conducao', () => {
  const msg = buildOrderMessage({
    ...PEDIDO,
    linhas: [
      linha({
        nome: 'Tábua de picanha com fritas e farofa da casa para dividir',
        precoBaseCents: 12900,
      }),
    ],
  });
  const l = msg.split('\n').find((x) => x.startsWith('1x Tábua'));
  assert.ok(l?.includes(' .. R$ 129,00'), `condução mínima não aplicada: "${l}"`);
});
