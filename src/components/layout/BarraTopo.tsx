import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

/** Cabeçalho das telas internas, como no iFood: voltar à esquerda, título ao centro. */
export function BarraTopo({
  titulo,
  voltarPara = '/',
  acao,
}: {
  titulo: string;
  voltarPara?: string;
  acao?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-divisor bg-cartao" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="mx-auto grid h-14 max-w-2xl grid-cols-[44px_1fr_minmax(44px,auto)] items-center px-2">
        <Link href={voltarPara} aria-label="Voltar" className="grid size-11 place-items-center rounded-full text-texto hover:bg-fundo-2">
          <ChevronLeft className="size-6" aria-hidden />
        </Link>
        <h1 className="truncate text-center text-[17px] font-bold text-texto">{titulo}</h1>
        <div className="grid place-items-center">{acao}</div>
      </div>
    </header>
  );
}
