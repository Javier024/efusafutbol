const API_URL = "https://script.google.com/macros/s/AKfycbxi8pnqdpjBiMzfwv3kLFGritmgC9tg5oVMxKFugunQYtAwBZVnXnkPvEycOZYMEpAgnA/exec";

if (localStorage.getItem("auth") !== "true") {
  location.href = "login.html";
}

Promise.all([
  fetch(`${API_URL}?action=getJugadores`).then(r => r.json()),
  fetch(`${API_URL}?action=getPagos`).then(r => r.json())
]).then(([jugadores, pagos]) => {

  document.getElementById("totalJugadores").innerText = jugadores.length;

  const total = pagos.reduce((s, p) => s + Number(p.total_pagado || 0), 0);
  document.getElementById("totalPagos").innerText = "$" + total.toLocaleString();

  const hoy = new Date();
  const deudores = pagos.filter(p => new Date(p.proxima_fecha) < hoy);
  document.getElementById("deudores").innerText = deudores.length;
}).catch(err => console.error("Error en dashboard:", err));