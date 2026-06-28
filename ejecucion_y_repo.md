Link al repositorio de GitHub: https://github.com/Anyes05/CineExplore

## Requisitos previos

- Node.js 18 o superior
- npm (incluido con Node.js)
- Token de API v4 de TMDB (tmdb.org → cuenta → API)

## Configuración

1. Clonar el repositorio:
   ```
   git clone https://github.com/Anyes05/CineExplore.git
   cd CineExplore
   ```
2. Crear el archivo `.env` en la raíz del proyecto:
   ```
   VITE_TMDB_TOKEN=tu_token_aqui
   ```
3. Instalar dependencias:
   ```
   npm install
   ```

## Modo desarrollo

```
npm run dev
```

Abrir la URL que muestra la terminal (por defecto http://localhost:5173).

## Build de producción

```
npm run build
npm run preview
```
