<script setup>
/**
 * Modal "Agregar a lista...".
 * Muestra las listas del usuario con un checkbox por cada una (marcado
 * cuando la película ya pertenece) y un formulario inline para crear
 * una lista nueva.
 *
 * No persiste botón "Guardar": cada toggle / creación se aplica al
 * instante (igual que el corazón de favoritos).
 */
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useListasStore } from '@/stores/listas'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  pelicula: { type: Object, required: true },
})

defineEmits(['cerrar'])

const listasStore = useListasStore()
const { listas } = storeToRefs(listasStore)

const idsConPeli = computed(() => listasStore.listasConPelicula(props.pelicula.id))

const creando = ref(false)
const nombreNueva = ref('')
const descripcionNueva = ref('')

function abrirFormularioNueva() {
  creando.value = true
}

function cancelarNueva() {
  creando.value = false
  nombreNueva.value = ''
  descripcionNueva.value = ''
}

function crearLista() {
  const lista = listasStore.crear({
    nombre: nombreNueva.value,
    descripcion: descripcionNueva.value,
  })
  if (lista) {
    // La agregamos directamente con la película actual.
    listasStore.agregarPelicula(lista.id, props.pelicula)
    cancelarNueva()
  }
}
</script>

<template>
  <BaseModal titulo="Agregar a lista" @cerrar="$emit('cerrar')">
    <div class="add-list">
      <h2 class="add-list__title">Agregar a una lista</h2>
      <p class="add-list__subtitle">
        Marcá las listas en las que querés tener
        <strong>{{ pelicula.title }}</strong>.
      </p>

      <ul v-if="listas.length" class="add-list__items">
        <li v-for="lista in listas" :key="lista.id" class="add-list__item">
          <label class="add-list__row">
            <input
              type="checkbox"
              class="add-list__checkbox"
              :checked="idsConPeli.includes(lista.id)"
              @change="listasStore.alternarPelicula(lista.id, pelicula)"
            />
            <span class="add-list__info">
              <span class="add-list__name">{{ lista.nombre }}</span>
              <span class="add-list__count">
                {{ lista.peliculas.length }} película{{ lista.peliculas.length === 1 ? '' : 's' }}
              </span>
            </span>
          </label>
        </li>
      </ul>
      <p v-else class="add-list__empty">Todavía no creaste ninguna lista.</p>

      <!-- Crear nueva lista -->
      <div class="add-list__new">
        <BaseButton v-if="!creando" variante="soft" tamano="sm" @click="abrirFormularioNueva">
          + Nueva lista
        </BaseButton>

        <form v-else class="add-list__form" @submit.prevent="crearLista">
          <input
            v-model="nombreNueva"
            class="add-list__input"
            type="text"
            placeholder="Nombre de la lista"
            required
            maxlength="60"
          />
          <input
            v-model="descripcionNueva"
            class="add-list__input"
            type="text"
            placeholder="Descripción (opcional)"
            maxlength="140"
          />
          <div class="add-list__form-actions">
            <BaseButton type="submit" variante="primary" tamano="sm" :disabled="!nombreNueva.trim()">
              Crear y agregar
            </BaseButton>
            <BaseButton type="button" variante="ghost" tamano="sm" @click="cancelarNueva">
              Cancelar
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.add-list__title {
  font-size: var(--text-xl);
}

.add-list__subtitle {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  margin-top: var(--space-1);
  margin-bottom: var(--space-5);
}

.add-list__items {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
  max-height: 280px;
  overflow-y: auto;
}

.add-list__row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-inset);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.add-list__row:hover {
  background-color: var(--color-surface-2);
}

.add-list__checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--color-brand);
  flex-shrink: 0;
}

.add-list__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.add-list__name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-list__count {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.add-list__empty {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  margin-bottom: var(--space-5);
}

.add-list__new {
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.add-list__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.add-list__input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-inset);
  font-size: var(--text-sm);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.add-list__input:focus {
  outline: none;
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 20%, transparent);
}

.add-list__form-actions {
  display: flex;
  gap: var(--space-2);
}
</style>
