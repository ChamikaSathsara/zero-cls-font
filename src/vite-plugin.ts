import type { Plugin } from 'vite';
import { generateZeroClsCss, FallbackCSSOptions } from './calculator';

export interface ZeroClsViteOptions {
  fonts: FallbackCSSOptions[];
}

export function zeroClsFontPlugin(options: ZeroClsViteOptions): Plugin {
  const virtualModuleId = 'virtual:zero-cls-font.css';
  const resolvedVirtualModuleId = '\0' + virtualModuleId + '.css';

  return {
    name: 'vite-plugin-zero-cls-font',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return options.fonts
          .map((fontConfig) => generateZeroClsCss(fontConfig).css)
          .join('\n\n');
      }
    },
  };
}
