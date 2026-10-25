/**
 * "Reduzir movimento".
 *
 * A máquina do dono está com as animações do Windows desligadas, então o
 * Chrome dele reporta `reduce`. Movimento pedido roda mesmo assim, em versão
 * contida; o que anda com a rolagem roda sempre. Esta função é o único lugar
 * que lê a preferência, para a regra não se espalhar.
 */

const CHAVE = 'kabana:movimento';

/**
 * `?movimento=pleno` força a versão completa durante a sessão (para rever as
 * animações numa máquina com reduce); `?movimento=sistema` volta ao normal.
 */
function forcadoPleno(): boolean {
  try {
    const pedido = new URLSearchParams(window.location.search).get('movimento');
    if (pedido === 'pleno') sessionStorage.setItem(CHAVE, 'pleno');
    if (pedido === 'sistema') sessionStorage.removeItem(CHAVE);
    return sessionStorage.getItem(CHAVE) === 'pleno';
  } catch {
    return false;
  }
}

export function querMovimento(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  if (forcadoPleno()) return true;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
