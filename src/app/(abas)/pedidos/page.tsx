import type { Metadata } from 'next';
import { ListaPedidos } from '@/components/pedidos/ListaPedidos';

export const metadata: Metadata = {
  title: 'Pedidos',
  robots: { index: false, follow: false },
};

/** Aba Pedidos: histórico do aparelho, recompra em um toque. */
export default function Pedidos() {
  return (
    <main className="mx-auto max-w-2xl">
      <header className="sticky top-0 z-30 border-b border-divisor bg-cartao" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <h1 className="flex h-14 items-center px-4 text-[18px] font-extrabold text-texto">Meus pedidos</h1>
      </header>
      <ListaPedidos />
    </main>
  );
}
