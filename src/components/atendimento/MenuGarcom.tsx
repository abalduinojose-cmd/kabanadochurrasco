'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, DoorOpen, Expand, LogOut, UserRoundCheck } from 'lucide-react';
import { Janela } from './Janela';
import { useComanda, selContaMesa } from '@/store/comanda';
import { formatBRL } from '@/lib/money';
import { rotuloMesa } from '@/lib/mensagem-mesa';

/**
 * O menu do garçom, aberto segurando o selo da mesa: a mesa e o atendente,
 * os pedidos que saíram pelo tablet (hora, valor, por onde), a conta da mesa
 * e as ações: novo cliente (volta às boas-vindas), voltar às mesas (esta
 * continua em atendimento), encerrar a mesa (dois toques), tela cheia e sair
 * do atendimento.
 */

type Props = { aoFechar: () => void; aoNovoCliente: () => void };

const hora = (ms: number) => new Date(ms).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

export function MenuGarcom({ aoFechar, aoNovoCliente }: Props) {
  const mesa = useComanda((s) => s.mesa) ?? '';
  const garcom = useComanda((s) => s.garcom);
  const enviados = useComanda((s) => s.enviados);
  const conta = useComanda(selContaMesa);
  const voltarAsMesas = useComanda((s) => s.voltarAsMesas);
  const encerrarMesa = useComanda((s) => s.encerrarMesa);
  const [confirmando, setConfirmando] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setTelaCheia(Boolean(document.fullscreenElement)), 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!confirmando) return;
    const t = window.setTimeout(() => setConfirmando(false), 3500);
    return () => window.clearTimeout(t);
  }, [confirmando]);

  async function alternarTelaCheia() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      setTelaCheia(Boolean(document.fullscreenElement));
    } catch {
      // o navegador não deixou (iPhone, por exemplo)
    }
  }

  const acao = 'flex min-h-14 w-full items-center gap-3 rounded-[16px] bg-fundo-2 px-4 text-left text-[15px] font-bold text-texto active:brightness-95';

  return (
    <Janela aoFechar={aoFechar} titulo="Menu do garçom" largura="max-w-[560px]">
      <div className="flex items-center gap-3 rounded-[20px] bg-carvao p-4 text-white">
        <span className="grid size-12 place-items-center rounded-[14px] bg-fogo text-[15px] font-extrabold text-carvao">{mesa.length <= 3 ? mesa : 'M'}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-extrabold">{rotuloMesa(mesa)}</p>
          <p className="truncate text-[13px] text-white/65">{garcom ? `Atendente: ${garcom}` : 'Sem atendente definido'}</p>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-white/60">Conta pelo tablet</p>
          <p className="text-[18px] font-extrabold tabular-nums">{formatBRL(conta)}</p>
        </div>
      </div>

      <h3 className="mt-5 text-[14px] font-bold uppercase tracking-[0.08em] text-texto-2">Pedidos enviados</h3>
      {enviados.length === 0 ? (
        <p className="mt-2 text-[14px] text-texto-2">Nenhum pedido saiu desta mesa ainda.</p>
      ) : (
        <ul className="mt-2 divide-y divide-divisor rounded-[18px] bg-fundo-2 px-4">
          {enviados.map((p) => (
            <li key={p.numero} className="flex items-center justify-between gap-3 py-3 text-[14px]">
              <span className="font-bold text-texto">
                Pedido {p.numero}
                <span className="font-medium text-texto-2">
                  {' '}
                  • {hora(p.em)} • {p.via === 'whatsapp' ? 'WhatsApp' : 'com o garçom'}
                  {p.nome ? ` • ${p.nome}` : ''}
                </span>
              </span>
              <span className="font-extrabold tabular-nums text-texto">{formatBRL(p.totalCents)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 grid gap-2">
        <button type="button" onClick={aoNovoCliente} className={acao}>
          <UserRoundCheck className="size-5 text-fogo-texto" aria-hidden />
          Entregar ao cliente (tela de boas-vindas)
        </button>
        <button type="button" onClick={voltarAsMesas} className={acao}>
          <ArrowLeftRight className="size-5 text-fogo-texto" aria-hidden />
          Voltar às mesas (esta continua aberta)
        </button>
        <button type="button" onClick={() => void alternarTelaCheia()} className={acao}>
          <Expand className="size-5 text-fogo-texto" aria-hidden />
          {telaCheia ? 'Sair da tela cheia' : 'Tela cheia (modo quiosque)'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (!confirmando) return setConfirmando(true);
            encerrarMesa();
          }}
          className={`${acao} ${confirmando ? '!bg-vermelho-suave !text-vermelho' : ''}`}
        >
          <DoorOpen className="size-5" aria-hidden />
          {confirmando ? 'Toque de novo para encerrar e limpar a mesa' : 'Encerrar a mesa (cliente foi embora)'}
        </button>
        <Link href="/" className={`${acao} text-texto-2`}>
          <LogOut className="size-5" aria-hidden />
          Sair do atendimento (ir para o app de delivery)
        </Link>
      </div>
    </Janela>
  );
}
