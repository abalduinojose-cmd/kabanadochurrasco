'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useCarrinho } from '@/store/cart';

/** "Limpar" na barra da sacola, em dois toques: o segundo confirma, dentro de 3 s. */
export function BotaoLimpar() {
  const quantas = useCarrinho((s) => s.linhas.length);
  const limpar = useCarrinho((s) => s.limpar);
  const mostrar = useToast((s) => s.mostrar);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    if (!confirmando) return;
    const t = window.setTimeout(() => setConfirmando(false), 3000);
    return () => window.clearTimeout(t);
  }, [confirmando]);

  if (quantas === 0) return null;

  return (
    <button
      type="button"
      onClick={() => {
        if (!confirmando) {
          setConfirmando(true);
          return;
        }
        limpar();
        setConfirmando(false);
        mostrar('Sacola esvaziada');
      }}
      className={`inline-flex h-11 items-center rounded-full px-3 text-[13px] font-bold transition-colors ${
        confirmando ? 'bg-vermelho-suave text-vermelho' : 'text-fogo-texto'
      }`}
    >
      {confirmando ? 'Confirmar' : 'Limpar'}
    </button>
  );
}
