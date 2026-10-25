/**
 * Fotos das bebidas e da bomboniere. GERADO por scripts/fotos-bebidas.mjs.
 *
 * /fotos/produtos/ = foto do produto de marca (lata, garrafa, embalagem) em
 * fundo branco: o app mostra inteira, sem cortar, sobre o cinza do cartão.
 * /fotos/bebidas/ = foto ilustrativa com licença Creative Commons, para item
 * sem marca definida (caipirinha, doses, vinho da casa, água); o crédito de
 * cada uma está em CREDITOS_FOTOS e aparece na página Sobre.
 */

export const FOTOS_BEBIDAS: Readonly<Record<string, string>> = {
  'energetico-redbull': '/fotos/produtos/energetico-redbull.webp', // Energético Red Bull Energy Drink 250ml (prezunic.com.br)
  'monster': '/fotos/produtos/monster.webp', // Bebida Energética Monster Energy Lata 473ml (zonasul.com.br)
  'jack-daniel-s': '/fotos/produtos/jack-daniel-s.webp', // Whisky Americano Old No. 7 Jack Daniel's Garrafa 700ml (prezunic.com.br)
  'campari': '/fotos/produtos/campari.webp', // Bitter Campari Garrafa 900mL (zonasul.com.br)
  'taca-galioto': '/fotos/produtos/taca-galioto.webp', // Vinho Tinto Galiotto Suave Garrafa 1l (zonasul.com.br)
  'taca-reservado': '/fotos/produtos/taca-reservado.webp', // Vinho Chileno Concha Y Toro Reservado Malbec 750ml (prezunic.com.br)
  'guaravita': '/fotos/produtos/guaravita.webp', // Guaraná Natural Guaravita Copo 290 (zonasul.com.br)
  'coca-cola-350ml': '/fotos/produtos/coca-cola-350ml.webp', // Refrigerante Coca-Cola Lata 350ml (prezunic.com.br)
  'coca-cola-zero-350ml': '/fotos/produtos/coca-cola-zero-350ml.webp', // Refrigerante Coca-Cola sem Açúcar Lata 350ml (prezunic.com.br)
  'guarana-antarctica-350ml': '/fotos/produtos/guarana-antarctica-350ml.webp', // Refrigerante Guaraná Antarctica Lata 350ml (zonasul.com.br)
  'guarana-antarctica-zero-350ml': '/fotos/produtos/guarana-antarctica-zero-350ml.webp', // Refrigerante Guaraná Antarctica Zero Lata 350ml (zonasul.com.br)
  'fanta-laranja-350ml': '/fotos/produtos/fanta-laranja-350ml.webp', // Refrigerante Fanta Laranja Lata 350ml (prezunic.com.br)
  'fanta-uva-350ml': '/fotos/produtos/fanta-uva-350ml.webp', // Refrigerante Fanta Uva Lata 350ml (prezunic.com.br)
  'sprite-zero-350ml': '/fotos/produtos/sprite-zero-350ml.webp', // Refrigerante Sprite Limão Sem Açúcar Lata 350ml (zonasul.com.br)
  'schweppes-tonica-350ml': '/fotos/produtos/schweppes-tonica-350ml.webp', // Água Tônica Schweppes Lata 350ml (prezunic.com.br)
  'schweppes-citrus-350ml': '/fotos/produtos/schweppes-citrus-350ml.webp', // Refrigerante Schweppes Citrus Drink Lata 350ml (prezunic.com.br)
  'del-valle-goiaba-290ml': '/fotos/produtos/del-valle-goiaba-290ml.webp', // Néctar Del Valle Goiaba Lata 290ml (prezunic.com.br)
  'del-valle-manga-290ml': '/fotos/produtos/del-valle-manga-290ml.webp', // Néctar Del Valle Manga Lata 290ml (zonasul.com.br)
  'del-valle-pessego-290ml': '/fotos/produtos/del-valle-pessego-290ml.webp', // Néctar Del Valle Pêssego Lata 290ml (zonasul.com.br)
  'del-valle-uva-290ml': '/fotos/produtos/del-valle-uva-290ml.webp', // Néctar Del Valle Uva Lata 290ml (zonasul.com.br)
  'h2oh': '/fotos/produtos/h2oh.webp', // Refrigerante H2Oh! Limão Garrafa 500ml (zonasul.com.br)
  'guaraviton': '/fotos/produtos/guaraviton.webp', // Guaraná Natural Guaraviton Pronto Açaí 500ml (zonasul.com.br)
  'ice-tea': '/fotos/produtos/ice-tea.webp', // Chá Leão Ice Tea Limão Pet 300ml (prezunic.com.br)
  'coca-cola-2l': '/fotos/produtos/coca-cola-2l.webp', // Refrigerante Coca Cola Original Pet 2L (zonasul.com.br)
  'coca-cola-zero-2l': '/fotos/produtos/coca-cola-zero-2l.webp', // Refrigerante Coca-Cola sem Açúcar Pet 2l (prezunic.com.br)
  'coca-cola-ks-vidro-290ml': '/fotos/produtos/coca-cola-ks-vidro-290ml.webp', // Refrigerante Coca-Cola King Size 10 290ml (prezunic.com.br)
  'coca-cola-zero-ks-vidro-290ml': '/fotos/produtos/coca-cola-zero-ks-vidro-290ml.webp', // Refrigerante Coca-Cola Zero Açúcar Garrafa King Size 10 290ml (prezunic.com.br)
  'original-473ml': '/fotos/produtos/original-473ml.webp', // Cerveja Original Pilsen Lata 473ml (prezunic.com.br)
  'heineken-473ml': '/fotos/produtos/heineken-473ml.webp', // Cerveja Heineken Puro Malte Lata 473ml (prezunic.com.br)
  'corona-long-neck': '/fotos/produtos/corona-long-neck.webp', // Cerveja Corona Pilsen Extra Long Neck 330ml (prezunic.com.br)
  'brahma-550ml': '/fotos/produtos/brahma-550ml.webp', // Cerveja Brahma Chopp Pilsen Lata 473ml (zonasul.com.br)
  'antarctica-473ml': '/fotos/produtos/antarctica-473ml.webp', // Cerveja Antarctica Pilsen Lata 473ml (prezunic.com.br)
  'amstel-473ml': '/fotos/produtos/amstel-473ml.webp', // Cerveja Amstel Lager Puro Malte Lata 473ml (prezunic.com.br)
  'itaipava-550ml': '/fotos/produtos/itaipava-550ml.webp', // Cerveja Itaipava Pilsen Lata 550ml (prezunic.com.br)
  'malzbier-long-neck': '/fotos/produtos/malzbier-long-neck.webp', // Cerveja Brasileira Brahma Malzbier Long Neck 355ml (zonasul.com.br)
  'heineken-zero-long-neck': '/fotos/produtos/heineken-zero-long-neck.webp', // Cerveja Heineken Puro Malte Lager Zero Álcool Long Neck 330ml (prezunic.com.br)
  'kit-kat': '/fotos/produtos/kit-kat.webp', // Wafer Kitkat Nestlé 4 Fingers ao Leite 41,5g (prezunic.com.br)
  'nutella-b-ready': '/fotos/produtos/nutella-b-ready.webp', // Nutella B-Ready Wafer Recheado 1 Unidade 22g (zonasul.com.br)
  'kinder-joy': '/fotos/produtos/kinder-joy.webp', // Chocolate Kinder Joy 1 unidade 20g (zonasul.com.br)
  'mini-bala-fini': '/fotos/produtos/mini-bala-fini.webp', // Balas de Gelatina Fini Tubes Morango 35g (prezunic.com.br)
  'mentos': '/fotos/produtos/mentos.webp', // Drops Mentos Sticks Mint 37,5g (prezunic.com.br)
  'kinder-bueno': '/fotos/produtos/kinder-bueno.webp', // Kinder Bueno Chocolate ao Leite 2 unidades 43g (zonasul.com.br)
  'caipirinha-kabana': '/fotos/bebidas/caipirinha-kabana.webp', // foto ilustrativa (BY 2.0)
  'caipireja': '/fotos/bebidas/caipireja.webp', // foto ilustrativa (BY 2.0)
  'dona-vania-premium': '/fotos/bebidas/dona-vania-premium.webp', // foto ilustrativa (BY 2.0)
  'dona-vania-sabores': '/fotos/bebidas/dona-vania-sabores.webp', // foto ilustrativa (BY 2.0)
  'dona-vania-tarja-preta': '/fotos/bebidas/dona-vania-tarja-preta.webp', // foto ilustrativa (BY-SA 2.0)
  'vodka-nacional': '/fotos/bebidas/vodka-nacional.webp', // foto ilustrativa (BY 2.0)
  'whisky-8-anos': '/fotos/bebidas/whisky-8-anos.webp', // foto ilustrativa (BY 2.0)
  'whisky-12-anos': '/fotos/bebidas/whisky-12-anos.webp', // foto ilustrativa (BY 2.0)
  'gin-importado': '/fotos/bebidas/gin-importado.webp', // foto ilustrativa (BY 2.0)
  'tequila': '/fotos/bebidas/tequila.webp', // foto ilustrativa (BY 2.0)
  'garrafa-cabernet-sauvignon': '/fotos/bebidas/garrafa-cabernet-sauvignon.webp', // foto ilustrativa (BY-SA 2.0)
  'garrafa-merlot': '/fotos/bebidas/garrafa-merlot.webp', // foto ilustrativa (BY 2.0)
  'garrafa-malbec': '/fotos/bebidas/garrafa-malbec.webp', // foto ilustrativa (BY 2.0)
  'agua-sem-gas': '/fotos/bebidas/agua-sem-gas.webp', // foto ilustrativa (BY 2.0)
  'agua-com-gas': '/fotos/bebidas/agua-com-gas.webp', // foto ilustrativa (BY 2.0)
  'cerveja-sem-gluten-long-neck': '/fotos/bebidas/cerveja-sem-gluten-long-neck.webp', // foto ilustrativa (BY 2.0)
  'chopp-vinho-600ml': '/fotos/bebidas/chopp-vinho-600ml.webp', // foto ilustrativa (BY 2.0)
  'brownie': '/fotos/bebidas/brownie.webp', // foto ilustrativa (BY 2.0)
};

