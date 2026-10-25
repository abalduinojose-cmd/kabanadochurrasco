import { ImageResponse } from 'next/og';
import { LOJA } from '@/data/loja';

// Exigido pela exportação estática da prévia (output: export).
export const dynamic = 'force-static';

/**
 * Imagem de compartilhamento, gerada em build.
 *
 * Mesmo desenho do app: telhado, chama e brasa. Nenhuma foto, então não
 * depende do acervo da loja e nunca fica desatualizada.
 */

export const alt = `${LOJA.nome}, ${LOJA.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const AGUA = 'M30 266 C235 195, 410 100, 578 32 L594 88 C425 152, 245 245, 30 266 Z';

export default function Imagem() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'radial-gradient(ellipse 70% 60% at 50% 18%, #6b2c00 0%, #0B0B0B 62%)',
          fontFamily: 'sans-serif',
        }}
      >
        <svg width="760" height="190" viewBox="0 0 1200 300">
          <defs>
            <linearGradient id="c" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#D94A00" />
              <stop offset="55%" stopColor="#FF6A00" />
              <stop offset="100%" stopColor="#FF9D3D" />
            </linearGradient>
          </defs>
          <g fill="#FF6A00">
            <path d={AGUA} />
            <path d={AGUA} transform="translate(1200,0) scale(-1,1)" />
          </g>
          <g transform="translate(600,4) scale(1.42)">
            <path
              fill="url(#c)"
              d="M0 0 C6 42, 34 56, 44 80 C48 68, 48 56, 45 46
                 C68 74, 78 108, 68 138 C56 174, 30 196, 0 196
                 C-30 196, -56 174, -68 138 C-78 108, -68 74, -45 46
                 C-48 56, -48 68, -44 80 C-34 56, -6 42, 0 0 Z"
            />
          </g>
        </svg>

        <div
          style={{
            display: 'flex',
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: -3,
            color: '#F5F1EC',
            marginTop: -18,
          }}
        >
          KABANA
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 66,
            fontWeight: 900,
            letterSpacing: -2,
            color: '#F5F1EC',
            marginTop: -8,
          }}
        >
          DO CHURRASCO
        </div>

        <div
          style={{
            display: 'flex',
            width: 560,
            height: 6,
            background: '#FF6A00',
            marginTop: 22,
          }}
        />

        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 10,
            color: '#A29A92',
            marginTop: 18,
          }}
        >
          {LOJA.tagline.toUpperCase()}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 22,
            color: '#FF6A00',
            marginTop: 14,
          }}
        >
          {LOJA.cidade}/{LOJA.uf}
        </div>
      </div>
    ),
    size,
  );
}
