import { LinkBotao } from '@/components/ui/Button';
import { BrandMark } from '@/components/layout/BrandMark';

/** 404 na cara do app: a marca, uma frase e o caminho de volta ao cardápio. */
export default function NaoEncontrada() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-fundo px-8 text-center">
      <span className="grid size-20 place-items-center rounded-full bg-carvao">
        <BrandMark recorte className="w-16" />
      </span>
      <h1 className="mt-6 text-[22px] font-extrabold leading-tight text-texto">Essa página não existe</h1>
      <p className="mx-auto mt-2 max-w-[30ch] text-[14px] text-texto-2">O cardápio continua no lugar de sempre.</p>
      <LinkBotao href="/" className="mt-6">
        Ver cardápio
      </LinkBotao>
    </main>
  );
}
