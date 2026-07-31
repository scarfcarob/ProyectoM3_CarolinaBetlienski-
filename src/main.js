
import { router, navigateTo } from './router/router.js';


document.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-link]');
  
  if (link) {
    event.preventDefault();
    const url = link.getAttribute('href');
    navigateTo(url);
  }
});


window.addEventListener('popstate', () => {
  router();
});


document.addEventListener('DOMContentLoaded', () => {
    //Si la URL contiene /index.html al cargar, la limpiamos a / para no ensuciar el historial
    if (window.location.pathname.endsWith('/index.html')){
        history.replaceState({}, '', '/');
    }
    router();
});


