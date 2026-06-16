import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Reactivo `enLinea` que sigue al navegador (navigator.onLine + eventos).
 * Útil para mostrar banners de "sin conexión" y decidir si la app debe
 * caer al modo offline (datos cacheados).
 */
export function useEstadoConexion() {
  const enLinea = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

  function alConectar() {
    enLinea.value = true
  }
  function alDesconectar() {
    enLinea.value = false
  }

  onMounted(() => {
    window.addEventListener('online', alConectar)
    window.addEventListener('offline', alDesconectar)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('online', alConectar)
    window.removeEventListener('offline', alDesconectar)
  })

  return { enLinea }
}
