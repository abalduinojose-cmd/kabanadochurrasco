import type { Metadata } from 'next';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { BarraTopo } from '@/components/layout/BarraTopo';
import { LinkBotao } from '@/components/ui/Button';
import { LOJA, type DiaSemana } from '@/data/loja';
import { formatBRL, toCents } from '@/lib/money';
import { FAIXA_ENTREGA } from '@/lib/delivery';
import { NOMES_DIA } from '@/lib/store-hours';

export const metadata: Metadata = { title: 'Ajuda' };

const DIAS: readonly DiaSemana[] = [1, 2, 3, 4, 5, 6, 0];
const saudacao = encodeURIComponent(`Olá! Tenho uma dúvida sobre o app da ${LOJA.nome}.`);

/**
 * Perguntas frequentes, todas respondidas com o que está em loja.ts: nada
 * aqui precisa ser editado quando um horário, taxa ou mínimo mudar.
 */
function perguntas() {
  const taxas = LOJA.fretes.map((f) => toCents(f.taxa));
  const menorTaxa = formatBRL(Math.min(...taxas));
  const maiorTaxa = formatBRL(Math.max(...taxas));
  const horarios = DIAS.map((d) => {
    const janelas = LOJA.horarios[d];
    const nome = NOMES_DIA[d].replace('-feira', '');
    return `${nome.charAt(0).toUpperCase()}${nome.slice(1)}: ${janelas ? janelas.map((j) => `${j.abre} às ${j.fecha}`).join(' e ') : 'fechado'}`;
  });
  const pagamentos = LOJA.pagamentos.map((p) => p.label).join(', ');

  return [
    {
      q: 'Como faço o pedido?',
      a: [
        'Escolha os itens no cardápio, toque em Ver sacola e depois em Continuar. No fim, o botão Fazer pedido abre o WhatsApp da loja com a mensagem do pedido pronta: é só enviar.',
        'A loja confirma o pedido na própria conversa. O app não cobra nada e não guarda cartão.',
      ],
    },
    {
      q: 'Quais bairros vocês entregam e quanto custa?',
      a: [
        `Entregamos em ${LOJA.fretes.length} bairros e localidades de ${LOJA.cidade}, com taxa de ${menorTaxa} a ${maiorTaxa} conforme a distância.`,
        'Toque em "Entrega em" no Início, ou em "Escolher bairro" na sacola, para ver a lista completa com a taxa de cada um.',
        `O tempo de entrega é de ${FAIXA_ENTREGA} a partir da confirmação. Se o seu bairro não está na lista, fale com a loja pelo WhatsApp.`,
      ],
    },
    {
      q: 'Tem pedido mínimo?',
      a: [
        LOJA.pedidoMinimo > 0
          ? `Sim, ${formatBRL(toCents(LOJA.pedidoMinimo))} em itens, sem contar a taxa de entrega.`
          : 'Não. Dá para pedir a partir de um item; só a taxa de entrega do seu bairro é somada.',
        ...(LOJA.minEspetinhos > 1
          ? [`Espetinhos saem a partir de ${LOJA.minEspetinhos} unidades por pedido (pode misturar os sabores).`]
          : []),
      ],
    },
    {
      q: 'Como pago?',
      a: [`Aceitamos ${pagamentos}. O pagamento é feito na entrega ou na retirada, combinado com a loja pelo WhatsApp.`, 'Pagando em dinheiro, informe no pedido para quanto precisa de troco.'],
    },
    ...(LOJA.retiradaNoLocal
      ? [
          {
            q: 'Posso retirar na loja?',
            a: ['Sim. Escolha Retirada na loja antes de finalizar e a taxa de entrega some. A loja avisa pelo WhatsApp quando o pedido estiver pronto.'],
          },
        ]
      : []),
    {
      q: 'Qual é o horário de funcionamento?',
      a: horarios,
    },
    {
      q: 'Posso montar o pedido com a loja fechada?',
      a: ['Pode. A sacola fica guardada neste aparelho por 12 horas; quando a loja abrir, é só finalizar e enviar.'],
    },
    {
      q: 'Como instalo o app no celular?',
      a: [
        'No Android e no computador, use o botão Instalar que aparece no Início ou no Perfil.',
        'No iPhone, toque em Compartilhar no Safari e depois em Adicionar à Tela de Início.',
      ],
    },
  ];
}

export default function AjudaPage() {
  return (
    <>
      <BarraTopo titulo="Ajuda" voltarPara="/perfil" />
      <main className="mx-auto max-w-2xl px-4 pb-16">
        <h1 className="pt-5 text-[20px] font-extrabold text-texto">Como funciona</h1>
        <p className="mt-1 text-[14px] text-texto-2">As dúvidas mais comuns sobre pedido, entrega e pagamento.</p>

        <div className="mt-4 divide-y divide-divisor">
          {perguntas().map((p) => (
            <details key={p.q} className="group py-1">
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 py-2 text-[15px] font-semibold text-texto [&::-webkit-details-marker]:hidden">
                <span className="flex-1">{p.q}</span>
                <ChevronDown className="size-5 shrink-0 text-texto-3 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <div className="space-y-2 pb-4 text-[14px] leading-relaxed text-texto-2">
                {p.a.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-8 rounded-cartao bg-fundo-2 p-4 text-center">
          <p className="text-[15px] font-bold text-texto">Ficou alguma dúvida?</p>
          <p className="mt-1 text-[13px] text-texto-2">A loja responde pelo WhatsApp no horário de funcionamento.</p>
          <LinkBotao href={`https://wa.me/${LOJA.whatsapp}?text=${saudacao}`} variante="secundario" tamanho="md" className="mt-3">
            <MessageCircle className="size-4" aria-hidden />
            Falar com a loja
          </LinkBotao>
        </div>
      </main>
    </>
  );
}
