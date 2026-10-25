import { Check } from 'lucide-react';

/**
 * Linha de escolha do checkout (forma de pagamento, maioridade): a linha
 * inteira é o alvo, o controle fica à direita como no iFood.
 */

type Props = {
  tipo: 'radio' | 'checkbox';
  nome?: string;
  marcado: boolean;
  aoMudar: () => void;
  children: React.ReactNode;
  icone?: React.ReactNode;
  className?: string;
};

export function Escolha({ tipo, nome, marcado, aoMudar, children, icone, className = '' }: Props) {
  const unica = tipo === 'radio';
  return (
    <label className={`flex min-h-14 cursor-pointer items-center gap-3 border-b border-divisor py-3 last:border-b-0 ${className}`}>
      {icone && <span className="shrink-0 text-texto-2">{icone}</span>}
      <span className="min-w-0 flex-1 text-[14px] leading-snug text-texto">{children}</span>
      <input type={tipo} name={nome} checked={marcado} onChange={aoMudar} className="peer sr-only" />
      <span
        aria-hidden
        className={`grid size-[22px] shrink-0 place-items-center border-2 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fogo ${
          unica ? 'rounded-full' : 'rounded-[5px]'
        } ${marcado ? (unica ? 'border-fogo bg-cartao' : 'border-fogo bg-fogo') : 'border-texto-3 bg-cartao'}`}
      >
        {marcado && (unica ? <span className="size-2.5 rounded-full bg-fogo" /> : <Check className="size-3.5 text-carvao" strokeWidth={3.5} />)}
      </span>
    </label>
  );
}
