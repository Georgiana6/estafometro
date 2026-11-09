# Estafómetro

Herramienta web gratuita para saber si un SMS, WhatsApp o correo parece una estafa, y qué hacer si ya has caído.

**Pruébala:** https://estafometro.georgiweb.com (versión de prueba)

## Cómo funciona

Pegas el mensaje y un conjunto de reglas busca señales típicas de fraude:

- Urgencia, amenazas o premios inesperados.
- Peticiones de contraseñas, códigos o pagos pequeños.
- Marcas conocidas que enlazan a un dominio que no es suyo.
- Enlaces acortados, direcciones IP, caracteres engañosos y terminaciones de dominio de riesgo.
- Cabeceras de correo: fallos de SPF, DKIM y DMARC, o un `Reply-To` de otro dominio.

El resultado explica cada señal, para que aprendas a reconocer el siguiente engaño. La guía «La primera hora» ayuda a actuar si ya has dado datos o dinero.

## Privacidad

El análisis se hace en el navegador. La política de seguridad de la página incluye `connect-src 'none'` y `form-action 'none'`, así que el navegador bloquea cualquier intento de enviar el mensaje a otro sitio.

## Límites

Es un proyecto de aprendizaje basado en reglas, y puede fallar en los dos sentidos. No sustituye a la comprobación por un canal oficial ni a la ayuda del 017 de INCIBE. La lista de dominios oficiales todavía está pendiente de revisar.

## Probarlo en local

Son archivos estáticos, sin dependencias. Para ejecutar las pruebas del analizador, con Node.js:

```
node --test pruebas.test.js
```

## Autoría

Proyecto personal de [Georgiana Cretu](https://georgiweb.com), desarrollado con ayuda de inteligencia artificial.
