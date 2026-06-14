<script setup>
/**
 * Grid responsive de películas. Centraliza los estados de carga (skeletons),
 * error, vacío y la lista de tarjetas. Reutilizable en Home, búsqueda,
 * favoritos y listas.
 */
import MovieCard from '@/components/movie/MovieCard.vue'
import StateMessage from '@/components/ui/StateMessage.vue'

const props = defineProps({
  peliculas: { type: Array, default: () => [] },
  mapaGeneros: { type: Object, default: () => ({}) },
  // Si hay un género activo, se prioriza mostrarlo en la card cuando la peli lo tenga.
  generoPreferido: { type: [Number, null], default: null },
  cargando: { type: Boolean, default: false },
  error: { type: String, default: null },
  idsFavoritos: { type: Array, default: () => [] },
  cantidadSkeletons: { type: Number, default: 10 },
  tituloVacio: { type: String, default: 'No hay películas para mostrar' },
  descripcionVacio: { type: String, default: '' },
})

defineEmits(['alternar-favorito', 'reintentar'])

// Nombre del género a mostrar en la card. Prioriza el género filtrado
// (si la película lo incluye); si no, usa el primero de su lista.
function nombreGeneroDe(pelicula) {
  const ids = pelicula.genre_ids ?? []
  const id = props.generoPreferido && ids.includes(props.generoPreferido)
    ? props.generoPreferido
    : ids[0]
  return id ? props.mapaGeneros[id] || '' : ''
}
</script>

<template>
  <!-- Carga inicial: skeletons -->
  <div v-if="cargando" class="movie-grid" aria-busy="true">
    <div v-for="n in cantidadSkeletons" :key="n" class="movie-grid__skeleton">
      <div class="movie-grid__skeleton-poster"></div>
      <div class="movie-grid__skeleton-line"></div>
      <div class="movie-grid__skeleton-line movie-grid__skeleton-line--short"></div>
    </div>
  </div>

  <!-- Error -->
  <StateMessage
    v-else-if="error"
    variante="error"
    icon="⚠️"
    titulo="No pudimos cargar las películas"
    :descripcion="error"
  >
    <button class="movie-grid__retry" type="button" @click="$emit('reintentar')">
      Reintentar
    </button>
  </StateMessage>

  <!-- Vacío -->
  <StateMessage
    v-else-if="!peliculas.length"
    icon="🍿"
    :titulo="tituloVacio"
    :descripcion="descripcionVacio"
  />

  <!-- Resultados -->
  <div v-else class="movie-grid">
    <MovieCard
      v-for="pelicula in peliculas"
      :key="pelicula.id"
      :pelicula="pelicula"
      :nombre-genero="nombreGeneroDe(pelicula)"
      :es-favorito="idsFavoritos.includes(pelicula.id)"
      @alternar-favorito="$emit('alternar-favorito', $event)"
    />
  </div>
</template>

<style scoped>
.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-5);
}

/* --- Skeleton --- */
.movie-grid__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.movie-grid__skeleton-poster {
  aspect-ratio: 2 / 3;
  border-radius: var(--radius-lg);
}

.movie-grid__skeleton-line {
  height: 14px;
  width: 90%;
  border-radius: var(--radius-sm);
}

.movie-grid__skeleton-line--short {
  width: 55%;
}

.movie-grid__skeleton-poster,
.movie-grid__skeleton-line {
  background: linear-gradient(
    90deg,
    var(--color-surface-2) 25%,
    var(--color-border) 37%,
    var(--color-surface-2) 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .movie-grid__skeleton-poster,
  .movie-grid__skeleton-line {
    animation: none;
  }
}

.movie-grid__retry {
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-pill);
  font-weight: 600;
  color: var(--color-brand-contrast);
  background-color: var(--color-brand);
}

@media (max-width: 520px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-4);
  }
}
</style>
