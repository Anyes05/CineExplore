<script setup>
/**
 * Banner global que aparece cuando el navegador reporta que no hay red.
 * No bloquea la interacción: la app puede seguir mostrando datos cacheados.
 */
import { useEstadoConexion } from '@/composables/useEstadoConexion'

const { enLinea } = useEstadoConexion()
</script>

<template>
  <transition name="offline-banner">
    <div v-if="!enLinea" class="offline-banner" role="status" aria-live="polite">
      <span class="offline-banner__dot" aria-hidden="true"></span>
      <span class="offline-banner__text">
        Estás sin conexión. Mostramos lo último que guardamos.
      </span>
    </div>
  </transition>
</template>

<style scoped>
.offline-banner {
  position: sticky;
  top: 0;
  z-index: calc(var(--z-header) + 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-danger);
  color: #fff;
  font-size: var(--text-sm);
  font-weight: 600;
  text-align: center;
}

.offline-banner__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-pill);
  background-color: #fff;
  animation: offline-banner-pulse 1.4s ease-in-out infinite;
}

@keyframes offline-banner-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@media (prefers-reduced-motion: reduce) {
  .offline-banner__dot {
    animation: none;
  }
}

.offline-banner-enter-active,
.offline-banner-leave-active {
  transition: transform var(--transition-base), opacity var(--transition-base);
}
.offline-banner-enter-from,
.offline-banner-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
