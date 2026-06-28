/* =========================================================================
   Cache local de respuestas de TMDB.
   Permite que la app siga siendo útil sin conexión: guardamos el último
   listado mostrado en Home y los detalles de las películas ya visitadas.

   Se guarda en localStorage para sobrevivir entre sesiones. Sólo se persisten
   estructuras chicas (la respuesta de TMDB suele rondar 5-15 KB por entrada).
   ========================================================================= */

const CLAVE_HOME = 'cineexplore:cache:home'
const PREFIJO_DETALLE = 'cineexplore:cache:detalle:'
const CLAVE_INDICE_DETALLES = 'cineexplore:cache:detalles-indice'
const CLAVE_GENEROS = 'cineexplore:cache:generos'
const MAX_DETALLES = 30
const TTL_PAGINA_MS = 5 * 60 * 1000

/** Cache en memoria de páginas del catálogo (solo sesión actual). */
const paginasEnMemoria = new Map()

function leer(clave) {
  try {
    const crudo = localStorage.getItem(clave)
    return crudo ? JSON.parse(crudo) : null
  } catch {
    return null
  }
}

function escribir(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // El storage puede estar lleno o deshabilitado: silenciamos para no romper la UX.
  }
}

/* ---------------------------- Home ---------------------------------- */

/**
 * Guarda el estado visible de la Home (últimas películas + filtros aplicados).
 * Lo reutilizamos cuando el usuario abre la app sin conexión.
 */
export function guardarCacheHome(estado) {
  escribir(CLAVE_HOME, { ts: Date.now(), ...estado })
}

export function leerCacheHome() {
  return leer(CLAVE_HOME)
}

/* --------------------------- Detalles ------------------------------- */

function leerIndice() {
  return leer(CLAVE_INDICE_DETALLES) ?? []
}

function escribirIndice(ids) {
  escribir(CLAVE_INDICE_DETALLES, ids)
}

/**
 * Guarda el detalle de una película y mantiene un índice LRU.
 * Si se supera `MAX_DETALLES`, descarta el más viejo.
 */
export function guardarCacheDetalle(id, datos) {
  const idStr = String(id)
  escribir(`${PREFIJO_DETALLE}${idStr}`, { ts: Date.now(), datos })

  let indice = leerIndice().filter((x) => x !== idStr)
  indice.unshift(idStr)
  if (indice.length > MAX_DETALLES) {
    const sobrantes = indice.slice(MAX_DETALLES)
    indice = indice.slice(0, MAX_DETALLES)
    for (const viejo of sobrantes) {
      try {
        localStorage.removeItem(`${PREFIJO_DETALLE}${viejo}`)
      } catch {
        /* noop */
      }
    }
  }
  escribirIndice(indice)
}

export function leerCacheDetalle(id) {
  const entrada = leer(`${PREFIJO_DETALLE}${String(id)}`)
  return entrada?.datos ?? null
}

/* --------------------------- Géneros ------------------------------- */

export function guardarCacheGeneros(generos) {
  escribir(CLAVE_GENEROS, { ts: Date.now(), generos })
}

export function leerCacheGeneros() {
  return leer(CLAVE_GENEROS)?.generos ?? null
}

/* ---------------------- Catálogo / paginación ---------------------- */

/**
 * Clave estable para identificar una página del catálogo según filtros activos.
 */
export function clavePaginaCatalogo({ consulta, generoId, orden, modoSeguro, pagina }) {
  return JSON.stringify({ consulta, generoId, orden, modoSeguro, pagina })
}

/** Compara si el cache de Home corresponde a los filtros actuales. */
export function filtrosCoinciden(cache, filtros) {
  if (!cache) return false
  return (
    (cache.consulta ?? '') === (filtros.consulta ?? '') &&
    (cache.generoId ?? null) === (filtros.generoId ?? null) &&
    (cache.orden ?? 'popularity.desc') === (filtros.orden ?? 'popularity.desc') &&
    Boolean(cache.modoSeguro) === Boolean(filtros.modoSeguro)
  )
}

/** Guarda una respuesta paginada en memoria (TTL corto, misma sesión). */
export function guardarCachePagina(clave, datos) {
  paginasEnMemoria.set(clave, { ts: Date.now(), datos })
}

/** Lee una página cacheada en memoria si no expiró. */
export function leerCachePagina(clave, maxEdad = TTL_PAGINA_MS) {
  const entrada = paginasEnMemoria.get(clave)
  if (!entrada || Date.now() - entrada.ts > maxEdad) {
    paginasEnMemoria.delete(clave)
    return null
  }
  return entrada.datos
}

/** Descarta páginas en memoria cuando cambian los filtros del catálogo. */
export function limpiarCachePaginasCatalogo() {
  paginasEnMemoria.clear()
}
