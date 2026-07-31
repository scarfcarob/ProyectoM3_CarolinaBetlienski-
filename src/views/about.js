
export function renderAbout() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <section class="vista-about">
      <h1 class="about-titulo">Acerca del proyecto</h1>
      <p>
        Esta es una prueba de concepto (POC) del equipo de frontend de
        <strong>ComicSansCon</strong>, una agencia digital especializada en
        experiencias interactivas para fans de videojuegos, películas y series.
      </p>
      <h2 class="about-subtitulo">El personaje</h2>
      <p>
        Elegimos a <strong>Deadpool</strong> por su tono irreverente y
        porque rompe la cuarta pared todo el tiempo.
      </p>
      <h2 class="about-subtitulo">Stack técnico</h2>
      <ul>
        <li>HTML / CSS / JS vanilla</li>
        <li>Routing propio con History API (sin librerías)</li>
        <li>Vercel Serverless Functions (próxima etapa)</li>
      </ul>
    </section>
  `;
}



