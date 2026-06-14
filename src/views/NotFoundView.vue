<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<template>
  <section class="not-found u-container">
    <p class="not-found__code">404</p>
    <h1 class="not-found__title">Esta escena no existe</h1>
    <p class="not-found__text">
      La página que buscás no está en cartelera. Volvé al inicio para seguir explorando.
    </p>
    <BaseButton to="/" variante="primary" tamano="lg">Volver al inicio</BaseButton>
  </section>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  padding-block: var(--space-8);
}

.not-found__code {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-4xl);
  color: var(--color-brand);
}

.not-found__title {
  font-size: var(--text-2xl);
}

.not-found__text {
  max-width: 46ch;
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
}
</style>
