import { defineConfig } from 'tsup'
import { writeFileSync } from 'fs'
import { darkTheme, generateDarkModeStyles } from './src/render/theme'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['markdown-it'],
  onSuccess() {
    const css = `/* Auto-generated dark mode styles for vitepress-plugin-mermaid-diagram */
/* Import this in your VitePress theme to enable dark mode support */

.vp-diagram {
  display: flex;
  justify-content: center;
}

.vp-diagram svg {
  max-width: 100%;
  height: auto;
}

${generateDarkModeStyles(darkTheme)}
`
    writeFileSync('dist/diagram-dark.css', css)
    console.log('CSS dist/diagram-dark.css')
  },
})
