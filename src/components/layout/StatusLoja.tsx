'use client';

import { statusDaLoja } from '@/lib/store-hours';
import { useAgora } from '@/lib/use-agora';

/**
 * "Aberto até 23:30" ou "Fechado, abre hoje às 18:00", como o iFood escreve
 * no cartão da loja. Nasce neutro e só o cliente resolve o relógio (useAgora).
 */
export function StatusLoja({ className = '', pilula = false }: { className?: string; pilula?: boolean }) {
  const agora = useAgora();

  if (agora === null) {
    return <span className={`esqueleto inline-block h-4 w-28 rounded ${className}`} aria-hidden />;
  }

  const { aberta, texto } = statusDaLoja(agora);

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${aberta ? 'text-verde' : 'text-texto-2'} ${
        pilula ? `h-7 rounded-full px-2.5 ${aberta ? 'bg-verde-suave' : 'bg-fundo-2'}` : ''
      } ${className}`}
    >
      <i
        aria-hidden
        className={`size-1.5 rounded-full ${aberta ? 'bg-verde' : 'bg-texto-3'}`}
        style={aberta ? { animation: 'pulsa 2s ease-in-out infinite' } : undefined}
      />
      {texto}
    </span>
  );
}
