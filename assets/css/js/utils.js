// Archivo: js/utils.js

/**
 * Formatea una fecha en formato legible (DD/MM/AAAA).
 * @param {string} dateString - La fecha en formato ISO (YYYY-MM-DD).
 * @returns {string} La fecha formateada.
 */
function formatearFecha(dateString) {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}

/**
 * Calcula la edad a partir de una fecha de nacimiento.
 * @param {string} fechaNacimiento - La fecha de nacimiento en formato ISO.
 * @returns {number} La edad calculada.
 */
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return 0;
  const hoy = new Date();
  const fechaNac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mes = hoy.getMonth() - fechaNac.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }
  return edad;
}

/**
 * Muestra una notificación en la pantalla.
 * @param {string} mensaje - El mensaje a mostrar.
 * @param {string} tipo - 'success', 'error', 'warning', 'info'.
 */
function mostrarNotificacion(mensaje, tipo = 'success') {
  const notificacion = document.createElement('div');
  notificacion.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${
    tipo === 'success' ? 'bg-green-500' : 
    tipo === 'error' ? 'bg-red-500' : 
    tipo === 'warning' ? 'bg-yellow-500' : 
    'bg-blue-500'
  }`;
  notificacion.textContent = mensaje;
  
  document.body.appendChild(notificacion);
  
  setTimeout(() => {
    notificacion.style.opacity = '0';
    notificacion.style.transition = 'opacity 0.5s';
    setTimeout(() => notificacion.remove(), 500);
  }, 3000);
}

/**
 * Verifica si el usuario está autenticado.
 * @returns {boolean} - True si está autenticado, de lo contrario redirige al login.
 */
function checkAuth() {
  if (localStorage.getItem("auth") !== "true") {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

/**
 * Cierra la sesión del usuario.
 */
function logout() {
  localStorage.removeItem("auth");
  window.location.href = "login.html";
}

// Exportar funciones para que estén disponibles globalmente
window.formatearFecha = formatearFecha;
window.calcularEdad = calcularEdad;
window.mostrarNotificacion = mostrarNotificacion;
window.checkAuth = checkAuth;
window.logout = logout;
