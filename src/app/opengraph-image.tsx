import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { LOJA } from '@/data/loja';

// Exigido pela exportação estática da prévia (output: export).
export const dynamic = 'force-static';

/**
 * Imagem de compartilhamento, gerada em build: o logo oficial da loja
 * (`assets/logo-kabana.png`) no carvão com a brasa por trás, como a fachada
 * do Início, e a cidade embaixo. Nenhuma foto de prato, então nunca fica
 * desatualizada.
 */

export const alt = `${LOJA.nome}, ${LOJA.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const LOGO = `data:image/png;base64,${readFileSync(join(process.cwd(), 'assets/logo-kabana.png')).toString('base64')}`;

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
          background: 'radial-gradient(ellipse 65% 70% at 50% 42%, #5a2604 0%, #1d1410 58%, #120e0b 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} width={508} height={490} alt="" />
        <div style={{ display: 'flex', marginTop: 18, fontSize: 28, letterSpacing: 2, color: '#FF9A52' }}>
          Peça pelo app • Posse, {LOJA.cidade}/{LOJA.uf}
        </div>
      </div>
    ),
    size,
  );
}
