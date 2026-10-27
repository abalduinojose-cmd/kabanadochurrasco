import { Flame } from 'lucide-react';

/** O selo à frente dos títulos do cardápio: a chama laranja no carvão da fachada, pequena. */
export function SeloBrasa() {
  return (
    <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-[11px] bg-brasa text-fogo">
      <Flame className="size-[18px] fill-fogo/25" strokeWidth={2.2} />
    </span>
  );
}
