import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Estado de interfaz global (no ligado al dominio).
 * Por ahora controla el modal de autenticación, que puede abrirse desde
 * el header o desde acciones que requieran sesión.
 */
export const useUiStore = defineStore('ui', () => {
  const modalAuthAbierto = ref(false)
  const pestanaAuth = ref('login') // 'login' | 'registro'

  function abrirAuth(pestana = 'login') {
    pestanaAuth.value = pestana
    modalAuthAbierto.value = true
  }

  function cerrarAuth() {
    modalAuthAbierto.value = false
  }

  // --- Modal "Agregar a lista..." ---
  // Guarda la película sobre la que se está operando (o null = cerrado).
  const peliculaParaLista = ref(null)

  function abrirModalLista(pelicula) {
    peliculaParaLista.value = pelicula
  }

  function cerrarModalLista() {
    peliculaParaLista.value = null
  }

  return {
    modalAuthAbierto,
    pestanaAuth,
    abrirAuth,
    cerrarAuth,
    peliculaParaLista,
    abrirModalLista,
    cerrarModalLista,
  }
})
