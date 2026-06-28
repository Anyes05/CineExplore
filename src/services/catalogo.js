/**
 * Capa de orquestación entre TMDB y el cache local.
 * Centraliza cuándo consultar la red, cuándo reutilizar datos guardados
 * y cuándo persistir respuestas para uso offline.
 */
import { buscarPeliculas, descubrirPeliculas, obtenerDetallePelicula, obtenerGeneros } from '@/services/tmdb'
import {
  clavePaginaCatalogo,
  guardarCacheDetalle,
  guardarCacheGeneros,
  guardarCachePagina,
  leerCacheDetalle,
  leerCacheGeneros,
  leerCachePagina,
} from '@/services/cache'

function enLinea() {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}

/**
 * Trae una página del catálogo (búsqueda o discover) con cache en memoria.
 */
export async function obtenerPaginaCatalogo({
  consulta,
  generoId,
  orden,
  modoSeguro,
  pagina,
  buscando,
}) {
  const clave = clavePaginaCatalogo({ consulta, generoId, orden, modoSeguro, pagina })
  const cache = leerCachePagina(clave)

  if (cache) return cache

  try {
    const datos = buscando
      ? await buscarPeliculas(consulta, pagina)
      : await descubrirPeliculas({ generoId, orden, pagina, modoSeguro })

    guardarCachePagina(clave, datos)
    return datos
  } catch (err) {
    if (cache) return cache
    throw err
  }
}

/** Detalle de película con fallback al cache local si falla la red. */
export async function obtenerDetalleConCache(id) {
  const cache = leerCacheDetalle(id)

  if (!enLinea() && cache) return cache

  try {
    const datos = await obtenerDetallePelicula(id)
    guardarCacheDetalle(id, datos)
    return datos
  } catch (err) {
    if (cache) return cache
    throw err
  }
}

/** Lista de géneros con persistencia en localStorage. */
export async function obtenerGenerosConCache() {
  const cache = leerCacheGeneros()
  if (!enLinea() && cache?.length) return cache

  try {
    const datos = await obtenerGeneros()
    const generos = datos.genres ?? []
    guardarCacheGeneros(generos)
    return generos
  } catch (err) {
    if (cache?.length) return cache
    throw err
  }
}
