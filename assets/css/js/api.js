// js/api.js
class API {
  constructor() {
    // URL del script de Google Apps (deberás actualizarla con tu script desplegado)
    this.baseUrl = "https://script.google.com/macros/s/AKfycbxi8pnqdpjBiMzfwv3kLFGritmgC9tg5oVMxKFugunQYtAwBZVnXnkPvEycOZYMEpAgnA/exec";
  }

  async request(action, params = {}) {
    try {
      const url = new URL(this.baseUrl);
      url.searchParams.append('action', action);
      
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Error en la solicitud');
      
      return await response.json();
    } catch (error) {
      console.error('Error en API:', error);
      throw error;
    }
  }

  // Métodos para jugadores
  async getJugadores() {
    return this.request('getJugadores');
  }

  async getJugador(id) {
    return this.request('getJugador', { id });
  }

  async saveJugador(jugador) {
    return this.request('saveJugador', jugador);
  }

  async deleteJugador(id) {
    return this.request('deleteJugador', { id });
  }

  // Métodos para pagos
  async getPagos() {
    return this.request('getPagos');
  }

  async getPagosJugador(idJugador) {
    return this.request('getPagosJugador', { idJugador });
  }

  async savePago(pago) {
    return this.request('savePago', pago);
  }

  async deletePago(id) {
    return this.request('deletePago', { id });
  }

  // Métodos para reportes
  async getReportes() {
    return this.request('getReportes');
  }
}

// Instancia global de la API
window.api = new API();