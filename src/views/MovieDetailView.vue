<script setup>
/**
 * Detalle de una película. Usa estado LOCAL (useTareaAsync) porque la
 * info de una peli puntual no necesita centralizarse en un store.
 */
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { obtenerDetallePelicula, urlImagen } from '@/services/tmdb'
import { guardarCacheDetalle, leerCacheDetalle } from '@/services/cache'
import { useTareaAsync } from '@/composables/useTareaAsync'
import { useGuardiaSesion } from '@/composables/useGuardiaSesion'
import { useFavoritosStore } from '@/stores/favoritos'
import { useValoracionesStore } from '@/stores/valoraciones'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import CastList from '@/components/movie/CastList.vue'
import RatingStars from '@/components/movie/RatingStars.vue'
import StateMessage from '@/components/ui/StateMessage.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  id: { type: [String, Number], required: true },
})

const router = useRouter()
const desdeCache = ref(false)

/**
 * Trae el detalle de TMDB y lo persiste en cache. Si la red falla,
 * recupera la última versión guardada para mantener la app utilizable.
 */
async function obtenerConCache(id) {
  try {
    const datos = await obtenerDetallePelicula(id)
    guardarCacheDetalle(id, datos)
    desdeCache.value = false
    return datos
  } catch (err) {
    if (err.message === 'SIN_CONEXION') {
      const cache = leerCacheDetalle(id)
      if (cache) {
        desdeCache.value = true
        return cache
      }
      throw new Error('Sin conexión. No hay datos guardados de esta película.')
    }
    throw err
  }
}

const { datos: pelicula, error, cargando, ejecutar } = useTareaAsync(obtenerConCache)

const favoritos = useFavoritosStore()
const { requerirSesion } = useGuardiaSesion()
const esFavorito = computed(() => !!pelicula.value && favoritos.esFavorito(pelicula.value.id))

function alternarFavorito() {
  if (!pelicula.value || !requerirSesion()) return
  favoritos.alternar(pelicula.value)
}

// --- Valoración propia (puntaje + reseña) ---
const auth = useAuthStore()
const ui = useUiStore()
const { estaAutenticado } = storeToRefs(auth)
const valoraciones = useValoracionesStore()

const puntajeLocal = ref(0)
const resenaLocal = ref('')

const valoracionGuardada = computed(() =>
  pelicula.value ? valoraciones.obtener(pelicula.value.id) : null
)

// Cada vez que cambia la película o el usuario, resincronizamos el form.
watch(
  [() => pelicula.value?.id, () => auth.usuarioActual?.email],
  () => {
    const v = valoracionGuardada.value
    puntajeLocal.value = v?.puntaje ?? 0
    resenaLocal.value = v?.resena ?? ''
  },
  { immediate: true }
)

const hayCambios = computed(() => {
  const v = valoracionGuardada.value
  const puntajeGuardado = v?.puntaje ?? 0
  const resenaGuardada = v?.resena ?? ''
  return (
    puntajeLocal.value !== puntajeGuardado ||
    resenaLocal.value.trim() !== resenaGuardada.trim()
  )
})

function guardarValoracion() {
  if (!pelicula.value || !requerirSesion()) return
  if (puntajeLocal.value < 1) return
  valoraciones.establecer(pelicula.value.id, {
    puntaje: puntajeLocal.value,
    resena: resenaLocal.value,
  })
}

function borrarValoracion() {
  if (!pelicula.value) return
  valoraciones.borrar(pelicula.value.id)
  puntajeLocal.value = 0
  resenaLocal.value = ''
}

