'use client';

import Link from 'next/link';
import { UserRoundPlus, X } from 'lucide-react';
import { useCliente } from '@/store/cliente';

/**
 * O convite do cadastro no Início, para quem ainda não fez: uma faixa no
 * carvão com "Cadastrar" e o X (fechado uma vez, não volta). Some depois do
 * cadastro. Nasce escondido até os dados hidratarem.
 */
export function ConviteCadastro() {
  const hidratado = useCliente((s) => s.hidratado);
  const cadastroEm = useCliente((s) => s.cadastroEm);
  const fechado = useCliente((s) => s.conviteFechado);
  const fechar = useCliente((s) => s.fecharConvite);

  if (!hidratado || cadastroEm || fechado) return null;

  return (
    <div className="px-4 pt-5">
      <div className="relative flex items-center gap-3 rounded-[22px] bg-brasa py-3 pl-3 pr-11 text-white">
        <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-fogo text-carvao">
          <UserRoundPlus className="size-5" strokeWidth={2.2} aria-hidden />
        </span>
        <Link href="/cadastro" className="min-w-0 flex-1 after:absolute after:inset-0 after:rounded-[22px]">
          <span className="block text-[14.5px] font-extrabold">Faça seu cadastro</span>
          <span className="block text-[12.5px] leading-snug text-white/65">Peça mais rápido: o checkout já vem preenchido.</span>
        </Link>
        <button
          type="button"
          onClick={fechar}
          aria-label="Fechar o convite do cadastro"
          className="absolute right-1 top-1/2 z-10 grid size-10 min-h-10 -translate-y-1/2 place-items-center rounded-full text-white/55 hover:bg-white/10"
        >
          <X className="size-[18px]" aria-hidden />
        </button>
      </div>
    </div>
  );
}
