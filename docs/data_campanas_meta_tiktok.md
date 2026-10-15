# Qué data entregan las campañas de Meta y TikTok (oct 2026)

**Idea central:** ni Meta ni TikTok dicen *quién* vio o hizo clic en un anuncio. Sus reportes son agregados (gasto, alcance, clics, edad, género, región). La trazabilidad por cliente se logra en la web de Brasper: guardando el ID de clic y los UTM cuando la persona llega, y amarrándolos al registro y luego a sus operaciones.

## Datos agregados (reportes)
- **Meta Insights** (campaña > conjunto > anuncio): `spend`, `impressions`, `reach`, `frequency`, `clicks`, `inline_link_clicks`, `ctr`, `cpc`, `cpm`, `actions`, `action_values`, `cost_per_action_type`, `purchase_roas`.
  - Desgloses: `age`, `gender`, `country`, `region`, `publisher_platform` (Facebook/Instagram/WhatsApp/Messenger), `platform_position`, `device_platform` y por hora.
- **TikTok Reporting API:** `spend`, `impressions`, `reach`, `clicks`, `ctr`, `cpc`, `cpm`, `conversion`, `cost_per_conversion`.
  - Desgloses: `age`, `gender`, `country_code`, `province_id`, `placement`, `stat_time_day/hour`.

## Datos por persona (donde sí hay match directo)
- **Click-to-WhatsApp:** el primer mensaje trae `referral`, con `source_id` (el ID del anuncio), `headline`, `body`, `media_type` y `ctwa_clid`, más el teléfono (`wa_id`).
- **Lead Ads (formularios):** traen `leadgen_id`, `ad_id`, `form_id`, `created_time` y `field_data` (nombre, email, teléfono, ciudad y preguntas propias, como el DNI/CPF).
- **Web propia:**
  - `utm_source/medium/campaign/content/term`. En Meta se pueden usar macros como `{{campaign.id}}` o `{{ad.id}}`.
  - IDs de clic: `fbclid` y `ttclid`.
  - Cookies: `_fbp`, `_fbc` y `_ttp`.
  - Eventos: `PageView`, `ViewContent` (calculadora), `CompleteRegistration` y `Purchase`, enviados por Pixel y por Conversions/Events API con el mismo `event_id`.

## Llaves de cruce propuestas
1. **Al llegar a la web** (tras el consentimiento): guardar `visitor_id`, los UTM, el ID de clic y el ID del anuncio en la tabla `touchpoints`.
2. **Al registrarse:** crear `customer_attribution` con el primer y el último toque, más los hash SHA-256 del email, el teléfono y el DNI/CPF.
3. **Leads de WhatsApp y formularios:** cruzarlos por el hash del teléfono o del email.
4. **Operaciones:** unir `transacciones.cliente → customer_attribution → anuncio/campaña`.
5. **Métricas:** CAC = gasto / clientes nuevos; ROAS = comisión / gasto; ROI = (comisión − gasto) / gasto; LTV por cohorte.

## Privacidad
- **LGPD** (guía de cookies de la ANPD) y **Ley 29733 + DS 016-2024-JUS:** el Pixel se activa solo después de que la persona acepta, con consentimiento granular, y en el registro se declara que los datos sirven para medir campañas.

## Referencias de costo (aproximadas)
- **Meta, Brasil:** CPC ~US$0.20, CPM ~US$4, CTR en finanzas ~0.26 %.
- **Meta, LATAM:** el CPL en finanzas es alto.
- **TikTok, Brasil:** CPM US$1.4–3.6, CPC US$0.10–0.30, CPL US$4–12.
- **Perú:** no hay datos públicos.

## Fuentes
- developers.facebook.com/docs/marketing-api/insights/breakdowns
- developers.facebook.com/docs/marketing-api/guides/lead-ads/retrieving
- developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
- Webhooks de WhatsApp Cloud API (`referral`)
- ads.tiktok.com/help/article/tiktok-click-id
- fivetran.com/docs/connectors/applications/tiktok-ads/custom-reports
- superads.ai
- stackmatix.com/blog/tiktok-ads-cost-by-country-2026
