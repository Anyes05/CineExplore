/* =========================================================================
   Servicio de TMDB
   Única capa que conoce los detalles de la API: URL base, autenticación,
   idioma y construcción de URLs de imágenes. El resto de la app consume
   estas funciones, no `fetch` directamente.

   Nota: las claves de los parámetros (with_genres, sort_by, page…) y los
   campos de las respuestas (poster_path, vote_average…) los define TMDB,
   por eso quedan en inglés.
   ========================================================================= */

const BASE_API = 'https://api.themoviedb.org/3'
const BASE_IMAGENES = 'https://image.tmdb.org/t/p'
const IDIOMA = 'es-ES'
const REGION = 'ES'

const TOKEN = import.meta.env.VITE_TMDB_TOKEN

/**
 * IDs de keywords de TMDB asociadas a contenido explícito o softcore.
 * Se usan con `without_keywords` (pipe = OR) en /discover cuando el usuario
 * tiene activado el modo seguro. El parámetro `include_adult=false` ya filtra
 * el catálogo X, pero TMDB no marca como "adult" muchos títulos eróticos /
 * softcore que igualmente conviene esconder.
 *
 * La lista es conservadora y editable. Si aparece un falso positivo,
 * se quita el ID correspondiente.
 */
const KEYWORDS_EXPLICITAS = [
  9685,   // softcore
  190370, // erotica
  2920,   // erotic movie
  165159, // female full frontal nudity
  165160, // male full frontal nudity
  12565,  // nudity
  6075,   // pornography
].join('|')

/**
 * Petición genérica a TMDB. Agrega autenticación e idioma,
 * y normaliza los errores en un Error con mensaje legible.
 *
 * @param {string} ruta  Ruta del endpoint, ej. '/movie/popular'.
 * @param {Object} parametros  Parámetros de query adicionales.
 */
async function peticion(ruta, parametros = {}) {
  if (!TOKEN) {
    throw new Error('Falta configurar VITE_TMDB_TOKEN en el archivo .env')
  }

  const url = new URL(`${BASE_API}${ruta}`)
  url.searchParams.set('language', IDIOMA)
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor !== undefined && valor !== null && valor !== '') {
      url.searchParams.set(clave, valor)
    }
  }

  // Cortocircuito: si el navegador sabe que no hay red, evitamos el fetch
  // y devolvemos un error reconocible para que la app caiga al cache.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('SIN_CONEXION')
  }

  let respuesta
  try {
    respuesta = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        accept: 'application/json',
      },
    })
  } catch {
    throw new Error('SIN_CONEXION')
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error('Token de TMDB inválido o expirado.')
    }
    throw new Error(`Error de TMDB (${respuesta.status}).`)
  }

  return respuesta.json()
}

/* --------------------------- Endpoints ---------------------------------- */

/** Películas populares (paginadas). */
export function obtenerPeliculasPopulares(pagina = 1) {
  return peticion('/movie/popular', { page: pagina, region: REGION })
}

/** Búsqueda de películas por texto. */
export function buscarPeliculas(consulta, pagina = 1) {
  return peticion('/search/movie', { query: consulta, page: pagina, include_adult: false })
}

/** Descubrir películas filtrando por género y orden. */
export function descubrirPeliculas({
  generoId,
  orden = 'popularity.desc',
  pagina = 1,
  modoSeguro = true,
} = {}) {
  // En modo seguro: excluimos keywords explícitas y exigimos un mínimo de votos
  // más alto, para evitar títulos oscuros sin moderación.
  const filtroSeguro = modoSeguro
    ? { without_keywords: KEYWORDS_EXPLICITAS, 'vote_count.gte': 100 }
    : { 'vote_count.gte': 50 }

  return peticion('/discover/movie', {
    with_genres: generoId,
    sort_by: orden,
    page: pagina,
    include_adult: false,
    ...filtroSeguro,
  })
}

/** Lista oficial de géneros de cine. */
export function obtenerGeneros() {
  return peticion('/genre/movie/list')
}

/** Detalle completo de una película (con créditos y videos). */
export function obtenerDetallePelicula(id) {
  return peticion(`/movie/${id}`, { append_to_response: 'credits,videos' })
}

/* --------------------------- Utilidades --------------------------------- */

/**
 * Construye la URL de una imagen de TMDB.
 * @param {string|null} ruta  Ruta de la imagen (poster_path, backdrop_path…).
 * @param {string} tamano  Tamaño de TMDB (w200, w342, w500, w780, original…).
 */
export function urlImagen(ruta, tamano = 'w500') {
  if (!ruta) return null
  return `${BASE_IMAGENES}/${tamano}${ruta}`
}
