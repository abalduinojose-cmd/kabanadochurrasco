import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isOpenNow,
  nextOpening,
  statusDaLoja,
  partesEmSaoPaulo,
  minutosDe,
  horaDe,
  minutosAteAbrir,
  textoDaContagem,
  type Horarios,
} from '../src/lib/store-hours.ts';

// São Paulo é UTC-3 o ano inteiro (sem horário de verão desde 2019).
// Os fixtures abaixo são escritos em UTC e comentados com a hora local.
const utc = (iso: string) => new Date(iso);

/** Grade de teste com janela que vira o dia (sexta e sábado até 00:30) e segunda fechada. */
const H: Horarios = {
  0: [{ abre: '18:00', fecha: '23:30' }],
  1: null,
  2: [{ abre: '18:00', fecha: '23:30' }],
  3: [{ abre: '18:00', fecha: '23:30' }],
  4: [{ abre: '18:00', fecha: '23:30' }],
  5: [{ abre: '18:00', fecha: '00:30' }],
  6: [{ abre: '18:00', fecha: '00:30' }],
};

test('partesEmSaoPaulo devolve o calendario local, nao o da maquina', () => {
  // 2026-08-29T02:00:00Z ainda é 28/08 às 23:00 em São Paulo
  const p = partesEmSaoPaulo(utc('2026-08-29T02:00:00Z'));
  assert.equal(p.dia, 28);
  assert.equal(p.mes, 8);
  assert.equal(p.hora, 23);
  assert.equal(p.diaSemana, 5); // sexta
  assert.equal(p.minutos, 23 * 60);
});

test('minutosDe e horaDe fecham o ciclo', () => {
  assert.equal(minutosDe('18:00'), 1080);
  assert.equal(minutosDe('00:30'), 30);
  assert.equal(horaDe(1080), '18:00');
  assert.equal(horaDe(1470), '00:30'); // esticado para além da meia-noite
});

test('aberto dentro da janela normal', () => {
  // sexta 28/08 às 20:00 (janela 18:00-00:30)
  assert.equal(isOpenNow(utc('2026-08-28T23:00:00Z'), H), true);
  // sábado 29/08 às 18:00, exatamente na abertura
  assert.equal(isOpenNow(utc('2026-08-29T21:00:00Z'), H), true);
});

test('fechado antes de abrir', () => {
  // sábado 29/08 às 17:59
  assert.equal(isOpenNow(utc('2026-08-29T20:59:00Z'), H), false);
});

test('janela que vira o dia continua aberta depois da meia-noite', () => {
  // sábado 29/08 às 00:15 ─ ainda é a janela da sexta, que fecha 00:30
  assert.equal(isOpenNow(utc('2026-08-29T03:15:00Z'), H), true);
});

test('fecha certo depois de virar o dia', () => {
  // sábado 29/08 às 01:00 ─ a janela da sexta já fechou
  assert.equal(isOpenNow(utc('2026-08-29T04:00:00Z'), H), false);
  // sábado 29/08 às 00:30 em ponto ─ fim é exclusivo
  assert.equal(isOpenNow(utc('2026-08-29T03:30:00Z'), H), false);
});

test('domingo fecha 23:30 e nao atravessa', () => {
  // domingo 30/08 às 23:00
  assert.equal(isOpenNow(utc('2026-08-31T02:00:00Z'), H), true);
  // segunda 31/08 às 00:10 ─ domingo não vira o dia
  assert.equal(isOpenNow(utc('2026-08-31T03:10:00Z'), H), false);
});

test('dia marcado como fechado nunca abre', () => {
  // segunda 31/08 às 20:00
  assert.equal(isOpenNow(utc('2026-08-31T23:00:00Z'), H), false);
});

test('nextOpening pula os dias fechados', () => {
  // segunda 31/08 às 20:00 → abre terça
  const p = nextOpening(utc('2026-08-31T23:00:00Z'), H);
  assert.equal(p?.diaSemana, 2);
  assert.equal(p?.hora, '18:00');
  assert.equal(p?.emDias, 1);
  assert.equal(p?.label, 'amanhã às 18:00');
});

