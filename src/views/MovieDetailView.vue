<script setup>
/**
 * Detalle de una película. Usa estado LOCAL (useTareaAsync) porque la
 * info de una peli puntual no necesita centralizarse en un store.
 */
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { obtenerDetallePelicula, urlImagen } from '@/services/tmdb'
import { useTareaAsync } from '@/composables/useTareaAsync'
import CastList from '@/components/movie/CastList.vue'
import StateMessage from '@/components/ui/StateMessage.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  id: { type: [String, Number], required: true },
})

const router = useRouter()
const { datos: pelicula, error, cargando, ejecutar } = useTareaAsync(obtenerDetallePelicula)

onMounted(() => ejecutar(props.id))
// Si se navega de una peli a otra sin desmontar la vista, recarga.
watch(() => props.id, (nuevoId) => ejecutar(nuevoId))

const backdrop = computed(() => urlImagen(pelicula.value?.backdrop_path, 'w1280'))
const poster = computed(() => urlImagen(pelicula.value?.poster_path, 'w500'))
const anio = computed(() => pelicula.value?.release_date?.slice(0, 4) || '—')
const puntuacion = computed(() =>
  pelicula.value?.vote_average ? pelicula.value.vote_average.toFixed(1) : 'N/D'
)

const duracion = computed(() => {
  const min = pelicula.value?.runtime
  if (!min) return null
  const horas = Math.floor(min / 60)
  const minutos = min % 60
  return horas ? `${horas}h ${minutos}m` : `${minutos}m`
})

const reparto = computed(() => pelicula.value?.credits?.cast?.slice(0, 12) ?? [])
const director = computed(
  () => pelicula.value?.credits?.crew?.find((p) => p.job === 'Director') ?? null
)

const trailer = computed(() => {
  const videos = pelicula.value?.videos?.results ?? []
  return (
    videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
    videos.find((v) => v.site === 'YouTube') ||
    null
  )
})
const urlTrailer = computed(() =>
  trailer.value ? `https://www.youtube.com/watch?v=${trailer.value.key}` : null
)

function volver() {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'home' })
}
</script>

<template>
  <div class="detail">
    <!-- Carga -->
    <div v-if="cargando" class="detail__loading u-container">
      <div class="detail__spinner" aria-label="Cargando"></div>
      <p>Cargando película…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="u-container detail__error">
      <StateMessage
        variante="error"
        icon="⚠️"
        titulo="No pudimos cargar la película"
        :descripcion="error"
      >
        <BaseButton variante="primary" @click="ejecutar(id)">Reintentar</BaseButton>
      </StateMessage>
    </div>

    <!-- Contenido -->
    <template v-else-if="pelicula">
      <div
        class="detail__backdrop"
        :class="{ 'detail__backdrop--empty': !backdrop }"
        :style="backdrop ? { backgroundImage: `url(${backdrop})` } : null"
      >
        <div class="detail__backdrop-overlay"></div>
      </div>

      <div class="detail__body u-container">
        <button class="detail__back" type="button" @click="volver">
          <span aria-hidden="true">←</span> Volver
        </button>

        <div class="detail__main">
          <img
            v-if="poster"
            class="detail__poster"
            :src="poster"
            :alt="`Póster de ${pelicula.title}`"
          />
          <div v-else class="detail__poster detail__poster--empty" aria-hidden="true">🎬</div>

          <div class="detail__info">
            <h1 class="detail__title">{{ pelicula.title }}</h1>
            <p v-if="pelicula.tagline" class="detail__tagline">«{{ pelicula.tagline }}»</p>

            <div class="detail__meta">
              <span class="detail__rating">
                <svg class="detail__star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
                </svg>
                {{ puntuacion }}
                <span class="detail__votes">({{ pelicula.vote_count }} votos)</span>
              </span>
              <span>{{ anio }}</span>
              <span v-if="duracion">{{ duracion }}</span>
            </div>

            <ul v-if="pelicula.genres?.length" class="detail__genres">
              <li v-for="g in pelicula.genres" :key="g.id" class="detail__genre">{{ g.name }}</li>
            </ul>

            <p class="detail__overview">
              {{ pelicula.overview || 'Sin sinopsis disponible.' }}
            </p>

            <p v-if="director" class="detail__director">
              <span class="detail__label">Dirección:</span> {{ director.name }}
            </p>

            <div v-if="urlTrailer" class="detail__actions">
              <a class="detail__trailer" :href="urlTrailer" target="_blank" rel="noopener">
                ▶ Ver tráiler
              </a>
              <!-- Puntuación propia, favoritos y listas: próximas iteraciones. -->
            </div>
          </div>
        </div>

        <section v-if="reparto.length" class="detail__cast">
          <h2 class="detail__section-title">Reparto principal</h2>
          <CastList :personas="reparto" />
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* --- Carga --- */
.detail__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding-block: var(--space-8);
  color: var(--color-text-muted);
}

