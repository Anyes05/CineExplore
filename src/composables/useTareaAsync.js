import { ref, shallowRef } from 'vue'

/**
 * Composable para ejecutar tareas asíncronas gestionando estado de
 * carga, error y datos. Desacopla la lógica de fetch de la presentación.
 *
 * @param {Function} tarea  Función async a ejecutar. Recibe los argumentos
 *                          que se pasen a `ejecutar`.
 * @param {Object} opciones
 * @param {*} opciones.datosIniciales  Valor inicial de `datos`.
 *
 * @returns {{ datos, error, cargando, ejecutar }}
 */
export function useTareaAsync(tarea, { datosIniciales = null } = {}) {
  const datos = shallowRef(datosIniciales)
  const error = ref(null)
  const cargando = ref(false)

  async function ejecutar(...args) {
    cargando.value = true
    error.value = null
    try {
      datos.value = await tarea(...args)
      return datos.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      return null
    } finally {
      cargando.value = false
    }
  }

  return { datos, error, cargando, ejecutar }
}
