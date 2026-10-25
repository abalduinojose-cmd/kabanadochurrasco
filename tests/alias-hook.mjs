/**
 * Faz o Node entender, nos testes, as duas resoluções que o Next resolve
 * sozinho no app:
 *   1. o alias "@/..." do tsconfig;
 *   2. import relativo sem extensão ("./money"), que o ESM puro recusa.
 *
 * Assim o código-fonte continua escrito do jeito idiomático do Next, sem
 * espalhar ".ts" pelos imports só para agradar o test runner.
 */
import { registerHooks } from 'node:module';

const raiz = new URL('../src/', import.meta.url);

const semExtensao = (s) => !/\.[a-z]+$/i.test(s);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      return nextResolve(new URL(specifier.slice(2) + '.ts', raiz).href, context);
    }

    if ((specifier.startsWith('./') || specifier.startsWith('../')) && semExtensao(specifier)) {
      try {
        return nextResolve(specifier + '.ts', context);
      } catch {
        // Não era um módulo .ts: segue a resolução normal.
      }
    }

    return nextResolve(specifier, context);
  },
});
