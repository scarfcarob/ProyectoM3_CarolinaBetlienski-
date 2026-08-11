
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
         Elegimos a <strong>Deadpool</strong> por su tono irreverente,
         cómico y consciente de que rompe la cuarta pared todo el tiempo —
         el candidato perfecto para demostrar una conversación "con
         personalidad" en lugar de un asistente genérico.
      </p>
      
      <h2 class="about-subtitulo">Stack técnico</h2>
      <ul>
        <li>HTML / CSS / JS vanilla</li>
        <li>Routing propio con History API (sin librerías)</li>
        <li>Integración con Google Gemini AI vía Vercel Serverless Functions</li>
      </ul>
      
      <footer class="about-footer">
        <span>&copy; 2026 Betlienski Carolina</span>
        <div class="about-footer-links">
          <a href="https://github.com/scarfcarob" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/carolina-betlienski-8bb8811b0" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </footer>
    </section>
  `;
}



