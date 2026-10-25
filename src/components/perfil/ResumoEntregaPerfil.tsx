'use client';

import { Bike, ChevronRight, Store } from 'lucide-react';
import { EscolhaEntrega, useEscolhaEntrega } from '@/components/inicio/EscolhaEntrega';
import { useEntrega } from '@/store/entrega';
import { LOJA } from '@/data/loja';

/** Linha "Como receber" do Perfil: a escolha atual, abrindo a mesma folha da loja. */
export function ResumoEntregaPerfil() {
  const modo = useEntrega((s) => s.modo);
  const bairro = useEntrega((s) => s.bairro);
  const abrir = useEscolhaEntrega((s) => s.abrir);
  const retirada = LOJA.retiradaNoLocal && modo === 'retirada';

  return (
    <li className="border-b border-divisor last:border-b-0">
      <button type="button" onClick={abrir} className="flex min-h-14 w-full items-center gap-3 py-2.5 text-left active:bg-fundo-2">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-fundo-2 text-texto">
          {retirada ? <Store className="size-5" aria-hidden /> : <Bike className="size-5" aria-hidden />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-texto">Como receber</span>
          <span className="block truncate text-[13px] text-texto-2">
            {retirada ? 'Retirada na loja' : bairro ? `Entrega em ${bairro}` : 'Escolha o bairro da entrega'}
          </span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-texto-3" aria-hidden />
      </button>
      <EscolhaEntrega />
    </li>
  );
}
