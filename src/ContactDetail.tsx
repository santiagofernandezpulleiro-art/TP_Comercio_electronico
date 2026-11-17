import { useState } from "react";
import {
  ArrowRight,
  Check,
  MessageSquare,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Modal } from "./components";
import {
  eventNames,
  formatDate,
  fullName,
  initials,
  scoreLead,
  statuses,
  type EventType,
  type Lead,
  type Store,
} from "./data";

export type ChangeLead = (
  id: string,
  changes: Partial<Lead>,
  type: EventType,
  detail: string,
) => void;
export default function ContactDetail({
  lead,
  data,
  close,
  update,
  remove,
}: {
  lead: Lead;
  data: Store;
  close: () => void;
  update: ChangeLead;
  remove: () => void;
}) {
  const [note, setNote] = useState("");
  const [deleting, setDeleting] = useState(false);
  const rating = scoreLead(lead, data.events, data.thresholds);
  const history = data.events
    .filter((event) => event.leadId === lead.id)
    .sort((a, b) => b.at.localeCompare(a.at));
  return (
    <Modal title="Ficha de vinculación institucional" close={close} wide>
      <div className="contact-detail-heading">
        <span className="contact-avatar">{initials(fullName(lead))}</span>
        <div>
          <h3>{fullName(lead)}</h3>
          <p>
            {lead.company} ·{" "}
            {lead.source === "Formulario"
              ? "Desde formulario"
              : "Contacto ficticio precargado"}
          </p>
        </div>
        <span className={`pill stage-${rating.stage.toLowerCase()}`}>
          {rating.stage} · {rating.score}/100
        </span>
      </div>
      <div className="contact-detail-grid">
        <section>
          <h3 className="detail-section-title">Información registrada</h3>
          <dl className="contact-facts">
            <dt>Correo corporativo</dt>
            <dd>{lead.email}</dd>
            <dt>Sector declarado</dt>
            <dd>{lead.sector}</dd>
            <dt>Fecha de registro</dt>
            <dd>{formatDate(lead.createdAt, true)} (UTC−3)</dd>
            <dt>Informe solicitado</dt>
            <dd>{lead.report}</dd>
            <dt>Descarga</dt>
            <dd>
              {rating.downloaded
                ? "Solicitud registrada"
                : "Aún sin descarga solicitada"}
            </dd>
            <dt>Consentimiento informado</dt>
            <dd>Aceptado · {formatDate(lead.consentAt, true)}</dd>
            <dt>Comunicaciones futuras</dt>
            <dd>{lead.marketing ? "Aceptadas (simulado)" : "No aceptadas"}</dd>
            <dt>Procedencia / medio</dt>
            <dd>
              {lead.attribution.source} / {lead.attribution.medium}
            </dd>
            <dt>Campaña</dt>
            <dd>{lead.attribution.campaign}</dd>
          </dl>
        </section>
        <section className="score-card">
          <div className="score-heading">
            <ShieldCheck size={20} />
            <span>Puntuación de demostración</span>
            <strong>
              {rating.score}
              <small>/100</small>
            </strong>
          </div>
          <div className="score-breakdown">
            {rating.parts.map((part) => (
              <p key={part.label}>
                <span>{part.label}</span>
                <strong>
                  {part.points}
                  <small>/{part.max}</small>
                </strong>
              </p>
            ))}
          </div>
          <p className="score-rule-note">
            MQL ≥ {data.thresholds.mql} + sector prioritario + descarga. SQL ≥{" "}
            {data.thresholds.sql} + condiciones MQL + reunión solicitada +
            aceptación de Programas.
          </p>
          <p className="score-rule-note">
            No se verifican cargo, tamaño de empresa ni capacidad de decisión.
            La puntuación no equivale a una evaluación institucional real.
          </p>
        </section>
      </div>
      <div className="detail-management">
        <div className="field">
          <label htmlFor="lead-status">Estado operativo</label>
          <select
            id="lead-status"
            value={lead.status}
            onChange={(event) =>
              update(
                lead.id,
                { status: event.target.value as Lead["status"] },
                event.target.value === "Derivado a Programas"
                  ? "referral"
                  : "status",
                `Estado: ${lead.status} → ${event.target.value}`,
              )
            }
          >
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <small>
            Los hitos MQL/SQL del estado no alteran la calificación calculada.
          </small>
        </div>
        <div>
          <label className="checkbox-label technical-review">
            <input
              type="checkbox"
              checked={lead.technicalAccepted}
              onChange={(event) =>
                update(
                  lead.id,
                  { technicalAccepted: event.target.checked },
                  "review",
                  event.target.checked
                    ? "Aceptación simulada por Programas registrada."
                    : "Aceptación simulada por Programas retirada.",
                )
              }
            />
            <span>
              Aceptado por Programas{" "}
              <small>
                Revisión técnica manual simulada, no verificación del perfil.
              </small>
            </span>
          </label>
          <button
            className="button secondary full-width"
            disabled={lead.status === "Derivado a Programas"}
            onClick={() =>
              update(
                lead.id,
                { status: "Derivado a Programas" },
                "referral",
                "Oportunidad derivada a Programas en el prototipo.",
              )
            }
          >
            <ArrowRight size={16} />
            {lead.status === "Derivado a Programas"
              ? "Derivación registrada"
              : "Derivar a Programas"}
          </button>
        </div>
      </div>
      <section className="note-composer">
        <h3 className="detail-section-title">
          <MessageSquare size={17} /> Registrar seguimiento
        </h3>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!note.trim()) return;
            update(lead.id, {}, "note", note.trim());
            setNote("");
          }}
        >
          <label htmlFor="followup-note" className="sr-only">
            Nota de seguimiento
          </label>
          <textarea
            id="followup-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Agregá contexto para la próxima conversación…"
          />
          <button className="button" disabled={!note.trim()} type="submit">
            Agregar nota <Check size={16} />
          </button>
        </form>
      </section>
      <section className="activity-history">
        <div className="history-heading">
          <h3 className="detail-section-title">Historial de interacciones</h3>
          <span>{history.length} actividades</span>
        </div>
        <ol>
          {history.map((event) => (
            <li key={event.id}>
              <span className={`activity-dot activity-${event.type}`} />
              <div>
                <strong>{eventNames[event.type]}</strong>
                {event.detail && <p>{event.detail}</p>}
                <small>
                  {formatDate(event.at, true)} (UTC−3) ·{" "}
                  {event.demo
                    ? "Ejemplo precargado"
                    : "Recorrido de demostración"}
                </small>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <div className="detail-privacy">
        <p>
          Los cambios se guardan al realizar cada acción. Para rectificar datos
          personales, eliminá el contacto y volvé a registrarlo. Se suprimirán
          también sus notas y eventos asociados.
        </p>
        {deleting ? (
          <div className="delete-confirm" role="alert">
            <p>¿Eliminar el contacto y su historial de este navegador?</p>
            <button className="button danger" onClick={remove}>
              Sí, eliminar
            </button>
            <button
              className="button secondary"
              onClick={() => setDeleting(false)}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button className="delete-button" onClick={() => setDeleting(true)}>
            <Trash2 size={15} />
            Eliminar contacto y actividad
          </button>
        )}
      </div>
    </Modal>
  );
}
