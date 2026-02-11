const API_URL = "https://script.google.com/macros/s/AKfycbxi8pnqdpjBiMzfwv3kLFGritmgC9tg5oVMxKFugunQYtAwBZVnXnkPvEycOZYMEpAgnA/exec";
const VALOR_MENSUAL = 50000;

document.addEventListener("DOMContentLoaded", () => {
  cargarJugadores();
  document.getElementById("formPago").addEventListener("submit", registrarPago);
});

function cargarJugadores() {
  fetch(`${API_URL}?action=getJugadores`)
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("jugador");
      select.innerHTML = `<option value="">Seleccione jugador</option>`;
      data.forEach(j => {
        select.innerHTML += `<option value="${j.id}">${j.nombre} ${j.apellido}</option>`;
      });
    });
}

function registrarPago(e) {
  e.preventDefault();

  const fechaPago = new Date(fecha_pago.value);
  const mesInicio = new Date(mes_inicio.value + "-01");
  const meses = parseInt(meses_pagados.value);

  const mesFin = new Date(mesInicio);
  mesFin.setMonth(mesFin.getMonth() + meses - 1);

  const proximaFecha = new Date(mesFin);
  proximaFecha.setMonth(proximaFecha.getMonth() + 1);
  proximaFecha.setDate(1);

  const pago = {
    action: "addPago",
    id_jugador: jugador.value,
    nombre_jugador: jugador.options[jugador.selectedIndex].text,
    fecha_pago: fecha_pago.value,
    mes_inicio: mes_inicio.value,
    mes_fin: mesFin.toISOString().slice(0, 7),
    meses_pagados: meses,
    total_pagado: meses * VALOR_MENSUAL,
    tipo_pago: tipo_pago.value,
    proxima_fecha: proximaFecha.toISOString().slice(0, 10),
    estado: tipo_pago.value === "ABONO" ? "ABONO" : "PAGADO"
  };

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(pago)
  }).then(() => {
    e.target.reset();
    alert("Pago registrado");
  });
}
