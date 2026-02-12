// js/utils.js
// Función para formatear fecha
function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES');
}

// Función para formatear moneda
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP'
  }).format(amount);
}

// Función para paginación
function paginate(items, currentPage, itemsPerPage) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
}

// Función para crear paginación HTML
function createPaginationHTML(currentPage, totalPages, containerId, callback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let html = '<div class="flex justify-center mt-4">';
  
  // Botón anterior
  html += `<button class="px-3 py-1 mr-2 bg-gray-200 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" 
          ${currentPage === 1 ? 'disabled' : `onclick="${callback}(${currentPage - 1})"`}>
          Anterior</button>`;
  
  // Números de página
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="px-3 py-1 mx-1 ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded" 
            onclick="${callback}(${i})">${i}</button>`;
  }
  
  // Botón siguiente
  html += `<button class="px-3 py-1 ml-2 bg-gray-200 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" 
          ${currentPage === totalPages ? 'disabled' : `onclick="${callback}(${currentPage + 1})"`}>
          Siguiente</button>`;
  
  html += '</div>';
  container.innerHTML = html;
}

// Función para exportar a Excel
function exportToExcel(data, filename) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// Función para exportar a PDF
function exportToPDF(data, filename, title) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  
  // Tabla
  let yPosition = 25;
  doc.setFontSize(10);
  
  data.forEach(item => {
    let line = '';
    Object.values(item).forEach(value => {
      line += `${value}  `;
    });
    doc.text(line, 14, yPosition);
    yPosition += 7;
    
    // Nueva página si es necesario
    if (yPosition > 280) {
      doc.addPage();
      yPosition = 15;
    }
  });
  
  doc.save(`${filename}.pdf`);
}

// Función para abrir WhatsApp
function openWhatsApp(phone, message) {
  const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  } text-white`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// Función para verificar autenticación
function checkAuth() {
  if (localStorage.getItem("auth") !== "true") {
    location.href = "login.html";
    return false;
  }
  return true;
}

// Función para cerrar sesión
function logout() {
  localStorage.removeItem("auth");
  location.href = "login.html";
}