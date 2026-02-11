const API_URL = "https://script.google.com/macros/s/AKfycbxi8pnqdpjBiMzfwv3kLFGritmgC9tg5oVMxKFugunQYtAwBZVnXnkPvEycOZYMEpAgnA/exec";

let datosPagos = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch(`${API_URL}?action=getPagos`)
    .then(res => res.json())
    .then(data => datosPagos = data)
    .catch(err => console.error("Error cargando reportes:", err));
});

function exportarExcel() {
  if(datosPagos.length === 0) { alert("No hay datos para exportar"); return; }
  const ws = XLSX.utils.json_to_sheet(datosPagos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pagos");
  XLSX.writeFile(wb, "reporte_pagos_efusa.xlsx");
}

function exportarPDF() {
  if(datosPagos.length === 0) { alert("No hay datos para exportar"); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Reporte de Pagos - EFUSA", 10, 10);

  let y = 20;
  datosPagos.forEach(p => {
    doc.text(
      `${p.nombre_jugador} | ${p.mes_inicio} - ${p.mes_fin} | $${p.total_pagado}`,
      10,
      y
    );
    y += 8;
  });

  doc.save("reporte_pagos_efusa.pdf");
}