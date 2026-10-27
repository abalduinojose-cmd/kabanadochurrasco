'use client';

import { useCupom } from '@/store/cupom';
import { useAgora } from './use-agora';
import { avaliarCupom, type Avaliacao, type ContextoCupom } from './cupom';
import type { Cents } from './money';

/**
 * O cupom aplicado, avaliado contra o pedido de agora: quanto desconta, ou
 * por que ainda não vale. Antes da hidratação e do relógio, nada.
 */
export function useCupomAplicado(ctx: Omit<ContextoCupom, 'agora'>): {
  codigo: string | null;
  avaliacao: Avaliacao | null;
  descontoCents: Cents;
} {
  const codigo = useCupom((s) => (s.hidratado ? s.codigo : null));
  const agora = useAgora();
  const avaliacao = codigo && agora ? avaliarCupom(codigo, { ...ctx, agora }) : null;
  return { codigo, avaliacao, descontoCents: avaliacao?.status === 'valido' ? avaliacao.descontoCents : 0 };
}
