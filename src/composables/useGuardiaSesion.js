import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

/**
 * Guarda de UX: las acciones de favoritos, listas y reseñas requieren sesión.
 * Si no hay usuario logueado abrimos el modal de auth en la pestaña indicada
 * y devolvemos false; en caso contrario, true.
 *
 * Uso en componentes:
 *   const { requerirSesion } = useGuardiaSesion()
 *   if (!requerirSesion()) return
 */
export function useGuardiaSesion() {
  const auth = useAuthStore()
  const ui = useUiStore()

  function requerirSesion(pestana = 'login') {
    if (auth.estaAutenticado) return true
    ui.abrirAuth(pestana)
    return false
  }

  return { requerirSesion }
}
