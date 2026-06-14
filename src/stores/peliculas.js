import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { buscarPeliculas, descubrirPeliculas, obtenerGeneros } from '@/services/tmdb'
import { useAlmacenamiento } from '@/composables/useAlmacenamiento'

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
  // --- Estado del catálogo ---
  const peliculas = ref([])
  const generos = ref([])
  const pagina = ref(1)
  const totalPaginas = ref(1)
  const cargando = ref(false) // carga inicial o cambio de filtros
  const cargandoMas = ref(false) // paginación ("ver más")
  const error = ref(null)

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
    })
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
      const resultados = datos.results ?? []
      peliculas.value = anexar ? [...peliculas.value, ...resultados] : resultados
      pagina.value = datos.page ?? 1
      totalPaginas.value = datos.total_pages ?? 1
    } catch (err) {
      error.value = err.message
      if (!anexar) peliculas.value = []
    } finally {
      bandera.value = false
    }
  }

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
