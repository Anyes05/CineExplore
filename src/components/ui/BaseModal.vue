<script setup>
/**
 * Modal base reutilizable. Se teletransporta al <body>, se cierra con
 * Escape o click en el overlay, y bloquea el scroll del fondo mientras
 * está abierto. El contenido va por slot.
 */
import { onBeforeUnmount, onMounted } from 'vue'

defineProps({
  titulo: { type: String, default: '' },
})

const emit = defineEmits(['cerrar'])

function alPresionarTecla(evento) {
  if (evento.key === 'Escape') emit('cerrar')
}

onMounted(() => {
  document.addEventListener('keydown', alPresionarTecla)
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', alPresionarTecla)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div class="modal" @click.self="emit('cerrar')">
      <div class="modal__panel" role="dialog" aria-modal="true" :aria-label="titulo">
        <button class="modal__close" type="button" aria-label="Cerrar" @click="emit('cerrar')">
          ✕
        </button>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: grid;
  place-items: center;
  padding: var(--space-4);
  background-color: var(--color-overlay);
  backdrop-filter: blur(4px);
}

.modal__panel {
  position: relative;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--space-6);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.modal__close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-pill);
  color: var(--color-text-muted);
  background-color: var(--color-surface-2);
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.modal__close:hover {
  color: var(--color-text);
  background-color: var(--color-border);
}
</style>
