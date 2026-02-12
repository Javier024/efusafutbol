// js/alertas.js
document.addEventListener('DOMContentLoaded', async () => {
  checkAuth();
  
  let jugadores = [];
  let pagos = [];
  let currentPage = 1;
  const itemsPerPage = 10;
  
  // Cargar jugadores y pagos
  async function loadData() {
    try {
      jugadores = await window.api.getJugadores();
      pagos = await window.api.getPagos();
      
      renderAlertas();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification('Error al cargar datos', 'error');
    }
  }
  
  // Renderizar alertas con paginación
  function renderAlertas() {
    const tabla = document.getElementById('tablaAlertas');
    
    // Identificar jugadores con pagos pendientes
    const alertas = [];
    const fechaActual = new Date();
    
    jugadores.forEach(jugador => {
      // Obtener el último pago del jugador
      const pagosJugador = pagos.filter(pago => pago.id_jugador === jugador.id);
      if (pagosJugador.length === 0) {
        // No tiene pagos registrados
        alertas.push({
          jugador: jugador,
          estado: 'Sin pagos',
          proximoPago: 'Inmediato',
          telefono: jugador.telefono_acudiente
        });
      } else {
        // Ordenar pagos por fecha
        pagosJugador.sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago));
        const ultimoPago = pagosJugador[0];
        
        // Calcular fecha del próximo pago
        const fechaUltimoPago = new Date(ultimoPago.fecha_pago);
        const fechaProximoPago = new Date(fechaUltimoPago);
        fechaProximoPago.setMonth(fechaProximoPago.getMonth() + 1);
        
        // Verificar si está atrasado
        const diasAtraso = Math.floor((fechaActual - fechaProximoPago) / (1000 * 60 * 60 * 24));
        
        if (diasAtraso > 0) {
          let estado = 'Atrasado';
          if (diasAtraso > 30) estado = 'Muy atrasado';
          else if (diasAtraso > 7) estado = 'Atrasado';
          
          alertas.push({
            jugador: jugador,
            estado: estado,
            proximoPago: formatDate(fechaProximoPago),
            telefono: jugador.telefono_acudiente
          });
        }
      }
    });
    
    // Ordenar alertas por estado
    alertas.sort((a, b) => {
      const estadoOrder = { 'Muy atrasado': 0, 'Atrasado': 1, 'Sin pagos': 2 };
      return estadoOrder[a.estado] - estadoOrder[b.estado];
    });
    
    // Aplicar paginación
    const paginatedItems = paginate(alertas, currentPage, itemsPerPage);
    
    tabla.innerHTML = '';
    
    paginatedItems.forEach(alerta => {
      const row = document.createElement('tr');
      row.className = 'border-b hover:bg-gray-50';
      
      // Determinar clase según estado
      let estadoClass = 'text-gray-600';
      if (alerta.estado === 'Muy atrasado') estadoClass = 'text-red-600 font-bold';
      else if (alerta.estado === 'Atrasado') estadoClass = 'text-orange-600';
      else if (alerta.estado === 'Sin pagos') estadoClass = 'text-blue-600';
      
      row.innerHTML = `
        <td>${alerta.jugador.nombre} ${alerta.jugador.apellido}</td>
        <td class="${estadoClass}">${alerta.estado}</td>
        <td>${alerta.proximoPago}</td>
        <td>
          <button class="bg-green-500 text-white px-2 py-1 rounded" 
                  onclick="sendWhatsApp('${alerta.telefono}', '${alerta.jugador.nombre} ${alerta.jugador.apellido}', '${alerta.estado}')">
            WhatsApp
          </button>
        </td>
      `;
      
      tabla.appendChild(row);
    });
    
    // Crear paginación
    const totalPages = Math.ceil(alertas.length / itemsPerPage);
    createPaginationHTML(currentPage, totalPages, 'paginacionAlertas', 'changePageAlertas');
  }
  
  // Cambiar página de alertas
  window.changePageAlertas = function(page) {
    currentPage = page;
    renderAlertas();
  };
  
  // Enviar mensaje por WhatsApp
  window.sendWhatsApp = function(telefono, nombreJugador, estado) {
    let mensaje = `Hola, soy el administrador de EFUSA. Te escribo para recordarte sobre el pago de la cuota de ${nombreJugador}.`;
    
    if (estado === 'Muy atrasado') {
      mensaje += ` El pago está muy atrasado. Por favor, regulariza la situación lo antes posible.`;
    } else if (estado === 'Atrasado') {
      mensaje += ` El pago está atrasado. Por favor, realiza el pago a la brevedad.`;
    } else {
      mensaje += ` Aún no tienes pagos registrados. Por favor, realiza el pago correspondiente.`;
    }
    
    mensaje += ` Gracias por tu comprensión.`;
    
    openWhatsApp(telefono, mensaje);
  };
  
  // Cargar datos al iniciar
  loadData();
});