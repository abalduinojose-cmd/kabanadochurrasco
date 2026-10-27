/**
 * A mensagem que chega no celular do atendente.
 *
 * Ele lê isso em pé, com o restaurante cheio. Duas decisões vêm daí:
 *
 * 1. Os preços são alinhados à direita numa coluna fixa, preenchida com
 *    pontos ─ a mesma condução do cardápio impresso, agora em texto puro. O
 *    olho desce a coluna dos valores sem procurar.
 * 2. O troco a levar já vem calculado. Ninguém faz conta de cabeça no balcão.
 *
 * O formato segue a seção 7 do briefing ao pé da letra, inclusive os
 * travessões, que ali são especificação e não estilo de texto.
 */

import { LOJA } from '@/data/loja';
import { formatBRLPlain } from './money';
import { carimboDeHora } from './order-id';
import { precoLinha } from '@/types/carrinho';
import type { LinhaCarrinho } from '@/types/carrinho';
import type { Pedido } from '@/types/pedido';

/** Largura da coluna de itens. O preço fecha exatamente nesta coluna. */
const COLUNA = 32;
const REGUA = '─'.repeat(20);

/** Grupos com rótulo mais curto na mensagem do que na tela. */
const ROTULO_CURTO: Readonly<Record<string, string>> = {
  pontoDaCarne: 'Ponto',
};

/**
 * `2x Kabana 2.0 ......... R$ 59,80`
 * Rótulo, pontos de condução e preço fechando na coluna 32.
 */
function linhaDeItem(rotulo: string, preco: string): string {
  const pontos = COLUNA - rotulo.length - preco.length - 2;
  // Nome comprido demais para caber: uma condução mínima em vez de coluna torta.
  return `${rotulo} ${'.'.repeat(Math.max(pontos, 2))} ${preco}`;
}

export function blocoDoItem(linha: LinhaCarrinho): readonly string[] {
  const linhas = [
    linhaDeItem(`${linha.quantidade}x ${linha.nome}`, formatBRLPlain(precoLinha(linha))),
  ];

  // Escolha sem custo: "Ponto: Ao ponto".
  for (const o of linha.opcoes.filter((x) => x.precoCents === 0)) {
    linhas.push(`   • ${ROTULO_CURTO[o.grupoId] ?? o.grupoNome}: ${o.nome}`);
  }

  // Adicional pago: entra no preço da linha e aparece discriminado.
  for (const o of linha.opcoes.filter((x) => x.precoCents > 0)) {
    linhas.push(`   • + ${o.nome} (${formatBRLPlain(o.precoCents)})`);
  }

  if (linha.observacao) linhas.push(`   • Obs: ${linha.observacao}`);

  return linhas;
}

export function buildOrderMessage(pedido: Pedido): string {
  const l: string[] = [];

  l.push(`*NOVO PEDIDO — ${LOJA.nome.toUpperCase()}*`);
  l.push(`#${pedido.id} · ${carimboDeHora(new Date(pedido.criadoEm))}`);

  l.push('*CLIENTE*');
  l.push(pedido.cliente.nome);
  l.push(pedido.cliente.telefone);

  l.push('*ITENS*');
  l.push(REGUA);
  for (const linha of pedido.linhas) l.push(...blocoDoItem(linha));
  l.push(REGUA);

  l.push(`Subtotal: ${formatBRLPlain(pedido.subtotalCents)}`);
  if (pedido.modo === 'entrega' && pedido.entrega) {
    l.push(`Entrega — ${pedido.entrega.bairro}: ${formatBRLPlain(pedido.taxaEntregaCents)}`);
  }
  if (pedido.cupom && pedido.descontoCents) {
    l.push(`Cupom ${pedido.cupom}: -${formatBRLPlain(pedido.descontoCents)}`);
  }
  l.push(`*TOTAL: ${formatBRLPlain(pedido.totalCents)}*`);

  if (pedido.modo === 'entrega' && pedido.entrega) {
    const e = pedido.entrega;
    l.push('*ENTREGA*');
    l.push(`${e.rua}, ${e.numero} — ${e.bairro}`);
    if (e.complemento) l.push(`Compl.: ${e.complemento}`);
    if (e.referencia) l.push(`Ref.: ${e.referencia}`);
  } else {
    l.push('*RETIRADA NO LOCAL*');
    l.push(LOJA.endereco);
  }

  l.push('*PAGAMENTO*');
  if (pedido.pagamento.trocoParaCents !== undefined) {
    l.push(
      `${pedido.pagamento.label} — troco para ${formatBRLPlain(pedido.pagamento.trocoParaCents)}`,
    );
    if (pedido.pagamento.trocoCents !== undefined) {
      l.push(`_(levar ${formatBRLPlain(pedido.pagamento.trocoCents)} de troco)_`);
    }
  } else {
    l.push(pedido.pagamento.label);
  }

  // A linha do +18 só existe quando há bebida alcoólica no pedido.
  if (pedido.temAlcool && pedido.maiorDeIdade) {
    l.push('Cliente confirmou ser maior de 18 anos.');
  }

  l.push('_Pedido gerado pelo app Kabana_ 🔥');

  return l.join('\n');
}

/** O link que abre a conversa com a mensagem pronta. */
export function buildWhatsAppUrl(pedido: Pedido): string {
  return `https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(buildOrderMessage(pedido))}`;
}
