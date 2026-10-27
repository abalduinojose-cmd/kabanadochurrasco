'use client';

import Link from 'next/link';
import { ChevronRight, MapPin, Store } from 'lucide-react';
import { LogoKabana } from '@/components/layout/LogoKabana';
import { LinkBotao } from '@/components/ui/Button';
import { useCliente } from '@/store/cliente';
import { usePedidos } from '@/store/pedidos';
import { clienteDesde } from '@/lib/cadastro';

/**
 * O topo do Perfil, no carvão da fachada. Sem cadastro: o convite para criar
 * (vai para /cadastro). Com cadastro: a inicial em laranja, o nome, o WhatsApp,
 * "Cliente desde" e os pedidos, e o endereço salvo; "Editar" abre /dados.
 * Nasce neutro até a sacola de dados hidratar, para não piscar o convite.
 */
export function CabecalhoPerfil() {
  const hidratado = useCliente((s) => s.hidratado);
  const dados = useCliente((s) => s.dados);
  const cadastroEm = useCliente((s) => s.cadastroEm);
  const quantos = usePedidos((s) => s.pedidos.length);

  const topo = { paddingTop: 'calc(env(safe-area-inset-top) + 20px)' };

  if (!hidratado) return <header className="h-[212px] bg-brasa" style={topo} aria-hidden />;

  if (!cadastroEm || !dados) {
    return (
      <header className="bg-brasa px-4 pb-12 text-white" style={topo}>
        <div className="flex items-center gap-3.5">
          <LogoKabana sizes="60px" alt="" className="w-[60px] shrink-0" />
          <div className="min-w-0">
            <p className="text-[21px] font-extrabold leading-tight tracking-[-0.02em]">{dados ? `Olá, ${dados.nome.split(' ')[0]}!` : 'Olá!'}</p>
            <p className="mt-0.5 text-[13px] text-white/60">
              {quantos > 0 ? `${quantos} ${quantos === 1 ? 'pedido' : 'pedidos'} neste aparelho` : 'Bem-vindo à Kabana'}
            </p>
          </div>
        </div>
        <div className="mt-5 rounded-[22px] bg-white/[0.06] p-4 ring-1 ring-inset ring-white/10">
          <p className="text-[16px] font-extrabold">Crie seu cadastro</p>
          <p className="mt-1 text-[13px] leading-snug text-white/65">Leva um minuto. O checkout passa a vir com seu nome, WhatsApp e endereço.</p>
          <LinkBotao href="/cadastro" className="mt-3.5 w-full">
            Fazer meu cadastro
          </LinkBotao>
        </div>
      </header>
    );
  }

  const nome = dados.nome.trim();
  const e = dados.endereco;

  return (
    <header className="bg-brasa px-4 pb-12 text-white" style={topo}>
      <div className="flex items-center gap-3.5">
        <span className="grid size-[60px] shrink-0 place-items-center rounded-full bg-fogo text-[24px] font-extrabold text-carvao shadow-[0_10px_24px_-10px_rgba(255,106,0,0.8)]">
          {nome.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[21px] font-extrabold leading-tight tracking-[-0.02em]">Olá, {nome.split(' ')[0]}</p>
          <p className="mt-0.5 text-[13px] tabular-nums text-white/65">{dados.telefone}</p>
        </div>
        <Link href="/dados" className="-mr-2 inline-flex min-h-11 shrink-0 items-center gap-0.5 rounded-full px-2 text-[13px] font-bold text-[#ff9a52] active:bg-white/10">
          Editar
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[12.5px] font-semibold">
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/80">{clienteDesde(cadastroEm)}</span>
        {quantos > 0 && (
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/80">
            {quantos} {quantos === 1 ? 'pedido' : 'pedidos'}
          </span>
        )}
      </div>

      <p className="mt-3 flex items-start gap-2 text-[13px] leading-snug text-white/70">
        {e ? <MapPin className="mt-0.5 size-4 shrink-0 text-fogo" aria-hidden /> : <Store className="mt-0.5 size-4 shrink-0 text-fogo" aria-hidden />}
        {e ? `${e.rua}, ${e.numero}${e.complemento ? ` (${e.complemento})` : ''} • ${e.bairro}` : 'Retira na loja'}
      </p>
    </header>
  );
}
