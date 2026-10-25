/**
 * Máscaras de input. Quinze linhas cada, sem dependência externa.
 * Todas são idempotentes: aplicar duas vezes dá o mesmo resultado.
 */

/** Só os dígitos de uma string. */
export const digitos = (v: string): string => v.replace(/\D/g, '');

/** (24) 99281-1184 ─ aceita fixo de 10 e celular de 11 dígitos. */
export function maskTelefone(valor: string): string {
  const d = digitos(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** 27255-000 */
export function maskCEP(valor: string): string {
  const d = digitos(valor).slice(0, 8);
  return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`;
}

/** Telefone brasileiro plausível: 10 ou 11 dígitos, DDD válido, celular começa com 9. */
export function telefoneValido(valor: string): boolean {
  const d = digitos(valor);
  if (d.length !== 10 && d.length !== 11) return false;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  if (d.length === 11 && d[2] !== '9') return false;
  return true;
}

/** Telefone do cliente no formato wa.me (55 + DDD + número). */
export function telefoneParaWhatsApp(valor: string): string {
  return `55${digitos(valor)}`;
}
