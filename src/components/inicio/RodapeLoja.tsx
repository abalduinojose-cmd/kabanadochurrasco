import Link from 'next/link';
import { Bike, Store, Wallet } from 'lucide-react';
import { LOJA } from '@/data/loja';
import { formatBRL, toCents } from '@/lib/money';
import { FAIXA_ENTREGA } from '@/lib/delivery';

/** O pé do Início: os fatos da loja, a frase da casa e os atalhos de ajuda. */
export function RodapeLoja() {
  const fatos = [
    { icone: Bike, titulo: 'Entrega', texto: FAIXA_ENTREGA },
    { icone: Wallet, titulo: 'Pagamento', texto: 'Na entrega ou Pix' },
    ...(LOJA.retiradaNoLocal ? [{ icone: Store, titulo: 'Retirada', texto: 'Sem taxa' }] : []),
  ];

  return (
    <footer className="mt-10 border-t border-divisor px-4 pb-8 pt-6">
      <ul className={`grid gap-2 ${fatos.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {fatos.map((f) => (
          <li key={f.titulo} className="rounded-cartao bg-fundo-2 px-2 py-3 text-center">
            <f.icone className="mx-auto size-5 text-texto-2" aria-hidden />
            <p className="mt-1.5 text-[13px] font-bold text-texto">{f.titulo}</p>
            <p className="text-legenda text-texto-2">{f.texto}</p>
          </li>
        ))}
      </ul>
      {LOJA.pedidoMinimo > 0 && (
        <p className="mt-3 text-center text-legenda text-texto-2">Pedido mínimo {formatBRL(toCents(LOJA.pedidoMinimo))}</p>
      )}

      <p className="mt-6 text-center text-[14px] font-semibold italic text-texto">{LOJA.fraseCasa}</p>

      <nav aria-label="Mais sobre a loja" className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] font-bold text-fogo-texto">
        <Link href="/sobre" className="inline-flex min-h-9 items-center">
          Sobre a loja
        </Link>
        <Link href="/ajuda" className="inline-flex min-h-9 items-center">
          Ajuda
        </Link>
        <Link href="/privacidade" className="inline-flex min-h-9 items-center">
          Privacidade
        </Link>
      </nav>
      <p className="mt-2 text-center text-legenda text-texto-3">
        {LOJA.nome} • {LOJA.cidade}/{LOJA.uf}
      </p>
    </footer>
  );
}
