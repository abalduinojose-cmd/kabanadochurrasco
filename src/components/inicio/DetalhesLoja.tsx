'use client';

import { create } from 'zustand';
import { ChevronRight, Clock, MapPin } from 'lucide-react';
import { Folha } from '@/components/ui/Folha';
import { StatusLoja } from '@/components/layout/StatusLoja';
import { LOJA, type DiaSemana } from '@/data/loja';
import { NOMES_DIA } from '@/lib/store-hours';

/**
 * A folha "Sobre a loja" do iFood: horários por dia e endereço.
 * Abre pela seta do cartão da loja.
 */

const useDetalhes = create<{ aberto: boolean; abrir: () => void; fechar: () => void }>((set) => ({
  aberto: false,
  abrir: () => set({ aberto: true }),
  fechar: () => set({ aberto: false }),
}));

const DIAS: readonly DiaSemana[] = [1, 2, 3, 4, 5, 6, 0];
const curto = (d: DiaSemana) => NOMES_DIA[d].replace('-feira', '');

export function BotaoDetalhes() {
  const abrir = useDetalhes((s) => s.abrir);
  return (
    <button
      type="button"
      onClick={abrir}
      aria-label="Ver detalhes da loja"
      className="grid size-11 shrink-0 place-items-center rounded-full text-texto-2 hover:bg-fundo-2"
    >
      <ChevronRight className="size-6" aria-hidden />
    </button>
  );
}

export function DetalhesLoja() {
  const aberto = useDetalhes((s) => s.aberto);
  const fechar = useDetalhes((s) => s.fechar);
  if (!aberto) return null;

  return (
    <Folha aoFechar={fechar} titulo={LOJA.nome}>
      <p className="text-[14px] text-texto-2">{LOJA.tagline}</p>
      <div className="mt-2">
        <StatusLoja />
      </div>

      <h3 className="mt-6 flex items-center gap-2 text-[15px] font-bold">
        <Clock className="size-4 text-texto-2" aria-hidden /> Horário de funcionamento
      </h3>
      <ul className="mt-2 divide-y divide-divisor">
        {DIAS.map((d) => {
          const janelas = LOJA.horarios[d];
          return (
            <li key={d} className="flex justify-between py-2 text-[14px]">
              <span className="capitalize text-texto-2">{curto(d)}</span>
              <span className={janelas ? 'text-texto' : 'text-texto-3'}>
                {janelas ? janelas.map((j) => `${j.abre} às ${j.fecha}`).join(' e ') : 'Fechado'}
              </span>
            </li>
          );
        })}
      </ul>

      <h3 className="mt-6 flex items-center gap-2 text-[15px] font-bold">
        <MapPin className="size-4 text-texto-2" aria-hidden /> Endereço
      </h3>
      <p className="mt-2 text-[14px] text-texto-2">
        {LOJA.endereco === 'TODO' ? (
          <span className="text-vermelho">Endereço ainda não cadastrado em loja.ts</span>
        ) : (
          `${LOJA.endereco}, ${LOJA.cidade}/${LOJA.uf}`
        )}
      </p>
    </Folha>
  );
}
