<script setup>
/**
 * Mensaje de estado reutilizable para vacío / error / sin resultados.
 * El icono se pasa por la prop `icon` (emoji) y las acciones por slot.
 */
defineProps({
  icon: { type: String, default: 'ℹ️' },
  titulo: { type: String, required: true },
  descripcion: { type: String, default: '' },
  variante: { type: String, default: 'neutral' }, // neutral | error
})
</script>

<template>
  <div class="state" :class="`state--${variante}`" role="status">
    <span class="state__icon" aria-hidden="true">{{ icon }}</span>
    <h3 class="state__title">{{ titulo }}</h3>
    <p v-if="descripcion" class="state__description">{{ descripcion }}</p>
    <div v-if="$slots.default" class="state__actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-2);
  padding: var(--space-8) var(--space-5);
  background-color: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
}

.state--error {
  border-color: color-mix(in srgb, var(--color-danger) 40%, var(--color-border));
}

.state__icon {
  font-size: var(--text-4xl);
}

.state__title {
  font-size: var(--text-xl);
}

.state__description {
  max-width: 46ch;
  color: var(--color-text-muted);
}

.state__actions {
  margin-top: var(--space-3);
}
</style>
