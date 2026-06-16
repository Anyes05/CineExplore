import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const PREFIJO = 'cineexplore:valoraciones:'

/**
 * Store de valoraciones propias del usuario: puntaje (1-5) y reseña.
 * Persiste en localStorage namespaced por correo. Una valoración por
 * usuario y por película (sobreescribe).
 *
 * Estructura interna (por usuario):
 *   { [peliculaId]: { puntaje: 1..5, resena: string, fecha: ISOString } }
 */
export const useValoracionesStore = defineStore('valoraciones', () => {
  const auth = useAuthStore()
  const mapa = ref({})

  function claveStorage() {
    const email = auth.usuarioActual?.email
    return email ? `${PREFIJO}${email}` : null
  }

  function cargar() {
    const clave = claveStorage()
    if (!clave) {
      mapa.value = {}
      return
    }
    try {
      const crudo = localStorage.getItem(clave)
      mapa.value = crudo ? JSON.parse(crudo) : {}
    } catch {
      mapa.value = {}
    }
  }

  function guardar() {
    const clave = claveStorage()
    if (!clave) return
    localStorage.setItem(clave, JSON.stringify(mapa.value))
  }

  watch(() => auth.usuarioActual?.email, cargar, { immediate: true })

  function obtener(peliculaId) {
    return mapa.value[String(peliculaId)] ?? null
  }

  /** Crea o reemplaza la valoración del usuario para una película. */
  function establecer(peliculaId, { puntaje, resena }) {
    if (!auth.estaAutenticado) return
    mapa.value = {
      ...mapa.value,
      [String(peliculaId)]: {
        puntaje,
        resena: resena?.trim() ?? '',
        fecha: new Date().toISOString(),
      },
    }
    guardar()
  }

  /** Borra la valoración del usuario para una película. */
  function borrar(peliculaId) {
    if (!auth.estaAutenticado) return
    const copia = { ...mapa.value }
    delete copia[String(peliculaId)]
    mapa.value = copia
    guardar()
  }

  const cantidad = computed(() => Object.keys(mapa.value).length)

  return { mapa, cantidad, obtener, establecer, borrar }
})
