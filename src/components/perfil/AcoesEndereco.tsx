'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Navigation } from 'lucide-react';

/**
 * Os botões debaixo do mapa: "Como chegar" (rota no Google Maps, o principal),
 * Waze (o app de rota mais usado no Brasil) e copiar o endereço, que confirma
 * ali mesmo por 2 s, sem depender de toast.
 */

type Props = { rotaGoogle: string; rotaWaze: string | null; endereco: string };

export function AcoesEndereco({ rotaGoogle, rotaWaze, endereco }: Props) {
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) return;
    const t = window.setTimeout(() => setCopiado(false), 2000);
    return () => window.clearTimeout(t);
  }, [copiado]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(endereco);
      setCopiado(true);
    } catch {
      // sem permissão de área de transferência: nada a fazer
    }
  }

  return (
    <div className="mt-3.5 flex gap-2">
      <a
        href={rotaGoogle}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] bg-fogo text-[15px] font-extrabold text-carvao shadow-[0_8px_18px_-10px_rgba(255,106,0,0.9)] transition-transform duration-150 active:scale-[0.98]"
      >
        <Navigation className="size-[18px]" strokeWidth={2.5} aria-hidden />
        Como chegar
      </a>
      {rotaWaze && (
        <a
          href={rotaWaze}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir a rota no Waze"
          className="flex h-12 items-center justify-center rounded-[14px] bg-[#e8f7fd] px-4 text-[14px] font-extrabold text-[#0b7aa5] transition-transform duration-150 active:scale-[0.98]"
        >
          Waze
        </a>
      )}
      <button
        type="button"
        onClick={() => void copiar()}
        aria-label={copiado ? 'Endereço copiado' : 'Copiar o endereço'}
        className={`grid h-12 w-12 min-h-12 shrink-0 place-items-center rounded-[14px] transition-colors duration-150 ${copiado ? 'bg-verde-suave text-verde' : 'bg-fundo-2 text-texto'}`}
      >
        {copiado ? <Check className="size-5" strokeWidth={2.5} aria-hidden /> : <Copy className="size-[18px]" aria-hidden />}
      </button>
    </div>
  );
}
