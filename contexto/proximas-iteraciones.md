# CineExplore — Hoja de ruta y próximas iteraciones

Documento de seguimiento del proyecto. Resume lo construido y detalla el plan
de las próximas iteraciones para retomar el trabajo sin perder contexto.

---

## Estado actual (iteraciones 0 a 4 — COMPLETADAS)

| Iter | Qué se construyó |
|------|------------------|
| **0** | Andamiaje: Vite + Vue 3, Vue Router, Pinia. Estructura de carpetas. Sistema de diseño (tokens CSS con tema claro/oscuro). Layout base (AppHeader, AppFooter), `BaseButton`, `ThemeToggle`. Tema persistido en localStorage. |
| **1** | Catálogo desde TMDB: `services/tmdb.js`, composable `useTareaAsync`, store `peliculas`, `MovieCard`, `MovieGrid` (skeletons + estados), `StateMessage`. Home con grid. |
| **2** | Búsqueda + filtro por género + orden + paginación ("Ver más"). `GenreFilter`, `SortSelect` (dropdown propio). Buscador del header con debounce. Filtros persistidos en sessionStorage. |
| **3** | Vista de detalle `/pelicula/:id` con estado **local** (`useTareaAsync`): backdrop, póster, todos los géneros, sinopsis, duración, director, tráiler (YouTube) y reparto (`CastList`). |
| **4** | Sesión simulada: store `auth` (usuarios en localStorage, sesión en sessionStorage), store `ui` (modal), `BaseModal`, `AuthModal` (login/registro con validación, mostrar/ocultar password), header con chip de usuario + menú "Cerrar sesión". |

### Convenciones del proyecto (decididas, mantener)
- **Idioma del código:** español en lo nuestro (funciones, variables, getters, stores,
  props, eventos). Se mantienen en inglés: APIs de Vue/Pinia/Router, palabras del
  lenguaje, **campos de TMDB** (`poster_path`, `vote_average`…) y parámetros de su API.
- **Composables:** prefijo `use` + resto en español (`useTareaAsync`, `useAlmacenamiento`).
- **CSS:** metodología **BEM** (`bloque__elemento--modificador`). Clases y nombres de
  archivo de componentes en inglés/PascalCase.
- **Estado:** compartido → Pinia (`stores/`); local de una vista → composables.
- **Persistencia:** `localStorage` para lo que cruza sesiones (tema, y a futuro
  favoritos/listas/reseñas/usuarios); `sessionStorage` para lo temporal (filtros).

### Limitaciones técnicas conocidas
- TMDB **no combina** búsqueda de texto con filtro de género/orden en una sola llamada.
  Por eso en modo búsqueda se ocultan esos controles.
- Cada página de TMDB devuelve **20 resultados** fijos; por eso la paginación.
- Las películas tienen **varios géneros** (`genre_ids` es array); la card prioriza el
  género filtrado y, si no, muestra el primero.

---

## Iteración 4 — Sesión simulada (login / registro) ✅ COMPLETADA

**Objetivo:** simular autenticación en el front, sin backend.

- [x] **Store `auth`** (`stores/auth.js`): usuarios en localStorage, sesión (email) en
  sessionStorage. Acciones `registrar`, `iniciarSesion`, `cerrarSesion`; getters
  `usuarioActual`, `estaAutenticado`. Password en texto plano solo a fines de simulación.
- [x] **Store `ui`** (`stores/ui.js`): controla apertura del modal y la pestaña activa.
- [x] **`BaseModal`** reutilizable (Teleport, cierre con Escape / click afuera, bloqueo de scroll).
- [x] **`AuthModal`** con pestañas Iniciar sesión / Registrarse: validación reactiva por campo,
  error general (correo duplicado / credenciales), mostrar/ocultar password.
- [x] **Header cableado:** sin sesión → botón que abre el modal; con sesión → chip con avatar
  (inicial) + nombre y menú con "Cerrar sesión".
