// Variables globales
let jugadores = [];
let jugadoresFiltrados = [];
let paginaActual = 1;
const jugadoresPorPagina = 10;

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarJugadores();
  configurarEventListeners();
});

// Configurar event listeners
function configurarEventListeners() {
  // Búsqueda
  document.getElementById('busquedaJugador').addEventListener('input', (e) => {
    filtrarJugadores(e.target.value);
  });
  
  // Filtro por categoría
  document.getElementById('filtroCategoria').addEventListener('change', (e) => {
    filtrarJugadores(document.getElementById('busquedaJugador').value, e.target.value);
  });
  
  // Formulario de jugador
  document.getElementById('formJugador').addEventListener('submit', guardarJugador);
}

// Cargar jugadores desde la API
async function cargarJugadores() {
  try {
    const response = await getJugadores();
    if (response.status === 'success') {
      jugadores = response.data;
      jugadoresFiltrados = [...jugadores];
      actualizarTablaJugadores();
      actualizarSelectCategorias();
    } else {
      mostrarNotificacion('Error al cargar jugadores: ' + response.message, 'error');
    }
  } catch (error) {
    console.error('Error al cargar jugadores:', error);
    mostrarNotificacion('Error de conexión al cargar jugadores', 'error');
  }
}

// Filtrar jugadores
function filtrarJugadores(termino = '', categoria = '') {
  jugadoresFiltrados = jugadores.filter(jugador => {
    const coincideTermino = !termino || 
      jugador.nombre.toLowerCase().includes(termino.toLowerCase()) ||
      jugador.apellido.toLowerCase().includes(termino.toLowerCase()) ||
      jugador.documento.includes(termino);
    
    const coincideCategoria = !categoria || jugador.categoria === categoria;
    
    return coincideTermino && coincideCategoria;
  });
  
  paginaActual = 1;
  actualizarTablaJugadores();
}

