import { Ticket } from 'lucide-react';
import { LOJA } from '@/data/loja';

/** Faixa de promoção, como o cupom do iFood. Só aparece com promoção real em loja.ts. */
export function Cupom() {
  const p = LOJA.promocao;
  if (!p) return null;
  return (
    <div className="mx-auto mb-3 flex w-[calc(100%-2rem)] max-w-[40rem] items-center gap-3 rounded-cartao border border-dashed border-fogo bg-fogo-suave px-3 py-2.5 text-[13px]">
      <Ticket className="size-5 shrink-0 text-fogo-texto" aria-hidden />
      <p>
        <b className="font-bold text-fogo-texto">{p.titulo}</b> {p.texto}
      </p>
    </div>
  );
}
