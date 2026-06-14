<script setup>
/**
 * Encabezado principal de la aplicación.
 * Logo + buscador + acciones (favoritos, tema, sesión).
 * El buscador escribe en el store con debounce y navega a la Home.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePeliculasStore } from '@/stores/peliculas'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

const router = useRouter()
const peliculasStore = usePeliculasStore()
const { consulta } = storeToRefs(peliculasStore)

const auth = useAuthStore()
const ui = useUiStore()
const { estaAutenticado, usuarioActual } = storeToRefs(auth)

// Inicial para el avatar del usuario logueado.
const inicial = computed(() => usuarioActual.value?.nombre?.[0]?.toUpperCase() ?? '?')

// Menú desplegable del usuario.
const menuAbierto = ref(false)
const refUsuario = ref(null)

function alClickFuera(evento) {
  if (refUsuario.value && !refUsuario.value.contains(evento.target)) {
    menuAbierto.value = false
  }
}

function cerrarSesion() {
  auth.cerrarSesion()
  menuAbierto.value = false
}

onMounted(() => document.addEventListener('click', alClickFuera))

// Texto local del input, inicializado con la búsqueda persistida en sesión.
const textoBusqueda = ref(consulta.value)

let temporizador = null

function aplicarBusqueda() {
  peliculasStore.establecerConsulta(textoBusqueda.value)
  if (router.currentRoute.value.name !== 'home') {
    router.push({ name: 'home' })
  }
}

// Debounce: espera a que el usuario deje de escribir antes de pegarle a la API.
watch(textoBusqueda, () => {
  clearTimeout(temporizador)
  temporizador = setTimeout(aplicarBusqueda, 450)
})

function enviar() {
  clearTimeout(temporizador)
  aplicarBusqueda()
}

function limpiar() {
  textoBusqueda.value = ''
  clearTimeout(temporizador)
  aplicarBusqueda()
}

onBeforeUnmount(() => {
  clearTimeout(temporizador)
  document.removeEventListener('click', alClickFuera)
})
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

      <!-- Buscador -->
      <form class="search" role="search" @submit.prevent="enviar">
        <svg class="search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" stroke-linecap="round" />
        </svg>
        <input
          v-model="textoBusqueda"
          class="search__input"
          type="search"
          placeholder="Buscar películas…"
          aria-label="Buscar películas"
        />
        <button
          v-if="textoBusqueda"
          class="search__clear"
          type="button"
          aria-label="Limpiar búsqueda"
          @click="limpiar"
        >
          ✕
        </button>
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

        <!-- Sin sesión: botón de acceso -->
        <BaseButton
          v-if="!estaAutenticado"
          variante="primary"
          tamano="sm"
          @click="ui.abrirAuth('login')"
        >
          Iniciar sesión
        </BaseButton>

        <!-- Con sesión: chip de usuario con menú -->
        <div v-else ref="refUsuario" class="user-menu">
          <button
            class="user-menu__trigger"
            type="button"
            :aria-expanded="menuAbierto"
            aria-haspopup="menu"
            @click="menuAbierto = !menuAbierto"
          >
            <span class="user-menu__avatar" aria-hidden="true">{{ inicial }}</span>
            <span class="user-menu__name">{{ usuarioActual.nombre }}</span>
          </button>

          <transition name="dropdown">
            <ul v-if="menuAbierto" class="user-menu__list" role="menu">
              <li class="user-menu__email">{{ usuarioActual.email }}</li>
              <li role="none">
                <button class="user-menu__item" type="button" role="menuitem" @click="cerrarSesion">
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </transition>
        </div>
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
  padding: var(--space-3) var(--space-7) var(--space-3) var(--space-7);
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

/* Oculta la X nativa del input type=search para usar la nuestra. */
.search__input::-webkit-search-cancel-button {
  display: none;
}

.search__clear {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  background-color: var(--color-surface-2);
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.search__clear:hover {
  color: var(--color-text);
  background-color: var(--color-border);
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

/* --- Menú de usuario --- */
.user-menu {
  position: relative;
}

.user-menu__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3) var(--space-1) var(--space-1);
  border-radius: var(--radius-pill);
  background-color: var(--color-surface-2);
  transition: background-color var(--transition-fast);
}

.user-menu__trigger:hover {
  background-color: var(--color-border);
}

.user-menu__avatar {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-pill);
  background: var(--gradient-hero);
  color: #fff;
  font-weight: 700;
  font-size: var(--text-sm);
}

.user-menu__name {
  font-size: var(--text-sm);
  font-weight: 600;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu__list {
  position: absolute;
  right: 0;
  top: calc(100% + var(--space-2));
  z-index: 30;
  min-width: 200px;
  padding: var(--space-2);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.user-menu__email {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-1);
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu__item {
  width: 100%;
  text-align: left;
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-danger);
  transition: background-color var(--transition-fast);
}

.user-menu__item:hover {
  background-color: var(--color-surface-2);
}

/* Animación del menú desplegable. */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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
