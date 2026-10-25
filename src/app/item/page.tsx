import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PaginaItem } from '@/components/item/PaginaItem';
import { Toast } from '@/components/ui/Toast';

export const metadata: Metadata = { title: 'Item' };

/** Esqueleto enquanto o id da URL ainda não chegou ao cliente. */
function Esqueleto() {
  return (
    <div className="mx-auto max-w-2xl" aria-hidden>
      <div className="h-14" />
      <div className="px-4 pt-4">
        <div className="esqueleto h-6 w-2/3 rounded" />
        <div className="esqueleto mt-3 h-4 w-full rounded" />
        <div className="esqueleto mt-2 h-4 w-5/6 rounded" />
        <div className="esqueleto mt-4 h-5 w-24 rounded" />
      </div>
    </div>
  );
}

/**
 * /item?id=... ─ rota estática; o id vem da query e é lido no cliente.
 * Fora do grupo (abas): sem barra de abas, com a própria barra de ação.
 */
export default function Item() {
  return (
    <>
      <Suspense fallback={<Esqueleto />}>
        <PaginaItem />
      </Suspense>
      <Toast acima="barra" />
    </>
  );
}
