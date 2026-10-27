'use client';

import { useEffect, useState } from 'react';
import { Banknote, Check, Copy, CreditCard, QrCode, type LucideIcon } from 'lucide-react';
import { LOJA } from '@/data/loja';
import { maskTelefone } from '@/lib/mask';

/**
 * Formas de pagamento em cartões: ícone colorido, nome curto e o detalhe que
 * importa (troco, maquininha). O Pix mostra a chave e copia com um toque,
 * confirmando ali mesmo.
 */

type Visual = { nome: string; detalhe: string; icone: LucideIcon; cor: string };

const VISUAL: Readonly<Record<string, Visual>> = {
  dinheiro: { nome: 'Dinheiro', detalhe: 'Com troco, se precisar', icone: Banknote, cor: 'bg-verde-suave text-verde' },
  pix: { nome: 'Pix', detalhe: 'Chave celular', icone: QrCode, cor: 'bg-[#e6f6f3] text-[#0f8a78]' },
  debito: { nome: 'Débito', detalhe: 'Na maquininha', icone: CreditCard, cor: 'bg-[#e8f0fe] text-[#1a73e8]' },
  credito: { nome: 'Crédito', detalhe: 'Na maquininha', icone: CreditCard, cor: 'bg-fogo-suave text-fogo-texto' },
};

export function FormasPagamento() {
  const [copiado, setCopiado] = useState(false);
  const chave = LOJA.chavePix;

  useEffect(() => {
    if (!copiado) return;
    const t = window.setTimeout(() => setCopiado(false), 2000);
    return () => window.clearTimeout(t);
  }, [copiado]);

  async function copiar() {
    if (!chave) return;
    try {
      await navigator.clipboard.writeText(chave);
      setCopiado(true);
    } catch {
      // sem permissão de área de transferência
    }
  }

  return (
    <ul className="mt-3 grid grid-cols-2 gap-2">
      {LOJA.pagamentos.map((p) => {
        const v = VISUAL[p.id] ?? { nome: p.label, detalhe: '', icone: CreditCard, cor: 'bg-fundo-2 text-texto' };
        const Icone = v.icone;
        const ehPix = p.id === 'pix' && Boolean(chave);
        return (
          <li key={p.id} className={`flex flex-col gap-2 rounded-[18px] bg-fundo-2 p-3.5 ${ehPix ? 'col-span-2' : ''}`}>
            <div className="flex items-center gap-3">
              <span className={`grid size-10 shrink-0 place-items-center rounded-[13px] ${v.cor}`}>
                <Icone className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-extrabold text-texto">{v.nome}</p>
                <p className="text-[12.5px] text-texto-2">{ehPix ? `${v.detalhe}: ${maskTelefone(chave)}` : v.detalhe}</p>
              </div>
              {ehPix && (
                <button
                  type="button"
                  onClick={() => void copiar()}
                  className={`inline-flex h-10 min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold transition-colors duration-150 ${
                    copiado ? 'bg-verde text-white' : 'bg-cartao text-texto shadow-[0_0_0_1px_var(--color-borda)]'
                  }`}
                >
                  {copiado ? <Check className="size-4" strokeWidth={2.75} aria-hidden /> : <Copy className="size-4" aria-hidden />}
                  {copiado ? 'Copiada' : 'Copiar chave'}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
