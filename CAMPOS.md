# Campos de una operación Perú → Brasil (PxB)

Modelo de datos de **referencia** para el agente de digitación y la emisión directa ante SUNAT.

> ⚠️ **Origen de estos campos.** Brasper reemplazará el tramo de WhatsApp por una **plataforma con datos estructurados**. El agente tomará los campos y atributos desde ahí. **Todavía no tenemos el esquema real** de esa plataforma; Brasper indicó que será **similar a lo que ya tiene su dashboard**. Por eso este documento se arma con lo observado en:
> - el dashboard (vistas *Operaciones > Transacciones* y *Operaciones > Contabilidad*),
> - el módulo propio de facturación electrónica (formulario de emisión y panel de la boleta),
> - el mensaje de cotización de WhatsApp (lámina "Ventas y facturación"),
> - el formulario de KeyFácil,
> - la API pública del sitio (`tax-rate`, comisiones).
>
> Los nombres de campo (`snake_case`) son **propuestos por nosotros**. Hay que mapearlos al esquema real cuando lo tengamos. Los ejemplos están **anonimizados**.

Leyenda de **Obligatorio para emitir**: ✅ sí · ⚠️ condicional · — no hace falta para el comprobante.

---

## 1. Operación

### 1.1 Identificación

| Campo propuesto | Tipo | Ejemplo | Visto en | Obligatorio para emitir | Notas / validación |
|---|---|---|---|---|---|
| `codigo` | string | `PxB-001461` | Dashboard (Código) | ✅ | Prefijo `PxB-` = Perú → Brasil, `BxP-` = Brasil → Perú. Es la **clave de trazabilidad** y de **idempotencia** (una operación = un comprobante). |
| `sentido` | enum `PxB` \| `BxP` | `PxB` | Derivado del código y del filtro de moneda | ✅ | El alcance actual es sólo `PxB`. |
| `numero_operacion` | string | `05118043`, `E1320…2026…`, `f822dd74` | Dashboard (N° operación) | — | **No tiene un formato único**: número bancario peruano, ID *end-to-end* de Pix o código alfanumérico. Sirve para conciliar el pago, no para el comprobante. |
| `fecha_operacion` | datetime (America/Lima) | `2026-10-10T12:27:00-05:00` | Vista Contabilidad (filtro por día) | ✅ | Guardar **siempre con zona horaria**: el módulo actual muestra un desfase de 5 h. |
| `estado_operacion` | enum | `cerrada` | Flujo (la operación se cierra cuando el beneficiario recibe el dinero) | ✅ | **Sólo se factura una operación cerrada.** Faltan los valores reales del enum. |
| `etiquetas` | string[] | `["VIP", "Cliente nuevo Referido"]` | Dashboard (Etiquetas) | — | Valores vistos: *Cliente nuevo general*, *Cliente nuevo Referido*, *Campaña 22/08/2026*, *Seguimiento*, *VIP*, *Cliente Nuevo Formulario*. |
| `vendedor` | string | *(uno de los 3 vendedores)* | — (no visto) | — | Útil para auditoría. **Por confirmar** si existe. |

### 1.2 Cliente (remitente = adquirente del comprobante)

| Campo propuesto | Tipo | Ejemplo | Visto en | Obligatorio para emitir | Notas / validación |
|---|---|---|---|---|---|
| `cliente_nombre` | string | `NOMBRE APELLIDO APELLIDO` | Dashboard (Cliente), KeyFácil, panel de la boleta | ✅ | Para una factura es la **razón social**. Puede autocompletarse consultando el DNI (RENIEC) o el RUC (SUNAT). |
| `cliente_tipo_documento` | enum | `DNI` | Vista Contabilidad (Tipo de documento) | ✅ | Valores vistos: `DNI`, `CE`, `RUC`; el módulo también admite `PASAPORTE`. Ver el mapeo al catálogo 06 de SUNAT en §4. |
| `cliente_numero_documento` | string | `########` | Vista Contabilidad (Documento) | ⚠️ | DNI = 8 dígitos · RUC = 11 dígitos (empieza con 10 o 20, con dígito verificador) · CE = hasta 12 caracteres alfanuméricos · pasaporte = alfanumérico. **Obligatorio en una boleta si el total supera S/ 700** o si el cliente lo pide; siempre obligatorio en una factura. |
| `cliente_correo` | string (email) | `cliente@dominio.com` | Panel de la boleta, KeyFácil | ⚠️ | Opcional en el módulo actual, pero **sin correo el PDF no llega solo**. Hay que validar el formato. |
| `cliente_telefono` | string (E.164) | `+51 9XX XXX XXX` | KeyFácil (Teléfono) | — | Canal alternativo para entregar el PDF. |
| `cliente_direccion_fiscal` | string | — | Módulo de emisión (opcional) | ⚠️ | Recomendado para una factura. |

