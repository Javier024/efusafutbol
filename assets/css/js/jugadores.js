const API_URL = "https://script.google.com/macros/s/AKfycbxi8pnqdpjBiMzfwv3kLFGritmgC9tg5oVMxKFugunQYtAwBZVnXnkPvEycOZYMEpAgnA/exec";

document.addEventListener("DOMContentLoaded", () => {
  cargarJugadores();
  document.getElementById("formJugador").addEventListener("submit", guardarJugador);
});

function cargarJugadores() {
  fetch(`${API_URL}?action=getJugadores`)
    .then(res => res.json())
    .then(data => {
      const tabla = document.getElementById("tablaJugadores");
      tabla.innerHTML = "";
      data.forEach(j => {
        tabla.innerHTML += `
          <tr class="border-b">
            <td>${j.nombre}</td>
            <td>${j.apellido}</td>
            <td>${j.categoria}</td>
            <td>${j.estado}</td>
          </tr>
        `;
      });
    });
}

function guardarJugador(e) {
  e.preventDefault();

  const jugador = {
    action: "addJugador",
    nombre: nombre.value,
    apellido: apellido.value,
    fecha_nacimiento: fecha_nacimiento.value,
    categoria: categoria.value,
    identificacion: identificacion.value,
    tipo_sangre: tipo_sangre.value,
    acudiente: acudiente.value,
    telefono_acudiente: telefono_acudiente.value
  };

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(jugador)
  }).then(() => {
    e.target.reset();
    cargarJugadores();
  });
}
