import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const CLAVE_ALMACENAMIENTO = 'cineexplore:tema'

/**
 * Lee la preferencia guardada o, si no hay, respeta el ajuste del sistema.
 */
function temaInicial() {
  const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO)
  if (guardado === 'light' || guardado === 'dark') return guardado
  const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefiereOscuro ? 'dark' : 'light'
}

/**
 * Store de tema visual. Persiste en localStorage y refleja el valor
 * en el atributo data-theme del <html> para que los tokens CSS reaccionen.
 */
export const useTemaStore = defineStore('tema', () => {
  const tema = ref(temaInicial())

  const esOscuro = computed(() => tema.value === 'dark')

  function aplicar() {
    document.documentElement.setAttribute('data-theme', tema.value)
  }

  function establecerTema(valor) {
    tema.value = valor === 'dark' ? 'dark' : 'light'
    localStorage.setItem(CLAVE_ALMACENAMIENTO, tema.value)
    aplicar()
  }

  function alternar() {
    establecerTema(esOscuro.value ? 'light' : 'dark')
  }

  return { tema, esOscuro, aplicar, establecerTema, alternar }
})
