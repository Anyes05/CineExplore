<script setup>
/**
 * Encabezado principal de la aplicación.
 * Logo + buscador + acciones (favoritos, tema, sesión).
 * Por ahora el buscador y la sesión son visuales; se cablean más adelante.
 */
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner u-container">
      <!-- Marca -->
      <RouterLink to="/" class="brand" aria-label="CineExplore inicio">
        <span class="brand__mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="M3 9h18M8 4v16M16 4v16" stroke-width="1.6" />
          </svg>
        </span>
        <span class="brand__text">Cine<span class="brand__accent">Explore</span></span>
      </RouterLink>

      <!-- Buscador (placeholder por ahora) -->
      <form class="search" role="search" @submit.prevent>
        <svg class="search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" stroke-linecap="round" />
        </svg>
        <input
          class="search__input"
          type="search"
          placeholder="Buscar películas…"
          aria-label="Buscar películas"
        />
      </form>

      <!-- Acciones -->
      <nav class="app-header__actions" aria-label="Acciones de usuario">
        <BaseButton variante="ghost" tamano="sm" to="/favoritos">
          <template #icon>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M12 21s-7.5-4.6-9.5-9.2C1.1 8.2 3 5 6.2 5c2 0 3.2 1.2 3.8 2.3C10.6 6.2 11.8 5 13.8 5 17 5 18.9 8.2 17.5 11.8 15.5 16.4 12 21 12 21z" />
            </svg>
          </template>
          Favoritos
        </BaseButton>

        <ThemeToggle />

        <BaseButton variante="primary" tamano="sm">Iniciar sesión</BaseButton>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background-color: color-mix(in srgb, var(--color-surface) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

.app-header__inner {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  min-height: var(--header-height);
}

/* --- Marca --- */
.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-lg);
  flex-shrink: 0;
}

.brand__mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  background: var(--gradient-hero);
  color: #fff;
}

.brand__mark svg {
  width: 20px;
  height: 20px;
}

.brand__accent {
  color: var(--color-brand);
}

/* --- Buscador --- */
.search {
  position: relative;
  flex: 1;
  max-width: 520px;
  margin-inline: auto;
}

.search__icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--color-text-faint);
  pointer-events: none;
}

.search__input {
  width: 100%;
  padding: var(--space-3) var(--space-4) var(--space-3) var(--space-7);
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface-inset);
  font-size: var(--text-sm);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search__input::placeholder {
  color: var(--color-text-faint);
}

.search__input:focus {
  outline: none;
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 20%, transparent);
}

/* --- Acciones --- */
.app-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.icon {
  width: 16px;
  height: 16px;
}

/* --- Responsive --- */
@media (max-width: 860px) {
  .search {
    order: 3;
    flex-basis: 100%;
    max-width: none;
  }
  .app-header__inner {
    flex-wrap: wrap;
    padding-block: var(--space-3);
  }
}

@media (max-width: 560px) {
  .brand__text {
    display: none;
  }
}
</style>
