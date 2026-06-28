<script setup>
/**
 * Vista "Mis Favoritos": resumen con estadísticas + grilla reutilizable.
 * Cuando no hay sesión iniciada, invita a iniciarla. Si no hay favoritos
 * todavía, muestra estado vacío con CTA al catálogo.
 */
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useFavoritosStore } from '@/stores/favoritos'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { usePeliculasStore } from '@/stores/peliculas'
import { useAccionesPelicula } from '@/composables/useAccionesPelicula'
import { useFiltroContenido } from '@/composables/useFiltroContenido'
import MovieGrid from '@/components/movie/MovieGrid.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import StateMessage from '@/components/ui/StateMessage.vue'

const favoritos = useFavoritosStore()
const auth = useAuthStore()
const ui = useUiStore()
const peliculasStore = usePeliculasStore()
const { filtrar } = useFiltroContenido()
const { alternarFavorito, agregarALista } = useAccionesPelicula()

const { peliculas, idsFavoritos, cantidad, promedioRating } = storeToRefs(favoritos)
const { mapaGeneros } = storeToRefs(peliculasStore)
const { estaAutenticado, usuarioActual } = storeToRefs(auth)

// Si abrieron la vista sin haber cargado nunca el catálogo, traemos los
// géneros para que las cards muestren el nombre del género correctamente.
if (!Object.keys(mapaGeneros.value).length) {
  peliculasStore.cargarGeneros()
}

const promedioFormateado = computed(() =>
  promedioRating.value ? promedioRating.value.toFixed(1) : '—'
)

const peliculasVisibles = computed(() => filtrar(peliculas.value))
</script>

<template>
  <section class="favorites u-container">
    <header class="favorites__header">
      <div>
        <p class="favorites__eyebrow">Tu colección</p>
        <h1 class="favorites__title">Mis Favoritos</h1>
        <p v-if="estaAutenticado" class="favorites__subtitle">
          Hola, {{ usuarioActual.nombre }} 👋
        </p>
      </div>

      <!-- Stats: cantidad + promedio de rating -->
      <ul v-if="estaAutenticado && cantidad" class="favorites__stats">
        <li class="favorites__stat">
          <span class="favorites__stat-value">{{ cantidad }}</span>
          <span class="favorites__stat-label">guardadas</span>
        </li>
        <li class="favorites__stat">
          <span class="favorites__stat-value">
            <svg class="favorites__star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
            </svg>
            {{ promedioFormateado }}
          </span>
          <span class="favorites__stat-label">promedio TMDB</span>
        </li>
      </ul>
    </header>

    <!-- Sin sesión -->
    <StateMessage
      v-if="!estaAutenticado"
      icon="🔒"
      titulo="Iniciá sesión para ver tus favoritos"
      descripcion="Tus películas guardadas se asocian a tu cuenta para que las tengas en cualquier momento."
    >
      <BaseButton variante="primary" @click="ui.abrirAuth('login')">
        Iniciar sesión
      </BaseButton>
    </StateMessage>

    <!-- Sin favoritos -->
    <StateMessage
      v-else-if="!cantidad"
      icon="❤️"
      titulo="Aún no tenés favoritos"
      descripcion="Marcá el corazón en cualquier película para tenerla acá."
    >
      <BaseButton variante="primary" to="/">Explorar catálogo</BaseButton>
    </StateMessage>

    <!-- Favoritos ocultos por modo seguro -->
    <StateMessage
      v-else-if="!peliculasVisibles.length"
      icon="🛡️"
      titulo="No hay favoritos visibles"
      descripcion="Tus favoritos guardados no están disponibles con el modo seguro activado."
    >
      <BaseButton variante="primary" to="/">Explorar catálogo</BaseButton>
    </StateMessage>

    <!-- Grilla -->
    <MovieGrid
      v-else
      :peliculas="peliculasVisibles"
      :mapa-generos="mapaGeneros"
      :ids-favoritos="idsFavoritos"
      @alternar-favorito="alternarFavorito"
      @agregar-a-lista="agregarALista"
    />
  </section>
</template>

<style scoped>
.favorites {
  padding-block: var(--space-7);
}

.favorites__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-5);
  margin-bottom: var(--space-6);
}

.favorites__eyebrow {
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: var(--text-sm);
  color: var(--color-brand);
}

.favorites__title {
  font-size: var(--text-3xl);
  margin-top: var(--space-1);
}

.favorites__subtitle {
  color: var(--color-text-muted);
  margin-top: var(--space-2);
}

.favorites__stats {
  display: flex;
  gap: var(--space-4);
}

.favorites__stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-5);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-width: 120px;
}

.favorites__stat-value {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-2xl);
}

.favorites__stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.favorites__star {
  width: 22px;
  height: 22px;
  color: var(--color-gold);
}

@media (max-width: 640px) {
  .favorites__header {
    flex-direction: column;
    align-items: stretch;
  }
  .favorites__stats {
    width: 100%;
  }
  .favorites__stat {
    flex: 1;
  }
}
</style>
