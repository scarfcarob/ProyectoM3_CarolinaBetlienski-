
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/utils.js', () => ({
  obtenerHoraActual: () => '10:00',
}));

vi.mock('../src/services/geminiApi.js', () => ({
  fetchGeminiAPI: vi.fn(),
}));

vi.mock('../src/services/quotaSimulator.js', () => ({
  getSessionUsage: vi.fn(),
  isSessionQuotaExceeded: vi.fn(),
  recordRealUsage: vi.fn(),
}));

vi.mock('../src/ui/render.js', () => ({
  renderMensajes: vi.fn(),
  limpiarInput: vi.fn(),
  deshabilitarEnvio: vi.fn(),
  habilitarEnvio: vi.fn(),
  updateTokenUsage: vi.fn(),
  mostrarBloqueoPorCuota: vi.fn(),
}));


import { fetchGeminiAPI } from '../src/services/geminiApi.js';
import { getSessionUsage, isSessionQuotaExceeded, recordRealUsage } from '../src/services/quotaSimulator.js';
import * as render from '../src/ui/render.js';
import { sendMessage, initChatEngine } from '../src/engine/chatEngine.js';

function setupDOM() {
  document.body.innerHTML = `
    <form class="formulario-chat">
      <input id="chat-input" />
      <button class="boton-envio" type="submit"></button>
    </form>
    <ul id="lista-mensajes"></ul>
  `;
}

const elementos = () => ({
  inputEl: document.getElementById('chat-input'),
  botonEl: document.querySelector('.boton-envio'),
});

describe('chatEngine', () => {
  beforeEach(() => {

    vi.clearAllMocks();
    isSessionQuotaExceeded.mockReturnValue(false);
    getSessionUsage.mockReturnValue({
      requestCount: 0,
      promptTokens: 0,
      candidateTokens: 0,
      totalTokens: 0,
      limit: 4000,
      remaining: 4000,
    });
    setupDOM();
  });

  it('initChatEngine renderiza el saludo inicial de Deadpool y pinta el consumo de tokens', () => {
    initChatEngine();

    expect(render.renderMensajes).toHaveBeenCalled();
    const [historial] = render.renderMensajes.mock.calls[0];
    expect(historial.at(-1).emisor).toBe('personaje');
    expect(historial.at(-1).texto).toMatch(/Deadpool/);
    expect(render.updateTokenUsage).toHaveBeenCalled();
  });

  it('sendMessage no llama a fetchGeminiAPI si la cuota ya está agotada', async () => {
    isSessionQuotaExceeded.mockReturnValue(true);

    await sendMessage('hola', elementos());

    expect(render.mostrarBloqueoPorCuota).toHaveBeenCalled();
    expect(fetchGeminiAPI).not.toHaveBeenCalled();
  });

  it('sendMessage ignora mensajes vacíos o solo espacios, sin tocar el input ni la API', async () => {
    await sendMessage('   ', elementos());

    expect(fetchGeminiAPI).not.toHaveBeenCalled();
    expect(render.limpiarInput).not.toHaveBeenCalled();
  });

  it('sendMessage: camino feliz agrega la respuesta de Gemini al historial y registra el uso real', async () => {
    const raw = {
      candidates: [{ content: { parts: [{ text: 'Chimichanga o vida.' }] } }],
      usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
    };
    fetchGeminiAPI.mockResolvedValue(raw);

    await sendMessage('hola Deadpool', elementos());

    expect(render.limpiarInput).toHaveBeenCalled();
    expect(render.deshabilitarEnvio).toHaveBeenCalled();
    expect(recordRealUsage).toHaveBeenCalledWith(raw);
    expect(render.habilitarEnvio).toHaveBeenCalled();

    const ultimaLlamada = render.renderMensajes.mock.calls.at(-1)[0];
    const ultimoMensaje = ultimaLlamada.at(-1);
    expect(ultimoMensaje.emisor).toBe('personaje');
    expect(ultimoMensaje.texto).toBe('Chimichanga o vida.');
  });

  it('sendMessage: ante un error no-429 muestra banner con reintentar y rehabilita el input', async () => {
    const err = new Error('fallo de servidor');
    err.status = 500;
    fetchGeminiAPI.mockRejectedValue(err);

    await sendMessage('hola', elementos());

    expect(render.habilitarEnvio).toHaveBeenCalled();
    const llamadaConBanner = render.renderMensajes.mock.calls.find((call) => call[1]?.banner);
    expect(llamadaConBanner[1].banner.mostrarReintentar).toBe(true);
    expect(llamadaConBanner[1].banner.texto).toMatch(/no pudo responder/i);
  });
});
