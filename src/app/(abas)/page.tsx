import { BarraFixa } from '@/components/inicio/BarraFixa';
import { BrandMark } from '@/components/layout/BrandMark';
import { Capa } from '@/components/inicio/Capa';
import { CartaoLoja } from '@/components/inicio/CartaoLoja';
import { Cupom } from '@/components/inicio/Cupom';
import { AtalhosCardapio } from '@/components/inicio/AtalhosCardapio';
import { BuscaNoCardapio } from '@/components/busca/BuscaNoCardapio';
import { AvisoFechado } from '@/components/inicio/AvisoFechado';
import { PecaDeNovo } from '@/components/inicio/PecaDeNovo';
import { Favoritos } from '@/components/inicio/Favoritos';
import { Destaques } from '@/components/inicio/Destaques';
import { SecaoCardapio } from '@/components/inicio/SecaoCardapio';
import { RodapeLoja } from '@/components/inicio/RodapeLoja';
import { DetalhesLoja } from '@/components/inicio/DetalhesLoja';
import { ConviteInstalar } from '@/components/layout/ConviteInstalar';
import { destaquesDoCardapio, montarCardapio } from '@/lib/cardapio';
import type { Viewport } from 'next';

// A fachada do Início é escura: a barra do sistema acompanha.
export const viewport: Viewport = { themeColor: '#120e0b' };

/**
 * Início: a página da loja. Em cima, a fachada no carvão (as fotos se
 * alternando, o logo grande e os dados da loja); por cima do pé dela sobe a
 * folha clara do cardápio, com o telhado da marca no alto: os atalhos das
 * seções com foto e o cardápio por seção (pratos em linhas, bebidas e doces em
 * prateleiras). Como receber fica para o fim, na sacola.
 * Server Component; cliente só onde reage (capa, barra fixa, [+], prateleiras).
 */
export default function Inicio() {
  const secoes = montarCardapio();
  const temDestaques = destaquesDoCardapio().length > 0;
  const abas = [...(temDestaques ? [{ id: 'destaques', nome: 'Destaques' }] : []), ...secoes.map((s) => ({ id: s.id, nome: s.nome }))];

  return (
    <>
      <BarraFixa secoes={abas} />
      <BuscaNoCardapio />
      <Capa />
      <CartaoLoja />

      <div className="relative -mt-7 rounded-t-[30px] bg-fundo pt-3 shadow-[0_-14px_30px_-20px_rgba(0,0,0,0.6)]">
        <BrandMark comFogo={false} className="mx-auto w-10 opacity-80" />
        <Cupom />
        <AtalhosCardapio secoes={secoes} />

        <main className="mx-auto max-w-2xl">
          <AvisoFechado />
          <PecaDeNovo />
          <ConviteInstalar />
          <Favoritos />
          <Destaques />
          {secoes.map((secao) => (
            <SecaoCardapio key={secao.id} secao={secao} />
          ))}
          <RodapeLoja />
        </main>
      </div>

      <DetalhesLoja />
    </>
  );
}
