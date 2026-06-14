<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePeliculasStore } from '@/stores/peliculas'
import MovieGrid from '@/components/movie/MovieGrid.vue'

const peliculasStore = usePeliculasStore()
const { peliculas, mapaGeneros, cargando, error } = storeToRefs(peliculasStore)

function cargar() {
  peliculasStore.cargarGeneros()
  peliculasStore.cargarPopulares()
}

onMounted(cargar)
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
      <header class="catalog__header">
        <div>
          <h2 class="catalog__title">Populares ahora</h2>
          <p v-if="!cargando && !error" class="catalog__count">
            {{ peliculas.length }} películas disponibles para explorar
          </p>
        </div>
      </header>

      <MovieGrid
        :peliculas="peliculas"
        :mapa-generos="mapaGeneros"
        :cargando="cargando"
        :error="error"
        @reintentar="cargar"
      />
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

.catalog__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: var(--space-5);
}

.catalog__title {
  font-size: var(--text-2xl);
}

.catalog__count {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

@media (max-width: 640px) {
  .hero__title {
    font-size: var(--text-3xl);
  }
}
</style>
