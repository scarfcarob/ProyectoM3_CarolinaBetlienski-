
export function renderNotFound() {
  const app = document.getElementById('app');  
  if (!app) return;

  // 1. Capturamos la ruta actual que generó el 404 (g))
  //const currentPath = window.location.pathname;

  app.innerHTML = `
    <section class="vista-not-found">
      <h1>404 - Página no encontrada</h1>
      <p>Parece que Deadpool cortó el cable de esta sección.</p>
      <a href="/" class="boton-cta" data-link>Volver al Inicio</a>
    </section>
  `;
}
