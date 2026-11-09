/* Interfaz del Estafómetro. Todo el texto del usuario se pinta con textContent. */
(function () {
  'use strict';

  var EJEMPLOS = {
    paquete: 'Correos: su paquete está retenido por dirección incompleta. Abone 1,99 € de gastos de envío antes de 24 horas en https://correos-entrega.ejemplo.top/pago',
    familiar: 'Hola mamá, se me ha roto el móvil y este es mi número nuevo. Necesito que me hagas un Bizum urgente, luego te lo devuelvo.',
    normal: 'Hola, te confirmo la cita del jueves a las 17:00. Si no puedes avísame y buscamos otro día.'
  };

  var TEXTOS = {
    alto: ['Muy probable estafa', 'No pulses enlaces, no respondas y no des ningún dato.'],
    medio: ['Sospechoso', 'Tiene señales de alerta. Compruébalo por un canal oficial antes de actuar.'],
    bajo: ['Sin señales claras', 'No he detectado patrones típicos, pero eso no garantiza que sea seguro.']
  };

  var mensaje = document.getElementById('mensaje');
  var resultado = document.getElementById('resultado');

  function crear(etiqueta, clase, texto) {
    var el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  function vaciar(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  function pintar(r) {
    vaciar(resultado);
    if (r.nivel === 'vacio') {
      resultado.hidden = false;
      resultado.className = 'resultado';
      resultado.appendChild(crear('p', '', 'Pega primero el mensaje que quieras comprobar.'));
      resultado.focus();
      return;
    }
    var textos = TEXTOS[r.nivel];
    resultado.hidden = false;
    resultado.className = 'resultado ' + r.nivel;

    var cab = crear('div', 'veredicto');
    cab.appendChild(crear('strong', 'cifra', String(r.puntuacion)));
    var titulares = crear('div');
    titulares.appendChild(crear('h2', '', textos[0]));
    titulares.appendChild(crear('p', '', textos[1]));
    cab.appendChild(titulares);
    resultado.appendChild(cab);

    var barra = crear('div', 'barra');
    var relleno = crear('span');
    relleno.style.width = r.puntuacion + '%';
    barra.appendChild(relleno);
    resultado.appendChild(barra);

    if (r.senales.length) {
      resultado.appendChild(crear('h3', '', 'Por qué'));
      var lista = crear('ul', 'senales');
      r.senales.forEach(function (s) {
        var li = crear('li');
        li.appendChild(crear('strong', '', s.titulo));
        li.appendChild(crear('p', '', s.detalle));
        if (s.evidencia) li.appendChild(crear('code', '', s.evidencia));
        lista.appendChild(li);
      });
      resultado.appendChild(lista);
    }

    resultado.appendChild(crear('h3', '', 'Qué hacer'));
    var pasos = crear('ul', 'pasos');
    (r.nivel === 'bajo'
      ? ['Si esperabas el mensaje y conoces a quien lo envía, actúa con normalidad.', 'Si te pide dinero o datos, confirma antes por otra vía.']
      : ['No pulses el enlace ni llames al número del mensaje.', 'Entra por tu cuenta en la web o aplicación oficial para comprobarlo.', 'Bloquea al remitente y borra el mensaje.', 'Si tienes dudas, llama al 017 de INCIBE: es gratuito y confidencial.']
    ).forEach(function (t) { pasos.appendChild(crear('li', '', t)); });
    resultado.appendChild(pasos);

    var ayuda = crear('p', 'ayuda-final');
    var enlace = crear('a', '', '¿Ya has pulsado o has dado datos? Ve a La primera hora');
    enlace.href = 'primera-hora.html';
    ayuda.appendChild(enlace);
    resultado.appendChild(ayuda);
    resultado.focus();
  }

  document.getElementById('analizar').addEventListener('click', function () { pintar(window.Estafometro.analizar(mensaje.value)); });
  document.getElementById('limpiar').addEventListener('click', function () {
    mensaje.value = '';
    vaciar(resultado);
    resultado.hidden = true;
    mensaje.focus();
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-ejemplo]'), function (b) {
    b.addEventListener('click', function () {
      mensaje.value = EJEMPLOS[b.getAttribute('data-ejemplo')];
      pintar(window.Estafometro.analizar(mensaje.value));
    });
  });
})();
