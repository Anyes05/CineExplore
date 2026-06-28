import { onBeforeUnmount, unref, watch } from 'vue'

/**
 * Observa un elemento centinela y dispara una acción al acercarse al final
 * del scroll (infinite scroll). Desacopla IntersectionObserver de la vista.
 *
 * @param {Function} alIntersectar  Callback cuando hay que cargar más.
 * @param {Object} opciones
 * @param {import('vue').Ref|HTMLElement|null} opciones.sentinel  Elemento observado.
 * @param {import('vue').Ref|boolean} opciones.puedeCargar  Si es false, no dispara.
 * @param {import('vue').Ref|HTMLElement|null} [opciones.root]  Contenedor con scroll.
 * @param {string} [opciones.rootMargin]  Margen antes de intersectar.
 */
export function useInfiniteScroll(alIntersectar, { sentinel, puedeCargar, root = null, rootMargin = '240px' } = {}) {
  let observer = null

  function desconectar() {
    observer?.disconnect()
    observer = null
  }

  function conectar(elemento) {
    desconectar()
    if (!elemento) return

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && unref(puedeCargar)) {
          alIntersectar()
        }
      },
      { root: unref(root) ?? null, rootMargin, threshold: 0 }
    )
    observer.observe(elemento)
  }

  watch(
    () => unref(sentinel),
    (el) => conectar(el),
    { flush: 'post', immediate: true }
  )

  onBeforeUnmount(desconectar)

  return { desconectar }
}
