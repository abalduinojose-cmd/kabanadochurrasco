'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, Plus, ShoppingBag } from 'lucide-react';
import { LinhaSacola } from './LinhaSacola';
import { ComoReceber } from './ComoReceber';
import { DesfazerToast } from '@/components/cart/DesfazerToast';
import { PecaTambem } from '@/components/inicio/PecaTambem';
import { useEscolhaEntrega } from '@/components/inicio/EscolhaEntrega';
import { LogoKabana } from '@/components/layout/LogoKabana';
import { StatusLoja } from '@/components/layout/StatusLoja';
import { LinkBotao } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCarrinho, selSubtotal, selUnidadesDeEspeto } from '@/store/cart';
import { useEntrega } from '@/store/entrega';
import { formatBRL } from '@/lib/money';
import { PEDIDO_MINIMO, faltaParaMinimo, taxaEntrega } from '@/lib/delivery';
import { avisosDoCarrinho, CATEGORIAS_DE_ESPETO } from '@/lib/regras-pedido';
import { LOJA } from '@/data/loja';

/**
 * A sacola: a loja no topo, os itens em cartão com miniatura e seletor em
 * pílula, "Adicionar mais itens", "Como você quer receber?" (a escolha mora
 * aqui, no fim do pedido), "Complete seu pedido", o resumo de valores e um
 * botão único embaixo com o total. Os avisos vêm de `lib/regras-pedido.ts`,
 * a mesma função que bloqueia no checkout.
 */
