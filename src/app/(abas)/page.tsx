import { BarraFixa } from '@/components/inicio/BarraFixa';
import { Capa } from '@/components/inicio/Capa';
import { CartaoLoja } from '@/components/inicio/CartaoLoja';
import { Cupom } from '@/components/inicio/Cupom';
import { AtalhosCardapio } from '@/components/inicio/AtalhosCardapio';
import { AvisoFechado } from '@/components/inicio/AvisoFechado';
import { PecaDeNovo } from '@/components/inicio/PecaDeNovo';
import { Favoritos } from '@/components/inicio/Favoritos';
import { Destaques } from '@/components/inicio/Destaques';
import { SecaoCardapio } from '@/components/inicio/SecaoCardapio';
import { RodapeLoja } from '@/components/inicio/RodapeLoja';
import { DetalhesLoja } from '@/components/inicio/DetalhesLoja';
import { ConviteInstalar } from '@/components/layout/ConviteInstalar';
import { destaquesDoCardapio, montarCardapio } from '@/lib/cardapio';

/**
 * Início: a página da loja. Capa com as fotos se alternando, cartão da loja,
 * os atalhos das 7 seções com foto e o cardápio por seção (pratos em linhas,
 * bebidas e doces em prateleiras). Como receber fica para o fim, na sacola.
 * Server Component; cliente só onde reage (capa, barra fixa, [+], prateleiras).
 */
export default function Inicio() {
  const secoes = montarCardapio();
  const temDestaques = destaquesDoCardapio().length > 0;
  const abas = [...(temDestaques ? [{ id: 'destaques', nome: 'Destaques' }] : []), ...secoes.map((s) => ({ id: s.id, nome: s.nome }))];

  return (
    <>
      <BarraFixa secoes={abas} />
      <Capa />
      <CartaoLoja />
      <Cupom />
      <AtalhosCardapio secoes={secoes} />

      <main className="mx-auto max-w-2xl">
        <AvisoFechado />
        <PecaDeNovo />
        <ConviteInstalar />
        <Favoritos />
        <Destaques />
        {secoes.map((secao) => (
          <div key={secao.id}>
            <div className="separador mt-7" />
            <SecaoCardapio secao={secao} />
          </div>
        ))}
        <RodapeLoja />
      </main>

      <DetalhesLoja />
    </>
  );
}
