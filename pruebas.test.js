const test = require('node:test');
const assert = require('node:assert');
const { analizar } = require('./analizador.js');

test('paquete falso de Correos: alto y detecta la suplantación', () => {
  const r = analizar('Correos: su paquete está retenido. Abone 1,99 € antes de 24 horas en https://correos-entrega.ejemplo.top/pago');
  assert.equal(r.nivel, 'alto');
  assert.ok(r.senales.some(s => s.id === 'marca-Correos'));
  assert.ok(r.senales.some(s => s.id === 'tld'));
});

test('enlace oficial no se marca como suplantación', () => {
  const r = analizar('Correos: consulta tu envío en https://www.correos.es/seguimiento');
  assert.ok(!r.senales.some(s => s.id === 'marca-Correos'));
});

test('dominio oficial como subdominio falso se detecta', () => {
  const r = analizar('Correos: tienes un envío en https://correos.es.entregas-seguras.com/a');
  assert.ok(r.senales.some(s => s.id === 'marca-Correos'));
});

test('«correos electrónicos» no cuenta como la marca Correos', () => {
  const r = analizar('Te reenvío los Correos electrónicos de ayer, míralos en https://ejemplo.com/a');
  assert.deepEqual(r.marcas, []);
});

test('hijo en apuros', () => {
  const r = analizar('Hola mamá, se me ha roto el móvil y este es mi número nuevo. Hazme un Bizum urgente');
  assert.ok(r.senales.some(s => s.id === 'familiar'));
  assert.notEqual(r.nivel, 'bajo');
});

test('mensaje normal queda bajo', () => {
  const r = analizar('Hola, te confirmo la cita del jueves a las 17:00. Si no puedes avísame.');
  assert.equal(r.nivel, 'bajo');
  assert.equal(r.puntuacion, 0);
});

test('petición de clave bancaria', () => {
  const r = analizar('BBVA: tu cuenta ha sido bloqueada. Verifica tu cuenta e introduce tu contraseña en http://192.168.33.10/bbva');
  assert.equal(r.nivel, 'alto');
  assert.ok(r.senales.some(s => s.id === 'ip'));
  assert.ok(r.senales.some(s => s.id === 'credenciales'));
});

test('enlaces defangueados y acortadores', () => {
  const r = analizar('Mira hxxps://bit[.]ly/abc');
  assert.ok(r.senales.some(s => s.id === 'acortador'));
  assert.ok(r.enlaces[0].startsWith('hxxps://bit[.]ly'));
});

test('dominio sin http se analiza', () => {
  const r = analizar('Amazon: confirma tus datos en amazon-seguro.xyz/login ahora');
  assert.ok(r.senales.some(s => s.id === 'marca-Amazon'));
});

test('cabeceras de correo: fallos y Reply-To distinto', () => {
  const r = analizar('From: Banco <avisos@banco.es>\nReply-To: x@otro-dominio.ru\nAuthentication-Results: mx; spf=fail; dkim=none; dmarc=fail\n\nHola');
  assert.equal(r.esCorreo, true);
  for (const id of ['cab-spf', 'cab-dkim', 'cab-dmarc', 'cab-reply']) assert.ok(r.senales.some(s => s.id === id), id);
});

test('HTML pegado se devuelve como texto y texto vacío no falla', () => {
  assert.equal(analizar('   ').nivel, 'vacio');
  const r = analizar('<img src=x onerror=alert(1)> urgente');
  assert.ok(r.senales.every(s => typeof s.evidencia === 'string'));
});

for (const legitimo of [
  'BBVA: Tu código de verificación es 482913. No lo compartas con nadie.',
  'Compra con tarjeta en MERCADONA por 2,50 € el 09/11. Si no la reconoces llama a tu banco.',
  'Mamá, llego tarde a cenar, se me ha roto la bici.',
  'Correos: tu paquete llegará mañana. Sigue el envío en https://www.correos.es/es/es/herramientas/localizador'
]) test('legítimo queda bajo: ' + legitimo.slice(0, 30), () => assert.equal(analizar(legitimo).nivel, 'bajo'));

test('marca con enlace acortado y entrega fallida es alto', () => {
  assert.equal(analizar('Su envío SEUR no ha podido entregarse. Reprograme en https://bit.ly/3xYz').nivel, 'alto');
});

test('familiar con número nuevo que pide dinero es alto', () => {
  assert.equal(analizar('Hola papá, este es mi número nuevo, guárdalo. ¿Me puedes hacer una transferencia?').nivel, 'alto');
});

test('la puntuación nunca supera 100', () => {
  const r = analizar('URGENTE multa DGT contraseña PIN 1,99 € has ganado premio https://bit.ly/a http://1.2.3.4/x https://dgt-pago.top/x');
  assert.equal(r.puntuacion, 100);
});
