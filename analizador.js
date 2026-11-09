/* Estafómetro: analizador por reglas. Funciona solo en el navegador y no hace ninguna petición de red. */
(function (raiz) {
  'use strict';

  var MARCAS = [
    { nombre: 'Correos', patron: /\bCorreos\b(?!\s+electr[oó]nicos)|\bCORREOS\b/, dominios: ['correos.es', 'correosexpress.com'] },
    { nombre: 'DGT', patron: /\bDGT\b|Direcci[oó]n General de Tr[aá]fico/i, dominios: ['dgt.es', 'dgt.gob.es'] },
    { nombre: 'Agencia Tributaria', patron: /Agencia Tributaria|\bHacienda\b|\bAEAT\b/i, dominios: ['agenciatributaria.gob.es', 'agenciatributaria.es', 'aeat.es'] },
    { nombre: 'Seguridad Social', patron: /Seguridad Social/i, dominios: ['seg-social.es', 'seg-social.gob.es'] },
    { nombre: 'BBVA', patron: /\bBBVA\b/i, dominios: ['bbva.es', 'bbva.com'] },
    { nombre: 'Santander', patron: /\bBanco Santander\b|\bSantander\b/, dominios: ['bancosantander.es', 'santander.com', 'santander.es'] },
    { nombre: 'CaixaBank', patron: /\bCaixa\s?Bank\b|\bLa Caixa\b/i, dominios: ['caixabank.es', 'caixabank.com'] },
    { nombre: 'Sabadell', patron: /\bBanco Sabadell\b|\bSabadell\b/, dominios: ['bancsabadell.com', 'sabadell.com'] },
    { nombre: 'ING', patron: /\bING\b/, dominios: ['ing.es', 'ing.com'] },
    { nombre: 'Bizum', patron: /\bBizum\b/i, dominios: ['bizum.es'] },
    { nombre: 'SEUR', patron: /\bSEUR\b/i, dominios: ['seur.com', 'seur.es'] },
    { nombre: 'DHL', patron: /\bDHL\b/i, dominios: ['dhl.com', 'dhl.es'] },
    { nombre: 'GLS', patron: /\bGLS\b/, dominios: ['gls-spain.es', 'gls-group.com', 'gls-group.eu'] },
    { nombre: 'MRW', patron: /\bMRW\b/, dominios: ['mrw.es'] },
    { nombre: 'Amazon', patron: /\bAmazon\b/i, dominios: ['amazon.es', 'amazon.com'] },
    { nombre: 'Netflix', patron: /\bNetflix\b/i, dominios: ['netflix.com'] },
    { nombre: 'PayPal', patron: /\bPay\s?Pal\b/i, dominios: ['paypal.com', 'paypal.es'] },
    { nombre: 'Iberdrola', patron: /\bIberdrola\b/i, dominios: ['iberdrola.es', 'iberdrola.com'] },
    { nombre: 'Endesa', patron: /\bEndesa\b/i, dominios: ['endesa.com', 'endesa.es'] },
    { nombre: 'Movistar', patron: /\bMovistar\b/i, dominios: ['movistar.es', 'telefonica.es'] },
    { nombre: 'Vodafone', patron: /\bVodafone\b/i, dominios: ['vodafone.es', 'vodafone.com'] },
    { nombre: 'Microsoft', patron: /\bMicrosoft\b|\bOutlook\b|\bOffice 365\b/i, dominios: ['microsoft.com', 'office.com', 'live.com', 'outlook.com'] },
    { nombre: 'Google', patron: /\bGoogle\b|\bGmail\b/i, dominios: ['google.com', 'google.es', 'gmail.com'] },
    { nombre: 'Apple', patron: /\bApple\b|\biCloud\b/, dominios: ['apple.com', 'icloud.com'] }
  ];

  var ACORTADORES = ['bit.ly', 'tinyurl.com', 't.co', 'cutt.ly', 'is.gd', 'ow.ly', 'rebrand.ly', 'shorturl.at', 'tiny.cc', 'rb.gy', 'goo.su', 's.id', 't.ly', 'v.gd'];
  var TLD_RIESGO = ['top', 'xyz', 'icu', 'click', 'cfd', 'sbs', 'buzz', 'live', 'shop', 'vip', 'cyou', 'rest', 'bond', 'lat', 'monster', 'quest', 'mom', 'loan', 'work', 'support', 'help'];
  var TLD_CONOCIDOS = 'com|es|org|net|eu|info|io|me|co|app|site|online|store|gob\\.es|' + TLD_RIESGO.join('|');

  var REGLAS = [
    { id: 'urgencia', titulo: 'Te mete prisa', detalle: 'Las estafas buscan que actúes antes de pensar.', puntos: 18,
      patron: /\burgente\b|inmediatamente|de inmediato|[uú]ltim[oa] (aviso|oportunidad)|\b(24|48)\s*h(oras)?\b|hoy mismo|caduca|antes de que|plazo (limite|límite|de)/i },
    { id: 'amenaza', titulo: 'Te amenaza con una consecuencia', detalle: 'Multas, bloqueos o denuncias repentinas son un gancho clásico.', puntos: 20,
      patron: /\bmulta\b|embargo|sanci[oó]n|denuncia|orden judicial|bloquead[oa]|suspendid[oa]|restringid[oa]|cancelar[aá]|desactivad[oa]/i },
    { id: 'credenciales', titulo: 'Pide datos que nadie legítimo pide así', detalle: 'Bancos y organismos no piden claves, PIN o códigos por mensaje.', puntos: 32,
      patron: /contrase[nñ]a|\bPIN\b|\bCVV\b|\bCVC\b|datos bancarios|n[uú]mero de (tu )?tarjeta|c[oó]digo (de verificaci[oó]n|que te|SMS)|credenciales|verifica(r)? tu (cuenta|identidad)|confirma(r)? tus datos/i,
      excepto: /no (lo|la|los|las) compartas|no compartas|no (lo|la) facilites|nunca te (pediremos|solicitaremos)/i },
    { id: 'pago', titulo: 'Pide un pago pequeño o inesperado', detalle: 'Un cobro de pocos euros suele servir para capturar la tarjeta.', puntos: 26,
      patron: /(paga|pague|pagar|abona|abone|abonar|importe de|tasa de|coste de)\s[\s\S]{0,30}\b[0-3][.,]\d{2}\s?(€|eur)|\b[0-3][.,]\d{2}\s?(€|eur)[\s\S]{0,30}(de gastos|tasa|aduana|liberar|reprogramar)|gastos de (env[ií]o|gesti[oó]n)|tasas? de aduanas?|pago pendiente/i },
    { id: 'pide-dinero', titulo: 'Te pide que envíes dinero', detalle: 'Antes de enviar nada, confirma por otra vía quién te lo pide.', puntos: 22,
      patron: /(hazme|me (puedes|podr[ií]as) hacer|necesito que me hagas)\s+(un|una)\s+(bizum|transferencia)|env[ií]ame (dinero|\d+\s?€)/i },
    { id: 'paquete', titulo: 'Habla de un paquete retenido', detalle: 'Es uno de los engaños por SMS más frecuentes.', puntos: 16,
      patron: /paquete|env[ií]o.*(retenid|pendiente|detenid)|entrega (fallida|pendiente)|direcci[oó]n incompleta|reprogram|no ha podido (ser )?entreg/i },
    { id: 'premio', titulo: 'Promete un premio o devolución', detalle: 'Nadie regala dinero por sorpresa a cambio de tus datos.', puntos: 20,
      patron: /has ganado|enhorabuena|premio|sorteo|reembolso|devoluci[oó]n de|te corresponde/i },
    { id: 'familiar', titulo: 'Se hace pasar por un familiar', detalle: 'Llama o escribe al número de siempre antes de hacer nada.', puntos: 42,
      patron: /(hola\s+)?(mam[aá]|pap[aá]|hij[oa])[\s\S]{0,80}(n[uú]mero nuevo|cambiado de n[uú]mero|se me ha (roto|ca[ií]do)[\s\S]{0,15}(m[oó]vil|tel[eé]fono)|m[oó]vil (roto|nuevo))|(n[uú]mero nuevo|cambiado de n[uú]mero|se me ha (roto|ca[ií]do)[\s\S]{0,20}m[oó]vil)[\s\S]{0,120}(mam[aá]|pap[aá]|bizum|transfer)/i },
    { id: 'inversion', titulo: 'Promete dinero fácil', detalle: 'La rentabilidad garantizada no existe.', puntos: 34,
      patron: /rentabilidad garantizada|inversi[oó]n segura|gana(r)? \d+.{0,8}(al d[ií]a|a la semana)|criptomonedas?.*(gana|invierte|beneficio)|trabajo desde casa.*(gana|\d+\s?€)|dar me gusta/i },
    { id: 'extorsion', titulo: 'Parece una extorsión', detalle: 'Suelen ser envíos masivos. No pagues y no respondas.', puntos: 42,
      patron: /(webcam|te he grabado|contenido (sexual|para adultos)|pornograf|pedofil)[\s\S]{0,200}(bitcoin|btc|pagar?|multa|denuncia)|(bitcoin|btc)[\s\S]{0,200}(webcam|te he grabado)/i },
    { id: 'tarifa', titulo: 'Te hace llamar a un número de pago', detalle: 'Los números 803, 806, 807 y 905 tienen coste adicional.', puntos: 24,
      patron: /\b(803|806|807|905)[\s.-]?\d{3}[\s.-]?\d{3}\b/ },
    { id: 'pulsa', titulo: 'Te empuja a pulsar un enlace', detalle: 'Entra siempre escribiendo tú la web oficial o desde su aplicación.', puntos: 10,
      patron: /(pulsa|haz clic|clic aqu[ií]|accede|entra|sigue el enlace|visita)[\s\S]{0,30}(enlace|aqu[ií]|https?:|www\.)/i }
  ];

  function normalizarTexto(t) {
    return String(t || '')
      .replace(/​|‌|‍|﻿/g, '')
      .replace(/hxxp/gi, 'http')
      .replace(/\[\.\]|\(\.\)/g, '.');
  }

  function extraerEnlaces(texto) {
    var encontrados = [];
    var vistos = {};
    var conEsquema = /\bhttps?:\/\/[^\s<>"'()]+/gi;
    var sinEsquema = new RegExp('(?:^|[\\s(:])((?:[a-z0-9-]+\\.)+(?:' + TLD_CONOCIDOS + ')(?:\\/[^\\s<>"\')]*)?)(?=$|[\\s),.;:!?])', 'gi');
    var m;
    function anadir(url) {
      url = url.replace(/[.,;:!?)]+$/, '');
      var clave = url.toLowerCase();
      if (!vistos[clave]) { vistos[clave] = 1; encontrados.push(url); }
    }
    var zonaCabeceras = texto.split(/\r?\n/).filter(function (l) { return !/^(Received|Authentication-Results|DKIM-Signature|Message-ID|ARC-[\w-]+|X-[\w-]+|Return-Path|From|Reply-To|To|Subject|Date):/i.test(l); }).join('\n');
    while ((m = conEsquema.exec(zonaCabeceras))) anadir(m[0]);
    while ((m = sinEsquema.exec(zonaCabeceras))) {
      if (m[1].indexOf('@') === -1 && !encontrados.some(function (u) { return u.toLowerCase().indexOf(m[1].toLowerCase()) !== -1; })) anadir(m[1]);
    }
    return encontrados;
  }

  function hostDe(url) {
    var limpio = url.replace(/^https?:\/\//i, '');
    var conUsuario = limpio.split(/[/?#]/)[0];
    return { host: conUsuario.split('@').pop().split(':')[0].toLowerCase(), tieneArroba: conUsuario.indexOf('@') !== -1 };
  }

  function esDe(host, dominio) { return host === dominio || host.slice(-(dominio.length + 1)) === '.' + dominio; }

  function ocultarEnlace(url) { return url.replace(/^http/i, 'hxxp').replace(/\./g, '[.]'); }

  function dominioDeCorreo(linea) {
    var m = /@([a-z0-9.-]+\.[a-z]{2,})/i.exec(linea || '');
    return m ? m[1].toLowerCase() : '';
  }

  function raizDominio(d) {
    var p = d.split('.');
    return p.slice(-2).join('.');
  }

  function analizarCabeceras(texto, senales) {
    if (!/^(Received|Authentication-Results|Return-Path|From):/im.test(texto)) return false;
    var aut = (texto.match(/^Authentication-Results:[\s\S]*?(?=\r?\n\S|$)/im) || [''])[0];
    ['spf', 'dkim', 'dmarc'].forEach(function (nombre) {
      var m = new RegExp('\\b' + nombre + '=(fail|softfail|none)', 'i').exec(aut);
      if (m) senales.push({ id: 'cab-' + nombre, titulo: nombre.toUpperCase() + ' no valida el remitente', detalle: 'El resultado es «' + m[1].toLowerCase() + '»: el servidor no ha podido confirmar quién envía el correo.', puntos: m[1].toLowerCase() === 'none' ? 8 : 22, evidencia: m[0] });
    });
    var from = dominioDeCorreo((texto.match(/^From:.*$/im) || [''])[0]);
    var reply = dominioDeCorreo((texto.match(/^Reply-To:.*$/im) || [''])[0]);
    if (from && reply && raizDominio(from) !== raizDominio(reply)) {
      senales.push({ id: 'cab-reply', titulo: 'Las respuestas irían a otro dominio', detalle: 'Escribe desde ' + from + ', pero la respuesta iría a ' + reply + '.', puntos: 24, evidencia: 'Reply-To: ' + reply });
    }
    return true;
  }

  function analizarEnlaces(enlaces, marcasCitadas, senales) {
    var ids = {};
    function senal(s) { if (!ids[s.id]) { ids[s.id] = 1; senales.push(s); } }
    enlaces.forEach(function (url) {
      var h = hostDe(url), host = h.host, visible = ocultarEnlace(url);
      if (ACORTADORES.indexOf(host) !== -1) {
        senal({ id: 'acortador', titulo: 'Usa un enlace acortado', detalle: 'Oculta el destino real.', puntos: 22, evidencia: visible });
        if (marcasCitadas.length) senal({ id: 'marca-acortada', titulo: 'Menciona a ' + marcasCitadas[0].nombre + ' con un enlace acortado', detalle: 'Una entidad seria suele enlazar a su propio dominio.', puntos: 30, evidencia: visible });
      }
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) senal({ id: 'ip', titulo: 'El enlace apunta a una dirección IP', detalle: 'Las empresas legítimas usan su nombre de dominio.', puntos: 34, evidencia: visible });
      if (/(^|\.)xn--/.test(host)) senal({ id: 'punycode', titulo: 'El dominio imita letras con caracteres raros', detalle: 'Puede parecer idéntico al real sin serlo.', puntos: 34, evidencia: visible });
      if (h.tieneArroba) senal({ id: 'arroba', titulo: 'El enlace esconde su destino tras una @', detalle: 'Lo que hay antes de la @ no es el sitio real.', puntos: 34, evidencia: visible });
      var tld = host.split('.').pop();
      if (TLD_RIESGO.indexOf(tld) !== -1) senal({ id: 'tld', titulo: 'Dominio con terminación muy usada en fraudes', detalle: 'La terminación .' + tld + ' por sí sola no prueba nada, pero es una mala señal junto a otras.', puntos: 20, evidencia: visible });
      if (/^http:\/\//i.test(url)) senal({ id: 'http', titulo: 'El enlace no usa conexión cifrada', detalle: 'Ninguna entidad seria pide datos por http.', puntos: 10, evidencia: visible });
      marcasCitadas.forEach(function (marca) {
        var oficial = marca.dominios.some(function (d) { return esDe(host, d); });
        if (!oficial && ACORTADORES.indexOf(host) === -1) {
          senal({ id: 'marca-' + marca.nombre, titulo: 'Menciona a ' + marca.nombre + ', pero el enlace no es suyo', detalle: 'El dominio real es ' + host + '. Comprueba la dirección oficial desde su web o aplicación.', puntos: 42, evidencia: visible });
        }
      });
    });
  }

  function analizar(entrada) {
    var texto = normalizarTexto(entrada);
    var senales = [];
    if (!texto.trim()) return { puntuacion: 0, nivel: 'vacio', senales: [], enlaces: [], marcas: [], esCorreo: false };

    var esCorreo = analizarCabeceras(texto, senales);
    REGLAS.forEach(function (r) {
      var m = r.patron.exec(texto);
      if (m && !(r.excepto && r.excepto.test(texto))) senales.push({ id: r.id, titulo: r.titulo, detalle: r.detalle, puntos: r.puntos, evidencia: m[0].slice(0, 90) });
    });

    var marcas = MARCAS.filter(function (m) { return m.patron.test(texto); });
    var enlaces = extraerEnlaces(texto);
    analizarEnlaces(enlaces, marcas, senales);

    var total = senales.reduce(function (s, x) { return s + x.puntos; }, 0);
    var puntuacion = Math.min(100, total);
    var nivel = puntuacion >= 60 ? 'alto' : puntuacion >= 25 ? 'medio' : 'bajo';
    senales.sort(function (a, b) { return b.puntos - a.puntos; });
    return { puntuacion: puntuacion, nivel: nivel, senales: senales, enlaces: enlaces.map(ocultarEnlace), marcas: marcas.map(function (m) { return m.nombre; }), esCorreo: esCorreo };
  }

  var api = { analizar: analizar };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  raiz.Estafometro = api;
})(typeof window !== 'undefined' ? window : globalThis);
