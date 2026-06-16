import { defineStore } from 'pinia'
import { useAlmacenamiento } from '@/composables/useAlmacenamiento'

/**
 * Preferencias globales del usuario (no ligadas a la sesión).
 * Por ahora solo el "modo seguro", que oculta contenido potencialmente
 * explícito agregando filtros extra a TMDB y descartando lo que se cuela
 * con `adult: true` desde la búsqueda.
 *
 * El tema visual sigue viviendo en su propio store por simetría histórica.
 */
export const usePreferenciasStore = defineStore('preferencias', () => {
  const modoSeguro = useAlmacenamiento('cineexplore:modo-seguro', true, { almacen: 'local' })

  function alternarModoSeguro() {
    modoSeguro.value = !modoSeguro.value
  }

  return { modoSeguro, alternarModoSeguro }
})
