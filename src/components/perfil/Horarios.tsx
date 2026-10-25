'use client';

import { LOJA, type DiaSemana } from '@/data/loja';
import { NOMES_DIA, partesEmSaoPaulo } from '@/lib/store-hours';
import { useAgora } from '@/lib/use-agora';

/**
 * Horários por dia da semana. A tabela vem de loja.ts e é igual no servidor
 * e no cliente; só o destaque de "hoje" depende do relógio e entra depois da
 * montagem, via `useAgora`, sem divergência de hidratação.
 */

const DIAS: readonly DiaSemana[] = [1, 2, 3, 4, 5, 6, 0];
const nomeCurto = (d: DiaSemana) => NOMES_DIA[d].replace('-feira', '');

export function Horarios() {
  const agora = useAgora();
  const hoje = agora ? partesEmSaoPaulo(agora).diaSemana : null;

  return (
    <ul className="mt-2 divide-y divide-divisor">
      {DIAS.map((d) => {
        const janelas = LOJA.horarios[d];
        const ehHoje = hoje === d;
        return (
          <li key={d} className="flex items-center justify-between py-2.5 text-[14px]" aria-current={ehHoje ? 'date' : undefined}>
            <span className={`capitalize ${ehHoje ? 'font-bold text-texto' : 'text-texto-2'}`}>
              {nomeCurto(d)}
              {ehHoje && <span className="ml-2 rounded bg-fogo-suave px-1.5 py-0.5 text-[10px] font-bold uppercase not-italic text-fogo-texto">hoje</span>}
            </span>
            <span className={`tabular-nums ${janelas ? 'text-texto' : 'text-texto-3'}`}>
              {janelas ? janelas.map((j) => `${j.abre} às ${j.fecha}`).join(' e ') : 'Fechado'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