// Actualizar tabla de jugadores
function actualizarTablaJugadores() {
  const tbody = document.getElementById('tablaJugadores');
  tbody.innerHTML = '';
  
  // Calcular paginación
  const indiceInicio = (paginaActual - 1) * jugadoresPorPagina;
  const indiceFin = indiceInicio + jugadoresPorPagina;
  const jugadoresPagina = jugadoresFiltrados.slice(indiceInicio, indiceFin);
  
  if (jugadoresPagina.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-gray-500">No hay jugadores registrados</td></tr>';
    document.getElementById('paginacionJugadores').innerHTML = '';
    return;
  }
  
  // Generar filas
  jugadoresPagina.forEach(jugador => {
    const fila = document.createElement('tr');
    fila.className = 'hover:bg-gray-50';
    
    fila.innerHTML = `
      <td class="px-4 py-2 border-b">${jugador.documento}</td>
      <td class="px-4 py-2 border-b">
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
            ${jugador.nombre.charAt(0)}${jugador.apellido.charAt(0)}
          </div>
          <div>
            <div class="font-medium">${jugador.nombre} ${jugador.apellido}</div>
            <div class="text-xs text-gray-500">${jugador.email || 'Sin email'}</div>
          </div>
        </div>
      </td>
      <td class="px-4 py-2 border-b">${calcularEdad(jugador.fecha_nacimiento)} años</td>
      <td class="px-4 py-2 border-b">${jugador.categoria || 'Sin asignar'}</td>
      <td class="px-4 py-2 border-b">${jugador.telefono || 'Sin teléfono'}</td>
      <td class="px-4 py-2 border-b">${formatearFecha(jugador.fecha_inscripcion)}</td>
      <td class="px-4 py-2 border-b">
        <span class="px-2 py-1 text-xs rounded-full ${jugador.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
          ${jugador.activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td class="px-4 py-2 border-b">
        <div class="flex space-x-2">
          <button onclick="verJugador('${jugador.id}')" class="text-blue-600 hover:text-blue-800" title="Ver detalles">
            <i class="fas fa-eye"></i>
          </button>
          <button onclick="editarJugador('${jugador.id}')" class="text-green-600 hover:text-green-800" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="eliminarJugador('${jugador.id}')" class="text-red-600 hover:text-red-800" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    tbody.appendChild(fila);
  });
  
  // Actualizar paginación
  actualizarPaginacionJugadores();
}

// Actualizar paginación
function actualizarPaginacionJugadores() {
  const totalPaginas = Math.ceil(jugadoresFiltrados.length / jugadoresPorPagina);
  const paginacionDiv = document.getElementById('paginacionJugadores');
  
  paginacionDiv.innerHTML = configurarPaginacion(
    jugadoresFiltrados.length,
    jugadoresPorPagina,
    paginaActual,
    'cambiarPaginaJugadores'
  );
}

// Cambiar página
function cambiarPaginaJugadores(pagina) {
  const totalPaginas = Math.ceil(jugadoresFiltrados.length / jugadoresPorPagina);
  if (pagina >= 1 && pagina <= totalPaginas) {
    paginaActual = pagina;
    actualizarTablaJugadores();
  }
}

// Actualizar select de categorías para filtro
function actualizarSelectCategorias() {
  const select = document.getElementById('filtroCategoria');
  const categoriasUnicas = [...new Set(jugadores.map(j => j.categoria).filter(Boolean))];
  
  select.innerHTML = '<option value="">Todas las categorías</option>';
  categoriasUnicas.forEach(categoria => {
    const option = document.createElement('option');
    option.value = categoria;
    option.textContent = categoria;
    select.appendChild(option);
  });
}

// Ver detalles del jugador
async function verJugador(id) {
  try {
    const response = await getJugador(id);
    if (response.status === 'success') {
      const jugador = response.data;
      
      // Llenar modal con los datos
      document.getElementById('verNombre').textContent = `${jugador.nombre} ${jugador.apellido}`;
      document.getElementById('verDocumento').textContent = jugador.documento;
      document.getElementById('verFechaNacimiento').textContent = formatearFecha(jugador.fecha_nacimiento);
      document.getElementById('verEdad').textContent = `${calcularEdad(jugador.fecha_nacimiento)} años`;
      document.getElementById('verCategoria').textContent = jugador.categoria || 'Sin asignar';
      document.getElementById('verTelefono').textContent = jugador.telefono || 'No registrado';
      document.getElementById('verEmail').textContent = jugador.email || 'No registrado';
      document.getElementById('verDireccion').textContent = jugador.direccion || 'No registrada';
      document.getElementById('verNombrePadre').textContent = jugador.nombre_padre || 'No registrado';
      document.getElementById('verTelefonoPadre').textContent = jugador.telefono_padre || 'No registrado';
      document.getElementById('verFechaInscripcion').textContent = formatearFecha(jugador.fecha_inscripcion);
      document.getElementById('verEstado').textContent = jugador.activo ? 'Activo' : 'Inactivo';
      
      // Mostrar modal
      document.getElementById('modalVerJugador').classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error al ver jugador:', error);
    mostrarNotificacion('Error al cargar los datos del jugador', 'error');
  }
}

// Editar jugador
async function editarJugador(id) {
  try {
    const response = await getJugador(id);
    if (response.status === 'success') {
      const jugador = response.data;
      
      // Llenar formulario
      document.getElementById('jugadorId').value = jugador.id;
      document.getElementById('nombre').value = jugador.nombre;
      document.getElementById('apellido').value = jugador.apellido;
      document.getElementById('documento').value = jugador.documento;
      document.getElementById('fechaNacimiento').value = jugador.fecha_nacimiento;
      document.getElementById('categoria').value = jugador.categoria || '';
      document.getElementById('telefono').value = jugador.telefono || '';
      document.getElementById('email').value = jugador.email || '';
      document.getElementById('direccion').value = jugador.direccion || '';
      document.getElementById('nombrePadre').value = jugador.nombre_padre || '';
      document.getElementById('telefonoPadre').value = jugador.telefono_padre || '';
      document.getElementById('activo').checked = jugador.activo;
      
      // Cambiar título del modal
      document.getElementById('tituloModalJugador').textContent = 'Editar Jugador';
      
      // Mostrar modal
      document.getElementById('modalJugador').classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error al editar jugador:', error);
    mostrarNotificacion('Error al cargar los datos del jugador', 'error');
  }
}

// Eliminar jugador
async function eliminarJugador(id) {
  if (!confirm('¿Está seguro de que desea eliminar este jugador? Esta acción no se puede deshacer.')) {
    return;
  }
  
  try {
    const response = await deleteJugador(id);
    if (response.status === 'success') {
      mostrarNotificacion('Jugador eliminado correctamente', 'success');
      cargarJugadores(); // Recargar la tabla
    } else {
      mostrarNotificacion('Error al eliminar jugador: ' + response.message, 'error');
    }
  } catch (error) {
    console.error('Error al eliminar jugador:', error);
    mostrarNotificacion('Error de conexión al eliminar jugador', 'error');
  }
}

// Guardar jugador (crear o actualizar)
async function guardarJugador(e) {
  e.preventDefault();
  
  const jugador = {
    id: document.getElementById('jugadorId').value,
    nombre: document.getElementById('nombre').value,
    apellido: document.getElementById('apellido').value,
    documento: document.getElementById('documento').value,
    fecha_nacimiento: document.getElementById('fechaNacimiento').value,
    categoria: document.getElementById('categoria').value,
    telefono: document.getElementById('telefono').value,
    email: document.getElementById('email').value,
    direccion: document.getElementById('direccion').value,
    nombre_padre: document.getElementById('nombrePadre').value,
    telefono_padre: document.getElementById('telefonoPadre').value,
    activo: document.getElementById('activo').checked,
    fecha_inscripcion: document.getElementById('jugadorId').value ? 
      document.getElementById('fechaInscripcion').value : 
      new Date().toISOString().split('T')[0]
  };
  
  try {
    const response = await saveJugador(jugador);
    if (response.status === 'success') {
      mostrarNotificacion(
        jugador.id ? 'Jugador actualizado correctamente' : 'Jugador creado correctamente',
        'success'
      );
      
      // Cerrar modal y recargar datos
      cerrarModalJugador();
      cargarJugadores();
    } else {
      mostrarNotificacion('Error al guardar jugador: ' + response.message, 'error');
    }
  } catch (error) {
    console.error('Error al guardar jugador:', error);
    mostrarNotificacion('Error de conexión al guardar jugador', 'error');
  }
}

// Abrir modal para nuevo jugador
function nuevoJugador() {
  // Limpiar formulario
  document.getElementById('formJugador').reset();
  document.getElementById('jugadorId').value = '';
  document.getElementById('activo').checked = true;
  
  // Cambiar título del modal
  document.getElementById('tituloModalJugador').textContent = 'Nuevo Jugador';
  
  // Mostrar modal
  document.getElementById('modalJugador').classList.remove('hidden');
}

// Cerrar modal de jugador
function cerrarModalJugador() {
  document.getElementById('modalJugador').classList.add('hidden');
}

// Cerrar modal de ver jugador
function cerrarModalVerJugador() {
  document.getElementById('modalVerJugador').classList.add('hidden');
}

// Hacer funciones disponibles globalmente
window.verJugador = verJugador;
window.editarJugador = editarJugador;
window.eliminarJugador = eliminarJugador;
window.guardarJugador = guardarJugador;
window.nuevoJugador = nuevoJugador;
window.cerrarModalJugador = cerrarModalJugador;
window.cerrarModalVerJugador = cerrarModalVerJugador;
window.cambiarPaginaJugadores = cambiarPaginaJugadores;