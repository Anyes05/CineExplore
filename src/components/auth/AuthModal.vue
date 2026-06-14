<script setup>
/**
 * Modal de autenticación con pestañas Iniciar sesión / Registrarse.
 * Validación reactiva por campo y manejo de error general (credenciales,
 * correo duplicado). Al éxito, cierra el modal.
 */
import { computed, reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()
const ui = useUiStore()

const pestana = ref(ui.pestanaAuth)
const form = reactive({ nombre: '', email: '', password: '' })
const verPassword = ref(false)
const enviado = ref(false)
const errorGeneral = ref('')

const esRegistro = computed(() => pestana.value === 'registro')

// Si el modal se abre apuntando a una pestaña concreta, la respeta.
watch(
  () => ui.pestanaAuth,
  (valor) => (pestana.value = valor)
)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const errores = computed(() => {
  const e = {}
  if (esRegistro.value && !form.nombre.trim()) e.nombre = 'Ingresá tu nombre.'
  if (!form.email.trim()) e.email = 'Ingresá tu correo.'
  else if (!EMAIL_RE.test(form.email.trim())) e.email = 'Correo no válido.'
  if (!form.password) e.password = 'Ingresá tu contraseña.'
  else if (esRegistro.value && form.password.length < 6)
    e.password = 'Mínimo 6 caracteres.'
  return e
})

const esValido = computed(() => Object.keys(errores.value).length === 0)

function cambiarPestana(valor) {
  pestana.value = valor
  enviado.value = false
  errorGeneral.value = ''
}

function resetear() {
  form.nombre = ''
  form.email = ''
  form.password = ''
  enviado.value = false
  errorGeneral.value = ''
  verPassword.value = false
}

function cerrar() {
  ui.cerrarAuth()
  resetear()
}

function enviar() {
  enviado.value = true
  errorGeneral.value = ''
  if (!esValido.value) return
  try {
    if (esRegistro.value) {
      auth.registrar({ nombre: form.nombre, email: form.email, password: form.password })
    } else {
      auth.iniciarSesion({ email: form.email, password: form.password })
    }
    cerrar()
  } catch (err) {
    errorGeneral.value = err.message
  }
}
</script>

<template>
  <BaseModal titulo="Acceso a tu cuenta" @cerrar="cerrar">
    <div class="auth">
      <p class="auth__brand">Cine<span class="auth__brand-accent">Explore</span></p>

      <!-- Pestañas -->
      <div class="auth__tabs" role="tablist">
        <button
          class="auth__tab"
          :class="{ 'auth__tab--active': !esRegistro }"
          type="button"
          role="tab"
          :aria-selected="!esRegistro"
          @click="cambiarPestana('login')"
        >
          Iniciar sesión
        </button>
        <button
          class="auth__tab"
          :class="{ 'auth__tab--active': esRegistro }"
          type="button"
          role="tab"
          :aria-selected="esRegistro"
          @click="cambiarPestana('registro')"
        >
          Registrarse
        </button>
      </div>

      <h2 class="auth__title">
        {{ esRegistro ? 'Crea tu cuenta' : '¡Bienvenido de vuelta!' }}
      </h2>
      <p class="auth__subtitle">
        {{ esRegistro ? 'Únete a la comunidad cinéfila' : 'Ingresá tus datos para continuar' }}
      </p>

      <form class="auth__form" novalidate @submit.prevent="enviar">
        <!-- Nombre (solo registro) -->
        <div v-if="esRegistro" class="auth__field">
          <label class="auth__label" for="auth-nombre">Nombre completo</label>
          <input
            id="auth-nombre"
            v-model="form.nombre"
            class="auth__input"
            type="text"
            placeholder="Tu nombre"
            autocomplete="name"
          />
          <p v-if="enviado && errores.nombre" class="auth__error">{{ errores.nombre }}</p>
        </div>

        <!-- Email -->
        <div class="auth__field">
          <label class="auth__label" for="auth-email">Correo electrónico</label>
          <input
            id="auth-email"
            v-model="form.email"
            class="auth__input"
            type="email"
            placeholder="correo@ejemplo.com"
            autocomplete="email"
          />
          <p v-if="enviado && errores.email" class="auth__error">{{ errores.email }}</p>
        </div>

        <!-- Password -->
        <div class="auth__field">
          <label class="auth__label" for="auth-password">Contraseña</label>
          <div class="auth__password">
            <input
              id="auth-password"
              v-model="form.password"
              class="auth__input"
              :type="verPassword ? 'text' : 'password'"
              placeholder="••••••••"
              :autocomplete="esRegistro ? 'new-password' : 'current-password'"
            />
            <button
              class="auth__toggle"
              type="button"
              :aria-label="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="verPassword = !verPassword"
            >
              <!-- Ojo tachado cuando la contraseña está visible -->
              <svg
                v-if="verPassword"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M9.9 5.1A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a16.3 16.3 0 0 1-3 3.6M6.5 6.6C3.6 8.3 2 12 2 12s3.5 7 10 7a9.5 9.5 0 0 0 4.2-1" />
                <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                <path d="M3 3l18 18" />
              </svg>
              <!-- Ojo abierto cuando está oculta -->
              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
          <p v-if="enviado && errores.password" class="auth__error">{{ errores.password }}</p>
        </div>

        <p v-if="errorGeneral" class="auth__error auth__error--general">{{ errorGeneral }}</p>

        <BaseButton type="submit" variante="primary" tamano="lg" :bloque="true">
          {{ esRegistro ? 'Crear cuenta' : 'Iniciar sesión' }}
        </BaseButton>
      </form>

      <p class="auth__switch">
        <template v-if="esRegistro">
          ¿Ya tenés cuenta?
          <button class="auth__link" type="button" @click="cambiarPestana('login')">
            Iniciá sesión
          </button>
        </template>
        <template v-else>
          ¿No tenés cuenta?
          <button class="auth__link" type="button" @click="cambiarPestana('registro')">
            Registrate acá
          </button>
        </template>
      </p>
    </div>
  </BaseModal>
</template>

<style scoped>
.auth__brand {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-lg);
  margin-bottom: var(--space-4);
}
.auth__brand-accent {
  color: var(--color-brand);
}

