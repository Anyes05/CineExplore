import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { obtenerPaginaCatalogo, obtenerGenerosConCache } from '@/services/catalogo'
import {
  filtrosCoinciden,
  guardarCacheHome,
  leerCacheHome,
  limpiarCachePaginasCatalogo,
} from '@/services/cache'
import { useAlmacenamiento } from '@/composables/useAlmacenamiento'
import { usePreferenciasStore } from '@/stores/preferencias'
import { filtrarListado } from '@/data/filtroContenido'

/** Opciones de orden disponibles (mapean a los `sort_by` de TMDB). */
export const ORDENES = [
  { valor: 'popularity.desc', etiqueta: 'Más populares' },
  { valor: 'vote_average.desc', etiqueta: 'Mejor valoración' },
  { valor: 'primary_release_date.desc', etiqueta: 'Más recientes' },
  { valor: 'revenue.desc', etiqueta: 'Más taquilleras' },
]

/**
 * Store del catálogo de películas (estado compartido).
 * Centraliza la lista visible, los géneros y los filtros activos
 * (búsqueda, género y orden), persistidos en sessionStorage.
 */
export const usePeliculasStore = defineStore('peliculas', () => {
  const preferencias = usePreferenciasStore()

  // --- Estado del catálogo ---
  const peliculas = ref([])
  const generos = ref([])
  const pagina = ref(1)
  const totalPaginas = ref(1)
  const cargando = ref(false) // carga inicial o cambio de filtros
  const cargandoMas = ref(false) // paginación (infinite scroll)
  const error = ref(null)
  const desdeCache = ref(false) // true si el listado visible viene del cache offline

  // --- Filtros (persistidos en sessionStorage) ---
  const consulta = useAlmacenamiento('cineexplore:consulta', '', { almacen: 'sesion' })
  const generoId = useAlmacenamiento('cineexplore:genero', null, { almacen: 'sesion' })
  const orden = useAlmacenamiento('cineexplore:orden', 'popularity.desc', { almacen: 'sesion' })

  // --- Getters ---
  const mapaGeneros = computed(() =>
    Object.fromEntries(generos.value.map((g) => [g.id, g.name]))
  )
  const hayMas = computed(() => pagina.value < totalPaginas.value)
  const buscando = computed(() => consulta.value.trim().length > 0)

  // --- Acciones internas ---

  function filtrosActuales() {
    return {
      consulta: consulta.value,
      generoId: generoId.value,
      orden: orden.value,
      modoSeguro: preferencias.modoSeguro,
    }
  }

  /** Restaura el último listado guardado si los filtros coinciden. */
  function restaurarDesdeCacheHome() {
    const cache = leerCacheHome()
    const filtros = filtrosActuales()
    if (!filtrosCoinciden(cache, filtros)) return false

    peliculas.value = cache.peliculas ?? []
    pagina.value = cache.pagina ?? 1
    totalPaginas.value = cache.totalPaginas ?? 1
    return peliculas.value.length > 0
  }

  /** Persiste el estado visible de Home para uso offline. */
  function persistirCacheHome() {
    guardarCacheHome({
      ...filtrosActuales(),
      peliculas: peliculas.value,
      pagina: pagina.value,
      totalPaginas: totalPaginas.value,
    })
    desdeCache.value = false
  }

  /** Descarta títulos no aptos que se cuelen en la respuesta de TMDB. */
  function aplicarFiltroSeguro(resultados) {
    return filtrarListado(resultados, preferencias.modoSeguro)
  }

  /**
   * Carga el catálogo según los filtros actuales.
   * @param {boolean} anexar  Si es true, agrega la siguiente página al final.
   */
  async function cargar({ anexar = false } = {}) {
    const bandera = anexar ? cargandoMas : cargando
    bandera.value = true
    error.value = null

    if (!anexar) {
      desdeCache.value = false
      restaurarDesdeCacheHome()
    }

    try {
      const paginaPedida = anexar ? pagina.value + 1 : 1
      const filtros = filtrosActuales()
      const datos = await obtenerPaginaCatalogo({
        ...filtros,
        consulta: consulta.value.trim(),
        pagina: paginaPedida,
        buscando: buscando.value,
      })
      const resultados = aplicarFiltroSeguro(datos.results ?? [])
      peliculas.value = anexar ? [...peliculas.value, ...resultados] : resultados
      pagina.value = datos.page ?? paginaPedida
      totalPaginas.value = datos.total_pages ?? 1
      persistirCacheHome()
    } catch (err) {
      error.value = err.message
      if (!anexar && peliculas.value.length) {
        desdeCache.value = true
      } else if (!anexar && restaurarDesdeCacheHome()) {
        desdeCache.value = true
      } else if (!anexar) {
        peliculas.value = []
      }
    } finally {
      bandera.value = false
    }
  }

  // --- Acciones públicas ---

  /** Trae la siguiente página y la agrega al listado (infinite scroll). */
  function cargarMas() {
    if (hayMas.value && !cargando.value && !cargandoMas.value) {
      cargar({ anexar: true })
    }
  }

  /** Aplica una búsqueda de texto (vacío = vuelve a navegación por filtros). */
  function establecerConsulta(texto) {
    limpiarCachePaginasCatalogo()
    consulta.value = texto
    cargar()
  }

  function limpiarBusqueda() {
    limpiarCachePaginasCatalogo()
    consulta.value = ''
    cargar()
  }

  /** Cambia el género activo (null = Todos). */
  function establecerGenero(id) {
    limpiarCachePaginasCatalogo()
    generoId.value = id
    cargar()
  }

  /** Cambia el criterio de orden. */
  function establecerOrden(valor) {
    limpiarCachePaginasCatalogo()
    orden.value = valor
    cargar()
  }

  // Recarga el catálogo cuando cambia el modo seguro (preferencia en localStorage).
  watch(
    () => preferencias.modoSeguro,
    () => {
      limpiarCachePaginasCatalogo()
      cargar()
    }
  )

  /** Carga la lista oficial de géneros una sola vez. */
  async function cargarGeneros() {
    if (generos.value.length) return
    try {
      generos.value = await obtenerGenerosConCache()
    } catch (err) {
      console.warn('No se pudieron cargar los géneros:', err.message)
    }
  }

  return {
    // estado
    peliculas,
    generos,
    pagina,
    totalPaginas,
    cargando,
    cargandoMas,
    error,
    desdeCache,
    // filtros
    consulta,
    generoId,
    orden,
    // getters
    mapaGeneros,
    hayMas,
    buscando,
    // acciones
    cargar,
    cargarMas,
    establecerConsulta,
    limpiarBusqueda,
    establecerGenero,
    establecerOrden,
    cargarGeneros,
  }
})
