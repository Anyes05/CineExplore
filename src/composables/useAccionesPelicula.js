import { useFavoritosStore } from '@/stores/favoritos'
import { useUiStore } from '@/stores/ui'
import { useGuardiaSesion } from '@/composables/useGuardiaSesion'

/**
 * Acciones de favoritos y listas con guardia de sesión.
 * Centraliza la lógica para Home, detalle y cualquier vista con MovieGrid.
 */
export function useAccionesPelicula() {
  const favoritos = useFavoritosStore()
  const ui = useUiStore()
  const { requerirSesion } = useGuardiaSesion()

  function alternarFavorito(pelicula) {
    if (!requerirSesion()) return
    favoritos.alternar(pelicula)
  }

  function agregarALista(pelicula) {
    if (!requerirSesion()) return
    ui.abrirModalLista(pelicula)
  }

  return { alternarFavorito, agregarALista }
}
