// Variables globales
let jugadores = [];
let pagos = [];
let reporteActual = null;

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarDatos();
  configurarEventListeners();
});

// Configurar event listeners
function configurarEventListeners() {
  // Cambio de tipo de reporte
  document.getElementById('tipoReporte').addEventListener('change', (e) => {
    const tipo = e.target.value;
    mostrarOpcionesReporte(tipo);
  });
  
  // Generar reporte
  document.getElementById('btnGenerarReporte').addEventListener('click', generarReporte);
  
  // Exportar reporte
  document.getElementById('btnExportarExcel').addEventListener('click', exportarReporteExcel);
  document.getElementById('btnExportarPDF').addEventListener('click', exportarReportePDF);
  document.getElementById('btnImprimir').addEventListener('click', imprimirReporte);
}

// Cargar datos necesarios
async function cargarDatos() {
  try {
    const [jugadoresResponse, pagosResponse] = await Promise.all([
      getJugadores(),
      getPagos()
    ]);
    
    if (jugadoresResponse.status === 'success') {
      jugadores = jugadoresResponse.data;
    }
    
    if (pagosResponse.status === 'success') {
      pagos = pagosResponse.data;
    }
  } catch (error) {
    console.error('Error al cargar datos:', error);
    mostrarNotificacion('Error de conexión al cargar los datos', 'error');
  }
}

