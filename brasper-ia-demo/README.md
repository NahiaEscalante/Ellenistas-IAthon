# Brasper IA · Demo (IAthon 2026 · Ellenistas)

Demo visual y funcional de las dos soluciones que proponemos para Brasper. Toda la data es simulada, pero sigue la estructura real de su base `com_iathon` y lo que conversamos en la reunión del 14/10/2026.

Link publicado: https://claude.ai/artifact/Wf9AC2YLhUBTwrXTeZM6po

## Las tres pestañas

La demo abre en la pestaña 1.

1. **ARM con agentes IA.** Arranca en el dashboard actual. El botón con los muñecos, o el orbe de la barra lateral, abre un portal hacia el ARM, donde trabajan seis agentes con su propia mascota y un Copiloto que los coordina:
   - **Rastro** (trazabilidad): une campaña, cliente y operaciones.
   - **Capital** (finanzas): ROI, ROAS y CAC.
   - **Horizonte** (predicción): presupuesto por temporada y nuevas ciudades.
   - **Bitácora** (registro): guarda todas las cotizaciones, no solo las cerradas.
   - **Caudal** (liquidez): reemplaza el Excel horario de saldos.
   - **Lupa** (calidad de leads): detecta la confusión con préstamos y propone otro mensaje.

   **Match en vivo de Rastro.** Se abre desde Rastro (*Ver el match en vivo*) o desde su hallazgo en el Centro de mando. Es una pantalla dividida, como la del RPA (pestaña 2), pero con el flujo al revés:
   - **Izquierda:** las campañas de la semana (solo totales, sin nombres) y las señales por persona: clic en la web, chat desde un anuncio, formulario de Meta y cupón de evento.
   - **Centro:** Rastro extrae las llaves de cada señal, convierte el teléfono y el correo en SHA-256 y recorre una cascada de match: ID de clic → hash del teléfono → hash del correo → cupón → IA.
   - **Derecha:** el dashboard de Brasper (vista Clientes), donde escribe el origen de cada cliente y suma su comisión a la campaña.

   A propósito, no todo sale verde: corrige una etiqueta mal puesta por el vendedor, deja *por confirmar* un match de IA (0.78 < 0.85), guarda un clic que todavía no se registra, deriva a Lupa un lead que buscaba un préstamo y deja como orgánico o referido a los clientes sin señal.
2. **RPA de facturación.** Es la réplica del dashboard de Brasper en la vista Contabilidad. Con **Activar RPA** se conecta el robot y con **Iniciar facturación automática** procesa las 11 operaciones del día:
   - lee cada fila;
   - valida las reglas antes de emitir;
   - llena **KeyFácil** si la ruta es Perú → Brasil o **Omie** si es Brasil → Perú;
   - emite el comprobante y valida el PDF.

   El switch **Rediseñada** cambia la pantalla de destino: el robot la reconoce con visión y sigue trabajando. La operación PxB-001529 se aparta a propósito, porque sus montos no cuadran.
3. **Cómo funciona.** Muestra los diagramas de las dos soluciones, en el mismo orden (primero el ARM y luego el RPA), y cómo se une cada campaña con cada cliente.

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
| `data.js` | Data simulada: operaciones de hoy, 13 campañas 2026, clientes atribuidos, liquidez, cotizaciones, motivos de no cierre, calendario y el escenario del match en vivo (`BD.MATCH`) |
| `ui.js` | Íconos, réplica del dashboard de Brasper (Contabilidad, Transacciones y Clientes), gráficos SVG, tooltips y la animación que comparten el RPA y Rastro |
| `web.js` | Entrada a la Solución 1 desde el dashboard y el portal hacia el ARM |
| `arm.js` | Solución 1, el ARM: mascotas, agentes, chat guionado, Copiloto, constelación y "Cómo funciona" |
| `match.js` | Match en vivo de Rastro: campañas → Rastro → dashboard, con la cascada de match |
| `rpa.js` | Solución 2: robot, formularios de KeyFácil y Omie, reglas, visión IA y validación del PDF |
| `app.js` | Navegación entre pestañas y la escena con la que abre la demo |
| `logo-160.png`, `brasper-logo.png` | Logo de Brasper |
| `docs/data_campanas_meta_tiktok.md` | Investigación: qué data entregan Meta y TikTok y cómo se une con cada cliente |

## Notas

- Los nombres de clientes y sus documentos son ficticios. Los montos de Contabilidad salen de la captura real del dashboard.
- El chat de los agentes está guionado: responde las preguntas sugeridas. Para conectarlo a una IA real o a la API de Meta hay que sacarlo del Artifact y desplegarlo con un backend, por ejemplo en Vercel.
- Para editar textos de los agentes, busca `const AG` en `arm.js`. Las respuestas están en `const A`.
- Las señales y los clientes del match en vivo están en `BD.MATCH`, al final de `data.js`. Los tres clientes de Meta son los de "Alerta soles" que genera la propia data, y el resto se agrega a mano. Ese bloque no usa el generador aleatorio, así que no cambia ningún otro número de la demo.
- El match en vivo supone que el dashboard guarda el teléfono y el correo de cada cliente. La vista Clientes es simulada y ese dato está por confirmar con Brasper.
