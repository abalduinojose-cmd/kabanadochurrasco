import type { Metadata } from 'next';
import { BarraTopo } from '@/components/layout/BarraTopo';
import { ListaFavoritos } from '@/components/perfil/ListaFavoritos';
import { Toast } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Favoritos',
  robots: { index: false, follow: false },
};

export default function FavoritosPage() {
  return (
    <>
      <BarraTopo titulo="Favoritos" voltarPara="/perfil" />
      <main className="mx-auto max-w-2xl pb-24">
        <ListaFavoritos />
      </main>
      <Toast acima="nada" />
    </>
  );
}
