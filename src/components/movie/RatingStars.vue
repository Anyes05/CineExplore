<script setup>
/**
 * Componente reutilizable de estrellas (1 a `max`, por defecto 5).
 * Modo editable: emite `update:modelValue` con el puntaje seleccionado.
 * Si se vuelve a clickear el mismo número, lo borra (toggle a 0).
 * Modo solo-lectura: muestra el puntaje sin permitir interacción.
 */
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  editable: { type: Boolean, default: false },
  max: { type: Number, default: 5 },
  tamano: { type: String, default: 'md' }, // sm | md | lg
})

const emit = defineEmits(['update:modelValue'])

const estrellas = computed(() => Array.from({ length: props.max }, (_, i) => i + 1))

function alClicar(n) {
  if (!props.editable) return
  emit('update:modelValue', n === props.modelValue ? 0 : n)
}
</script>

<template>
  <div
    class="rating-stars"
    :class="[`rating-stars--${tamano}`, { 'rating-stars--readonly': !editable }]"
    role="radiogroup"
    aria-label="Puntuación con estrellas"
  >
    <button
      v-for="n in estrellas"
      :key="n"
      class="rating-stars__star"
      :class="{ 'rating-stars__star--active': n <= modelValue }"
      type="button"
      role="radio"
      :aria-checked="n === modelValue"
      :aria-label="`${n} de ${max}`"
      :tabindex="editable ? 0 : -1"
      :disabled="!editable"
      @click="alClicar(n)"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.rating-stars {
  display: inline-flex;
  gap: var(--space-1);
}

.rating-stars__star {
  display: grid;
  place-items: center;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  color: var(--color-text-faint);
  transition: color var(--transition-fast), transform var(--transition-fast);
}

.rating-stars__star svg {
  width: 24px;
  height: 24px;
}

.rating-stars--sm .rating-stars__star svg {
  width: 16px;
  height: 16px;
}

.rating-stars--lg .rating-stars__star svg {
  width: 32px;
  height: 32px;
}

.rating-stars__star--active {
  color: var(--color-gold);
}

.rating-stars:not(.rating-stars--readonly) .rating-stars__star:hover {
  color: var(--color-gold);
  transform: scale(1.1);
}

/* En hover, las anteriores también se iluminan (efecto cascada) */
.rating-stars:not(.rating-stars--readonly):hover .rating-stars__star {
  color: var(--color-gold);
}
.rating-stars:not(.rating-stars--readonly) .rating-stars__star:hover ~ .rating-stars__star {
  color: var(--color-text-faint);
}

.rating-stars--readonly .rating-stars__star {
  cursor: default;
}
</style>
