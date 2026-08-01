
import { router, navigateTo } from './router/router.js';


function actualizarEnlaceActivo() {
  const pathname = window.location.pathname;
  const rutaActual = pathname === '/' ? 'home' : pathname.replace(/^\//, '');

  document.querySelectorAll('.enlace-nav').forEach((link) => {
    const esActivo = link.dataset.ruta === rutaActual;
    link.classList.toggle('enlace-nav--activo', esActivo);
  });
}


document.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-link]');

  if (link) {
    event.preventDefault();
    const url = link.getAttribute('href');
    navigateTo(url);
    actualizarEnlaceActivo();
  }
});


window.addEventListener('popstate', () => {
  router();
  actualizarEnlaceActivo();
});


document.addEventListener('DOMContentLoaded', () => {
    //Si la URL contiene /index.html al cargar, la limpiamos a / para no ensuciar el historial
    if (window.location.pathname.endsWith('/index.html')){
        history.replaceState({}, '', '/');
    }
    router();
    actualizarEnlaceActivo();
});
