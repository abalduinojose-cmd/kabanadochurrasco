'use client';

import { statusDaLoja } from '@/lib/store-hours';
import { useAgora } from '@/lib/use-agora';

/**
 * "Aberto até 23:30" ou "Fechado, abre hoje às 18:00", como o iFood escreve
 * no cartão da loja. Nasce neutro e só o cliente resolve o relógio (useAgora).
 * `escuro` é a pílula da fachada do Início, sobre o carvão.
 */
export function StatusLoja({ className = '', pilula = false, escuro = false }: { className?: string; pilula?: boolean; escuro?: boolean }) {
  const agora = useAgora();

  if (agora === null) {
    return <span className={`inline-block ${escuro ? 'h-7 w-44 rounded-full bg-white/10' : 'esqueleto h-4 w-28 rounded'} ${className}`} aria-hidden />;
  }

  const { aberta, texto } = statusDaLoja(agora);
  const cor = escuro ? (aberta ? 'text-[#6fe0a0] bg-[#1e8e4b]/20' : 'text-white/80 bg-white/10') : aberta ? 'text-verde' : 'text-texto-2';
  const fundo = escuro ? '' : aberta ? 'bg-verde-suave' : 'bg-fundo-2';

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${cor} ${pilula || escuro ? `h-7 rounded-full px-2.5 ${fundo}` : ''} ${className}`}
    >
      <i
        aria-hidden
        className={`size-1.5 rounded-full ${aberta ? (escuro ? 'bg-[#6fe0a0]' : 'bg-verde') : escuro ? 'bg-white/45' : 'bg-texto-3'}`}
        style={aberta ? { animation: 'pulsa 2s ease-in-out infinite' } : undefined}
      />
      {texto}
    </span>
  );
}