.detail__spinner {
  width: 44px;
  height: 44px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-brand);
  border-radius: var(--radius-pill);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.detail__error {
  padding-block: var(--space-7);
}

/* --- Backdrop --- */
.detail__backdrop {
  position: relative;
  height: 360px;
  background-size: cover;
  background-position: center 20%;
}

.detail__backdrop--empty {
  background: var(--gradient-hero);
}

.detail__backdrop-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-bg) 25%, transparent) 0%,
    color-mix(in srgb, var(--color-bg) 70%, transparent) 60%,
    var(--color-bg) 100%
  );
}

/* --- Cuerpo --- */
.detail__body {
  position: relative;
  margin-top: -160px;
}

.detail__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-pill);
  font-weight: 600;
  color: var(--color-text);
  background-color: color-mix(in srgb, var(--color-surface) 85%, transparent);
  backdrop-filter: blur(6px);
  border: 1px solid var(--color-border);
}

.detail__back:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
}

.detail__main {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--space-6);
  align-items: start;
}

.detail__poster {
  width: 100%;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  background-color: var(--color-surface-2);
  aspect-ratio: 2 / 3;
  object-fit: cover;
}

.detail__poster--empty {
  display: grid;
  place-items: center;
  font-size: var(--text-4xl);
}

.detail__info {
  padding-top: var(--space-5);
}

.detail__title {
  font-size: var(--text-3xl);
}

.detail__tagline {
  color: var(--color-text-muted);
  font-style: italic;
  margin-top: var(--space-1);
}

.detail__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-4);
  color: var(--color-text-muted);
  font-weight: 500;
}

.detail__rating {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 700;
  color: var(--color-text);
}

.detail__star {
  width: 18px;
  height: 18px;
  color: var(--color-gold);
}

.detail__votes {
  font-weight: 400;
  font-size: var(--text-sm);
  color: var(--color-text-faint);
}

.detail__genres {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.detail__genre {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-brand);
  background-color: var(--color-brand-soft);
  border-radius: var(--radius-pill);
}

[data-theme='dark'] .detail__genre {
  color: var(--color-brand-strong);
}

.detail__overview {
  margin-top: var(--space-5);
  max-width: 70ch;
}

.detail__director {
  margin-top: var(--space-4);
  color: var(--color-text-muted);
}

.detail__label {
  font-weight: 600;
  color: var(--color-text);
}

.detail__actions {
  margin-top: var(--space-5);
}

.detail__trailer {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-pill);
  font-weight: 600;
  color: var(--color-brand-contrast);
  background-color: var(--color-brand);
  transition: background-color var(--transition-fast);
}

.detail__trailer:hover {
  background-color: var(--color-brand-strong);
}

/* --- Reparto --- */
.detail__cast {
  margin-top: var(--space-7);
}

.detail__section-title {
  font-size: var(--text-xl);
  margin-bottom: var(--space-4);
}

/* --- Responsive --- */
@media (max-width: 760px) {
  .detail__main {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }
  .detail__poster {
    max-width: 200px;
  }
  .detail__info {
    padding-top: 0;
  }
  .detail__meta,
  .detail__genres {
    justify-content: center;
  }
}
</style>