### 1.3 Montos y cálculo

| Campo propuesto | Tipo | Ejemplo | Visto en | Obligatorio para emitir | Notas / validación |
|---|---|---|---|---|---|
| `monto_envio` | decimal(2) | `200.00` | Vista Contabilidad (Monto de envío) | — | Lo que envía el cliente. **No se factura**, pero define el tramo de comisión. |
| `moneda_origen` | ISO 4217 | `PEN` | Filtro Moneda `PEN-BRL` | — | |
| `monto_recibir` | decimal(2) | `272.00` | Vista Contabilidad (Monto a recibir) | — | Lo que recibe el beneficiario. |
| `moneda_destino` | ISO 4217 | `BRL` | Filtro Moneda / Cuenta destino | — | |
| `tipo_cambio` | decimal(4) | `1.4250` | Vista Contabilidad (Tipo cambio) | — | ⚠️ El "Monto a recibir" **no cuadra** con (envío − comisión) × TC. **Por confirmar.** |
| `comision_porcentaje` | decimal | `5.00` | Inferido (≈5 % / 4 % / 3 % por tramos); API `percentage`, `min_amount`, `max_amount` | — | La comisión baja por tramos según el monto. |
| `descuento_variable` | decimal (%) | `40.00` | Vista Contabilidad (Descuento variable) | — | Descuento sobre la comisión (promoción o negociación). |
| `comision_base` | decimal(2) | `5.08` | Vista Contabilidad (Comisión final interna) | ✅ | **Valor de venta** del comprobante (base imponible). |
| `igv` | decimal(2) | `0.92` | Vista Contabilidad (Impuesto final interno) | ✅ | 18 % de la base. |
| `venta_final` | decimal(2) | `6.00` | Vista Contabilidad (Venta final) | ✅ | **Total del comprobante** = base + IGV. ⚠️ En el módulo actual, el total de la boleta **no coincide** con esta columna (ver el README). |

**Relaciones esperadas** (sirven para que el agente **valide automáticamente** cada operación):

```
comision_bruta = monto_envio × comision_porcentaje / 100
venta_final    = round(comision_bruta × (1 − descuento_variable / 100), 2)
comision_base  = round(venta_final / 1.18, 2)
igv            = venta_final − comision_base
```

Comprobado con los datos observados:

| monto_envio | % | descuento | venta_final | base | IGV |
|---|---|---|---|---|---|
| 200.00 | 5 | 40 % | 6.00 | 5.08 | 0.92 |
| 500.00 | 4 | 45 % | 11.00 | 9.32 | 1.68 |
| 1800.00 | 3 | 50 % | 27.00 | 22.88 | 4.12 |
| 290.00 | 5 | 40 % | 8.70 | 7.37 | 1.33 |

### 1.4 Cuentas y empresa emisora

| Campo propuesto | Tipo | Ejemplo | Visto en | Obligatorio para emitir | Notas / validación |
|---|---|---|---|---|---|
| `cuenta_origen` | objeto `{banco, moneda}` | `{BCP, PEN}` | Reunión ("dame tu cuenta BCP…"); filtro Cuenta bancaria | — | Cuenta desde la que paga el cliente. |
| `cuenta_destino` | objeto `{banco, moneda}` | `{Nubank, BRL}` | Dashboard (Cuenta destino) | — | Valores vistos: *Nubank*, *InfinitePay*, *C6 Bank*, *Scotiabank*. |
| `empresa_emisora` | enum | `INGENITECH S.A.C.` | Dashboard (Razón social), módulo de emisión | ✅ | Hoy se elige a mano entre **BRASPER 21 S.A.C.** e **INGENITECH S.A.C.** (ver §3). **La regla de elección está por confirmar.** |

### 1.5 Evidencias (vouchers)

| Campo propuesto | Tipo | Ejemplo | Visto en | Obligatorio para emitir | Notas / validación |
|---|---|---|---|---|---|
| `comprobante_pago` | archivo (imagen) | `voucher_cliente.jpg` | Vista Contabilidad (Comp. pago) | — | Transferencia **del cliente a Brasper**. Es una imagen, así que hace falta **OCR o visión** para validarla contra `monto_envio`, la fecha y `numero_operacion`. |
| `comprobante_envio` | archivo (imagen) | `voucher_envio.jpg` | Vista Contabilidad (Comp. envío) | — | Transferencia **de Brasper al beneficiario**. Demuestra que la operación se cerró. |

---

## 2. Comprobante electrónico (lo que genera la emisión)

