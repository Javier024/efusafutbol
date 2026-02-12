// js/dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
  checkAuth();
  
  try {
    // Obtener datos de la API
    const jugadores = await window.api.getJugadores();
    const pagos = await window.api.getPagos();
    
    // Actualizar contadores
    document.getElementById('totalJugadores').textContent = jugadores.length;
    
    // Calcular total de pagos
    const totalPagos = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
    document.getElementById('totalPagos').textContent = formatCurrency(totalPagos);
    
    // Calcular deudores (jugadores con pagos pendientes)
    const deudores = jugadores.filter(jugador => {
      const ultimoPago = pagos
        .filter(pago => pago.id_jugador === jugador.id)
        .sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago))[0];
      
      if (!ultimoPago) return true; // Sin pagos registrados
      
      const fechaUltimoPago = new Date(ultimoPago.fecha_pago);
      const fechaActual = new Date();
      const mesesDiferencia = (fechaActual.getFullYear() - fechaUltimoPago.getFullYear()) * 12 + 
                              (fechaActual.getMonth() - fechaUltimoPago.getMonth());
      
      return mesesDiferencia > 1; // Considerar deudor si no paga en más de 1 mes
    });
    
    document.getElementById('deudores').textContent = deudores.length;
    
  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error);
    showNotification('Error al cargar datos del dashboard', 'error');
  }
});