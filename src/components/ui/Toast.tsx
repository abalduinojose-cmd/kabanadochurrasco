'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { Check } from 'lucide-react';

/**
 * Toast curto, como o "Adicionado à sacola" do iFood: sobe acima das barras,
 * some em 2,2 s, nunca rouba o foco. Também é a região viva da aplicação,
 * então o leitor de tela anuncia o mesmo texto.
 */

type ToastStore = {
  mensagem: string;
  chave: number;
  mostrar: (mensagem: string) => void;
  limpar: () => void;
};

export const useToast = create<ToastStore>((set, get) => ({
  mensagem: '',
  chave: 0,
  mostrar: (mensagem) => set({ mensagem, chave: get().chave + 1 }),
  limpar: () => set({ mensagem: '' }),
}));

const DURACAO = 2200;
const CHAVE_PENDENTE = 'kabana:toast-pendente';

/**
 * Guarda a mensagem para a próxima tela que montar o Toast. É o caso do
 * item: a volta para a loja pode ser um carregamento inteiro (deep link), e
 * a store em memória não sobreviveria; o sessionStorage sobrevive.
 */
export function mostrarNaProximaTela(mensagem: string) {
  try {
    sessionStorage.setItem(CHAVE_PENDENTE, mensagem);
  } catch {
    useToast.getState().mostrar(mensagem);
  }
}

/** Acima de quê o toast flutua: das abas + sacola, da barra de ação, ou de nada. */
const ALTURAS = {
  abas: 'calc(var(--altura-abas) + var(--altura-sacola) + max(10px, env(safe-area-inset-bottom)) + 24px)',
  barra: 'calc(92px + env(safe-area-inset-bottom))',
  nada: 'calc(24px + env(safe-area-inset-bottom))',
} as const;

export function Toast({ acima = 'abas' }: { acima?: keyof typeof ALTURAS }) {
  const mensagem = useToast((s) => s.mensagem);
  const chave = useToast((s) => s.chave);
  const mostrar = useToast((s) => s.mostrar);
  const limpar = useToast((s) => s.limpar);

  useEffect(() => {
    try {
      const pendente = sessionStorage.getItem(CHAVE_PENDENTE);
      if (pendente) {
        sessionStorage.removeItem(CHAVE_PENDENTE);
        mostrar(pendente);
      }
    } catch {
      // sem storage não há pendência
    }
  }, [mostrar]);

  useEffect(() => {
    if (!mensagem) return;
    const t = window.setTimeout(limpar, DURACAO);
    return () => window.clearTimeout(t);
  }, [mensagem, chave, limpar]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4"
      style={{ bottom: ALTURAS[acima] }}
    >
      {mensagem && (
        <div
          key={chave}
          style={{ animation: 'toast-entra 220ms var(--ease-brasa)' }}
          className="sombra-flutuante inline-flex items-center gap-2 rounded-botao bg-carvao px-4 py-3 text-[14px] font-semibold text-fundo"
        >
          <Check className="size-4 text-fogo" strokeWidth={3} aria-hidden />
          {mensagem}
        </div>
      )}
    </div>
  );
}
