function paginar(data, pagina, porPagina) {
  const inicio = (pagina - 1) * porPagina;
  return data.slice(inicio, inicio + porPagina);
}
