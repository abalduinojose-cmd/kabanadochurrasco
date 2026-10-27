'use client';

import { LOJA, type DiaSemana } from '@/data/loja';
import { minutosDe, NOMES_DIA, nextOpening, partesEmSaoPaulo, statusDaLoja } from '@/lib/store-hours';
import { useAgora } from '@/lib/use-agora';

/**
 * Horário de funcionamento, moderno: um cartão com o status de agora e a
 * barra do expediente de hoje (o ponto é a hora atual, e ela anda: a barra é
 * informação, não enfeite), a semana em sete pílulas com hoje aceso e as
 * faixas agrupadas ("Terça a domingo, 17:00 às 23:00"). Tudo de loja.ts; o
 * que depende do relógio entra depois da montagem (useAgora).
 */

const SEMANA: readonly DiaSemana[] = [1, 2, 3, 4, 5, 6, 0];
const INICIAL: Readonly<Record<DiaSemana, string>> = { 0: 'D', 1: 'S', 2: 'T', 3: 'Q', 4: 'Q', 5: 'S', 6: 'S' };

const faixa = (d: DiaSemana) => {
  const j = LOJA.horarios[d];
  return j ? j.map((x) => `${x.abre} às ${x.fecha}`).join(' e ') : null;
};
const nomeDia = (d: DiaSemana) => NOMES_DIA[d].replace('-feira', '');
const maiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Dias seguidos com o mesmo horário viram uma linha só. */
export function grupos(): readonly { rotulo: string; horario: string | null }[] {
  const saida: { dias: DiaSemana[]; horario: string | null }[] = [];
  for (const d of SEMANA) {
    const h = faixa(d);
    const ultimo = saida[saida.length - 1];
    if (ultimo && ultimo.horario === h) ultimo.dias.push(d);
    else saida.push({ dias: [d], horario: h });
  }
  return saida.map((g) => {
    const primeiro = g.dias[0] as DiaSemana;
    const ultimo = g.dias[g.dias.length - 1] as DiaSemana;
    const rotulo = g.dias.length === 1 ? maiuscula(nomeDia(primeiro)) : `${maiuscula(nomeDia(primeiro))} a ${nomeDia(ultimo)}`;
    return { rotulo, horario: g.horario };
  });
}

export function HorarioSemana() {
  const agora = useAgora();
  const partes = agora ? partesEmSaoPaulo(agora) : null;
  const hoje = partes?.diaSemana ?? null;
  const status = agora ? statusDaLoja(agora) : null;
  const proxima = agora && status && !status.aberta ? nextOpening(agora) : null;

  // Barra de hoje: do abrir ao fechar da primeira janela do dia.
  const janela = hoje !== null ? LOJA.horarios[hoje]?.[0] : undefined;
  let progresso: number | null = null;
  if (janela && partes) {
    const abre = minutosDe(janela.abre);
    let fecha = minutosDe(janela.fecha);
    if (fecha <= abre) fecha += 24 * 60;
    const t = partes.minutos < abre && fecha > 24 * 60 ? partes.minutos + 24 * 60 : partes.minutos;
    progresso = Math.min(1, Math.max(0, (t - abre) / (fecha - abre)));
  }

  return (
    <div className="mt-3 space-y-3">
      <div className={`rounded-[20px] p-4 ${status?.aberta ? 'bg-verde-suave' : 'bg-fundo-2'}`}>
        {status ? (
          <>
            <p className={`flex items-center gap-2 text-[16px] font-extrabold ${status.aberta ? 'text-verde' : 'text-texto'}`}>
              <i aria-hidden className={`size-2 rounded-full ${status.aberta ? 'bg-verde' : 'bg-texto-3'}`} />
              {status.aberta ? 'Aberto agora' : 'Fechado agora'}
            </p>
            <p className="mt-0.5 text-[13px] text-texto-2">
              {status.aberta && janela ? `Fecha às ${janela.fecha}. Dá tempo de pedir.` : proxima ? `Abre ${proxima.label}.` : 'Sem horário cadastrado.'}
            </p>
            {janela && progresso !== null && (
              <div className="mt-3">
                <div className="relative h-2 rounded-full bg-white/80">
                  <div className={`h-full rounded-full ${status.aberta ? 'bg-verde' : 'bg-borda'}`} style={{ width: `${progresso * 100}%` }} />
                  {status.aberta && (
                    <span
                      aria-hidden
                      className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-verde shadow"
                      style={{ left: `${progresso * 100}%` }}
                    />
                  )}
                </div>
                <div className="mt-1.5 flex justify-between text-[11.5px] font-semibold tabular-nums text-texto-2">
                  <span>{janela.abre}</span>
                  <span>{janela.fecha}</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <span className="esqueleto block h-12 rounded-xl" aria-hidden />
        )}
      </div>

      <ol className="grid grid-cols-7 gap-1.5" aria-label="Dias da semana">
        {SEMANA.map((d) => {
          const aberto = LOJA.horarios[d] !== null;
          const ehHoje = hoje === d;
          return (
            <li
              key={d}
              aria-current={ehHoje ? 'date' : undefined}
              aria-label={`${nomeDia(d)}: ${faixa(d) ?? 'fechado'}`}
              className={`flex h-12 flex-col items-center justify-center rounded-[14px] text-[13px] font-extrabold ${
                ehHoje ? 'bg-carvao text-white' : aberto ? 'bg-fundo-2 text-texto' : 'bg-fundo-2 text-texto-3 line-through'
              }`}
            >
              {INICIAL[d]}
              <i aria-hidden className={`mt-1 size-1 rounded-full ${ehHoje ? 'bg-fogo' : aberto ? 'bg-verde' : 'bg-transparent'}`} />
            </li>
          );
        })}
      </ol>

      <ul className="divide-y divide-divisor rounded-[18px] px-1">
        {grupos().map((g) => (
          <li key={g.rotulo} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
            <span className="font-semibold text-texto">{g.rotulo}</span>
            <span className={`tabular-nums ${g.horario ? 'text-texto' : 'text-texto-3'}`}>{g.horario ?? 'Fechado'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
