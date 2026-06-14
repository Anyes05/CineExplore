import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { obtenerGeneros, obtenerPeliculasPopulares } from '@/services/tmdb'

/**
 * Store del catálogo de películas (estado compartido).
 * Centraliza la lista visible y el listado de géneros, que distintas
 * vistas y componentes necesitan.
 */
export const usePeliculasStore = defineStore('peliculas', () => {
  // --- Estado ---
  const peliculas = ref([])
  const generos = ref([])
  const pagina = ref(1)
  const totalPaginas = ref(1)
  const cargando = ref(false)
  const error = ref(null)

  // --- Getters ---
  // Diccionario id -> nombre de género, útil para mostrar etiquetas.
  const mapaGeneros = computed(() =>
    Object.fromEntries(generos.value.map((g) => [g.id, g.name]))
  )

  const hayMas = computed(() => pagina.value < totalPaginas.value)

  // --- Acciones ---

  /** Carga la lista oficial de géneros una sola vez. */
  async function cargarGeneros() {
    if (generos.value.length) return
    try {
      const datos = await obtenerGeneros()
      generos.value = datos.genres ?? []
    } catch (err) {
      // Los géneros no son críticos: si fallan, seguimos sin etiquetas.
      console.warn('No se pudieron cargar los géneros:', err.message)
    }
  }

  /** Carga la primera página de películas populares. */
  async function cargarPopulares() {
    cargando.value = true
    error.value = null
    try {
      const datos = await obtenerPeliculasPopulares(1)
      peliculas.value = datos.results ?? []
      pagina.value = datos.page ?? 1
      totalPaginas.value = datos.total_pages ?? 1
    } catch (err) {
      error.value = err.message
      peliculas.value = []
    } finally {
      cargando.value = false
    }
  }

  return {
    peliculas,
    generos,
    pagina,
    totalPaginas,
    cargando,
    error,
    mapaGeneros,
    hayMas,
    cargarGeneros,
    cargarPopulares,
  }
})
