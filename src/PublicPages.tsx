import { useRef, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCheck,
  CheckCircle2,
  FileText,
  Fingerprint,
  Globe2,
  Leaf,
  LockKeyhole,
  MessageSquare,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import { Modal, ReportCover } from "./components";
import { sectors, type Lead, type LeadInput } from "./data";

export function Landing() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="landing solidarity-landing"
    >
      <section className="hero site-container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> CONOCIMIENTO QUE CONECTA ALIANZAS
          </div>
          <h1 tabIndex={-1}>
            El futuro de tu cadena
            <br />
            empieza <em>en el origen.</em>
          </h1>
          <p className="hero-question">
            ¿Tu cadena de suministro está preparada para la normativa europea de
            deforestación?
          </p>
          <p className="hero-description">
            Conocé los principales desafíos de trazabilidad, sostenibilidad y
            preparación ante EUDR para las cadenas agroindustriales de América
            Latina.
          </p>
          <a href="#/registro" className="button button-large">
            Descargar informe técnico <ArrowUpRight size={20} />
          </a>
          <div className="hero-meta">
            <span>
              <FileText size={14} /> Muestra académica en PDF
            </span>
            <span>
              <LockKeyhole size={14} /> Acceso gratuito
            </span>
          </div>
          <button
            className="explore-link"
            onClick={() =>
              document
                .getElementById("contenido")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explorá el contenido <ArrowDown size={15} />
          </button>
        </div>
        <div className="agri-hero">
          <img
            src="/agricultura-ilustrativa.png"
            width="1536"
            height="1024"
            alt="Paisaje agrícola ilustrativo con cultivos, bosque y luz de amanecer"
          />
          <div className="image-top-tag">
            <span className="live-dot" /> AMÉRICA LATINA · MIRADA REGIONAL
          </div>
          <div className="image-story">
            <span>DEL CONOCIMIENTO AL TERRITORIO</span>
            <h2>
              Cadenas responsables.
              <br />
              Alianzas que transforman.
            </h2>
            <div>
              <span>Recurso piloto / EUDR</span>
              <ArrowUpRight size={24} />
            </div>
          </div>
          <small>
            Imagen ilustrativa generada · No representa un proyecto de
            Solidaridad
          </small>
        </div>
      </section>
      <section className="topic-strip">
        <div className="site-container">
          <span>UNA AGENDA COMPARTIDA</span>
          <p>
            <Sprout size={19} /> Agricultura regenerativa
          </p>
          <span className="topic-divider" />
          <p>
            <Fingerprint size={19} /> Trazabilidad en origen
          </p>
          <span className="topic-divider" />
          <p>
            <Globe2 size={19} /> Vinculación institucional
          </p>
        </div>
      </section>
      <section className="benefits site-container" id="contenido">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              UN PUNTO DE PARTIDA PARA TU ORGANIZACIÓN
            </div>
            <h2>
              Más claridad para avanzar.
              <br />
              <em>Más conexiones para transformar.</em>
            </h2>
          </div>
          <p>
            Una muestra para iniciar la conversación sobre cadenas
            agroindustriales responsables, sin perder de vista a quienes
            producen.
          </p>
        </div>
        <div className="benefit-grid">
          {[
            {
              icon: BookOpen,
              title: "Entender el desafío EUDR",
              text: "Un marco introductorio de preguntas sobre preparación, información de origen y debida diligencia.",
              number: "01",
            },
            {
              icon: Fingerprint,
              title: "Conectar origen e información",
              text: "Temas para revisar la trazabilidad de la cadena y las necesidades de información de tu organización.",
              number: "02",
            },
            {
              icon: Leaf,
              title: "Abrir una conversación técnica",
              text: "Un primer paso para manifestar interés y organizar el seguimiento institucional con el equipo de Programas.",
              number: "03",
            },
          ].map(({ icon: Icon, title, text, number }) => (
            <article className="benefit-card" key={number}>
              <div className="benefit-top">
                <Icon size={26} strokeWidth={1.5} />
                <span>{number}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="institution-note">
          <ShieldCheck size={20} />
          <p>
            <strong>
              Rigor técnico, diálogo institucional y foco en el territorio.
            </strong>
            <span>
              Prototipo basado en el TP de Comercio Electrónico del ITBA,
              secciones 5, 6, 8, 9 y 10. No es una plataforma oficial de
              Solidaridad ni afirma alianzas o certificaciones.
            </span>
          </p>
        </div>
      </section>
      <section className="bottom-cta site-container">
        <div>
          <div className="eyebrow">HUB DE ALIADOS ESTRATÉGICOS</div>
          <h2>
            Del interés en un informe
            <br />a una conversación con propósito.
          </h2>
        </div>
        <a className="button light" href="#/registro">
          Acceder al material <ArrowUpRight size={19} />
        </a>
        <Sprout className="cta-leaf" size={175} strokeWidth={0.5} />
      </section>
    </main>
  );
}

type Fields = {
  name: string;
  surname: string;
  email: string;
  company: string;
  sector: string;
  consent: boolean;
  marketing: boolean;
};
type Errors = Partial<Record<keyof Fields, string>>;
function validate(key: keyof Fields, values: Fields): string {
  if (key === "name" && !values.name.trim()) return "Ingresá tu nombre.";
  if (key === "surname" && !values.surname.trim())
    return "Ingresá tu apellido.";
  if (
    key === "email" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
  )
    return "Ingresá un correo corporativo con formato válido.";
  if (key === "company" && !values.company.trim())
    return "Ingresá tu organización o empresa.";
  if (
    key === "sector" &&
    !sectors.includes(values.sector as LeadInput["sector"])
  )
    return "Seleccioná un sector productivo.";
  if (key === "consent" && !values.consent)
    return "Necesitamos tu consentimiento para registrar los datos de esta demostración.";
  return "";
}
export function Capture({
  submit,
  privacy,
}: {
  submit: (input: LeadInput) => string | null;
  privacy: () => void;
}) {
  const [values, setValues] = useState<Fields>({
    name: "",
    surname: "",
    email: "",
    company: "",
    sector: "",
    consent: false,
    marketing: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const pending = useRef(false);
  function change(key: keyof Fields, value: string | boolean) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setServerError("");
  }
  async function send(event: FormEvent) {
    event.preventDefault();
    if (pending.current) return;
    const next: Errors = {};
    (
      ["name", "surname", "email", "company", "sector", "consent"] as const
    ).forEach((key) => {
      const error = validate(key, values);
      if (error) next[key] = error;
    });
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(Object.keys(next)[0])?.focus();
      return;
    }
    pending.current = true;
    setSubmitting(true);
    try {
      await Promise.resolve();
      const error = submit({
        name: values.name.trim(),
        surname: values.surname.trim(),
        email: values.email.trim().toLowerCase(),
        company: values.company.trim(),
        sector: values.sector as LeadInput["sector"],
        marketing: values.marketing,
      });
      if (error) setServerError(error);
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="capture-page site-container"
    >
      <a href="#/" className="back-link">
        <ArrowLeft size={16} />
        Volver al informe
      </a>
      <div className="capture-layout">
        <aside className="capture-aside">
          <div className="eyebrow">EL CONOCIMIENTO ABRE CAMINOS</div>
          <h2>
            Tu próximo paso,
            <br />
            <em>con más perspectiva.</em>
          </h2>
          <p>
            Accedé a una muestra sobre preparación ante EUDR y explorá una nueva
            forma de vinculación institucional.
          </p>
          <div className="mini-report">
            <ReportCover compact />
          </div>
          <div className="aside-points">
            <span>
              <Check size={16} /> Acceso inmediato, sin intermediarios
            </span>
            <span>
              <Check size={16} /> Comunicaciones futuras opcionales
            </span>
            <span>
              <Check size={16} /> Material demostrativo, no oficial
            </span>
          </div>
        </aside>
        <section className="capture-card">
          <div className="form-step">
            01 <span>/</span> 02{" "}
            <span className="form-step-label">ACCESO AL MATERIAL TÉCNICO</span>
          </div>
          <h1 tabIndex={-1}>Conectemos desde el origen.</h1>
          <p className="muted">
            Solo los datos necesarios para iniciar la conversación.
          </p>
          <div className="inline-note">
            <ShieldCheck size={17} />
            <span>
              Prototipo académico: utilizá únicamente datos ficticios.
            </span>
          </div>
          <form onSubmit={send} noValidate aria-busy={submitting}>
            <div className="form-fields">
              <div className="name-fields">
                {(["name", "surname"] as const).map((key) => (
                  <div className="field" key={key}>
                    <label htmlFor={key}>
                      {key === "name" ? "Nombre" : "Apellido"}{" "}
                      <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id={key}
                      required
                      maxLength={80}
                      autoComplete={
                        key === "name" ? "given-name" : "family-name"
                      }
                      placeholder={key === "name" ? "Alex" : "Pérez"}
                      value={values[key]}
                      onChange={(event) => change(key, event.target.value)}
                      onBlur={() =>
                        setErrors((previous) => ({
                          ...previous,
                          [key]: validate(key, values),
                        }))
                      }
                      aria-invalid={!!errors[key]}
                      aria-describedby={
                        errors[key] ? `${key}-error` : undefined
                      }
                    />
                    {errors[key] && (
                      <span
                        className="field-error"
                        id={`${key}-error`}
                        role="alert"
                      >
                        {errors[key]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {(
                [
                  [
                    "email",
                    "Correo electrónico corporativo",
                    "alex@organizacion.test",
                    "email",
                    "email",
                  ],
                  [
                    "company",
                    "Organización o empresa",
                    "Ej. Cooperativa Horizonte",
                    "text",
                    "organization",
                  ],
                ] as const
              ).map(([key, label, placeholder, type, autocomplete]) => (
                <div className="field" key={key}>
                  <label htmlFor={key}>
                    {label} <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={key}
                    required
                    type={type}
                    maxLength={key === "email" ? 254 : 140}
                    autoComplete={autocomplete}
                    placeholder={placeholder}
                    value={values[key]}
                    onChange={(event) => change(key, event.target.value)}
                    onBlur={() =>
                      setErrors((previous) => ({
                        ...previous,
                        [key]: validate(key, values),
                      }))
                    }
                    aria-invalid={!!errors[key]}
                    aria-describedby={errors[key] ? `${key}-error` : undefined}
                  />
                  {errors[key] && (
                    <span
                      className="field-error"
                      id={`${key}-error`}
                      role="alert"
                    >
                      {errors[key]}
                    </span>
                  )}
                </div>
              ))}
              <div className="field">
                <label htmlFor="sector">
                  Sector productivo <span aria-hidden="true">*</span>
                </label>
                <select
                  id="sector"
                  required
                  value={values.sector}
                  onChange={(event) => change("sector", event.target.value)}
                  onBlur={() =>
                    setErrors((previous) => ({
                      ...previous,
                      sector: validate("sector", values),
                    }))
                  }
                  aria-invalid={!!errors.sector}
                  aria-describedby={errors.sector ? "sector-error" : undefined}
                >
                  <option value="">
                    Seleccioná el sector de tu organización
                  </option>
                  {sectors.map((sector) => (
                    <option key={sector}>{sector}</option>
                  ))}
                </select>
                {errors.sector && (
                  <span className="field-error" id="sector-error" role="alert">
                    {errors.sector}
                  </span>
                )}
              </div>
            </div>
            <div className="consent-box">
              <label className="checkbox-label">
                <input
                  id="consent"
                  type="checkbox"
                  required
                  checked={values.consent}
                  onChange={(event) => change("consent", event.target.checked)}
                  aria-invalid={!!errors.consent}
                  aria-describedby={
                    errors.consent ? "consent-error" : undefined
                  }
                />
                <span>
                  Acepto el tratamiento de mis datos para acceder al material y
                  simular su seguimiento institucional.{" "}
                  <strong>Obligatorio.</strong>
                </span>
              </label>
              {errors.consent && (
                <span className="field-error" id="consent-error" role="alert">
                  {errors.consent}
                </span>
              )}
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={values.marketing}
                  onChange={(event) =>
                    change("marketing", event.target.checked)
                  }
                />
                <span>
                  Quiero recibir futuras comunicaciones institucionales.{" "}
                  <small>
                    Opcional e independiente. No se envían mensajes reales.
                  </small>
                </span>
              </label>
            </div>
            <p className="privacy-note">
              Datos almacenados únicamente en este navegador. Finalidad: acceso
              al recurso y demostración de captación, calificación y
              seguimiento. Podés consultar, rectificar o suprimirlos en el CRM.{" "}
              <button type="button" onClick={privacy}>
                Aviso de privacidad · Ley 25.326
              </button>
              .
            </p>
            {serverError && (
              <p className="submit-error" role="alert">
                {serverError} <a href="#/crm">Ir al CRM</a>
              </p>
            )}
            <button
              className="button full-width"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Registrando contacto…" : "Acceder al informe"}
              <ArrowRight size={18} />
            </button>
            <p className="form-security">
              <LockKeyhole size={13} />
              Sin envío de datos a Solidaridad ni a terceros
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}

export function ThankYou({
  lead,
  requested,
  download,
  request,
}: {
  lead?: Lead;
  requested: boolean;
  download: () => void;
  request: (detail: string) => void;
}) {
  const [meeting, setMeeting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="thanks-page site-container"
    >
      <div className="success-symbol">
        <CheckCheck size={35} />
      </div>
      <div className="eyebrow">DEL INTERÉS A UNA NUEVA CONEXIÓN</div>
      <h1 tabIndex={-1}>
        {lead ? `¡Gracias, ${lead.name}!` : "¡Gracias por tu interés!"}
      </h1>
      <p className="thanks-intro">
        {lead ? "Tu registro se completó correctamente. " : ""}El material de
        muestra ya está disponible.
        <br />
        Empecemos a construir una conversación con propósito.
      </p>
      {!lead && (
        <div className="guest-note">
          Vista de demostración. <a href="#/registro">Registrá un contacto</a>{" "}
          para vincular la actividad al CRM.
        </div>
      )}
      <div className="thanks-cards">
        <section className="download-card">
          <div className="card-kicker">
            <FileText size={18} /> TU MATERIAL TÉCNICO
          </div>
          <div className="download-body">
            <div className="download-cover">
              <ReportCover compact />
            </div>
            <div>
              <span className="pill neutral">MUESTRA ACADÉMICA</span>
              <h2>
                Preparación
                <br />
                ante EUDR.
              </h2>
              <p>
                Documento introductorio de demostración.
                <br />
                No es un informe oficial de Solidaridad.
              </p>
            </div>
          </div>
          <a
            className="button full-width"
            href="/informe-eudr-demostracion.pdf"
            download="EUDR-Muestra-Academica.pdf"
            onClick={() => {
              download();
              setDownloaded(true);
            }}
          >
            Descargar informe <ArrowDownToLine size={18} />
          </a>
          {downloaded && (
            <p className="download-notice" role="status">
              <Check size={14} />
              Descarga solicitada. Revisá las descargas del navegador.
            </p>
          )}
        </section>
        <section className="meeting-card">
          <div className="card-kicker">
            <MessageSquare size={18} /> UN SIGUIENTE PASO, EN CONJUNTO
          </div>
          <div className="meeting-graphic">
            <MessageSquare size={37} strokeWidth={1.3} />
            <span>
              <Check size={15} />
            </span>
          </div>
          <h2>
            Conectá tus desafíos
            <br />
            con una mirada técnica.
          </h2>
          <p>
            Manifestá tu interés en una conversación exploratoria. El equipo de
            Programas podrá simular su seguimiento desde el Hub.
          </p>
          {requested && (
            <p className="booking-summary">
              <CheckCircle2 size={15} />
              Solicitud registrada en tu ficha de contacto.
            </p>
          )}
          <button
            className="button secondary full-width"
            onClick={() => setMeeting(true)}
          >
            {requested
              ? "Ver solicitud registrada"
              : "Solicitar reunión técnica"}
            <ArrowUpRight size={17} />
          </button>
          <small>Solicitud simulada · Sin agenda ni invitación real</small>
        </section>
      </div>
      <div className="next-steps">
        <span className="eyebrow">UN RECORRIDO CONECTADO</span>
        {[
          [
            "01",
            "Explorá el documento",
            "Descargá el PDF y revisá las preguntas introductorias.",
          ],
          [
            "02",
            "Compartí tu interés",
            "Registrá una solicitud para una conversación técnica.",
          ],
          [
            "03",
            "Seguí la oportunidad",
            "Encontrá la actividad y su calificación en el CRM.",
          ],
        ].map(([step, title, text]) => (
          <div key={step}>
            <span>{step}</span>
            <p>
              <strong>{title}</strong>
              {text}
            </p>
          </div>
        ))}
      </div>
      <div className="thanks-links">
        <a className="back-link" href="#/">
          <ArrowLeft size={15} />
          Volver al inicio
        </a>
        <a href="#/crm" className="crm-entry">
          Ver contacto e historial en el CRM <ArrowRight size={17} />
        </a>
      </div>
      {meeting && (
        <MeetingRequest
          lead={lead}
          requested={requested}
          close={() => setMeeting(false)}
          request={request}
        />
      )}
    </main>
  );
}

export function MeetingRequest({
  lead,
  requested,
  close,
  request,
}: {
  lead?: Lead;
  requested: boolean;
  close: () => void;
  request: (detail: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(requested);
  return (
    <Modal title="Solicitud de reunión técnica" close={close}>
      {!lead ? (
        <div className="prose">
          <p>
            Para registrar tu interés y vincularlo a una organización, completá
            primero el formulario del informe. Esta demostración no contacta a
            Solidaridad ni crea reuniones reales.
          </p>
          <a className="button" href="#/registro" onClick={close}>
            Registrar mi interés <ArrowRight size={17} />
          </a>
        </div>
      ) : done ? (
        <div className="booking-done">
          <CheckCircle2 size={50} />
          <h3>Solicitud registrada</h3>
          <p>
            {lead.name}, tu interés quedó vinculado a {lead.company} en el CRM
            de demostración.
          </p>
          <div className="inline-note">
            No se reservó un horario, no se creó una reunión real y no se envió
            ninguna notificación. El seguimiento se simula desde la ficha del
            contacto.
          </div>
          <button className="button full-width" onClick={close}>
            Entendido <Check size={17} />
          </button>
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            request(
              message.trim() ||
                "Interés en una conversación exploratoria sobre EUDR.",
            );
            setDone(true);
          }}
        >
          <p className="muted">
            Manifestá tu interés en una conversación exploratoria sobre los
            desafíos de tu cadena. No se solicitará disponibilidad de
            calendario.
          </p>
          <div className="request-person">
            <span>
              {lead.name} {lead.surname}
            </span>
            <small>{lead.company}</small>
          </div>
          <div className="field">
            <label htmlFor="meeting-message">
              ¿Qué te gustaría conversar? <span>(opcional)</span>
            </label>
            <textarea
              id="meeting-message"
              maxLength={1000}
              rows={4}
              placeholder="Ej. Necesidades de trazabilidad en nuestra cadena de café."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>
          <div className="inline-note">
            <MessageSquare size={17} />
            Solicitud local de demostración. Sin envío ni reserva real.
          </div>
          <button className="button full-width" type="submit">
            Registrar solicitud <ArrowRight size={17} />
          </button>
        </form>
      )}
    </Modal>
  );
}
