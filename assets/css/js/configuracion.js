// Variables globales
let categorias = [];
let valoresCategoria = {};

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarConfiguracion();
  configurarEventListeners();
});

// Configurar event listeners
function configurarEventListeners() {
  // Tabs de configuración
  const tabs = document.querySelectorAll('.tab-config');
  const contenidos = document.querySelectorAll('.contenido-config');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const objetivo = tab.getAttribute('data-target');
      
      // Desactivar todos los tabs y contenidos
      tabs.forEach(t => t.classList.remove('active', 'bg-blue-600', 'text-white'));
      tabs.forEach(t => t.classList.add('bg-gray-200', 'text-gray-700'));
      
      contenidos.forEach(c => c.classList.add('hidden'));
      
      // Activar tab y contenido seleccionados
      tab.classList.remove('bg-gray-200', 'text-gray-700');
      tab.classList.add('active', 'bg-blue-600', 'text-white');
      
      document.getElementById(objetivo).classList.remove('hidden');
    });
  });
  
  // Formularios
  document.getElementById('formCategoria').addEventListener('submit', (e) => {
    e.preventDefault();
    agregarCategoria();
  });
  
  document.getElementById('formValorCategoria').addEventListener('submit', (e) => {
    e.preventDefault();
    actualizarValorCategoria();
  });
  
  document.getElementById('formRecordatorios').addEventListener('submit', (e) => {
    e.preventDefault();
    guardarConfiguracionRecordatorios();
  });
  
  document.getElementById('formContacto').addEventListener('submit', (e) => {
    e.preventDefault();
    guardarConfiguracionContacto();
  });
  
  document.getElementById('formClave').addEventListener('submit', (e) => {
    e.preventDefault();
    cambiarClave();
  });
}

