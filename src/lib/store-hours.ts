/**
 * Horário de funcionamento, sempre no fuso America/Sao_Paulo.
 *
 * O celular do cliente pode estar em qualquer fuso, e o servidor do build
 * roda em UTC. Ler `getHours()` da máquina daria resposta errada, então todo
 * cálculo passa por `partesEmSaoPaulo()`.
 *
 * Estas funções são puras: recebem o "agora" por parâmetro. Quem chama decide
 * quando ler o relógio ─ o que mantém o componente livre de problema de
 * hidratação (servidor renderiza estado neutro, cliente resolve depois).
 */

import { LOJA, type DiaSemana, type Janela } from '@/data/loja';

/** A grade da semana: janelas por dia (0 = domingo), null = fechado. */
export type Horarios = Readonly<Record<DiaSemana, readonly Janela[] | null>>;

const TZ = 'America/Sao_Paulo';

const FORMATADOR = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export type PartesLocais = {
  ano: number;
  mes: number; // 1-12
  dia: number;
  hora: number;
  minuto: number;
  diaSemana: DiaSemana;
  /** Minutos desde a meia-noite local. */
  minutos: number;
};

/** Quebra um instante nas partes de calendário como vistas em São Paulo. */
export function partesEmSaoPaulo(agora: Date): PartesLocais {
  const p = FORMATADOR.formatToParts(agora);
  const pega = (tipo: Intl.DateTimeFormatPartTypes): number => {
    const parte = p.find((x) => x.type === tipo);
    return parte ? Number(parte.value) : 0;
  };
  const ano = pega('year');
  const mes = pega('month');
  const dia = pega('day');
  const hora = pega('hour');
  const minuto = pega('minute');

  // Dia da semana derivado da data local, não do fuso da máquina.
  const diaSemana = new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay() as DiaSemana;

  return { ano, mes, dia, hora, minuto, diaSemana, minutos: hora * 60 + minuto };
}

/** "18:00" → 1080 */
export function minutosDe(hhmm: string): number {
  const [h, m] = hhmm.split(':');
  return Number(h) * 60 + Number(m);
}

/** 1080 → "18:00" */
export function horaDe(minutos: number): string {
  const m = ((minutos % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

function janelasDe(dia: DiaSemana, horarios: Horarios): readonly Janela[] {
  return horarios[dia] ?? [];
}

/**
 * Fim da janela em minutos, esticado além de 1440 quando ela vira o dia.
 * 18:00→00:30 devolve 1470, não 30.
 */
function fimDaJanela(j: Janela): number {
  const abre = minutosDe(j.abre);
  const fecha = minutosDe(j.fecha);
  return fecha <= abre ? fecha + 1440 : fecha;
}

const DIA_ANTERIOR = (d: DiaSemana): DiaSemana => (((d + 6) % 7) as DiaSemana);
const DIA_SEGUINTE = (d: DiaSemana): DiaSemana => (((d + 1) % 7) as DiaSemana);

/** A loja está aberta neste instante? */
export function isOpenNow(agora: Date, horarios: Horarios = LOJA.horarios): boolean {
  const { diaSemana, minutos } = partesEmSaoPaulo(agora);

  // Janelas que começaram hoje.
  for (const j of janelasDe(diaSemana, horarios)) {
    if (minutos >= minutosDe(j.abre) && minutos < fimDaJanela(j)) return true;
  }

  // Janelas de ontem que atravessaram a meia-noite e ainda estão correndo.
  for (const j of janelasDe(DIA_ANTERIOR(diaSemana), horarios)) {
    const fim = fimDaJanela(j);
    if (fim > 1440 && minutos + 1440 >= minutosDe(j.abre) && minutos + 1440 < fim) {
      return true;
    }
  }

  return false;
}

const NOMES_DIA = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
] as const;

export type ProximaAbertura = {
  diaSemana: DiaSemana;
  hora: string;
  /** Quantos dias à frente: 0 = hoje, 1 = amanhã. */
  emDias: number;
  /** Pronto para a tela: "hoje às 18:00", "amanhã às 18:00", "sábado às 18:00". */
  label: string;
};

/**
 * Próximo horário de abertura a partir de `agora`.
 * Devolve null se a loja não abrir em nenhum dia da semana (todos fechados).
 */
export function nextOpening(agora: Date, horarios: Horarios = LOJA.horarios): ProximaAbertura | null {
  const { diaSemana, minutos } = partesEmSaoPaulo(agora);

  for (let offset = 0; offset < 8; offset++) {
    const dia = ((diaSemana + offset) % 7) as DiaSemana;
    const candidatas = janelasDe(dia, horarios)
      .map((j) => minutosDe(j.abre))
      .sort((a, b) => a - b);

    for (const abre of candidatas) {
      // Hoje só vale se a abertura ainda não passou.
      if (offset === 0 && abre <= minutos) continue;
      return {
        diaSemana: dia,
        hora: horaDe(abre),
        emDias: offset,
        label:
          offset === 0
            ? `hoje às ${horaDe(abre)}`
            : offset === 1
              ? `amanhã às ${horaDe(abre)}`
              : `${NOMES_DIA[dia]} às ${horaDe(abre)}`,
      };
    }
  }

  return null;
}

/** Texto curto para o cabeçalho: "Aberto até 23:30" ou "Fechado ─ abre hoje às 18:00". */
export function statusDaLoja(agora: Date, horarios: Horarios = LOJA.horarios): { aberta: boolean; texto: string } {
  if (isOpenNow(agora, horarios)) {
    const { diaSemana, minutos } = partesEmSaoPaulo(agora);
    const emCurso =
      janelasDe(diaSemana, horarios).find(
        (j) => minutos >= minutosDe(j.abre) && minutos < fimDaJanela(j),
      ) ??
      janelasDe(DIA_ANTERIOR(diaSemana), horarios).find((j) => {
        const fim = fimDaJanela(j);
        return fim > 1440 && minutos + 1440 >= minutosDe(j.abre) && minutos + 1440 < fim;
      });
    return { aberta: true, texto: emCurso ? `Aberto até ${emCurso.fecha}` : 'Aberto' };
  }

  const proxima = nextOpening(agora, horarios);
  return {
    aberta: false,
    texto: proxima ? `Fechado, abre ${proxima.label}` : 'Fechado',
  };
}

export { DIA_SEGUINTE, NOMES_DIA };