| Campo propuesto | Tipo | Ejemplo | Visto en | Notas |
|---|---|---|---|---|
| `tipo_comprobante` | enum | `BOLETA` | Módulo de emisión | `BOLETA` (código SUNAT `03`) si el documento es DNI, CE o pasaporte; `FACTURA` (código `01`) si es RUC. |
| `serie` | string(4) | `B001` | Vista Contabilidad, panel de la boleta | Boleta = `B###`, factura = `F###`. **Una serie por empresa emisora.** |
| `numero` | entero (8 dígitos) | `00000004` | Ídem | Correlativo **único por emisor + serie**. ⚠️ Hoy se observa un **duplicado** (`B001-00000001` dos veces). |
| `emisor_ruc` | string(11) | `20611936428` | Panel de la boleta | El RUC de la empresa emisora. |
| `fecha_emision` | datetime (America/Lima) | `2026-10-10T12:27:00-05:00` | Panel de la boleta | ⚠️ Hay un desfase de 5 h entre "Emisión" y el "Historial". |
| `moneda` | ISO 4217 | `PEN` | — | La comisión se factura en soles. |
| `valor_venta` | decimal(2) | `5.08` | Panel de la boleta | Debe ser igual a `comision_base`. |
| `igv` | decimal(2) | `0.92` | Panel de la boleta | Debe ser igual a `igv` de la operación. |
| `importe_total` | decimal(2) | `6.00` | Panel de la boleta | Debe ser igual a `venta_final`. |
| `estado` | enum | `ACEPTADO` | Panel de la boleta, vista Contabilidad | Vistos: *Número reservado*, *Enviado*, *En SUNAT (esperando respuesta)*, *Aceptado*. Faltan *Rechazado* y *Observado*. |
| `entorno` | enum `PRUEBA` \| `PRODUCCION` | `PRODUCCION` | Etiqueta "DESARROLLO" / mensaje "validez tributaria" | Hay que **distinguirlo siempre**; hoy es ambiguo. |
| `archivo_pdf` | archivo | `B001-00000004.pdf` | Panel de la boleta (Descargar PDF) | Representación impresa, con código QR. |
| `archivo_xml` | archivo | `…-03-B001-00000004.xml` | Panel de la boleta (XML firmado) | XML UBL 2.1 firmado digitalmente. |
| `archivo_cdr` | archivo | `R-…-03-B001-00000004.zip` | Panel de la boleta (CDR de SUNAT) | Constancia de recepción de SUNAT. |
| `historial` | evento[] | `[{reservado, 07:27}, {enviado, 07:27}, {aceptado, 07:27}]` | Panel de la boleta | Pista de auditoría (útil para la supervisión humana que pide el D.S. 115-2025-PCM). |
| `operacion_codigo` | string | `PxB-001461` | — | **Vínculo con la operación**: garantiza trazabilidad e idempotencia. |
| `entregado_a` | objeto `{canal, destino, fecha}` | `{email, cliente@…, …}` | — | Registro de la entrega por correo o WhatsApp. |

---

## 3. Empresas emisoras (Perú)

| Razón social | RUC | Visto en |
|---|---|---|
| BRASPER 21 S.A.C. | 20608550454 | Módulo de emisión; empresa en sesión en KeyFácil |
| INGENITECH S.A.C. | 20611936428 | Módulo de emisión; columna "Razón social"; emisor de las boletas B001 observadas |

Cada una necesita su **propio certificado digital, credenciales SUNAT y series**.

---

## 4. Mapeo a los datos que exige SUNAT (boleta/factura electrónica)

Propuesta de mapeo para la **emisión directa vía API**. ⚠️ **Hay que confirmar con el contador** la descripción del ítem y la afectación del IGV.

| Dato SUNAT (UBL 2.1) | Valor / origen |
|---|---|
| Tipo de comprobante (catálogo 01) | `03` boleta · `01` factura (según `cliente_tipo_documento`) |
| Serie y número | `serie` + `numero` (correlativo por emisor) |
| Fecha y hora de emisión | `fecha_emision` (hora de Lima) |
| Moneda | `PEN` |
| Emisor: RUC y razón social | `empresa_emisora` → §3 |
| Adquirente: tipo de documento (catálogo 06) | `DNI` → `1` · `CE` → `4` · `RUC` → `6` · `PASAPORTE` → `7` · sin documento → `0`/`-` *(sólo en una boleta ≤ S/ 700)* |
| Adquirente: número y nombre | `cliente_numero_documento`, `cliente_nombre` |
| Ítem: descripción | *Propuesta:* "Comisión por servicio de transferencia de dinero – operación {codigo}" |
| Ítem: cantidad y unidad (catálogo 03) | `1` · `ZZ` (servicio) |
| Ítem: valor unitario / valor de venta | `comision_base` |
| Afectación del IGV (catálogo 07) | *Propuesta:* `10` (gravado – operación onerosa) |
| IGV (18 %) | `igv` |
| Importe total | `venta_final` |
| Leyenda "monto en letras" (catálogo 52, código 1000) | Generado a partir de `venta_final` |

