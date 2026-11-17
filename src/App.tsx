import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronRight, RotateCcw } from "lucide-react";
import {
  loadStore,
  seed,
  STORAGE_KEY,
  makeEvent,
  readAttribution,
  type Attribution,
  type EventType,
  type Lead,
  type LeadInput,
  type Store,
  type Thresholds,
  REPORT,
} from "./data";
import { Brand, Modal, PrivacyText } from "./components";
import { Landing, Capture, ThankYou, MeetingRequest } from "./PublicPages";
import Dashboard from "./Dashboard";

const pages = ["/", "/registro", "/gracias", "/crm"];
const labels = ["Informe", "Registro", "Confirmación", "CRM"];
function currentPage() {
  const path = (location.hash.slice(1) || "/").split("?")[0];
  return pages.includes(path) ? path : "/";
}
function getSession(): { id: string; attribution: Attribution } {
  const attribution = readAttribution();
  const hasUTM = ["utm_source", "utm_medium", "utm_campaign"].some(
    (key) =>
      new URLSearchParams(location.search).has(key) ||
      new URLSearchParams(location.hash.split("?")[1] || "").has(key),
  );
  try {
    const stored = JSON.parse(
      sessionStorage.getItem("solidaridad-session") || "null",
    );
    if (
      stored &&
      typeof stored.id === "string" &&
      stored.attribution &&
      ["source", "medium", "campaign"].every(
        (key) => typeof stored.attribution[key] === "string",
      ) &&
      (!hasUTM ||
        JSON.stringify(stored.attribution) === JSON.stringify(attribution))
    )
      return stored;
  } catch {
    /* Storage can be unavailable in private browser settings. */
  }
  const session = { id: crypto.randomUUID(), attribution };
  try {
    sessionStorage.setItem("solidaridad-session", JSON.stringify(session));
  } catch {
    /* State still works in memory. */
  }
  return session;
}
export default function App() {
  const [page, setPage] = useState(currentPage);
  const [initial] = useState(loadStore);
  const [store, setStore] = useState(initial.data);
  const dataRef = useRef(store);
  const [session, setSession] = useState(getSession);
  const [warning, setWarning] = useState(initial.warning);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState<"privacy" | "reset" | "contact" | null>(
    null,
  );
  function commit(change: (data: Store) => Store) {
    const next = change(dataRef.current);
    dataRef.current = next;
    setStore(next);
  }
  function record(type: EventType, leadId?: string, detail?: string) {
    commit((data) => {
      if (
        (type === "visit" || type === "start") &&
        data.events.some(
          (event) => event.type === type && event.sessionId === session.id,
        )
      )
        return data;
      if (
        type === "meeting" &&
        data.events.some(
          (event) => event.type === type && event.leadId === leadId,
        )
      )
        return data;
      const lead = data.leads.find((item) => item.id === leadId);
      return {
        ...data,
        events: [
          ...data.events,
          makeEvent(
            type,
            lead?.sessionId || session.id,
            lead?.attribution || session.attribution,
            leadId,
            detail,
          ),
        ],
        leads:
          type === "meeting"
            ? data.leads.map((item) =>
                item.id === leadId
                  ? { ...item, status: "Reunión solicitada" }
                  : item,
              )
            : data.leads,
      };
    });
  }
  useEffect(() => {
    const navigate = () => {
      setPage(currentPage());
      setModal(null);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      setWarning(
        "El navegador bloqueó el guardado local. Los cambios solo durarán mientras esta pestaña siga abierta.",
      );
    }
  }, [store]);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  useEffect(() => {
    document.title = `${labels[pages.indexOf(page)]} · Hub de Aliados | Solidaridad LATAM`;
    if (page === "/") record("visit");
    if (page === "/registro") record("start");
    const timer = setTimeout(
      () => document.querySelector<HTMLElement>("main h1")?.focus(),
      0,
    );
    return () => clearTimeout(timer);
    // These events are recorded once per session by record(), including StrictMode remounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, session.id]);
  function addLead(input: LeadInput): string | null {
    if (
      dataRef.current.leads.some(
        (lead) => lead.email.toLowerCase() === input.email.toLowerCase(),
      )
    )
      return "Ya existe un contacto con este correo en la demostración. Usá otro correo ficticio o consultá su ficha en el CRM.";
    const at = new Date().toISOString();
    const lead: Lead = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: at,
      consent: true,
      consentAt: at,
      status: "Nuevo",
      source: "Formulario",
      report: REPORT,
      attribution: session.attribution,
      sessionId: session.id,
      technicalAccepted: false,
    };
    commit((data) => ({
      ...data,
      leads: [lead, ...data.leads],
      lastLeadId: lead.id,
      events: [
        ...data.events.map((event) =>
          (event.type === "start" || event.type === "visit") &&
          event.sessionId === session.id &&
          !event.leadId
            ? { ...event, leadId: lead.id }
            : event,
        ),
        makeEvent("submit", session.id, session.attribution, lead.id),
      ],
    }));
    location.hash = "/gracias";
    setNotice("Contacto registrado. Ya podés descargar el material.");
    return null;
  }
  const lastLead = store.leads.find((lead) => lead.id === store.lastLeadId);
  function changeLead(
    id: string,
    changes: Partial<Lead>,
    type: EventType,
    detail: string,
  ) {
    commit((data) => {
      const lead = data.leads.find((item) => item.id === id);
      if (!lead) return data;
      return {
        ...data,
        leads: data.leads.map((item) =>
          item.id === id ? { ...item, ...changes } : item,
        ),
        events: [
          ...data.events,
          makeEvent(type, lead.sessionId, lead.attribution, id, detail),
        ],
      };
    });
    setNotice("Cambio guardado en el historial local.");
  }
  function changeThresholds(thresholds: Thresholds) {
    commit((data) => ({
      ...data,
      thresholds,
      events: [
        ...data.events,
        makeEvent(
          "thresholds",
          session.id,
          session.attribution,
          undefined,
          `MQL: ${thresholds.mql}; SQL: ${thresholds.sql}`,
        ),
      ],
    }));
    setNotice("Criterios de demostración actualizados.");
  }
  const request = (detail: string) => {
    if (lastLead) record("meeting", lastLead.id, detail);
  };
  return (
    <>
      <a
        href="#main-content"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Saltar al contenido
      </a>
      {warning && (
        <div className="storage-warning" role="alert">
          {warning}
          <button aria-label="Cerrar aviso" onClick={() => setWarning("")}>
            ×
          </button>
        </div>
      )}
      {page !== "/crm" && (
        <header className="site-header">
          <div className="academic-ribbon">
            Prototipo académico — datos de demostración
            <span>No es una herramienta oficial</span>
          </div>
          <div className="site-container header-inner">
            <Brand />
            <nav aria-label="Navegación principal">
              <a href="#/">El informe</a>
              <button
                className="header-contact"
                onClick={() => setModal("contact")}
              >
                Contactar al equipo <ArrowRight size={16} />
              </button>
            </nav>
          </div>
        </header>
      )}
      {page === "/" && <Landing />}
      {page === "/registro" && (
        <Capture submit={addLead} privacy={() => setModal("privacy")} />
      )}
      {page === "/gracias" && (
        <ThankYou
          lead={lastLead}
          requested={
            !!lastLead &&
            store.events.some(
              (event) =>
                event.leadId === lastLead.id && event.type === "meeting",
            )
          }
          download={() => record("download", lastLead?.id)}
          request={request}
        />
      )}
      {page === "/crm" && (
        <Dashboard
          store={store}
          update={changeLead}
          thresholds={changeThresholds}
          remove={(id) => {
            commit((data) => ({
              ...data,
              leads: data.leads.filter((lead) => lead.id !== id),
              events: data.events.filter((event) => event.leadId !== id),
              lastLeadId: data.lastLeadId === id ? null : data.lastLeadId,
            }));
            setNotice("Contacto y actividades asociadas eliminados.");
          }}
        />
      )}
      {page !== "/crm" && (
        <footer className="site-footer site-container">
          <div>
            <strong>Solidaridad LATAM</strong>
            <span>
              Hub de Aliados Estratégicos · TP Comercio Electrónico · ITBA
            </span>
          </div>
          <div>
            <span>Prototipo académico — datos de demostración</span>
            <button onClick={() => setModal("privacy")}>Privacidad</button>
          </div>
        </footer>
      )}
      <div className="demo-bar">
        <div className="demo-label">
          <span className="live-dot" /> PROTOTIPO ACADÉMICO
        </div>
        <nav aria-label="Recorrido de presentación">
          {pages.map((path, i) => (
            <a
              key={path}
              href={`#${path}`}
              aria-current={page === path ? "step" : undefined}
            >
              <span className="step-number">
                {pages.indexOf(page) > i ? <Check size={12} /> : i + 1}
              </span>
              {labels[i]}
              {i < 3 && <ChevronRight className="step-chevron" size={14} />}
            </a>
          ))}
        </nav>
        <button
          className="reset-button"
          aria-label="Reiniciar demo"
          title="Reiniciar demo"
          onClick={() => setModal("reset")}
        >
          <RotateCcw size={14} />
          <span>Reiniciar demo</span>
        </button>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Check size={17} />
          {notice}
        </div>
      )}
      {modal === "privacy" && (
        <Modal
          title="Privacidad de la demostración"
          close={() => setModal(null)}
        >
          <PrivacyText />
        </Modal>
      )}
      {modal === "contact" && (
        <MeetingRequest
          lead={lastLead}
          requested={
            !!lastLead &&
            store.events.some(
              (event) =>
                event.leadId === lastLead.id && event.type === "meeting",
            )
          }
          close={() => setModal(null)}
          request={request}
        />
      )}
      {modal === "reset" && (
        <Modal title="¿Restaurar la demostración?" close={() => setModal(null)}>
          <p className="muted">
            Se eliminarán los contactos, eventos, notas y solicitudes ingresados
            aquí. Se restaurarán 18 contactos ficticios, sus actividades y los
            umbrales iniciales. Otras aplicaciones del navegador no se
            modifican.
          </p>
          <div className="modal-actions">
            <button className="button secondary" onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button
              className="button"
              onClick={() => {
                const next = getSession();
                next.id = crypto.randomUUID();
                try {
                  sessionStorage.setItem(
                    "solidaridad-session",
                    JSON.stringify(next),
                  );
                } catch {
                  /* In-memory demo remains available. */
                }
                commit(() => seed());
                setSession(next);
                setModal(null);
                location.hash = "/";
                setNotice("Demostración restaurada.");
              }}
            >
              Restaurar datos <RotateCcw size={16} />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
