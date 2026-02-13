// Variables globales
let jugadores = [];
let pagos = [];
let alertas = [];

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarAlertas();
});

// Cargar y generar alertas
async function cargarAlertas() {
  try {
    // Cargar jugadores y pagos
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
    
    // Generar alertas
    generarAlertas();
    
    // Mostrar alertas en la tabla
    actualizarTablaAlertas();
    
  } catch (error) {
    console.error('Error al cargar alertas:', error);
    mostrarNotificacion('Error de conexión al cargar las alertas', 'error');
  }
}

// Generar alertas basadas en los datos
function generarAlertas() {
  alertas = [];
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth();
  const anioActual = fechaActual.getFullYear();
  
  // Alerta 1: Pagos atrasados del mes actual
  jugadores.forEach(jugador => {
    if (!jugador.activo) return;
    
    const pagoMesActual = pagos.some(pago => {
      if (pago.id_jugador !== jugador.id) return false;
      
      const fechaPago = new Date(pago.fecha_pago);
      return fechaPago.getMonth() === mesActual && 
             fechaPago.getFullYear() === anioActual;
    });
    
    if (!pagoMesActual) {
      alertas.push({
        tipo: 'pago_atrasado',
        titulo: 'Pago Pendiente',
        mensaje: `${jugador.nombre} ${jugador.apellido} no ha registrado el pago de este mes.`,
        id_jugador: jugador.id,
        nombre_jugador: `${jugador.nombre} ${jugador.apellido}`,
        telefono: jugador.telefono,
        telefono_padre: jugador.telefono_padre,
        fecha: new Date().toISOString(),
        prioridad: 'alta'
      });
    }
  });
  
  // Alerta 2: Cumpleaños del mes
  jugadores.forEach(jugador => {
    if (!jugador.fecha_nacimiento || !jugador.activo) return;
    
    const fechaNacimiento = new Date(jugador.fecha_nacimiento);
    const mesNacimiento = fechaNacimiento.getMonth();
    
    if (mesNacimiento === mesActual) {
      alertas.push({
        tipo: 'cumpleanos',
        titulo: 'Cumpleaños este mes',
        mensaje: `${jugador.nombre} ${jugador.apellido} cumple años el ${fechaNacimiento.getDate()} de este mes.`,
        id_jugador: jugador.id,
        nombre_jugador: `${jugador.nombre} ${jugador.apellido}`,
        fecha: jugador.fecha_nacimiento,
        prioridad: 'baja'
      });
    }
  });
  
  // Alerta 3: Próximos vencimientos (configurable)
  const diasRecordatorio = parseInt(localStorage.getItem('diasRecordatorio') || '5');
  
  jugadores.forEach(jugador => {
    if (!jugador.activo) return;
    
    // Suponemos que el pago vence el día 15 de cada mes
    const diaVencimiento = 15;
    const fechaVencimiento = new Date(anioActual, mesActual, diaVencimiento);
    const diasParaVencimiento = Math.ceil((fechaVencimiento - fechaActual) / (1000 * 60 * 60 * 24));
    
    if (diasParaVencimiento > 0 && diasParaVencimiento <= diasRecordatorio) {
      const yaPago = pagos.some(pago => {
        if (pago.id_jugador !== jugador.id) return false;
        
        const fechaPago = new Date(pago.fecha_pago);
        return fechaPago.getMonth() === mesActual && 
               fechaPago.getFullYear() === anioActual;
      });
      
      if (!yaPago) {
        alertas.push({
          tipo: 'proximo_vencimiento',
          titulo: 'Próximo Vencimiento',
          mensaje: `El pago de ${jugador.nombre} ${jugador.apellido} vence en ${diasParaVencimiento} días.`,
          id_jugador: jugador.id,
          nombre_jugador: `${jugador.nombre} ${jugador.apellido}`,
          telefono: jugador.telefono,
          telefono_padre: jugador.telefono_padre,
          fecha: fechaVencimiento.toISOString(),
          dias_restantes: diasParaVencimiento,
          prioridad: 'media'
        });
      }
    }
  });
  
  // Ordenar alertas por prioridad y fecha
  alertas.sort((a, b) => {
    const prioridadOrden = { alta: 1, media: 2, baja: 3 };
    if (prioridadOrden[a.prioridad] !== prioridadOrden[b.prioridad]) {
      return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
    }
    return new Date(b.fecha) - new Date(a.fecha);
  });
}

