import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleHelp,
  ContactRound,
  Filter,
  LayoutDashboard,
  Leaf,
  Mail,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Brand, Modal } from "./components";
import { formatDate, initials, stages, statuses, type Lead } from "./data";

type Props = {
  leads: Lead[];
  lastLeadId: string | null;
  update: (id: string, changes: Partial<Lead>) => void;
  remove: (id: string) => void;
};
const fold = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function exportCSV(leads: Lead[]) {
  const safe = (value: string) =>
    `"${(/^[=+@\-\t\r]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
  const rows = [
    [
      "Nombre",
      "Empresa",
      "Email",
      "Cargo",
      "Fecha de registro",
      "Estado",
      "Clasificación",
      "Origen",
      "Consentimiento comercial",
    ],
    ...leads.map((lead) => [
      lead.name,
      lead.company,
      lead.email,
      lead.role,
      lead.createdAt,
      lead.status,
      lead.stage,
      lead.source,
      lead.marketing ? "Sí (simulado)" : "No",
    ]),
  ];
  const blob = new Blob(
    ["\uFEFF" + rows.map((row) => row.map(safe).join(",")).join("\r\n")],
    { type: "text/csv;charset=utf-8;" },
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "silva-contactos-demostracion.csv";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Dashboard({
  leads,
  lastLeadId,
  update,
  remove,
}: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [stage, setStage] = useState("Todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [help, setHelp] = useState(false);
  const [tab, setTab] = useState("overview");
  const [message, setMessage] = useState("");
  const count = (kind: string) =>
    leads.filter((lead) => lead.stage === kind).length;
  const counts = stages.map(count);
  const percent = (amount: number) =>
    leads.length ? Math.round((amount / leads.length) * 100) : 0;
  const mqlPercent = percent(counts[1] + counts[2]);
  const sqlPercent = percent(counts[2]);
  const filtered = leads.filter(
    (lead) =>
      fold(`${lead.name} ${lead.company}`).includes(fold(search)) &&
      (status === "Todos" || lead.status === status) &&
      (stage === "Todos" || lead.stage === stage),
  );
  const selected = leads.find((lead) => lead.id === selectedId);
  const lastLead = leads.find((lead) => lead.id === lastLeadId);
  const go = (target: string) => {
    setTab(target);
    document
      .getElementById(target)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const updateStage = (lead: Lead, value: Lead["stage"]) => {
    update(lead.id, { stage: value });
    setMessage(`${lead.name}: clasificación actualizada a ${value}.`);
  };
  return (
    <div className="crm-shell">
      <aside className="crm-sidebar">
        <Brand />
        <div className="workspace-label">
          <span className="workspace-avatar">
            <Leaf size={18} />
          </span>
          <div>
            Espacio comercial<small>Silva · Demostración</small>
          </div>
          <ChevronDown size={14} />
        </div>
        <span className="sidebar-label">WORKSPACE</span>
        <nav aria-label="Navegación del CRM">
          {[
            { id: "overview", text: "Vista general", icon: LayoutDashboard },
            { id: "contacts", text: "Contactos", icon: ContactRound },
            { id: "pipeline", text: "Embudo comercial", icon: BarChart3 },
          ].map(({ id, text, icon: Icon }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={tab === id ? "selected" : ""}
            >
              <Icon size={18} />
              {text}
              {id === "contacts" && <span>{leads.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-sidebar-card">
            <span className="live-dot" />
            <strong>Tu espacio de prueba</strong>
            <p>Datos ficticios. Todo se guarda en este navegador.</p>
            <button onClick={() => setHelp(true)}>
              Cómo funciona <ArrowUpRight size={14} />
            </button>
          </div>
          <a href="#/" className="back-link">
            <ArrowLeft size={16} /> Volver a la experiencia
          </a>
          <div className="user-profile">
            <span>SC</span>
            <div>
              Equipo comercial<small>Acceso de demostración</small>
            </div>
            <ShieldCheck size={16} />
          </div>
        </div>
      </aside>
      <div className="crm-body">
        <header className="crm-topbar">
          <div>
            <span>Workspace</span>
            <span>/</span>
            <strong>Vista general</strong>
          </div>
          <button className="data-badge" onClick={() => setHelp(true)}>
            <span className="live-dot" /> Datos locales <CircleHelp size={14} />
          </button>
        </header>
        <main id="main-content" tabIndex={-1} className="crm-main">
          <section id="overview">
            <div className="crm-page-heading">
              <div>
                <div className="eyebrow">CADA CONTACTO, UNA OPORTUNIDAD</div>
                <h1 tabIndex={-1}>
                  Una mirada a tus oportunidades<span>.</span>
                </h1>
                <p>Del primer interés a una conversación con propósito.</p>
              </div>
              <button
                className="button secondary export-button"
                onClick={() => {
                  exportCSV(filtered);
                  setMessage(
                    `Exportación solicitada: ${filtered.length} contactos visibles.`,
                  );
                }}
              >
                <ArrowDownToLine size={16} /> Exportar CSV
              </button>
            </div>
            <div className="crm-simulation">
              <ShieldCheck size={15} />
              <span>
                CRM interno de demostración · Todos los contactos son ficticios
                o ingresados para la prueba.
              </span>
            </div>
            <div className="stat-grid">
              {[
                {
                  label: "Leads registrados",
                  value: leads.length,
                  icon: Users,
                  note: "Total de contactos en el CRM",
                  className: "",
                },
                {
                  label: "Leads nuevos",
                  value: leads.filter((lead) => lead.status === "Nuevo").length,
                  icon: ContactRound,
                  note: "Estado: Nuevo",
                  className: "stat-new",
                },
                {
                  label: "Leads MQL",
                  value: counts[1],
                  icon: Filter,
                  note: "Calificados por marketing",
                  className: "stat-mql",
                },
                {
                  label: "Leads SQL",
                  value: counts[2],
                  icon: Check,
                  note: "Calificados para ventas",
                  className: "stat-sql",
                },
              ].map(({ label, value, icon: Icon, note, className }) => (
                <article key={label} className={`stat-card ${className}`}>
                  <div>
                    <span>{label}</span>
                    <span className="stat-icon">
                      <Icon size={17} />
                    </span>
                  </div>
                  <strong>{value}</strong>
                  <p>{note}</p>
                </article>
              ))}
            </div>
          </section>
          <section id="pipeline" className="analytics-grid">
            <article className="panel funnel-panel">
              <div className="panel-heading">
                <div>
                  <h2>De interés a oportunidad</h2>
                  <p>Distribución actual por clasificación</p>
                </div>
                <span className="pill neutral">EN TIEMPO REAL</span>
              </div>
              <div className="funnel-bars">
                {stages.map((kind, i) => (
                  <div
                    className={`funnel-row funnel-${kind.toLowerCase()}`}
                    key={kind}
                  >
                    <div className="funnel-label">
                      <span className="stage-dot" />
                      <strong>{kind}</strong>
                      <span>
                        {i === 0
                          ? "Contacto registrado"
                          : i === 1
                            ? "Interés calificado"
                            : "Oportunidad comercial"}
                      </span>
                    </div>
                    <div className="bar-track">
                      <div style={{ width: `${percent(counts[i])}%` }} />
                    </div>
                    <strong>{counts[i]}</strong>
                    <span>{percent(counts[i])}%</span>
                  </div>
                ))}
              </div>
              <div className="funnel-foot">
                <span>
                  <span className="live-dot" /> Los indicadores se actualizan al
                  editar contactos
                </span>
                <span>{leads.length} contactos</span>
              </div>
            </article>
            <article className="panel conversion-panel">
              <div className="panel-heading">
                <div>
                  <h2>Avance del embudo</h2>
                  <p>Contactos en etapas calificadas</p>
                </div>
                <ArrowUpRight size={19} />
              </div>
              <div className="conversion-content">
                <div
                  className="donut"
                  role="img"
                  aria-label={`${mqlPercent}% de contactos en MQL o SQL`}
                  style={{
                    background: `conic-gradient(var(--green) 0% ${sqlPercent}%, #9bbb8e ${sqlPercent}% ${mqlPercent}%, #eef1eb ${mqlPercent}% 100%)`,
                  }}
                >
                  <div>
                    <strong>{mqlPercent}%</strong>
                    <span>MQL + SQL</span>
                  </div>
                </div>
                <div className="conversion-legend">
                  <p>
                    <span className="legend-dot green" /> Lead → MQL o SQL
                    <strong>{mqlPercent}%</strong>
                  </p>
                  <p>
                    <span className="legend-dot sage" /> Lead → SQL
                    <strong>{sqlPercent}%</strong>
                  </p>
                  <small>
                    Proporciones sobre el total actual. No representan un
                    historial de conversiones.
                  </small>
                </div>
              </div>
            </article>
          </section>
          <section id="contacts" className="panel contacts-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  Contactos <span className="count-badge">{leads.length}</span>
                </h2>
                <p>Conocé a las personas detrás de cada oportunidad.</p>
              </div>
              <a href="#/registro" className="text-link">
                Nuevo contacto <ArrowRight size={16} />
              </a>
            </div>
            {lastLead && (
              <div className="new-lead-banner">
                <span className="new-lead-icon">
                  <Check size={18} />
                </span>
                <p>
                  <strong>Tu último contacto: {lastLead.name}</strong>
                  <span>Ingresó desde el formulario · {lastLead.company}</span>
                </p>
                <button
                  onClick={() => {
                    setSearch(lastLead.name);
                    setStatus("Todos");
                    setStage("Todos");
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
                  aria-label="Buscar leads por nombre o empresa"
                  placeholder="Buscar por nombre o empresa..."
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
              <div className="filter-fields">
                <label>
                  <SlidersHorizontal size={15} />
                  <span className="sr-only">Filtrar por estado</span>
                  <select
                    aria-label="Filtrar por estado"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="Todos">Todos los estados</option>
                    {statuses.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="sr-only">Filtrar por clasificación</span>
                  <select
                    aria-label="Filtrar por clasificación"
                    value={stage}
                    onChange={(event) => setStage(event.target.value)}
                  >
                    <option value="Todos">Todas las etapas</option>
                    {stages.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Tabla de contactos, desplazable horizontalmente"
            >
              <table>
                <thead>
                  <tr>
                    <th>CONTACTO</th>
                    <th>EMPRESA / CARGO</th>
                    <th>EMAIL</th>
                    <th>REGISTRO</th>
                    <th>ESTADO</th>
                    <th>CLASIFICACIÓN</th>
                    <th>
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, index) => (
                    <tr
                      key={lead.id}
                      className={lead.id === lastLeadId ? "highlight-row" : ""}
                    >
                      <td>
                        <div className="contact-cell">
                          <span
                            className={`contact-avatar avatar-${index % 4}`}
                          >
                            {initials(lead.name)}
                          </span>
                          <div>
                            <strong>{lead.name}</strong>
                            <small>
                              {lead.source === "Formulario" ? (
                                <>
                                  <span className="source-dot" /> Desde
                                  formulario
                                </>
                              ) : (
                                "Contacto de ejemplo"
                              )}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="company-cell">
                          <strong>{lead.company}</strong>
                          <small title={lead.role}>{lead.role}</small>
                        </div>
                      </td>
                      <td className="email-cell">{lead.email}</td>
                      <td className="date-cell">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td>
                        <span
                          className={`status-pill status-${statuses.indexOf(lead.status)}`}
                        >
                          <span />
                          {lead.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className={`stage-select stage-${lead.stage.toLowerCase()}`}
                          aria-label={`Clasificación de ${lead.name}`}
                          value={lead.stage}
                          onChange={(event) =>
                            updateStage(
                              lead,
                              event.target.value as Lead["stage"],
                            )
                          }
                        >
                          {stages.map((kind) => (
                            <option key={kind}>{kind}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          className="detail-button"
                          onClick={() => setSelectedId(lead.id)}
                          aria-label={`Ver ficha de ${lead.name}`}
                        >
                          <ArrowUpRight size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filtered.length && (
                <div className="empty-state">
                  <Search size={27} />
                  <h3>No encontramos contactos</h3>
                  <p>Probá otro nombre o ajustá los filtros.</p>
                  <button
                    className="button secondary"
                    onClick={() => {
                      setSearch("");
                      setStatus("Todos");
                      setStage("Todos");
                    }}
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
            <div className="table-footer">
              <span>
                Mostrando {filtered.length} de {leads.length} contactos
              </span>
              <span>
                <span className="live-dot" /> Guardado en este navegador
              </span>
            </div>
          </section>
          <div className="crm-bottom">
            <span>
              <Leaf size={14} /> Mejores conversaciones comienzan con mejores
              conexiones.
            </span>
            <span>Silva CRM · Prototipo académico</span>
          </div>
          <p role="status" className="crm-update-message">
            {message ||
              "Los cambios de clasificación se guardan automáticamente."}
          </p>
        </main>
      </div>
      {selected && (
        <ContactModal
          key={selected.id}
          lead={selected}
          close={() => setSelectedId(null)}
          save={(changes) => {
            update(selected.id, changes);
            setMessage(
              `Ficha de ${changes.name || selected.name} actualizada.`,
            );
            setSelectedId(null);
          }}
          remove={() => {
            remove(selected.id);
            setSelectedId(null);
          }}
        />
      )}
      {help && (
        <Modal title="Un CRM para explorar" close={() => setHelp(false)}>
          <div className="prose">
            <p>
              Esta interfaz representa el espacio interno del equipo comercial.
              No tiene autenticación y no debe usarse con información real.
            </p>
            <p>
              <strong>Lead:</strong> contacto registrado. <strong>MQL:</strong>{" "}
              contacto calificado por marketing. <strong>SQL:</strong> contacto
              calificado para ventas. La clasificación se cambia manualmente; no
              implica una evaluación automática.
            </p>
            <p>
              “Nuevo” es un estado de seguimiento independiente de la
              clasificación. Los porcentajes se calculan a partir de las etapas
              actuales, sin inventar conversiones históricas.
            </p>
            <p>
              Los contactos de ejemplo y los ingresados desde el formulario se
              distinguen en la tabla. Todos los cambios y reservas permanecen en
              este navegador. Podés borrar un contacto desde su ficha o
              restaurar los ejemplos con “Reiniciar demo”.
            </p>
            <p>
              Exportar CSV descarga únicamente los contactos que coinciden con
              la búsqueda y los filtros actuales.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ContactModal({
  lead,
  close,
  save,
  remove,
}: {
  lead: Lead;
  close: () => void;
  save: (changes: Partial<Lead>) => void;
  remove: () => void;
}) {
  const [draft, setDraft] = useState(lead);
  const [deleting, setDeleting] = useState(false);
  return (
    <Modal title="Ficha del contacto" close={close}>
      <div className="contact-detail-heading">
        <span className="contact-avatar">{initials(lead.name)}</span>
        <div>
          <h3>{lead.name}</h3>
          <p>
            {lead.company} ·{" "}
            {lead.source === "Formulario"
              ? "Desde formulario"
              : "Ejemplo ficticio"}
          </p>
        </div>
        <span className={`pill stage-${lead.stage.toLowerCase()}`}>
          {lead.stage}
        </span>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save({
            name: draft.name.trim(),
            company: draft.company.trim(),
            email: draft.email.trim(),
            role: draft.role.trim(),
            stage: draft.stage,
            status: draft.status,
            marketing: draft.marketing,
          });
        }}
      >
        <div className="detail-fields">
          {(
            [
              ["name", "Nombre y apellido"],
              ["company", "Empresa"],
              ["email", "Correo electrónico"],
              ["role", "Cargo"],
            ] as const
          ).map(([key, label]) => (
            <div className="field" key={key}>
              <label htmlFor={`edit-${key}`}>{label}</label>
              <input
                id={`edit-${key}`}
                value={draft[key]}
                required
                pattern={
                  key === "email" ? "[^\\s@]+@[^\\s@]+\\.[^\\s@]+" : ".*\\S.*"
                }
                type={key === "email" ? "email" : "text"}
                maxLength={key === "email" ? 254 : 120}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    [key]: event.target.value,
                  }))
                }
              />
            </div>
          ))}
          <div className="field">
            <label htmlFor="edit-status">Estado</label>
            <select
              id="edit-status"
              value={draft.status}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  status: event.target.value as Lead["status"],
                }))
              }
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="edit-stage">Clasificación</label>
            <select
              id="edit-stage"
              value={draft.stage}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  stage: event.target.value as Lead["stage"],
                }))
              }
            >
              {stages.map((stage) => (
                <option key={stage}>{stage}</option>
              ))}
            </select>
          </div>
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={draft.marketing}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                marketing: event.target.checked,
              }))
            }
          />
          <span>Consentimiento comercial simulado</span>
        </label>
        <div className="detail-metadata">
          <p>
            <Mail size={15} /> Registro: {formatDate(lead.createdAt)}
          </p>
          {lead.meeting && (
            <p>
              <Check size={15} /> Reserva simulada:{" "}
              {lead.meeting.date.split("-").reverse().join("/")} ·{" "}
              {lead.meeting.time} (UTC−3)
            </p>
          )}
        </div>
        {deleting ? (
          <div className="delete-confirm" role="alert">
            <p>
              ¿Eliminar este contacto y su reserva local? Esta acción no se
              puede deshacer.
            </p>
            <button type="button" className="button danger" onClick={remove}>
              Sí, eliminar
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={() => setDeleting(false)}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="modal-actions split">
            <button
              type="button"
              className="delete-button"
              onClick={() => setDeleting(true)}
            >
              <Trash2 size={15} /> Eliminar
            </button>
            <button className="button" type="submit">
              Guardar cambios <Check size={16} />
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
}
