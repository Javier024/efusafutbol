// js/jugadores.js
document.addEventListener('DOMContentLoaded', async () => {
  checkAuth();
  
  let jugadores = [];
  let currentPage = 1;
  const itemsPerPage = 10;
  
  // Cargar jugadores
  async function loadJugadores() {
    try {
      jugadores = await window.api.getJugadores();
      renderJugadores();
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
      showNotification('Error al cargar jugadores', 'error');
    }
  }
  
  // Renderizar jugadores con paginación
  function renderJugadores() {
    const tabla = document.getElementById('tablaJugadores');
    const paginatedItems = paginate(jugadores, currentPage, itemsPerPage);
    
    tabla.innerHTML = '';
    
    paginatedItems.forEach(jugador => {
      const row = document.createElement('tr');
      row.className = 'border-b hover:bg-gray-50';
      
      // Determinar estado del jugador
      const estado = jugador.activo ? 'Activo' : 'Inactivo';
      const estadoClass = jugador.activo ? 'text-green-600' : 'text-red-600';
      
      row.innerHTML = `
        <td>${jugador.nombre}</td>
        <td>${jugador.apellido}</td>
        <td>${jugador.categoria}</td>
        <td class="${estadoClass}">${estado}</td>
        <td>
          <button class="bg-blue-500 text-white px-2 py-1 rounded mr-1" onclick="editJugador('${jugador.id}')">
            Editar
          </button>
          <button class="bg-red-500 text-white px-2 py-1 rounded" onclick="deleteJugador('${jugador.id}')">
            Eliminar
          </button>
        </td>
      `;
      
      tabla.appendChild(row);
    });
    
    // Crear paginación
    const totalPages = Math.ceil(jugadores.length / itemsPerPage);
    createPaginationHTML(currentPage, totalPages, 'paginacion', 'changePage');
  }
  
  // Cambiar página
  window.changePage = function(page) {
    currentPage = page;
    renderJugadores();
  };
  
  // Guardar jugador
  document.getElementById('formJugador').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const jugador = {
      nombre: document.getElementById('nombre').value,
      apellido: document.getElementById('apellido').value,
      fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
      categoria: document.getElementById('categoria').value,
      identificacion: document.getElementById('identificacion').value,
      tipo_sangre: document.getElementById('tipo_sangre').value,
      acudiente: document.getElementById('acudiente').value,
      telefono_acudiente: document.getElementById('telefono_acudiente').value,
      activo: true
    };
    
    try {
      await window.api.saveJugador(jugador);
      showNotification('Jugador guardado correctamente');
      document.getElementById('formJugador').reset();
      loadJugadores();
    } catch (error) {
      console.error('Error al guardar jugador:', error);
      showNotification('Error al guardar jugador', 'error');
    }
  });
  
  // Editar jugador
  window.editJugador = async function(id) {
    try {
      const jugador = await window.api.getJugador(id);
      
      document.getElementById('nombre').value = jugador.nombre;
      document.getElementById('apellido').value = jugador.apellido;
      document.getElementById('fecha_nacimiento').value = jugador.fecha_nacimiento;
      document.getElementById('categoria').value = jugador.categoria;
      document.getElementById('identificacion').value = jugador.identificacion;
      document.getElementById('tipo_sangre').value = jugador.tipo_sangre;
      document.getElementById('acudiente').value = jugador.acudiente;
      document.getElementById('telefono_acudiente').value = jugador.telefono_acudiente;
      
      // Cambiar el comportamiento del formulario para actualizar
      const form = document.getElementById('formJugador');
      form.onsubmit = async (e) => {
        e.preventDefault();
        
        const updatedJugador = {
          id: id,
          nombre: document.getElementById('nombre').value,
          apellido: document.getElementById('apellido').value,
          fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
          categoria: document.getElementById('categoria').value,
          identificacion: document.getElementById('identificacion').value,
          tipo_sangre: document.getElementById('tipo_sangre').value,
          acudiente: document.getElementById('acudiente').value,
          telefono_acudiente: document.getElementById('telefono_acudiente').value,
          activo: jugador.activo
        };
        
        try {
          await window.api.saveJugador(updatedJugador);
          showNotification('Jugador actualizado correctamente');
          form.reset();
          form.onsubmit = arguments.callee.caller; // Restaurar el comportamiento original
          loadJugadores();
        } catch (error) {
          console.error('Error al actualizar jugador:', error);
          showNotification('Error al actualizar jugador', 'error');
        }
      };
      
      // Scroll al formulario
      form.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error al cargar jugador:', error);
      showNotification('Error al cargar jugador', 'error');
    }
  };
  
  // Eliminar jugador
  window.deleteJugador = async function(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este jugador?')) return;
    
    try {
      await window.api.deleteJugador(id);
      showNotification('Jugador eliminado correctamente');
      loadJugadores();
    } catch (error) {
      console.error('Error al eliminar jugador:', error);
      showNotification('Error al eliminar jugador', 'error');
    }
  };
  
  // Cargar jugadores al iniciar
  loadJugadores();
});