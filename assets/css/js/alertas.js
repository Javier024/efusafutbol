const API_URL = export const API_URL = "https://script.google.com/macros/s/AKfycbztjI6XjuFx_229USntd1Kfk7jawawJJBkwVnZd451sjtNlYkLb3k8CdQwg2N-_NMdRUg/exec";


Promise.all([
  fetch(`${API_URL}?action=getJugadores`).then(r => r.json()),
  fetch(`${API_URL}?action=getPagos`).then(r => r.json())
]).then(([jugadores, pagos]) => {

  const hoy = new Date();
  const tabla = document.getElementById("tablaAlertas");
  tabla.innerHTML = "";

  jugadores.forEach(j => {
    const pagosJugador = pagos.filter(p => p.id_jugador === j.id);
    if (pagosJugador.length === 0) return;

    const ultimo = pagosJugador[pagosJugador.length - 1];
    const proxima = new Date(ultimo.proxima_fecha);

    let estado = "AL DÍA";
    let color = "bg-green-100";
    let mensaje = "";

    if (hoy > proxima) {
      estado = "DEBE";
      color = "bg-red-200";
      mensaje = `Hola ${j.acudiente}, el jugador ${j.nombre} tiene la mensualidad vencida.`;
    } else if ((proxima - hoy) / 86400000 <= 3) {
      estado = "PRÓXIMO";
      color = "bg-yellow-200";
      mensaje = `Hola ${j.acudiente}, recordatorio de pago próximo para ${j.nombre}.`;
    }

    const tel = j.telefono_acudiente.replace(/\D/g, "");

    tabla.innerHTML += `
      <tr class="${color} border-b">
        <td>${j.nombre} ${j.apellido}</td>
        <td>${estado}</td>
        <td>${ultimo.proxima_fecha}</td>
        <td>
          <a target="_blank"
             href="https://wa.me/57${tel}?text=${encodeURIComponent(mensaje)}"
             class="text-green-700 underline">
            WhatsApp
          </a>
        </td>
      </tr>
    `;
  });
});
