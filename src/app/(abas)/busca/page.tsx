import type { Metadata } from 'next';
import { PaginaBusca } from '@/components/busca/PaginaBusca';

export const metadata: Metadata = { title: 'Buscar' };

/** Aba Busca: campo, buscas recentes e os resultados em linhas de produto. */
export default function Busca() {
  return <PaginaBusca />;
}
