(async () => {
  import('./api.js').then(api => {
    const reportesContainer = document.getElementById('reportes-container');

    async function loadReportes() {
      reportesContainer.innerHTML = '<p class="text-gray-600">Generando reportes...</p>';
      try {
        const [jugadoresResponse, pagosResponse] = await Promise.all([
          api.getJugadores(),
          api.getPagos()
        ]);

        if (jugadoresResponse.status === 'success' && pagosResponse.status === 'success') {
          const totalIngresos = pagosResponse.data.reduce((sum, p) => sum + p.monto, 0);
          const jugadoresPorCategoria = jugadoresResponse.data.reduce((acc, j) => {
            acc[j.categoria] = (acc[j.categoria] || 0) + 1;
            return acc;
          }, {});

          reportesContainer.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow mb-4">
              <h3 class="text-xl font-bold mb-4">Resumen General</h3>
              <p><strong>Total Ingresos:</strong> ${totalIngresos.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-xl font-bold mb-4">Jugadores por Categoría</h3>
              <ul>
                ${Object.entries(jugadoresPorCategoria).map(([cat, count]) => `<li><strong>${cat}:</strong> ${count} jugadores</li>`).join('')}
              </ul>
            </div>
          `;
        }
      } catch (error) {
        console.error("Error al generar reportes:", error);
        reportesContainer.innerHTML = '<p class="text-red-500">Error al generar los reportes.</p>';
      }
    }

    loadReportes();
  });
})();