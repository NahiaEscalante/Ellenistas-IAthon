# Ellenistas-IAthon

# Problema

> **En una línea:** en Brasper, la facturación de cada remesa depende de que una persona copie a mano los datos del dashboard interno a KeyFácil (PER→BRA) u Omie (BRA→PER). Ese tipeo concentra la demora: los comprobantes llegaron a tardar **de 1 a 1,5 semanas**, y hoy, sumando más personal, tardan **2 o 3 días**, "que sigue siendo mucho". Además genera errores, obliga a tener un equipo revisor y no escala: hoy son ~60 operaciones al día y la meta es llegar a **1000**.
>
> **Lo que pide Brasper:** un **canal que conecte las partes manuales** del proceso (dashboard → plataforma de facturación → revisión → envío al cliente) para que la información fluya sola de un sistema a otro.
>
> **Y además: deshacerse de KeyFácil y Omie.** El cliente no quiere seguir pagando ni dependiendo de esas dos plataformas. La solución debe **reemplazarlas**, no sólo conectarlas.
>
> **Punto de partida:** el equipo de TI de Brasper ya está construyendo, dentro del dashboard, un módulo que emite boletas y facturas peruanas vía **APISUNAT**. Está **en transición a producción**: algunos comprobantes ya fueron aceptados por SUNAT con validez tributaria, aunque todavía llevan la etiqueta "DESARROLLO". **Sólo cubre Perú**, **sigue requiriendo que una persona emita operación por operación** y presenta **inconsistencias en los datos** (montos, numeración y horas).
>
> **Y eliminar todas las partes manuales:** prescindir del **contador**, de los **tipeadores** que pasan los datos del dashboard a KeyFácil u Omie y de los **revisores**. Que nadie tenga que tocar una operación entre el registro en el dashboard y la entrega del comprobante al cliente.

## 1. La empresa: Brasper

