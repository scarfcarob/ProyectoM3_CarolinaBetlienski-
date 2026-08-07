
import { obtenerHoraActual } from '../utils.js';
import { fetchGeminiAPI } from '../services/geminiApi.js'; 
import { buildPayload, normalizeAIResponse } from '../transform/chatPayload.js';

import { DEADPOOL_SYSTEM_INSTRUCTION } from '../services/prompt.js';

import { getSessionUsage, isSessionQuotaExceeded, recordRealUsage } from '../services/quotaSimulator.js';

import {
  renderMensajes, limpiarInput, deshabilitarEnvio, habilitarEnvio,
  updateTokenUsage, mostrarBloqueoPorCuota
} from '../ui/render.js';


let historialMensajes = [];
let estaEscribiendo = false;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function armarContents() {
  return historialMensajes.map((m) => ({
    role: m.emisor === 'usuario' ? 'user' : 'model',
    parts: [{ text: m.texto }]
  }));
}

async function intentarEnvio(payload) {
  const raw = await fetchGeminiAPI(payload);
  const texto = normalizeAIResponse(raw);
  if (!texto) throw new Error('Gemini devolvió una respuesta vacía');
  recordRealUsage(raw);
  return texto;
}



function bloquearSiCuotaAgotada(elementos) {
  if (isSessionQuotaExceeded()) {
    mostrarBloqueoPorCuota(elementos.inputEl, elementos.botonEl);
    renderMensajes(historialMensajes, {
      banner: { texto: 'Cuota simulada de tokens de la sesión agotada. Reiniciá la página para renovarla.', mostrarReintentar: false }
    });
    return true;
  }
  return false;
}

function mostrarErrorFinal(texto, elementos) {
  renderMensajes(historialMensajes, {
    banner: { texto, mostrarReintentar: true },
    onReintentar: () => procesarRespuesta(elementos)
  });
}

async function procesarRespuesta(elementos) {
  estaEscribiendo = true;
  deshabilitarEnvio(elementos.inputEl, elementos.botonEl);
  renderMensajes(historialMensajes, { estaEscribiendo: true });

  const payload = buildPayload(armarContents(), DEADPOOL_SYSTEM_INSTRUCTION);

  try {
    const respuesta = await intentarEnvio(payload);
    historialMensajes.push({ emisor: 'personaje', texto: respuesta, hora: obtenerHoraActual() });
    renderMensajes(historialMensajes);
    updateTokenUsage(getSessionUsage());
  } catch (err) {
    if (err.status === 429) {
      const segundos = err.retryAfterSeconds ?? 5;
      renderMensajes(historialMensajes, {
        banner: { texto: `Deadpool está saturado — reintentando en ${segundos}s...`, mostrarReintentar: false }
      });
      await wait(segundos * 1000);

      try {
        const respuesta = await intentarEnvio(payload);
        historialMensajes.push({ emisor: 'personaje', texto: respuesta, hora: obtenerHoraActual() });
        renderMensajes(historialMensajes);
        updateTokenUsage(getSessionUsage());
      } catch (retryErr) {
        console.error('Reintento tras 429 falló:', retryErr);
        mostrarErrorFinal('Deadpool sigue sin poder responder. Probá de nuevo en un rato.', elementos);
      }
    } else {
      console.error('fetchGeminiAPI falló:', err);
      const msg = err.status === 0
        ? 'Sin conexión — revisá tu internet.'
        : 'Deadpool no pudo responder (falló la conexión con la IA).';
      mostrarErrorFinal(msg, elementos);
    }
  } finally {
    estaEscribiendo = false;
    habilitarEnvio(elementos.inputEl, elementos.botonEl);
  }


  bloquearSiCuotaAgotada(elementos);
}

export async function sendMessage(textoCrudo, elementos) {
  const texto = (textoCrudo || '').trim();
  if (!texto || estaEscribiendo) return;
  if (bloquearSiCuotaAgotada(elementos)) return;

  limpiarInput(elementos.inputEl);
  historialMensajes.push({ emisor: 'usuario', texto, hora: obtenerHoraActual() });

  await procesarRespuesta(elementos);
}

const debouncedSend = debounce((texto, elementos) => sendMessage(texto, elementos), 300);

export function initChatEngine() {
  historialMensajes = [
    {
      emisor: 'personaje',
      texto: '¡Eh, vos! Sí, vos del otro lado de la pantalla. Soy Deadpool. ¿Qué contás?',
      hora: obtenerHoraActual()
    }
  ];
  estaEscribiendo = false;

  const formulario = document.querySelector('.formulario-chat');
  const inputEl = document.getElementById('chat-input');
  const botonEl = document.querySelector('.boton-envio');

  if (!formulario || !inputEl) return;

  const elementos = { inputEl, botonEl };

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    debouncedSend(inputEl.value, elementos);
  });

  renderMensajes(historialMensajes);
  updateTokenUsage(getSessionUsage());
  bloquearSiCuotaAgotada(elementos);
}
