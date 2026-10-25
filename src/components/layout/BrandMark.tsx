/**
 * O telhado da cabana com o fogo dentro, desenhado em SVG.
 * Não é o logo colado como imagem: é a forma da marca, que reaparece
 * nos divisores de seção e no entalhe da barra de checkout.
 */

type Props = {
  className?: string;
  /** Some com a chama quando a marca aparece pequena (favicon, cabeçalho comprimido). */
  comFogo?: boolean;
  /** Recorta no miolo do telhado: a inclinação lê melhor em tamanho pequeno. */
  recorte?: boolean;
  titulo?: string;
  /** Cor do telhado (a chama mantém o degradê). */
  cor?: string;
};

/** Meia água do telhado: lâmina que afina até virar ponta na extremidade. */
const AGUA =
  'M30 266 C235 195, 410 100, 578 32 L594 88 C425 152, 245 245, 30 266 Z';

export function BrandMark({ className, comFogo = true, recorte = false, titulo, cor = 'var(--color-fogo)' }: Props) {
  return (
    <svg
      viewBox={recorte ? '250 0 700 300' : '0 0 1200 300'}
      className={className}
      role={titulo ? 'img' : 'presentation'}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      <defs>
        <linearGradient id="kb-chama" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#C24A00" />
          <stop offset="55%" stopColor="var(--color-fogo)" />
          <stop offset="100%" stopColor="#FFB15C" />
        </linearGradient>
        <linearGradient id="kb-nucleo" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--color-fogo)" />
          <stop offset="100%" stopColor="#FFD08A" />
        </linearGradient>
      </defs>

      {/* Telhado: duas águas espelhadas, com folga no cume para o fogo passar. */}
      <g fill={cor}>
        <path d={AGUA} />
        <path d={AGUA} transform="translate(1200,0) scale(-1,1)" />
      </g>

      {comFogo && (
        <g transform="translate(600,4) scale(1.42)">
          {/* Língua central */}
          <path
            fill="url(#kb-chama)"
            d="M0 0 C6 42, 34 56, 44 80 C48 68, 48 56, 45 46
               C68 74, 78 108, 68 138 C56 174, 30 196, 0 196
               C-30 196, -56 174, -68 138 C-78 108, -68 74, -45 46
               C-48 56, -48 68, -44 80 C-34 56, -6 42, 0 0 Z"
          />
          {/* Línguas laterais, mais baixas */}
          <path
            fill="var(--color-fogo)"
            opacity="0.92"
            d="M-92 62 C-84 92, -104 106, -104 132 C-104 162, -86 186, -62 192
               C-84 176, -92 156, -88 134 C-84 112, -96 86, -92 62 Z"
          />
          <path
            fill="var(--color-fogo)"
            opacity="0.92"
            d="M92 62 C84 92, 104 106, 104 132 C104 162, 86 186, 62 192
               C84 176, 92 156, 88 134 C84 112, 96 86, 92 62 Z"
          />
          {/* Núcleo claro */}
          <path
            fill="url(#kb-nucleo)"
            d="M0 74 C7 104, 26 118, 26 144 C26 168, 14 184, 0 184
               C-14 184, -26 168, -26 144 C-26 118, -7 104, 0 74 Z"
          />
        </g>
      )}
    </svg>
  );
}
