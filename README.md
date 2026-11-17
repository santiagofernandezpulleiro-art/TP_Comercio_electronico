# Silva · EUDR Intelligence

Prototipo académico interactivo para demostrar una estrategia de captación, conversión y gestión de leads. **Silva es una marca ficticia**. La aplicación tiene exactamente cuatro pantallas principales y no utiliza backend, APIs, fuentes ni imágenes externas.

## Ejecutar localmente

Requisitos: Node.js 22 o 24 y npm. Validado con Node.js 24.22.1 y npm 11.9.0.

```bash
npm ci
npm run dev
```

Vite informa la dirección del servidor (puerto predeterminado 5173). Mantené la terminal abierta durante la demostración. Después de instalar las dependencias no se necesita conexión a internet: todos los recursos, incluidos iconos y PDF, son locales. El servidor local debe seguir encendido.

```bash
npm run build     # TypeScript + compilación de producción
npm run preview   # Servir la compilación generada
npm test          # Pruebas funcionales en Chromium: desktop y móvil
```

Las pruebas usan `/usr/bin/chromium` si existe. En otros equipos, instalá el navegador una vez con `npx playwright install chromium`, o indicá su ruta con `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. La configuración inicia automáticamente Vite en el puerto 5173. Los resultados y trazas de fallos son locales y están excluidos de Git.

En entornos donde la caché habitual de npm no sea escribible:

```bash
npm ci --cache /tmp/silva-npm-cache
```

## Las cuatro pantallas

1. `/#/`: landing del reporte, beneficios, portada creada con CSS y CTA de descarga.
2. `/#/registro`: formulario con validación, aviso de privacidad y consentimiento comercial opcional desmarcado. Crea un contacto con estado **Nuevo** y clasificación **Lead**.
3. `/#/gracias`: confirmación, descarga del PDF de muestra y modal de reserva simulada. La reserva actualiza el estado del contacto a **Reunión agendada**, sin modificar su clasificación.
4. `/#/crm`: espacio comercial interno con indicadores derivados, visualización de etapas, tabla, búsqueda por nombre o empresa, filtros de estado y clasificación, edición, supresión y exportación CSV de los resultados visibles.

La barra inferior permite recorrer las cuatro pantallas y reiniciar la demostración, con confirmación. Las reservas, la ficha de contacto, la ayuda y el aviso de privacidad son modales, no pantallas adicionales. Al abrir directamente la confirmación sin registrarse se puede descargar la muestra; para vincular una reserva se solicita primero un contacto.

## Recorrido sugerido · 8 minutos

| Tiempo    | Acción y explicación                                                                                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–1:15 | Mostrar la landing: propuesta de valor, patrón de lectura en Z y beneficios del contenido. Explicar que el documento y la marca son de demostración.                                                                      |
| 1:15–2:30 | Pulsar **Descargar reporte gratuito**. Mostrar validaciones con un envío vacío. Ingresar `Alex Pérez`, `alex@origen.test`, `Origen Demo`, `Responsable de sostenibilidad`. Mostrar que las comunicaciones son opcionales. |
| 2:30–3:30 | Enviar. Mostrar confirmación y descargar el PDF. Aclarar que no es el informe original ni asesoramiento normativo.                                                                                                        |
| 3:30–4:15 | Abrir la reserva, elegir día y horario y confirmar. Mostrar el aviso de reserva simulada, sin reunión real.                                                                                                               |
| 4:15–5:00 | Abrir el CRM. Distinguir el espacio comercial de la experiencia del visitante. Identificar el contacto destacado como **Desde formulario**.                                                                               |
| 5:00–6:15 | Cambiar su clasificación **Lead → MQL → SQL** desde la tabla; observar indicadores y distribución. Explicar que el estado de seguimiento es independiente de la clasificación.                                            |
| 6:15–7:15 | Buscar por empresa, filtrar por estado, abrir la ficha y mostrar la reserva. Recargar para demostrar persistencia.                                                                                                        |
| 7:15–8:00 | Exportar CSV, explicar privacidad y limitaciones. Reiniciar la demo para volver al estado inicial.                                                                                                                        |

