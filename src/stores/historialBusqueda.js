import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const PREFIJO = 'cineexplore:historial-busqueda:'
const MAX_ENTRADAS = 5

/**
 * Historial de búsquedas recientes por usuario, en sessionStorage.
 * Cada cuenta tiene su propia clave; sin sesión la lista queda vacía.
 * Máximo 5 términos; los duplicados se mueven al inicio.
 */
export const useHistorialBusquedaStore = defineStore('historialBusqueda', () => {
  const auth = useAuthStore()
  const entradas = ref([])

  function claveStorage() {
    const email = auth.usuarioActual?.email
    return email ? `${PREFIJO}${email}` : null
  }

  function cargar() {
    const clave = claveStorage()
    if (!clave) {
      entradas.value = []
      return
    }
    try {
      const crudo = sessionStorage.getItem(clave)
      entradas.value = crudo ? JSON.parse(crudo) : []
    } catch {
      entradas.value = []
    }
  }

  function guardar() {
    const clave = claveStorage()
    if (!clave) return
    sessionStorage.setItem(clave, JSON.stringify(entradas.value))
  }

  watch(
    () => auth.usuarioActual?.email,
    cargar,
    { immediate: true }
  )

  const historial = computed(() => entradas.value.slice(0, MAX_ENTRADAS))

  function registrar(texto) {
    if (!auth.estaAutenticado) return

    const termino = texto.trim()
    if (!termino) return

    const sinDuplicado = entradas.value.filter(
      (item) => item.toLowerCase() !== termino.toLowerCase()
    )
    entradas.value = [termino, ...sinDuplicado].slice(0, MAX_ENTRADAS)
    guardar()
  }

  function eliminar(texto) {
    const termino = texto.trim().toLowerCase()
    entradas.value = entradas.value.filter((item) => item.toLowerCase() !== termino)
    guardar()
  }

  function limpiar() {
    entradas.value = []
    guardar()
  }

  return { historial, registrar, eliminar, limpiar }
})