// Actualizar tabla de alertas
function actualizarTablaAlertas() {
  const tbody = document.getElementById('tablaAlertas');
  tbody.innerHTML = '';
  
  if (alertas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">No hay alertas activas</td></tr>';
    return;
  }
  
  alertas.forEach(alerta => {
    const fila = document.createElement('tr');
    fila.className = 'hover:bg-gray-50';
    
    // Configurar icono y color según el tipo y prioridad
    let icono = 'fa-info-circle';
    let colorPrioridad = 'bg-gray-100 text-gray-800';
    let colorTipo = 'bg-gray-100 text-gray-800';
    
    // Color por prioridad
    switch(alerta.prioridad) {
      case 'alta': colorPrioridad = 'bg-red-100 text-red-800'; break;
      case 'media': colorPrioridad = 'bg-yellow-100 text-yellow-800'; break;
      case 'baja': colorPrioridad = 'bg-blue-100 text-blue-800'; break;
    }
    
    // Icono y color por tipo
    switch(alerta.tipo) {
      case 'pago_atrasado':
        icono = 'fa-exclamation-triangle';
        colorTipo = 'bg-red-100 text-red-800';
        break;
      case 'cumpleanos':
        icono = 'fa-birthday-cake';
        colorTipo = 'bg-pink-100 text-pink-800';
        break;
      case 'proximo_vencimiento':
        icono = 'fa-clock';
        colorTipo = 'bg-yellow-100 text-yellow-800';
        break;
    }
    
    fila.innerHTML = `
      <td class="px-4 py-3 border-b">
        <div class="flex items-center">
          <i class="fas ${icono} mr-2 text-lg"></i>
          <div>
            <div class="font-medium">${alerta.titulo}</div>
            <div class="text-xs text-gray-500">${alerta.tipo.replace('_', ' ')}</div>
          </div>
        </div>
      </td>
      <td class="px-4 py-3 border-b">${alerta.mensaje}</td>
      <td class="px-4 py-3 border-b">
        <span class="px-2 py-1 text-xs rounded-full ${colorPrioridad}">
          ${alerta.prioridad.toUpperCase()}
        </span>
      </td>
      <td class="px-4 py-3 border-b">${formatearFecha(alerta.fecha)}</td>
      <td class="px-4 py-3 border-b">
        <div class="flex space-x-2">
          ${alerta.telefono || alerta.telefono_padre ? `
            <button onclick="enviarRecordatorio('${alerta.id_jugador}')" class="text-green-600 hover:text-green-800" title="Enviar recordatorio">
              <i class="fas fa-whatsapp"></i>
            </button>
          ` : ''}
          <button onclick="verDetallesAlerta('${alerta.id_jugador}')" class="text-blue-600 hover:text-blue-800" title="Ver detalles">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </td>
    `;
    
    tbody.appendChild(fila);
  });
}

// Enviar recordatorio por WhatsApp
function enviarRecordatorio(idJugador) {
  const jugador = jugadores.find(j => j.id === idJugador);
  if (!jugador) {
    mostrarNotificacion('Jugador no encontrado', 'error');
    return;
  }
  
  // Determinar a qué número enviar (prioridad al del padre si existe)
  const telefono = jugador.telefono_padre || jugador.telefono;
  
  if (!telefono) {
    mostrarNotificacion('El jugador no tiene un número de teléfono registrado', 'error');
    return;
  }
  
  // Generar mensaje personalizado
  const mensaje = generarMensajeRecordatorio(jugador);
  
  // Enviar por WhatsApp
  enviarWhatsApp(telefono, mensaje);
  
  mostrarNotificación('Recordatorio enviado por WhatsApp', 'success');
}

// Generar mensaje de recordatorio
function generarMensajeRecordatorio(jugador) {
  let mensaje = localStorage.getItem('mensajeRecordatorio') || 
    'Hola {nombre}, te recordamos que tu pago de la mensualidad vence el {fecha_vencimiento}. Por favor realiza el pago a la brevedad. Gracias!';
  
  // Reemplazar variables
  mensaje = mensaje.replace('{nombre}', `${jugador.nombre} ${jugador.apellido}`);
  
  // Calcular fecha de vencimiento (día 15 del mes actual)
  const fechaActual = new Date();
  const fechaVencimiento = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 15);
  mensaje = mensaje.replace('{fecha_vencimiento}', formatearFecha(fechaVencimiento));
  
  // Agregar información de contacto
  const nombreEscuela = localStorage.getItem('nombreEscuela') || 'EFUSA';
  const telefonoEscuela = localStorage.getItem('telefonoEscuela') || '';
  
  if (telefonoEscuela) {
    mensaje += `\n\nPara más información, contáctanos al ${telefonoEscuela}`;
  }
  
  mensaje += `\n\n${nombreEscuela}`;
  
  return mensaje;
}

// Ver detalles del jugador relacionado con la alerta
async function verDetallesAlerta(idJugador) {
  try {
    const response = await getJugador(idJugador);
    if (response.status === 'success') {
      const jugador = response.data;
      
      // Mostrar información del jugador
      const info = `
        <div class="p-4">
          <h3 class="text-lg font-bold mb-2">${jugador.nombre} ${jugador.apellido}</h3>
          <p><strong>Documento:</strong> ${jugador.documento}</p>
          <p><strong>Categoría:</strong> ${jugador.categoria || 'Sin asignar'}</p>
          <p><strong>Teléfono:</strong> ${jugador.telefono || 'No registrado'}</p>
          <p><strong>Teléfono Padre:</strong> ${jugador.telefono_padre || 'No registrado'}</p>
          <p><strong>Email:</strong> ${jugador.email || 'No registrado'}</p>
        </div>
      `;
      
      // Mostrar en un modal o alerta simple
      alert(info.replace(/<[^>]*>/g, '\n').replace(/&nbsp;/g, ' '));
    }
  } catch (error) {
    console.error('Error al ver detalles:', error);
    mostrarNotificacion('Error al cargar los detalles del jugador', 'error');
  }
}

// Hacer funciones disponibles globalmente
window.enviarRecordatorio = enviarRecordatorio;
window.verDetallesAlerta = verDetallesAlerta;