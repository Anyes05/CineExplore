<script setup>
/**
 * Selector de orden con menú desplegable propio (no usa <select> nativo,
 * para poder estilarlo acorde al resto de la web). Accesible vía listbox.
 * Integra con v-model (modelValue / update:modelValue).
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  ordenes: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const abierto = ref(false)
const raiz = ref(null)

const etiquetaActual = computed(
  () => props.ordenes.find((o) => o.valor === props.modelValue)?.etiqueta || 'Ordenar'
)

function alternar() {
  abierto.value = !abierto.value
}

function seleccionar(valor) {
  emit('update:modelValue', valor)
  abierto.value = false
}

function cerrar() {
  abierto.value = false
}

// Cierra al hacer click fuera del componente.
function alClickFuera(evento) {
  if (raiz.value && !raiz.value.contains(evento.target)) {
    cerrar()
  }
}

onMounted(() => document.addEventListener('click', alClickFuera))
onBeforeUnmount(() => document.removeEventListener('click', alClickFuera))
</script>

<template>
  <div ref="raiz" class="sort-select" @keydown.esc="cerrar">
    <button
      class="sort-select__trigger"
      type="button"
      aria-haspopup="listbox"
      :aria-expanded="abierto"
      @click="alternar"
    >
      <svg class="sort-select__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M3 6h18M6 12h12M10 18h4" stroke-linecap="round" />
      </svg>
      <span class="sort-select__label">{{ etiquetaActual }}</span>
      <svg
        class="sort-select__chevron"
        :class="{ 'sort-select__chevron--open': abierto }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <transition name="dropdown">
      <ul v-if="abierto" class="sort-select__menu" role="listbox">
        <li
          v-for="opcion in ordenes"
          :key="opcion.valor"
          class="sort-select__option"
          :class="{ 'sort-select__option--active': opcion.valor === modelValue }"
          role="option"
          :aria-selected="opcion.valor === modelValue"
          @click="seleccionar(opcion.valor)"
        >
          {{ opcion.etiqueta }}
          <svg
            v-if="opcion.valor === modelValue"
            class="sort-select__check"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
          >
            <path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </li>
      </ul>
    </transition>
  </div>
</template>

<style scoped>
.sort-select {
  position: relative;
  flex-shrink: 0;
}

.sort-select__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: var(--text-sm);
  font-weight: 600;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.sort-select__trigger:hover {
  border-color: var(--color-text-faint);
}

.sort-select__icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
}

.sort-select__chevron {
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
}

.sort-select__chevron--open {
  transform: rotate(180deg);
}

/* --- Menú --- */
.sort-select__menu {
  position: absolute;
  right: 0;
  top: calc(100% + var(--space-2));
  z-index: 20;
  min-width: 220px;
  padding: var(--space-2);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.sort-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.sort-select__option:hover {
  background-color: var(--color-surface-2);
}

.sort-select__option--active {
  color: var(--color-brand);
  font-weight: 600;
}

.sort-select__check {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* --- Animación --- */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
