<script setup>
/** Botón para alternar entre tema claro y oscuro. */
import { useTemaStore } from '@/stores/tema'

const tema = useTemaStore()
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-pressed="tema.esOscuro"
    :title="tema.esOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
    @click="tema.alternar()"
  >
    <span class="u-visually-hidden">Alternar tema</span>
    <!-- Sol / Luna según el tema activo -->
    <svg
      v-if="tema.esOscuro"
      class="theme-toggle__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
    <svg
      v-else
      class="theme-toggle__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-pill);
  color: var(--color-text-muted);
  background-color: var(--color-surface-2);
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.theme-toggle:hover {
  color: var(--color-brand);
  background-color: var(--color-border);
}

.theme-toggle__icon {
  width: 20px;
  height: 20px;
}
</style>
