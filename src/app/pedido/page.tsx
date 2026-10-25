import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BarraTopo } from '@/components/layout/BarraTopo';
import { Confirmacao } from '@/components/checkout/Confirmacao';
import { Skeleton } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'Pedido realizado',
  robots: { index: false, follow: false },
};

/**
 * O id do pedido vem por query (`/pedido?id=KB-260829-001`), não por segmento
 * dinâmico. O conteúdo é lido do localStorage do próprio aparelho, então a
 * casca é idêntica para qualquer id ─ a rota fica estática e o service
 * worker consegue guardá-la em cache.
 */
export default function PedidoPage() {
  return (
    <>
      <BarraTopo titulo="Pedido" />
      <main className="mx-auto max-w-2xl">
        <Suspense
          fallback={
            <div className="space-y-3 p-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          }
        >
          <Confirmacao />
        </Suspense>
      </main>
    </>
  );
}
