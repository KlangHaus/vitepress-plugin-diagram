import DefaultTheme from 'vitepress/theme'
import DiagramPreview from '../../../src/client/DiagramPreview.vue'
import './diagram-dark.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DiagramPreview', DiagramPreview)
  },
}
