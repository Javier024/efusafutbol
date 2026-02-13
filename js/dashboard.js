(async () => {
  import('./api.js').then(api => {
    const statsContainer = document.getElementById('stats-container');

    async function loadDashboard() {
      try {
        const response = await api.getDashboardStats();
        if (response.status === 'success') {
          const stats = response.data;
          statsContainer.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow"><h3 class="text-2xl font-bold text-blue-600">${stats.totalJugadores}</h3><p class="text-gray-500">Total Jugadores</p></div>
            <div class="bg-white p-6 rounded-lg shadow"><h3 class="text-2xl font-bold text-green-600">${stats.jugadoresActivos}</h3><p class="text-gray-500">Activos</p></div>
            <div class="bg-white p-6 rounded-lg shadow"><h3 class="text-2xl font-bold text-yellow-600">${stats.totalPagos.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</h3><p class="text-gray-500">Total en Pagos</p></div>
            <div class="bg-white p-6 rounded-lg shadow"><h3 class="text-2xl font-bold text-purple-600">${stats.nuevosMes}</h3><p class="text-gray-500">Nuevos este Mes</p></div>
          `;
        }
      } catch (error) {
        console.error("Error al cargar el dashboard:", error);
        statsContainer.innerHTML = '<p class="text-red-500">Error al cargar las estadísticas.</p>';
      }
    }

    loadDashboard();
  });
})();