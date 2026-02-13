// Archivo: js/dashboard.js

// Función para cargar el resumen del dashboard
async function cargarResumenDashboard() {
  // Simulación de datos para el dashboard
  // En el futuro, esto podría venir de tu API
  const resumen = {
    totalJugadores: 150,
    totalPagos: 3500000, // Valor en pesos
    deudores: 8
  };

  // Actualizar las tarjetas del dashboard con los datos
  // Usamos IDs que coinciden con el HTML
  const totalJugadoresEl = document.getElementById('totalJugadores');
  const totalPagosEl = document.getElementById('totalPagos');
  const deudoresEl = document.getElementById('deudores');

  if (totalJugadoresEl) totalJugadoresEl.textContent = resumen.totalJugadores;
  if (totalPagosEl) totalPagosEl.textContent = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(resumen.totalPagos);
  if (deudoresEl) deudoresEl.textContent = resumen.deudores;
}

// Cargar los datos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // La verificación de autenticación ya se hace en el HTML, pero es bueno tenerla aquí también
  checkAuth();
  cargarResumenDashboard();
  console.log("Dashboard cargado.");
});