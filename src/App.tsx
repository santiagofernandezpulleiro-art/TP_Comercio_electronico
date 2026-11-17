import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  LayoutDashboard,
  RotateCcw,
} from "lucide-react";
import { loadStore, seed, STORAGE_KEY, type Lead, type Store } from "./data";
import { Brand, Modal, PrivacyText } from "./components";
import { Landing, Capture, ThankYou } from "./PublicPages";
import Dashboard from "./Dashboard";

const pages = ["/", "/registro", "/gracias", "/crm"];
const labels = ["Reporte", "Registro", "Confirmación", "CRM"];
function currentPage() {
  const path = window.location.hash.slice(1) || "/";
  return pages.includes(path) ? path : "/";
}

export default function App() {
  const [page, setPage] = useState(currentPage);
  const [initial] = useState(loadStore);
  const [store, setStore] = useState<Store>(initial.data);
  const [warning, setWarning] = useState(initial.warning);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState<"privacy" | "reset" | null>(null);
  useEffect(() => {
    const navigate = () => {
      setPage(currentPage());
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
      const timeout = setTimeout(() => setNotice(""), 4500);
      return () => clearTimeout(timeout);
    }
  }, [notice]);
  useEffect(() => {
    document.title = `${labels[pages.indexOf(page)]} · Silva EUDR`;
    const timeout = setTimeout(
      () => document.querySelector<HTMLElement>("main h1")?.focus(),
      0,
    );
    return () => clearTimeout(timeout);
  }, [page]);
  function addLead(
    input: Pick<Lead, "name" | "email" | "company" | "role" | "marketing">,
  ) {
    const lead: Lead = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "Nuevo",
      stage: "Lead",
      source: "Formulario",
    };
    setStore((previous) => ({
      ...previous,
      leads: [lead, ...previous.leads],
      lastLeadId: lead.id,
    }));
    window.location.hash = "/gracias";
    setNotice("Contacto registrado. Tu reporte está disponible.");
  }
  const lastLead = store.leads.find((lead) => lead.id === store.lastLeadId);
  const update = (id: string, changes: Partial<Lead>) =>
    setStore((previous) => ({
      ...previous,
      leads: previous.leads.map((lead) =>
        lead.id === id ? { ...lead, ...changes } : lead,
      ),
    }));
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
          <button onClick={() => setWarning("")} aria-label="Cerrar aviso">
            ×
          </button>
        </div>
      )}
      {page !== "/crm" && (
        <header className="site-header">
          <div className="site-container header-inner">
            <Brand />
            <nav aria-label="Navegación principal">
              <a className={page === "/" ? "active" : ""} href="#/">
                El reporte
              </a>
              <a href="#/crm" className="header-crm">
                <LayoutDashboard size={15} /> Espacio comercial{" "}
                <ArrowRight size={15} />
              </a>
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
          book={(meeting) => {
            if (lastLead)
              update(lastLead.id, { meeting, status: "Reunión agendada" });
          }}
        />
      )}
      {page === "/crm" && (
        <Dashboard
          leads={store.leads}
          lastLeadId={store.lastLeadId}
          update={update}
          remove={(id) => {
            setStore((previous) => ({
              ...previous,
              leads: previous.leads.filter((lead) => lead.id !== id),
              lastLeadId:
                previous.lastLeadId === id ? null : previous.lastLeadId,
            }));
            setNotice("Contacto eliminado de esta demostración.");
          }}
        />
      )}
      {page !== "/crm" && (
        <footer className="site-footer site-container">
          <span>
            © {new Date().getFullYear()} Silva. Una mirada hacia el origen.
          </span>
          <div>
            <span>Prototipo académico · Marca ficticia</span>
            <button onClick={() => setModal("privacy")}>Privacidad</button>
          </div>
        </footer>
      )}
      <div className="demo-bar">
        <div className="demo-label">
          <span className="live-dot" /> MODO DEMOSTRACIÓN
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
          aria-label="Reiniciar demo"
          title="Reiniciar demo"
          className="reset-button"
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
      {modal === "reset" && (
        <Modal title="¿Reiniciar la demostración?" close={() => setModal(null)}>
          <p className="muted">
            Se eliminarán los contactos y las reservas ingresados en este
            navegador. Se restaurarán los seis contactos ficticios iniciales.
          </p>
          <div className="modal-actions">
            <button className="button secondary" onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button
              className="button"
              onClick={() => {
                setStore(seed());
                setModal(null);
                window.location.hash = "/";
                setNotice("Demostración reiniciada.");
              }}
            >
              Reiniciar demo <RotateCcw size={16} />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
