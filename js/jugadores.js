(async () => {
  import('./api.js').then(api => {
    const jugadoresTableBody = document.getElementById('jugadores-table-body');
    const jugadorForm = document.getElementById('jugador-form');
    const modalTitle = document.getElementById('modal-title');
    const saveButton = document.getElementById('save-button');
    let currentJugadorId = null;

    async function loadJugadores() {
      try {
        const response = await api.getJugadores();
        if (response.status === 'success') {
          jugadoresTableBody.innerHTML = '';
          response.data.forEach(jugador => {
            const row = `
              <tr class="border-b hover:bg-gray-50">
                <td class="p-3">${jugador.nombre} ${jugador.apellido}</td>
                <td class="p-3">${jugador.categoria}</td>
                <td class="p-3">${jugador.activo ? '<span class="text-green-600 font-semibold">Sí</span>' : '<span class="text-red-600">No</span>'}</td>
                <td class="p-3 text-right">
                  <button onclick="editJugador(${jugador.id})" class="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600">Editar</button>
                  <button onclick="deleteJugador(${jugador.id})" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Eliminar</button>
                </td>
              </tr>
            `;
            jugadoresTableBody.innerHTML += row;
          });
        }
      } catch (error) {
        console.error("Error al cargar jugadores:", error);
      }
    }

    window.editJugador = async (id) => {
      currentJugadorId = id;
      modalTitle.textContent = 'Editar Jugador';
      saveButton.textContent = 'Actualizar';
      const response = await api.getJugadorById(id);
      if (response.status === 'success') {
        const j = response.data;
        document.getElementById('nombre').value = j.nombre;
        document.getElementById('apellido').value = j.apellido;
        document.getElementById('categoria').value = j.categoria;
        document.getElementById('activo').checked = j.activo;
      }
    };

    window.deleteJugador = async (id) => {
      if (confirm('¿Estás seguro de que quieres eliminar este jugador?')) {
        const response = await api.deleteJugador(id);
        if (response.status === 'success') {
          window.mostrarNotificacion(response.message, 'success');
          loadJugadores();
        } else {
          window.mostrarNotificacion(response.message, 'error');
        }
      }
    };

    jugadorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const jugadorData = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        categoria: document.getElementById('categoria').value,
        activo: document.getElementById('activo').checked,
      };

      if (currentJugadorId) {
        jugadorData.id = currentJugadorId;
      }

      const response = await api.saveJugador(jugadorData);
      if (response.status === 'success') {
        window.mostrarNotificacion(response.message, 'success');
        jugadorForm.reset();
        currentJugadorId = null;
        modalTitle.textContent = 'Nuevo Jugador';
        saveButton.textContent = 'Guardar';
        loadJugadores();
      } else {
        window.mostrarNotificacion(response.message, 'error');
      }
    });

    loadJugadores();
  });
})();