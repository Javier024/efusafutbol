/**
 * Muestra una notificación en la pantalla.
 * @param {string} mensaje - El mensaje a mostrar.
 * @param {string} tipo - 'success', 'error', 'warning', 'info'.
 */
function mostrarNotificacion(mensaje, tipo = 'success') {
  const notificacion = document.createElement('div');
  notificacion.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white transform transition-all duration-500 translate-x-full`;
  
  const bgColor = tipo === 'success' ? 'bg-green-500' : 
                  tipo === 'error' ? 'bg-red-500' : 
                  tipo === 'warning' ? 'bg-yellow-500' : 
                  'bg-blue-500';
  notificacion.classList.add(bgColor);
  
  notificacion.textContent = mensaje;
  document.body.appendChild(notificacion);

  // Animar entrada
  setTimeout(() => {
    notificacion.classList.remove('translate-x-full');
  }, 100);

  // Remover después de 3 segundos
  setTimeout(() => {
    notificacion.classList.add('translate-x-full');
    setTimeout(() => notificacion.remove(), 500);
  }, 3000);
}

// Exportar funciones al ámbito global para que los scripts inline puedan usarlas
window.mostrarNotificacion = mostrarNotificacion;