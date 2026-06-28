<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ORDENES, usePeliculasStore } from '@/stores/peliculas'
import { useFavoritosStore } from '@/stores/favoritos'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useAccionesPelicula } from '@/composables/useAccionesPelicula'
import MovieGrid from '@/components/movie/MovieGrid.vue'
import GenreFilter from '@/components/movie/GenreFilter.vue'
import SortSelect from '@/components/movie/SortSelect.vue'

const peliculasStore = usePeliculasStore()
const favoritosStore = useFavoritosStore()
const { alternarFavorito, agregarALista } = useAccionesPelicula()

const {
  peliculas,
  generos,
  generoId,
  orden,
  consulta,
  mapaGeneros,
  cargando,
  cargandoMas,
  error,
  hayMas,
  buscando,
  desdeCache,
} = storeToRefs(peliculasStore)

const { idsFavoritos } = storeToRefs(favoritosStore)

const sentinel = ref(null)

const puedeCargarMas = computed(
  () => hayMas.value && !cargando.value && !cargandoMas.value && !error.value && peliculas.value.length > 0
)

useInfiniteScroll(() => peliculasStore.cargarMas(), {
  sentinel,
  puedeCargar: puedeCargarMas,
})

// Título de la sección según el modo (búsqueda / género / catálogo).
const titulo = computed(() => {
  if (buscando.value) return `Resultados para «${consulta.value.trim()}»`
  if (generoId.value) return mapaGeneros.value[generoId.value] || 'Catálogo'
  return 'Populares ahora'
})

function cargarInicial() {
  peliculasStore.cargarGeneros()
  peliculasStore.cargar()
}

onMounted(cargarInicial)
</script>

<template>
  <div class="home">
    <section class="hero">
      <div class="hero__inner u-container">
        <p class="hero__eyebrow">Tu universo cinematográfico</p>
        <h1 class="hero__title">Descubrí, puntuá y organizá tus películas</h1>
        <p class="hero__subtitle">
          Explorá un catálogo en constante crecimiento, armá tus propias listas
          y dejá tus reseñas. Todo en un solo lugar.
        </p>
      </div>
    </section>

    <section class="catalog u-container">
      <!-- Controles: en búsqueda mostramos resultado + limpiar; si no, filtros -->
      <div class="catalog__controls">
        <GenreFilter
          v-if="!buscando"
          :generos="generos"
          :genero-activo="generoId"
          @seleccionar="peliculasStore.establecerGenero"
        />
        <p v-else class="catalog__searching">
          Buscando «{{ consulta.trim() }}»
          <button class="catalog__clear" type="button" @click="peliculasStore.limpiarBusqueda()">
            Limpiar
          </button>
        </p>

        <SortSelect
          v-if="!buscando"
          :ordenes="ORDENES"
          :model-value="orden"
          @update:model-value="peliculasStore.establecerOrden"
        />
      </div>

      <header class="catalog__header">
        <h2 class="catalog__title">{{ titulo }}</h2>
        <p v-if="desdeCache && !cargando" class="catalog__cache-hint">Datos guardados sin conexión</p>
        <p v-else-if="!cargando && !error" class="catalog__count">
          {{ peliculas.length }} película{{ peliculas.length === 1 ? '' : 's' }}
        </p>
      </header>

      <MovieGrid
        :peliculas="peliculas"
        :mapa-generos="mapaGeneros"
        :genero-preferido="generoId"
        :ids-favoritos="idsFavoritos"
        :cargando="cargando"
        :error="error"
        empty-title="Sin resultados"
        empty-description="Probá con otro término de búsqueda o cambiá los filtros."
        @alternar-favorito="alternarFavorito"
        @agregar-a-lista="agregarALista"
        @reintentar="peliculasStore.cargar()"
      />

      <!-- Infinite scroll: centinela + indicador de carga -->
      <div
        v-if="hayMas || cargandoMas"
        ref="sentinel"
        class="catalog__sentinel"
        aria-hidden="true"
      />
      <div v-if="cargandoMas" class="catalog__loading-more" aria-live="polite">
        <div class="catalog__spinner" aria-hidden="true"></div>
        <span>Cargando más películas…</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  background: var(--gradient-hero);
  color: #fff;
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  overflow: hidden;
}

.hero__inner {
  padding-block: var(--space-8);
}

.hero__eyebrow {
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: var(--text-sm);
  opacity: 0.9;
}

.hero__title {
  font-size: var(--text-4xl);
  max-width: 16ch;
  margin-block: var(--space-3);
}

.hero__subtitle {
  max-width: 52ch;
  font-size: var(--text-lg);
  opacity: 0.92;
}

.catalog {
  margin-top: var(--space-7);
}

.catalog__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.catalog__controls > :first-child {
  flex: 1;
  min-width: 0;
}

.catalog__searching {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.catalog__clear {
  margin-left: var(--space-2);
  color: var(--color-brand);
  font-weight: 600;
}

.catalog__clear:hover {
  text-decoration: underline;
}

.catalog__header {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.catalog__title {
  font-size: var(--text-2xl);
}

.catalog__count,
.catalog__cache-hint {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.catalog__cache-hint {
  color: var(--color-warning, var(--color-text-muted));
  font-style: italic;
}

.catalog__sentinel {
  height: 1px;
  margin-top: var(--space-4);
}

.catalog__loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-5);
  padding-block: var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: 500;
}

.catalog__spinner {
  width: 22px;
  height: 22px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-brand);
  border-radius: var(--radius-pill);
  animation: catalog-spin 0.8s linear infinite;
}

@keyframes catalog-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .catalog__spinner {
    animation: none;
    border-top-color: var(--color-border);
  }
}

@media (max-width: 640px) {
  .hero__title {
    font-size: var(--text-3xl);
  }
  .catalog__controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
