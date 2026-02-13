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
 * Configura el HTML para la paginación.
 * @param {number} totalItems - Número total de items.
 * @param {number} itemsPorPagina - Items a mostrar por página.
 * @param {number} paginaActual - Página actual.
 * @param {string} nombreFuncionCallback - Nombre de la función a la que se llamará al cambiar de página.
 * @returns {string} El HTML de la paginación.
 */
function configurarPaginacion(totalItems, itemsPorPagina, paginaActual, nombreFuncionCallback) {
  const totalPaginas = Math.ceil(totalItems / itemsPorPagina);
  if (totalPaginas <= 1) return '';

  let html = '<div class="flex justify-center items-center space-x-2 mt-4">';
  
  // Botón Anterior
  html += `<button onclick="${nombreFuncionCallback}(${paginaActual - 1})" class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 ${paginaActual === 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${paginaActual === 1 ? 'disabled' : ''}>Anterior</button>`;
  
  // Números de página
  for (let i = 1; i <= totalPaginas; i++) {
    html += `<button onclick="${nombreFuncionCallback}(${i})" class="px-3 py-1 rounded ${i === paginaActual ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}">${i}</button>`;
  }
  
  // Botón Siguiente
  html += `<button onclick="${nombreFuncionCallback}(${paginaActual + 1})" class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 ${paginaActual === totalPaginas ? 'opacity-50 cursor-not-allowed' : ''}" ${paginaActual === totalPaginas ? 'disabled' : ''}>Siguiente</button>`;
  
  html += '</div>';
  return html;
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
window.configurarPaginacion = configurarPaginacion;
window.checkAuth = checkAuth;
window.logout = logout;