// Cargar configuración
function cargarConfiguracion() {
  // Cargar categorías y valores desde localStorage
  const valoresGuardados = localStorage.getItem('valoresCategoria');
  if (valoresGuardados) {
    valoresCategoria = JSON.parse(valoresGuardados);
    categorias = Object.keys(valoresCategoria);
  } else {
    // Valores por defecto
    categorias = ['Infantil', 'Juvenil', 'Juvenil A', 'Pre-juvenil', 'Senior'];
    categorias.forEach(categoria => {
      valoresCategoria[categoria] = 50000; // Valor por defecto
    });
    localStorage.setItem('valoresCategoria', JSON.stringify(valoresCategoria));
  }
  
  // Actualizar UI
  actualizarListaCategorias();
  actualizarSelectCategorias();
  
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

// Actualizar lista de categorías
function actualizarListaCategorias() {
  const listaCategorias = document.getElementById('listaCategorias');
  listaCategorias.innerHTML = '';
  
  if (categorias.length === 0) {
    listaCategorias.innerHTML = '<p class="text-gray-500 text-center py-4">No hay categorías registradas</p>';
    return;
  }
  
  categorias.forEach(categoria => {
    const valor = valoresCategoria[categoria] || 0;
    
    const div = document.createElement('div');
    div.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-lg';
    
    div.innerHTML = `
      <div>
        <span class="font-medium">${categoria}</span>
        <span class="text-sm text-gray-600 ml-2">$${valor.toLocaleString()}</span>
      </div>
      <div class="flex gap-2">
        <button onclick="editarValorCategoria('${categoria}')" class="text-blue-600 hover:text-blue-800" title="Editar valor">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="eliminarCategoria('${categoria}')" class="text-red-600 hover:text-red-800" title="Eliminar categoría">
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

// Editar valor de categoría
function editarValorCategoria(categoria) {
  document.getElementById('categoriaValor').value = categoria;
  document.getElementById('valorMensualidad').value = valoresCategoria[categoria] || '';
  
  // Hacer scroll al formulario
  document.getElementById('formValorCategoria').scrollIntoView({ behavior: 'smooth' });
  
  // Enfocar el input de valor
  document.getElementById('valorMensualidad').focus();
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
  valoresCategoria[nombre] = 50000; // Valor por defecto
  
  // Guardar en localStorage
  localStorage.setItem('valoresCategoria', JSON.stringify(valoresCategoria));
  
  // Actualizar UI
  actualizarListaCategorias();
  actualizarSelectCategorias();
  
  // Limpiar input
  input.value = '';
  
  mostrarNotificacion('Categoría agregada correctamente', 'success');
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
    mostrarNotificacion('Por favor ingrese un valor válido', 'error');
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
  
  mostrarNotificacion('Valor actualizado correctamente', 'success');
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
  const claveActual = document.getElementById('claveActual').value;
  const nuevaClave = document.getElementById('nuevaClave').value;
  const confirmarClave = document.getElementById('confirmarClave').value;
  
  // En un sistema real, se verificaría la clave actual con el servidor
  const claveGuardada = localStorage.getItem('password') || '1234'; // Clave por defecto
  
  if (claveActual !== claveGuardada) {
    mostrarNotificacion('La clave actual es incorrecta', 'error');
    return;
  }
  
  if (nuevaClave && nuevaClave !== confirmarClave) {
    mostrarNotificacion('Las contraseñas no coinciden', 'error');
    return;
  }
  
  if (nuevaClave && nuevaClave.length < 4) {
    mostrarNotificacion('La contraseña debe tener al menos 4 caracteres', 'error');
    return;
  }
  
  if (nuevaClave) {
    // Guardar nueva clave
    localStorage.setItem('password', nuevaClave);
    
    // Limpiar campos
    document.getElementById('claveActual').value = '';
    document.getElementById('nuevaClave').value = '';
    document.getElementById('confirmarClave').value = '';
    
    mostrarNotificacion('Contraseña cambiada correctamente', 'success');
  }
}

// Crear backup
async function crearBackup() {
  try {
    // Obtener todos los datos
    const [jugadoresResponse, pagosResponse] = await Promise.all([
      getJugadores(),
      getPagos()
    ]);
    
    if (jugadoresResponse.status === 'success' && pagosResponse.status === 'success') {
      // Crear objeto de backup
      const backup = {
        version: '1.0',
        fecha: new Date().toISOString(),
        datos: {
          jugadores: jugadoresResponse.data,
          pagos: pagosResponse.data
        },
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
      
      mostrarNotificacion('Backup creado y descargado correctamente', 'success');
    }
  } catch (error) {
    console.error('Error al crear backup:', error);
    mostrarNotificacion('Error al crear backup', 'error');
  }
}

// Restaurar backup
function restaurarBackup() {
  const archivo = document.getElementById('archivoBackup').files[0];
  
  if (!archivo) {
    mostrarNotificacion('Por favor seleccione un archivo de backup', 'error');
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = async function(e) {
    try {
      const backup = JSON.parse(e.target.result);
      
      // Verificar versión del backup
      if (!backup.version) {
        mostrarNotificacion('El archivo de backup no es válido o es de una versión incompatible', 'error');
        return;
      }
      
      // Confirmar restauración
      if (!confirm('¿Está seguro de que desea restaurar este backup? Se reemplazarán todos los datos actuales.')) {
        return;
      }
      
      // Restaurar datos (en un sistema real, se enviarían al servidor)
      if (backup.datos.jugadores) {
        // Aquí iría la lógica para restaurar jugadores
        console.log('Restaurando jugadores...', backup.datos.jugadores.length);
      }
      
      if (backup.datos.pagos) {
        // Aquí iría la lógica para restaurar pagos
        console.log('Restaurando pagos...', backup.datos.pagos.length);
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
      
      mostrarNotificacion('Backup restaurado correctamente. Por favor recargue la página para ver todos los cambios.', 'success');
      
    } catch (error) {
      console.error('Error al restaurar backup:', error);
      mostrarNotificacion('Error al restaurar backup. El archivo podría estar dañado.', 'error');
    }
  };
  
  reader.readAsText(archivo);
}

// Hacer funciones disponibles globalmente
window.editarValorCategoria = editarValorCategoria;
window.agregarCategoria = agregarCategoria;
window.eliminarCategoria = eliminarCategoria;
window.actualizarValorCategoria = actualizarValorCategoria;
window.crearBackup = crearBackup;
window.restaurarBackup = restaurarBackup;