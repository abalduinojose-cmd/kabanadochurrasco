import { Beef, Candy, CupSoda, Flame, IceCreamCone, Salad, Sandwich, Utensils, type LucideIcon } from 'lucide-react';
import { SECOES } from '@/data/secoes';

/**
 * Ícone da seção de um item, para o quadro dos pratos sem foto: a lista fica
 * alinhada (todo item com o seu quadro) sem fingir uma foto que não existe.
 */

const POR_SECAO: Readonly<Record<string, LucideIcon>> = {
  lanches: Sandwich,
  espetinhos: Flame,
  tabuas: Beef,
  acompanhamentos: Salad,
  sobremesas: IceCreamCone,
  bebidas: CupSoda,
  doces: Candy,
};

const SECAO_DA_CATEGORIA = new Map(SECOES.flatMap((s) => s.categorias.map((c) => [c.categoriaId, s.id] as const)));

export function iconeDaCategoria(categoriaId: string): LucideIcon {
  return POR_SECAO[SECAO_DA_CATEGORIA.get(categoriaId) ?? ''] ?? Utensils;
}
