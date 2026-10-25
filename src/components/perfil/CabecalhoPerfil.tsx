'use client';

import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { useCliente } from '@/store/cliente';
import { usePedidos } from '@/store/pedidos';

/**
 * O topo do Perfil: quem é a pessoa (nome e WhatsApp do último pedido) ou o
 * convite para o primeiro pedido. Dados só deste aparelho.
 */
export function CabecalhoPerfil() {
  const dados = useCliente((s) => s.dados);
  const quantos = usePedidos((s) => s.pedidos.length);
  const inicial = dados?.nome.trim().charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 px-4 pb-5" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
      <span className="grid size-14 shrink-0 place-items-center rounded-full bg-fogo-suave text-[22px] font-extrabold text-fogo-texto">
        {inicial || <UserRound className="size-7" aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[20px] font-extrabold leading-tight text-texto">{dados ? `Olá, ${dados.nome.split(' ')[0]}` : 'Olá!'}</p>
        <p className="text-[13px] text-texto-2">
          {dados ? dados.telefone : 'Seus dados ficam salvos depois do primeiro pedido.'}
          {quantos > 0 && ` • ${quantos} ${quantos === 1 ? 'pedido' : 'pedidos'}`}
        </p>
      </div>
      <Link href="/dados" className="shrink-0 text-[13px] font-bold text-fogo-texto">
        {dados ? 'Editar' : 'Preencher'}
      </Link>
    </div>
  );
}
