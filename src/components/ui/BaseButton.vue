<script setup>
/**
 * Botón base reutilizable.
 * Renderiza <button>, o <a>/<router-link> si se pasa `href`/`to`.
 */
import { computed } from 'vue'

const props = defineProps({
  variante: {
    type: String,
    default: 'primary', // primary | soft | ghost | danger
  },
  tamano: {
    type: String,
    default: 'md', // sm | md | lg
  },
  type: {
    type: String,
    default: 'button',
  },
  to: {
    type: [String, Object],
    default: null,
  },
  bloque: {
    type: Boolean,
    default: false,
  },
})

const etiqueta = computed(() => (props.to ? 'router-link' : 'button'))

const clases = computed(() => [
  'btn',
  `btn--${props.variante}`,
  `btn--${props.tamano}`,
  { 'btn--block': props.bloque },
])
</script>

<template>
  <component
    :is="etiqueta"
    :class="clases"
    :type="to ? undefined : type"
    :to="to || undefined"
  >
    <slot name="icon" />
    <span v-if="$slots.default" class="btn__label"><slot /></span>
  </component>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-body);
  font-weight: 600;
  line-height: 1;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  transition: background-color var(--transition-fast), color var(--transition-fast),
    border-color var(--transition-fast), transform var(--transition-fast);
  white-space: nowrap;
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* --- Tamaños --- */
.btn--sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
}
.btn--md {
  padding: var(--space-3) var(--space-5);
  font-size: var(--text-sm);
}
.btn--lg {
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-base);
}

/* --- Variantes --- */
.btn--primary {
  background-color: var(--color-brand);
  color: var(--color-brand-contrast);
}
.btn--primary:hover {
  background-color: var(--color-brand-strong);
}

.btn--soft {
  background-color: var(--color-surface-2);
  color: var(--color-text);
}
.btn--soft:hover {
  background-color: var(--color-border);
}

.btn--ghost {
  background-color: transparent;
  color: var(--color-text-muted);
  border-color: var(--color-border);
}
.btn--ghost:hover {
  color: var(--color-text);
  border-color: var(--color-text-faint);
}

.btn--danger {
  background-color: var(--color-danger);
  color: #fff;
}
.btn--danger:hover {
  filter: brightness(0.95);
}

.btn--block {
  width: 100%;
}

.btn__label {
  display: inline-block;
}
</style>
