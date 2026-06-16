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
const MAX_DETALLES = 30

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
