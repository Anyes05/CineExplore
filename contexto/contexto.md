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
Múltiples vistas utilizando Vue Router.
Componentes reutilizables.
Layout responsive.
Consumo de al menos una API externa.
Render dinámico de información.
Formularios interactivos.
Búsqueda o filtrado dinámico.
Manejo de estados compartidos.
Persistencia frontend.
Arquitectura organizada del proyecto.


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

Metodología BEM:
La interfaz deberá organizarse utilizando metodología BEM.
Se evaluará especialmente:
Claridad del naming.
Separación entre bloques y elementos.
Reutilización de componentes visuales.
Mantenibilidad del CSS.
Coherencia arquitectónica.


Persistencia frontend:
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

Manejo de estado:
La aplicación deberá implementar manejo de estado compartido mediante Pinia o mecanismos equivalentes.
Se evaluará:
Qué información se centraliza.
Separación entre estado local y compartido.
Flujo de información entre componentes.
Organización y mantenibilidad del estado.

Composables:
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

Bonus opcional
Los grupos que deseen explorar funcionalidades adicionales podrán implementar:
IndexedDB.
Modo offline.
Cache de datos.
Infinite scroll.
Drag and drop.
Charts o visualización de datos.
Animaciones complejas.
Lazy loading.
Virtual scrolling.
Estas funcionalidades no son obligatorias.