// Mostrar opciones según el tipo de reporte
function mostrarOpcionesReporte(tipo) {
  const opcionesDiv = document.getElementById('opcionesReporte');
  opcionesDiv.innerHTML = '';
  
  switch(tipo) {
    case 'pagos':
      opcionesDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <input type="month" id="reporteMes" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select id="reporteCategoria" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todas las categorías</option>
            </select>
          </div>
        </div>
      `;
      
      // Llenar categorías
      const categoriasUnicas = [...new Set(jugadores.map(j => j.categoria).filter(Boolean))];
      const categoriaSelect = document.getElementById('reporteCategoria');
      categoriasUnicas.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        categoriaSelect.appendChild(option);
      });
      
      // Establecer mes actual por defecto
      const fechaActual = new Date();
      document.getElementById('reporteMes').value = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;
      break;
      
    case 'jugadores':
      opcionesDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select id="reporteEstado" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select id="reporteCategoriaJugadores" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todas las categorías</option>
            </select>
          </div>
        </div>
      `;
      
      // Llenar categorías
      const categoriasJugadores = [...new Set(jugadores.map(j => j.categoria).filter(Boolean))];
      const categoriaJugadoresSelect = document.getElementById('reporteCategoriaJugadores');
      categoriasJugadores.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        categoriaJugadoresSelect.appendChild(option);
      });
      break;
      
    case 'ingresos':
      opcionesDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input type="date" id="reporteFechaInicio" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input type="date" id="reporteFechaFin" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
        </div>
      `;
      
      // Establecer fechas por defecto (últimos 30 días)
      const fechaFin = new Date();
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - 30);
      
      document.getElementById('reporteFechaInicio').value = fechaInicio.toISOString().split('T')[0];
      document.getElementById('reporteFechaFin').value = fechaFin.toISOString().split('T')[0];
      break;
      
    case 'morosos':
      opcionesDiv.innerHTML = `
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-sm text-yellow-800">
            <i class="fas fa-info-circle mr-2"></i>
            Este reporte mostrará todos los jugadores con pagos pendientes del mes actual.
          </p>
        </div>
      `;
      break;
  }
}

// Generar reporte
function generarReporte() {
  const tipo = document.getElementById('tipoReporte').value;
  
  if (!tipo) {
    mostrarNotificacion('Por favor seleccione un tipo de reporte', 'error');
    return;
  }
  
  let datos = [];
  let titulo = '';
  let columnas = [];
  
  switch(tipo) {
    case 'pagos':
      datos = generarReportePagos();
      titulo = 'Reporte de Pagos';
      columnas = ['Fecha', 'Jugador', 'Categoría', 'Monto', 'Método', 'Referencia'];
      break;
      
    case 'jugadores':
      datos = generarReporteJugadores();
      titulo = 'Reporte de Jugadores';
      columnas = ['Documento', 'Nombre', 'Edad', 'Categoría', 'Teléfono', 'Estado'];
      break;
      
    case 'ingresos':
      datos = generarReporteIngresos();
      titulo = 'Reporte de Ingresos';
      columnas = ['Mes', 'Total Ingresos', 'Cantidad de Pagos', 'Promedio'];
      break;
      
    case 'morosos':
      datos = generarReporteMorosos();
      titulo = 'Reporte de Jugadores con Pagos Pendientes';
      columnas = ['Jugador', 'Categoría', 'Teléfono', 'Teléfono Padre', 'Meses Adeudados'];
      break;
  }
  
  // Guardar reporte actual
  reporteActual = {
    tipo: tipo,
    titulo: titulo,
    columnas: columnas,
    datos: datos,
    fecha: new Date().toLocaleString()
  };
  
  // Mostrar reporte
  mostrarReporte();
}

// Generar reporte de pagos
function generarReportePagos() {
  const mes = document.getElementById('reporteMes').value;
  const categoria = document.getElementById('reporteCategoria').value;
  
  return pagos
    .filter(pago => {
      // Filtrar por mes
      if (mes) {
        const fechaPago = new Date(pago.fecha_pago);
        const mesPago = `${fechaPago.getFullYear()}-${String(fechaPago.getMonth() + 1).padStart(2, '0')}`;
        if (mesPago !== mes) return false;
      }
      
      // Filtrar por categoría
      if (categoria) {
        const jugador = jugadores.find(j => j.id === pago.id_jugador);
        if (!jugador || jugador.categoria !== categoria) return false;
      }
      
      return true;
    })
    .map(pago => {
      const jugador = jugadores.find(j => j.id === pago.id_jugador);
      return [
        formatearFecha(pago.fecha_pago),
        jugador ? `${jugador.nombre} ${jugador.apellido}` : 'N/A',
        jugador ? jugador.categoria || 'N/A' : 'N/A',
        formatearMoneda(pago.monto),
        pago.metodo_pago,
        pago.referencia || 'N/A'
      ];
    });
}

// Generar reporte de jugadores
function generarReporteJugadores() {
  const estado = document.getElementById('reporteEstado').value;
  const categoria = document.getElementById('reporteCategoriaJugadores').value;
  
  return jugadores
    .filter(jugador => {
      // Filtrar por estado
      if (estado) {
        const activo = estado === 'activo';
        if (jugador.activo !== activo) return false;
      }
      
      // Filtrar por categoría
      if (categoria && jugador.categoria !== categoria) return false;
      
      return true;
    })
    .map(jugador => [
      jugador.documento,
      `${jugador.nombre} ${jugador.apellido}`,
      calcularEdad(jugador.fecha_nacimiento),
      jugador.categoria || 'N/A',
      jugador.telefono || 'N/A',
      jugador.activo ? 'Activo' : 'Inactivo'
    ]);
}

// Generar reporte de ingresos
function generarReporteIngresos() {
  const fechaInicio = document.getElementById('reporteFechaInicio').value;
  const fechaFin = document.getElementById('reporteFechaFin').value;
  
  // Agrupar pagos por mes
  const ingresosPorMes = {};
  
  pagos.forEach(pago => {
    const fechaPago = new Date(pago.fecha_pago);
    
    // Filtrar por rango de fechas
    if (fechaInicio && fechaPago < new Date(fechaInicio)) return;
    if (fechaFin && fechaPago > new Date(fechaFin + 'T23:59:59')) return;
    
    const clave = `${fechaPago.getFullYear()}-${String(fechaPago.getMonth() + 1).padStart(2, '0')}`;
    
    if (!ingresosPorMes[clave]) {
      ingresosPorMes[clave] = {
        total: 0,
        cantidad: 0
      };
    }
    
    ingresosPorMes[clave].total += parseFloat(pago.monto || 0);
    ingresosPorMes[clave].cantidad += 1;
  });
  
  // Convertir a array y ordenar
  return Object.entries(ingresosPorMes)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([mes, datos]) => {
      const [anio, mesNum] = mes.split('-');
      const nombreMes = new Date(anio, parseInt(mesNum) - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      const promedio = datos.cantidad > 0 ? datos.total / datos.cantidad : 0;
      
      return [
        nombreMes,
        formatearMoneda(datos.total),
        datos.cantidad,
        formatearMoneda(promedio)
      ];
    });
}

// Generar reporte de morosos
function generarReporteMorosos() {
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth();
  const anioActual = fechaActual.getFullYear();
  
  return jugadores
    .filter(jugador => {
      if (!jugador.activo) return false;
      
      // Verificar si tiene pago este mes
      const tienePagoMesActual = pagos.some(pago => {
        if (pago.id_jugador !== jugador.id) return false;
        
        const fechaPago = new Date(pago.fecha_pago);
        return fechaPago.getMonth() === mesActual && 
               fechaPago.getFullYear() === anioActual;
      });
      
      return !tienePagoMesActual;
    })
    .map(jugador => {
      // Calcular meses adeudados (simplificado)
      let mesesAdeudados = 1;
      
      return [
        `${jugador.nombre} ${jugador.apellido}`,
        jugador.categoria || 'N/A',
        jugador.telefono || 'N/A',
        jugador.telefono_padre || 'N/A',
        mesesAdeudados
      ];
    });
}

// Mostrar reporte generado
function mostrarReporte() {
  if (!reporteActual) return;
  
  const contenedor = document.getElementById('contenidoReporte');
  
  // Generar tabla HTML
  let tablaHTML = `
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-100">
          ${reporteActual.columnas.map(columna => 
            `<th class="border border-gray-300 px-4 py-2 text-left font-medium">${columna}</th>`
          ).join('')}
        </tr>
      </thead>
      <tbody>
  `;
  
  reporteActual.datos.forEach(fila => {
    tablaHTML += '<tr>';
    fila.forEach(celda => {
      tablaHTML += `<td class="border border-gray-300 px-4 py-2">${celda}</td>`;
    });
    tablaHTML += '</tr>';
  });
  
  tablaHTML += '</tbody></table>';
  
  // Actualizar contenido
  contenedor.innerHTML = tablaHTML;
  
  // Mostrar sección de reporte
  document.getElementById('seccionReporte').classList.remove('hidden');
  
  // Hacer scroll a la sección del reporte
  document.getElementById('seccionReporte').scrollIntoView({ behavior: 'smooth' });
}

// Exportar reporte a Excel
function exportarReporteExcel() {
  if (!reporteActual || reporteActual.datos.length === 0) {
    mostrarNotificacion('No hay datos para exportar', 'error');
    return;
  }
  
  // Preparar datos
  const datosExportacion = reporteActual.datos.map(fila => {
    const obj = {};
    reporteActual.columnas.forEach((columna, index) => {
      obj[columna] = fila[index];
    });
    return obj;
  });
  
  // Exportar
  exportarAExcel(datosExportacion, `${reporteActual.titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`);
  
  mostrarNotificacion('Reporte exportado a Excel correctamente', 'success');
}

// Exportar reporte a PDF
function exportarReportePDF() {
  if (!reporteActual || reporteActual.datos.length === 0) {
    mostrarNotificacion('No hay datos para exportar', 'error');
    return;
  }
  
  // Generar contenido HTML para PDF
  let contenidoHTML = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="text-align: center; margin-bottom: 20px;">${reporteActual.titulo}</h1>
      <p style="text-align: center; margin-bottom: 20px; color: #666;">Fecha: ${reporteActual.fecha}</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            ${reporteActual.columnas.map(columna => 
              `<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${columna}</th>`
            ).join('')}
          </tr>
        </thead>
        <tbody>
  `;
  
  reporteActual.datos.forEach(fila => {
    contenidoHTML += '<tr>';
    fila.forEach(celda => {
      contenidoHTML += `<td style="border: 1px solid #ddd; padding: 8px;">${celda}</td>`;
    });
    contenidoHTML += '</tr>';
  });
  
  contenidoHTML += `
        </tbody>
      </table>
      <p style="text-align: center; color: #666; font-size: 12px;">
        Generado por EFUSA - Sistema de Gestión
      </p>
    </div>
  `;
  
  // Exportar
  exportarAPDF(contenidoHTML, `${reporteActual.titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`);
  
  mostrarNotificacion('Reporte exportado a PDF correctamente', 'success');
}

// Imprimir reporte
function imprimirReporte() {
  if (!reporteActual) {
    mostrarNotificacion('No hay reporte para imprimir', 'error');
    return;
  }
  
  // Crear una ventana nueva para imprimir
  const ventanaImpresion = window.open('', '_blank');
  
  // Generar contenido HTML para impresión
  const contenidoHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${reporteActual.titulo}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .fecha { text-align: center; color: #666; margin-bottom: 20px; }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${reporteActual.titulo}</h1>
      <div class="fecha">Fecha: ${reporteActual.fecha}</div>
      ${document.getElementById('contenidoReporte').innerHTML}
    </body>
    </html>
  `;
  
  ventanaImpresion.document.write(contenidoHTML);
  ventanaImpresion.document.close();
  
  // Esperar a que se cargue el contenido y luego imprimir
  ventanaImpresion.onload = function() {
    ventanaImpresion.print();
    ventanaImpresion.close();
  };
}

// Hacer funciones disponibles globalmente
window.generarReporte = generarReporte;
window.exportarReporteExcel = exportarReporteExcel;
window.exportarReportePDF = exportarReportePDF;
window.imprimirReporte = imprimirReporte;