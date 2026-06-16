import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const PREFIJO = 'cineexplore:listas:'

/** Snapshot mínimo de la película para renderizar sin volver a TMDB. */
function snapshotPelicula(p) {
  return {
    id: p.id,
    title: p.title,
    poster_path: p.poster_path,
    vote_average: p.vote_average,
    genre_ids: p.genre_ids ?? p.genres?.map((g) => g.id) ?? [],
    release_date: p.release_date,
    overview: p.overview,
  }
}

/** ID corto razonablemente único; no necesitamos UUIDs en una app local. */
function nuevoId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Store de listas personalizadas. Cada usuario tiene sus listas en
 * localStorage bajo `cineexplore:listas:<email>`. Una lista guarda el
 * snapshot de cada película para sobrevivir offline.
 */
export const useListasStore = defineStore('listas', () => {
  const auth = useAuthStore()
  const listas = ref([])

  function claveStorage() {
    const email = auth.usuarioActual?.email
    return email ? `${PREFIJO}${email}` : null
  }

  function cargar() {
    const clave = claveStorage()
    if (!clave) {
      listas.value = []
      return
    }
    try {
      const crudo = localStorage.getItem(clave)
      listas.value = crudo ? JSON.parse(crudo) : []
    } catch {
      listas.value = []
    }
  }

  function guardar() {
    const clave = claveStorage()
    if (!clave) return
    localStorage.setItem(clave, JSON.stringify(listas.value))
  }

  watch(() => auth.usuarioActual?.email, cargar, { immediate: true })

  const cantidad = computed(() => listas.value.length)

  function obtenerLista(id) {
    return listas.value.find((l) => l.id === id) ?? null
  }

  /** IDs de listas que ya contienen una película (útil para el modal). */
  function listasConPelicula(peliculaId) {
    return listas.value
      .filter((l) => l.peliculas.some((p) => p.id === peliculaId))
      .map((l) => l.id)
  }

  function crear({ nombre, descripcion = '' }) {
    if (!auth.estaAutenticado) return null
    const limpio = nombre.trim()
    if (!limpio) return null
    const lista = {
      id: nuevoId(),
      nombre: limpio,
      descripcion: descripcion.trim(),
      peliculas: [],
      fechaCreacion: new Date().toISOString(),
    }
    listas.value = [...listas.value, lista]
    guardar()
    return lista
  }

  function renombrar(id, { nombre, descripcion }) {
    const lista = obtenerLista(id)
    if (!lista) return
    if (nombre !== undefined) lista.nombre = nombre.trim()
    if (descripcion !== undefined) lista.descripcion = descripcion.trim()
    // Forzamos el watch reasignando la ref.
    listas.value = [...listas.value]
    guardar()
  }

  function eliminar(id) {
    listas.value = listas.value.filter((l) => l.id !== id)
    guardar()
  }

  function agregarPelicula(listaId, pelicula) {
    const lista = obtenerLista(listaId)
    if (!lista) return
    if (lista.peliculas.some((p) => p.id === pelicula.id)) return
    lista.peliculas = [...lista.peliculas, snapshotPelicula(pelicula)]
    listas.value = [...listas.value]
    guardar()
  }

  function quitarPelicula(listaId, peliculaId) {
    const lista = obtenerLista(listaId)
    if (!lista) return
    lista.peliculas = lista.peliculas.filter((p) => p.id !== peliculaId)
    listas.value = [...listas.value]
    guardar()
  }

  /** Conmuta la presencia de una película en una lista (para checkboxes del modal). */
  function alternarPelicula(listaId, pelicula) {
    const lista = obtenerLista(listaId)
    if (!lista) return
    if (lista.peliculas.some((p) => p.id === pelicula.id)) {
      quitarPelicula(listaId, pelicula.id)
    } else {
      agregarPelicula(listaId, pelicula)
    }
  }

  return {
    listas,
    cantidad,
    obtenerLista,
    listasConPelicula,
    crear,
    renombrar,
    eliminar,
    agregarPelicula,
    quitarPelicula,
    alternarPelicula,
  }
})
