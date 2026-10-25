'use client';

import { ReceiptText } from 'lucide-react';
import { LinkBotao } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { CartaoPedido } from './CartaoPedido';
import { usePedidos } from '@/store/pedidos';
import { useAgora } from '@/lib/use-agora';
import { emAndamento } from '@/lib/acompanhamento';

/** Os últimos pedidos deste aparelho (até dez): em andamento primeiro, depois os anteriores. */
export function ListaPedidos() {
  const hidratado = usePedidos((s) => s.hidratado);
  const pedidos = usePedidos((s) => s.pedidos);
  const agora = useAgora();

  if (!hidratado) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="px-6 py-20 text-center">
        <ReceiptText className="mx-auto size-12 text-texto-3" strokeWidth={1.5} aria-hidden />
        <p className="mt-4 text-[18px] font-extrabold text-texto">Nenhum pedido ainda</p>
        <p className="mx-auto mt-2 max-w-[28ch] text-[14px] text-texto-2">Seus pedidos ficam aqui para repetir em um toque.</p>
        <LinkBotao href="/" className="mt-6">
          Ver cardápio
        </LinkBotao>
      </div>
    );
  }

  const andamento = agora ? pedidos.filter((p) => emAndamento(p, agora)) : [];
  const anteriores = agora ? pedidos.filter((p) => !emAndamento(p, agora)) : pedidos;

  return (
    <div className="p-4">
      {andamento.length > 0 && (
        <section aria-labelledby="em-andamento">
          <h2 id="em-andamento" className="text-[15px] font-bold text-texto">
            Em andamento
          </h2>
          <ul className="mt-2 space-y-3">
            {andamento.map((p) => (
              <CartaoPedido key={p.id} pedido={p} emAndamento />
            ))}
          </ul>
        </section>
      )}
      {anteriores.length > 0 && (
        <section aria-labelledby="anteriores" className={andamento.length > 0 ? 'mt-6' : ''}>
          <h2 id="anteriores" className="text-[15px] font-bold text-texto">
            {andamento.length > 0 ? 'Anteriores' : 'Seus pedidos'}
          </h2>
          <ul className="mt-2 space-y-3">
            {anteriores.map((p) => (
              <CartaoPedido key={p.id} pedido={p} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
