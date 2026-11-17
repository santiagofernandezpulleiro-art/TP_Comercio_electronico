# Hub de Aliados Estratégicos · Solidaridad LATAM

Prototipo académico B2B de Comercio Electrónico del ITBA. Implementa el circuito **landing → formulario → recurso técnico → CRM → calificación → seguimiento institucional** del informe adjunto “TP Comercio Electrónico (1).pdf”. No es una herramienta oficial ni está conectado a Solidaridad.

## Ejecutar

Requisitos: Node.js 22 o 24 y npm. Validado con Node.js 24.22.1. No requiere base de datos, backend, cuentas ni credenciales.

```bash
npm ci
npm run dev
```

El servidor Vite indica su dirección y usa el puerto 5173 por defecto. Después de instalar las dependencias, todo el flujo funciona sin internet **mientras el servidor local permanezca ejecutándose**. La imagen, los iconos y el PDF son locales; no se utilizan fuentes, imágenes remotas ni APIs en tiempo de ejecución.

```bash
npm run build     # TypeScript + compilación de producción
npm run preview   # Servir la compilación generada
npm test          # Pruebas funcionales en Chromium, escritorio y móvil
```

En la nube, si la caché habitual no es escribible, usar `npm ci --cache /tmp/silva-npm-cache`. Esa ruta se conserva por compatibilidad con el entorno existente; no afecta la identidad del producto. Después de reinstalar `node_modules`, reiniciar el servidor Vite propio para evitar módulos obsoletos en memoria.

Las pruebas usan `/usr/bin/chromium` cuando está disponible. En otros equipos, ejecutar una vez `npx playwright install chromium`, o indicar la ruta de un navegador instalado en `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Playwright inicia el servidor de pruebas automáticamente. Los resultados y las trazas están excluidos de Git.

## Cuatro pantallas

| Ruta          | Función                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/#/`         | Landing institucional, patrón en Z, CTA al informe y contacto con el equipo.                                                                     |
| `/#/registro` | Nombre, apellido, correo corporativo, organización y sector; consentimiento obligatorio y comunicaciones opcionales independientes.              |
| `/#/gracias`  | Confirmación personalizada, descarga real de PDF y solicitud de reunión técnica mediante modal.                                                  |
| `/#/crm`      | Consola de Comunicación y Programas: indicadores, gráficos, búsqueda, filtros, ordenamiento, ficha, historial, notas, calificación y derivación. |

La barra inferior permite recorrerlas y restaurar los datos de ejemplo. Los modales no agregan pantallas. “Contactar al equipo” registra una solicitud si existe un contacto activo; si no, indica cómo registrarlo. No solicita horarios ni crea invitaciones.

## Demostración en 8 minutos

| Tiempo    | Recorrido                                                                                                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–1:00 | Mostrar la landing: propuesta de valor, cadena agroindustrial y CTA. Aclarar que se trata de un prototipo académico, no de una plataforma oficial.                                            |
| 1:00–2:15 | Abrir el formulario, mostrar validaciones y registrar `Alex`, `Pérez`, `alex@origen.test`, `Cooperativa Origen Demo`, `Café y cacao`. Aceptar tratamiento y dejar comunicaciones desmarcadas. |
| 2:15–3:00 | Acceder al material y descargar el PDF. La descarga añade 20 puntos y habilita MQL con los criterios iniciales.                                                                               |
| 3:00–3:45 | Solicitar una reunión técnica y agregar contexto. Mostrar la confirmación: no es una reserva de calendario ni envía notificaciones.                                                           |
| 3:45–4:45 | Entrar al CRM. Encontrar el último contacto resaltado, ver sector, descarga, estado y calificación MQL. Los indicadores reflejan los eventos del recorrido.                                   |
| 4:45–6:00 | Abrir la ficha. Consultar la puntuación y el historial. Marcar aceptación simulada por Programas: pasa a SQL. Agregar una nota y derivar a Programas.                                         |
| 6:00–7:00 | Mostrar filtros, búsqueda y orden por fecha. Recargar para comprobar persistencia. Explicar diferencia entre estado operativo y calificación.                                                 |
| 7:00–8:00 | Mostrar atribución UTM y criterios configurables. Explicar que no hay objetivos cuantitativos institucionales validados. Exportar o restaurar datos.                                          |

