import DefaultTheme from 'vitepress/theme'
import DiagramPreview from './DiagramPreview.vue'
import './diagram-dark.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DiagramPreview', DiagramPreview)
  },
}
