import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CircleHelp,
  ContactRound,
  FileText,
  Filter,
  Globe2,
  LayoutDashboard,
  Link2,
  MessageSquare,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { Brand, Modal } from "./components";
import {
  fullName,
  formatDate,
  initials,
  scoreLead,
  sectors,
  stages,
  statuses,
  type Store,
  type Thresholds,
} from "./data";
import Analytics, { metrics } from "./Analytics";
import ContactDetail, { type ChangeLead } from "./ContactDetail";

const fold = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
function exportCSV(data: Store, ids: string[]) {
  const quote = (value: string) =>
    `"${(/^[=+@\-\t\r]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
  const rows = [
    [
      "Nombre",
      "Apellido",
      "Organización",
      "Correo",
      "Sector",
      "Registro",
      "Informe solicitado",
      "Descarga solicitada",
      "Estado operativo",
      "Calificación",
      "Puntuación",
      "Fuente UTM",
      "Medio UTM",
      "Campaña UTM",
    ],
    ...data.leads
      .filter((lead) => ids.includes(lead.id))
      .map((lead) => {
        const rating = scoreLead(lead, data.events, data.thresholds);
        return [
          lead.name,
          lead.surname,
          lead.company,
          lead.email,
          lead.sector,
          lead.createdAt,
          lead.report,
          rating.downloaded ? "Sí" : "No",
          lead.status,
          rating.stage,
          String(rating.score),
          lead.attribution.source,
          lead.attribution.medium,
          lead.attribution.campaign,
        ];
      }),
  ];
  const url = URL.createObjectURL(
    new Blob(
      ["\uFEFF" + rows.map((row) => row.map(quote).join(",")).join("\r\n")],
      { type: "text/csv;charset=utf-8;" },
    ),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "hub-aliados-demostracion.csv";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function Dashboard({
  store,
  update,
  thresholds,
  remove,
}: {
  store: Store;
  update: ChangeLead;
  thresholds: (value: Thresholds) => void;
  remove: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [sector, setSector] = useState("Todos");
  const [stage, setStage] = useState("Todos");
  const [sort, setSort] = useState("desc");
  const [tab, setTab] = useState("overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<"help" | "scoring" | "campaign" | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const stats = metrics(store);
  const lastLead = store.leads.find((lead) => lead.id === store.lastLeadId);
  const selected = store.leads.find((lead) => lead.id === selectedId);
  const filtered = store.leads
    .filter(
      (lead) =>
        fold(`${fullName(lead)} ${lead.company}`).includes(fold(search)) &&
        (status === "Todos" || lead.status === status) &&
        (sector === "Todos" || lead.sector === sector) &&
        (stage === "Todos" ||
          scoreLead(lead, store.events, store.thresholds).stage === stage),
    )
    .sort((a, b) =>
      sort === "desc"
        ? b.createdAt.localeCompare(a.createdAt)
        : a.createdAt.localeCompare(b.createdAt),
    );
  const go = (target: string) => {
    setTab(target);
    document
      .getElementById(target)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const clear = () => {
    setSearch("");
    setStatus("Todos");
    setSector("Todos");
    setStage("Todos");
  };
  return (
    <div className="crm-shell institutional-crm">
      <aside className="crm-sidebar">
        <Brand />
        <div className="workspace-label">
          <span className="workspace-avatar">
            <Users size={18} />
          </span>
          <div>
            Hub de Aliados<small>Comunicación y Programas</small>
          </div>
        </div>
        <span className="sidebar-label">ESPACIO INSTITUCIONAL</span>
        <nav aria-label="Navegación del CRM">
          {[
            { id: "overview", text: "Vista general", icon: LayoutDashboard },
            { id: "contacts", text: "Contactos", icon: ContactRound },
            { id: "pipeline", text: "Embudo y evolución", icon: BarChart3 },
            { id: "attribution", text: "Atribución de tráfico", icon: Globe2 },
          ].map(({ id, text, icon: Icon }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={tab === id ? "selected" : ""}
            >
              <Icon size={18} />
              {text}
              {id === "contacts" && <span>{store.leads.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-sidebar-card">
            <span className="live-dot" />
            <strong>Datos de demostración</strong>
            <p>Un recorrido local de captación, calificación y seguimiento.</p>
            <button onClick={() => setModal("help")}>
              Entender el prototipo <ArrowUpRight size={14} />
            </button>
          </div>
          <a href="#/" className="back-link">
            <ArrowLeft size={16} />
            Volver a la landing
          </a>
          <div className="user-profile">
            <span>CP</span>
            <div>
              Comunicación y Programas
              <small>Sin acceso a sistemas reales</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="crm-body">
        <header className="crm-topbar">
          <div>
            <span>Hub de Aliados</span>
            <span>/</span>
            <strong>Gestión institucional</strong>
          </div>
          <button className="data-badge" onClick={() => setModal("help")}>
            <span className="live-dot" /> Datos locales <CircleHelp size={15} />
          </button>
        </header>
        <main id="main-content" tabIndex={-1} className="crm-main">
          <section id="overview">
            <div className="crm-page-heading">
              <div>
                <div className="eyebrow">DEL CONOCIMIENTO A LA VINCULACIÓN</div>
                <h1 tabIndex={-1}>
                  Cada conexión, una posibilidad<span>.</span>
                </h1>
                <p>
                  Una vista compartida para acompañar oportunidades
                  institucionales.
                </p>
              </div>
              <div className="crm-heading-actions">
                <button
                  className="button secondary"
                  onClick={() => setModal("campaign")}
                >
                  <Link2 size={15} />
                  Simular campaña
                </button>
                <button
                  className="button secondary export-button"
                  onClick={() => {
                    exportCSV(
                      store,
                      filtered.map((lead) => lead.id),
                    );
                    setMessage(
                      `Exportación solicitada: ${filtered.length} contactos visibles.`,
                    );
                  }}
                >
                  <ArrowDownToLine size={16} />
                  Exportar CSV
                </button>
              </div>
            </div>
            <div className="crm-simulation">
              <ShieldCheck size={16} />
              <span>
                Prototipo académico — datos de demostración. No es una
                herramienta oficial de Solidaridad LATAM.
              </span>
            </div>
            <div className="stat-grid institutional-stats">
              {[
                {
                  label: "Visitas a la landing",
                  value: stats.visits,
                  note: "Una por sesión local",
                  icon: Globe2,
                },
                {
                  label: "Formularios completados",
                  value: stats.forms,
                  note: "Envíos únicos registrados",
                  icon: FileText,
                },
                {
                  label: "Solicitudes de descarga",
                  value: stats.downloads,
                  note: "Clics en el PDF de muestra",
                  icon: ArrowDownToLine,
                },
                {
                  label: "Leads captados",
                  value: stats.leads,
                  note: "Contactos en el CRM",
                  icon: Users,
                },
                {
                  label: "Contactos MQL",
                  value: stats.mql,
                  note: "Calificados por Comunicación",
                  icon: Filter,
                },
                {
                  label: "Contactos SQL",
                  value: stats.sql,
                  note: "Aceptados por Programas",
                  icon: Check,
                },
                {
                  label: "Reuniones solicitadas",
                  value: stats.meetings,
                  note: "Solicitudes, no reuniones reales",
                  icon: MessageSquare,
                },
                {
                  label: "Conversión de landing",
                  value: `${stats.conversion.toLocaleString("es-AR")}%`,
                  note: "Sesiones con formulario / landing",
                  icon: ArrowUpRight,
                },
              ].map(({ label, value, note, icon: Icon }, i) => (
                <article
                  className={`stat-card stat-${i}`}
                  key={label}
                  aria-label={label}
                >
                  <div>
                    <span>{label}</span>
                    <span className="stat-icon">
                      <Icon size={17} />
                    </span>
                  </div>
                  <strong data-metric={label}>{value}</strong>
                  <p>{note}</p>
                </article>
              ))}
            </div>
          </section>
          <Analytics data={store} />
          <section id="contacts" className="panel contacts-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  Red de contactos{" "}
                  <span className="count-badge">{store.leads.length}</span>
                </h2>
                <p>Información, contexto y próximos pasos en un solo lugar.</p>
              </div>
              <div className="contact-heading-actions">
                <button
                  className="text-link"
                  onClick={() => setModal("scoring")}
                >
                  <Settings2 size={16} />
                  Criterios de calificación
                </button>
                <a href="#/registro" className="text-link">
                  Nuevo contacto <ArrowRight size={16} />
                </a>
              </div>
            </div>
            {lastLead && (
              <div className="new-lead-banner">
                <span className="new-lead-icon">
                  <Check size={18} />
                </span>
                <p>
                  <strong>Último registro: {fullName(lastLead)}</strong>
                  <span>
                    {lastLead.company} · Desde formulario · Listo para el
                    seguimiento
                  </span>
                </p>
                <button
                  onClick={() => {
                    clear();
                    setSearch(fullName(lastLead));
                  }}
                >
                  Encontrar contacto <ArrowRight size={15} />
                </button>
              </div>
            )}
            <div className="table-toolbar">
              <div className="search-field">
                <Search size={17} />
                <input
                  aria-label="Buscar por nombre o empresa"
                  placeholder="Buscar por nombre o empresa…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button
                    className="icon-button"
                    onClick={() => setSearch("")}
                    aria-label="Limpiar búsqueda"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <label className="sort-field">
                <span>Registro</span>
                <select
                  value={sort}
                  aria-label="Ordenar por fecha"
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="desc">Más recientes</option>
                  <option value="asc">Más antiguos</option>
                </select>
              </label>
            </div>
            <div className="crm-filter-row">
              <SlidersHorizontal size={16} />
              {[
                {
                  label: "Filtrar por sector",
                  value: sector,
                  set: setSector,
                  values: sectors,
                  all: "Todos los sectores",
                },
                {
                  label: "Filtrar por estado",
                  value: status,
                  set: setStatus,
                  values: statuses,
                  all: "Todos los estados",
                },
                {
                  label: "Filtrar por calificación",
                  value: stage,
                  set: setStage,
                  values: stages,
                  all: "Todas las calificaciones",
                },
              ].map((filter) => (
                <label key={filter.label}>
                  <span className="sr-only">{filter.label}</span>
                  <select
                    aria-label={filter.label}
                    value={filter.value}
                    onChange={(event) => filter.set(event.target.value)}
                  >
                    <option value="Todos">{filter.all}</option>
                    {filter.values.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
              ))}
              {(search ||
                status !== "Todos" ||
                sector !== "Todos" ||
                stage !== "Todos") && (
                <button className="text-link" onClick={clear}>
                  Limpiar filtros <X size={13} />
                </button>
              )}
            </div>
            <div
              className="table-scroll"
              role="region"
              aria-label="Tabla de contactos desplazable"
              tabIndex={0}
            >
              <table>
                <thead>
                  <tr>
                    <th>NOMBRE Y APELLIDO</th>
                    <th>ORGANIZACIÓN / CORREO</th>
                    <th>SECTOR</th>
                    <th>REGISTRO</th>
                    <th>INFORME</th>
                    <th>ESTADO OPERATIVO</th>
                    <th>CALIFICACIÓN</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => {
                    const rating = scoreLead(
                      lead,
                      store.events,
                      store.thresholds,
                    );
                    return (
                      <tr
                        key={lead.id}
                        className={
                          lead.id === store.lastLeadId ? "highlight-row" : ""
                        }
                      >
                        <td>
                          <div className="contact-cell">
                            <span className={`contact-avatar avatar-${i % 4}`}>
                              {initials(fullName(lead))}
                            </span>
                            <div>
                              <button
                                className="contact-name"
                                onClick={() => setSelectedId(lead.id)}
                              >
                                {fullName(lead)}
                              </button>
                              <small>
                                {lead.source === "Formulario" ? (
                                  <>
                                    <span className="source-dot" />
                                    Desde formulario
                                  </>
                                ) : (
                                  "Ejemplo precargado"
                                )}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="company-cell">
                            <strong>{lead.company}</strong>
                            <small>{lead.email}</small>
                          </div>
                        </td>
                        <td className="sector-cell">{lead.sector}</td>
                        <td className="date-cell">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td className="report-cell">
                          <span>EUDR · Muestra</span>
                          <small>
                            {rating.downloaded
                              ? "Descarga solicitada"
                              : "Pendiente de descarga"}
                          </small>
                        </td>
                        <td>
                          <select
                            className="status-control"
                            aria-label={`Estado de ${fullName(lead)}`}
                            value={lead.status}
                            onChange={(event) =>
                              update(
                                lead.id,
                                {
                                  status: event.target
                                    .value as typeof lead.status,
                                },
                                event.target.value === "Derivado a Programas"
                                  ? "referral"
                                  : "status",
                                `Estado: ${lead.status} → ${event.target.value}`,
                              )
                            }
                          >
                            {statuses.map((value) => (
                              <option key={value}>{value}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <span
                            className={`pill stage-${rating.stage.toLowerCase()}`}
                          >
                            {rating.stage}
                          </span>
                          <small className="table-score">
                            {rating.score} / 100 puntos
                          </small>
                        </td>
                        <td>
                          <button
                            className="detail-button"
                            aria-label={`Ver ficha de ${fullName(lead)}`}
                            onClick={() => setSelectedId(lead.id)}
                          >
                            <ArrowUpRight size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!filtered.length && (
                <div className="empty-state">
                  <Search size={28} />
                  <h3>No encontramos contactos</h3>
                  <p>Probá otro nombre, empresa o combinación de filtros.</p>
                  <button className="button secondary" onClick={clear}>
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
            <div className="table-footer">
              <span>
                Mostrando {filtered.length} de {store.leads.length} contactos
              </span>
              <span>
                <span className="live-dot" />
                Persistencia local
              </span>
            </div>
            <p className="table-explainer">
              Estado operativo y calificación son independientes. Elegir el hito
              “MQL” o “SQL” no cambia la puntuación: consultá las reglas y la
              ficha.
            </p>
          </section>
          <div className="crm-bottom">
            <span>Hub de Aliados Estratégicos · Comunicación y Programas</span>
            <span>ITBA · Prototipo académico</span>
          </div>
          <p role="status" className="crm-update-message">
            {message ||
              "Las acciones se guardan de inmediato en este navegador."}
          </p>
        </main>
      </div>
      {selected && (
        <ContactDetail
          lead={selected}
          data={store}
          close={() => setSelectedId(null)}
          update={update}
          remove={() => {
            remove(selected.id);
            setSelectedId(null);
          }}
        />
      )}
      {modal === "scoring" && (
        <ScoringSettings
          value={store.thresholds}
          close={() => setModal(null)}
          save={(value) => {
            thresholds(value);
            setModal(null);
          }}
        />
      )}
      {modal === "campaign" && <CampaignModal close={() => setModal(null)} />}
      {modal === "help" && (
        <Modal
          title="Un circuito institucional, de principio a fin"
          close={() => setModal(null)}
        >
          <div className="prose">
            <p>
              Este es el espacio interno simulado de Comunicación y Programas.
              El formulario crea el contacto; las descargas, solicitudes de
              reunión, notas y cambios de estado generan actividad trazable.
            </p>
            <p>
              Los 18 contactos precargados y sus eventos son ficticios. Los
              registros del formulario se distinguen como “Desde formulario”.
              Los indicadores se calculan con esta información local, sin
              estadísticas atribuidas a Solidaridad.
            </p>
            <p>
              MQL representa un contacto calificado para seguimiento por
              Comunicación. SQL representa una oportunidad calificada para
              Programas: exige aceptación técnica manual simulada. Ningún cargo
              ni poder de decisión se presume verificado.
            </p>
            <p>
              La conversión usa sesiones con visita a landing y formulario sobre
              sesiones con visita. La atribución conserva el primer conjunto UTM
              de cada sesión local; no es un modelo algorítmico ni una
              integración con GA4, GTM o Looker Studio.
            </p>
            <p>
              No hay login, backend, cifrado de base de datos ni notificaciones.
              Usá datos ficticios. Reiniciar restaura los ejemplos. Exportar
              descarga los contactos visibles en CSV.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ScoringSettings({
  value,
  close,
  save,
}: {
  value: Thresholds;
  close: () => void;
  save: (value: Thresholds) => void;
}) {
  const [mql, setMql] = useState(String(value.mql));
  const [sql, setSql] = useState(String(value.sql));
  const [error, setError] = useState("");
  return (
    <Modal title="Criterios transparentes, ajustables" close={close}>
      <div className="prose">
        <p>
          Reglas exclusivamente demostrativas, sujetas a validación por
          Solidaridad. No hay evidencia en el informe para fijar umbrales
          institucionales reales.
        </p>
        <p>
          Organización declarada: 10 puntos. Sector prioritario: 25. Formulario:
          5. Descarga: 20. Solicitud de reunión: 30. Aceptación de Programas:
          10. Máximo: 100. Las repeticiones no acumulan puntos.
        </p>
        <p>
          En esta muestra se priorizan todos los sectores listados salvo “Otro”.
          MQL requiere sector prioritario y descarga además del umbral. SQL
          requiere las condiciones MQL, solicitud de reunión y aceptación manual
          de Programas.
        </p>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const next = { mql: Number(mql), sql: Number(sql) };
          if (
            !mql ||
            !sql ||
            !Number.isInteger(next.mql) ||
            !Number.isInteger(next.sql) ||
            next.mql < 1 ||
            next.sql <= next.mql ||
            next.sql > 100
          ) {
            setError("Usá números enteros: 1 ≤ MQL < SQL ≤ 100.");
            return;
          }
          save(next);
        }}
        noValidate
      >
        <div className="detail-fields">
          <div className="field">
            <label htmlFor="mql-threshold">Umbral MQL</label>
            <input
              id="mql-threshold"
              type="number"
              min="1"
              max="99"
              step="1"
              required
              value={mql}
              onChange={(event) => setMql(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="sql-threshold">Umbral SQL</label>
            <input
              id="sql-threshold"
              type="number"
              min="2"
              max="100"
              step="1"
              required
              value={sql}
              onChange={(event) => setSql(event.target.value)}
            />
          </div>
        </div>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button className="button secondary" type="button" onClick={close}>
            Cancelar
          </button>
          <button className="button" type="submit">
            Aplicar criterios <Check size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
function CampaignModal({ close }: { close: () => void }) {
  const [source, setSource] = useState("linkedin");
  const [medium, setMedium] = useState("social");
  const [campaign, setCampaign] = useState("piloto-eudr");
  const url = new URL("/", location.href);
  url.search = new URLSearchParams({
    utm_source: source.trim(),
    utm_medium: medium.trim(),
    utm_campaign: campaign.trim(),
  }).toString();
  url.hash = "/";
  return (
    <Modal title="Simular un enlace de campaña" close={close}>
      <p className="muted">
        Abrí la landing con parámetros UTM y completá el recorrido. El contacto
        conservará este origen y el dashboard reflejará su conversión local.
      </p>
      <div className="campaign-fields">
        {[
          {
            id: "source",
            label: "Fuente · utm_source",
            value: source,
            set: setSource,
          },
          {
            id: "medium",
            label: "Medio · utm_medium",
            value: medium,
            set: setMedium,
          },
          {
            id: "campaign",
            label: "Campaña · utm_campaign",
            value: campaign,
            set: setCampaign,
          },
        ].map((field) => (
          <div className="field" key={field.id}>
            <label htmlFor={`utm-${field.id}`}>{field.label}</label>
            <input
              id={`utm-${field.id}`}
              value={field.value}
              maxLength={120}
              onChange={(event) => field.set(event.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="inline-note">
        <Link2 size={16} />
        <span>
          Simulación local. No publica una campaña ni envía datos a plataformas
          de analítica.
        </span>
      </div>
      <label className="field">
        <span className="link-label">Enlace de demostración</span>
        <textarea
          readOnly
          rows={3}
          aria-label="Enlace de campaña"
          value={url.toString()}
          onFocus={(event) => event.target.select()}
        />
      </label>
      <a href={url.toString()} className="button full-width campaign-launch">
        Probar el recorrido con UTM <ArrowRight size={17} />
      </a>
    </Modal>
  );
}
