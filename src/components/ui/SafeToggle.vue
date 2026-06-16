<script setup>
/**
 * Botón para activar / desactivar el "modo seguro".
 * Cuando está activo, el catálogo excluye keywords explícitas y filtra
 * resultados sin moderar en las búsquedas (ver tmdb.js + stores/peliculas.js).
 */
import { storeToRefs } from 'pinia'
import { usePreferenciasStore } from '@/stores/preferencias'

const preferencias = usePreferenciasStore()
const { modoSeguro } = storeToRefs(preferencias)
</script>

<template>
  <button
    class="safe-toggle"
    :class="{ 'safe-toggle--off': !modoSeguro }"
    type="button"
    :aria-pressed="modoSeguro"
    :title="modoSeguro ? 'Modo seguro activado · click para mostrar todo el catálogo' : 'Modo seguro desactivado · click para ocultar contenido explícito'"
    @click="preferencias.alternarModoSeguro()"
  >
    <span class="u-visually-hidden">Modo seguro</span>
    <!-- Escudo cerrado cuando está activo, abierto cuando no -->
    <svg
      v-if="modoSeguro"
      class="safe-toggle__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
    <svg
      v-else
      class="safe-toggle__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3z" />
      <path d="M9 10h6" />
    </svg>
  </button>
</template>

<style scoped>
.safe-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-pill);
  color: var(--color-success);
  background-color: color-mix(in srgb, var(--color-success) 14%, transparent);
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.safe-toggle:hover {
  background-color: color-mix(in srgb, var(--color-success) 24%, transparent);
}

.safe-toggle--off {
  color: var(--color-text-muted);
  background-color: var(--color-surface-2);
}

.safe-toggle--off:hover {
  color: var(--color-text);
  background-color: var(--color-border);
}

.safe-toggle__icon {
  width: 20px;
  height: 20px;
}
</style>