## Datos, métricas y privacidad

- Seis contactos iniciales son ficticios, con direcciones en el dominio reservado `.test`. Las fechas de esos ejemplos se generan relativas al comienzo o reinicio de la demostración y no son actividad histórica real.
- Los datos se guardan en LocalStorage bajo `silva-eudr-demo-v1`. No hay envío de datos, correos, calendarios ni videollamadas reales. No se usan cookies ni analítica.
- **Usar exclusivamente datos ficticios**. El CRM no tiene autenticación y no está preparado para producción.
- Los indicadores cuentan los contactos actuales. **Leads nuevos** cuenta el estado Nuevo; **MQL** y **SQL** cuentan las clasificaciones actuales. Las proporciones del embudo son `(MQL + SQL) / total` y `SQL / total`. No se afirma medir conversiones históricas: no hay historial de eventos ni tasas de campañas inventadas.
- La ficha permite corregir datos y consentimiento o eliminar un contacto. Reiniciar borra los contactos ingresados y sus reservas y restaura los seis ejemplos, sin tocar otras claves del navegador.
- Si LocalStorage está bloqueado se muestra un aviso de que los cambios solo duran en memoria. Si sus datos están dañados, se restaura la muestra con un aviso.
- El aviso de privacidad toma como referencia la Ley argentina 25.326, explica finalidad, almacenamiento y derechos. **No certifica cumplimiento legal**. Un uso real requiere responsable identificable, canales de atención, seguridad, conservación y las demás medidas pertinentes.
- No se adjuntó el informe original ni su Sección 8. No se inventaron resultados, estadísticas, avales empresariales ni requisitos normativos. El contenido comercial es ilustrativo.

## Documento de muestra

`public/reporte-eudr-demostracion.pdf` es un PDF real y local, rotulado como demostración. Su fuente está en `scripts/generate-sample-report.py`; puede regenerarse con Python 3 sin dependencias:

```bash
python3 scripts/generate-sample-report.py
```

Cuando esté disponible el informe autorizado, incorporar el PDF y adaptar los textos y su identificación para que dejen de presentarlo como muestra. Revisar especialmente la Sección 8, páginas 9 y 10, antes de afirmar que este prototipo implementa sus requisitos.

## Arquitectura

React + TypeScript, Vite, Tailwind CSS 4 y Lucide React. El CSS incluye componentes reutilizables, puntos de adaptación a móvil, foco visible, enlace de salto, diálogos nativos con cierre por Escape y respeto a movimiento reducido.

```text
src/
  App.tsx          Navegación, persistencia y estado compartido
  PublicPages.tsx  Landing, captación, confirmación y reserva
  Dashboard.tsx    CRM, métricas, filtros, edición y exportación
  components.tsx   Marca, portada, modal y privacidad
  data.ts          Tipos, ejemplos y recuperación del almacenamiento
  styles.css       Sistema visual responsive + Tailwind
tests/
  flow.spec.ts     Recorrido completo y controles funcionales
```

## Publicación en GitHub y entorno de nube

El usuario autorizó que Codex haga commit y push al completar cambios solicitados. Revisar los archivos y las comprobaciones antes de publicar; no incluir datos privados ni usar force push. La rama local de la nube puede llamarse `work`; el destino acordado es `origin/main` mediante `git push origin HEAD:refs/heads/main`. Si el remoto avanzó o impone protección, conservar el trabajo y resolver el bloqueo sin sobrescribirlo. Guardar un archivo no genera por sí solo un envío a GitHub.

Las instrucciones reutilizables de instalación y arranque del entorno se guardan en su configuración. Los procesos de Vite deben iniciarse nuevamente al abrir otra instancia: no sobreviven a un snapshot.
