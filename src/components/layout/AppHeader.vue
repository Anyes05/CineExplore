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
import { useHistorialBusquedaStore } from '@/stores/historialBusqueda'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import BaseButton from '@/components/ui/BaseButton.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import SafeToggle from '@/components/ui/SafeToggle.vue'

const router = useRouter()
const peliculasStore = usePeliculasStore()
const historialStore = useHistorialBusquedaStore()
const { consulta } = storeToRefs(peliculasStore)
const { historial } = storeToRefs(historialStore)

const auth = useAuthStore()
const ui = useUiStore()
const { estaAutenticado, usuarioActual } = storeToRefs(auth)

// Inicial para el avatar del usuario logueado.
const inicial = computed(() => usuarioActual.value?.nombre?.[0]?.toUpperCase() ?? '?')

// Menú desplegable del usuario.
const menuAbierto = ref(false)
const refUsuario = ref(null)

// Texto local del input, inicializado con la búsqueda persistida en sesión.
const textoBusqueda = ref(consulta.value)

// Panel de historial de búsqueda.
const historialVisible = ref(false)
const refBusqueda = ref(null)

const historialFiltrado = computed(() => {
  const termino = textoBusqueda.value.trim().toLowerCase()
  if (!termino) return historial.value
  return historial.value.filter((item) => item.toLowerCase().includes(termino))
})

function alClickFuera(evento) {
  if (refUsuario.value && !refUsuario.value.contains(evento.target)) {
    menuAbierto.value = false
  }
  if (refBusqueda.value && !refBusqueda.value.contains(evento.target)) {
    historialVisible.value = false
  }
}

function cerrarSesion() {
  auth.cerrarSesion()
  menuAbierto.value = false
}

onMounted(() => document.addEventListener('click', alClickFuera))

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
  const termino = textoBusqueda.value.trim()
  aplicarBusqueda()
  if (termino) {
    historialStore.registrar(termino)
  }
}

function limpiar() {
  textoBusqueda.value = ''
  clearTimeout(temporizador)
  aplicarBusqueda()
}

function mostrarHistorial() {
  if (historial.value.length) historialVisible.value = true
}

function ocultarHistorial() {
  historialVisible.value = false
}

function seleccionarHistorial(termino) {
  textoBusqueda.value = termino
  clearTimeout(temporizador)
  aplicarBusqueda()
  historialVisible.value = false
}

function quitarDelHistorial(termino) {
  historialStore.eliminar(termino)
  if (!historial.value.length) historialVisible.value = false
}

