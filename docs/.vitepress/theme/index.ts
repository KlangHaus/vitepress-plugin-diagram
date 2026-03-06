import DefaultTheme from 'vitepress/theme'
import DiagramPreview from './DiagramPreview.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DiagramPreview', DiagramPreview)
  },
}
