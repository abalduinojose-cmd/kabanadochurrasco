'use client';

import Link from 'next/link';
import { AlertTriangle, ShoppingBag } from 'lucide-react';
import { LinhaSacola } from './LinhaSacola';
import { ResumoEntrega } from './ResumoEntrega';
import { DesfazerToast } from '@/components/cart/DesfazerToast';
import { PecaTambem } from '@/components/inicio/PecaTambem';
import { useEscolhaEntrega } from '@/components/inicio/EscolhaEntrega';
import { Button, LinkBotao } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCarrinho, selSubtotal, selUnidadesDeEspeto } from '@/store/cart';
import { useEntrega } from '@/store/entrega';
import { formatBRL } from '@/lib/money';
import { PEDIDO_MINIMO, faltaParaMinimo, taxaEntrega } from '@/lib/delivery';
import { avisosDoCarrinho, CATEGORIAS_DE_ESPETO } from '@/lib/regras-pedido';
import { LOJA } from '@/data/loja';

/**
 * A sacola do iFood: itens com o seletor, "Adicionar mais itens", a barra de
 * progresso até o pedido mínimo, como receber (com a taxa do bairro),
 * "Complete seu pedido", resumo de valores e o Continuar fixo. Os avisos
 * vêm de `lib/regras-pedido.ts`, a mesma função que bloqueia no checkout.
 */
export function Sacola() {
  const hidratado = useCarrinho((s) => s.hidratado);
  const linhas = useCarrinho((s) => s.linhas);
  const subtotal = useCarrinho(selSubtotal);
  const espetos = useCarrinho(selUnidadesDeEspeto(CATEGORIAS_DE_ESPETO));
  const modo = useEntrega((s) => s.modo);
  const bairro = useEntrega((s) => s.bairro);
  const abrirEntrega = useEscolhaEntrega((s) => s.abrir);

  if (!hidratado) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (linhas.length === 0) {
    return (
      <div className="px-6 py-20 text-center">
        <ShoppingBag className="mx-auto size-12 text-texto-3" strokeWidth={1.5} aria-hidden />
        <p className="mt-4 text-[18px] font-extrabold text-texto">Sua sacola está vazia</p>
        <p className="mx-auto mt-2 max-w-[28ch] text-[14px] text-texto-2">Adicione itens do cardápio para fazer o pedido.</p>
        <LinkBotao href="/" className="mt-6">
          Ver cardápio
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
      <div className="px-4">
        <p className="pt-4 text-[13px] text-texto-2">
          {itens} {itens === 1 ? 'item' : 'itens'} na {LOJA.nome}
        </p>
        <ul>
          {linhas.map((l) => (
            <LinhaSacola key={l.uid} linha={l} />
          ))}
        </ul>
        <Link href="/" className="flex min-h-12 items-center text-[14px] font-bold text-fogo-texto">
          Adicionar mais itens
        </Link>
      </div>

      {falta > 0 && (
        <div className="mx-4 mt-2 rounded-cartao bg-fogo-suave px-3.5 py-3">
          <p className="text-[13px] leading-snug text-texto">
            Faltam <b className="font-bold">{formatBRL(falta)}</b> para o pedido mínimo de {formatBRL(PEDIDO_MINIMO)}.
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/70" role="progressbar" aria-valuemin={0} aria-valuemax={PEDIDO_MINIMO} aria-valuenow={subtotal}>
            <div className="h-full rounded-full bg-fogo transition-[width] duration-300" style={{ width: `${Math.min(100, (subtotal / PEDIDO_MINIMO) * 100)}%` }} />
          </div>
        </div>
      )}

      {avisos.length > 0 && (
        <div className="space-y-2 px-4 pt-2">
          {avisos.map((a) => (
            <div key={a.id} className="flex items-start gap-2.5 rounded-cartao bg-fogo-suave px-3.5 py-3">
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

      <div className="separador mt-4" />

      <ResumoEntrega />

      <div className="separador" />

      <PecaTambem
        titulo="Complete seu pedido"
        categorias={linhas.map((l) => l.categoriaId)}
        excluir={linhas.map((l) => l.itemId)}
        className="py-4"
      />

      <div className="separador" />

      <section className="px-4 py-4" aria-label="Resumo de valores">
        <h2 className="text-[15px] font-bold text-texto">Resumo de valores</h2>
        <dl className="mt-3 space-y-2 text-[14px]">
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
          <div className="flex justify-between border-t border-divisor pt-2 text-[15px] font-extrabold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatBRL(total)}</dd>
          </div>
        </dl>
      </section>

      <footer className="pb-seguro fixed inset-x-0 bottom-0 z-30 border-t border-divisor bg-cartao px-4 pt-3">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <div className="shrink-0">
            <p className="text-legenda text-texto-2">{taxa === null ? 'Total sem entrega' : 'Total'}</p>
            <p className="text-[17px] font-extrabold tabular-nums text-texto">{formatBRL(total)}</p>
          </div>
          {bloqueado ? (
            <Button className="flex-1" disabled>
              Continuar
            </Button>
          ) : precisaDeBairro ? (
            <Button className="flex-1" onClick={abrirEntrega}>
              Escolher bairro
            </Button>
          ) : (
            <LinkBotao href="/checkout" className="flex-1">
              Continuar
            </LinkBotao>
          )}
        </div>
      </footer>

      <DesfazerToast />
    </>
  );
}
