'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bike, ChevronRight, MessageCircle, RotateCcw, Store } from 'lucide-react';
import { BrandMark } from '@/components/layout/BrandMark';
import { Button, LinkBotao } from '@/components/ui/Button';
import { useCarrinho } from '@/store/cart';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { formatBRL } from '@/lib/money';
import { carimboDeHora } from '@/lib/order-id';
import { janelaDeEntrega, textoDaJanela } from '@/lib/acompanhamento';
import type { Pedido } from '@/types/pedido';

/**
 * Um pedido do histórico, como o cartão do iFood: loja, data, itens, total
 * e as duas saídas que valem dinheiro: pedir de novo ou reabrir o WhatsApp.
 * Em andamento, ganha a faixa com a previsão e o atalho para acompanhar.
 */
export function CartaoPedido({ pedido, emAndamento = false }: { pedido: Pedido; emAndamento?: boolean }) {
  const router = useRouter();
  const restaurar = useCarrinho((s) => s.restaurar);
  const unidades = pedido.linhas.reduce((t, l) => t + l.quantidade, 0);
  const janela = janelaDeEntrega(pedido.criadoEm);

  return (
    <li className={`overflow-hidden rounded-cartao border bg-cartao ${emAndamento ? 'border-verde/40' : 'border-borda'}`}>
      {emAndamento && (
        <Link href={`/pedido?id=${encodeURIComponent(pedido.id)}`} className="flex items-center gap-2 bg-verde-suave px-4 py-2.5 text-[13px]">
          <span className="size-2 rounded-full bg-verde" style={{ animation: 'pulsa 2s ease-in-out infinite' }} aria-hidden />
          <span className="flex-1 font-semibold text-verde">
            {pedido.modo === 'entrega' ? `Previsão de entrega ${textoDaJanela(janela)}` : 'Aguardando a loja avisar que está pronto'}
          </span>
          <span className="font-bold text-verde">Acompanhar</span>
          <ChevronRight className="size-4 text-verde" aria-hidden />
        </Link>
      )}

      <div className="p-4">
        <Link href={`/pedido?id=${encodeURIComponent(pedido.id)}`} className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-carvao">
            <BrandMark recorte className="w-8" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-bold text-texto">Kabana do Churrasco</span>
            <span className="block text-legenda text-texto-2">
              #{pedido.id} • {carimboDeHora(new Date(pedido.criadoEm))}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-legenda text-texto-2">
            {pedido.modo === 'entrega' ? <Bike className="size-3.5" aria-hidden /> : <Store className="size-3.5" aria-hidden />}
            {pedido.modo === 'entrega' ? (pedido.entrega?.bairro ?? 'Entrega') : 'Retirada'}
          </span>
        </Link>

        <ul className="mt-3 space-y-1 border-t border-divisor pt-3 text-[14px] text-texto-2">
          {pedido.linhas.slice(0, 3).map((l) => (
            <li key={l.uid} className="flex gap-2">
              <span className="grid h-5 min-w-5 place-items-center rounded bg-fundo-2 px-1 text-legenda font-bold text-texto">{l.quantidade}</span>
              <span className="truncate">{l.nome}</span>
            </li>
          ))}
          {pedido.linhas.length > 3 && <li className="text-legenda">e mais {pedido.linhas.length - 3}</li>}
        </ul>

        <p className="mt-3 flex justify-between text-[14px]">
          <span className="text-texto-2">
            {unidades} {unidades === 1 ? 'item' : 'itens'}
          </span>
          <span className="font-extrabold tabular-nums text-texto">{formatBRL(pedido.totalCents)}</span>
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            tamanho="md"
            onClick={() => {
              restaurar(pedido.linhas);
              router.push('/sacola');
            }}
          >
            <RotateCcw className="size-4" aria-hidden />
            Pedir de novo
          </Button>
          <LinkBotao href={buildWhatsAppUrl(pedido)} variante="secundario" tamanho="md">
            <MessageCircle className="size-4" aria-hidden />
            WhatsApp
          </LinkBotao>
        </div>
      </div>
    </li>
  );
}