| | |
|---|---|
| **Qué hace** | Remesas y cambio de divisas en línea entre **Perú ⇄ Brasil**, y también con **dólares (EE. UU.)** |
| **Monedas** | PEN, BRL y USD |
| **Misión (sitio web)** | "Ofrecer servicios de remesas en línea desde Brasil hacia Perú y desde Perú hacia Brasil, con la mayor rapidez, confiabilidad, seguridad y la mejor tasa de cambio" |
| **Volumen** | ~**60 operaciones por día** hoy; aspiran a llegar a **1000 por día** |
| **Historia** | Empezó de forma manual (fundador + familia) con **5 a 10 operaciones al día**. Con ese volumen convenía **comprar plataformas de facturación** (KeyFácil, Omie) en lugar de desarrollar una propia. Con el crecimiento, reconocen que debieron construir "una herramienta más robusta que se conecte sin problemas con otras plataformas" |
| **Canales** | Web con calculadora ([brasper.com](https://brasper.com/es)), **WhatsApp** (canal principal de cierre de ventas), bot web de atención |
| **Idiomas** | Español, portugués e inglés |
| **Respaldo** | Asociada a la **Cámara de Comercio de Lima** |
| **Modelo de ingresos** | Comisión por envío + diferencial del tipo de cambio. Promoción de **1 % de comisión en el primer envío** |
| **Horario** | Las operaciones se atienden con prioridad el mismo día dentro del horario de atención, sin atención en feriados |

### Ejemplo real de una operación (mensaje de WhatsApp de la lámina)

```
Perfecto, los detalles de tu envío de Brasper hoy son los siguientes:
  Monto a enviar:      300.00 PEN
  Tipo de cambio:      1.475
  Comisión de envío:    15.00 PEN   (5 %)
  Neto a convertir:    285.00 PEN
  Total a recibir:     420.38 BRL   (285.00 × 1.475)
```

Estos son los mismos valores que luego se transcriben a mano para emitir el comprobante.

### Ecosistema tecnológico observado (sitio público)

- **Web pública / app de clientes**: SPA en Vue + Tailwind. Tiene registro, login, perfil, **cuentas bancarias de Perú y Brasil**, lista de transacciones, un flujo de pasos para enviar dinero (incluye subir el comprobante de transferencia) y la calculadora.
- **Backend / API propia**: el frontend consume una API REST propia (`apibras.finzeler.com`) que expone, entre otros, **tasas de cambio** (`tax-rate`: `coin_a`, `coin_b`, `tax`) y **comisiones** (`coin_a`, `coin_b`, `percentage`, `min_amount`, `max_amount`).
- **Dashboard interno**: `dashboard.brasper.com` (el "desarrollo in-house" donde ventas registra cada operación).
- **Bot de IA para chat web**: `ia.finzeler.com/consulta-webchat`.

> ⚠️ **Acceso a los datos (restricción clave):** técnicamente, el dashboard tiene un backend con API propia. Pero cuando les preguntamos, Brasper respondió que **no dará acceso a la base de datos ni a la API por tratarse de datos sensibles** ("nuestra API son las personas"). Lo que sí estarían dispuestos a compartir es **la interfaz**. La solución tiene que funcionar sin acceso directo a su base de datos (por ejemplo, operando sobre la interfaz o con datos de prueba en la demo).

## 2. Sistemas que conviven hoy

| Sistema | Tipo | Uso | Limitaciones |
|---|---|---|---|
| **Web + WhatsApp** | Canal de venta | Cotización, atención y cierre con el cliente | La venta se cierra conversando con una persona |
| **Dashboard in-house** | Desarrollo propio, hecho por su equipo de TI | Ventas registra todos los datos de la operación | La información "queda guardadita": no se integra con nada y no nos darán acceso a la BD/API (sólo a la interfaz) |
| **[KeyFácil](https://keyfacil.com/)** | SaaS peruano de facturación electrónica, proveedor autorizado por **SUNAT** (suscripción mensual) | Emite **boletas/facturas** de remesas **Perú → Brasil** | Pago mensual considerable; los datos se cargan a mano; no está claro que tenga API pública |
| **[Omie](https://www.omie.com.br/)** | ERP brasileño en la nube que emite notas fiscales (NFS-e) | Emite el comprobante de remesas **Brasil → Perú** | Plataforma de pago; los datos se cargan a mano |
| **Pasarela de pagos** | En implementación | Automatizar la recepción y validación de pagos | Todavía no está en producción |

La plataforma de facturación depende del **sentido de la remesa** (país del remitente).

### El dashboard in-house: la fuente de datos (captura de pantalla)

Es la pantalla **Operaciones > Transacciones** de `dashboard.brasper.com`. Contabilidad la lee y desde ahí copia los datos a KeyFácil u Omie.

| # | Código | N° operación | Cliente *(anonimizado)* | Razón social | Monto de envío | Cuenta destino | Monto (recibe) |
|---|---|---|---|---|---|---|---|
| 13 | 🇵🇪 PxB-0014… | 05118043 | Cliente A | INGENITECH S.A.C | 200,00 PEN | infinite pay (BRL) | 272,… |
| 12 | 🇧🇷 BxP-0018… | E904008882026… | Cliente B | Brasper 21 Corretor… | 2335,00 BRL | Scotiabank (PEN) | 1500,… |
| 11 | 🇵🇪 PxB-001461 | f822dd74 | Cliente C | INGENITECH S.A.C | 500,00 PEN | Nubank (BRL) | 685,… |
| 10 | 🇧🇷 BxP-001891 | E405716942026… | Cliente D | Brasper 21 Corretor… | — | — | 110,… |
| 9 | 🇵🇪 PxB-0014… | E132033542026… | Cliente E | INGENITECH S.A.C | — | — | 2465 |

**Qué nos dice esta pantalla:**

- **Código de operación con el sentido incluido**: `PxB-xxxxxx` = Perú → Brasil (va a **KeyFácil**); `BxP-xxxxxx` = Brasil → Perú (va a **Omie**). Con el prefijo se puede elegir la plataforma de facturación de forma automática.
- **La columna "Razón social" es la empresa emisora del comprobante**: en PxB aparece **INGENITECH S.A.C** (empresa peruana, RUC 20611936428) y en BxP, **Brasper 21 Corretor(a)…** (la entidad brasileña que factura vía Omie). Brasper opera con **dos razones sociales peruanas**: **BRASPER 21 S.A.C.** e **INGENITECH S.A.C.** (ver el módulo de facturación electrónica más abajo).
- **El "N° operación" no tiene un formato único**: hay números bancarios peruanos (`05118043`), IDs de **Pix** de Brasil (`E…2026…`, el identificador *end-to-end* de Pix) y códigos alfanuméricos (`f822dd74`). Es justo el dato que el revisor verifica a mano y que se presta a errores de tipeo.
- **Cuenta destino**: banco o billetera y moneda del beneficiario (Nubank, InfinitePay, Scotiabank…).
- **Selección múltiple (checkboxes)**: la interfaz ya permite marcar varias operaciones a la vez, lo que podría servir para facturar en lote.
- **Filtros y etiquetas de CRM**: *Cliente nuevo general*, *Cliente nuevo Referido*, *Campaña 22/08/2026*, *Seguimiento*, *VIP*, *Cliente Nuevo Formulario*; además, búsqueda por código y un contador de operaciones (13 en la vista).
- En esta vista no aparecen el DNI/RUC, el tipo de cambio ni la comisión. Esos datos están en la vista **Contabilidad** (abajo).

### El dashboard: vista "Operaciones > Contabilidad" (captura de pantalla)

Es la vista que usa contabilidad para facturar. **Aquí están todos los campos que hoy se tipean en KeyFácil u Omie.**

**Controles de la vista:**
- Filtro **Por día / Todas**, con un navegador de fechas (p. ej., "Sábado, 10 de octubre de 2026 · de 00:00 a 23:59 · 5 envíos").
- Filtros por **Cliente**, **Cuenta bancaria** y **Moneda** (par de monedas: `PEN-BRL`, …), y un contador de **Total**.
- Las mismas etiquetas de CRM y la búsqueda por código.
- Botón **Exportar Excel**. ✅ El dashboard **sí permite exportar**, lo que corrige lo dicho en la reunión ("no se puede exportar").

**Columnas (ejemplo real de una operación PxB, sin datos personales):**

| Columna | Ejemplo | Significado / uso para facturar |
|---|---|---|
| Cliente | *(anonimizado)* | Nombre del remitente → "Nombre o razón social" |
| Tipo de documento | DNI | DNI → **boleta**; RUC → **factura** |
| Documento | *(8 dígitos)* | N.º de DNI/RUC → "Número de documento" |
| Cuenta destino | infinite pay (BRL) | Banco o billetera del beneficiario |
| Razón social | INGENITECH S.A.C | **Empresa emisora** del comprobante |
| **Monto de envío** | 200.00 (PEN) | Lo que envía el cliente |
| **Monto a recibir** | 272.00 BRL | Lo que recibe el beneficiario |
| **Tipo de cambio** | 1,425 | Tasa aplicada |
| **Descuento variable** | 40.00 % | Descuento sobre la comisión (promociones, negociación en WhatsApp) |
| **Comisión final interna** | S/ 5.08 | **Base imponible** del comprobante |
| **Impuesto final interno** | S/ 0.92 | **IGV 18 %** (5.08 × 0.18 ≈ 0.92) |
| **Venta final** | **S/ 6.00** | **Total del comprobante** (5.08 + 0.92) |
| **Comprobante SUNAT** | `B001-00000001` · *Aceptado* | Serie y número de la boleta, con el **estado ante SUNAT** |
| Comp. envío | *Abrir* | Comprobante de que Brasper pagó al beneficiario |
| Comp. pago | *Abrir* | **Voucher del cliente**: insumo para automatizar la revisión de pagos |
| PDF | ⬇ PDF | Descarga de la boleta |

**Qué nos dice esta vista:**

- **Responde qué se factura**: **sólo la comisión de Brasper, con IGV incluido**, no el monto enviado. En el ejemplo, 200 PEN × 5 % de comisión = S/ 10, con un 40 % de descuento quedan **S/ 6.00 = S/ 5.08 de base + S/ 0.92 de IGV**. *(Hay que confirmarlo con el contador.)*
- **El cálculo fiscal ya lo hace el dashboard**: base, IGV y total ya están calculados. Hoy alguien los vuelve a tipear en KeyFácil u Omie. Todos los datos necesarios para emitir están **en una sola fila**.
- **Ya existe una columna "Comprobante SUNAT"** con serie, número y estado (*Aceptado*), además del PDF. Así se puede saber qué operaciones están facturadas y cuáles no. Esa columna la alimenta el **módulo de facturación electrónica propio** que Brasper está desarrollando (siguiente sección).
- **Los vouchers (comprobante de pago y comprobante de envío) ya están adjuntos** a cada operación. Sirven de insumo para validar pagos con IA (OCR + comparación con monto, fecha y N.º de operación).
- **Tipos de documento**: además de DNI aparece **CE** (carné de extranjería). El módulo nuevo también admite pasaporte.
- **La comisión cambia según el monto y el descuento** (otras filas de la vista):

  | Monto de envío | Descuento | Comisión + IGV | Comisión implícita sin descuento |
  |---|---|---|---|
  | 200 PEN | 40 % | 5.08 + 0.92 = **S/ 6.00** | 5 % |
  | 500 PEN | 45 % | 9.32 + 1.68 = **S/ 11.00** | 4 % |
  | 1800 PEN | 50 % | 22.88 + 4.12 = **S/ 27.00** | 3 % |

  Concuerda con la API de comisiones del sitio (`percentage` con `min_amount`/`max_amount`): **la comisión baja por tramos según el monto**.
- **Por cuadrar**: el "Monto a recibir" no sale de (envío − comisión) × tipo de cambio. Por ejemplo, (200 − 6) × 1,425 = 276,45, no 272,00, y 1800 → 2465 BRL equivale a ~1,369. Puede haber otro diferencial o redondeo. **Hay que confirmarlo** (no afecta al comprobante, que sólo factura la comisión).

### Módulo propio de facturación electrónica (en desarrollo, capturas de pantalla)

Dentro de la vista Contabilidad, **el equipo de TI de Brasper ya empezó a construir una emisión directa** que no pasa por KeyFácil. Por ahora **sólo cubre Perú (PxB)** y funciona a través de **[APISUNAT](https://apisunat.com/)**, un servicio de terceros que hace de intermediario con SUNAT.

**Formulario "Facturación electrónica · Comprobante · operación PxB-001459":**
- Aviso amarillo: ***"Desarrollo. Prueba con APISUNAT: SUNAT lo valida, pero no tiene validez tributaria."*** Es decir, **todavía no está en producción**.
- **Empresa emisora**, a elegir entre dos:
  - **BRASPER 21 S.A.C.**, RUC **20608550454**
  - **INGENITECH S.A.C.**, RUC **20611936428**
- **Tipo de comprobante**:
  - **Boleta**: consumidor final (DNI, CE, pasaporte).
  - **Factura**: empresa o persona con RUC. Valida que el RUC tenga 11 dígitos ("Para emitir factura ingresa el RUC del cliente (11 dígitos)").
- **Cliente**: RUC/documento, razón social, dirección fiscal *(opcional)* y **correo *(opcional)***.
- Botones **Cancelar** / **Emitir**.

**Panel de detalle "Boleta de venta B001-00000003":**
- Estados: **"En SUNAT"** + etiqueta **DESARROLLO**. El mensaje dice: *"APISUNAT lo recibió: esperando la respuesta de SUNAT"*. En otras operaciones aparece **Aceptado**.
- Montos: **Valor de venta S/ 11.98 + IGV 18 % S/ 2.16 = Importe total S/ 14.14**.
- Cliente: emisor (razón social + RUC), DNI, nombre, correo y fecha y hora de emisión.
- **Historial** del comprobante: *Número reservado* → *Enviado a APISUNAT* → (respuesta de SUNAT).
- Detalle a revisar: la "Emisión" dice **12:26 p. m.**, pero el historial marca **07:26 a. m.** Son 5 horas de diferencia, como entre UTC y la hora de Perú (UTC−5). Parece un **problema de zona horaria**, y en comprobantes la fecha de emisión importa.

**Panel de detalle "Boleta de venta B001-00000004" (comprobante aceptado):**
- Estados: **Aceptado** + etiqueta **DESARROLLO**. El mensaje dice: *"SUNAT lo aceptó. Tiene validez tributaria (en producción)"*. La etiqueta y el mensaje se contradicen.
- Emisor INGENITECH S.A.C.; cliente con DNI, nombre y correo; fechas de **Emisión** y **Aceptado**.
- **Archivos descargables**: **PDF**, **XML firmado** y **CDR de SUNAT** (la constancia de recepción). Son los tres archivos que exige un comprobante electrónico válido.
- **Historial completo**: *Número reservado* → *Enviado a APISUNAT* → **Aceptado por SUNAT**, todo **en el mismo minuto**. Una vez que alguien pulsa "Emitir", la emisión técnica tarda segundos.

**Vista Contabilidad con los comprobantes emitidos (5 envíos del 10/10/2026, todos PxB e INGENITECH S.A.C.):**

| Fila | Doc. | Monto de envío | Monto a recibir | T. cambio | Descuento | Comisión + IGV = Venta final | Comprobante SUNAT |
|---|---|---|---|---|---|---|---|
| 1 | DNI | 200,00 | 272,00 BRL | 1,425 | 40 % | 5.08 + 0.92 = **S/ 6.00** | `B001-00000001` · Aceptado |
| 2 | CE | 500,00 | 685,00 BRL | 1,485 | 45 % | 9.32 + 1.68 = **S/ 11.00** | `B001-00000001` · Aceptado |
| 3 | DNI | 1800,00 | 2465,00 BRL | 1,425 | 50 % | 22.88 + 4.12 = **S/ 27.00** | `B001-00000002` · Aceptado |
| 4 | DNI | 200,00 | 276,00 BRL | 1,485 | 40 % | 5.08 + 0.92 = **S/ 6.00** | `B001-00000003` · Aceptado |
| 5 | DNI | 290,00 | 390,00 BRL | 1,425 | 40 % | 7.37 + 1.33 = **S/ 8.70** | `B001-00000004` · Aceptado |

Las columnas **Comp. envío** y **Comp. pago** muestran **miniaturas de imágenes** (capturas de transferencias). Los vouchers son **imágenes, no datos estructurados**: para validarlos automáticamente se necesita OCR o visión.

**⚠️ Inconsistencias detectadas en el módulo** (justo el tipo de error que hoy obliga a tener revisores):
1. **Número de comprobante duplicado**: `B001-00000001` aparece en **dos operaciones distintas**, con el mismo emisor y la misma serie. SUNAT no admite dos comprobantes con la misma serie y número del mismo emisor. Puede deberse a que una se emitió en el entorno de prueba y otra en producción, pero el dashboard no lo distingue.
2. **El monto de la boleta no coincide con la "Venta final" de la tabla**:
   - `B001-00000003`: la tabla dice **S/ 6.00**, pero el panel de la boleta dice **S/ 14.14** (11.98 + 2.16).
   - `B001-00000004`: la tabla dice **S/ 8.70**, pero el panel muestra **S/ 16.x** (valor de venta ~S/ 13.x).
   - Puede que la boleta se calcule con otra base (¿sin descuento? ¿con el diferencial cambiario?), o que sea un error. **Es crítico confirmarlo**: un comprobante con un monto incorrecto es un problema tributario.
3. **Horas desfasadas**: Emisión/Aceptado **12:27 p. m.** frente a un historial de **07:27 a. m.** (−5 h), en todos los comprobantes.
4. **Etiqueta "DESARROLLO" en comprobantes "en producción"**: no está claro qué comprobantes son tributariamente válidos.

**Qué cambia esto en el problema:**
- ✅ El camino para **dejar KeyFácil en Perú ya empezó**: el dashboard arma el comprobante con sus propios datos y lo envía a SUNAT vía APISUNAT.
- ❌ **Sigue siendo manual, operación por operación**: una persona abre cada operación, **elige la empresa emisora**, **elige boleta o factura**, completa o revisa los datos del cliente y pulsa **Emitir**. Se ahorra el tipeo en KeyFácil, pero **no los pasos humanos ni la revisión**.
- ⚠️ **Está a medio camino entre prueba y producción**: algunos comprobantes ya tienen validez tributaria, pero con etiquetas contradictorias, numeración duplicada y montos que no cuadran.
- ❌ **Nadie valida automáticamente** que el comprobante emitido coincida con la operación (monto, número, fecha). Las inconsistencias de arriba **pasaron sin alerta**.
- ❌ **No cubre Brasil (BxP)**: Omie sigue siendo necesario para la NFS-e.
- ❌ **Se cambia un proveedor por otro**: APISUNAT también es un servicio de terceros (con su propio costo y dependencia), aunque más barato y con API.
- ❌ **El correo es opcional**: si falta, el comprobante no llega solo al cliente.
- ❌ **Las reglas no están automatizadas**: cuándo usar BRASPER 21 o INGENITECH, cuándo boleta o factura, qué hacer si SUNAT rechaza o se queda "esperando respuesta".
- ❌ **Los vouchers de pago no se validan** en el flujo.

### KeyFácil: donde se tipean los datos (captura de pantalla, flujo PxB)

Es la pantalla **Realizar venta → Nueva venta** de KeyFácil. Contabilidad la llena a mano, operación por operación, con los datos del dashboard.

**Contexto de la cuenta:**
- Empresa en sesión: **BRASPER 21 S.A.C.** (RUC 20608550454), sucursal *PRINCIPAL*. Es una de las dos razones sociales peruanas; la otra es INGENITECH S.A.C.
- Menú lateral: *Estadísticas*, *Realizar venta*, *Ventas realizadas*, *Guías de remisión* y *Proformas*. Hay además un aviso de "Probar nueva versión de la plataforma".
- Se usa desde una **PC con Windows y el navegador Chrome** (aplicación web).

**Formulario "Cliente / Proveedor"** (se abre dentro de *Nueva venta*), con las pestañas *Información*, *Ventas*, *Proformas*, *Compras* y *Guías de remisión*:

| Campo en KeyFácil | De dónde sale hoy (dashboard) | Nota |
|---|---|---|
| Tipo de documento | Se deduce: DNI (persona natural → boleta) / RUC (persona jurídica → factura) | Lista desplegable |
| Número de documento | DNI/RUC del cliente | Tiene un botón 🔍 de **búsqueda automática** (RENIEC/SUNAT) que completa el nombre |
| Nombre o razón social | Cliente | Se puede autocompletar con la búsqueda |
| Email | Correo del cliente | **Clave**: es adonde llega el PDF |
| Teléfono | Teléfono del cliente (+51 por defecto) | Opcional |
| Dirección principal | — | Opcional para boleta |
| Observaciones adicionales | Aquí podría ir el código PxB o el N° de operación | Campo libre |

**Cabecera de la venta** (detrás del formulario): fecha de vencimiento, descuento global (%), **condición de pago**, *Otros*, la opción **Proforma** y el botón **PROCESAR**, que emite el comprobante. Hay una opción para agregar el ítem "manualmente".

**Pasos manuales por cada operación PxB:**
1. Abrir la operación en el dashboard (y su detalle).
2. En KeyFácil: *Realizar venta* → *Nueva venta*.
3. Crear o buscar al cliente: tipo y número de documento → buscar → revisar el nombre → escribir el email → *Guardar*.
4. Agregar el ítem de la venta (servicio/comisión y monto) a mano.
5. Elegir la condición de pago y *Procesar*.
6. Revisar que todo coincida con el dashboard (equipo revisor).
7. Descargar el PDF y enviarlo al correo del cliente.

> Son **más de 7 pasos y varias pantallas por operación**, multiplicados por unas 60 operaciones al día. El único "atajo" que existe es la búsqueda por DNI/RUC; todo lo demás se copia a mano.

## 3. Flujo actual (AS-IS)

Basado en la lámina "Ventas y facturación" que envió Brasper y en lo dicho en la reunión.

### 01 · Flujo de ventas

```
 Cotización    →   Derivación   →   Atención del     →   Cierre del   →   Registro en
 en la web         a WhatsApp       equipo de ventas      negocio          el dashboard
 (calculadora)     (mensaje con     (persona revisa,      (cliente paga    (ventas tipea los
                   el detalle)      confirma requisitos)  y envía voucher) datos de la operación)
```

- El cliente cotiza en la calculadora web y ve el precio de mercado. La web **no tiene un agente** que cierre la venta (está planificado para **2027**), así que se le **deriva a WhatsApp** con un mensaje que trae el detalle (monto, tipo de cambio, comisión, neto y total a recibir).
- El **equipo de ventas** toma las cotizaciones que llegan a WhatsApp, en orden. Ahí **recoge todos los datos del cliente** y de la operación, y **puede negociar el precio** cotizado en la web.
- Durante la negociación, ventas pide **la cuenta de origen y la cuenta destino** (p. ej., BCP en Perú, una cuenta en Brasil) para hacer el depósito. Ejemplo dicho en la reunión: "te voy a mandar mil soles → a Brasil le van a llegar 900 reales, con la comisión".
- El cliente **transfiere a la cuenta de Brasper y envía el comprobante (voucher)**.
- Brasper paga al beneficiario en la cuenta registrada del país destino.
- Ventas **registra la operación en el dashboard**: los datos no se quedan en el chat de WhatsApp, pasan al dashboard.
- La operación **sólo se cierra cuando el beneficiario ya tiene el monto en su cuenta** ✔.

> **Fuera de alcance:** el tramo web → WhatsApp → ventas también es manual, pero Brasper dejó claro que **no es lo que hay que resolver ahora**. El reto se enfoca **sólo en la facturación**.

### 02 · Flujo de facturación ← aquí está el cuello de botella

```
 Consulta de datos    →    INGRESO MANUAL DE DATOS    →   Descarga de   →   Envío al correo
 (Contabilidad lee         ┌──────────┬──────────┐        boleta (PDF)       del cliente
  el dashboard)            │ KeyFácil │   Omie   │
                           │ PER → BRA│ BRA → PER│
                           └──────────┴──────────┘
                              + equipo revisor que valida el "match"
```

1. **Consulta de datos**: contabilidad abre el dashboard y se asegura de tener completos el monto de la transferencia, el documento del cliente y el resto de los datos. **No existe ningún canal que conecte el dashboard con KeyFácil u Omie.**
2. Decide el tipo de comprobante: **boleta** (persona natural, DNI) o **factura** (persona jurídica, RUC; se consulta el RUC).
3. **Ingreso manual** de los datos en la plataforma correspondiente:
   - Perú → Brasil ⇒ **KeyFácil**
   - Brasil → Perú ⇒ **Omie**
4. **Revisión**: un equipo revisor comprueba que los datos coincidan con la operación (p. ej., que el **ID de operación** haga match).
5. **Descarga** del comprobante en PDF. La plataforma también guarda un registro interno en Excel.
6. **Envío** del PDF al cliente **por correo o por WhatsApp**.

> **Punto crítico (según la lámina):** lo que retrasa la facturación es la cantidad de datos que se ingresan a mano. Una vez registrados, la descarga y el envío de la boleta son rápidos.

### Datos que se transcriben a mano (dashboard → KeyFácil / Omie)

| Campo | Ejemplo / nota |
|---|---|
| Monto de transferencia | 300.00 PEN (lo que envía el cliente) |
| Entrada a Brasper | Comisión / ingreso de Brasper (15.00 PEN) |
| Monto receptor | 420.38 BRL (lo que recibe el beneficiario) |
| Tipo de cambio | 1.475 |
| DNI o RUC | Define si es boleta o factura |
| Nombre completo | Del cliente/remitente |
| Correo electrónico | Adonde se envía el comprobante |
| Cuentas de origen y destino | Cuenta que envía y cuenta que recibe |
| Número / ID de operación | Para trazabilidad y para el "match" del revisor |

## 4. El problema (dolor)

1. **Doble digitación manual**: la misma información se registra en el dashboard (ventas) y luego se vuelve a tipear en KeyFácil u Omie (contabilidad). No hay integración entre los sistemas.
2. **Errores humanos → mucho dinero en validación**: como se digita a mano, Brasper **invierte mucho dinero en personal de validación** que existe sólo para revisar, por si hubo datos mal ingresados, que lo tipeado en KeyFácil u Omie coincida con el dashboard (nombre, DNI/RUC, montos, ID de operación). Es un costo que **no agrega valor al cliente**: se paga para corregir un problema que causa el mismo proceso manual.
3. **Cuello de botella y retrasos**: las operaciones se acumulan a lo largo del día.
   - **Antes**: el envío de los comprobantes demoraba **de 1 a 1,5 semanas**. En el peor momento, un cliente que operó el **1 de octubre recibió su boleta el 16 de octubre**.
   - **Hoy**: **2 o 3 días**, "y aún así sigue siendo mucho".
   - No hay una penalidad legal o contractual por demorar 3, 4 o 5 días. El costo real es **el personal que absorbe**.
4. **No escala; se resuelve con más gente**:
   - Al principio había **una sola persona** de contabilidad y ventas hacía el resto.
   - Al subir las operaciones, tuvieron que sumar **2 o 3 personas más a contabilidad**.
   - La mejora de 1,5 semanas a 2–3 días **no vino de la automatización, sino de esas personas extra**.
   - Con la meta de **1000 operaciones al día** (hoy ~60), este modelo se vuelve inviable.
5. **Costos**:
   - Suscripciones mensuales a dos plataformas de facturación de pago (KeyFácil y Omie).
   - Personal dedicado: contador/digitador y, sobre todo, **revisores de validación**, una de las mayores inversiones del proceso.

> 🎤 **Para el pitch:** Brasper paga tres veces por cada comprobante: (1) la suscripción a KeyFácil/Omie, (2) a la persona que tipea los datos y (3) a la persona que revisa que no se hayan tipeado mal. Si los datos fluyen automáticamente desde el origen, sin retipeo, el error de digitación desaparece y con él la necesidad de esa validación manual.
6. **Datos aislados**: el dashboard tiene todos los datos (incluso el cálculo de comisión e IGV) y permite **exportar a Excel**, pero no se integra con ningún sistema de facturación. La única "integración" son personas tipeando.
7. **Revisión de pagos manual**: los vouchers que envía el cliente se validan a mano contra la operación.

## 5. Objetivo del cliente

- **Un canal que conecte las partes manuales**: hoy los sistemas (dashboard, KeyFácil, Omie, correo) están aislados y las personas hacen de puente entre ellos. Brasper quiere un canal o integración que una esos puntos y elimine la intervención humana en los traspasos.
- **Automatizar la facturación de punta a punta**: que, cuando una operación quede registrada en el dashboard, el comprobante (boleta o factura) se genere y se envíe al cliente **automáticamente**.
- **Eliminar todas las partes manuales y los roles asociados** (pedido explícito del cliente):
  - **Tipeadores**: nadie debe pasar datos del dashboard a la plataforma de facturación.
  - **Contador**: la validación de cada operación y la decisión entre boleta y factura deben ser automáticas.
  - **Revisores**: la verificación del "match" (ID de operación, montos, DNI/RUC) debe hacerla el sistema.
  - El proceso objetivo es **cero toques humanos** en el flujo normal: dashboard → comprobante emitido → PDF enviado al cliente.
- ⚠️ **A tener en cuenta al diseñar (no frena el objetivo):**
  - **Excepciones**: casos con datos incompletos, documentos inválidos, rechazos de SUNAT o de la municipalidad, anulaciones o notas de crédito. La solución debe **detectarlos y derivarlos** a una cola de revisión, en vez de requerir que alguien revise todo.
  - **Supervisión humana**: el reglamento de IA (D.S. 115-2025-PCM) pide supervisión humana en los sistemas que usan IA. Eso puede cumplirse con un panel de monitoreo y auditoría, sin una persona por operación.
  - **Otras tareas del contador**: las obligaciones tributarias y contables de la empresa (declaraciones mensuales, libros electrónicos) **no forman parte de este flujo**. Lo que se elimina es el trabajo operativo de facturación, no necesariamente toda la función contable.
- **Automatizar la revisión de pagos**, validando vouchers y transferencias contra la operación registrada.
- **Eliminar KeyFácil y Omie**: es un pedido explícito del cliente. Hay que dejar de pagar ambas suscripciones y emitir los comprobantes con una herramienta propia, conectada directamente al dashboard.
- **Dejar de depender** de plataformas de terceros y de personas, ahorrando tiempo y dinero.
- Bajar el tiempo de emisión del comprobante de **2–3 días (antes, hasta 1,5 semanas) a minutos**: idealmente, que se emita apenas se cierre la operación.
- Debe funcionar en **ambos sentidos** (PER → BRA y BRA → PER).
- **Escalar a 1000 operaciones al día** sin sumar personal.
- **Alcance**: sólo el flujo de **facturación**. La automatización de ventas (agente en la web y WhatsApp) queda para su roadmap de 2027.

## 6. Requisitos y restricciones

### Técnicos

- **IA local**: los datos de los clientes (DNI/RUC, cuentas bancarias, montos) no deben salir a servicios de IA externos.
- **Ciberseguridad**: se manejan datos personales y financieros sensibles (control de acceso, cifrado, logs de auditoría, manejo seguro de credenciales de KeyFácil/Omie/SUNAT).
- **Sin acceso a su BD/API**: Brasper no compartirá su base de datos ni su API por tratarse de datos sensibles; a lo sumo, la interfaz. La solución debe leer los datos desde la interfaz del dashboard o, en la demo, trabajar con datos de prueba con la misma estructura.
- **Reemplazar KeyFácil y Omie**: como el cliente quiere eliminarlas, la solución debe hacer lo que hoy hacen ellas:
  - **Perú (PxB)**: emitir boleta o factura electrónica válida ante **SUNAT**. Eso implica generar el XML UBL 2.1, firmarlo con un certificado digital y enviarlo a SUNAT directamente (SEE-Del contribuyente) o a través de un **OSE/PSE** autorizado. Luego, recibir la constancia de recepción (CDR) y generar el PDF con código QR. *Brasper ya tiene un módulo en desarrollo que lo hace vía **APISUNAT**; hay que decidir si la solución se monta sobre ese módulo o lo reemplaza.*
  - **Dos empresas emisoras en Perú** (BRASPER 21 S.A.C. e INGENITECH S.A.C.), cada una con su propia serie, certificado y credenciales.
  - **Brasil (BxP)**: emitir la **NFS-e** ante la municipalidad correspondiente, directamente por el webservice de la prefeitura o del estándar nacional de NFS-e, o mediante un proveedor de API fiscal.
  - Además, cubrir las funciones secundarias que hoy dan esas plataformas: registro histórico, reportes (hoy exportan a Excel), anulaciones y notas de crédito.
- **Entrega multicanal**: el comprobante se envía por correo y/o WhatsApp.
- **Trazabilidad**: cada comprobante debe quedar vinculado a su ID de operación.
- **Idempotencia**: una operación no debe facturarse dos veces.

### Legales (Perú) — *importante*

- **Ley N.º 31814**, que promueve el uso de la IA, y su reglamento, el **D.S. N.º 115-2025-PCM** (publicado el 09/09/2025, vigente desde el 22/01/2026): principios de privacidad, no discriminación, supervisión humana y clasificación por riesgo. Para el sector **economía y finanzas**, las obligaciones de **transparencia algorítmica** son exigibles desde el **10/09/2026**, es decir, **ya aplican**.
- **Ley N.º 29733**, de Protección de Datos Personales, y su reglamento.
- **Normativa SUNAT de comprobantes de pago electrónicos**: boleta y factura emitidas por un sistema o proveedor autorizado (OSE/PSE).
- **Brasil** (flujo BRA → PER): normativa de notas fiscales (NFS-e municipal) y **LGPD** para los datos de clientes brasileños.

## 7. Preguntas abiertas (por confirmar con Brasper)

- [x] ~~¿Podemos acceder a la API o base de datos del dashboard?~~ → **No**, por tratarse de datos sensibles. Sólo a la interfaz.
- [ ] ¿Qué campos tiene una operación? ¿Nos pueden dar un **ejemplo anonimizado** o datos de prueba con la misma estructura?
- [x] ~~¿El dashboard permite exportar?~~ → **Sí**: botón **Exportar Excel** en la vista Contabilidad. *Falta conocer las columnas exactas del Excel.*
- [ ] Detalle fiscal del comprobante: confirmar con el contador que se factura **sólo la comisión + IGV 18 %**. Falta la **descripción del ítem** y la unidad, y saber si alguna operación es inafecta o exonerada.
- [x] ~~¿Quién llena la columna "Comprobante SUNAT"?~~ → Un **módulo propio en desarrollo** que emite vía **APISUNAT** (todavía sin validez tributaria).
- [ ] **Módulo APISUNAT**: ¿ya está en producción? (Algunos comprobantes dicen "validez tributaria" y a la vez llevan la etiqueta "DESARROLLO".) ¿Qué falta?
- [ ] **¿Por qué la boleta muestra un monto distinto a la "Venta final"?** (B001-00000003: S/ 14.14 frente a S/ 6.00; B001-00000004: ~S/ 16 frente a S/ 8.70.) ¿Cuál es el correcto?
- [ ] **¿Por qué `B001-00000001` aparece en dos operaciones?** ¿Una es de prueba? ¿Se reinició la numeración al pasar a producción? ¿Quieren que la solución **se construya sobre ese módulo** (automatizar el clic de "Emitir", las reglas y las validaciones) o que lo reemplace con otro enfoque?
- [ ] ¿Cuánto cuesta APISUNAT frente a KeyFácil? ¿Están conformes con depender de APISUNAT?
- [ ] **Regla de empresa emisora**: ¿cuándo se emite como BRASPER 21 S.A.C. y cuándo como INGENITECH S.A.C.? ¿Depende de la cuenta bancaria que recibe, del tipo de cliente o del monto?
- [ ] ¿Qué pasa cuando SUNAT **rechaza** un comprobante o se queda en "esperando respuesta"? ¿Quién lo atiende?
- [ ] ¿La diferencia entre la hora de emisión y la del historial (12:26 vs 07:26) es un problema de zona horaria conocido?
- [ ] ¿Por qué el "Monto a recibir" no cuadra con (envío − comisión) × tipo de cambio? ¿Hay otro diferencial? *(No afecta al comprobante.)*
- [ ] ¿Cuáles son los **tramos de comisión** (≈5 % / 4 % / 3 %) y cómo se decide el **descuento variable**?
- [ ] Para BxP: ¿la vista Contabilidad muestra las mismas columnas en BRL (comisión, impuesto brasileño ISS) para la NFS-e?
- [x] ~~¿Conectar o reemplazar KeyFácil y Omie?~~ → **Reemplazar.** El cliente quiere deshacerse de ambas.
- [ ] ¿Brasper ya tiene **certificado digital** para firmar comprobantes y usuario SOL secundario en SUNAT? ¿Y certificado A1 en Brasil para la NFS-e?
- [ ] ¿En qué **municipio** de Brasil está registrada la entidad brasileña? Define qué webservice de NFS-e se usa.
- [ ] ¿Hasta cuándo están pagadas las suscripciones? ¿Necesitan una transición en paralelo, con ambas plataformas activas mientras se prueba la nueva?
- [ ] ¿Qué funciones de KeyFácil y Omie usan además de emitir (reportes, Excel para el contador, guías, proformas) que la solución también tendría que cubrir?
- [x] ~~¿Quién emite el comprobante PxB?~~ → Dos empresas peruanas: **BRASPER 21 S.A.C.** (RUC 20608550454) e **INGENITECH S.A.C.** (RUC 20611936428).
- [ ] ¿**Brasper 21 Corretor(a)…** es quien emite en Omie para BxP? ¿Cuál es su razón social completa y su CNPJ?
- [ ] ¿El comprobante BxP es una NFS-e brasileña? ¿El cliente peruano recibe algo emitido en Perú?
- [ ] **Correo del cliente**: en el módulo nuevo es *opcional*. ¿Siempre se captura en WhatsApp? Si falta, ¿se envía el PDF por WhatsApp?
- [x] ~~¿El dashboard marca qué operaciones ya fueron facturadas?~~ → Sí, con la columna "Comprobante SUNAT" (serie, número y estado).
- [ ] ¿Cuánto pagan al mes por cada plataforma?
- [ ] ¿Cómo se valida hoy el voucher? ¿Se le paga al beneficiario antes de confirmar que llegó la transferencia?
- [ ] ¿Cómo se valida a una persona jurídica (consulta de RUC en SUNAT)?
- [ ] ¿Qué casos excepcionales hay (anulaciones, notas de crédito, datos incompletos, clientes extranjeros sin DNI)?
- [ ] ¿Qué rol cumple **Finzeler** (proveedor tecnológico del backend y del bot de IA)?

# Solución

*(Pendiente)*

---

### Fuentes

- Reunión con Brasper (transcripciones `audio1.txt`, `audio2.txt` y `flujo.txt`), la lámina "Ventas y facturación" y capturas de pantalla del dashboard (Transacciones, Contabilidad y el módulo de facturación electrónica) y de KeyFácil.
- Sitio web y app pública: [brasper.com](https://brasper.com/es)
- [KeyFácil](https://keyfacil.com/) · [Omie – Nota fiscal](https://omie.com.br/funcionalidades/nota-fiscal/)
- [D.S. N.º 115-2025-PCM (gob.pe)](https://www.gob.pe/institucion/pcm/normas-legales/7133522-115-2025-pcm) · [Resumen EY del reglamento](https://www.ey.com/es_pe/technical/tax-alert/reglamento-ley-promueve-uso-inteligencia-artificial) · [Garrigues](https://www.garrigues.com/es_ES/noticia/peru-aprueba-reglamento-ley-promueve-uso-inteligencia-artificial-favor-desarrollo-economico)
