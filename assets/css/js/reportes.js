// js/reportes.js
document.addEventListener('DOMContentLoaded', async () => {
  checkAuth();
  
  let jugadores = [];
  let pagos = [];
  let categoriaSeleccionada = 'todas';
  
  // Cargar jugadores y pagos
  async function loadData() {
    try {
      jugadores = await window.api.getJugadores();
      pagos = await window.api.getPagos();
      
      // Llenar select de categorías
      const selectCategoria = document.getElementById('categoria');
      if (selectCategoria) {
        selectCategoria.innerHTML = '<option value="todas">Todas las categorías</option>';
        
        // Obtener categorías únicas
        const categorias = [...new Set(jugadores.map(j => j.categoria))];
        categorias.forEach(categoria => {
          const option = document.createElement('option');
          option.value = categoria;
          option.textContent = categoria;
          selectCategoria.appendChild(option);
        });
        
        // Evento de cambio de categoría
        selectCategoria.addEventListener('change', (e) => {
          categoriaSeleccionada = e.target.value;
        });
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification('Error al cargar datos', 'error');
    }
  }
  
  // Filtrar datos por categoría
  function filterByCategoria() {
    if (categoriaSeleccionada === 'todas') {
      return { jugadores, pagos };
    }
    
    const jugadoresFiltrados = jugadores.filter(j => j.categoria === categoriaSeleccionada);
    const idsJugadores = jugadoresFiltrados.map(j => j.id);
    const pagosFiltrados = pagos.filter(p => idsJugadores.includes(p.id_jugador));
    
    return { jugadores: jugadoresFiltrados, pagos: pagosFiltrados };
  }
  
  // Exportar a Excel
  window.exportarExcel = function() {
    const { jugadores: jugadoresFiltrados, pagos: pagosFiltrados } = filterByCategoria();
    
    // Preparar datos de jugadores
    const jugadoresData = jugadoresFiltrados.map(jugador => ({
      'ID': jugador.id,
      'Nombre': jugador.nombre,
      'Apellido': jugador.apellido,
      'Categoría': jugador.categoria,
      'Identificación': jugador.identificacion,
      'Fecha de Nacimiento': jugador.fecha_nacimiento,
      'Tipo de Sangre': jugador.tipo_sangre,
      'Acudiente': jugador.acudiente,
      'Teléfono Acudiente': jugador.telefono_acudiente,
      'Estado': jugador.activo ? 'Activo' : 'Inactivo'
    }));
    
    // Preparar datos de pagos
    const pagosData = pagosFiltrados.map(pago => {
      const jugador = jugadores.find(j => j.id === pago.id_jugador);
      return {
        'ID Pago': pago.id,
        'Jugador': jugador ? `${jugador.nombre} ${jugador.apellido}` : 'Desconocido',
        'Fecha de Pago': pago.fecha_pago,
        'Mes Inicio': pago.mes_inicio,
        'Mes Fin': pago.mes_fin,
        'Monto': pago.monto,
        'Tipo de Pago': pago.tipo_pago
      };
    });
    
    // Crear libro de Excel con dos hojas
    const wb = XLSX.utils.book_new();
    
    // Hoja de jugadores
    const wsJugadores = XLSX.utils.json_to_sheet(jugadoresData);
    XLSX.utils.book_append_sheet(wb, wsJugadores, "Jugadores");
    
    // Hoja de pagos
    const wsPagos = XLSX.utils.json_to_sheet(pagosData);
    XLSX.utils.book_append_sheet(wb, wsPagos, "Pagos");
    
    // Descargar archivo
    const filename = categoriaSeleccionada === 'todas' 
      ? `reporte_efusa_${formatDate(new Date()).replace(/\//g, '-')}` 
      : `reporte_${categoriaSeleccionada}_${formatDate(new Date()).replace(/\//g, '-')}`;
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
    showNotification('Reporte Excel descargado correctamente');
  };
  
  // Exportar a PDF
  window.exportarPDF = function() {
    const { jugadores: jugadoresFiltrados, pagos: pagosFiltrados } = filterByCategoria();
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    const title = categoriaSeleccionada === 'todas' 
      ? 'Reporte General EFUSA' 
      : `Reporte de Categoría: ${categoriaSeleccionada}`;
    
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha: ${formatDate(new Date())}`, 14, 22);
    
    // Resumen
    let yPosition = 35;
    doc.setFontSize(12);
    doc.text('Resumen', 14, yPosition);
    yPosition += 7;
    
    doc.setFontSize(10);
    doc.text(`Total de Jugadores: ${jugadoresFiltrados.length}`, 14, yPosition);
    yPosition += 5;
    
    const totalPagos = pagosFiltrados.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
    doc.text(`Total de Pagos: ${formatCurrency(totalPagos)}`, 14, yPosition);
    yPosition += 5;
    
    // Lista de jugadores
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Lista de Jugadores', 14, yPosition);
    yPosition += 7;
    
    doc.setFontSize(10);
    jugadoresFiltrados.forEach(jugador => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 15;
      }
      
      doc.text(`${jugador.nombre} ${jugador.apellido} - ${jugador.categoria}`, 14, yPosition);
      yPosition += 5;
    });
    
    // Descargar archivo
    const filename = categoriaSeleccionada === 'todas' 
      ? `reporte_efusa_${formatDate(new Date()).replace(/\//g, '-')}` 
      : `reporte_${categoriaSeleccionada}_${formatDate(new Date()).replace(/\//g, '-')}`;
    
    doc.save(`${filename}.pdf`);
    showNotification('Reporte PDF descargado correctamente');
  };
  
  // Cargar datos al iniciar
  loadData();
});