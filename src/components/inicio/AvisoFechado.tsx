'use client';

import { Clock } from 'lucide-react';
import { isOpenNow, nextOpening } from '@/lib/store-hours';
import { useAgora } from '@/lib/use-agora';

/** Faixa "Estamos fechados agora", só quando a loja está fechada (relógio do cliente). */
export function AvisoFechado() {
  const agora = useAgora();
  if (agora === null || isOpenNow(agora)) return null;
  const proxima = nextOpening(agora);

  return (
    <div className="mx-4 mt-4 flex items-start gap-3 rounded-cartao bg-fundo-2 px-3.5 py-3">
      <Clock className="mt-0.5 size-5 shrink-0 text-texto-2" aria-hidden />
      <div className="text-[13px] leading-snug">
        <p className="text-[14px] font-bold text-texto">Estamos fechados agora</p>
        <p className="mt-0.5 text-texto-2">
          {proxima ? `Abrimos ${proxima.label}. ` : ''}Você já pode montar a sacola e enviar o pedido quando abrir.
        </p>
      </div>
    </div>
  );
}
