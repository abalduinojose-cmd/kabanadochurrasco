'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, MessageCircle, RotateCcw } from 'lucide-react';
import { Button, LinkBotao } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Acompanhamento } from './Acompanhamento';
import { OrderReview } from './OrderReview';
import { usePedidos } from '@/store/pedidos';
import { useCarrinho } from '@/store/cart';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { formatBRL } from '@/lib/money';
import { carimboDeHora } from '@/lib/order-id';
import { CURVA, mola } from '@/lib/motion/curvas';
import { atrasosEmCascata } from '@/lib/motion/cascata';
import { querMovimento } from '@/lib/motion/reduce';
import { animar, aoTerminar } from '@/lib/motion/waapi';
import { LOJA } from '@/data/loja';
import type { Pedido } from '@/types/pedido';

/**
 * "Pedido realizado", como a tela do iFood: o selo verde assenta em mola,
 * depois título, id, acompanhamento e botões em cascata curta. Tudo por
 * relógio; ao fim o estado final vai para o estilo inline antes de cancelar.
 */
export function Confirmacao() {
  const id = useSearchParams().get('id') ?? '';
  const router = useRouter();
  const hidratado = usePedidos((s) => s.hidratado);
  const pedidos = usePedidos((s) => s.pedidos);
  const restaurar = useCarrinho((s) => s.restaurar);

  const pedido = pedidos.find((p) => p.id === id);

  if (!hidratado) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-[18px] font-extrabold text-texto">Pedido não encontrado</p>
        <p className="mx-auto mt-2 max-w-[30ch] text-[14px] text-texto-2">
          Este aparelho não tem registro do pedido {id}. Se você já mandou pelo WhatsApp, a loja recebeu.
        </p>
        <LinkBotao href="/" className="mt-6">
          Ver cardápio
        </LinkBotao>
      </div>
    );
  }

  return (
    <Pouso
      pedido={pedido}
      aoPedirDeNovo={() => {
        restaurar(pedido.linhas);
        router.push('/sacola');
      }}
    />
  );
}

function Pouso({ pedido, aoPedirDeNovo }: { pedido: Pedido; aoPedirDeNovo: () => void }) {
  const palco = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raiz = palco.current;
    if (!raiz) return;
    const selo = raiz.querySelector<HTMLElement>('[data-pouso="selo"]');
    const faixas = Array.from(raiz.querySelectorAll<HTMLElement>('[data-pouso="faixa"]'));
    const pleno = querMovimento();
    const anims: Animation[] = [];

    if (selo) {
      const m = mola({ response: 0.5, dampingFraction: 0.7 });
      anims.push(
        pleno
          ? animar(selo, [{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'scale(1)' }], {
              duration: m.duration,
              delay: 120,
              easing: m.easing,
            })
          : animar(selo, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 100 }),
      );
    }

    const inicio = pleno ? 420 : 300;
    const atrasos = atrasosEmCascata(faixas.length, { inicio, vao: 70 });
    faixas.forEach((el, i) => {
      anims.push(
        animar(
          el,
          pleno
            ? [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }]
            : [{ opacity: 0 }, { opacity: 1 }],
          { duration: pleno ? 380 : 200, delay: atrasos[i] ?? inicio, easing: CURVA.power4out },
        ),
      );
    });

    // O estado final vai para o estilo inline ANTES de cancelar: cancelar
    // derruba o `fill` e a classe estática `opacity-0` voltaria.
    const alvos = [selo, ...faixas].filter((el): el is HTMLElement => el !== null);
    const assentar = () => {
      for (const el of alvos) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
      for (const a of anims) a.cancel();
    };
    const teto = new Promise<void>((r) => window.setTimeout(r, 2000));
    void Promise.race([Promise.all(anims.map(aoTerminar)), teto]).then(assentar);
    return assentar;
  }, []);

  return (
    <div ref={palco} className="pb-16">
      <section className="px-6 pb-6 pt-10 text-center">
        <span data-pouso="selo" className="mx-auto grid size-16 place-items-center rounded-full bg-verde text-fundo opacity-0">
          <Check className="size-8" strokeWidth={3} aria-hidden />
        </span>
        <h2 data-pouso="faixa" className="mt-5 text-[22px] font-extrabold leading-tight text-texto opacity-0">
          Pedido realizado
        </h2>
        <p data-pouso="faixa" className="mx-auto mt-2 max-w-[32ch] text-[14px] text-texto-2 opacity-0">
          Confirme o envio na conversa do WhatsApp. A loja responde por lá.
        </p>
        <p data-pouso="faixa" className="mt-4 inline-flex flex-col rounded-cartao bg-fundo-2 px-4 py-2.5 opacity-0">
          <span className="text-[15px] font-extrabold text-texto">#{pedido.id}</span>
          <span className="text-legenda text-texto-2">{carimboDeHora(new Date(pedido.criadoEm))}</span>
        </p>
      </section>

      <div data-pouso="faixa" className="space-y-3 px-4 opacity-0">
        <LinkBotao href={buildWhatsAppUrl(pedido)} className="w-full">
          <MessageCircle className="size-5" aria-hidden />
          Reabrir no WhatsApp
        </LinkBotao>
        <Button variante="secundario" className="w-full" onClick={aoPedirDeNovo}>
          <RotateCcw className="size-4" aria-hidden />
          Pedir de novo
        </Button>
      </div>

      <div data-pouso="faixa" className="mt-6 opacity-0">
        <div className="separador mb-5" />
        <Acompanhamento pedido={pedido} />

        <div className="separador mt-5" />
        <OrderReview
          linhas={pedido.linhas}
          subtotal={pedido.subtotalCents}
          taxa={pedido.taxaEntregaCents}
          total={pedido.totalCents}
          cupom={pedido.cupom}
          desconto={pedido.descontoCents}
          modo={pedido.modo}
          bairro={pedido.entrega?.bairro ?? null}
        />

        <dl className="mt-5 space-y-4 px-4 text-[14px]">
          <div>
            <dt className="font-bold text-texto">{pedido.modo === 'entrega' ? 'Entrega' : 'Retirada no local'}</dt>
            <dd className="mt-1 leading-snug text-texto-2">
              {pedido.entrega ? (
                <>
                  {pedido.entrega.rua}, {pedido.entrega.numero}, {pedido.entrega.bairro}
                  {pedido.entrega.complemento && <br />}
                  {pedido.entrega.complemento}
                  {pedido.entrega.referencia && <br />}
                  {pedido.entrega.referencia}
                </>
              ) : (
                `${LOJA.endereco}, ${LOJA.cidade}/${LOJA.uf}`
              )}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-texto">Pagamento</dt>
            <dd className="mt-1 text-texto-2">
              {pedido.pagamento.label}
              {pedido.pagamento.trocoParaCents !== undefined && (
                <>
                  , troco para {formatBRL(pedido.pagamento.trocoParaCents)}
                  {pedido.pagamento.trocoCents !== undefined && (
                    <span className="text-texto"> (levar {formatBRL(pedido.pagamento.trocoCents)})</span>
                  )}
                </>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex min-h-11 items-center text-[14px] font-bold text-fogo-texto">
            Voltar ao cardápio
          </Link>
        </div>
      </div>
    </div>
  );
}