test('nextOpening reconhece que ainda abre hoje', () => {
  // domingo 30/08 às 15:00
  const p = nextOpening(utc('2026-08-30T18:00:00Z'), H);
  assert.equal(p?.emDias, 0);
  assert.equal(p?.label, 'hoje às 18:00');
});

test('nextOpening nomeia o dia quando passa de amanha', () => {
  // domingo 30/08 às 23:35 ─ já fechou, segunda é folga
  const p = nextOpening(utc('2026-08-31T02:35:00Z'), H);
  assert.equal(p?.emDias, 2);
  assert.equal(p?.label, 'terça-feira às 18:00');
});

test('statusDaLoja monta o texto do cabecalho', () => {
  // sábado 29/08 às 20:00
  assert.deepEqual(statusDaLoja(utc('2026-08-29T23:00:00Z'), H), { aberta: true, texto: 'Aberto até 00:30' });
  // sábado 29/08 às 00:15 ─ janela herdada da sexta
  assert.deepEqual(statusDaLoja(utc('2026-08-29T03:15:00Z'), H), { aberta: true, texto: 'Aberto até 00:30' });
  // segunda 31/08 às 20:00
  assert.deepEqual(statusDaLoja(utc('2026-08-31T23:00:00Z'), H), { aberta: false, texto: 'Fechado, abre amanhã às 18:00' });
});

test('grade real da loja: terca a domingo das 17h as 23h, segunda fechada', () => {
  // domingo 30/08 às 20:00
  assert.equal(isOpenNow(utc('2026-08-30T23:00:00Z')), true);
  // domingo 30/08 às 16:59, antes de abrir
  assert.equal(isOpenNow(utc('2026-08-30T19:59:00Z')), false);
  // segunda 31/08 às 20:00, folga
  assert.equal(isOpenNow(utc('2026-08-31T23:00:00Z')), false);
  assert.equal(nextOpening(utc('2026-08-31T23:00:00Z'))?.label, 'amanhã às 17:00');
  // sábado 29/08 às 20:00
  assert.deepEqual(statusDaLoja(utc('2026-08-29T23:00:00Z')), { aberta: true, texto: 'Aberto até 23:00' });
});

test('o resultado nao depende do fuso da maquina', () => {
  const instante = utc('2026-08-28T23:00:00Z');
  const antes = isOpenNow(instante, H);
  process.env.TZ = 'Asia/Tokyo';
  assert.equal(isOpenNow(instante, H), antes);
  process.env.TZ = 'America/Sao_Paulo';
});

test('contagem ate abrir: minutos ate a proxima abertura, no fuso de Sao Paulo', () => {
  // Terça 27/10/2026, 15:48 em São Paulo (18:48Z); abre às 18:00 → 132 min
  const agora = utc('2026-10-27T18:48:00Z');
  const proxima = nextOpening(agora, H);
  assert.ok(proxima);
  assert.equal(minutosAteAbrir(agora, proxima), 132);
  assert.equal(textoDaContagem(132), '2 h 12 min');
  // Segunda fechada: domingo 23:40 → terça 18:00 passa de um dia, sem contagem
  const domingo = utc('2026-10-26T02:40:00Z');
  const terca = nextOpening(domingo, H);
  assert.ok(terca);
  assert.equal(minutosAteAbrir(domingo, terca), 20 + 1440 + 1080);
  assert.equal(textoDaContagem(minutosAteAbrir(domingo, terca)), null);
});

test('texto da contagem: minutos, horas cheias e horas com minutos', () => {
  assert.equal(textoDaContagem(12), '12 min');
  assert.equal(textoDaContagem(60), '1 h');
  assert.equal(textoDaContagem(65), '1 h 05 min');
  assert.equal(textoDaContagem(0), null);
  assert.equal(textoDaContagem(1440), null);
});
