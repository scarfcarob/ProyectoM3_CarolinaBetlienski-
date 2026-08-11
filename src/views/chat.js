
import { initChatEngine } from '../engine/chatEngine.js';


export function renderChat() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <section class="tarjeta-chat">
      <header class="encabezado-chat">
        <div class="encabezado-chat-avatar" aria-hidden="true">DP</div>
        <div class="encabezado-chat-info">
          <h1 class="encabezado-chat-nombre">Deadpool</h1>
          <p class="encabezado-chat-status">en línea (más o menos)</p>
        </div>
      </header>

      <main class="tarjeta-chat-main">
        <ul class="lista-mensajes" id="lista-mensajes" role="log" aria-live="polite" aria-label="Conversación con Deadpool">
        </ul>
      </main>

      <footer class="pie-chat">
        <p id="token-usage" class="token-usage" aria-live="polite"></p>
        <form class="formulario-chat">
          <label for="chat-input" class="visually-hidden">Mensaje para Deadpool</label>
          <input
            type="text"
            id="chat-input"
            class="entrada-texto"
            placeholder="Escribile algo a Deadpool…"
            autocomplete="off"/>
          <button type="submit" class="boton-envio" aria-label="Enviar mensaje">
            <svg viewBox="0 0 24 24" class="icono-envio" aria-hidden="true">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
            </svg>
          </button>
        </form>
      </footer>
    </section>
  `;

  initChatEngine();
}


