'use client';

import { Clock } from 'lucide-react';
import { grupos } from '@/components/perfil/HorarioSemana';
import { minutosAteAbrir, nextOpening, textoDaContagem } from '@/lib/store-hours';
import { useAgora } from '@/lib/use-agora';
import { useLojaAberta } from '@/lib/use-loja-aberta';

/**
 * O aviso de fora do horário. O app continua todo aberto (cardápio, busca,
 * item, sacola, checkout): a pessoa olha e monta a sacola, só não finaliza; o
 * envio fica bloqueado no checkout (`bloqueiosDoPedido`, "loja-fechada") e no
 * tablet da mesa. O aviso diz isso com o horário da semana, quando abre e
 * quanto falta. Some sozinho quando a loja abre (o relógio anda por minuto).
 */

const maiuscula = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

/** "terça a domingo, das 17:00 às 23:00" (só os dias com horário). */
export function horarioPorExtenso(): string {
  return grupos()
    .filter((g) => g.horario)
    .map((g) => `${maiuscula(g.rotulo)}, das ${g.horario}`)
    .join('; ');
}

export function AvisoHorario({ className = '', escuro = true }: { className?: string; escuro?: boolean }) {
  const aberta = useLojaAberta();
  const agora = useAgora();
  if (aberta !== false || !agora) return null;

  const proxima = nextOpening(agora);
  const contagem = proxima ? textoDaContagem(minutosAteAbrir(agora, proxima)) : null;

  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-[22px] p-3.5 ${escuro ? 'bg-brasa text-white' : 'bg-fogo-suave text-texto ring-1 ring-inset ring-fogo/25'} ${className}`}
    >
      <span className={`grid size-11 shrink-0 place-items-center rounded-[14px] ${escuro ? 'bg-white/10 text-fogo' : 'bg-brasa text-fogo'}`}>
        <Clock className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2 text-[15px] font-extrabold leading-tight">
          {proxima ? `Fechado agora, abrimos ${proxima.label}` : 'Fechado agora'}
          {contagem && <span className={`text-[12.5px] font-bold tabular-nums ${escuro ? 'text-[#ff9a52]' : 'text-fogo-texto'}`}>{contagem}</span>}
        </p>
        <p className={`mt-1 text-[13px] leading-snug ${escuro ? 'text-white/70' : 'text-texto-2'}`}>
          Pode olhar o cardápio e montar a sacola à vontade. O pedido pelo app só pode ser feito no horário de funcionamento: {horarioPorExtenso()}.
        </p>
      </div>
    </div>
  );
}
