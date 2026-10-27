import type { Metadata, Viewport } from 'next';
import { CircleHelp, Download, Heart, Instagram, MessageCircle, ReceiptText, ShieldCheck, Store, UserRound } from 'lucide-react';
import { CabecalhoPerfil } from '@/components/perfil/CabecalhoPerfil';
import { ItemMenu } from '@/components/perfil/ItemMenu';
import { ResumoEntregaPerfil } from '@/components/perfil/ResumoEntregaPerfil';
import { BotaoInstalar } from '@/components/perfil/BotaoInstalar';
import { StatusLoja } from '@/components/layout/StatusLoja';
import { LOJA } from '@/data/loja';

export const metadata: Metadata = { title: 'Perfil' };

// O topo do Perfil é o carvão da fachada: a barra do sistema acompanha.
export const viewport: Viewport = { themeColor: '#120e0b' };

const saudacao = encodeURIComponent(`Olá! Vim pelo app da ${LOJA.nome}.`);

/** Aba Perfil: o cadastro no topo (ou o convite para fazer), seus atalhos, a loja e a ajuda. */
export default function Perfil() {
  return (
    <main className="mx-auto max-w-2xl">
      <CabecalhoPerfil />

      <div className="relative -mt-6 rounded-t-[28px] bg-fundo pt-2">
        <section className="px-4 py-3" aria-label="Sua conta">
          <ul>
            <ItemMenu href="/dados" icone={UserRound} titulo="Meu cadastro" descricao="Nome, WhatsApp e endereço de entrega" />
            <ResumoEntregaPerfil />
            <ItemMenu href="/favoritos" icone={Heart} titulo="Favoritos" descricao="Os itens que você marcou com o coração" />
            <ItemMenu href="/pedidos" icone={ReceiptText} titulo="Pedidos" descricao="Histórico e pedir de novo" />
          </ul>
        </section>

        <div className="separador" />

        <section className="px-4 py-3" aria-label="A loja">
          <h2 className="flex items-center justify-between py-2 text-[13px] font-bold uppercase tracking-wide text-texto-2">
            A loja
            <StatusLoja />
          </h2>
          <ul>
            <ItemMenu href="/sobre" icone={Store} titulo="Sobre a Kabana" descricao="Horários, onde fica, como chegar" />
            <ItemMenu href={`https://wa.me/${LOJA.whatsapp}?text=${saudacao}`} externo icone={MessageCircle} titulo="Falar com a loja" descricao="WhatsApp" />
            <ItemMenu href={`https://instagram.com/${LOJA.instagram}`} externo icone={Instagram} titulo="Instagram" descricao={`@${LOJA.instagram}`} />
          </ul>
        </section>

        <div className="separador" />

        <section className="px-4 py-3" aria-label="App e ajuda">
          <ul>
            <ItemMenu href="/ajuda" icone={CircleHelp} titulo="Ajuda" descricao="Como funciona o pedido, pagamento e entrega" />
            <ItemMenu href="/privacidade" icone={ShieldCheck} titulo="Privacidade" descricao="O que fica salvo e onde" />
          </ul>
          <div className="mt-3 flex items-start gap-3 rounded-cartao bg-fundo-2 p-3.5">
            <Download className="mt-0.5 size-5 shrink-0 text-texto-2" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-texto">Kabana na tela inicial</p>
              <p className="text-[13px] text-texto-2">Abre como app, sem navegador, e funciona mesmo com sinal fraco.</p>
              <div className="mt-3">
                <BotaoInstalar />
              </div>
            </div>
          </div>
        </section>
      </div>

      <p className="px-4 pb-6 pt-2 text-center text-[13px] italic text-texto-2">{LOJA.fraseCasa}</p>
    </main>
  );
}
