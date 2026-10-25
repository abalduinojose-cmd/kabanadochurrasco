type Props = {
  children: React.ReactNode;
  tom?: 'fogo' | 'verde' | 'cinza';
  className?: string;
};

const TONS = {
  fogo: 'bg-fogo-suave text-fogo-texto',
  verde: 'bg-verde-suave text-verde',
  cinza: 'bg-fundo-2 text-texto-2',
} as const;

/** Etiqueta pequena, como as do iFood ("Novo", "Indisponível", "+18"). */
export function Badge({ children, tom = 'cinza', className = '' }: Props) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-bold ${TONS[tom]} ${className}`}>
      {children}
    </span>
  );
}
