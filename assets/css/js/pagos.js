// Variables globales
let pagos = [];
let jugadores = [];
let paginaActual = 1;
const pagosPorPagina = 10;

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarDatos();
  configurarEventListeners();
});

// Configurar event listeners
function configurarEventListeners() {
  // Búsqueda
  document.getElementById('busquedaPago').addEventListener('input', (e) => {
    filtrarPagos(e.target.value);
  });
  
  // Filtro por mes
  document.getElementById('filtroMes').addEventListener('change', () => {
    filtrarPagos(document.getElementById('busquedaPago').value);
  });
  
  // Formulario de pago
  document.getElementById('formPago').addEventListener('submit', guardarPago);
}

// Cargar todos los datos necesarios
async function cargarDatos() {
  try {
    // Cargar jugadores para el select
    const jugadoresResponse = await getJugadores();
    if (jugadoresResponse.status === 'success') {
      jugadores = jugadoresResponse.data;
      actualizarSelectJugadores();
    }
    
    // Cargar pagos
    const pagosResponse = await getPagos();
    if (pagosResponse.status === 'success') {
      pagos = pagosResponse.data;
      actualizarTablaPagos();
    }
  } catch (error) {
    console.error('Error al cargar datos:', error);
    mostrarNotificacion('Error de conexión al cargar los datos', 'error');
  }
}

// Actualizar select de jugadores
function actualizarSelectJugadores() {
  const select = document.getElementById('jugadorPago');
  select.innerHTML = '<option value="">Seleccionar jugador</option>';
  
  jugadores.filter(j => j.activo).forEach(jugador => {
    const option = document.createElement('option');
    option.value = jugador.id;
    option.textContent = `${jugador.nombre} ${jugador.apellido} - ${jugador.categoria || 'Sin categoría'}`;
    select.appendChild(option);
  });
}

// Filtrar pagos
function filtrarPagos(termino = '') {
  const mesFiltro = document.getElementById('filtroMes').value;
  
  let pagosFiltrados = pagos.filter(pago => {
    // Buscar por nombre de jugador
    const jugador = jugadores.find(j => j.id === pago.id_jugador);
    const nombreJugador = jugador ? `${jugador.nombre} ${jugador.apellido}`.toLowerCase() : '';
    
    const coincideTermino = !termino || 
      nombreJugador.includes(termino.toLowerCase()) ||
      pago.metodo_pago.toLowerCase().includes(termino.toLowerCase()) ||
      pago.referencia.toLowerCase().includes(termino.toLowerCase());
    
    // Filtrar por mes
    let coincideMes = true;
    if (mesFiltro) {
      const fechaPago = new Date(pago.fecha_pago);
      const mesPago = `${fechaPago.getFullYear()}-${String(fechaPago.getMonth() + 1).padStart(2, '0')}`;
      coincideMes = mesPago === mesFiltro;
    }
    
    return coincideTermino && coincideMes;
  });
  
  // Actualizar tabla con pagos filtrados
  actualizarTablaPagosConDatos(pagosFiltrados);
}

// Actualizar tabla de pagos
function actualizarTablaPagos() {
  actualizarTablaPagosConDatos(pagos);
}

