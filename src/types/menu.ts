/**
 * ────────────────────────────────────────────────────────────────
 *  PROVISÓRIO. Estes tipos são uma inferência a partir do prompt,
 *  escritos só para a fase 2 (identidade visual) compilar.
 *  Quando o `menu.ts` real chegar, ele manda: os nomes de campo e os
 *  ids são os dele, e este arquivo se ajusta ao que ele exporta.
 * ────────────────────────────────────────────────────────────────
 */

export type BadgeItem = 'alcoolico' | 'novidade' | 'mais-pedido' | 'picante';

export type Opcao = {
  readonly id: string;
  readonly nome: string;
  /** Em reais, como o dono digita. Vira centavos com toCents(). */
  readonly preco: number;
};

export type OptionGroup = {
  readonly id: string;
  readonly nome: string;
  readonly type: 'single' | 'multiple';
  readonly required: boolean;
  readonly max?: number;
  readonly options: readonly Opcao[];
  /** Id da opção pré-marcada (usado no ponto da carne: "Ao ponto"). */
  readonly padrao?: string;
};

export type MenuItem = {
  readonly id: string;
  readonly nome: string;
  readonly descricao?: string;
  readonly preco: number;
  readonly available: boolean;
  /** Slot da foto. Ausente, o card cai no placeholder da marca. */
  readonly imageUrl?: string;
  /**
   * Item de vitrine: sobe para o topo da categoria em card grande com foto.
   * O resto da categoria segue na lista compacta com a linha pontilhada.
   */
  readonly destaque?: boolean;
  readonly badges?: readonly BadgeItem[];
  readonly optionGroups?: readonly string[];
};

export type MenuCategoria = {
  readonly id: string;
  readonly nome: string;
  readonly descricao?: string;
  readonly items: readonly MenuItem[];
};
