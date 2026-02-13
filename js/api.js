// Simulación de base de datos
let jugadoresSimulados = [
  { id: 1, nombre: 'Juan', apellido: 'Pérez', categoria: 'Sub-15', activo: true },
  { id: 2, nombre: 'María', apellido: 'Gómez', categoria: 'Sub-14', activo: true },
  { id: 3, nombre: 'Carlos', apellido: 'Rodríguez', categoria: 'Sub-13', activo: false },
];

let pagosSimulados = [
  { id: 1, jugador_id: 1, monto: 50000, fecha: '2023-10-01', concepto: 'Inscripción' },
  { id: 2, jugador_id: 2, monto: 50000, fecha: '2023-10-05', concepto: 'Inscripción' },
];

let nextId = 4;

// ----- FUNCIONES DE LA API -----
// Usamos async/await para simular peticiones de red reales.

export async function getJugadores() {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simula retraso
  return { status: 'success', data: jugadoresSimulados };
}

export async function getJugadorById(id) {
  await new Promise(resolve => setTimeout(resolve, 200));
  const jugador = jugadoresSimulados.find(j => j.id == id);
  if (jugador) {
    return { status: 'success', data: jugador };
  } else {
    return { status: 'error', message: 'Jugador no encontrado' };
  }
}

export async function saveJugador(jugador) {
  await new Promise(resolve => setTimeout(resolve, 400));
  if (jugador.id) {
    // Actualizar
    const index = jugadoresSimulados.findIndex(j => j.id == jugador.id);
    if (index !== -1) {
      jugadoresSimulados[index] = { ...jugadoresSimulados[index], ...jugador };
      return { status: 'success', message: 'Jugador actualizado' };
    }
    return { status: 'error', message: 'Error al actualizar' };
  } else {
    // Crear
    const nuevoJugador = { ...jugador, id: nextId++ };
    jugadoresSimulados.push(nuevoJugador);
    return { status: 'success', message: 'Jugador creado', data: nuevoJugador };
  }
}

export async function deleteJugador(id) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = jugadoresSimulados.findIndex(j => j.id == id);
  if (index !== -1) {
    jugadoresSimulados.splice(index, 1);
    return { status: 'success', message: 'Jugador eliminado' };
  }
  return { status: 'error', message: 'Jugador no encontrado' };
}

export async function getPagos() {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { status: 'success', data: pagosSimulados };
}

export async function getDashboardStats() {
  await new Promise(resolve => setTimeout(resolve, 200));
  return {
    status: 'success',
    data: {
      totalJugadores: jugadoresSimulados.length,
      jugadoresActivos: jugadoresSimulados.filter(j => j.activo).length,
      totalPagos: pagosSimulados.reduce((sum, p) => sum + p.monto, 0),
      nuevosMes: jugadoresSimulados.filter(j => { // Simulación
        const mes = new Date().getMonth();
        return j.id > (mes * 10); // Lógica simple de ejemplo
      }).length,
    }
  };
}