function fechaLegible(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function abrirModalLista() {
  if (!pelicula.value || !requerirSesion()) return
  ui.abrirModalLista(pelicula.value)
}

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
    <!-- Carga: skeleton estructural que respeta la silueta final -->
    <div v-if="cargando" class="detail__skeleton" aria-busy="true">
      <div class="detail__backdrop detail__backdrop--empty u-skeleton"></div>
      <div class="detail__body u-container">
        <div class="detail__main">
          <div class="detail__poster detail__poster--empty u-skeleton"></div>
          <div class="detail__info">
            <div class="detail__skel-line detail__skel-line--title u-skeleton"></div>
            <div class="detail__skel-line detail__skel-line--tagline u-skeleton"></div>
            <div class="detail__skel-row">
              <div class="detail__skel-pill u-skeleton"></div>
              <div class="detail__skel-pill u-skeleton"></div>
              <div class="detail__skel-pill u-skeleton"></div>
            </div>
            <div class="detail__skel-line u-skeleton"></div>
            <div class="detail__skel-line u-skeleton"></div>
            <div class="detail__skel-line detail__skel-line--short u-skeleton"></div>
          </div>
        </div>
        <section class="detail__cast">
          <div class="detail__skel-line detail__skel-line--heading u-skeleton"></div>
          <CastList :cargando="true" />
        </section>
      </div>
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
      <p v-if="desdeCache" class="detail__cache-banner" role="status">
        Estás viendo datos guardados sin conexión.
      </p>
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

            <div class="detail__actions">
              <a
                v-if="urlTrailer"
                class="detail__trailer"
                :href="urlTrailer"
                target="_blank"
                rel="noopener"
              >
                ▶ Ver tráiler
              </a>
              <button
                class="detail__fav"
                :class="{ 'detail__fav--active': esFavorito }"
                type="button"
                :aria-pressed="esFavorito"
                @click="alternarFavorito"
              >
                <svg viewBox="0 0 24 24" :fill="esFavorito ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M12 21s-7.5-4.6-9.5-9.2C1.1 8.2 3 5 6.2 5c2 0 3.2 1.2 3.8 2.3C10.6 6.2 11.8 5 13.8 5 17 5 18.9 8.2 17.5 11.8 15.5 16.4 12 21 12 21z" />
                </svg>
                {{ esFavorito ? 'En favoritos' : 'Agregar a favoritos' }}
              </button>

              <button class="detail__list" type="button" @click="abrirModalLista">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M3 6h13M3 12h13M3 18h9" stroke-linecap="round" />
                  <path d="M18 14v8M14 18h8" stroke-linecap="round" />
                </svg>
                Agregar a lista
              </button>
            </div>
          </div>
        </div>

        <!-- Tu valoración (puntaje propio + reseña) -->
        <section class="detail__rating-section">
          <h2 class="detail__section-title">Tu valoración</h2>

          <div v-if="!estaAutenticado" class="rating-form rating-form--guest">
            <p>Iniciá sesión para puntuar esta película y dejar tu reseña.</p>
            <BaseButton variante="primary" @click="ui.abrirAuth('login')">
              Iniciar sesión
            </BaseButton>
          </div>

          <form v-else class="rating-form" @submit.prevent="guardarValoracion">
            <div class="rating-form__stars">
              <RatingStars v-model="puntajeLocal" editable tamano="lg" />
              <span v-if="puntajeLocal" class="rating-form__score">
                {{ puntajeLocal }} / 5
              </span>
              <span v-else class="rating-form__hint">Click en una estrella</span>
            </div>

            <textarea
              v-model="resenaLocal"
              class="rating-form__textarea"
              placeholder="¿Qué te pareció? Compartí tu reseña (opcional)…"
              rows="4"
              maxlength="800"
            ></textarea>

            <p v-if="valoracionGuardada" class="rating-form__meta">
              Guardada el {{ fechaLegible(valoracionGuardada.fecha) }}
            </p>

            <div class="rating-form__actions">
              <BaseButton
                type="submit"
                variante="primary"
                :disabled="!hayCambios || puntajeLocal < 1"
              >
                {{ valoracionGuardada ? 'Actualizar' : 'Guardar' }}
              </BaseButton>
              <BaseButton
                v-if="valoracionGuardada"
                variante="ghost"
                type="button"
                @click="borrarValoracion"
              >
                Borrar valoración
              </BaseButton>
            </div>
          </form>
        </section>

        <section v-if="reparto.length" class="detail__cast">
          <h2 class="detail__section-title">Reparto principal</h2>
          <CastList :personas="reparto" />
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* --- Skeleton de carga --- */
.detail__skel-line {
  height: 14px;
  width: 100%;
  margin-top: var(--space-3);
}

.detail__skel-line--title {
  height: 32px;
  width: 70%;
  margin-top: 0;
}

.detail__skel-line--tagline {
  height: 14px;
  width: 50%;
}

.detail__skel-line--short {
  width: 40%;
}

.detail__skel-line--heading {
  height: 22px;
  width: 30%;
  margin-bottom: var(--space-4);
}

.detail__skel-row {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-5);
}

.detail__skel-pill {
  height: 22px;
  width: 80px;
  border-radius: var(--radius-pill);
}

.detail__cache-banner {
  text-align: center;
  padding: var(--space-2) var(--space-4);
  background-color: color-mix(in srgb, var(--color-gold) 16%, transparent);
  color: var(--color-text);
  font-size: var(--text-sm);
  font-weight: 600;
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
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
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

.detail__fav {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-pill);
  font-weight: 600;
  color: var(--color-text);
  background-color: var(--color-surface-2);
  border: 1px solid var(--color-border);
  transition: color var(--transition-fast), background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.detail__fav svg {
  width: 18px;
  height: 18px;
}

.detail__fav:hover {
  color: var(--color-danger);
  border-color: color-mix(in srgb, var(--color-danger) 40%, var(--color-border));
}

.detail__fav--active {
  color: var(--color-danger);
  border-color: var(--color-danger);
  background-color: color-mix(in srgb, var(--color-danger) 12%, transparent);
}

.detail__list {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-pill);
  font-weight: 600;
  color: var(--color-text);
  background-color: var(--color-surface-2);
  border: 1px solid var(--color-border);
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.detail__list svg {
  width: 18px;
  height: 18px;
}

.detail__list:hover {
  color: var(--color-brand);
  border-color: var(--color-brand);
}

/* --- Tu valoración --- */
.detail__rating-section {
  margin-top: var(--space-7);
}

.rating-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.rating-form--guest {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-4);
  color: var(--color-text-muted);
}

.rating-form__stars {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.rating-form__score {
  font-weight: 700;
  font-size: var(--text-lg);
  color: var(--color-text);
}

.rating-form__hint {
  font-size: var(--text-sm);
  color: var(--color-text-faint);
}

.rating-form__textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-inset);
  font-family: inherit;
  font-size: var(--text-sm);
  resize: vertical;
  min-height: 96px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.rating-form__textarea:focus {
  outline: none;
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 20%, transparent);
}

.rating-form__meta {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.rating-form__actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
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
