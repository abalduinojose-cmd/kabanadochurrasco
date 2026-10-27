import type { Metadata, Viewport } from 'next';
import { Atendimento } from '@/components/atendimento/Atendimento';

export const metadata: Metadata = {
  title: 'Atendimento na mesa',
  description: 'Cardápio da Kabana do Churrasco para o tablet da mesa: o cliente escolhe e envia o pedido.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#0b0b0b',
};

/** /atendimento: o cardápio no tablet do garçom (ver components/atendimento). */
export default function AtendimentoPage() {
  return <Atendimento />;
}
