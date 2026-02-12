// js/pagos.js
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
      
      // Llenar select de jugadores
      const selectJugador = document.getElementById('jugador');
      selectJugador.innerHTML = '<option value="">Seleccione jugador</option>';
      
      jugadores.forEach(jugador => {
        const option = document.createElement('option');
        option.value = jugador.id;
        option.textContent = `${jugador.nombre} ${jugador.apellido}`;
        selectJugador.appendChild(option);
      });
      
      renderPagos();
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification('Error al cargar datos', 'error');
    }
  }
  
  // Renderizar pagos con paginación
  function renderPagos() {
    const tabla = document.getElementById('tablaPagos');
    if (!tabla) return;
    
    const paginatedItems = paginate(pagos, currentPage, itemsPerPage);
    
    tabla.innerHTML = '';
    
    paginatedItems.forEach(pago => {
      const jugador = jugadores.find(j => j.id === pago.id_jugador);
      const row = document.createElement('tr');
      row.className = 'border-b hover:bg-gray-50';
      
      row.innerHTML = `
        <td>${jugador ? `${jugador.nombre} ${jugador.apellido}` : 'Desconocido'}</td>
        <td>${formatDate(pago.fecha_pago)}</td>
        <td>${pago.mes_inicio} - ${pago.mes_fin}</td>
        <td>${formatCurrency(pago.monto)}</td>
        <td>${pago.tipo_pago}</td>
        <td>
          <button class="bg-blue-500 text-white px-2 py-1 rounded mr-1" onclick="editPago('${pago.id}')">
            Editar
          </button>
          <button class="bg-red-500 text-white px-2 py-1 rounded" onclick="deletePago('${pago.id}')">
            Eliminar
          </button>
        </td>
      `;
      
      tabla.appendChild(row);
    });
    
    // Crear paginación
    const totalPages = Math.ceil(pagos.length / itemsPerPage);
    createPaginationHTML(currentPage, totalPages, 'paginacionPagos', 'changePagePagos');
  }
  
  // Cambiar página de pagos
  window.changePagePagos = function(page) {
    currentPage = page;
    renderPagos();
  };
  
  // Guardar pago
  document.getElementById('formPago').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const idJugador = document.getElementById('jugador').value;
    const fechaPago = document.getElementById('fecha_pago').value;
    const mesInicio = document.getElementById('mes_inicio').value;
    const mesesPagados = parseInt(document.getElementById('meses_pagados').value);
    const tipoPago = document.getElementById('tipo_pago').value;
    
    // Calcular mes de fin
    const fecha = new Date(mesInicio);
    fecha.setMonth(fecha.getMonth() + mesesPagados - 1);
    const mesFin = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    
    // Calcular monto (ejemplo: $50.000 por mes)
    const monto = 50000 * mesesPagados;
    
    const pago = {
      id_jugador: idJugador,
      fecha_pago: fechaPago,
      mes_inicio: mesInicio,
      mes_fin: mesFin,
      monto: monto,
      tipo_pago: tipoPago
    };
    
    try {
      await window.api.savePago(pago);
      showNotification('Pago registrado correctamente');
      document.getElementById('formPago').reset();
      loadData();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      showNotification('Error al registrar pago', 'error');
    }
  });
  
  // Editar pago
  window.editPago = async function(id) {
    try {
      const pago = pagos.find(p => p.id === id);
      if (!pago) throw new Error('Pago no encontrado');
      
      document.getElementById('jugador').value = pago.id_jugador;
      document.getElementById('fecha_pago').value = pago.fecha_pago;
      document.getElementById('mes_inicio').value = pago.mes_inicio;
      
      // Calcular meses pagados
      const inicio = new Date(pago.mes_inicio);
      const fin = new Date(pago.mes_fin);
      const meses = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth()) + 1;
      document.getElementById('meses_pagados').value = meses;
      
      document.getElementById('tipo_pago').value = pago.tipo_pago;
      
      // Cambiar el comportamiento del formulario para actualizar
      const form = document.getElementById('formPago');
      form.onsubmit = async (e) => {
        e.preventDefault();
        
        const idJugador = document.getElementById('jugador').value;
        const fechaPago = document.getElementById('fecha_pago').value;
        const mesInicio = document.getElementById('mes_inicio').value;
        const mesesPagados = parseInt(document.getElementById('meses_pagados').value);
        const tipoPago = document.getElementById('tipo_pago').value;
        
        // Calcular mes de fin
        const fecha = new Date(mesInicio);
        fecha.setMonth(fecha.getMonth() + mesesPagados - 1);
        const mesFin = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        
        // Calcular monto
        const monto = 50000 * mesesPagados;
        
        const updatedPago = {
          id: id,
          id_jugador: idJugador,
          fecha_pago: fechaPago,
          mes_inicio: mesInicio,
          mes_fin: mesFin,
          monto: monto,
          tipo_pago: tipoPago
        };
        
        try {
          await window.api.savePago(updatedPago);
          showNotification('Pago actualizado correctamente');
          form.reset();
          form.onsubmit = arguments.callee.caller; // Restaurar el comportamiento original
          loadData();
        } catch (error) {
          console.error('Error al actualizar pago:', error);
          showNotification('Error al actualizar pago', 'error');
        }
      };
      
      // Scroll al formulario
      form.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error al cargar pago:', error);
      showNotification('Error al cargar pago', 'error');
    }
  };
  
  // Eliminar pago
  window.deletePago = async function(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este pago?')) return;
    
    try {
      await window.api.deletePago(id);
      showNotification('Pago eliminado correctamente');
      loadData();
    } catch (error) {
      console.error('Error al eliminar pago:', error);
      showNotification('Error al eliminar pago', 'error');
    }
  };
  
  // Cargar datos al iniciar
  loadData();
});