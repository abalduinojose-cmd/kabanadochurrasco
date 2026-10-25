import type { Metadata } from 'next';
import { WifiOff } from 'lucide-react';
import { BrandMark } from '@/components/layout/BrandMark';
import { LOJA } from '@/data/loja';

export const metadata: Metadata = {
  title: 'Sem conexão',
  robots: { index: false, follow: false },
};

/**
 * Página de fallback do service worker. Quem perde o sinal vê a marca, não a
 * tela de erro do navegador. A sacola continua guardada no aparelho, e dizer
 * isso aqui evita que a pessoa ache que perdeu o pedido.
 */
export default function Offline() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-fundo px-8 text-center">
      <span className="grid size-20 place-items-center rounded-full bg-carvao">
        <BrandMark recorte className="w-16" />
      </span>

      <h1 className="mt-6 text-[22px] font-extrabold leading-tight text-texto">Sem conexão agora</h1>

      <p className="mx-auto mt-3 max-w-[32ch] text-[14px] leading-relaxed text-texto-2">
        Sua sacola continua guardada neste aparelho. Assim que o sinal voltar, é só continuar de onde parou.
      </p>

      <p className="mt-8 inline-flex items-center gap-2 rounded-pilula bg-fundo-2 px-3.5 py-2 text-[12px] font-semibold text-texto-2">
        <WifiOff className="size-4" aria-hidden />
        {LOJA.nome}
      </p>
    </main>
  );
}
