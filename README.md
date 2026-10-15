# Brasper IA · Equipo Ellenistas (IAthon 2026)

Somos **Ellenistas**: Nahia Escalante (líder), Andrés Rojas, Giuliana Batallanos y Johar Barzola. Este repositorio tiene nuestra propuesta para **Brasper**, una empresa peruana de remesas y cambio de divisas entre Perú y Brasil.

## El problema

En Brasper cada operación se tipea dos veces. Los 3 vendedores pasan los datos del chat de WhatsApp al dashboard, y después contabilidad vuelve a copiar lo mismo en **KeyFácil** (envíos de Perú a Brasil) o en **Omie** (de Brasil a Perú) para emitir el comprobante. Entre esos sistemas no hay ninguna conexión: el puente son personas.

- Hoy hacen unas **60 operaciones al día** y quieren llegar a **1000**.
- El comprobante tarda **2 o 3 días**. Llegó a tardar semana y media, y la mejora vino de contratar más gente, no de automatizar.
- Por cada comprobante pagan tres veces: la licencia, a quien tipea y a quien revisa que no se haya tipeado mal.
- En lo comercial pasa algo parecido: no saben qué anuncio trajo a cada cliente, la liquidez se revisa en un Excel cada hora, las cotizaciones que no cierran se pierden y muchos leads llegan creyendo que Brasper presta dinero.

Y una regla que define todo: Brasper no nos da acceso a su base de datos ni a su API. Como nos dijeron, *"nuestra API son las personas"*. Por eso la solución trabaja sobre las mismas pantallas que usa el equipo.

El análisis completo está en [docs/diagnostico.md](docs/diagnostico.md).

## La solución

Son dos piezas, con un mismo objetivo: que nadie tenga que tocar una operación entre el dashboard y el cliente.

### 1. RPA de facturación

Un **RPA tradicional** trabaja sobre la interfaz, como lo haría el contador:

1. Lee cada operación en la vista Contabilidad del dashboard.
2. Elige el comprobante (boleta o factura, según el documento del cliente) y el destino: **KeyFácil** si el envío va de Perú a Brasil, **Omie** si va de Brasil a Perú.
3. Llena el formulario campo por campo y emite.
4. Anota el número del comprobante en el dashboard.

Así desaparece el tipeo y, con él, el error de digitación y la revisión manual.

### 2. ARM con agentes IA

El **ARM** (Agentic Relationship Management) se suma al dashboard como un botón más. Tiene seis agentes y un Copiloto que los coordina:

| Agente | Rol | Qué hace |
|---|---|---|
| **Rastro** | Trazabilidad | Une cada anuncio con el cliente y sus operaciones. |
| **Capital** | Finanzas | Mide ROI, ROAS y CAC sobre la comisión real, no sobre el monto enviado. |
| **Horizonte** | Predicción | Recomienda cuánto invertir, cuándo y dónde. |
| **Bitácora** | Registro | Guarda cada cotización, cierre o no. |
| **Caudal** | Liquidez | Vigila los saldos cada hora y alerta a tiempo. |
| **Lupa** | Calidad de leads | Descubre por qué no cierran los leads y propone otro mensaje. |

Gerencia le pregunta al **Copiloto** en lenguaje natural, por ejemplo *"¿qué campaña apago y cuál escalo?"* o *"¿necesito reales mañana?"*, y recibe la respuesta con su evidencia.

Para unir cada cliente con su campaña, el teléfono y el correo se guardan como hash (SHA-256) y el seguimiento en la web se activa solo después de que la persona acepta las cookies (Ley 29733 y LGPD). Las decisiones las toma siempre una persona, como pide el reglamento peruano de IA (D.S. 115-2025-PCM).

## Estructura del repositorio

```
.
├── frontend/          Demo navegable (HTML, CSS y JavaScript, sin build)
├── scripts/           servir-demo.js: levanta la demo en local sin instalar nada
├── presentacion/      Pitch en PowerPoint y el código que lo genera
├── docs/              Diagnóstico, modelo de datos, investigación y transcripciones de las reuniones
├── .env.example       Variables de entorno de ejemplo (sin llaves)
└── package.json       Scripts del proyecto
```

| Carpeta o archivo | Contenido |
|---|---|
| [`frontend/`](frontend/) | La demo de las dos soluciones. Detalle de cada archivo en [frontend/README.md](frontend/README.md). |
| [`scripts/servir-demo.js`](scripts/servir-demo.js) | Servidor estático en Node, sin dependencias. |
| [`presentacion/`](presentacion/) | `Brasper-IA-Pitch.pptx` y los scripts para regenerarlo. Ver [presentacion/README.md](presentacion/README.md). |
| [`docs/diagnostico.md`](docs/diagnostico.md) | El problema, el flujo actual, los requisitos y las preguntas abiertas. |
| [`docs/campos.md`](docs/campos.md) | Los campos de una operación tal como aparecen en el dashboard. |
| [`docs/data_campanas_meta_tiktok.md`](docs/data_campanas_meta_tiktok.md) | Qué datos entregan Meta y TikTok y cómo se unen con cada cliente. |
| [`docs/audios-contexto/`](docs/audios-contexto/) | Transcripciones de las reuniones con Brasper. |

## Instalación

Solo necesitas **Node.js 18 o superior**. La demo no tiene dependencias, así que no hace falta `npm install`.

```bash
git clone -b entrega-final https://github.com/NahiaEscalante/Ellenistas-IAthon.git
```

```bash
cd Ellenistas-IAthon
```

Si quieres cambiar el puerto, copia `.env.example` como `.env` y edita `PORT`. No hay llaves ni contraseñas que configurar.

## Ejecución

```bash
npm start
```

Abre `http://localhost:8765` en el navegador. La demo tiene tres pestañas:

1. **RPA de facturación.** Pulsa *Activar RPA* y luego *Iniciar facturación automática*. El robot recorre las operaciones del día y llena KeyFácil u Omie según el sentido del envío.
2. **ARM con agentes IA.** Pulsa *Brasper ARM · Entrar* para pasar del dashboard al ARM. Usa las preguntas sugeridas del Copiloto y de cada agente; desde Rastro puedes abrir *Ver el match en vivo*.
3. **Cómo funciona.** Los diagramas de las dos soluciones.

Sin Node también funciona: entra a `frontend/` y ejecuta `python3 -m http.server 8765`; luego abre `http://localhost:8765/_preview.html`.

### Regenerar la presentación (opcional)

```bash
npm run presentacion:instalar
```

```bash
npm run presentacion:generar
```

## Notas

- **Toda la data de la demo es simulada.** Los nombres y documentos son ficticios; la estructura sigue lo que vimos en el dashboard de Brasper.
- **El chat de los agentes está guionado**: responde a las preguntas sugeridas. Conectarlo a datos reales necesita las cuentas de Meta y TikTok y la web nueva de Brasper (diciembre de 2026).
- **No hay secretos en el repositorio.** El `.env` está en `.gitignore`.
