<script setup>
/**
 * Índice de listas del usuario logueado.
 * Permite crear, abrir y eliminar listas. Cada card muestra un collage
 * de hasta 4 pósters como vista previa.
 */
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { useListasStore } from '@/stores/listas'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { urlImagen } from '@/services/tmdb'
import BaseButton from '@/components/ui/BaseButton.vue'
import StateMessage from '@/components/ui/StateMessage.vue'

const listasStore = useListasStore()
const auth = useAuthStore()
const ui = useUiStore()

const { listas } = storeToRefs(listasStore)
const { estaAutenticado } = storeToRefs(auth)

const creando = ref(false)
const nombreNueva = ref('')
const descripcionNueva = ref('')

function abrirFormulario() {
  creando.value = true
}

function cancelar() {
  creando.value = false
  nombreNueva.value = ''
  descripcionNueva.value = ''
}

function crear() {
  const ok = listasStore.crear({
    nombre: nombreNueva.value,
    descripcion: descripcionNueva.value,
  })
  if (ok) cancelar()
}

function eliminar(id) {
  if (window.confirm('¿Eliminar esta lista? Esta acción no se puede deshacer.')) {
    listasStore.eliminar(id)
  }
}

function postersDe(lista) {
  return lista.peliculas
    .slice(0, 4)
    .map((p) => urlImagen(p.poster_path, 'w185'))
    .filter(Boolean)
}
</script>

<template>
  <section class="lists u-container">
    <header class="lists__header">
      <div>
        <p class="lists__eyebrow">Tu biblioteca</p>
        <h1 class="lists__title">Mis Listas</h1>
        <p class="lists__subtitle">
          Armá colecciones temáticas: "Para ver", "Top del año", "Pendientes con amigos"…
        </p>
      </div>
      <BaseButton
        v-if="estaAutenticado && !creando"
        variante="primary"
        @click="abrirFormulario"
      >
        + Nueva lista
      </BaseButton>
    </header>

    <!-- Sin sesión -->
    <StateMessage
      v-if="!estaAutenticado"
      icon="🔒"
      titulo="Iniciá sesión para crear listas"
      descripcion="Tus listas se guardan en tu cuenta y se mantienen entre sesiones."
    >
      <BaseButton variante="primary" @click="ui.abrirAuth('login')">
        Iniciar sesión
      </BaseButton>
    </StateMessage>

    <template v-else>
      <!-- Form de creación -->
      <form v-if="creando" class="lists__form" @submit.prevent="crear">
        <input
          v-model="nombreNueva"
          class="lists__input"
          type="text"
          placeholder="Nombre de la lista"
          required
          maxlength="60"
          autofocus
        />
        <input
          v-model="descripcionNueva"
          class="lists__input"
          type="text"
          placeholder="Descripción (opcional)"
          maxlength="140"
        />
        <div class="lists__form-actions">
          <BaseButton type="submit" variante="primary" :disabled="!nombreNueva.trim()">
            Crear lista
          </BaseButton>
          <BaseButton type="button" variante="ghost" @click="cancelar">
            Cancelar
          </BaseButton>
        </div>
      </form>

      <!-- Sin listas -->
      <StateMessage
        v-if="!listas.length"
        icon="📚"
        titulo="Todavía no tenés listas"
        descripcion="Creá una para empezar a organizar tus películas."
      />

      <!-- Listas -->
      <ul v-else class="lists__grid">
        <li v-for="lista in listas" :key="lista.id" class="lists__card">
          <RouterLink :to="`/listas/${lista.id}`" class="lists__cover">
            <div class="lists__collage" :data-count="postersDe(lista).length || '0'">
              <img
                v-for="(src, i) in postersDe(lista)"
                :key="i"
                :src="src"
                :alt="`Póster ${i + 1}`"
                loading="lazy"
              />
              <span v-if="!postersDe(lista).length" class="lists__collage-empty" aria-hidden="true">🎬</span>
            </div>
          </RouterLink>

          <div class="lists__body">
            <RouterLink :to="`/listas/${lista.id}`" class="lists__name">
              {{ lista.nombre }}
            </RouterLink>
            <p v-if="lista.descripcion" class="lists__desc">{{ lista.descripcion }}</p>
            <p class="lists__count">
              {{ lista.peliculas.length }} película{{ lista.peliculas.length === 1 ? '' : 's' }}
            </p>

            <button class="lists__delete" type="button" @click="eliminar(lista.id)">
              Eliminar lista
            </button>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.lists {
  padding-block: var(--space-7);
}

.lists__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-5);
  flex-wrap: wrap;
  margin-bottom: var(--space-6);
}

.lists__eyebrow {
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: var(--text-sm);
  color: var(--color-brand);
}

.lists__title {
  font-size: var(--text-3xl);
  margin-top: var(--space-1);
}

.lists__subtitle {
  color: var(--color-text-muted);
  max-width: 56ch;
  margin-top: var(--space-2);
}

.lists__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  margin-bottom: var(--space-5);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.lists__input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-inset);
  font-size: var(--text-sm);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.lists__input:focus {
  outline: none;
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 20%, transparent);
}

.lists__form-actions {
  display: flex;
  gap: var(--space-2);
}

.lists__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-5);
}

.lists__card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.lists__card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.lists__cover {
  display: block;
  aspect-ratio: 16 / 10;
  background-color: var(--color-surface-2);
}

.lists__collage {
  display: grid;
  width: 100%;
  height: 100%;
  gap: 2px;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  background-color: var(--color-surface-2);
  place-items: center;
}

.lists__collage[data-count="0"] {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.lists__collage[data-count="1"] {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.lists__collage[data-count="1"] img {
  grid-column: 1 / -1;
  grid-row: 1 / -1;
}

.lists__collage[data-count="2"] {
  grid-template-rows: 1fr;
}

.lists__collage[data-count="3"] img:first-child {
  grid-row: 1 / span 2;
}

.lists__collage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lists__collage-empty {
  font-size: var(--text-4xl);
}

.lists__body {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.lists__name {
  font-weight: 700;
  font-size: var(--text-lg);
  color: var(--color-text);
}

.lists__name:hover {
  color: var(--color-brand);
}

.lists__desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lists__count {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.lists__delete {
  align-self: flex-start;
  margin-top: var(--space-2);
  color: var(--color-danger);
  font-size: var(--text-xs);
  font-weight: 600;
}

.lists__delete:hover {
  text-decoration: underline;
}
</style>
