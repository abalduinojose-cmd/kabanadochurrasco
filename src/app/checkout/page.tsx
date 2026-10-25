import type { Metadata } from 'next';
import { BarraTopo } from '@/components/layout/BarraTopo';
import { CheckoutPagina } from '@/components/checkout/CheckoutPagina';

export const metadata: Metadata = {
  title: 'Finalizar pedido',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <BarraTopo titulo="Finalizar pedido" voltarPara="/sacola" />
      <main className="mx-auto max-w-2xl">
        <CheckoutPagina />
      </main>
    </>
  );
}