function limpiarHistorial() {
  historialStore.limpiar()
  historialVisible.value = false
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
      <div ref="refBusqueda" class="search">
        <form class="search__form" role="search" @submit.prevent="enviar">
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
            autocomplete="off"
            :aria-expanded="historialVisible && historialFiltrado.length > 0"
            aria-controls="search-history"
            @focus="mostrarHistorial"
            @keydown.esc="ocultarHistorial"
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

        <transition name="dropdown">
          <div
            v-if="historialVisible && historialFiltrado.length"
            id="search-history"
            class="search__history"
            role="listbox"
            aria-label="Búsquedas recientes"
          >
            <p class="search__history-title">Búsquedas recientes</p>
            <ul class="search__history-list">
              <li v-for="item in historialFiltrado" :key="item" role="presentation">
                <button
                  class="search__history-item"
                  type="button"
                  role="option"
                  @mousedown.prevent="seleccionarHistorial(item)"
                >
                  <svg class="search__history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="8" />
                    <path d="M12 8v4l3 2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <span class="search__history-text">{{ item }}</span>
                </button>
                <button
                  class="search__history-remove"
                  type="button"
                  :aria-label="`Quitar «${item}» del historial`"
                  @mousedown.prevent="quitarDelHistorial(item)"
                >
                  ✕
                </button>
              </li>
            </ul>
            <button
              class="search__history-clear"
              type="button"
              @mousedown.prevent="limpiarHistorial"
            >
              Limpiar historial
            </button>
          </div>
        </transition>
      </div>

      <!-- Acciones -->
      <nav class="app-header__actions" aria-label="Acciones de usuario">
        <BaseButton variante="ghost" tamano="sm" to="/favoritos" aria-label="Favoritos">
          <template #icon>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M12 21s-7.5-4.6-9.5-9.2C1.1 8.2 3 5 6.2 5c2 0 3.2 1.2 3.8 2.3C10.6 6.2 11.8 5 13.8 5 17 5 18.9 8.2 17.5 11.8 15.5 16.4 12 21 12 21z" />
            </svg>
          </template>
          <span class="app-header__action-label">Favoritos</span>
        </BaseButton>

        <BaseButton variante="ghost" tamano="sm" to="/listas" aria-label="Mis listas">
          <template #icon>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M3 6h13M3 12h13M3 18h9" stroke-linecap="round" />
              <path d="M18 14v8M14 18h8" stroke-linecap="round" />
            </svg>
          </template>
          <span class="app-header__action-label">Listas</span>
        </BaseButton>

        <SafeToggle />
        <ThemeToggle />

        <!-- Sin sesión: botón de acceso -->
        <BaseButton
          v-if="!estaAutenticado"
          variante="primary"
          tamano="sm"
          aria-label="Iniciar sesión"
          @click="ui.abrirAuth('login')"
        >
          <span class="app-header__login-label app-header__login-label--full">Iniciar sesión</span>
          <span class="app-header__login-label app-header__login-label--short">Entrar</span>
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
  width: 100%;
  max-width: 100%;
  overflow-x: clip;
  background-color: color-mix(in srgb, var(--color-surface) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

.app-header__inner {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  min-height: var(--header-height);
  min-width: 0;
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
  min-width: 0;
  max-width: 520px;
  margin-inline: auto;
}

.search__form {
  position: relative;
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

.search__history {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + var(--space-2));
  z-index: 40;
  padding: var(--space-2);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.search__history-title {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.search__history-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.search__history-list > li {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.search__history-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  text-align: left;
  font-size: var(--text-sm);
  color: var(--color-text);
  transition: background-color var(--transition-fast);
}

.search__history-item:hover {
  background-color: var(--color-surface-2);
}

.search__history-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: var(--color-text-faint);
}

.search__history-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search__history-remove {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.search__history-remove:hover {
  color: var(--color-text);
  background-color: var(--color-surface-2);
}

.search__history-clear {
  width: 100%;
  margin-top: var(--space-1);
  padding: var(--space-3);
  border-top: 1px solid var(--color-border);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-align: center;
  transition: color var(--transition-fast);
}

.search__history-clear:hover {
  color: var(--color-danger);
}

/* --- Acciones --- */
.app-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.app-header__login-label--short {
  display: none;
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
  .app-header__inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'brand actions'
      'search search';
    gap: var(--space-3);
    align-items: center;
    padding-block: var(--space-3);
  }

  .brand {
    grid-area: brand;
  }

  .search {
    grid-area: search;
    width: 100%;
    max-width: none;
    margin-inline: 0;
  }

  .app-header__actions {
    grid-area: actions;
    justify-self: end;
    gap: var(--space-1);
  }
}

@media (max-width: 720px) {
  .app-header__action-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .app-header__actions :deep(.btn--ghost.btn--sm) {
    padding: var(--space-2);
  }

  .app-header__actions :deep(.safe-toggle),
  .app-header__actions :deep(.theme-toggle) {
    width: 36px;
    height: 36px;
  }

  .user-menu__name {
    display: none;
  }

  .user-menu__trigger {
    padding: var(--space-1);
  }
}

@media (max-width: 560px) {
  .brand__text {
    display: none;
  }

  .app-header__login-label--full {
    display: none;
  }

  .app-header__login-label--short {
    display: inline;
  }

  .app-header__actions :deep(.btn--primary.btn--sm) {
    padding: var(--space-2) var(--space-3);
  }
}
</style>
