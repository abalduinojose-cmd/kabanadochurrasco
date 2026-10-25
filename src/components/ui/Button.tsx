import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import Link from 'next/link';

/**
 * Botão no padrão do iFood: 48px, raio 8, texto 15px semibold.
 * Primário = laranja com texto escuro (branco sobre laranja não passa de
 * contraste). Secundário = branco com borda. Desabilitado = cinza, não opacidade.
 */

type Variante = 'primario' | 'secundario' | 'terciario' | 'perigo';
type Tamanho = 'md' | 'lg';

const VARIANTES: Record<Variante, string> = {
  primario:
    'bg-fogo text-carvao hover:brightness-95 active:brightness-90 disabled:bg-fundo-2 disabled:text-texto-3',
  secundario:
    'border border-borda bg-cartao text-fogo-texto hover:bg-fundo-2 disabled:text-texto-3 disabled:border-divisor',
  terciario: 'text-fogo-texto hover:bg-fogo-suave disabled:text-texto-3',
  perigo: 'bg-vermelho-suave text-vermelho hover:brightness-95',
};

const TAMANHOS: Record<Tamanho, string> = {
  md: 'h-11 px-4 text-[14px]',
  lg: 'h-[52px] px-5 text-[15px]',
};

export function classesDoBotao(variante: Variante = 'primario', tamanho: Tamanho = 'lg', className = ''): string {
  return `inline-flex items-center justify-center gap-2 rounded-botao font-bold transition-colors disabled:cursor-not-allowed ${VARIANTES[variante]} ${TAMANHOS[tamanho]} ${className}`;
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  tamanho?: Tamanho;
};

export function Button({ variante = 'primario', tamanho = 'lg', className = '', type = 'button', ...props }: Props) {
  return <button type={type} className={classesDoBotao(variante, tamanho, className)} {...props} />;
}

type PropsLink = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variante?: Variante;
  tamanho?: Tamanho;
};

/**
 * Link com cara de botão. Navegação interna pelo next/link; endereço externo
 * (WhatsApp) abre em nova aba. Evita botão dentro de link, que é HTML inválido.
 */
export function LinkBotao({ href, variante = 'primario', tamanho = 'lg', className = '', children, ...props }: PropsLink) {
  const classes = classesDoBotao(variante, tamanho, className);
  if (href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
