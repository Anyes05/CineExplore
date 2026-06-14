<script setup>
/**
 * Tarjeta de película (presentacional y reutilizable).
 * Recibe el objeto `movie` de TMDB y, opcionalmente, el nombre de su género.
 * Emite `alternar-favorito` al pulsar el corazón (la lógica vive fuera).
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { urlImagen } from '@/services/tmdb'

const props = defineProps({
  pelicula: { type: Object, required: true },
  nombreGenero: { type: String, default: '' },
  esFavorito: { type: Boolean, default: false },
})

defineEmits(['alternar-favorito'])

const poster = computed(() => urlImagen(props.pelicula.poster_path, 'w342'))
const anio = computed(() => props.pelicula.release_date?.slice(0, 4) || '—')
const puntuacion = computed(() =>
  props.pelicula.vote_average ? props.pelicula.vote_average.toFixed(1) : 'N/D'
)
</script>

<template>
  <article class="movie-card">
    <RouterLink class="movie-card__media" :to="`/pelicula/${pelicula.id}`">
      <img
        v-if="poster"
        class="movie-card__poster"
        :src="poster"
        :alt="`Póster de ${pelicula.title}`"
        loading="lazy"
      />
      <div v-else class="movie-card__poster movie-card__poster--empty" aria-hidden="true">
        🎬
      </div>

      <span v-if="nombreGenero" class="movie-card__genre">{{ nombreGenero }}</span>

      <button
        class="movie-card__fav"
        :class="{ 'movie-card__fav--active': esFavorito }"
        type="button"
        :aria-pressed="esFavorito"
        :aria-label="esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'"
        @click.prevent="$emit('alternar-favorito', pelicula)"
      >
        <svg viewBox="0 0 24 24" :fill="esFavorito ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
          <path d="M12 21s-7.5-4.6-9.5-9.2C1.1 8.2 3 5 6.2 5c2 0 3.2 1.2 3.8 2.3C10.6 6.2 11.8 5 13.8 5 17 5 18.9 8.2 17.5 11.8 15.5 16.4 12 21 12 21z" />
        </svg>
      </button>
    </RouterLink>

    <div class="movie-card__body">
      <h3 class="movie-card__title">
        <RouterLink class="movie-card__link" :to="`/pelicula/${pelicula.id}`">
          {{ pelicula.title }}
        </RouterLink>
      </h3>
      <p class="movie-card__overview">{{ pelicula.overview || 'Sin sinopsis disponible.' }}</p>

      <footer class="movie-card__meta">
        <span class="movie-card__year">{{ anio }}</span>
        <span class="movie-card__rating">
          <svg class="movie-card__star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
          </svg>
          {{ puntuacion }}
        </span>
      </footer>
    </div>
  </article>
</template>

<style scoped>
.movie-card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform var(--transition-base), box-shadow var(--transition-base),
    border-color var(--transition-base);
}

.movie-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: transparent;
}

.movie-card__media {
  position: relative;
  display: block;
  aspect-ratio: 2 / 3;
  background-color: var(--color-surface-2);
}

.movie-card__poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-card__poster--empty {
  display: grid;
  place-items: center;
  font-size: var(--text-4xl);
}

.movie-card__genre {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-brand-contrast);
  background-color: color-mix(in srgb, var(--color-brand) 92%, transparent);
  border-radius: var(--radius-pill);
}

.movie-card__fav {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-pill);
  color: #fff;
  background-color: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  transition: background-color var(--transition-fast), color var(--transition-fast),
    transform var(--transition-fast);
}

.movie-card__fav svg {
  width: 18px;
  height: 18px;
}

.movie-card__fav:hover {
  transform: scale(1.08);
}

.movie-card__fav--active {
  color: var(--color-danger);
  background-color: rgba(255, 255, 255, 0.92);
}

.movie-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
}

.movie-card__title {
  font-size: var(--text-base);
  font-weight: 700;
}

.movie-card__link:hover {
  color: var(--color-brand);
}

.movie-card__overview {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  /* Recorta a 3 líneas. */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.movie-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.movie-card__rating {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-weight: 600;
  color: var(--color-text);
}

.movie-card__star {
  width: 15px;
  height: 15px;
  color: var(--color-gold);
}
</style>
