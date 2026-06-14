El objetivo del laboratorio es desarrollar una Single Page Application (SPA) utilizando
Vue.js y aplicar de forma integrada los conceptos trabajados durante el curso:
HTML semántico.
CSS moderno.
Layouts responsivos.
Arquitectura CSS.
Metodología BEM.
Manipulación dinámica de interfaces.
Componentización.
Manejo de estado.
Persistencia frontend.
Consumo de APIs externas.
El laboratorio busca priorizar la comprensión de arquitectura frontend moderna, organización del código y experiencia de usuario por encima de la complejidad visual o la cantidad
de funcionalidades implementadas.

La tematica elegida es: Explorador multimedia para peliculas

Requisitos obligatorios:
La aplicación deberá incluir como mínimo:
- [x] Múltiples vistas utilizando Vue Router.  ✅ (Home `/`, Detalle `/pelicula/:id`, 404)
- [x] Componentes reutilizables.  ✅ (BaseButton, MovieCard, MovieGrid, StateMessage, etc.)
- [x] Layout responsive.  ✅ (header, grid y detalle adaptativos)
- [x] Consumo de al menos una API externa.  ✅ (TMDB vía src/services/tmdb.js)
- [x] Render dinámico de información.  ✅
- [x] Formularios interactivos.  ✅ (buscador + login/registro con validación; reseñas en iter. 6)
- [x] Búsqueda o filtrado dinámico.  ✅ (búsqueda + género + orden + paginación)
- [x] Manejo de estados compartidos.  ✅ (Pinia: stores tema y peliculas)
- [x] Persistencia frontend.  ✅ (localStorage: tema · sessionStorage: filtros/búsqueda)
- [x] Arquitectura organizada del proyecto.  ✅ (assets/components/composables/router/services/stores/views)


Arquitectura y organización:
El proyecto deberá mantener una estructura clara y mantenible.
Se espera una organización similar a:
src/
    assets/
    components/
    views/
    router/
    stores/
    services/
    data/
La estructura puede variar según las necesidades del proyecto, siempre que mantenga
coherencia y separación de responsabilidades.

Metodología BEM:  ✅ APLICADA (bloques__elemento--modificador en todos los componentes)
La interfaz deberá organizarse utilizando metodología BEM.
Se evaluará especialmente:
Claridad del naming.
Separación entre bloques y elementos.
Reutilización de componentes visuales.
Mantenibilidad del CSS.
Coherencia arquitectónica.


Persistencia frontend:  ✅ IMPLEMENTADA (composable useAlmacenamiento)
La aplicación deberá implementar persistencia utilizando almacenamiento del navegador.
Como mínimo:
localStorage para información persistente entre sesiones.
sessionStorage para estados temporales asociados a la sesión actual.
Ejemplos posibles de uso de localStorage:
Favoritos.
Tema visual.
Preferencias de usuario.
Historial persistente.
Ejemplos posibles de uso de sessionStorage:
Última búsqueda realizada.
Filtros temporales.
Pestaña activa.
Estado de navegación temporal.
Sesión simulada.
La persistencia deberá integrarse de forma coherente con la experiencia de usuario y el
manejo de estado de la aplicación.

Manejo de estado:  ✅ IMPLEMENTADO (Pinia: stores/tema.js y stores/peliculas.js)
La aplicación deberá implementar manejo de estado compartido mediante Pinia o mecanismos equivalentes.
Se evaluará:
Qué información se centraliza.
Separación entre estado local y compartido.
Flujo de información entre componentes.
Organización y mantenibilidad del estado.

Composables:  ✅ IMPLEMENTADOS (useTareaAsync, useAlmacenamiento)
La aplicación deberá desacoplar lógica reutilizable mediante composables cuando resulte
apropiado.
Se evaluará especialmente:
Separación entre lógica y presentación.
Reutilización de comportamiento.
Organización del código.
Claridad y mantenibilidad.
Ejemplos posibles:
Manejo de fetch.
Persistencia frontend.
Manejo de favoritos.
Filtros reutilizables.
Gestión de loading y errores.

Bonus opcional  ⬜ PENDIENTE (a evaluar en futuras iteraciones)
Los grupos que deseen explorar funcionalidades adicionales podrán implementar:
- [ ] IndexedDB.
- [ ] Modo offline.
- [ ] Cache de datos.
- [ ] Infinite scroll.
- [ ] Drag and drop.  ← interesante para reordenar las listas (iter. 6)
- [ ] Charts o visualización de datos.  ← stats de "Mis Favoritos" / perfil
- [x] Animaciones complejas.  ✅ (transición de vistas, skeletons, dropdown, hover de cards)
- [x] Lazy loading.  ✅ (imágenes `loading="lazy"` + rutas con import dinámico)
- [ ] Virtual scrolling.
Estas funcionalidades no son obligatorias.