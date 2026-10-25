'use client';

import { useId } from 'react';

/**
 * Campo de formulário no padrão do iFood: rótulo pequeno em cima, caixa de
 * 48px com borda cinza, foco laranja, erro em vermelho logo abaixo e ligado
 * ao campo por `aria-describedby`. Aceita o `ref` do react-hook-form como
 * prop comum (React 19).
 */

type Base = {
  rotulo: string;
  erro?: string;
  dica?: string;
  className?: string;
};

type PropsInput = Base & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> & { as?: 'input' };
type PropsSelect = Base &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> & { as: 'select'; children: React.ReactNode };

const CAIXA =
  'mt-1.5 h-12 w-full rounded-campo border bg-cartao px-3.5 text-[16px] text-texto placeholder:text-texto-3 transition-colors focus:outline-none';

/** Tira as props do rótulo antes de espalhar o resto no elemento do DOM. */
function soDoElemento(props: PropsInput | PropsSelect): Record<string, unknown> {
  const copia: Record<string, unknown> = { ...props };
  delete copia.rotulo;
  delete copia.erro;
  delete copia.dica;
  delete copia.className;
  delete copia.as;
  return copia;
}

export function Field(props: PropsInput | PropsSelect) {
  const id = useId();
  const erroId = `${id}-erro`;
  const dicaId = `${id}-dica`;
  const { rotulo, erro, dica, className = '' } = props;
  const borda = erro ? 'border-vermelho' : 'border-borda focus:border-fogo';
  const descrito = [erro ? erroId : null, dica ? dicaId : null].filter(Boolean).join(' ') || undefined;
  const elemento = soDoElemento(props);

  return (
    <div className={className}>
      <label htmlFor={id} className="text-[13px] font-semibold text-texto-2">
        {rotulo}
      </label>

      {props.as === 'select' ? (
        <select
          id={id}
          aria-invalid={Boolean(erro)}
          aria-describedby={descrito}
          className={`${CAIXA} ${borda} appearance-none`}
          {...(elemento as React.SelectHTMLAttributes<HTMLSelectElement>)}
        />
      ) : (
        <input
          id={id}
          aria-invalid={Boolean(erro)}
          aria-describedby={descrito}
          className={`${CAIXA} ${borda}`}
          {...(elemento as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {dica && !erro && (
        <p id={dicaId} className="mt-1 text-legenda text-texto-2">
          {dica}
        </p>
      )}
      {erro && (
        <p id={erroId} role="alert" className="mt-1 text-legenda font-medium text-vermelho">
          {erro}
        </p>
      )}
    </div>
  );
}
