# Brasper IA · Demo (IAthon 2026 · Ellenistas)

Demo visual y funcional de las dos soluciones que proponemos para Brasper. Toda la data es simulada, pero sigue la estructura real de su base `com_iathon` y lo que conversamos en la reunión del 14/10/2026.

Link publicado: https://claude.ai/artifact/Wf9AC2YLhUBTwrXTeZM6po

## Las tres pestañas

1. **RPA de facturación.** Es la réplica del dashboard de Brasper en la vista Contabilidad. Con **Activar RPA** se conecta el robot y con **Iniciar facturación automática** procesa las 11 operaciones del día:
   - lee cada fila;
   - valida las reglas antes de emitir;
   - llena **KeyFácil** si la ruta es Perú → Brasil o **Omie** si es Brasil → Perú;
   - emite el comprobante y valida el PDF.

   El switch **Rediseñada** cambia la pantalla de destino: el robot la reconoce con visión y sigue trabajando. La operación PxB-001529 se aparta a propósito, porque sus montos no cuadran.
2. **ARM con agentes IA.** Arranca en el dashboard actual. El botón con los muñecos, o el orbe de la barra lateral, abre un portal hacia el ARM, donde trabajan seis agentes con su propia mascota y un Copiloto que los coordina:
   - **Rastro** (trazabilidad): une campaña, cliente y operaciones.
   - **Capital** (finanzas): ROI, ROAS y CAC.
   - **Horizonte** (predicción): presupuesto por temporada y nuevas ciudades.
   - **Bitácora** (registro): guarda todas las cotizaciones, no solo las cerradas.
   - **Caudal** (liquidez): reemplaza el Excel horario de saldos.
   - **Lupa** (calidad de leads): detecta la confusión con préstamos y propone otro mensaje.
3. **Cómo funciona.** Muestra los diagramas de las dos soluciones y cómo se une cada campaña con cada cliente.

## Cómo correrlo en local

Es HTML, CSS y JavaScript puro: no necesita instalación ni build. Desde esta carpeta, ejecuta:

```bash
python3 -m http.server 8765
```

Luego abre `http://localhost:8765/_preview.html` en el navegador.

`index.html` es la versión que se publica como Artifact: no lleva `<!doctype>` porque la plataforma lo agrega al publicar. `_preview.html` es la misma página con el encabezado completo, lista para abrir en local.

## Archivos

| Archivo | Qué hace |
|---|---|
| `index.html` | Estilos y estructura de la página |
| `_preview.html` | Copia de `index.html` con `<!doctype>` para correr en local |
| `data.js` | Data simulada: operaciones de hoy, 13 campañas 2026, clientes atribuidos, liquidez, cotizaciones, motivos de no cierre y calendario |
| `ui.js` | Íconos, réplica del dashboard de Brasper, gráficos SVG y tooltips |
| `rpa.js` | Solución 1: robot, formularios de KeyFácil y Omie, reglas, visión IA y validación del PDF |
| `web.js` | Entrada a la Solución 2 desde el dashboard y el portal hacia el ARM |
| `arm.js` | ARM: mascotas, agentes, chat guionado, Copiloto, constelación y "Cómo funciona" |
| `app.js` | Navegación entre pestañas |
| `logo-160.png`, `brasper-logo.png` | Logo de Brasper |
| `docs/data_campanas_meta_tiktok.md` | Investigación: qué data entregan Meta y TikTok y cómo se une con cada cliente |

## Notas

- Los nombres de clientes y sus documentos son ficticios. Los montos de Contabilidad salen de la captura real del dashboard.
- El chat de los agentes está guionado: responde las preguntas sugeridas. Para conectarlo a una IA real o a la API de Meta hay que sacarlo del Artifact y desplegarlo con un backend, por ejemplo en Vercel.
- Para editar textos de los agentes, busca `const AG` en `arm.js`. Las respuestas están en `const A`.
