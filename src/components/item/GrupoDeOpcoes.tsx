'use client';

import { Check } from 'lucide-react';
import { formatBRL, toCents } from '@/lib/money';
import type { OpcaoEscolhida } from '@/types/carrinho';
import type { OptionGroup } from '@/types/menu';

/**
 * Um grupo de opções como o iFood desenha: faixa cinza com o nome, a
 * instrução ("Escolha 1 opção") e o selo OBRIGATÓRIO; abaixo, uma linha por
 * opção com o controle à direita (bolinha para escolha única, quadrado para
 * várias). A linha inteira é o alvo de toque.
 */

type Props = {
  grupo: OptionGroup;
  escolhas: readonly OpcaoEscolhida[];
  aoAlternar: (opcaoId: string) => void;
};

function instrucaoDe(grupo: OptionGroup): string {
  if (grupo.type === 'single') return 'Escolha 1 opção';
  if (grupo.max === 1) return 'Escolha até 1 opção';
  if (grupo.max) return `Escolha até ${grupo.max} opções`;
  return 'Escolha quantas quiser';
}

export function GrupoDeOpcoes({ grupo, escolhas, aoAlternar }: Props) {
  const marcadas = escolhas.filter((e) => e.grupoId === grupo.id);
  const noLimite = grupo.max !== undefined && marcadas.length >= grupo.max;
  const unica = grupo.type === 'single';

  return (
    <fieldset>
      <legend className="sr-only">{grupo.nome}</legend>
      <div className="flex items-center justify-between gap-3 bg-fundo-2 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-texto">{grupo.nome}</p>
          <p className="mt-0.5 text-[12px] text-texto-2">{instrucaoDe(grupo)}</p>
        </div>
        {grupo.required && (
          <span className="shrink-0 rounded bg-texto px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-fundo">
            Obrigatório
          </span>
        )}
      </div>

      <ul className="px-4">
        {grupo.options.map((opcao) => {
          const marcada = marcadas.some((m) => m.opcaoId === opcao.id);
          const bloqueada = !marcada && noLimite;
          const precoCents = toCents(opcao.preco);
          return (
            <li key={opcao.id} className="border-b border-divisor last:border-b-0">
              <label className={`flex min-h-14 items-center gap-3 py-3 ${bloqueada ? 'opacity-40' : 'cursor-pointer'}`}>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] text-texto">{opcao.nome}</span>
                  {precoCents > 0 && (
                    <span className="mt-0.5 block text-[13px] font-semibold text-texto-2">+ {formatBRL(precoCents)}</span>
                  )}
                </span>
                <input
                  type={unica ? 'radio' : 'checkbox'}
                  name={grupo.id}
                  checked={marcada}
                  disabled={bloqueada}
                  onChange={() => aoAlternar(opcao.id)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className={`grid size-[22px] shrink-0 place-items-center border-2 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fogo ${
                    unica ? 'rounded-full' : 'rounded-[5px]'
                  } ${marcada ? (unica ? 'border-fogo bg-cartao' : 'border-fogo bg-fogo') : 'border-texto-3 bg-cartao'}`}
                >
                  {marcada && (unica ? <span className="size-2.5 rounded-full bg-fogo" /> : <Check className="size-3.5 text-carvao" strokeWidth={3.5} />)}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
