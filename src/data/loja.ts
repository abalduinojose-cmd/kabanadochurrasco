/**
 * Configuração única da loja.
 *
 * Toda regra de negócio (frete, horário, pagamento, pedido mínimo) lê daqui.
 * Nenhum preço, taxa, horário ou telefone pode ser escrito dentro de componente.
 *
 * Dados conferidos em 25/10/2026 no app atual da loja
 * (instadelivery.com.br/kabanadochurrasco); o cardápio está em menu.ts.
 * O que ainda depende do dono está marcado com «TODO».
 */

export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Nota pública (Google). null = não exibir; nunca inventar. */
export type Nota = { readonly valor: number; readonly total: number } | null;

/** Coordenadas para o mapa. */
export type Coordenadas = { readonly lat: number; readonly lng: number } | null;

/** Faixa de promoção no topo da loja, como o cupom do iFood. null = não mostrar. */
export type Promocao = { readonly titulo: string; readonly texto: string } | null;

/** Janela de funcionamento. `fecha` menor que `abre` significa que vira o dia. */
export type Janela = { readonly abre: string; readonly fecha: string };

export const LOJA = {
  nome: 'Kabana do Churrasco',
  tagline: 'Espetaria e Hamburgueria',
  fraseCasa: 'Até aqui nos ajudou o Senhor!',

  whatsapp: '5524992811184', // (24) 99281-1184 no formato wa.me, só dígitos
  instagram: 'kabana_do_churrasco',

  endereco: 'Estrada Silveira da Motta, 236, Posse' as string,
  cidade: 'Petrópolis',
  uf: 'RJ',

  // Horários do instadelivery: terça a domingo, 17h às 23h; segunda fechado. 0 = domingo.
  horarios: {
    0: [{ abre: '17:00', fecha: '23:00' }],
    1: null, // null = fechado
    2: [{ abre: '17:00', fecha: '23:00' }],
    3: [{ abre: '17:00', fecha: '23:00' }],
    4: [{ abre: '17:00', fecha: '23:00' }],
    5: [{ abre: '17:00', fecha: '23:00' }],
    6: [{ abre: '17:00', fecha: '23:00' }],
  },

  // As zonas de entrega e taxas como estão cadastradas no instadelivery (82 zonas).
  fretes: [
    { bairro: 'Aguas lindas- nogueiras', taxa: 100 },
    { bairro: 'Alberto Torres até k30', taxa: 30 },
    { bairro: 'Albertos', taxa: 50 },
    { bairro: 'Areal afonsina', taxa: 18 },
    { bairro: 'Areal alto para', taxa: 20 },
    { bairro: 'Areal Amazonas final', taxa: 25 },
    { bairro: 'Areal Amazonas Segunda Viradouro', taxa: 22 },
    { bairro: 'Areal ayres Pinto', taxa: 18 },
    { bairro: 'Areal Ayrton Sena', taxa: 16 },
    { bairro: 'Areal cedro', taxa: 25 },
    { bairro: 'Areal centro', taxa: 15 },
    { bairro: 'Areal concha da lua', taxa: 18 },
    { bairro: 'Areal delícia', taxa: 17 },
    { bairro: 'Areal fazenda velha', taxa: 22 },
    { bairro: 'Areal gaby/pedreira', taxa: 12 },
    { bairro: 'Areal jaques filho', taxa: 17 },
    { bairro: 'Areal Julioca', taxa: 25 },
    { bairro: 'Areal manoel Fernandes', taxa: 15 },
    { bairro: 'Areal Monica quintela', taxa: 18 },
    { bairro: 'Areal para de baixo', taxa: 18 },
    { bairro: 'Areal portões', taxa: 25 },
    { bairro: 'Areal rua do cemitério', taxa: 22 },
    { bairro: 'Areal vila Adelaide', taxa: 25 },
    { bairro: 'Areal vila verde', taxa: 30 },
    { bairro: 'Barra mansa até igreja católica', taxa: 30 },
    { bairro: 'Boa Vista baixo', taxa: 7 },
    { bairro: 'Boa Vista cima até estação água', taxa: 7 },
    { bairro: 'Boa Vista cima até final', taxa: 9 },
    { bairro: 'Brejal até curvao', taxa: 15 },
    { bairro: 'Brejal centro', taxa: 25 },
    { bairro: 'Brejal grotao', taxa: 25 },
    { bairro: 'Contrões', taxa: 25 },
    { bairro: 'Estrada brejal (Maisom)', taxa: 7 },
    { bairro: 'Estrada velha brejal', taxa: 15 },
    { bairro: 'Jacuba até depósito de gás', taxa: 25 },
    { bairro: 'Jacuba até manain', taxa: 18 },
    { bairro: 'Jacuba início', taxa: 12 },
    { bairro: 'Jacuba meio até cachoeira', taxa: 15 },
    { bairro: 'Jurity até Mello', taxa: 40 },
    { bairro: 'Jurity final', taxa: 50 },
    { bairro: 'Mata cavalo até represa', taxa: 20 },
    { bairro: 'Nossa senhora de Fátima', taxa: 9 },
    { bairro: 'Pedro do Rio até chafariz', taxa: 45 },
    { bairro: 'Pedro do Rio até o sindicato', taxa: 40 },
    { bairro: 'Pedro do rio centro/cervejaria', taxa: 50 },
    { bairro: 'Pedágio', taxa: 30 },
    { bairro: 'Posse até entrada Inga', taxa: 8 },
    { bairro: 'Posse até galpão eventos', taxa: 6 },
    { bairro: 'Posse até o ciep', taxa: 7 },
    { bairro: 'Posse até ponte de cimento', taxa: 9 },
    { bairro: 'Posse centro até o Bramil', taxa: 5 },
    { bairro: 'Posse Inga até manobrador', taxa: 12 },
    { bairro: 'Posse inga até o bilao', taxa: 10 },
    { bairro: 'Posse Inga final', taxa: 15 },
    { bairro: 'Posse noêmia até Beatriz zaleski', taxa: 10 },
    { bairro: 'Posse noêmia até vila Mariana', taxa: 7 },
    { bairro: 'Posse posto meio', taxa: 8 },
    { bairro: 'Posse princesa Isabel', taxa: 6 },
    { bairro: 'Posse reta final', taxa: 10 },
    { bairro: 'Posse reta início', taxa: 9 },
    { bairro: 'Rio bonito', taxa: 35 },
    { bairro: 'Salão azul até até estrada velha', taxa: 12 },
    { bairro: 'Salão azul até pizzaria', taxa: 7 },
    { bairro: 'Salão azul Sabará', taxa: 8 },
    { bairro: 'Santo Antônio até manobrador', taxa: 9 },
    { bairro: 'Santo Antônio até vila do Sinesio', taxa: 7 },
    { bairro: 'Santo Antônio final', taxa: 10 },
    { bairro: 'Silveira da Mota até bar do jacaré', taxa: 15 },
    { bairro: 'Silveira da Mota até casas populares', taxa: 7 },
    { bairro: 'Silveira da mota até entrada tristao camara', taxa: 20 },
    { bairro: 'Silveira da Mota até tobo agua', taxa: 10 },
    { bairro: 'Silveira da Mota chales da represa', taxa: 12 },
    { bairro: 'Silveira da motta até fábrica de telas', taxa: 6 },
    { bairro: 'Silveira da Motta até o campo', taxa: 5 },
    { bairro: 'Taquaril ate final', taxa: 35 },
    { bairro: 'Taquaril até igreja', taxa: 20 },
    { bairro: 'Taquaril até águas do imperador', taxa: 18 },
    { bairro: 'Tristao câmara', taxa: 30 },
    { bairro: 'Tristao câmara Condomínio elegance', taxa: 35 },
    { bairro: 'Xingu ate o sitio xingu', taxa: 30 },
    { bairro: 'Xingu início', taxa: 12 },
    { bairro: 'Xingu meio', taxa: 15 },
  ],

  pedidoMinimo: 0, // o instadelivery não cobra pedido mínimo
  retiradaNoLocal: true, // "take_out" ligado no instadelivery
  minEspetinhos: 1, // sem mínimo de espetos no instadelivery (1 = regra desligada)

  // O instadelivery mostra uma estimativa única de 50 min; min = max vira "cerca de 50 min".
  tempoEntregaMin: 50,
  tempoEntregaMax: 50,

  // As quatro formas aceitas no instadelivery, na ordem de lá.
  pagamentos: [
    { id: 'dinheiro', label: 'Dinheiro', pedeTroco: true },
    { id: 'pix', label: 'Pix', pedeTroco: false },
    { id: 'debito', label: 'Cartão de débito (maquininha)', pedeTroco: false },
    { id: 'credito', label: 'Cartão de crédito (maquininha)', pedeTroco: false },
  ],

  chavePix: '24992811184' as string, // chave celular, a mesma do WhatsApp da loja

  // Nota real do perfil no Google Maps (25/10/2026: 4,8 com 49 avaliações).
  // Atualizar junto com scripts/avaliacoes-google.json. Nunca pôr número inventado.
  nota: { valor: 4.8, total: 49 } as Nota,

  // Ponto do perfil no Google Maps (o Google escreve "nº 164"; o instadelivery, 236).
  coordenadas: { lat: -22.2505495, lng: -43.0724003 } as Coordenadas,

  // Foto da capa do Início (do Instagram da loja). Sem ela, a capa mostra a marca.
  capas: ['/fotos/capa-1.webp', '/fotos/capa-2.webp'] as readonly string[],

  // TODO ─ promoção real, se houver, ex.: { titulo: 'Terça do espeto', texto: '3 por R$ 30' }.
  // Nunca inventar promoção: null esconde a faixa.
  promocao: null as Promocao,
} as const;

export type Bairro = (typeof LOJA.fretes)[number]['bairro'];
export type PagamentoId = (typeof LOJA.pagamentos)[number]['id'];
export type Pagamento = (typeof LOJA.pagamentos)[number];
