import type { Metadata } from 'next';
import { BarraTopo } from '@/components/layout/BarraTopo';
import { FormularioDados } from '@/components/perfil/FormularioDados';
import { Toast } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Meus dados',
  robots: { index: false, follow: false },
};

export default function DadosPage() {
  return (
    <>
      <BarraTopo titulo="Meus dados" voltarPara="/perfil" />
      <main className="mx-auto max-w-2xl">
        <FormularioDados />
      </main>
      <Toast acima="barra" />
    </>
  );
}
