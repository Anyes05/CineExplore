/**
 * Reglas de filtrado de contenido para el modo seguro (proyecto estudiantil).
 * Centraliza IDs de TMDB, certificaciones y heurísticas de texto para que
 * servicios, stores y vistas compartan el mismo criterio.
 */

/** País usado en discover para limitar la clasificación por edad. */
export const PAIS_CERTIFICACION = 'ES'

/** Máxima clasificación permitida en modo seguro (ES: APTA, 7, 12, 16). */
export const CERTIFICACION_MAXIMA = '16'

/**
 * Keywords de TMDB asociadas a contenido explícito o adulto.
 * Se excluyen en discover con `without_keywords`.
 */
export const KEYWORDS_EXCLUIDAS = [
  9663, // sex
  3417, // erotic
  13091, // nudity
  6730, // sexuality
  271, // sexploitation
  260863, // hardcore
  10905, // softcore
  157295, // sexual content
]

/** Parámetros extra de discover cuando el modo seguro está activo. */
export const PARAMETROS_DISCOVER_SEGURO = {
  certification_country: PAIS_CERTIFICACION,
  'certification.lte': CERTIFICACION_MAXIMA,
  without_keywords: KEYWORDS_EXCLUIDAS.join('|'),
}

/** Clasificaciones que bloquean la película en modo seguro. */
const CERTIFICACIONES_RESTRICTIVAS = {
  ES: new Set(['18', 'X']),
  US: new Set(['R', 'NC-17']),
}

/** Países consultados al evaluar release_dates (prioridad ES → US). */
const PAISES_CERTIFICACION = ['ES', 'US']

/** Patrones en título, tagline o sinopsis que indican contenido no apto. */
const PATRONES_TEXTO_EXPLICITO = [
  /\bsexo explícito\b/i,
  /\bcontenido sexual explícito\b/i,
  /\bpornograf/i,
  /\ber[oó]tic[oa]s?\b/i,
  /\bdesnudez\b/i,
  /\bhardcore\b/i,
  /\bsoftcore\b/i,
  /\bpelícula para adultos\b/i,
  /\bcontenido adulto\b/i,
  /\bsexualmente explícit/i,
  /\bexplicit sex\b/i,
  /\bnudity\b/i,
  /\bsexual content\b/i,
  /\baventura de amor y sexo\b/i,
]

const CAMPOS_TEXTO = ['title', 'original_title', 'tagline', 'overview']

/**
 * Obtiene la certificación teatral más restrictiva de los países prioritarios.
 * @param {Object} pelicula  Objeto de TMDB (detalle con release_dates o similar).
 * @returns {string|null}  Código de certificación o null si no hay datos.
 */
export function obtenerCertificacion(pelicula) {
  const resultados = pelicula?.release_dates?.results
  if (!resultados?.length) return null

  for (const pais of PAISES_CERTIFICACION) {
    const entrada = resultados.find((r) => r.iso_3166_1 === pais)
    const fechas = entrada?.release_dates ?? []
    const certificaciones = fechas
      .map((f) => f.certification?.trim())
      .filter(Boolean)
    if (certificaciones.length) {
      return certificaciones.sort((a, b) => ordenCertificacion(pais, b) - ordenCertificacion(pais, a))[0]
    }
  }
  return null
}

function ordenCertificacion(pais, cert) {
  const escalas = {
    ES: ['APTA', '7', '12', '16', '18', 'X'],
    US: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
  }
  const escala = escalas[pais] ?? []
  const indice = escala.indexOf(cert)
  return indice === -1 ? 0 : indice
}

function certificacionRestrictiva(pelicula) {
  const resultados = pelicula?.release_dates?.results
  if (!resultados?.length) return false

  for (const pais of PAISES_CERTIFICACION) {
    const restrictivas = CERTIFICACIONES_RESTRICTIVAS[pais]
    if (!restrictivas) continue

    const entrada = resultados.find((r) => r.iso_3166_1 === pais)
    const fechas = entrada?.release_dates ?? []
    if (fechas.some((f) => restrictivas.has(f.certification?.trim()))) {
      return true
    }
  }
  return false
}

function contieneTextoExplicito(pelicula) {
  const texto = CAMPOS_TEXTO.map((campo) => pelicula?.[campo] ?? '').join(' ')
  return PATRONES_TEXTO_EXPLICITO.some((patron) => patron.test(texto))
}

/**
 * Indica si una película puede mostrarse con el modo seguro activo.
 * @param {Object|null|undefined} pelicula
 * @param {{ modoSeguro?: boolean }} opciones
 */
export function esPeliculaApropiada(pelicula, { modoSeguro = true } = {}) {
  if (!modoSeguro) return true
  if (!pelicula) return false
  if (pelicula.adult) return false
  if (certificacionRestrictiva(pelicula)) return false
  if (contieneTextoExplicito(pelicula)) return false
  return true
}

/** Filtra un listado de películas según el modo seguro. */
export function filtrarListado(peliculas, modoSeguro = true) {
  if (!modoSeguro || !Array.isArray(peliculas)) return peliculas ?? []
  return peliculas.filter((p) => esPeliculaApropiada(p, { modoSeguro: true }))
}
