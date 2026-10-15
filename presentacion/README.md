# Pitch · Brasper IA (IAthon 2026 · Ellenistas)

**[Brasper-IA-Pitch.pptx](Brasper-IA-Pitch.pptx)**: 20 láminas. Cada lámina trae en sus notas el guion para el presentador, con un tiempo estimado. En total son unos 12 minutos, demo incluida.

## Estructura

| Sección | Láminas | Mensaje |
|---|---|---|
| Apertura | 1–2 | Quiénes somos y qué hace Brasper (~60 operaciones al día, meta de 1000; PxB → KeyFácil, BxP → Omie) |
| El problema | 3–7 | Cada operación se tipea dos veces, el comprobante tarda días, Brasper paga tres veces por comprobante, campañas y caja también van a mano, y la regla «nuestra API son las personas» |
| La solución | 8–12 | Solución 1: RPA de facturación (flujo y qué hace si algo no cuadra). Solución 2: ARM con seis agentes y un Copiloto, y cómo se une cada cliente con su campaña |
| **Demo** | 13–17 | Portada de la demo con el guion en vivo, más cuatro láminas de respaldo con capturas reales de la demo |
| Impacto | 18–19 | Hoy frente a Brasper IA, y las tres fases para llevarlo a producción |
| Cierre | 20 | «Que nadie tenga que tocar una operación entre el dashboard y el cliente» |

## Guion de la demo en vivo (lámina 13)

Antes de presentar, levanta la demo y déjala abierta en otra pestaña:

Desde la raíz del repositorio:

```bash
npm start
```

Luego abre `http://localhost:8765`.

1. **RPA de facturación.** Pulsa *Activar RPA* y luego *Iniciar facturación automática*.
2. **El lote completo.** Señala que PxB-001529 queda en *Revisión humana* porque sus montos no cuadran. Pasa a *Turbo* para terminar (10 emitidos, 1 en revisión).
3. **ARM.** En la pestaña *ARM con agentes IA*, pulsa *Brasper ARM · Entrar*. En el Copiloto usa la sugerencia *¿Qué campaña apago y cuál escalo?*. Después abre a Lupa y pulsa *¿Cómo cambio el mensaje?*.

> Usa las preguntas sugeridas: el chat está guionado y una pregunta escrita a mano puede llegar al agente equivocado. Si la demo en vivo falla, sigue con las láminas 14 a 17, que muestran los mismos momentos.

## Cómo regenerar el deck

El PowerPoint se genera con código, así que los cambios se hacen en `generar.js` y no a mano en el `.pptx`, porque se pierden al regenerar.

```bash
cd presentacion
npm install
npm run capturas   # opcional: vuelve a tomar las capturas de la demo y las mascotas (assets/)
npm run generar    # escribe Brasper-IA-Pitch.pptx
```

| Archivo | Qué hace |
|---|---|
| `generar.js` | Construye las 20 láminas con pptxgenjs: tema de colores de Brasper, diseños (portada, sección, contenido y cierre), textos y notas del presentador |
| `capturas.js` | Levanta la demo con un servidor propio, la recorre con Playwright y guarda las capturas y las mascotas en `assets/` |
| `assets/` | Capturas de la demo (`.jpg`) y mascotas de los seis agentes (`.png`) |

Las cifras del ARM que aparecen en las capturas son simuladas, como en la demo. Las del problema (60 y 1000 operaciones al día, de 2 a 3 días por comprobante, etc.) salen del [diagnóstico](../docs/diagnostico.md).
