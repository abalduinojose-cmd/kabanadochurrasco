import type { Metadata, Viewport } from 'next';
import { Cadastro } from '@/components/cadastro/Cadastro';

export const metadata: Metadata = {
  title: 'Cadastro',
  robots: { index: false, follow: false },
};

// O topo do cadastro é o carvão da fachada: a barra do sistema acompanha.
export const viewport: Viewport = { themeColor: '#120e0b' };

export default function CadastroPage() {
  return <Cadastro />;
}
