/**
 * Identificador do pedido: KB-AAMMDD-NNN.
 * NNN é um contador diário guardado no localStorage, que zera quando a data vira.
 *
 * Só roda no cliente. Chamar durante o render do servidor devolve um id
 * provisório sem tocar no storage, para não quebrar a hidratação.
 */

import { partesEmSaoPaulo } from './store-hours';

const CHAVE = 'kabana:contador-pedido';

/** 2026-08-29 → "260829" (data local de São Paulo). */
export function selo(agora: Date): string {
  const { ano, mes, dia } = partesEmSaoPaulo(agora);
  const p2 = (n: number) => String(n).padStart(2, '0');
  return `${p2(ano % 100)}${p2(mes)}${p2(dia)}`;
}

type Contador = { readonly selo: string; readonly n: number };

function lerContador(): Contador | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const valor: unknown = JSON.parse(bruto);
    if (
      typeof valor === 'object' &&
      valor !== null &&
      typeof (valor as Contador).selo === 'string' &&
      typeof (valor as Contador).n === 'number'
    ) {
      return valor as Contador;
    }
  } catch {
    // storage indisponível ou corrompido: recomeça do zero
  }
  return null;
}

/** Gera o próximo id do dia e persiste o contador. Cliente apenas. */
export function nextOrderId(agora: Date): string {
  const seloHoje = selo(agora);
  const atual = lerContador();
  const n = atual && atual.selo === seloHoje ? atual.n + 1 : 1;

  try {
    localStorage.setItem(CHAVE, JSON.stringify({ selo: seloHoje, n }));
  } catch {
    // sem storage o pedido ainda sai, só não mantém a sequência
  }

  return `KB-${seloHoje}-${String(n).padStart(3, '0')}`;
}

/** "29/08 às 20:14" ─ carimbo que vai no cabeçalho da mensagem. */
export function carimboDeHora(agora: Date): string {
  const { dia, mes, hora, minuto } = partesEmSaoPaulo(agora);
  const p2 = (n: number) => String(n).padStart(2, '0');
  return `${p2(dia)}/${p2(mes)} às ${p2(hora)}:${p2(minuto)}`;
}
