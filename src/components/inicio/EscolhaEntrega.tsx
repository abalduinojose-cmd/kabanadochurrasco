'use client';

import { useState } from 'react';
import { create } from 'zustand';
import { Bike, MessageCircle, Store } from 'lucide-react';
import { Folha } from '@/components/ui/Folha';
import { Button } from '@/components/ui/Button';
import { Escolha } from '@/components/checkout/Escolha';
import { useEntrega } from '@/store/entrega';
import { LOJA } from '@/data/loja';
import { formatBRL, toCents } from '@/lib/money';
import { FAIXA_ENTREGA, type ModoEntrega } from '@/lib/delivery';
import { normalizar } from '@/lib/busca';

/**
 * A folha "Como você quer receber?": entrega (com o bairro, que define a
 * taxa) ou retirada. Abre no fim do pedido, pela sacola (ou pelo Perfil),
 * nunca sozinha na abertura do app. Aberta pela linha do bairro
 * (`abrirBairro`), vai direto à lista de bairros, sem o segmentado.
 */

type FolhaStore = { aberto: boolean; soBairro: boolean; abrir: () => void; abrirBairro: () => void; fechar: () => void };

export const useEscolhaEntrega = create<FolhaStore>((set) => ({
  aberto: false,
  soBairro: false,
  abrir: () => set({ aberto: true, soBairro: false }),
  abrirBairro: () => set({ aberto: true, soBairro: true }),
  fechar: () => set({ aberto: false }),
}));

export function EscolhaEntrega() {
  const aberto = useEscolhaEntrega((s) => s.aberto);
  // Monta de novo a cada abertura: o estado local nasce do que está na store.
  return aberto ? <Conteudo /> : null;
}

function Conteudo() {
  const fechar = useEscolhaEntrega((s) => s.fechar);
  const soBairro = useEscolhaEntrega((s) => s.soBairro);
  const confirmar = useEntrega((s) => s.confirmar);
  const [modo, setModo] = useState<ModoEntrega>(() =>
    soBairro || !LOJA.retiradaNoLocal ? 'entrega' : useEntrega.getState().modo,
  );
  const [bairro, setBairro] = useState<string | null>(() => useEntrega.getState().bairro);
  const [filtro, setFiltro] = useState('');
  const zonas = LOJA.fretes.filter((f) => !filtro.trim() || f.bairro === bairro || normalizar(f.bairro).includes(normalizar(filtro)));

  const precisaDeBairro = modo === 'entrega' && !bairro;
  const saudacao = encodeURIComponent(`Olá! Vocês entregam no meu bairro? Vim pelo app da ${LOJA.nome}.`);

  return (
    <Folha
      aoFechar={fechar}
      titulo={soBairro ? 'Qual é o seu bairro?' : 'Como você quer receber?'}
      rodape={
        <Button
          className="w-full"
          disabled={precisaDeBairro}
          onClick={() => {
            confirmar({ modo, bairro });
            fechar();
          }}
        >
          {modo === 'retirada' ? 'Retirar na loja' : bairro ? `Entregar em ${bairro}` : 'Escolha o bairro'}
        </Button>
      }
    >
      {LOJA.retiradaNoLocal && !soBairro && (
        <div role="radiogroup" aria-label="Forma de receber" className="flex rounded-[12px] bg-fundo-2 p-[3px]">
          {(
            [
              { id: 'entrega', rotulo: 'Entrega', icone: <Bike className="size-4" aria-hidden /> },
              { id: 'retirada', rotulo: 'Retirada', icone: <Store className="size-4" aria-hidden /> },
            ] as const
          ).map((o) => {
            const ativo = modo === o.id;
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={ativo}
                onClick={() => setModo(o.id)}
                className={`flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-[10px] py-2 text-[14px] font-semibold transition-colors ${
                  ativo ? 'bg-cartao text-texto shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'text-texto-2'
                }`}
              >
                {o.icone}
                {o.rotulo}
              </button>
            );
          })}
        </div>
      )}

      {modo === 'entrega' ? (
        <div className={soBairro ? '' : 'mt-4'}>
          {!soBairro && <p className="text-[15px] font-bold text-texto">Qual é o seu bairro?</p>}
          <p className="mt-0.5 text-[13px] text-texto-2">A taxa depende do bairro. Entrega em {FAIXA_ENTREGA}.</p>
          {LOJA.fretes.length > 8 && (
            <input
              type="search"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar bairro, rua ou referência"
              aria-label="Buscar bairro"
              className="mt-3 h-12 w-full rounded-[12px] border border-transparent bg-fundo-2 px-4 text-[15px] text-texto placeholder:text-texto-3 focus:border-fogo focus:bg-cartao focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
          )}
          {zonas.length === 0 && <p className="mt-3 text-[13px] text-texto-2">Nenhuma zona com esse nome. Veja com a loja pelo WhatsApp.</p>}
          <div className="mt-2">
            {zonas.map((f) => {
              const taxa = toCents(f.taxa);
              return (
                <Escolha key={f.bairro} tipo="radio" nome="bairro" marcado={bairro === f.bairro} aoMudar={() => setBairro(f.bairro)}>
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{f.bairro}</span>
                    <span className={`shrink-0 text-[13px] font-bold ${taxa === 0 ? 'text-verde' : 'text-texto-2'}`}>
                      {taxa === 0 ? 'Grátis' : formatBRL(taxa)}
                    </span>
                  </span>
                </Escolha>
              );
            })}
          </div>
          <a
            href={`https://wa.me/${LOJA.whatsapp}?text=${saudacao}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 text-[13px] font-bold text-fogo-texto"
          >
            <MessageCircle className="size-4" aria-hidden />
            Meu bairro não está na lista
          </a>
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-3 rounded-cartao bg-fundo-2 p-3.5">
          <Store className="mt-0.5 size-5 shrink-0 text-texto-2" aria-hidden />
          <div className="text-[14px] leading-snug">
            <p className="font-semibold text-texto">{LOJA.nome}</p>
            <p className="mt-0.5 text-texto-2">{`${LOJA.endereco}, ${LOJA.cidade}/${LOJA.uf}`}</p>
            <p className="mt-1 font-semibold text-verde">Sem taxa de entrega</p>
            <p className="mt-1 text-texto-2">A loja avisa pelo WhatsApp quando o pedido estiver pronto.</p>
          </div>
        </div>
      )}
    </Folha>
  );
}