**Reglas que el agente puede aplicar sin intervención humana:**
1. `sentido == PxB` y `estado_operacion == cerrada` → la operación es facturable.
2. `cliente_tipo_documento == RUC` → **factura**; si no → **boleta**.
3. Boleta con `venta_final > 700` → `cliente_numero_documento` **obligatorio**. (Con comisiones de S/ 6 a S/ 27 casi nunca ocurre, pero hay que validarlo.)
4. Validar el formato del documento: DNI de 8 dígitos; RUC de 11 dígitos con dígito verificador; CE alfanumérico.
5. Recalcular `venta_final`, `comision_base` e `igv` con las fórmulas de §1.3 y **comparar** con los valores de la plataforma; si no coinciden, derivar a revisión.
6. Antes de emitir, verificar que **no exista** ya un comprobante para `operacion_codigo` (idempotencia).
7. Después de emitir, verificar que `importe_total` del comprobante sea igual a `venta_final` y que `serie-numero` no esté repetido.
8. Sin `cliente_correo` → entregar por WhatsApp o derivar a revisión.

---

## 5. Ejemplo de operación (anonimizado)

```json
{
  "codigo": "PxB-001461",
  "sentido": "PxB",
  "numero_operacion": "f822dd74",
  "fecha_operacion": "2026-10-10T12:27:00-05:00",
  "estado_operacion": "cerrada",
  "etiquetas": ["Cliente nuevo general"],
  "cliente": {
    "nombre": "CLIENTE DE PRUEBA",
    "tipo_documento": "DNI",
    "numero_documento": "00000000",
    "correo": "cliente@ejemplo.com",
    "telefono": "+51900000000"
  },
  "montos": {
    "monto_envio": 200.00,
    "moneda_origen": "PEN",
    "monto_recibir": 272.00,
    "moneda_destino": "BRL",
    "tipo_cambio": 1.4250,
    "comision_porcentaje": 5.00,
    "descuento_variable": 40.00,
    "comision_base": 5.08,
    "igv": 0.92,
    "venta_final": 6.00
  },
  "cuenta_origen": { "banco": "BCP", "moneda": "PEN" },
  "cuenta_destino": { "banco": "Nubank", "moneda": "BRL" },
  "empresa_emisora": { "razon_social": "INGENITECH S.A.C.", "ruc": "20611936428" },
  "evidencias": {
    "comprobante_pago": "voucher_cliente.jpg",
    "comprobante_envio": "voucher_envio.jpg"
  }
}
```

---

## 6. Pendiente de confirmar sobre la plataforma de datos estructurados

- [ ] **Esquema real**: nombres de campos, tipos y cuáles son obligatorios. ¿Nos pueden dar un ejemplo anonimizado o un entorno de prueba?
- [ ] **Cómo se accede a los datos**: ¿API (REST/webhook), base de datos, exportación (Excel/CSV)? ¿Avisa cuando una operación se cierra (evento) o hay que consultarla periódicamente?
- [ ] ¿Esa plataforma **reemplaza al dashboard** o le **envía** los datos? ¿Dónde queda registrado el comprobante emitido?
- [ ] ¿Trae el **correo** del cliente siempre?
- [ ] ¿Trae la **empresa emisora** ya decidida o hay que deducirla? ¿Con qué regla?
- [ ] ¿Trae `comision_base`, `igv` y `venta_final` calculados, o sólo el porcentaje y el descuento?
- [ ] ¿Incluye los **vouchers** como archivo o URL?
- [ ] ¿Cuáles son los valores posibles de `estado_operacion` y en cuál se debe facturar?

---

### Fuentes

- Capturas de pantalla del dashboard de Brasper (Transacciones, Contabilidad, módulo de facturación electrónica) y de KeyFácil; lámina "Ventas y facturación".
- SUNAT – R.S. 303-2018/SUNAT, identificación del adquirente en boletas mayores a S/ 700: [anexo 303-2018](https://ww3.sunat.gob.pe/legislacion/superin/2018/anexo-303-2018.pdf) · [R.S. 303-2018](https://ww3.sunat.gob.pe/legislacion/superin/2018/303-2018.pdf) · [anexo II 114-2019](https://www.sunat.gob.pe/legislacion/superin/2019/anexoII-114-2019.pdf)
- [gob.pe – Boleta de venta electrónica](https://www.gob.pe/7010-comprobantes-que-emites-en-el-nrus-emitir-boleta-de-venta-electronica-en-el-nuevo-rus)
