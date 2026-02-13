// Variables globales
let historial = [];
let jugadores = [];
let paginaActual = 1;
const historialPorPagina = 15;

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarHistorial();
  configurarEventListeners();
});

// Configurar event listeners
function configurarEventListeners() {
  // Búsqueda
  document.getElementById('busquedaHistorial').addEventListener('input', (e) => {
    filtrarHistorial(e.target.value);
  });
  
  // Filtros
  document.getElementById('filtroTipo').addEventListener('change', () => {
    filtrarHistorial(document.getElementById('busquedaHistorial').value);
  });
  
  document.getElementById('filtroFecha').addEventListener('change', () => {
    filtrarHistorial(document.getElementById('busquedaHistorial').value);
  });
}

// Cargar historial de actividades
async function cargarHistorial() {
  try {
    // Cargar jugadores
    const jugadoresResponse = await getJugadores();
    if (jugadoresResponse.status === 'success') {
      jugadores = jugadoresResponse.data;
    }
    
    // Cargar pagos (como parte del historial)
    const pagosResponse = await getPagos();
    if (pagosResponse.status === 'success') {
      const pagos = pagosResponse.data;
      
      // Convertir pagos a formato de historial
      const historialPagos = pagos.map(pago => {
        const jugador = jugadores.find(j => j.id === pago.id_jugador);
        return {
          id: `pago_${pago.id}`,
          tipo: 'pago',
          accion: 'Registro de pago',
          detalles: `${jugador ? `${jugador.nombre} ${jugador.apellido}` : 'Jugador desconocido'} - ${formatearMoneda(pago.monto)} - ${pago.metodo_pago}`,
          id_jugador: pago.id_jugador,
          nombre_jugador: jugador ? `${jugador.nombre} ${jugador.apellido}` : 'N/A',
          fecha: pago.fecha_pago,
          usuario: 'Sistema', // En un sistema real, sería el usuario que lo registró
          ip: 'N/A'
        };
      });
      
      // Simular otras actividades (en un sistema real, vendrían de una tabla de logs)
      const historialSimulado = generarHistorialSimulado();
      
      // Combinar y ordenar historial
      historial = [...historialPagos, ...historialSimulado].sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
      );
      
      actualizarTablaHistorial();
    }
  } catch (error) {
    console.error('Error al cargar historial:', error);
    mostrarNotificacion('Error de conexión al cargar el historial', 'error');
  }
}

// Generar historial simulado (para demostración)
function generarHistorialSimulado() {
  const actividades = [];
  
  // Actividades de jugadores
  jugadores.forEach(jugador => {
    // Creación de jugador
    actividades.push({
      id: `creacion_${jugador.id}`,
      tipo: 'jugador',
      accion: 'Creación de jugador',
      detalles: `Se registró al jugador ${jugador.nombre} ${jugador.apellido}`,
      id_jugador: jugador.id,
      nombre_jugador: `${jugador.nombre} ${jugador.apellido}`,
      fecha: jugador.fecha_inscripcion || new Date().toISOString(),
      usuario: 'Administrador',
      ip: '192.168.1.100'
    });
    
    // Actualización (simulada)
    if (Math.random() > 0.7) {
      const fechaActualizacion = new Date(jugador.fecha_inscripcion);
      fechaActualizacion.setDate(fechaActualizacion.getDate() + Math.floor(Math.random() * 30) + 1);
      
      actividades.push({
        id: `actualizacion_${jugador.id}`,
        tipo: 'jugador',
        accion: 'Actualización de datos',
        detalles: `Se actualizaron los datos de ${jugador.nombre} ${jugador.apellido}`,
        id_jugador: jugador.id,
        nombre_jugador: `${jugador.nombre} ${jugador.apellido}`,
        fecha: fechaActualizacion.toISOString(),
        usuario: 'Administrador',
        ip: '192.168.1.100'
      });
    }
  });
  
  // Actividades del sistema
  actividades.push({
    id: 'sistema_1',
    tipo: 'sistema',
    accion: 'Inicio de sesión',
    detalles: 'Administrador inició sesión en el sistema',
    id_jugador: null,
    nombre_jugador: 'N/A',
    fecha: new Date().toISOString(),
    usuario: 'Administrador',
    ip: '192.168.1.100'
  });
  
  return actividades;
}

