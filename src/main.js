import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'

const app = createApp(App)

app.use(router)

app.mount('#app')

app.config.globalProperties.Prism = Prism

import CodeBlock from './components/CodeBlock.vue'
app.component('CodeBlock', CodeBlock)
import CodeLine from './components/CodeLine.vue'
app.component('CodeLine', CodeLine)
