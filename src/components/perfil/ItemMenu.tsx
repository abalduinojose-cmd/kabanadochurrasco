import Link from 'next/link';
import { ChevronRight, type LucideIcon } from 'lucide-react';

/** Uma linha do menu do Perfil, como as do iFood: ícone, título, descrição e seta. */
export function ItemMenu({
  href,
  icone: Icone,
  titulo,
  descricao,
  externo = false,
}: {
  href: string;
  icone: LucideIcon;
  titulo: string;
  descricao?: string;
  externo?: boolean;
}) {
  const conteudo = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-fundo-2 text-texto">
        <Icone className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-texto">{titulo}</span>
        {descricao && <span className="block truncate text-[13px] text-texto-2">{descricao}</span>}
      </span>
      <ChevronRight className="size-5 shrink-0 text-texto-3" aria-hidden />
    </>
  );
  const classes = 'flex min-h-14 items-center gap-3 py-2.5 active:bg-fundo-2';
  return (
    <li className="border-b border-divisor last:border-b-0">
      {externo ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {conteudo}
        </a>
      ) : (
        <Link href={href} className={classes}>
          {conteudo}
        </Link>
      )}
    </li>
  );
}
