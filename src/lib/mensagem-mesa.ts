/**
 * As mensagens do atendimento na mesa, que chegam no WhatsApp da loja.
 *
 * O garçom ou o caixa lê em pé, com o salão cheio: a mesa vem primeiro e em
 * caixa alta, os itens usam o mesmo bloco da mensagem do delivery (preço numa
 * coluna fixa, opções e observação embaixo) e o total do pedido fecha, com a
 * conta da mesa até ali logo abaixo.
 */

import { LOJA } from '@/data/loja';
import { formatBRLPlain, type Cents } from './money';
import { carimboDeHora } from './order-id';
import { blocoDoItem } from './whatsapp';
import type { LinhaCarrinho } from '@/types/carrinho';

const REGUA = '─'.repeat(20);

export const rotuloMesa = (mesa: string) => (/^\d+$/.test(mesa) ? `MESA ${mesa.padStart(2, '0')}` : mesa.toUpperCase());

type DadosPedido = {
  mesa: string;
  garcom: string;
  nome?: string;
  numero: number;
  linhas: readonly LinhaCarrinho[];
  totalCents: Cents;
  /** Soma dos pedidos anteriores da mesa (sem este). */
  contaAnteriorCents: Cents;
  agora: Date;
};

export function mensagemPedidoMesa(d: DadosPedido): string {
  const l: string[] = [];
  l.push(`*PEDIDO NA ${rotuloMesa(d.mesa)}* · ${LOJA.nome}`);
  l.push(`Pedido ${d.numero} da mesa · ${carimboDeHora(d.agora)}`);
  if (d.garcom) l.push(`Atendente: ${d.garcom}`);
  if (d.nome) l.push(`Cliente: ${d.nome}`);
  l.push('');
  l.push('*ITENS*');
  l.push(REGUA);
  for (const linha of d.linhas) l.push(...blocoDoItem(linha));
  l.push(REGUA);
  l.push(`*TOTAL DESTE PEDIDO: ${formatBRLPlain(d.totalCents)}*`);
  if (d.contaAnteriorCents > 0) l.push(`Conta da mesa com este pedido: ${formatBRLPlain(d.contaAnteriorCents + d.totalCents)}`);
  l.push('');
  l.push('_Pedido feito no tablet da mesa_');
  return l.join('\n');
}

export function mensagemChamarGarcom(mesa: string, garcom: string): string {
  return [`*${rotuloMesa(mesa)} chamando o atendimento*`, garcom ? `Atendente: ${garcom}` : '', '_Pelo tablet da mesa_'].filter(Boolean).join('\n');
}

export function mensagemPedirConta(mesa: string, garcom: string, pedidos: number, contaCents: Cents): string {
  return [
    `*${rotuloMesa(mesa)} pediu a conta*`,
    garcom ? `Atendente: ${garcom}` : '',
    `${pedidos} ${pedidos === 1 ? 'pedido' : 'pedidos'} pelo tablet: ${formatBRLPlain(contaCents)}`,
    '_Conferir no caixa os itens pedidos direto ao garçom._',
  ]
    .filter(Boolean)
    .join('\n');
}

export const urlWhatsAppLoja = (texto: string) => `https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(texto)}`;
