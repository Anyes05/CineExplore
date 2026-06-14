import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Inicio' },
  },
  {
    // Vistas que aún no existen se agregarán en próximas iteraciones.
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Página no encontrada' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Actualiza el título del documento según la ruta.
router.afterEach((to) => {
  const base = 'CineExplore'
  document.title = to.meta.title ? `${to.meta.title} · ${base}` : base
})

export default router
