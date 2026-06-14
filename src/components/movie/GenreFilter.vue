<script setup>
/**
 * Pestañas de filtrado por género. Presentacional: recibe la lista de
 * géneros y el activo, y emite `seleccionar` con el id (o null para "Todos").
 */
defineProps({
  generos: { type: Array, default: () => [] },
  generoActivo: { type: [Number, null], default: null },
})

defineEmits(['seleccionar'])
</script>

<template>
  <div class="genre-filter" role="tablist" aria-label="Filtrar por género">
    <button
      class="genre-filter__tab"
      :class="{ 'genre-filter__tab--active': generoActivo === null }"
      type="button"
      role="tab"
      :aria-selected="generoActivo === null"
      @click="$emit('seleccionar', null)"
    >
      Todos
    </button>
    <button
      v-for="genero in generos"
      :key="genero.id"
      class="genre-filter__tab"
      :class="{ 'genre-filter__tab--active': generoActivo === genero.id }"
      type="button"
      role="tab"
      :aria-selected="generoActivo === genero.id"
      @click="$emit('seleccionar', genero.id)"
    >
      {{ genero.name }}
    </button>
  </div>
</template>

<style scoped>
.genre-filter {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding-bottom: var(--space-2);
  /* Scrollbar acorde al tema (Firefox). */
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

/* Scrollbar acorde al tema (Chrome/Edge/Safari). */
.genre-filter::-webkit-scrollbar {
  height: 8px;
}

.genre-filter::-webkit-scrollbar-track {
  background: transparent;
}

.genre-filter::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: var(--radius-pill);
}

.genre-filter::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-text-faint);
}

.genre-filter__tab {
  flex-shrink: 0;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-pill);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  background-color: var(--color-surface-2);
  border: 1px solid transparent;
  transition: color var(--transition-fast), background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.genre-filter__tab:hover {
  color: var(--color-text);
  border-color: var(--color-border);
}

.genre-filter__tab--active {
  color: var(--color-brand-contrast);
  background-color: var(--color-brand);
}

.genre-filter__tab--active:hover {
  color: var(--color-brand-contrast);
  border-color: transparent;
}
</style>
