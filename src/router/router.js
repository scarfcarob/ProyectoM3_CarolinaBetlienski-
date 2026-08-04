
import { renderHome } from '../views/home.js';
import { renderChat } from '../views/chat.js';
import { renderAbout } from '../views/about.js';
import { renderNotFound } from '../views/notFound.js';



const routes = {
  '/': renderHome,
  '/chat': renderChat,
  '/about': renderAbout,
};


export function router() {
    let path = window.location.pathname;

    if (path === '/index.html' || path === '') {
        path = '/';
    }

  //const path = window.location.pathname;
  const renderView = routes[path];

  if (renderView) {
    renderView();
  } else {
    renderNotFound();      
  }

   //* Refactoring
  // const renderView = routes[path] || renderNotFound;
  // renderView();
}

export function navigateTo(path) {
  history.pushState({}, '', path);
  router();
}

