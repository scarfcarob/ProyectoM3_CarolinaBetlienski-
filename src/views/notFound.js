
export function renderNotFound() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <section class="vista-not-found">
      <h1>404 - Página no encontrada</h1>
      <p>Parece que Deadpool cortó el cable de esta sección.</p>
      <a href="/" class="boton-cta" data-link>Volver al Inicio</a>
    </section>
  `;
}