/* --- Pestañas --- */
.auth__tabs {
  display: flex;
  gap: var(--space-1);
  padding: var(--space-1);
  background-color: var(--color-surface-2);
  border-radius: var(--radius-pill);
  margin-bottom: var(--space-5);
}

.auth__tab {
  flex: 1;
  padding: var(--space-3);
  border-radius: var(--radius-pill);
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.auth__tab--active {
  color: var(--color-text);
  background-color: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.auth__title {
  font-size: var(--text-2xl);
}

.auth__subtitle {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  margin-bottom: var(--space-5);
}

/* --- Formulario --- */
.auth__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.auth__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.auth__label {
  font-size: var(--text-sm);
  font-weight: 600;
}

.auth__input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-inset);
  font-size: var(--text-sm);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.auth__input:focus {
  outline: none;
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 20%, transparent);
}

.auth__password {
  position: relative;
}

.auth__password .auth__input {
  padding-right: var(--space-8);
}

.auth__toggle {
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: var(--color-text-faint);
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.auth__toggle:hover {
  color: var(--color-text);
  background-color: var(--color-surface-2);
}

.auth__toggle svg {
  width: 18px;
  height: 18px;
}

.auth__error {
  font-size: var(--text-xs);
  color: var(--color-danger);
}

.auth__error--general {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background-color: color-mix(in srgb, var(--color-danger) 12%, transparent);
  font-size: var(--text-sm);
  text-align: center;
}

.auth__switch {
  margin-top: var(--space-5);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.auth__link {
  color: var(--color-brand);
  font-weight: 700;
}
.auth__link:hover {
  text-decoration: underline;
}
</style>
