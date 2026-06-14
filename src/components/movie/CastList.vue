<script setup>
/**
 * Reparto de una película en scroll horizontal. Presentacional.
 */
import { urlImagen } from '@/services/tmdb'

defineProps({
  personas: { type: Array, default: () => [] },
})
</script>

<template>
  <ul class="cast-list">
    <li v-for="persona in personas" :key="persona.id" class="cast-list__item">
      <div class="cast-list__avatar">
        <img
          v-if="persona.profile_path"
          :src="urlImagen(persona.profile_path, 'w185')"
          :alt="persona.name"
          loading="lazy"
        />
        <span v-else class="cast-list__avatar-fallback" aria-hidden="true">👤</span>
      </div>
      <p class="cast-list__name">{{ persona.name }}</p>
      <p class="cast-list__character">{{ persona.character }}</p>
    </li>
  </ul>
</template>

<style scoped>
.cast-list {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 120px;
  gap: var(--space-4);
  overflow-x: auto;
  padding-bottom: var(--space-3);
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.cast-list::-webkit-scrollbar {
  height: 8px;
}
.cast-list::-webkit-scrollbar-track {
  background: transparent;
}
.cast-list::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: var(--radius-pill);
}

.cast-list__item {
  text-align: center;
}

.cast-list__avatar {
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--color-surface-2);
  margin-bottom: var(--space-2);
}

.cast-list__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cast-list__avatar-fallback {
  display: grid;
  place-items: center;
  height: 100%;
  font-size: var(--text-3xl);
}

.cast-list__name {
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: var(--leading-tight);
}

.cast-list__character {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
