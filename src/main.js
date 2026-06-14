import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useTemaStore } from './stores/tema'

import './assets/styles/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Aplica el tema guardado antes del primer render para evitar parpadeo.
useTemaStore().aplicar()

app.mount('#app')
