// Variables globales
let categorias = [];
let valoresCategoria = {};

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarCategorias();
  cargarConfiguracion();
});

// Cargar categorías
async function cargarCategorias() {
  try {
    const response = await apiRequest('getJugadores');
    
    if (response.status === 'success') {
      // Extraer categorías únicas
      const categoriasSet = new Set();
      response.data.forEach(jugador => {
        if (jugador.categoria) {
          categoriasSet.add(jugador.categoria);
        }
      });
      
      categorias = Array.from(categoriasSet);
      
      // Cargar valores de categorías desde localStorage
      const valoresGuardados = localStorage.getItem('valoresCategoria');
      if (valoresGuardados) {
        valoresCategoria = JSON.parse(valoresGuardados);
      }
      
      // Actualizar UI
      actualizarListaCategorias();
      actualizarSelectCategorias();
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
}

// Actualizar lista de categorías en la UI
function actualizarListaCategorias() {
  const listaCategorias = document.getElementById('listaCategorias');
  listaCategorias.innerHTML = '';
  
  categorias.forEach(categoria => {
    const valor = valoresCategoria[categoria] || 0;
    
    const div = document.createElement('div');
    div.className = 'flex justify-between items-center p-2 border rounded';
    div.innerHTML = `
      <span>${categoria}</span>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">$${valor.toLocaleString()}</span>
        <button onclick="eliminarCategoria('${categoria}')" class="text-red-600 hover:text-red-800">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    listaCategorias.appendChild(div);
  });
}

// Actualizar select de categorías
function actualizarSelectCategorias() {
  const select = document.getElementById('categoriaValor');
  select.innerHTML = '<option value="">Seleccionar categoría</option>';
  
  categorias.forEach(categoria => {
    const option = document.createElement('option');
    option.value = categoria;
    option.textContent = categoria;
    select.appendChild(option);
  });
}

// Agregar categoría
function agregarCategoria() {
  const input = document.getElementById('nuevaCategoria');
  const nombre = input.value.trim();
  
  if (!nombre) {
    mostrarNotificacion('Por favor ingrese un nombre para la categoría', 'error');
    return;
  }
  
  if (categorias.includes(nombre)) {
    mostrarNotificacion('Esta categoría ya existe', 'error');
    return;
  }
  
  categorias.push(nombre);
  valoresCategoria[nombre] = 0; // Valor por defecto
  
  // Guardar en localStorage
  localStorage.setItem('valoresCategoria', JSON.stringify(valoresCategoria));
  
  // Actualizar UI
  actualizarListaCategorias();
  actualizarSelectCategorias();
  
  // Limpiar input
  input.value = '';
  
  mostrarNotificación('Categoría agregada correctamente', 'success');
}

// Eliminar categoría
function eliminarCategoria(nombre) {
  if (!confirm(`¿Está seguro de eliminar la categoría "${nombre}"?`)) {
    return;
  }
  
  categorias = categorias.filter(c => c !== nombre);
  delete valoresCategoria[nombre];
  
  // Guardar en localStorage
  localStorage.setItem('valoresCategoria', JSON.stringify(valoresCategoria));
  
  // Actualizar UI
  actualizarListaCategorias();
  actualizarSelectCategorias();
  
  mostrarNotificacion('Categoría eliminada correctamente', 'success');
}

// Actualizar valor de categoría
function actualizarValorCategoria() {
  const categoria = document.getElementById('categoriaValor').value;
  const valor = parseFloat(document.getElementById('valorMensualidad').value);
  
  if (!categoria) {
    mostrarNotificacion('Por favor seleccione una categoría', 'error');
    return;
  }
  
  if (isNaN(valor) || valor < 0) {
    mostrarNotificación('Por favor ingrese un valor válido', 'error');
    return;
  }
  
  valoresCategoria[categoria] = valor;
  
  // Guardar en localStorage
  localStorage.setItem('valoresCategoria', JSON.stringify(valoresCategoria));
  
  // Actualizar UI
  actualizarListaCategorias();
  
  // Limpiar campos
  document.getElementById('categoriaValor').value = '';
  document.getElementById('valorMensualidad').value = '';
  
  mostrarNotificación('Valor actualizado correctamente', 'success');
}

// Cargar configuración
function cargarConfiguracion() {
  // Cargar configuración de recordatorios
  const diasRecordatorio = localStorage.getItem('diasRecordatorio') || '5';
  const mensajeRecordatorio = localStorage.getItem('mensajeRecordatorio') || 'Hola {nombre}, te recordamos que tu pago de la mensualidad vence el {fecha_vencimiento}. Por favor realiza el pago a la brevedad. Gracias!';
  const habilitarRecordatorios = localStorage.getItem('habilitarRecordatorios') !== 'false';
  
  document.getElementById('diasRecordatorio').value = diasRecordatorio;
  document.getElementById('mensajeRecordatorio').value = mensajeRecordatorio;
  document.getElementById('habilitarRecordatorios').checked = habilitarRecordatorios;
  
  // Cargar configuración de contacto
  const nombreEscuela = localStorage.getItem('nombreEscuela') || 'EFUSA - Escuela de Fútbol';
  const telefonoEscuela = localStorage.getItem('telefonoEscuela') || '';
  const emailEscuela = localStorage.getItem('emailEscuela') || '';
  const direccionEscuela = localStorage.getItem('direccionEscuela') || '';
  
  document.getElementById('nombreEscuela').value = nombreEscuela;
  document.getElementById('telefonoEscuela').value = telefonoEscuela;
  document.getElementById('emailEscuela').value = emailEscuela;
  document.getElementById('direccionEscuela').value = direccionEscuela;
}

// Guardar configuración de recordatorios
function guardarConfiguracionRecordatorios() {
  const dias = document.getElementById('diasRecordatorio').value;
  const mensaje = document.getElementById('mensajeRecordatorio').value;
  const habilitar = document.getElementById('habilitarRecordatorios').checked;
  
  localStorage.setItem('diasRecordatorio', dias);
  localStorage.setItem('mensajeRecordatorio', mensaje);
  localStorage.setItem('habilitarRecordatorios', habilitar);
  
  mostrarNotificacion('Configuración de recordatorios guardada correctamente', 'success');
}

// Guardar configuración de contacto
function guardarConfiguracionContacto() {
  const nombre = document.getElementById('nombreEscuela').value;
  const telefono = document.getElementById('telefonoEscuela').value;
  const email = document.getElementById('emailEscuela').value;
  const direccion = document.getElementById('direccionEscuela').value;
  
  localStorage.setItem('nombreEscuela', nombre);
  localStorage.setItem('telefonoEscuela', telefono);
  localStorage.setItem('emailEscuela', email);
  localStorage.setItem('direccionEscuela', direccion);
  
  mostrarNotificacion('Información de contacto guardada correctamente', 'success');
}

// Cambiar clave
function cambiarClave() {
  const nuevaClave = document.getElementById('nuevaClave').value;
  const confirmarClave = document.getElementById('confirmarClave').value;
  
  if (nuevaClave && nuevaClave !== confirmarClave) {
    mostrarNotificación('Las contraseñas no coinciden', 'error');
    return;
  }
  
  if (nuevaClave && nuevaClave.length < 4) {
    mostrarNotificación('La contraseña debe tener al menos 4 caracteres', 'error');
    return;
  }
  
  if (nuevaClave) {
    // En un sistema real, esto se enviaría al servidor
    localStorage.setItem('password', nuevaClave);
    
    // Limpiar campos
    document.getElementById('nuevaClave').value = '';
    document.getElementById('confirmarClave').value = '';
    
    mostrarNotificación('Contraseña cambiada correctamente', 'success');
  }
}

// Crear backup
async function crearBackup() {
  try {
    // Obtener todos los datos
    const [jugadoresResponse, pagosResponse] = await Promise.all([
      apiRequest('getJugadores'),
      apiRequest('getPagos')
    ]);
    
    if (jugadoresResponse.status === 'success' && pagosResponse.status === 'success') {
      // Crear objeto de backup
      const backup = {
        fecha: new Date().toISOString(),
        jugadores: jugadoresResponse.data,
        pagos: pagosResponse.data,
        configuracion: {
          categorias: categorias,
          valoresCategoria: valoresCategoria,
          diasRecordatorio: localStorage.getItem('diasRecordatorio'),
          mensajeRecordatorio: localStorage.getItem('mensajeRecordatorio'),
          habilitarRecordatorios: localStorage.getItem('habilitarRecordatorios'),
          nombreEscuela: localStorage.getItem('nombreEscuela'),
          telefonoEscuela: localStorage.getItem('telefonoEscuela'),
          emailEscuela: localStorage.getItem('emailEscuela'),
          direccionEscuela: localStorage.getItem('direccionEscuela')
        }
      };
      
      // Descargar archivo
      const dataStr = JSON.stringify(backup, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `backup_efusa_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      mostrarNotificación('Backup creado y descargado correctamente', 'success');
    }
  } catch (error) {
    console.error('Error al crear backup:', error);
    mostrarNotificación('Error al crear backup', 'error');
  }
}

// Restaurar backup
function restaurarBackup() {
  const archivo = document.getElementById('archivoBackup').files[0];
  
  if (!archivo) {
    mostrarNotificación('Por favor seleccione un archivo de backup', 'error');
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = async function(e) {
    try {
      const backup = JSON.parse(e.target.result);
      
      // Confirmar restauración
      if (!confirm('¿Está seguro de que desea restaurar este backup? Se reemplazarán todos los datos actuales.')) {
        return;
      }
      
      // Restaurar configuración
      if (backup.configuracion) {
        const config = backup.configuracion;
        
        if (config.categorias) categorias = config.categorias;
        if (config.valoresCategoria) valoresCategoria = config.valoresCategoria;
        
        // Guardar en localStorage
        Object.keys(config).forEach(key => {
          if (config[key] !== undefined) {
            localStorage.setItem(key, config[key]);
          }
        });
        
        // Actualizar UI
        actualizarListaCategorias();
        actualizarSelectCategorias();
        cargarConfiguracion();
      }
      
      // Notificar que se requiere recargar la página
      mostrarNotificación('Backup restaurado correctamente. Por favor recargue la página para ver los cambios.', 'success');
    } catch (error) {
      console.error('Error al restaurar backup:', error);
      mostrarNotificación('Error al restaurar backup. El archivo podría estar dañado.', 'error');
    }
  };
  
  reader.readAsText(archivo);
}