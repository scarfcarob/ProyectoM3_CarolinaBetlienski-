
import { escapeHTML } from '../utils.js';


export function renderMensajes(historialMensajes, { estaEscribiendo = false, banner = null, onReintentar = null } = {}) {
  const lista = document.getElementById('lista-mensajes');
  if (!lista) return;

  lista.innerHTML = historialMensajes.map(msg => `
    <li class="mensaje mensaje--${msg.emisor}">
      <p class="mensaje-texto">${escapeHTML(msg.texto)}</p>
      <time class="mensaje-time">${msg.hora}</time>
    </li>
  `).join('');

  if (estaEscribiendo) {
    lista.innerHTML += `
      <li class="mensaje mensaje--personaje mensaje--typing" id="indicador-typing">
        <span class="typing-texto">Deadpool está escribiendo</span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </li>
    `;
  }

  if (banner) {
    lista.innerHTML += `
      <li class="estado-error">
        <p>${escapeHTML(banner.texto)}</p>
        ${banner.mostrarReintentar ? '<button type="button" id="btn-reintentar" class="boton-cta">Reintentar</button>' : ''}
      </li>
    `;
    if (banner.mostrarReintentar && onReintentar) {
      document.getElementById('btn-reintentar')?.addEventListener('click', onReintentar);
    }
  }

  lista.scrollTop = lista.scrollHeight;
}

export function limpiarInput(inputEl) {
  if (inputEl) inputEl.value = '';
}

export function deshabilitarEnvio(inputEl, botonEl) {
  if (inputEl) inputEl.disabled = true;
  if (botonEl) botonEl.disabled = true;
}

export function habilitarEnvio(inputEl, botonEl) {
  if (inputEl) inputEl.disabled = false;
  if (botonEl) botonEl.disabled = false;
}


export function updateTokenUsage(usage) {
  const el = document.getElementById('token-usage');
  if (!el) return;

  el.textContent = `Tokens de sesión (simulado): ${usage.totalTokens} / ${usage.limit} — quedan ${usage.remaining}`;
  el.classList.toggle('token-usage--warning', usage.remaining <= usage.limit * 0.2);
  el.classList.toggle('token-usage--exhausted', usage.remaining === 0);
}

export function mostrarBloqueoPorCuota(inputEl, botonEl) {
  if (inputEl) inputEl.disabled = true;
  if (botonEl) botonEl.disabled = true;
}

