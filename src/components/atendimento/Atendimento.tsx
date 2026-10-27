'use client';

import { useState } from 'react';
import { LogoKabana } from '@/components/layout/LogoKabana';
import { InicioMesa } from './InicioMesa';
import { BoasVindas } from './BoasVindas';
import { CardapioMesa } from './CardapioMesa';
import { useComanda } from '@/store/comanda';

/**
 * O atendimento na mesa (endereço /atendimento): sempre começa na tela das
 * mesas (as em atendimento aparecem em laranja); o garçom abre uma mesa, o
 * cliente recebe o tablet na tela de boas-vindas, escolhe no cardápio e envia
 * o pedido; o botão Mesas volta para a tela das mesas sem fechar a mesa. Tudo fica no aparelho até o garçom encerrar a mesa. Fora do
 * horário da loja o cardápio abre, mas o envio fica bloqueado (CardapioMesa).
 */
export function Atendimento() {
  const hidratado = useComanda((s) => s.hidratado);
  const mesa = useComanda((s) => s.mesa);
  const voltarAsMesas = useComanda((s) => s.voltarAsMesas);
  const [boasVindas, setBoasVindas] = useState(true);

  if (!hidratado) {
    return (
      <div className="grid h-dvh place-items-center bg-carvao">
        <LogoKabana sizes="200px" prioridade className="w-[200px]" />
      </div>
    );
  }

  if (!mesa) return <InicioMesa aoAbrir={(nova) => setBoasVindas(nova)} />;
  if (boasVindas) return <BoasVindas mesa={mesa} aoEntrar={() => setBoasVindas(false)} aoVoltar={voltarAsMesas} />;
  return <CardapioMesa aoNovoCliente={() => setBoasVindas(true)} />;
}
