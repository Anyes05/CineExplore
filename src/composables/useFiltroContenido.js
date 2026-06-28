import { storeToRefs } from 'pinia'
import { usePreferenciasStore } from '@/stores/preferencias'
import { esPeliculaApropiada, filtrarListado } from '@/data/filtroContenido'

/**
 * Composable reutilizable para evaluar contenido según el modo seguro.
 * Desacopla la preferencia persistida de la lógica de filtrado.
 */
export function useFiltroContenido() {
  const preferencias = usePreferenciasStore()
  const { modoSeguro } = storeToRefs(preferencias)

  function permitirPelicula(pelicula) {
    return esPeliculaApropiada(pelicula, { modoSeguro: modoSeguro.value })
  }

  function filtrar(peliculas) {
    return filtrarListado(peliculas, modoSeguro.value)
  }

  return { modoSeguro, permitirPelicula, filtrar }
}
