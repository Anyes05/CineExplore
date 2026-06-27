import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { buscarPeliculas, descubrirPeliculas, obtenerGeneros } from '@/services/tmdb'
import { guardarCacheHome, leerCacheHome } from '@/services/cache'
import { useAlmacenamiento } from '@/composables/useAlmacenamiento'
import { usePreferenciasStore } from '@/stores/preferencias'
import { useHistorialBusquedaStore } from '@/stores/historialBusqueda'

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
  const cargandoMas = ref(false) // paginación ("ver más")
  const error = ref(null)
  // True cuando lo visible viene del cache local (sin red).
  const desdeCache = ref(false)

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

  /** Elige el endpoint según haya o no una búsqueda de texto activa. */
  function traerPagina(paginaPedida) {
    if (buscando.value) {
      return buscarPeliculas(consulta.value.trim(), paginaPedida)
    }
    return descubrirPeliculas({
      generoId: generoId.value,
      orden: orden.value,
      pagina: paginaPedida,
      modoSeguro: preferencias.modoSeguro,
    })
  }

  /**
   * El endpoint /search/movie no acepta `without_keywords`, así que cuando el
   * modo seguro está activo descartamos client-side los resultados marcados
   * como `adult` y los que vengan con muy pocos votos (suelen ser entradas
   * sin moderar).
   */
  function filtrarSiHaceFalta(resultados) {
    if (!buscando.value || !preferencias.modoSeguro) return resultados
    return resultados.filter((p) => !p.adult && (p.vote_count ?? 0) >= 5)
  }

  /** Snapshot del estado actual de la Home para guardarlo en cache. */
  function snapshotHome() {
    return {
      peliculas: peliculas.value,
      pagina: pagina.value,
      totalPaginas: totalPaginas.value,
      filtros: {
        consulta: consulta.value,
        generoId: generoId.value,
        orden: orden.value,
        modoSeguro: preferencias.modoSeguro,
      },
    }
  }

  /**
   * Si estamos offline y existe un cache que coincide con los filtros
   * actuales, lo restauramos. Devuelve true si pudo restaurar.
   */
  function intentarRestaurarDesdeCache() {
    const cache = leerCacheHome()
    if (!cache) return false
    const mismosFiltros =
      cache.filtros?.consulta === consulta.value &&
      cache.filtros?.generoId === generoId.value &&
      cache.filtros?.orden === orden.value
    if (!mismosFiltros) return false
    peliculas.value = cache.peliculas ?? []
    pagina.value = cache.pagina ?? 1
    totalPaginas.value = cache.totalPaginas ?? 1
    desdeCache.value = true
    return true
  }

  /**
   * Carga el catálogo según los filtros actuales.
   * @param {boolean} anexar  Si es true, agrega la siguiente página al final.
   */
  async function cargar({ anexar = false } = {}) {
    const bandera = anexar ? cargandoMas : cargando
    bandera.value = true
    error.value = null
    try {
      const paginaPedida = anexar ? pagina.value + 1 : 1
      const datos = await traerPagina(paginaPedida)
      const resultados = filtrarSiHaceFalta(datos.results ?? [])
      peliculas.value = anexar ? [...peliculas.value, ...resultados] : resultados
      pagina.value = datos.page ?? 1
      totalPaginas.value = datos.total_pages ?? 1
      desdeCache.value = false
      // Sólo cacheamos la "vista principal" (sin paginación adicional) para
      // mantener la entrada chica y predecible.
      if (!anexar) guardarCacheHome(snapshotHome())
    } catch (err) {
      const sinConexion = err.message === 'SIN_CONEXION'
      // En modo offline, intentamos servir desde cache antes de marcar error.
      if (sinConexion && !anexar && intentarRestaurarDesdeCache()) {
        error.value = null
      } else {
        error.value = sinConexion
          ? 'Sin conexión. No hay datos guardados para mostrar.'
          : err.message
        if (!anexar) peliculas.value = []
      }
    } finally {
      bandera.value = false
    }
  }

  // Si el usuario activa/desactiva el modo seguro, refrescamos el catálogo
  // para que el filtro tenga efecto inmediato.
  watch(
    () => preferencias.modoSeguro,
    () => cargar()
  )

  // --- Acciones públicas ---

  /** Trae la siguiente página y la agrega al listado. */
  function cargarMas() {
    if (hayMas.value && !cargando.value && !cargandoMas.value) {
      cargar({ anexar: true })
    }
  }

  /** Aplica una búsqueda de texto (vacío = vuelve a navegación por filtros). */
  function establecerConsulta(texto) {
    consulta.value = texto
    cargar()
  }

  function limpiarBusqueda() {
    consulta.value = ''
    cargar()
  }

  /** Cambia el género activo (null = Todos). */
  function establecerGenero(id) {
    generoId.value = id
    cargar()
  }

  /** Cambia el criterio de orden. */
  function establecerOrden(valor) {
    orden.value = valor
    cargar()
  }

  /** Carga la lista oficial de géneros una sola vez. */
  async function cargarGeneros() {
    if (generos.value.length) return
    try {
      const datos = await obtenerGeneros()
      generos.value = datos.genres ?? []
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
