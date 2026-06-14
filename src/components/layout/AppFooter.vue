<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__inner u-container">
      <p class="app-footer__text">
        © {{ year }} CineExplore · Datos de películas por
        <a class="app-footer__link" href="https://www.themoviedb.org" target="_blank" rel="noopener">
          TMDB
        </a>
      </p>
      <p class="app-footer__note">Proyecto académico — Aplicaciones de Internet Ricas</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: var(--space-8);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.app-footer__inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-2);
  padding-block: var(--space-5);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.app-footer__link {
  color: var(--color-brand);
  font-weight: 600;
}

.app-footer__link:hover {
  text-decoration: underline;
}
</style>
