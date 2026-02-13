// js/api.js
class API {
  constructor() {
    // URL del script de Google Apps (actualizada con tu enlace)
    this.baseUrl = "https://script.google.com/macros/s/AKfycbxzFZkz7dWuUQlY4Df4ky8XIaPjpK3fFVlR96aTSRe8BbqK3X60LD6QWTtGKP4XFu-BlA/exec";
  }

  async request(action, params = {}) {
    try {
      const url = new URL(this.baseUrl);
      url.searchParams.append('action', action);
      
      // Los datos complejos (objetos) se deben enviar como string JSON
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (typeof params[key] === 'object') {
          queryParams.append(key, JSON.stringify(params[key]));
        } else {
          queryParams.append(key, params[key]);
        }
      });
      
      // Unimos los parámetros de la acción y los datos
      const finalUrl = `${url.toString()}&${queryParams.toString()}`;

      const response = await fetch(finalUrl);
      if (!response.ok) throw new Error('Error en la solicitud');
      
      return await response.json();
    } catch (error) {
      console.error('Error en API:', error);
      // Devolvemos un error consistente para que el frontend lo maneje
      return { status: 'error', message: error.message };
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
    // El método saveJugador ahora enviará el objeto completo
    return this.request('saveJugador', { data: jugador });
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
    return this.request('savePago', { data: pago });
  }

  async deletePago(id) {
    return this.request('deletePago', { id });
  }

  // Métodos para reportes
  async getReportes() {
    return this.request('getReportes');
  }
}

// Instancia global de la API para que sea accesible desde cualquier parte de la aplicación
window.api = new API();