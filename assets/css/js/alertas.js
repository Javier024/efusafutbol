const API_URL = "https://script.google.com/macros/s/AKfycbxi8pnqdpjBiMzfwv3kLFGritmgC9tg5oVMxKFugunQYtAwBZVnXnkPvEycOZYMEpAgnA/exec";

Promise.all([
  fetch(`${API_URL}?action=getJugadores`).then(r => r.json()),
  fetch(`${API_URL}?action=getPagos`).then(r => r.json())
]).then(([jugadores, pagos]) => {

  const hoy = new Date();
  const tabla = document.getElementById("tablaAlertas");
  tabla.innerHTML = "";

  jugadores.forEach(j => {
    const pagosJugador = pagos.filter(p => p.id_jugador == j.id);
    if (pagosJugador.length === 0) return;

    const ultimo = pagosJugador[pagosJugador.length - 1];
    
    if(!ultimo.proxima_fecha) return;

    const proxima = new Date(ultimo.proxima_fecha);

    let estado = "AL DÍA";
    let color = "bg-green-100";
    let mensaje = "";

    const diffTime = proxima - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      estado = "DEBE";
      color = "bg-red-200";
      mensaje = `Hola ${j.acudiente}, el jugador ${j.nombre} tiene la mensualidad vencida.`;
    } else if (diffDays <= 3) {
      estado = "PRÓXIMO";
      color = "bg-yellow-200";
      mensaje = `Hola ${j.acudiente}, recordatorio de pago próximo para ${j.nombre}.`;
    }

    const tel = j.telefono_acudiente ? j.telefono_acudiente.replace(/\D/g, "") : "";

    tabla.innerHTML += `
      <tr class="${color} border-b">
        <td>${j.nombre} ${j.apellido}</td>
        <td class="font-bold">${estado}</td>
        <td>${ultimo.proxima_fecha}</td>
        <td>
          ${tel ? `
          <a target="_blank"
             href="https://wa.me/57${tel}?text=${encodeURIComponent(mensaje)}"
             class="text-green-700 underline">
            WhatsApp
          </a>` : 'Sin teléfono'}
        </td>
      </tr>
    `;
  });
}).catch(err => console.error("Error cargando alertas:", err));