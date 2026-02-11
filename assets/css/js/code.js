function revisarAlertasDiarias() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("pagos");
  const rows = sheet.getDataRange().getValues();
  rows.shift();

  const hoy = new Date();

  rows.forEach(r => {
    const proxima = new Date(r[9]); // proxima_fecha
    if (hoy > proxima) {
      console.log("Pago vencido:", r[2]);
    }
  });
}
