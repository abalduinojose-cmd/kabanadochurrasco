import { CabecalhoCompacto } from '@/components/inicio/CabecalhoCompacto';
import { Capa } from '@/components/inicio/Capa';
import { CartaoLoja } from '@/components/inicio/CartaoLoja';
import { Cupom } from '@/components/inicio/Cupom';
import { AbasCategorias } from '@/components/inicio/AbasCategorias';
import { AvisoFechado } from '@/components/inicio/AvisoFechado';
import { Banners } from '@/components/inicio/Banners';
import { PecaDeNovo } from '@/components/inicio/PecaDeNovo';
import { Favoritos } from '@/components/inicio/Favoritos';
import { Destaques, destaques } from '@/components/inicio/Destaques';
import { SecaoItens } from '@/components/inicio/SecaoItens';
import { RodapeLoja } from '@/components/inicio/RodapeLoja';
import { DetalhesLoja } from '@/components/inicio/DetalhesLoja';
import { EscolhaEntrega } from '@/components/inicio/EscolhaEntrega';
import { ConviteInstalar } from '@/components/layout/ConviteInstalar';
import { MENU } from '@/data/cardapio';

/**
 * Início: a página da loja do iFood. Server Component; o cardápio inteiro
 * chega como HTML. Cliente só onde reage: entrega, abas, banners, [+],
 * peça de novo, favoritos, folhas.
 */
export default function Inicio() {
  const temDestaques = destaques().length > 0;
  const secoes = [
    ...(temDestaques ? [{ id: 'destaques', nome: 'Destaques' }] : []),
    ...MENU.map((c) => ({ id: c.id, nome: c.nome })),
  ];

  return (
    <>
      <CabecalhoCompacto />
      <Capa />
      <CartaoLoja />
      <Cupom />
      <AbasCategorias secoes={secoes} />

      <main className="mx-auto max-w-2xl">
        <AvisoFechado />
        <Banners />
        <PecaDeNovo />
        <ConviteInstalar />
        <Favoritos />
        <Destaques />
        {MENU.map((categoria) => (
          <SecaoItens key={categoria.id} categoria={categoria} />
        ))}
        <RodapeLoja />
      </main>

      <DetalhesLoja />
      <EscolhaEntrega perguntar />
    </>
  );
}
