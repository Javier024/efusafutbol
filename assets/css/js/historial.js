// js/historial.js
document.addEventListener('DOMContentLoaded', async () => {
  checkAuth();
  
  let jugadores = [];
  let pagos = [];
  
  // Referencias al DOM
  const selectJugador = document.getElementById('jugador');
  const listaPagos = document.getElementById('listaPagos');
  
  // Cargar jugadores y pagos
  async function loadData() {
    try {
      jugadores = await window.api.getJugadores();
      pagos = await window.api.getPagos();
      
      // Llenar select de jugadores
      selectJugador.innerHTML = '<option value="">Seleccionar jugador</option>';
      
      jugadores.forEach(jugador => {
        const option = document.createElement('option');
        option.value = jugador.id;
        option.textContent = `${jugador.nombre} ${jugador.apellido}`;
        selectJugador.appendChild(option);
      });
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification('Error al cargar datos', 'error');
    }
  }
  
  // Mostrar pagos del jugador seleccionado
  selectJugador.addEventListener('change', () => {
    const idJugador = selectJugador.value;
    
    if (!idJugador) {
      listaPagos.innerHTML = '<li class="text-gray-500">Selecciona un jugador para ver su historial de pagos</li>';
      return;
    }
    
    // Filtrar pagos del jugador
    const pagosJugador = pagos.filter(pago => pago.id_jugador === idJugador);
    
    // Ordenar por fecha (más reciente primero)
    pagosJugador.sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago));
    
    listaPagos.innerHTML = '';
    
    if (pagosJugador.length === 0) {
      listaPagos.innerHTML = '<li class="text-gray-500">No hay pagos registrados para este jugador</li>';
      return;
    }
    
    pagosJugador.forEach(pago => {
      const li = document.createElement('li');
      li.className = 'mb-3 p-3 border rounded hover:bg-gray-50';
      
      const fechaPago = formatDate(pago.fecha_pago);
      const monto = formatCurrency(pago.monto);
      
      li.innerHTML = `
        <div class="flex justify-between items-start">
          <div>
            <span class="font-bold">${pago.mes_inicio} a ${pago.mes_fin}</span>
            <span class="ml-2 text-sm text-gray-500">(${fechaPago})</span>
          </div>
          <div class="text-right">
            <div class="font-bold">${monto}</div>
            <div class="text-sm ${pago.tipo_pago === 'COMPLETO' ? 'text-green-600' : 'text-blue-600'}">
              ${pago.tipo_pago}
            </div>
          </div>
        </div>
      `;
      
      listaPagos.appendChild(li);
    });
  });
  
  // Cargar datos al iniciar
  loadData();
});