Para demostrar atribución desde el inicio, abrir la aplicación con parámetros **antes del fragmento de ruta**:

```text
/?utm_source=linkedin&utm_medium=social&utm_campaign=piloto-eudr#/
```

También se puede generar un enlace desde **Simular campaña** en el CRM. Esto solo recarga la aplicación local con UTM: no publica campañas ni crea conexiones externas.

## Puntuación transparente

Los criterios siguientes son hipótesis de demostración, **sujetos a validación por Solidaridad**. No provienen de umbrales cuantitativos del informe.

| Señal                                    | Puntos máximos |
| ---------------------------------------- | -------------: |
| Organización declarada, sin verificación |             10 |
| Sector prioritario de la demostración    |             25 |
| Formulario enviado                       |              5 |
| Solicitud de descarga del recurso        |             20 |
| Solicitud de reunión técnica             |             30 |
| Aceptación manual simulada por Programas |             10 |

- Total máximo: 100. Repetir descargas o interacciones no acumula puntuación adicional.
- Sectores prioritarios de ejemplo: todos los disponibles salvo **Otro**. No se afirma que esta selección represente las prioridades reales de Solidaridad.
- **MQL:** al menos 60 puntos, sector prioritario y descarga solicitada.
- **SQL:** al menos 90 puntos, condiciones MQL, solicitud de reunión y aceptación manual de Programas. Una solicitud por sí sola no convierte al contacto en SQL.
- Los umbrales son editables desde **Criterios de calificación**. Se valida `1 ≤ MQL < SQL ≤ 100`; cambiar los valores recalcula indicadores y fichas y persiste al recargar.
- El formulario no recoge cargo, tamaño de empresa ni poder de decisión: esos atributos no se dan por verificados.
- El estado operativo es independiente. Se incluyen los estados pedidos, incluidos los hitos “MQL” y “SQL”; elegirlos no fuerza la calificación calculada. La interfaz explica esa diferencia.

## Eventos, métricas y atribución

El almacenamiento inicial contiene 18 contactos ficticios de diferentes sectores, direcciones `.test` y eventos sintéticos. No representan personas, alianzas o actividad real de Solidaridad.

- Eventos: visita a landing, inicio de formulario, formulario enviado, solicitud de descarga, solicitud de reunión, actualización de estado, revisión técnica, nota, derivación y cambio de umbrales.
- Visita e inicio se registran una vez por sesión local, sin duplicarse al navegar o recargar. La sesión se conserva en SessionStorage. Un enlace con UTM diferente inicia una nueva sesión de atribución.
- La atribución es de **primer contacto por sesión**, no algorítmica ni multicanal. Se conservan `utm_source`, `utm_medium`, `utm_campaign`; los faltantes se rotulan como no informados. No se deducen fuentes verificadas a partir de su ausencia.
- La conversión de landing cuenta **sesiones con visita y formulario / sesiones con visita**, por lo que varios envíos de la misma sesión no inflan la tasa y una entrada directa al formulario no se inventa como visita. Es una interpretación por sesión de la fórmula formularios/visitas del TP.
- Formularios y solicitudes de descarga muestran eventos registrados. La descarga significa un clic que solicita el PDF, no prueba que se guardó o leyó. La reunión significa interés, no una reunión realizada.
- MQL y SQL cuentan calificaciones actuales; no se presentan como tasas de transición históricas.
- Los gráficos muestran altas en 14 días, embudo de eventos, distribución por sector y estado, y tráfico/conversiones por fuente cuando existen visitas.
- El CSV exporta los contactos que coinciden con los filtros y contiene estado, puntuación y UTM.
- No se simulan impresiones, rebote, fondos movilizados, convenios firmados ni impacto económico sin evidencia. No se fijan metas institucionales inventadas.

## Datos personales y límites de producción

