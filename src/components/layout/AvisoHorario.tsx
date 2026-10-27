'use client';

import { Clock } from 'lucide-react';
import { minutosAteAbrir, nextOpening, textoDaContagem } from '@/lib/store-hours';
import { useAgora } from '@/lib/use-agora';
import { useLojaAberta } from '@/lib/use-loja-aberta';

/**
 * O aviso de fora do horário, numa faixa baixa e discreta: "Fechado · abre
 * hoje às 17:00" com quanto falta à direita e, embaixo, "Pedidos pelo app só
 * no horário da loja". O app continua todo aberto
 * (cardápio, busca, item, sacola, checkout): a pessoa olha e monta a sacola,
 * só não finaliza; o envio fica bloqueado no checkout (`bloqueiosDoPedido`,
 * "loja-fechada") e no tablet da mesa. Some sozinho quando a loja abre.
 */
export function AvisoHorario({ className = '' }: { className?: string }) {
  const aberta = useLojaAberta();
  const agora = useAgora();
  if (aberta !== false || !agora) return null;

  const proxima = nextOpening(agora);
  const falta = proxima ? textoDaContagem(minutosAteAbrir(agora, proxima)) : null;

  return (
    <div role="status" className={`flex items-start gap-2.5 rounded-[16px] bg-fundo-2 px-3 py-2.5 ${className}`}>
      <Clock className="mt-px size-4 shrink-0 text-fogo-texto" strokeWidth={2.4} aria-hidden />
      <div className="min-w-0 flex-1 leading-tight">
        <p className="flex items-center justify-between gap-2">
          <span className="truncate text-[13px] font-bold text-texto">{proxima ? `Fechado · abre ${proxima.label}` : 'Fechado agora'}</span>
          {falta && <span className="shrink-0 rounded-full bg-cartao px-2 py-0.5 text-[11px] font-bold tabular-nums text-fogo-texto">em {falta}</span>}
        </p>
        <p className="mt-0.5 text-[12px] text-texto-2">Pedidos pelo app só no horário da loja.</p>
      </div>
    </div>
  );
}
