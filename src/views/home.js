
export function renderHome() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <section class="vista-home">
      <div class="home-hero">
        <div class="encabezado-chat-avatar" aria-hidden="true">DP</div>
        <h1 class="home-titulo">Hablá con Deadpool</h1>
        <p class="home-subtitulo">
          Una prueba de concepto de ComicSansCon para ver si los
          fans se copan chateando con personajes ficticios impulsados
          por IA. Sin spoilers, pero con chistes malos garantizados.
        </p>
        <a href="/chat" class="boton-cta" data-link>💬 Empezar a chatear</a>
      </div>

      <div class="aviso">
        <p>
          Dato random: el historial de esta charla vive solo en tu sesión.
          Si recargás la página, Deadpool "olvida" todo. Cosas de POC.
        </p>
      </div>
    </section>
  `;
}
