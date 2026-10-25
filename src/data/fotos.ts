/**
 * Mapa de fotos: id do item (menu.ts) -> arquivo em /public/fotos.
 *
 * GERADO por scripts/fotos-instagram.mjs (edite o MAPA de lá e rode de novo).
 * Pratos: fotos do Instagram da loja (@kabana_do_churrasco), escolhidas pela
 * legenda do post (ou, quando a legenda não nomeia o prato, pela descrição do
 * item no instadelivery), recortadas para tirar textos e logos sobrepostos.
 * Bebidas e bomboniere: data/fotos-bebidas.ts (scripts/fotos-bebidas.mjs).
 * Para uma foto nova fora desses scripts: salve em public/fotos/ e escreva a
 * linha aqui com o id EXATO do item.
 *
 * Ficaram SEM foto (nenhum post limpo, só arte com texto por cima): Kafta,
 * Frango e Medalhão bovino (espetinhos), BIG K, Kabana Burguer I e III,
 * Toscano, Cheddar e Bacon, Kombo Kids, Trio Kabana e parte das porções.
 */

import { FOTOS_BEBIDAS } from './fotos-bebidas';

export const FOTOS: Readonly<Record<string, string>> = {
  'porcao-de-peixes': '/fotos/porcao-de-peixes.webp', // instagram.com/p/Dd9f5KVx3Yl (legenda nomeia o prato)
  'batata-frita-com-carne-seca-com-catupiry': '/fotos/batata-frita-com-carne-seca-com-catupiry.webp', // instagram.com/p/DbMFcnERDo4 (legenda nomeia o prato)
  'drinks-kabana': '/fotos/drinks-kabana.webp', // instagram.com/p/DWJvrThEVUr (legenda nomeia o prato)
  'burguer-de-coracao': '/fotos/burguer-de-coracao.webp', // instagram.com/p/DMtEwI3xwvd (legenda nomeia o prato)
  'morango-com-chocolate': '/fotos/morango-com-chocolate.webp', // instagram.com/p/DMi7eBMR9uS (legenda nomeia o prato)
  'banana-na-brasa': '/fotos/banana-na-brasa.webp', // instagram.com/p/DI669U7R9Xy (legenda nomeia o prato)
  'gelado-de-brownie': '/fotos/gelado-de-brownie.webp', // instagram.com/p/DIowqeOxXCR (legenda nomeia o prato)
  'queijo-coalho-e-melado-de-cana': '/fotos/queijo-coalho-e-melado-de-cana.webp', // instagram.com/p/DDiGfIIxiFB (legenda nomeia o prato)
  'costela-burguer': '/fotos/costela-burguer.webp', // instagram.com/p/Cxx0MT1LdwR (legenda nomeia o prato)
  'x-frango-bacon': '/fotos/x-frango-bacon.webp', // instagram.com/p/Cxxzl7Jr-2h (legenda nomeia o prato)
  'kabana-2-0': '/fotos/kabana-2-0.webp', // instagram.com/p/Dd9fcLTx1wQ (bate com a descrição do item)
  'kabana-burguer-ii': '/fotos/kabana-burguer-ii.webp', // instagram.com/p/Db_KgHeRV5w (bate com a descrição do item)
  'x-churrasco': '/fotos/x-churrasco.webp', // instagram.com/p/DLqIlkpxEsZ (legenda nomeia o prato)
  'pao-com-linguica-kabana': '/fotos/pao-com-linguica-kabana.webp', // instagram.com/p/DDccVTGR3p8 (legenda nomeia o prato)
  'medalhao-de-frango': '/fotos/medalhao-de-frango.webp', // instagram.com/p/C6PPdtggsA4 (legenda nomeia o prato)
  'tulipa-de-frango': '/fotos/tulipa-de-frango.webp', // instagram.com/p/DF-sgUnRjHy (legenda nomeia o prato)
  'coracao': '/fotos/coracao.webp', // instagram.com/p/CYpLNrALTxl (legenda nomeia o prato)
  'contra-file-com-fritas-serve-3-pessoas': '/fotos/contra-file-com-fritas-serve-3-pessoas.webp', // instagram.com/p/DP6sL43kfvq (bate com a descrição do item)
  'picanha-da-casa-com-fritas-serve-4-pessoas': '/fotos/picanha-da-casa-com-fritas-serve-4-pessoas.webp', // instagram.com/p/DIT1USRR2c9 (legenda nomeia o prato)
  'aneis-de-cebola': '/fotos/aneis-de-cebola.webp', // instagram.com/p/CupZPCtLzFl (legenda nomeia o prato)
};

/** Foto do item, se houver. O `imageUrl` do próprio menu.ts tem preferência. */
export function fotoDoItem(id: string, imageUrl?: string): string | undefined {
  return imageUrl ?? FOTOS[id] ?? FOTOS_BEBIDAS[id];
}

/**
 * Foto de produto em fundo branco (lata, garrafa, embalagem): mostrada inteira
 * (contain) e mesclada ao cinza do cartão, nunca cortada.
 */
export function ehFotoDeProduto(src: string | undefined): boolean {
  return src?.startsWith('/fotos/produtos/') ?? false;
}
