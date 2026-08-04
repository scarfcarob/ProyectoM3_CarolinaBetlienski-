
import { router, navigateTo } from './router/router.js';

let navegando = false;

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

  navigateTo(href); 
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

document.addEventListener('click', manejarClickNavegacion);

window.addEventListener('popstate', () => {
  router();
  actualizarEnlaceActivo();
  moverFocoDespuesDeNavegar();
});

document.addEventListener('DOMContentLoaded', () => {
  
  if (window.location.pathname.endsWith('/index.html')) {
    history.replaceState({}, '', '/');
  }
  router();
  actualizarEnlaceActivo();

});





