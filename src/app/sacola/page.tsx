import type { Metadata } from 'next';
import { BarraTopo } from '@/components/layout/BarraTopo';
import { Sacola } from '@/components/sacola/Sacola';
import { BotaoLimpar } from '@/components/sacola/BotaoLimpar';
import { Toast } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Sacola',
  robots: { index: false, follow: false },
};

/** A sacola do iFood: tela cheia, sem abas, com "Continuar" fixo embaixo. */
export default function SacolaPage() {
  return (
    <>
      <BarraTopo titulo="Sacola" acao={<BotaoLimpar />} />
      <main className="mx-auto max-w-2xl pb-44">
        <Sacola />
      </main>
      <Toast acima="barra" />
    </>
  );
}
