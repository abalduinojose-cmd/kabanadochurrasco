'use client';

import { useEntrega } from '@/store/entrega';
import { useEscolhaEntrega } from './EscolhaEntrega';
import { LOJA } from '@/data/loja';

/**
 * Entrega | Retirada, o segmentado do iFood. A escolha vale para a sacola e
 * o checkout; escolher Entrega sem bairro definido abre a folha do bairro.
 */
export function SegmentoEntrega() {
  const modo = useEntrega((s) => s.modo);
  const definir = useEntrega((s) => s.definir);
  const abrir = useEscolhaEntrega((s) => s.abrir);
  if (!LOJA.retiradaNoLocal) return null;

  const opcoes = [
    { id: 'entrega', rotulo: 'Entrega' },
    { id: 'retirada', rotulo: 'Retirada' },
  ] as const;

  return (
    <div role="radiogroup" aria-label="Como receber" className="mb-3 flex rounded-[10px] bg-fundo-2 p-[3px]">
      {opcoes.map((o) => {
        const ativo = modo === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => {
              definir(o.id);
              if (o.id === 'entrega' && !useEntrega.getState().bairro) abrir();
            }}
            className={`min-h-10 flex-1 rounded-lg py-2 text-[14px] font-semibold transition-colors ${
              ativo ? 'bg-cartao text-texto shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'text-texto-2'
            }`}
          >
            {o.rotulo}
          </button>
        );
      })}
    </div>
  );
}
