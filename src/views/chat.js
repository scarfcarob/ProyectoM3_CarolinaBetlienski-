
import { obtenerHoraActual } from '../utils.js';
import { fetchMensajes } from '../services/mensajesService.js';

// --- ESTADO EN MEMORIA ---
const historialMensajes = [
  {
    emisor: 'personaje',
    texto: '¡Eh, vos! Sí, vos del otro lado de la pantalla. Soy Deadpool y hoy ya tengo routing, mirá vos.',
    hora: '21:58'
  }
];

let estaEscribiendo = false;
let estaCargando = false;
let hayError = false;

// --- CONTROL DE CARGA (evita duplicar mensajes al re-entrar a /chat) ---
let mensajesCargados = false;   // true una vez que el fetch inicial tuvo éxito alguna vez
let cargaEnCursoPromise = null; // dedupe: si ya hay un fetch en vuelo, lo reusamos en vez de duplicarlo
let idCargaActual = 0;          // descarta respuestas tardías de una navegación que ya quedó vieja

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// --- CARGA INICIAL DESDE LA API (estados loading/success/error) ---
async function cargarMensajesIniciales() {
  // Si ya se cargaron mensajes con éxito antes en esta sesión, no volvemos a
  // pedirle a la API cada vez que se re-entra a /chat: evita duplicar mensajes
  // en historialMensajes cada vez que el usuario navega afuera y vuelve.
  if (mensajesCargados) {
    renderizarMensajes();
    return;
  }

  // Si ya hay una carga en curso (por ejemplo: el usuario salió de /chat y
  // volvió rápido, antes de que la primera petición terminara), reusamos esa
  // misma promesa en vez de disparar un segundo fetch en paralelo.
  if (cargaEnCursoPromise) {
    await cargaEnCursoPromise;
    renderizarMensajes();
    return;
  }

  const miId = ++idCargaActual;
  estaCargando = true;
  hayError = false;
  renderizarMensajes();

  cargaEnCursoPromise = fetchMensajes();

  try {
    const mensajesRemotos = await cargaEnCursoPromise;

    // Si mientras esperábamos la respuesta el usuario volvió a entrar a /chat
    // (doble-click en "atrás", history.back() disparado dos veces, etc.),
    // idCargaActual ya avanzó y miId quedó obsoleto: descartamos este resultado
    // para no pisar un estado más nuevo con uno viejo.
    if (miId !== idCargaActual) return;

    if (Array.isArray(mensajesRemotos)) {
      historialMensajes.push(...mensajesRemotos);
    }
    mensajesCargados = true;
  } catch (err) {
    if (miId !== idCargaActual) return;
    console.error('cargarMensajesIniciales falló:', err);
    hayError = true;
  } finally {
    cargaEnCursoPromise = null;
    if (miId === idCargaActual) {
      estaCargando = false;
      renderizarMensajes();
    }
  }
}

function renderizarMensajes() {
  const lista = document.getElementById('lista-mensajes');
  if (!lista) return;

  // --- ESTADO: ERROR ---
  if (hayError) {
    lista.innerHTML = `
      <li class="estado-error">
        <p>No se pudieron cargar los mensajes.</p>
        <button type="button" id="btn-reintentar" class="boton-cta">Reintentar</button>
      </li>
    `;
    document.getElementById('btn-reintentar')
      ?.addEventListener('click', cargarMensajesIniciales);
    return;
  }

  // --- ESTADO: LOADING ---
  if (estaCargando) {
    lista.innerHTML = `
      <li class="estado-loading">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </li>
    `;
    return;
  }

  // --- ESTADO: SUCCESS ---
  lista.innerHTML = historialMensajes.map(msg => `
    <li class="mensaje mensaje--${msg.emisor}">
      <p class="mensaje-texto">${escapeHTML(msg.texto)}</p>
      <time class="mensaje-time">${msg.hora}</time>
    </li>
  `).join('');

  if (estaEscribiendo) {
    lista.innerHTML += `
      <li class="mensaje mensaje--personaje mensaje--typing" id="indicador-typing">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </li>
    `;
  }

  lista.scrollTop = lista.scrollHeight;
}

function inicializarEventosChat() {
  const formulario = document.querySelector('.formulario-chat');
  const input = document.getElementById('chat-input');

  if (!formulario || !input) return;

  // Dispara la carga inicial (loading -> success | error)
  cargarMensajesIniciales();

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const texto = input.value.trim();
    if (!texto || estaEscribiendo || estaCargando) return;

    historialMensajes.push({
      emisor: 'usuario',
      texto: texto,
      hora: obtenerHoraActual()
    });

    input.value = '';
    renderizarMensajes();

    estaEscribiendo = true;
    renderizarMensajes();

    setTimeout(() => {
      estaEscribiendo = false;
      historialMensajes.push({
        emisor: 'personaje',
        texto: '¡Mensaje recibido! Saludos desde la vista de chat.',
        hora: obtenerHoraActual()
      });
      renderizarMensajes();
    }, 1500);
  });
}

// FUNCIÓN PRINCIPAL QUE CONSUME EL ROUTER
export function renderChat() {
  const app = document.getElementById('app');
  if (!app) return;

  // 1. Inyectar HTML en el contenedor principal
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

  // 2. Vincular listeners y estado una vez montado en el DOM
  inicializarEventosChat();
}