// Actualizar tabla con datos específicos
function actualizarTablaPagosConDatos(datosPagos) {
  const tbody = document.getElementById('tablaPagos');
  tbody.innerHTML = '';
  
  // Calcular paginación
  const indiceInicio = (paginaActual - 1) * pagosPorPagina;
  const indiceFin = indiceInicio + pagosPorPagina;
  const pagosPagina = datosPagos.slice(indiceInicio, indiceFin);
  
  if (pagosPagina.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-500">No hay pagos registrados</td></tr>';
    document.getElementById('paginacionPagos').innerHTML = '';
    return;
  }
  
  // Generar filas
  pagosPagina.forEach(pago => {
    const jugador = jugadores.find(j => j.id === pago.id_jugador);
    const fila = document.createElement('tr');
    fila.className = 'hover:bg-gray-50';
    
    fila.innerHTML = `
      <td class="px-4 py-2 border-b">${formatearFecha(pago.fecha_pago)}</td>
      <td class="px-4 py-2 border-b">
        ${jugador ? `${jugador.nombre} ${jugador.apellido}` : 'Jugador no encontrado'}
      </td>
      <td class="px-4 py-2 border-b">${jugador ? jugador.categoria || 'N/A' : 'N/A'}</td>
      <td class="px-4 py-2 border-b">${formatearMoneda(pago.monto)}</td>
      <td class="px-4 py-2 border-b">
        <span class="px-2 py-1 text-xs rounded-full ${getMetodoPagoClass(pago.metodo_pago)}">
          ${pago.metodo_pago}
        </span>
      </td>
      <td class="px-4 py-2 border-b">${pago.referencia || 'N/A'}</td>
      <td class="px-4 py-2 border-b">
        <button onclick="eliminarPago('${pago.id}')" class="text-red-600 hover:text-red-800" title="Eliminar pago">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    tbody.appendChild(fila);
  });
  
  // Actualizar paginación
  actualizarPaginacionPagos(datosPagos.length);
}

// Obtener clase CSS para método de pago
function getMetodoPagoClass(metodo) {
  switch(metodo.toLowerCase()) {
    case 'efectivo': return 'bg-green-100 text-green-800';
    case 'transferencia': return 'bg-blue-100 text-blue-800';
    case 'nequi': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Actualizar paginación
function actualizarPaginacionPagos(totalPagos) {
  const paginacionDiv = document.getElementById('paginacionPagos');
  
  paginacionDiv.innerHTML = configurarPaginacion(
    totalPagos,
    pagosPorPagina,
    paginaActual,
    'cambiarPaginaPagos'
  );
}

// Cambiar página
function cambiarPaginaPagos(pagina) {
  const termino = document.getElementById('busquedaPago').value;
  const mesFiltro = document.getElementById('filtroMes').value;
  
  let pagosFiltrados = pagos.filter(pago => {
    const jugador = jugadores.find(j => j.id === pago.id_jugador);
    const nombreJugador = jugador ? `${jugador.nombre} ${jugador.apellido}`.toLowerCase() : '';
    
    const coincideTermino = !termino || nombreJugador.includes(termino.toLowerCase());
    
    let coincideMes = true;
    if (mesFiltro) {
      const fechaPago = new Date(pago.fecha_pago);
      const mesPago = `${fechaPago.getFullYear()}-${String(fechaPago.getMonth() + 1).padStart(2, '0')}`;
      coincideMes = mesPago === mesFiltro;
    }
    
    return coincideTermino && coincideMes;
  });
  
  const totalPaginas = Math.ceil(pagosFiltrados.length / pagosPorPagina);
  if (pagina >= 1 && pagina <= totalPaginas) {
    paginaActual = pagina;
    actualizarTablaPagosConDatos(pagosFiltrados);
  }
}

// Guardar pago
async function guardarPago(e) {
  e.preventDefault();
  
  const idJugador = document.getElementById('jugadorPago').value;
  const monto = document.getElementById('monto').value;
  const metodoPago = document.getElementById('metodoPago').value;
  const referencia = document.getElementById('referencia').value;
  const fechaPago = document.getElementById('fechaPago').value;
  
  if (!idJugador || !monto || !metodoPago || !fechaPago) {
    mostrarNotificacion('Por favor complete todos los campos obligatorios', 'error');
    return;
  }
  
  const pago = {
    id_jugador: idJugador,
    monto: parseFloat(monto),
    metodo_pago: metodoPago,
    referencia: referencia,
    fecha_pago: fechaPago
  };
  
  try {
    const response = await savePago(pago);
    if (response.status === 'success') {
      mostrarNotificacion('Pago registrado correctamente', 'success');
      
      // Cerrar modal y recargar datos
      cerrarModalPago();
      cargarDatos();
    } else {
      mostrarNotificacion('Error al registrar pago: ' + response.message, 'error');
    }
  } catch (error) {
    console.error('Error al guardar pago:', error);
    mostrarNotificacion('Error de conexión al registrar el pago', 'error');
  }
}

// Eliminar pago
async function eliminarPago(id) {
  if (!confirm('¿Está seguro de que desea eliminar este pago? Esta acción no se puede deshacer.')) {
    return;
  }
  
  try {
    const response = await deletePago(id);
    if (response.status === 'success') {
      mostrarNotificacion('Pago eliminado correctamente', 'success');
      cargarDatos(); // Recargar la tabla
    } else {
      mostrarNotificacion('Error al eliminar pago: ' + response.message, 'error');
    }
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    mostrarNotificacion('Error de conexión al eliminar el pago', 'error');
  }
}

// Abrir modal para nuevo pago
function nuevoPago() {
  // Limpiar formulario
  document.getElementById('formPago').reset();
  
  // Establecer fecha actual por defecto
  document.getElementById('fechaPago').value = new Date().toISOString().split('T')[0];
  
  // Mostrar modal
  document.getElementById('modalPago').classList.remove('hidden');
}

// Cerrar modal de pago
function cerrarModalPago() {
  document.getElementById('modalPago').classList.add('hidden');
}

// Hacer funciones disponibles globalmente
window.eliminarPago = eliminarPago;
window.guardarPago = guardarPago;
window.nuevoPago = nuevoPago;
window.cerrarModalPago = cerrarModalPago;
window.cambiarPaginaPagos = cambiarPaginaPagos;