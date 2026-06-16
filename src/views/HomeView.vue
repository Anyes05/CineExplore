<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ORDENES, usePeliculasStore } from '@/stores/peliculas'
import { useFavoritosStore } from '@/stores/favoritos'
import { useUiStore } from '@/stores/ui'
import { useGuardiaSesion } from '@/composables/useGuardiaSesion'
import MovieGrid from '@/components/movie/MovieGrid.vue'
import GenreFilter from '@/components/movie/GenreFilter.vue'
import SortSelect from '@/components/movie/SortSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const peliculasStore = usePeliculasStore()
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

const favoritos = useFavoritosStore()
const ui = useUiStore()
const { idsFavoritos } = storeToRefs(favoritos)
const { requerirSesion } = useGuardiaSesion()

function alternarFavorito(pelicula) {
  if (!requerirSesion()) return
  favoritos.alternar(pelicula)
}

function abrirModalLista(pelicula) {
  if (!requerirSesion()) return
  ui.abrirModalLista(pelicula)
}

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
        <p v-if="!cargando && !error" class="catalog__count">
          {{ peliculas.length }} película{{ peliculas.length === 1 ? '' : 's' }}
        </p>
        <span v-if="desdeCache" class="catalog__cache-badge" title="Sin conexión: estás viendo los últimos datos guardados.">
          Datos en caché
        </span>
      </header>

      <MovieGrid
        :peliculas="peliculas"
        :mapa-generos="mapaGeneros"
        :genero-preferido="generoId"
        :cargando="cargando"
        :error="error"
        :ids-favoritos="idsFavoritos"
        titulo-vacio="Sin resultados"
        descripcion-vacio="Probá con otro término de búsqueda o cambiá los filtros."
        @reintentar="peliculasStore.cargar()"
        @alternar-favorito="alternarFavorito"
        @agregar-a-lista="abrirModalLista"
      />

      <!-- Paginación -->
      <div v-if="hayMas && !error && peliculas.length" class="catalog__more">
        <BaseButton variante="soft" tamano="lg" :disabled="cargandoMas" @click="peliculasStore.cargarMas()">
          {{ cargandoMas ? 'Cargando…' : 'Ver más películas' }}
        </BaseButton>
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

.catalog__count {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.catalog__cache-badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  background-color: color-mix(in srgb, var(--color-gold) 18%, transparent);
  color: var(--color-text);
  font-size: var(--text-xs);
  font-weight: 600;
}

.catalog__more {
  display: flex;
  justify-content: center;
  margin-top: var(--space-7);
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
