import { ref, watch } from 'vue'

/**
 * Sincroniza un `ref` reactivo con el almacenamiento del navegador.
 * Lee el valor inicial desde el storage (si existe) y persiste
 * automáticamente cada cambio. Reutilizable para localStorage y sessionStorage.
 *
 * @param {string} clave  Clave bajo la que se guarda el valor.
 * @param {*} valorInicial  Valor por defecto si no hay nada guardado.
 * @param {Object} opciones
 * @param {'local'|'sesion'} opciones.almacen  Tipo de almacenamiento.
 *
 * @returns {import('vue').Ref} ref sincronizado con el storage.
 */
export function useAlmacenamiento(clave, valorInicial, { almacen = 'local' } = {}) {
  const storage = almacen === 'sesion' ? sessionStorage : localStorage

  let inicial = valorInicial
  const guardado = storage.getItem(clave)
  if (guardado !== null) {
    try {
      inicial = JSON.parse(guardado)
    } catch {
      inicial = valorInicial
    }
  }

  const dato = ref(inicial)

  watch(
    dato,
    (nuevo) => {
      storage.setItem(clave, JSON.stringify(nuevo))
    },
    { deep: true }
  )

  return dato
}
