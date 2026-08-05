
import { router, navigateTo } from './router/router.js';

// Evita que este módulo quede inicializado más de una vez (por ejemplo si
// accidentalmente quedara un <script> duplicado, o algo dispara
// DOMContentLoaded dos veces en algún entorno raro de testing).
let appInicializada = false;

let navegando = false;            // lock contra doble-click / doble-submit en un mismo click
let ultimaRutaRenderizada = null; // dedupe: no re-renderizar si el pathname no cambió realmente

function actualizarEnlaceActivo() {
  const pathname = window.location.pathname;
  const rutaActual = pathname === '/' ? 'home' : pathname.replace(/^\//, '');

  document.querySelectorAll('.enlace-nav').forEach((link) => {
    const esActivo = link.dataset.ruta === rutaActual;
    link.classList.toggle('enlace-nav--activo', esActivo);
  });
}

function moverFocoDespuesDeNavegar(elementoAlternativo) {
  const objetivo =
    elementoAlternativo ||
    document.querySelector('#app h1') ||
    document.getElementById('app');

  if (!objetivo) return;

  if (!objetivo.hasAttribute('tabindex')) {
    objetivo.setAttribute('tabindex', '-1');
  }

  objetivo.focus({ preventScroll: !!elementoAlternativo });
}

function shouldIntercept(event, link) {
  const href = link.getAttribute('href');

  if (!href) return false;

  const esClickModificado =
    event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
  if (esClickModificado) return false;

  if (link.target && link.target !== '_self') return false;

  if (link.origin !== window.location.origin) return false;

  if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
    return false;
  }

  if (link.hasAttribute('download')) return false;

  return true;
}

// Renderiza la vista para el pathname actual, salvo que sea exactamente la
// misma ruta que la última vez que renderizamos. Esto es lo que protege
// contra doble-click en "atrás" o dos popstate seguidos: el segundo evento
// llega con el mismo pathname que el primero ya procesó, y se ignora.
function renderizarRutaActual() {
  const pathname = window.location.pathname;
  if (pathname === ultimaRutaRenderizada) return;
  ultimaRutaRenderizada = pathname;
  router();
  actualizarEnlaceActivo();
}

function manejarClickNavegacion(event) {
  const link = event.target.closest('a[data-link]');
  if (!link) return;

  if (!shouldIntercept(event, link)) return;

  const href = link.getAttribute('href');
  const destino = new URL(href, window.location.href);
  const esMismaRuta = destino.pathname === window.location.pathname;

  if (esMismaRuta && destino.hash) {
    return;
  }

  event.preventDefault();

  if (navegando) return;
  navegando = true;

  navigateTo(href); // hace history.pushState(...) y llama a router() adentro
  ultimaRutaRenderizada = window.location.pathname; // ya quedó renderizada por navigateTo
  actualizarEnlaceActivo();

  if (destino.hash) {
    requestAnimationFrame(() => {
      const elementoDestino = document.querySelector(destino.hash);
      elementoDestino?.scrollIntoView({ behavior: 'smooth' });
      moverFocoDespuesDeNavegar(elementoDestino);
    });
  } else {
    moverFocoDespuesDeNavegar();
  }

  setTimeout(() => {
    navegando = false;
  }, 300);
}

// Reacciona tanto al botón atrás/adelante del navegador como a llamadas
// programáticas a history.back()/forward()/go() — todas disparan 'popstate'
// de la misma forma, así que se cubren con el mismo handler.
function manejarPopstate() {
  renderizarRutaActual();
  moverFocoDespuesDeNavegar();
}

function inicializarApp() {
  if (appInicializada) return;
  appInicializada = true;

  document.addEventListener('click', manejarClickNavegacion);
  window.addEventListener('popstate', manejarPopstate);

  // Si la URL contiene /index.html al cargar, la limpiamos a / para no ensuciar el historial
  if (window.location.pathname.endsWith('/index.html')) {
    history.replaceState({}, '', '/');
  }

  // Primera carga: cubre tanto '/' como una ruta profunda (ej. entrar
  // directo a /chat o /about desde un link compartido o un F5).
  ultimaRutaRenderizada = window.location.pathname;
  router();
  actualizarEnlaceActivo();
  // Nota: acá NO movemos el foco — el usuario recién llegó a la página,
  // forzarle el foco le robaría el control (ej. si tenía foco en la barra de direcciones).
}

document.addEventListener('DOMContentLoaded', inicializarApp);