// Filtrar historial
function filtrarHistorial(termino = '') {
  const tipoFiltro = document.getElementById('filtroTipo').value;
  const fechaFiltro = document.getElementById('filtroFecha').value;
  
  let historialFiltrado = historial.filter(actividad => {
    // Filtrar por término de búsqueda
    const coincideTermino = !termino || 
      actividad.accion.toLowerCase().includes(termino.toLowerCase()) ||
      actividad.detalles.toLowerCase().includes(termino.toLowerCase()) ||
      actividad.nombre_jugador.toLowerCase().includes(termino.toLowerCase());
    
    // Filtrar por tipo
    const coincideTipo = !tipoFiltro || actividad.tipo === tipoFiltro;
    
    // Filtrar por fecha
    let coincideFecha = true;
    if (fechaFiltro) {
      const fechaActividad = new Date(actividad.fecha).toISOString().split('T')[0];
      coincideFecha = fechaActividad === fechaFiltro;
    }
    
    return coincideTermino && coincideTipo && coincideFecha;
  });
  
  // Actualizar tabla con historial filtrado
  actualizarTablaHistorialConDatos(historialFiltrado);
}

// Actualizar tabla de historial
function actualizarTablaHistorial() {
  actualizarTablaHistorialConDatos(historial);
}

// Actualizar tabla con datos específicos
function actualizarTablaHistorialConDatos(datosHistorial) {
  const tbody = document.getElementById('tablaHistorial');
  tbody.innerHTML = '';
  
  // Calcular paginación
  const indiceInicio = (paginaActual - 1) * historialPorPagina;
  const indiceFin = indiceInicio + historialPorPagina;
  const historialPagina = datosHistorial.slice(indiceInicio, indiceFin);
  
  if (historialPagina.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">No hay actividades registradas</td></tr>';
    document.getElementById('paginacionHistorial').innerHTML = '';
    return;
  }
  
  // Generar filas
  historialPagina.forEach(actividad => {
    const fila = document.createElement('tr');
    fila.className = 'hover:bg-gray-50';
    
    // Configurar icono y color según el tipo
    let icono = 'fa-info-circle';
    let color = 'bg-gray-100 text-gray-800';
    
    switch(actividad.tipo) {
      case 'pago':
        icono = 'fa-money-bill-wave';
        color = 'bg-green-100 text-green-800';
        break;
      case 'jugador':
        icono = 'fa-user';
        color = 'bg-blue-100 text-blue-800';
        break;
      case 'sistema':
        icono = 'fa-cog';
        color = 'bg-purple-100 text-purple-800';
        break;
    }
    
    fila.innerHTML = `
      <td class="px-4 py-2 border-b">
        <div class="flex items-center">
          <i class="fas ${icono} mr-2"></i>
          <span class="px-2 py-1 text-xs rounded-full ${color}">${actividad.tipo}</span>
        </div>
      </td>
      <td class="px-4 py-2 border-b">
        <div class="font-medium">${actividad.accion}</div>
        <div class="text-sm text-gray-600">${actividad.detalles}</div>
      </td>
      <td class="px-4 py-2 border-b">${actividad.nombre_jugador}</td>
      <td class="px-4 py-2 border-b">${actividad.usuario}</td>
      <td class="px-4 py-2 border-b">
        <div class="text-sm">${formatearFecha(actividad.fecha)}</div>
        <div class="text-xs text-gray-500">${new Date(actividad.fecha).toLocaleTimeString()}</div>
      </td>
      <td class="px-4 py-2 border-b text-center">
        ${actividad.id_jugador ? `
          <button onclick="verJugadorHistorial('${actividad.id_jugador}')" class="text-blue-600 hover:text-blue-800" title="Ver jugador">
            <i class="fas fa-user"></i>
          </button>
        ` : '-'}
      </td>
    `;
    
    tbody.appendChild(fila);
  });
  
  // Actualizar paginación
  actualizarPaginacionHistorial(datosHistorial.length);
}

