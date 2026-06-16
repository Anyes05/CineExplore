import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const PREFIJO = 'cineexplore:favoritos:'

/** Lo mínimo para renderizar una card sin volver a TMDB. */
function snapshotPelicula(p) {
  return {
    id: p.id,
    title: p.title,
    poster_path: p.poster_path,
    vote_average: p.vote_average,
    // En el detalle viene como `genres: [{id, name}]`; en el listado como `genre_ids: [..]`.
    genre_ids: p.genre_ids ?? p.genres?.map((g) => g.id) ?? [],
    release_date: p.release_date,
    overview: p.overview,
  }
}

/**
 * Store de favoritos. Persistido en localStorage namespaced por usuario
 * (`cineexplore:favoritos:<email>`) para que cada cuenta tenga los suyos.
 * Cuando no hay sesión la lista queda vacía y no se persiste.
 */
export const useFavoritosStore = defineStore('favoritos', () => {
  const auth = useAuthStore()
  const peliculas = ref([])

  function claveStorage() {
    const email = auth.usuarioActual?.email
    return email ? `${PREFIJO}${email}` : null
  }

  function cargar() {
    const clave = claveStorage()
    if (!clave) {
      peliculas.value = []
      return
    }
    try {
      const crudo = localStorage.getItem(clave)
      peliculas.value = crudo ? JSON.parse(crudo) : []
    } catch {
      peliculas.value = []
    }
  }

  function guardar() {
    const clave = claveStorage()
    if (!clave) return
    localStorage.setItem(clave, JSON.stringify(peliculas.value))
  }

  // Cada vez que cambia el usuario logueado releemos los favoritos suyos.
  watch(
    () => auth.usuarioActual?.email,
    cargar,
    { immediate: true }
  )

  const idsFavoritos = computed(() => peliculas.value.map((p) => p.id))
  const cantidad = computed(() => peliculas.value.length)
  const promedioRating = computed(() => {
    const conRating = peliculas.value.filter((p) => p.vote_average)
    if (!conRating.length) return 0
    const suma = conRating.reduce((acc, p) => acc + (p.vote_average ?? 0), 0)
    return suma / conRating.length
  })

  function esFavorito(id) {
    return idsFavoritos.value.includes(id)
  }

  /** Agrega o quita una película de favoritos. Requiere sesión. */
  function alternar(pelicula) {
    if (!auth.estaAutenticado) return
    if (esFavorito(pelicula.id)) {
      peliculas.value = peliculas.value.filter((p) => p.id !== pelicula.id)
    } else {
      peliculas.value = [...peliculas.value, snapshotPelicula(pelicula)]
    }
    guardar()
  }

  return {
    peliculas,
    idsFavoritos,
    cantidad,
    promedioRating,
    esFavorito,
    alternar,
  }
})
