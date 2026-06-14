import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAlmacenamiento } from '@/composables/useAlmacenamiento'

/**
 * Store de autenticación SIMULADA (sin backend).
 * - Usuarios registrados → localStorage (persisten entre sesiones).
 * - Sesión activa (email del usuario logueado) → sessionStorage.
 *
 * Nota: al ser un proyecto académico sin servidor, la contraseña se guarda
 * en texto plano solo a fines de simulación. En producción jamás se haría así.
 */
export const useAuthStore = defineStore('auth', () => {
  const usuarios = useAlmacenamiento('cineexplore:usuarios', [], { almacen: 'local' })
  const emailSesion = useAlmacenamiento('cineexplore:sesion', null, { almacen: 'sesion' })

  const usuarioActual = computed(
    () => usuarios.value.find((u) => u.email === emailSesion.value) ?? null
  )
  const estaAutenticado = computed(() => usuarioActual.value !== null)

  /** Registra un usuario nuevo e inicia su sesión. */
  function registrar({ nombre, email, password }) {
    const correo = email.trim().toLowerCase()
    if (usuarios.value.some((u) => u.email === correo)) {
      throw new Error('Ya existe una cuenta con ese correo.')
    }
    usuarios.value = [
      ...usuarios.value,
      { nombre: nombre.trim(), email: correo, password },
    ]
    emailSesion.value = correo
  }

  /** Valida credenciales y abre la sesión. */
  function iniciarSesion({ email, password }) {
    const correo = email.trim().toLowerCase()
    const usuario = usuarios.value.find((u) => u.email === correo)
    if (!usuario || usuario.password !== password) {
      throw new Error('Correo o contraseña incorrectos.')
    }
    emailSesion.value = correo
  }

  /** Cierra la sesión activa (no borra el usuario registrado). */
  function cerrarSesion() {
    emailSesion.value = null
  }

  return {
    usuarios,
    usuarioActual,
    estaAutenticado,
    registrar,
    iniciarSesion,
    cerrarSesion,
  }
})