Usar exclusivamente datos ficticios. La clave LocalStorage es `solidaridad-hub-v1`; guarda contactos, consentimiento y fecha, eventos, notas, umbrales y último contacto. Si el almacenamiento falla, se informa que el estado solo durará en memoria. Los datos dañados se recuperan con un aviso.

El consentimiento para el tratamiento es obligatorio. La casilla de comunicaciones institucionales empieza desmarcada y es independiente. El aviso se refiere a la Ley argentina 25.326 y explica finalidad, almacenamiento local y supresión. La ficha permite eliminar un contacto y sus actividades; para rectificar los datos de identidad, se elimina y vuelve a registrar. Restaurar borra solo la demostración actual y carga de nuevo sus ejemplos y criterios.

La versión anterior de Silva, si existiera en el mismo navegador, conserva su clave separada y no se importa: no sería válido inventarle sectores ni consentimientos obligatorios. Esta actualización no borra esos datos anteriores ni otras aplicaciones.

No hay autenticación, backend, cifrado de base de datos, comunicaciones, CRM externo, GA4, GTM ni Looker Studio. El aviso no certifica cumplimiento legal. Antes de un uso real se requiere validación jurídica, responsable identificable, canales de derechos, seguridad, conservación, gobernanza de datos y confirmación de criterios por Comunicación y Programas.

## Informe, identidad y recursos

La correspondencia de requisitos y decisiones está documentada en [docs/ALINEACION_INFORME.md](docs/ALINEACION_INFORME.md). Se priorizan las secciones 5, 6, 8, 9 y 10. El modelo futuro de membresías de la sección 7 no se implementa: no hay tienda, carrito, pagos, facturación ni membresías.

- `public/informe-eudr-demostracion.pdf`: PDF local de dos páginas, expresamente académico y no oficial. Contiene preguntas introductorias y alcance, no asesoramiento normativo ni estadísticas atribuidas a la organización. No es una copia del TP ni un supuesto informe oficial de EUDR.
- `scripts/generate-sample-report.py`: fuente reproducible del PDF. Ejecutar `python3 scripts/generate-sample-report.py`; no necesita dependencias.
- `public/agricultura-ilustrativa.png`: imagen agrícola generada para este prototipo y rotulada como ilustrativa. No se atribuye a un proyecto, territorio o intervención de Solidaridad.
- La marca de cabecera es una referencia tipográfica al nombre institucional; no es un archivo del imagotipo oficial. El acceso al sitio institucional y al banco de imágenes respondió 403 en este entorno. No se inventan respaldos, sellos ni logos de aliados. Para difusión institucional debe sustituirse por un recurso oficial autorizado.
- El PDF académico adjunto se utilizó como fuente de análisis; no se incluye en el sitio ni se publica con los datos personales de su portada.

## Arquitectura

Se conserva React, TypeScript, Vite, Tailwind CSS y Lucide React del proyecto existente. Los gráficos usan SVG y CSS locales, con etiquetas textuales accesibles, sin agregar una dependencia de gráficos innecesaria.

```text
src/App.tsx            Estado compartido, navegación, sesiones y registro de eventos
src/PublicPages.tsx    Landing, captación, confirmación y solicitud de reunión
src/Dashboard.tsx      Tabla, filtros, orden, exportación, criterios y campaña UTM
src/Analytics.tsx      Indicadores y gráficos derivados
src/ContactDetail.tsx  Información, puntuación, historial, notas y derivación
src/data.ts            Tipos, ejemplos, validación y reglas de puntuación
src/components.tsx     Marca, portada, diálogos y privacidad reutilizables
src/styles.css         Sistema visual y componentes base existentes
src/institutional.css  Adaptación institucional y responsive
tests/flow.spec.ts     Recorrido, consentimiento, duplicados, UTM, reglas y persistencia
```

El entorno conserva el flujo autorizado de commit y push al finalizar tareas solicitadas. La rama local puede llamarse `work`; el destino acordado es `main`. Nunca se usa force push ni se incluyen secretos. La configuración de arranque se guarda en el borrador del entorno; publicarla desde la interfaz activa las instrucciones para futuras instancias.
