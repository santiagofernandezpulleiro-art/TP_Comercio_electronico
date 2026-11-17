import { ArrowUpRight } from "lucide-react";
import { dayKey, scoreLead, sectors, statuses, type Store } from "./data";

export function metrics(data: Store) {
  const count = (type: string) =>
    data.events.filter((event) => event.type === type).length;
  const visits = data.events.filter((event) => event.type === "visit");
  const landingSessions = new Set(visits.map((event) => event.sessionId));
  const convertedSessions = new Set(
    data.events
      .filter(
        (event) =>
          event.type === "submit" && landingSessions.has(event.sessionId),
      )
      .map((event) => event.sessionId),
  );
  const rates = data.leads.map((lead) =>
    scoreLead(lead, data.events, data.thresholds),
  );
  return {
    visits: count("visit"),
    starts: count("start"),
    forms: count("submit"),
    downloads: count("download"),
    leads: data.leads.length,
    mql: rates.filter((rate) => rate.stage === "MQL").length,
    sql: rates.filter((rate) => rate.stage === "SQL").length,
    meetings: count("meeting"),
    conversion: landingSessions.size
      ? Math.round((convertedSessions.size / landingSessions.size) * 1000) / 10
      : 0,
  };
}
function Distribution({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: { label: string; value: number }[];
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <article className="panel distribution-panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="distribution-bars">
        {rows.map((row) => (
          <div className="distribution-row" key={row.label}>
            <span title={row.label}>{row.label}</span>
            <div>
              <i style={{ width: `${(row.value / max) * 100}%` }} />
            </div>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}
export default function Analytics({ data }: { data: Store }) {
  const stats = metrics(data);
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(Date.now() - (13 - i) * 86400000);
    const key = dayKey(date.toISOString());
    return {
      key,
      count: data.leads.filter((lead) => dayKey(lead.createdAt) === key).length,
    };
  });
  const max = Math.max(...days.map((day) => day.count), 2);
  const points = days
    .map((day, i) => `${24 + (i * 432) / 13},${110 - (day.count / max) * 80}`)
    .join(" ");
  const funnel = [
    { label: "Visitas a landing", value: stats.visits },
    { label: "Inicio de formulario", value: stats.starts },
    { label: "Formularios enviados", value: stats.forms },
    {
      label: "Contactos con descarga",
      value: data.leads.filter(
        (lead) => scoreLead(lead, data.events, data.thresholds).downloaded,
      ).length,
    },
    { label: "Reuniones solicitadas", value: stats.meetings },
  ];
  const sources = [
    ...new Set(
      data.events
        .filter((event) => event.type === "visit")
        .map((event) => event.attribution.source),
    ),
  ];
  return (
    <>
      <section id="pipeline" className="analytics-grid institutional-analytics">
        <article className="panel evolution-panel">
          <div className="panel-heading">
            <div>
              <h2>Evolución de contactos</h2>
              <p>Altas diarias · Últimos 14 días · Datos de demostración</p>
            </div>
            <span className="pill neutral">{data.leads.length} CONTACTOS</span>
          </div>
          <div className="line-chart">
            <svg
              viewBox="0 0 480 145"
              role="img"
              aria-label={`Altas de contactos en los últimos 14 días: ${days.map((day) => `${day.key}: ${day.count}`).join("; ")}`}
            >
              <defs>
                <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#95ad7a" stopOpacity=".35" />
                  <stop offset="100%" stopColor="#95ad7a" stopOpacity=".02" />
                </linearGradient>
              </defs>
              {[30, 70, 110].map((y) => (
                <g key={y}>
                  <line
                    x1="24"
                    x2="456"
                    y1={y}
                    y2={y}
                    stroke="#edf0e8"
                    strokeDasharray="4 5"
                  />
                  <text x="5" y={y + 3} fontSize="8" fill="#7b8b70">
                    {Math.round(((110 - y) / 80) * max)}
                  </text>
                </g>
              ))}
              <polygon
                points={`24,110 ${points} 456,110`}
                fill="url(#chart-fill)"
              />
              <polyline
                points={points}
                stroke="#547842"
                strokeWidth="2.4"
                fill="none"
                strokeLinejoin="round"
              />
              {days.map((day, i) => (
                <circle
                  key={day.key}
                  cx={24 + (i * 432) / 13}
                  cy={110 - (day.count / max) * 80}
                  r="3"
                  fill="#547842"
                >
                  <title>
                    {day.key}: {day.count} contactos
                  </title>
                </circle>
              ))}
              {[0, 6, 13].map((index) => (
                <text
                  key={index}
                  x={24 + (index * 432) / 13}
                  y="138"
                  textAnchor={
                    index === 0 ? "start" : index === 13 ? "end" : "middle"
                  }
                  fontSize="9"
                  fill="#7b8b70"
                >
                  {days[index].key.slice(5).split("-").reverse().join("/")}
                </text>
              ))}
            </svg>
          </div>
        </article>
        <article className="panel funnel-panel">
          <div className="panel-heading">
            <div>
              <h2>Del interés a la vinculación</h2>
              <p>Eventos locales · El material se entrega en autoservicio</p>
            </div>
            <ArrowUpRight size={19} />
          </div>
          <div className="event-funnel">
            {funnel.map((step, i) => (
              <div key={step.label}>
                <span>{step.label}</span>
                <div>
                  <i
                    style={{
                      width: `${(step.value / Math.max(stats.visits, ...funnel.map((item) => item.value), 1)) * 100}%`,
                      opacity: 1 - i * 0.1,
                    }}
                  />
                </div>
                <strong>{step.value}</strong>
              </div>
            ))}
          </div>
          <p className="chart-note">
            Solicitudes de descarga y reunión; no acreditan guardado de archivos
            ni reuniones realizadas.
          </p>
        </article>
      </section>
      <section id="distributions" className="distribution-grid">
        <Distribution
          title="Cadenas que nos conectan"
          subtitle="Contactos por sector declarado"
          rows={sectors.map((sector) => ({
            label: sector,
            value: data.leads.filter((lead) => lead.sector === sector).length,
          }))}
        />
        <Distribution
          title="Seguimiento institucional"
          subtitle="Estado operativo actual · Independiente de la calificación"
          rows={statuses.map((status) => ({
            label: status,
            value: data.leads.filter((lead) => lead.status === status).length,
          }))}
        />
      </section>
      <section id="attribution" className="panel attribution-panel">
        <div className="panel-heading">
          <div>
            <h2>¿Desde dónde empieza la conversación?</h2>
            <p>
              Atribución local de primer contacto por sesión · Sin conexión a
              GA4, GTM o Looker Studio
            </p>
          </div>
          <span className="pill neutral">UTM</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>PROCEDENCIA</th>
                <th>VISITAS</th>
                <th>SESIONES CON FORMULARIO</th>
                <th>CONVERSIÓN</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => {
                const visits = data.events.filter(
                  (event) =>
                    event.type === "visit" &&
                    event.attribution.source === source,
                );
                const sessions = new Set(
                  visits.map((event) => event.sessionId),
                );
                const conversions = new Set(
                  data.events
                    .filter(
                      (event) =>
                        event.type === "submit" &&
                        sessions.has(event.sessionId),
                    )
                    .map((event) => event.sessionId),
                ).size;
                return (
                  <tr key={source}>
                    <td>
                      <span className="source-label">
                        <span className="source-dot" />
                        {source}
                      </span>
                    </td>
                    <td>{visits.length}</td>
                    <td>{conversions}</td>
                    <td>
                      {sessions.size
                        ? Math.round((conversions / sessions.size) * 1000) / 10
                        : 0}
                      %
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sources.length === 0 && (
            <p className="chart-note">
              Sin visitas registradas. Abrí la landing para iniciar el
              recorrido.
            </p>
          )}
        </div>
        <p className="chart-note">
          Conversión = sesiones con visita y formulario ÷ sesiones con visita.
          Las entradas sin parámetros se muestran como “Sin atribución”, no como
          tráfico verificado.
        </p>
      </section>
    </>
  );
}
