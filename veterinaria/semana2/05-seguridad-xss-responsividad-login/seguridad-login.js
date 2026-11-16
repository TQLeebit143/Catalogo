const usuariosSistema = [
  { user: "admin", pass: "admin123", rol: "ADMIN", nombre: "Dr. Jorge Castillo (MVZ)" },
  { user: "recepcion", pass: "vet2026", rol: "RECEPCION", nombre: "Recepción Don Gato" },
  { user: "doctor", pass: "jorge2026", rol: "ADMIN", nombre: "Dr. Jorge Castillo" }
];

let usuarioActual = null; 

function initSeguridadYLogin() {
  
  const guardado = sessionStorage.getItem('dongato_usuario_sesion');
  if (guardado) {
    try {
      usuarioActual = JSON.parse(guardado);
      aplicarRolEnInterfaz();
    } catch(e) {
      usuarioActual = null;
    }
  } else {
    aplicarRolEnInterfaz(); 
  }

  $('#btn-abrir-login, #btn-abrir-login-mob').on('click', function(e) {
    e.preventDefault();
    if (usuarioActual) {
 
      cerrarSesionUsuario();
    } else {
      $('#modal-login').fadeIn(200).addClass('activo');
      $('#input-login-user').focus();
    }
  });

  $('#form-login-admin').on('submit', function(e) {
    e.preventDefault();
    const user = sanitizarTexto($('#input-login-user').val().trim());
    const pass = $('#input-login-pass').val();

    const encontrado = usuariosSistema.find(u => u.user.toLowerCase() === user.toLowerCase() && u.pass === pass);

    if (encontrado) {
      usuarioActual = encontrado;
      sessionStorage.setItem('dongato_usuario_sesion', JSON.stringify(encontrado));
      
      $('#modal-login').fadeOut(150).removeClass('activo');
      $('#form-login-admin')[0].reset();
      
      aplicarRolEnInterfaz();

      if (typeof mostrarToast === 'function') {
        mostrarToast('BIENVENIDO', `Sesión iniciada como ${encontrado.nombre}`);
      }
      if (typeof registrarBitacoraEvento === 'function') {
        registrarBitacoraEvento('LOGIN_OK', `Acceso concedido a [${encontrado.rol}] ${encontrado.nombre}`);
      }
    } else {
      $('#login-error-msg').text('Credenciales inválidas. Revisa usuario y contraseña.').show();
      if (typeof registrarBitacoraEvento === 'function') {
        registrarBitacoraEvento('LOGIN_FAIL', `Intento fallido con usuario: "${user}"`);
      }
    }
  });

  $('#btn-cerrar-sesion').on('click', function() {
    cerrarSesionUsuario();
  });
}

function cerrarSesionUsuario() {
  if (confirm("¿Deseas cerrar la sesión de administración?")) {
    const nombre = usuarioActual ? usuarioActual.nombre : '';
    usuarioActual = null;
    sessionStorage.removeItem('dongato_usuario_sesion');
    aplicarRolEnInterfaz();

    if (typeof mostrarToast === 'function') {
      mostrarToast('SESIÓN CERRADA', 'Has vuelto al modo Cliente público.');
    }
    if (typeof registrarBitacoraEvento === 'function') {
      registrarBitacoraEvento('LOGOUT', `Sesión finalizada de: ${nombre}`);
    }
  }
}

function aplicarRolEnInterfaz() {
  const panelAdmin = $('#seccion-bitacora-admin');
  const bannerAdmin = $('#banner-admin-status');
  const btnLogin = $('#btn-abrir-login, #btn-abrir-login-mob');

  if (usuarioActual && (usuarioActual.rol === 'ADMIN' || usuarioActual.rol === 'RECEPCION')) {
  
    panelAdmin.slideDown(300);
    bannerAdmin.show();
    $('#admin-nombre-tag').text(usuarioActual.nombre);
    $('#admin-rol-tag').text(`[${usuarioActual.rol}]`);
    btnLogin.html(`🔓 Salir (${usuarioActual.user})`).addClass('btn-logged');
  } else {

    panelAdmin.slideUp(200);
    bannerAdmin.hide();
    btnLogin.html('🔒 Acceso Admin').removeClass('btn-logged');
  }
}

// Prevención de inyección XSS
function sanitizarTexto(str) {
  if (!str) return '';
  return $('<div>').text(str).html();
}
