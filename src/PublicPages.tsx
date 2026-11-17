import { useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Fingerprint,
  Globe2,
  Leaf,
  LockKeyhole,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import { Modal, ReportCover } from "./components";
import type { Lead } from "./data";

export function Landing() {
  return (
    <main id="main-content" tabIndex={-1} className="landing">
      <section className="hero site-container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> INTELIGENCIA PARA UN FUTURO SOSTENIBLE
          </div>
          <h1 tabIndex={-1}>
            El origen importa.
            <br />
            Tu próximo paso,
            <br />
            <em>también.</em>
          </h1>
          <p className="hero-description">
            Una nueva mirada sobre EUDR, trazabilidad y cadenas de suministro
            responsables. Empezá a conectar los puntos de tu estrategia.
          </p>
          <a href="#/registro" className="button button-large">
            Descargar reporte gratuito <ArrowUpRight size={20} />
          </a>
          <div className="hero-meta">
            <span>
              <FileText size={14} /> PDF de demostración
            </span>
            <span>
              <Clock3 size={14} /> Acceso inmediato
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
            Conocé qué vas a encontrar <ArrowDown size={15} />
          </button>
        </div>
        <div className="hero-visual">
          <div className="visual-grid" />
          <div className="visual-caption">
            <span className="tiny-cross">+</span> EL CONOCIMIENTO ES EL PRIMER
            PASO.
          </div>
          <div className="report-shadow">
            <ReportCover />
          </div>
          <div className="report-float">
            <span className="float-icon">
              <ShieldCheck size={22} />
            </span>
            <span>
              Del conocimiento
              <br />
              <strong>a la acción responsable.</strong>
            </span>
            <ArrowUpRight size={17} />
          </div>
          <span className="visual-index">01 / EL REPORTE</span>
        </div>
      </section>
      <section className="topic-strip">
        <div className="site-container">
          <span>UNA VISIÓN CONECTADA</span>
          <p>
            <Globe2 size={18} /> Comercio responsable
          </p>
          <span className="topic-divider" />
          <p>
            <Fingerprint size={18} /> Trazabilidad
          </p>
          <span className="topic-divider" />
          <p>
            <Sprout size={18} /> Sostenibilidad
          </p>
        </div>
      </section>
      <section id="contenido" className="benefits site-container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">MENOS INCERTIDUMBRE. MÁS PERSPECTIVA.</div>
            <h2>
              Entender el contexto.
              <br />
              <em>Preparar el siguiente paso.</em>
            </h2>
          </div>
          <p>
            Un punto de partida para explorar la relación entre información,
            origen y decisiones comerciales.
          </p>
        </div>
        <div className="benefit-grid">
          {[
            {
              icon: BookOpen,
              number: "01",
              title: "Una mirada al contexto",
              text: "Explorá los temas EUDR que orientan la conversación sobre cadenas de suministro responsables.",
            },
            {
              icon: Fingerprint,
              number: "02",
              title: "El valor de la trazabilidad",
              text: "Conectá el origen de los productos con la información que acompaña cada etapa de la cadena.",
            },
            {
              icon: Leaf,
              number: "03",
              title: "De la lectura a la conversación",
              text: "Identificá preguntas para compartir con tu equipo y organizar una primera conversación técnica.",
            },
          ].map(({ icon: Icon, number, title, text }) => (
            <article className="benefit-card" key={number}>
              <div className="benefit-top">
                <Icon size={25} strokeWidth={1.5} />
                <span>{number}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="demo-disclosure">
          <FileText size={17} />
          <p>
            <strong>Una experiencia de demostración.</strong> El documento es
            una muestra académica; no sustituye el informe del proyecto ni
            constituye asesoramiento normativo.
          </p>
          <a href="#/registro">
            Explorar el reporte <ArrowRight size={16} />
          </a>
        </div>
      </section>
      <section className="bottom-cta site-container">
        <div>
          <div className="eyebrow">TU PRÓXIMO PASO EMPIEZA ACÁ</div>
          <h2>
            Una mejor decisión
            <br />
            comienza con una nueva mirada.
          </h2>
        </div>
        <a href="#/registro" className="button light">
          Quiero acceder al reporte <ArrowUpRight size={19} />
        </a>
        <Leaf className="cta-leaf" size={175} strokeWidth={0.5} />
      </section>
    </main>
  );
}

type CaptureFields = Pick<
  Lead,
  "name" | "email" | "company" | "role" | "marketing"
>;
export function Capture({
  submit,
  privacy,
}: {
  submit: (fields: CaptureFields) => void;
  privacy: () => void;
}) {
  const [values, setValues] = useState<CaptureFields>({
    name: "",
    email: "",
    company: "",
    role: "",
    marketing: false,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CaptureFields, string>>
  >({});
  function send(event: FormEvent) {
    event.preventDefault();
    const clean = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      company: values.company.trim(),
      role: values.role.trim(),
    };
    const next: typeof errors = {};
    if (clean.name.length < 3)
      next.name = "Ingresá tu nombre y apellido (al menos 3 caracteres).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email))
      next.email = "Ingresá un correo válido, por ejemplo nombre@empresa.test.";
    if (!clean.company) next.company = "Ingresá el nombre de tu empresa.";
    if (!clean.role) next.role = "Ingresá tu cargo o puesto.";
    setErrors(next);
    if (Object.keys(next).length) {
      setTimeout(
        () => document.getElementById(Object.keys(next)[0])?.focus(),
        0,
      );
      return;
    }
    submit(clean);
  }
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="capture-page site-container"
    >
      <a href="#/" className="back-link">
        <ArrowLeft size={16} /> Volver al reporte
      </a>
      <div className="capture-layout">
        <aside className="capture-aside">
          <div className="eyebrow">CONOCIMIENTO QUE CONECTA</div>
          <h2>
            Una mirada más clara.
            <br />
            <em>Un paso más cerca.</em>
          </h2>
          <p>Dejanos tus datos y accedé al documento de muestra.</p>
          <div className="mini-report">
            <ReportCover compact />
          </div>
          <div className="aside-points">
            <span>
              <Check size={16} /> Acceso gratuito e inmediato
            </span>
            <span>
              <Check size={16} /> Sin suscripciones obligatorias
            </span>
            <span>
              <Check size={16} /> Documento PDF de demostración
            </span>
          </div>
        </aside>
        <section className="capture-card">
          <div className="form-step">
            01 <span>/</span> 02{" "}
            <span className="form-step-label">ACCESO AL REPORTE</span>
          </div>
          <h1 tabIndex={-1}>El primer paso es conectar.</h1>
          <p className="muted">
            Completá el formulario para acceder al reporte gratuito.
          </p>
          <div className="inline-note">
            <ShieldCheck size={17} />
            <span>
              Prototipo académico: utilizá únicamente datos ficticios.
            </span>
          </div>
          <form onSubmit={send} noValidate>
            <div className="form-fields">
              {(
                [
                  [
                    "name",
                    "Nombre y apellido",
                    "Ej. Alex Pérez",
                    "text",
                    "name",
                  ],
                  [
                    "email",
                    "Correo electrónico corporativo",
                    "alex@empresa.test",
                    "email",
                    "email",
                  ],
                  [
                    "company",
                    "Empresa",
                    "Ej. Origen Exportadora",
                    "text",
                    "organization",
                  ],
                  [
                    "role",
                    "Cargo o puesto",
                    "Ej. Responsable de sostenibilidad",
                    "text",
                    "organization-title",
                  ],
                ] as const
              ).map(([key, label, placeholder, type, autocomplete]) => (
                <div className="field" key={key}>
                  <label htmlFor={key}>
                    {label} <span>*</span>
                  </label>
                  <input
                    id={key}
                    type={type}
                    required
                    autoComplete={autocomplete}
                    maxLength={key === "email" ? 254 : 120}
                    placeholder={placeholder}
                    value={values[key]}
                    aria-invalid={!!errors[key]}
                    aria-describedby={errors[key] ? `${key}-error` : undefined}
                    onChange={(event) => {
                      setValues((previous) => ({
                        ...previous,
                        [key]: event.target.value,
                      }));
                      setErrors((previous) => ({
                        ...previous,
                        [key]: undefined,
                      }));
                    }}
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
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={values.marketing}
                onChange={(event) =>
                  setValues((previous) => ({
                    ...previous,
                    marketing: event.target.checked,
                  }))
                }
              />
              <span>
                Quiero recibir novedades y comunicaciones comerciales.{" "}
                <small>
                  Opcional. No se enviarán mensajes reales en esta demo.
                </small>
              </span>
            </label>
            <p className="privacy-note">
              Usamos estos datos para simular el acceso al reporte y su gestión
              en el CRM. Se guardan solo en este navegador. Podés consultarlos,
              corregirlos o eliminarlos desde el CRM.{" "}
              <button type="button" onClick={privacy}>
                Aviso de privacidad · Ley 25.326
              </button>
              .
            </p>
            <button type="submit" className="button full-width">
              Acceder al reporte <ArrowRight size={18} />
            </button>
            <p className="form-security">
              <LockKeyhole size={13} /> Sin envío de datos a servicios externos
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}

export function ThankYou({
  lead,
  book,
}: {
  lead?: Lead;
  book: (meeting: { date: string; time: string }) => void;
}) {
  const [booking, setBooking] = useState(false);
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
      <div className="eyebrow">UN NUEVO PUNTO DE PARTIDA</div>
      <h1 tabIndex={-1}>¡Gracias por tu interés!</h1>
      <p className="thanks-intro">
        {lead ? `${lead.name.split(" ")[0]}, tu registro está completo. ` : ""}
        Tu reporte de muestra ya está disponible.
        <br />
        El próximo paso está en tus manos.
      </p>
      {!lead && (
        <div className="guest-note">
          Estás viendo la confirmación en modo exploración.{" "}
          <a href="#/registro">Registrá un contacto</a> para vincularlo al CRM y
          reservar una reunión.
        </div>
      )}
      <div className="thanks-cards">
        <section className="download-card">
          <div className="card-kicker">
            <FileText size={18} /> TU DOCUMENTO
          </div>
          <div className="download-body">
            <div className="download-cover">
              <ReportCover compact />
            </div>
            <div>
              <span className="pill neutral">MUESTRA ACADÉMICA</span>
              <h2>
                El futuro crece
                <br />
                desde el origen.
              </h2>
              <p>
                Reporte EUDR · Documento PDF
                <br />
                Material ilustrativo, sin datos normativos.
              </p>
            </div>
          </div>
          <a
            className="button full-width"
            href="/reporte-eudr-demostracion.pdf"
            download="Silva-EUDR-Demostracion.pdf"
            onClick={() => setDownloaded(true)}
          >
            {downloaded ? "Volver a descargar reporte" : "Descargar reporte"}{" "}
            <ArrowDownToLine size={18} />
          </a>
          {downloaded && (
            <p className="download-notice" role="status">
              <Check size={14} /> Descarga solicitada. Revisá las descargas del
              navegador.
            </p>
          )}
        </section>
        <section className="meeting-card">
          <div className="card-kicker">
            <CalendarDays size={18} /> SIGAMOS LA CONVERSACIÓN
          </div>
          <div className="meeting-graphic">
            <CalendarDays size={37} strokeWidth={1.2} />
            <span>
              <Check size={15} />
            </span>
          </div>
          <h2>
            Convertí tus preguntas
            <br />
            en próximos pasos.
          </h2>
          <p>
            Explorá cómo sería una primera conversación con nuestro equipo
            técnico.
          </p>
          {lead?.meeting && (
            <p className="booking-summary">
              <CheckCircle2 size={15} /> Reserva simulada:{" "}
              {lead.meeting.date.split("-").reverse().join("/")} ·{" "}
              {lead.meeting.time}
            </p>
          )}
          <button
            className="button secondary full-width"
            onClick={() => setBooking(true)}
          >
            Agendar reunión con nuestro equipo técnico{" "}
            <ArrowUpRight size={17} />
          </button>
          <small>Reserva simulada · Sin invitación real</small>
        </section>
      </div>
      <div className="next-steps">
        <span className="eyebrow">¿QUÉ SIGUE?</span>
        <div>
          <span>01</span>
          <p>
            <strong>Explorá el documento</strong>Guardá la muestra para recorrer
            sus contenidos.
          </p>
        </div>
        <div>
          <span>02</span>
          <p>
            <strong>Conectá con el equipo</strong>Elegí una fecha para simular
            una conversación.
          </p>
        </div>
        <div>
          <span>03</span>
          <p>
            <strong>Descubrí el otro lado</strong>Seguí tu contacto desde el
            espacio comercial.
          </p>
        </div>
      </div>
      <a href="#/crm" className="crm-entry">
        Ver el contacto en el dashboard CRM <ArrowRight size={17} />
      </a>
      {booking && (
        <BookingModal lead={lead} close={() => setBooking(false)} book={book} />
      )}
    </main>
  );
}

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
function BookingModal({
  lead,
  close,
  book,
}: {
  lead?: Lead;
  close: () => void;
  book: (meeting: { date: string; time: string }) => void;
}) {
  const dates = Array.from(
    { length: 5 },
    (_, i) =>
      new Date(
        new Date(`${dateKey(new Date())}T12:00:00-03:00`).getTime() +
          (i + 1) * 86400000,
      ),
  );
  const [date, setDate] = useState(dateKey(dates[0]));
  const [time, setTime] = useState("");
  const [done, setDone] = useState(false);
  return (
    <Modal
      title={
        done
          ? "Tu reserva de demostración"
          : "Conversemos sobre el próximo paso"
      }
      close={close}
    >
      {!lead ? (
        <>
          <p className="muted">
            Primero registrá un contacto ficticio para vincular la reserva con
            su ficha en el CRM.
          </p>
          <a className="button" href="#/registro" onClick={close}>
            Completar registro <ArrowRight size={16} />
          </a>
        </>
      ) : done ? (
        <div className="booking-done">
          <CheckCircle2 size={50} />
          <h3>¡Reserva simulada confirmada!</h3>
          <p>
            {date.split("-").reverse().join("/")} a las {time}
            <br />
            Horario de Buenos Aires (UTC−3) · 30 minutos
          </p>
          <div className="inline-note">
            Esta reserva se guardó en la ficha local de {lead.name}. No se creó
            una reunión real ni se enviaron invitaciones.
          </div>
          <button className="button full-width" onClick={close}>
            Entendido <Check size={17} />
          </button>
        </div>
      ) : (
        <>
          <p className="muted">
            Seleccioná un día y un horario para una conversación de 30 minutos.
            Todos los horarios son ficticios.
          </p>
          <fieldset className="booking-fieldset">
            <legend>1. Elegí un día</legend>
            <div className="date-options">
              {dates.map((day) => (
                <button
                  key={dateKey(day)}
                  className={date === dateKey(day) ? "selected" : ""}
                  aria-pressed={date === dateKey(day)}
                  onClick={() => {
                    setDate(dateKey(day));
                    setTime("");
                  }}
                >
                  <span>
                    {new Intl.DateTimeFormat("es-AR", {
                      weekday: "short",
                    }).format(day)}
                  </span>
                  <strong>{day.getDate()}</strong>
                  <span>
                    {new Intl.DateTimeFormat("es-AR", {
                      month: "short",
                    }).format(day)}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="booking-fieldset">
            <legend>2. Elegí un horario</legend>
            <div className="time-options">
              {["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"].map(
                (slot) => (
                  <button
                    className={time === slot ? "selected" : ""}
                    aria-pressed={time === slot}
                    key={slot}
                    onClick={() => setTime(slot)}
                  >
                    <Clock3 size={14} />
                    {slot}
                  </button>
                ),
              )}
            </div>
          </fieldset>
          <p className="form-security">
            <Globe2 size={14} /> Buenos Aires (UTC−3) · Sin videollamada real
          </p>
          <button
            className="button full-width"
            disabled={!time}
            onClick={() => {
              book({ date, time });
              setDone(true);
            }}
          >
            Confirmar reserva simulada <ChevronRight size={18} />
          </button>
        </>
      )}
    </Modal>
  );
}
