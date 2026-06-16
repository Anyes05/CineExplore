<script setup>
import { RouterView } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUiStore } from '@/stores/ui'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import OfflineBanner from '@/components/layout/OfflineBanner.vue'
import AuthModal from '@/components/auth/AuthModal.vue'
import AddToListModal from '@/components/list/AddToListModal.vue'

const ui = useUiStore()
const { modalAuthAbierto, peliculaParaLista } = storeToRefs(ui)
</script>

<template>
  <div class="app-shell">
    <OfflineBanner />
    <AppHeader />

    <main class="app-shell__main">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <AppFooter />

    <AuthModal v-if="modalAuthAbierto" />
    <AddToListModal
      v-if="peliculaParaLista"
      :pelicula="peliculaParaLista"
      @cerrar="ui.cerrarModalLista()"
    />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-shell__main {
  flex: 1;
}

/* Transición suave entre vistas. */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
