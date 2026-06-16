<script setup>
/**
 * Detalle de una lista personalizada: encabezado editable, eliminación
 * y grilla de películas reutilizando MovieGrid. Las películas se pueden
 * quitar individualmente mediante el corazón (que acá funciona como
 * "quitar de la lista", no como favorito).
 */
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useListasStore } from '@/stores/listas'
import { usePeliculasStore } from '@/stores/peliculas'
import { useUiStore } from '@/stores/ui'
import MovieGrid from '@/components/movie/MovieGrid.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import StateMessage from '@/components/ui/StateMessage.vue'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const listasStore = useListasStore()
const peliculasStore = usePeliculasStore()
const ui = useUiStore()
const { mapaGeneros } = storeToRefs(peliculasStore)

if (!Object.keys(mapaGeneros.value).length) {
  peliculasStore.cargarGeneros()
}

const lista = computed(() => listasStore.obtenerLista(props.id))

const editando = ref(false)
const nombreLocal = ref('')
const descripcionLocal = ref('')

watch(
  lista,
  (l) => {
    if (l) {
      nombreLocal.value = l.nombre
      descripcionLocal.value = l.descripcion
    }
  },
  { immediate: true }
)

function guardarEdicion() {
  if (!nombreLocal.value.trim()) return
  listasStore.renombrar(props.id, {
    nombre: nombreLocal.value,
    descripcion: descripcionLocal.value,
  })
  editando.value = false
}

function cancelarEdicion() {
  nombreLocal.value = lista.value.nombre
  descripcionLocal.value = lista.value.descripcion
  editando.value = false
}

function eliminarLista() {
  if (window.confirm('¿Eliminar esta lista? Esta acción no se puede deshacer.')) {
    listasStore.eliminar(props.id)
    router.push({ name: 'listas' })
  }
}

// En esta vista el "corazón" de la card se reinterpreta como "quitar de la lista"
// para que el usuario tenga la acción inversa con un solo click.
function quitarDeLista(pelicula) {
  listasStore.quitarPelicula(props.id, pelicula.id)
}

const idsTodos = computed(() => (lista.value?.peliculas ?? []).map((p) => p.id))
</script>

<template>
  <section class="list-detail u-container">
    <BaseButton variante="ghost" tamano="sm" to="/listas">← Volver a Mis Listas</BaseButton>

    <StateMessage
      v-if="!lista"
      icon="🔎"
      titulo="Lista no encontrada"
      descripcion="Puede que la hayas eliminado o que el enlace esté roto."
    >
      <BaseButton variante="primary" to="/listas">Ir a Mis Listas</BaseButton>
    </StateMessage>

    <template v-else>
      <header class="list-detail__header">
        <template v-if="!editando">
          <div>
            <p class="list-detail__eyebrow">Tu lista</p>
            <h1 class="list-detail__title">{{ lista.nombre }}</h1>
            <p v-if="lista.descripcion" class="list-detail__desc">{{ lista.descripcion }}</p>
            <p class="list-detail__count">
              {{ lista.peliculas.length }} película{{ lista.peliculas.length === 1 ? '' : 's' }}
            </p>
          </div>
          <div class="list-detail__actions">
            <BaseButton variante="soft" tamano="sm" @click="editando = true">Editar</BaseButton>
            <BaseButton variante="danger" tamano="sm" @click="eliminarLista">Eliminar</BaseButton>
          </div>
        </template>

        <form v-else class="list-detail__form" @submit.prevent="guardarEdicion">
          <input
            v-model="nombreLocal"
            class="list-detail__input"
            type="text"
            required
            maxlength="60"
          />
          <input
            v-model="descripcionLocal"
            class="list-detail__input"
            type="text"
            maxlength="140"
            placeholder="Descripción (opcional)"
          />
          <div class="list-detail__form-actions">
            <BaseButton type="submit" variante="primary" tamano="sm" :disabled="!nombreLocal.trim()">
              Guardar cambios
            </BaseButton>
            <BaseButton type="button" variante="ghost" tamano="sm" @click="cancelarEdicion">
              Cancelar
            </BaseButton>
          </div>
        </form>
      </header>

      <p class="list-detail__hint">
        Tip: el corazón de cada card quita la película de esta lista.
      </p>

      <MovieGrid
        :peliculas="lista.peliculas"
        :mapa-generos="mapaGeneros"
        :ids-favoritos="idsTodos"
        titulo-vacio="Esta lista todavía está vacía"
        descripcion-vacio="Agregá películas desde el catálogo o desde el detalle de cada una."
        @alternar-favorito="quitarDeLista"
        @agregar-a-lista="ui.abrirModalLista"
      />
    </template>
  </section>
</template>

<style scoped>
.list-detail {
  padding-block: var(--space-7);
}

.list-detail__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-5);
  flex-wrap: wrap;
  margin-top: var(--space-4);
  margin-bottom: var(--space-5);
}

.list-detail__eyebrow {
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: var(--text-sm);
  color: var(--color-brand);
}

.list-detail__title {
  font-size: var(--text-3xl);
  margin-top: var(--space-1);
}

.list-detail__desc {
  color: var(--color-text-muted);
  max-width: 60ch;
  margin-top: var(--space-2);
}

.list-detail__count {
  margin-top: var(--space-2);
  color: var(--color-text-faint);
  font-size: var(--text-sm);
}

.list-detail__actions {
  display: flex;
  gap: var(--space-2);
}

.list-detail__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
  max-width: 480px;
}

.list-detail__input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-inset);
  font-size: var(--text-sm);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.list-detail__input:focus {
  outline: none;
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 20%, transparent);
}

.list-detail__form-actions {
  display: flex;
  gap: var(--space-2);
}

.list-detail__hint {
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-style: italic;
}
</style>
