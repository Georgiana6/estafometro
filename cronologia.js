/* Cronología de un incidente. Vive solo en memoria: al cerrar la página desaparece. */
(function () {
  'use strict';
  var entradas = [];
  var lista = document.getElementById('lista-cronologia');
  var momento = document.getElementById('momento');
  var hecho = document.getElementById('hecho');
  var estado = document.getElementById('estado-copia');

  function legible(v) {
    var d = new Date(v);
    return isNaN(d) ? v : d.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
  }

  function pintar() {
    entradas.sort(function (a, b) { return a.momento < b.momento ? -1 : a.momento > b.momento ? 1 : 0; });
    while (lista.firstChild) lista.removeChild(lista.firstChild);
    entradas.forEach(function (e) {
      var li = document.createElement('li');
      var hora = document.createElement('time');
      hora.textContent = legible(e.momento);
      var texto = document.createElement('span');
      texto.textContent = e.hecho;
      var quitar = document.createElement('button');
      quitar.type = 'button';
      quitar.textContent = 'Quitar';
      quitar.setAttribute('aria-label', 'Quitar: ' + e.hecho);
      quitar.addEventListener('click', function () {
        entradas.splice(entradas.indexOf(e), 1);
        pintar();
      });
      li.appendChild(hora);
      li.appendChild(texto);
      li.appendChild(quitar);
      lista.appendChild(li);
    });
  }

  document.getElementById('form-cronologia').addEventListener('submit', function (ev) {
    ev.preventDefault();
    entradas.push({ momento: momento.value, hecho: hecho.value.trim() });
    hecho.value = '';
    pintar();
    hecho.focus();
  });

  document.getElementById('copiar').addEventListener('click', function () {
    var texto = entradas.map(function (e) { return legible(e.momento) + ' - ' + e.hecho; }).join('\n');
    if (!texto) { estado.textContent = 'Añade primero algún hecho.'; return; }
    navigator.clipboard.writeText(texto).then(function () {
      estado.textContent = 'Cronología copiada.';
    }, function () {
      estado.textContent = 'No se ha podido copiar. Usa la opción de imprimir.';
    });
  });

  document.getElementById('imprimir').addEventListener('click', function () { window.print(); });
})();