export type CreditoFoto = { readonly itemId: string; readonly titulo: string; readonly autor: string; readonly licenca: string; readonly pagina: string };

export const CREDITOS_FOTOS: readonly CreditoFoto[] = [
  { itemId: 'caipirinha-kabana', titulo: 'Caipirinhas', autor: 'andybullock77', licenca: 'CC BY 2.0', pagina: 'https://www.flickr.com/photos/94549249@N00/4607609510' },
  { itemId: 'caipireja', titulo: 'Botonique on the rocks', autor: 'Club Soda Guide', licenca: 'CC BY 2.0', pagina: 'https://www.flickr.com/photos/146056350@N05/34924215243' },
  { itemId: 'dona-vania-premium', titulo: 'Cachaça', autor: 'VIc Lic', licenca: 'CC BY 2.0', pagina: 'https://www.flickr.com/photos/72675636@N00/495440543' },
  { itemId: 'dona-vania-sabores', titulo: 'Cachaça + Guaiamum', autor: 'Guilherme Jófili', licenca: 'CC BY 2.0', pagina: 'https://www.flickr.com/photos/87971644@N00/7732147996' },
  { itemId: 'dona-vania-tarja-preta', titulo: 'Glass of Scotch', autor: 'dvanzuijlekom', licenca: 'CC BY-SA 2.0', pagina: 'https://www.flickr.com/photos/52365139@N05/9339930772' },
  { itemId: 'vodka-nacional', titulo: 'blind vodka tasting', autor: 'rick', licenca: 'CC BY 2.0', pagina: 'https://www.flickr.com/photos/35034361412@N01/2362451607' },
  { itemId: 'whisky-8-anos', titulo: 'The Drunken Glass', autor: 'alexbrn', licenca: 'CC BY 2.0', pagina: 'https://www.flickr.com/photos/45086087@N00/4720302637' },
  { itemId: 'whisky-12-anos', titulo: 'Brandy1', autor: 'thegift73', licenca: 'CC BY 2.0', pagina: 'https://www.flickr.com/photos/28519734@N00/6163946917' },
  { itemId: 'gin-importado', titulo: 'Gin and tonic at Morris Jones', autor: 'ultrakml', licenca: 'CC BY 2.0', pagina: 'https://www.flickr.com/photos/34948727@N00/8207239477' },
  { itemId: 'tequila', titulo: 'Tequila Shot', autor: 'Prayitno / Thank you for (12 millions +) view', licenca: 'CC BY 2.0', pagina: 'https://www.flickr.com/photos/34128007@N04/5296401970' },
  { itemId: 'garrafa-cabernet-sauvignon', titulo: 'Pour me some wine please!', autor: 'yashima', licenca: 'CC BY-SA 2.0', pagina: 'https://www.flickr.com/photos/44032042@N00/131232874' },
  { itemId: 'garrafa-merlot', titulo: 'Alessi Mami Red Wine Glass', autor: 'Didriks', licenca: 'CC BY 2.0', pagina: 'https://www.flickr.com/photos/49889671@N03/19700577576' },
  { itemId: 'garrafa-malbec', titulo: 'Red Wine Glass #dailyshoot', autor: 'Leshaines123', licenca: 'CC BY 2.0', pagina: 'https://www.flickr.com/photos/46018453@N06/9031746040' },
  { itemId: 'agua-sem-gas', titulo: 'water bottle', autor: 'Muffet', licenca: 'CC BY 2.0', pagina: 'https://www.flickr.com/photos/53133240@N00/7985698964' },
  { itemId: 'agua-com-gas', titulo: 'Water Pouring Over Glass of Ice', autor: 'StockPhotosforFree.com', licenca: 'CC BY 2.0', pagina: 'https://www.flickr.com/photos/79249118@N05/7190209429' },
  { itemId: 'cerveja-sem-gluten-long-neck', titulo: 'Beer Bottle', autor: 'ramblinbears', licenca: 'CC BY 2.0', pagina: 'https://www.flickr.com/photos/80897558@N05/7434068182' },
  { itemId: 'chopp-vinho-600ml', titulo: 'sangria', autor: 'waferboard', licenca: 'CC BY 2.0', pagina: 'https://www.flickr.com/photos/60944931@N00/3550625967' },
  { itemId: 'brownie', titulo: '14/52 Chocolate Brownies', autor: 'KJGarbutt', licenca: 'CC BY 2.0', pagina: 'https://www.flickr.com/photos/25187937@N05/5646271137' },
];