export function Sacola() {
  const hidratado = useCarrinho((s) => s.hidratado);
  const linhas = useCarrinho((s) => s.linhas);
  const subtotal = useCarrinho(selSubtotal);
  const espetos = useCarrinho(selUnidadesDeEspeto(CATEGORIAS_DE_ESPETO));
  const modo = useEntrega((s) => s.modo);
  const bairro = useEntrega((s) => s.bairro);
  const abrirBairro = useEscolhaEntrega((s) => s.abrirBairro);

  if (!hidratado) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (linhas.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <div className="relative mx-auto grid size-28 place-items-center rounded-full bg-fogo-suave">
          <ShoppingBag className="size-11 text-fogo-texto" strokeWidth={1.75} aria-hidden />
        </div>
        <p className="mt-6 text-[20px] font-extrabold tracking-[-0.01em] text-texto">Sua sacola está vazia</p>
        <p className="mx-auto mt-2 max-w-[30ch] text-[14px] leading-relaxed text-texto-2">
          Escolha um burger, uns espetinhos ou uma tábua para dividir. A gente monta o pedido para você mandar no WhatsApp.
        </p>
        <LinkBotao href="/" className="mt-7 px-8">
          Ver o cardápio
        </LinkBotao>
      </div>
    );
  }

  const retirada = LOJA.retiradaNoLocal && modo === 'retirada';
  const taxa = retirada ? 0 : bairro ? taxaEntrega('entrega', bairro) : null;
  const total = subtotal + (taxa ?? 0);
  const falta = faltaParaMinimo(subtotal);
  const avisos = avisosDoCarrinho(subtotal, espetos).filter((a) => a.id !== 'pedido-minimo');
  const itens = linhas.reduce((t, l) => t + l.quantidade, 0);
  const precisaDeBairro = !retirada && !bairro;
  const bloqueado = falta > 0 || avisos.length > 0;

  return (
    <>
      {/* A loja, como no topo da sacola do iFood. */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-carvao">
          <LogoKabana sizes="36px" alt="" className="w-[36px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-extrabold text-texto">{LOJA.nome}</p>
          <StatusLoja className="text-[12.5px]" />
        </div>
        <Link href="/" className="inline-flex min-h-10 items-center rounded-full bg-fundo-2 px-3.5 text-[13px] font-bold text-texto">
          Cardápio
        </Link>
      </div>

      <section aria-label="Itens da sacola" className="mx-4 mt-4 rounded-[20px] bg-cartao px-4 shadow-[0_0_0_1px_var(--color-borda),0_8px_24px_-16px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between pt-4">
          <h2 className="text-[16px] font-extrabold text-texto">Seu pedido</h2>
          <span className="text-[13px] font-medium text-texto-2">
            {itens} {itens === 1 ? 'item' : 'itens'}
          </span>
        </div>
        <ul className="divide-y divide-divisor">
          {linhas.map((l) => (
            <LinhaSacola key={l.uid} linha={l} />
          ))}
        </ul>
        <Link
          href="/"
          className="-mx-4 flex min-h-[52px] items-center justify-center gap-2 border-t border-dashed border-borda text-[14px] font-bold text-fogo-texto active:bg-fogo-suave"
        >
          <Plus className="size-4" strokeWidth={2.75} aria-hidden />
          Adicionar mais itens
        </Link>
      </section>

      {falta > 0 && (
        <div className="mx-4 mt-3 rounded-[16px] bg-fogo-suave px-4 py-3">
          <p className="text-[13px] leading-snug text-texto">
            Faltam <b className="font-bold">{formatBRL(falta)}</b> para o pedido mínimo de {formatBRL(PEDIDO_MINIMO)}.
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70" role="progressbar" aria-valuemin={0} aria-valuemax={PEDIDO_MINIMO} aria-valuenow={subtotal}>
            <div className="h-full rounded-full bg-fogo transition-[width] duration-300" style={{ width: `${Math.min(100, (subtotal / PEDIDO_MINIMO) * 100)}%` }} />
          </div>
        </div>
      )}

      {avisos.length > 0 && (
        <div className="space-y-2 px-4 pt-3">
          {avisos.map((a) => (
            <div key={a.id} className="flex items-start gap-2.5 rounded-[16px] bg-fogo-suave px-4 py-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-fogo-texto" aria-hidden />
              <div className="flex-1">
                <p className="text-[13px] leading-snug text-texto">{a.mensagem}</p>
                {a.atalho && (
                  <Link href={a.atalho.href} className="mt-1 inline-block text-[13px] font-bold text-fogo-texto">
                    {a.atalho.texto}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <PecaTambem
        titulo="Complete seu pedido"
        categorias={linhas.map((l) => l.categoriaId)}
        excluir={linhas.map((l) => l.itemId)}
        className="pt-7"
      />

      <ComoReceber />

      <section aria-label="Resumo de valores" className="mx-4 mt-7 rounded-[20px] bg-fundo-2 px-4 py-4">
        <dl className="space-y-2.5 text-[14px]">
          <div className="flex justify-between">
            <dt className="text-texto-2">Subtotal</dt>
            <dd className="tabular-nums text-texto">{formatBRL(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-texto-2">{retirada ? 'Retirada na loja' : 'Taxa de entrega'}</dt>
            <dd className={taxa === 0 ? 'font-semibold text-verde' : taxa === null ? 'text-texto-2' : 'tabular-nums text-texto'}>
              {taxa === 0 ? 'Grátis' : taxa === null ? 'escolha o bairro' : formatBRL(taxa)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-borda pt-3">
            <dt className="text-[16px] font-extrabold text-texto">Total</dt>
            <dd className="text-[20px] font-extrabold tabular-nums tracking-[-0.01em] text-texto">{formatBRL(total)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-[12px] leading-snug text-texto-2">Formas de pagamento: {LOJA.pagamentos.map((p) => p.label).join(', ')}.</p>
      </section>

      <footer className="pb-seguro fixed inset-x-0 bottom-0 z-30 border-t border-divisor bg-cartao/95 px-4 pt-3 backdrop-blur-md">
        <div className="mx-auto max-w-2xl">
          {bloqueado ? (
            <button type="button" disabled className="flex h-14 w-full items-center justify-center rounded-[16px] bg-fundo-2 text-[15px] font-bold text-texto-3">
              Ajuste o pedido para continuar
            </button>
          ) : precisaDeBairro ? (
            <button
              type="button"
              onClick={abrirBairro}
              className="flex h-14 w-full items-center justify-between rounded-[16px] bg-carvao px-5 text-white active:brightness-110"
            >
              <span className="text-[15px] font-bold">Escolher o bairro</span>
              <span className="text-[13px] font-semibold text-white/70">para calcular a entrega</span>
            </button>
          ) : (
            <Link
              href="/checkout"
              className="flex h-14 w-full items-center justify-between rounded-[16px] bg-fogo px-5 text-carvao active:brightness-95"
            >
              <span className="inline-flex items-center gap-2 text-[16px] font-extrabold">
                Continuar
                <ArrowRight className="size-5" strokeWidth={2.5} aria-hidden />
              </span>
              <span className="text-[16px] font-extrabold tabular-nums">{formatBRL(total)}</span>
            </Link>
          )}
        </div>
      </footer>

      <DesfazerToast />
    </>
  );
}