// Actualizar paginación
function actualizarPaginacionHistorial(totalHistorial) {
  const paginacionDiv = document.getElementById('paginacionHistorial');
  
  paginacionDiv.innerHTML = configurarPaginacion(
    totalHistorial,
    historialPorPagina,
    paginaActual,
    'cambiarPaginaHistorial'
  );
}

// Cambiar página
function cambiarPaginaHistorial(pagina) {
  const termino = document.getElementById('busquedaHistorial').value;
  const tipoFiltro = document.getElementById('filtroTipo').value;
  const fechaFiltro = document.getElementById('filtroFecha').value;
  
  let historialFiltrado = historial.filter(actividad => {
    const coincideTermino = !termino || 
      actividad.accion.toLowerCase().includes(termino.toLowerCase()) ||
      actividad.detalles.toLowerCase().includes(termino.toLowerCase()) ||
      actividad.nombre_jugador.toLowerCase().includes(termino.toLowerCase());
    
    const coincideTipo = !tipoFiltro || actividad.tipo === tipoFiltro;
    
    let coincideFecha = true;
    if (fechaFiltro) {
      const fechaActividad = new Date(actividad.fecha).toISOString().split('T')[0];
      coincideFecha = fechaActividad === fechaFiltro;
    }
    
    return coincideTermino && coincideTipo && coincideFecha;
  });
  
  const totalPaginas = Math.ceil(historialFiltrado.length / historialPorPagina);
  if (pagina >= 1 && pagina <= totalPaginas) {
    paginaActual = pagina;
    actualizarTablaHistorialConDatos(historialFiltrado);
  }
}

// Ver jugador desde el historial
async function verJugadorHistorial(idJugador) {
  try {
    const response = await getJugador(idJugador);
    if (response.status === 'success') {
      const jugador = response.data;
      
      // Redirigir a la página de jugadores con el ID del jugador
      // O mostrar un modal con los detalles
      alert(`
        Jugador: ${jugador.nombre} ${jugador.apellido}
        Documento: ${jugador.documento}
        Categoría: ${jugador.categoria || 'Sin asignar'}
        Teléfono: ${jugador.telefono || 'No registrado'}
      `);
    }
  } catch (error) {
    console.error('Error al ver jugador:', error);
    mostrarNotificacion('Error al cargar los datos del jugador', 'error');
  }
}

// Exportar historial
function exportarHistorial() {
  const termino = document.getElementById('busquedaHistorial').value;
  const tipoFiltro = document.getElementById('filtroTipo').value;
  const fechaFiltro = document.getElementById('filtroFecha').value;
  
  let historialFiltrado = historial.filter(actividad => {
    const coincideTermino = !termino || 
      actividad.accion.toLowerCase().includes(termino.toLowerCase()) ||
      actividad.detalles.toLowerCase().includes(termino.toLowerCase()) ||
      actividad.nombre_jugador.toLowerCase().includes(termino.toLowerCase());
    
    const coincideTipo = !tipoFiltro || actividad.tipo === tipoFiltro;
    
    let coincideFecha = true;
    if (fechaFiltro) {
      const fechaActividad = new Date(actividad.fecha).toISOString().split('T')[0];
      coincideFecha = fechaActividad === fechaFiltro;
    }
    
    return coincideTermino && coincideTipo && coincideFecha;
  });
  
  // Preparar datos para exportación
  const datosExportacion = historialFiltrado.map(actividad => ({
    'Fecha': formatearFecha(actividad.fecha),
    'Hora': new Date(actividad.fecha).toLocaleTimeString(),
    'Tipo': actividad.tipo,
    'Acción': actividad.accion,
    'Detalles': actividad.detalles,
    'Jugador': actividad.nombre_jugador,
    'Usuario': actividad.usuario,
    'IP': actividad.ip
  }));
  
  // Exportar a Excel
  exportarAExcel(datosExportacion, `historial_${new Date().toISOString().split('T')[0]}`);
  
  mostrarNotificacion('Historial exportado correctamente', 'success');
}

// Hacer funciones disponibles globalmente
window.verJugadorHistorial = verJugadorHistorial;
window.cambiarPaginaHistorial = cambiarPaginaHistorial;
window.exportarHistorial = exportarHistorial;