- [x] **Formularios interactivos** → requisito obligatorio ahora ✅.
- ~~Composable `useFormulario`~~: se resolvió con validación reactiva inline en `AuthModal`
  (suficiente para 3 campos). Se puede extraer a composable si crecen los formularios.
- [ ] **Pendiente para iter. 5/6:** guard de UX (favoritos/listas/reseñas requieren sesión →
  si no, abrir el modal con `ui.abrirAuth()`).

---

## Iteración 5 — Favoritos (PRÓXIMA)

**Objetivo:** marcar favoritos y verlos en una vista propia con estadísticas.

- [ ] **Store `favoritos`** (`stores/favoritos.js`): set de películas favoritas por usuario,
  persistido en **localStorage** (idealmente namespaced por usuario, ej. `favoritos:<email>`).
  - Acciones: `alternar(pelicula)`, getter `idsFavoritos`, `esFavorito(id)`.
  - Guardar lo mínimo necesario de cada peli (id, title, poster_path, vote_average,
    genre_ids, release_date) para poder renderizarlas sin volver a pedir a la API.
- [ ] **Cablear el corazón** de `MovieCard` (evento `alternar-favorito` ya existe) y agregar
  el botón de favorito también en la vista de **detalle**.
- [ ] **Vista `/favoritos`** (`FavoritesView.vue`) según `favoritos.png`:
  - Encabezado "Mis Favoritos" + **stats**: cantidad guardada y **promedio de rating**.
  - Reutilizar `MovieGrid`. Estado vacío con CTA a explorar.
  - Agregar la ruta y activar el link "Favoritos" del header (hoy cae en 404).

---

## Iteración 6 — Funcionalidad estilo Letterboxd (diferencial del proyecto)

**Objetivo:** puntuación propia, reseñas y listas/colecciones personalizadas.

- [ ] **Store `valoraciones`** (`stores/valoraciones.js`), persistido en localStorage por usuario:
  - **Puntuación propia** por película (ej. 1–5 estrellas o 1–10).
  - **Reseña** (texto + fecha + opcional "visto el"). Una por peli por usuario.
- [ ] **Componente `RatingStars`** reutilizable (interactivo en detalle, solo-lectura en cards).
- [ ] **En la vista de detalle:** sección "Tu valoración" con estrellas + textarea de reseña
  (formulario interactivo), guardar/editar/borrar.
- [ ] **Store `listas`** (`stores/listas.js`): colecciones creadas por el usuario
  (más allá de favoritos), cada una con nombre, descripción y películas.
  - Acciones: crear/renombrar/eliminar lista, agregar/quitar peli.
- [ ] **UI de listas:**
  - Modal/menú "Agregar a lista…" desde card y detalle.
  - Vista `/listas` (índice) y `/listas/:id` (detalle de una lista, reutiliza `MovieGrid`).
  - *Bonus posible:* **drag & drop** para reordenar películas dentro de una lista.
- [ ] **Vista de perfil** (opcional): resumen del usuario — favoritos, listas, reseñas,
  *bonus:* **chart** de géneros más vistos / distribución de puntuaciones.

---

## Iteración 7 — Pulido final

- [ ] Revisión de **responsive** fino (mobile real: header, detalle, modales).
- [ ] **Accesibilidad:** foco visible, roles ARIA, navegación por teclado en modales/dropdowns.
- [ ] Estados vacíos/errores consistentes en todas las vistas.
- [ ] Microinteracciones y transiciones coherentes.
- [ ] **README** del proyecto (instalación, `.env`, decisiones de arquitectura).
- [ ] Repaso final contra `contexto.md` (que todos los obligatorios queden ✅).

---

## Bonus candidatos (no obligatorios)
- **Drag & drop** para ordenar listas (iter. 6).
- **Charts** de estadísticas en favoritos/perfil.
- **Cache de datos** / IndexedDB para el catálogo o detalles ya vistos.
- **Infinite scroll** como alternativa al botón "Ver más".
- Animaciones y lazy loading: **ya parcialmente cubiertos**.
