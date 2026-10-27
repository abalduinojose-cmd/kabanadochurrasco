'use client';

import { useState } from 'react';
import { LogoKabana } from '@/components/layout/LogoKabana';
import { InicioMesa } from './InicioMesa';
import { BoasVindas } from './BoasVindas';
import { CardapioMesa } from './CardapioMesa';
import { useComanda } from '@/store/comanda';

/**
 * O atendimento na mesa (endereço /atendimento): o garçom abre a mesa, o
 * cliente recebe o tablet na tela de boas-vindas, escolhe no cardápio e envia
 * o pedido. Tudo fica no aparelho até o garçom encerrar a mesa.
 */
export function Atendimento() {
  const hidratado = useComanda((s) => s.hidratado);
  const mesa = useComanda((s) => s.mesa);
  const [boasVindas, setBoasVindas] = useState(true);

  if (!hidratado) {
    return (
      <div className="grid h-dvh place-items-center bg-carvao">
        <LogoKabana sizes="200px" prioridade className="w-[200px]" />
      </div>
    );
  }

  if (!mesa) return <InicioMesa />;
  if (boasVindas) return <BoasVindas mesa={mesa} aoEntrar={() => setBoasVindas(false)} />;
  return <CardapioMesa aoNovoCliente={() => setBoasVindas(true)} />;
}
