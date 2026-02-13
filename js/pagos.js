(async () => {
  import('./api.js').then(api => {
    const pagosTableBody = document.getElementById('pagos-table-body');

    async function loadPagos() {
      try {
        const response = await api.getPagos();
        if (response.status === 'success') {
          pagosTableBody.innerHTML = '';
          response.data.forEach(pago => {
            const row = `
              <tr class="border-b hover:bg-gray-50">
                <td class="p-3">Jugador ID ${pago.jugador_id}</td>
                <td class="p-3">${pago.concepto}</td>
                <td class="p-3">${new Date(pago.fecha).toLocaleDateString('es-ES')}</td>
                <td class="p-3 font-semibold">${pago.monto.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
              </tr>
            `;
            pagosTableBody.innerHTML += row;
          });
        }
      } catch (error) {
        console.error("Error al cargar pagos:", error);
      }
    }

    loadPagos();
  });
})();