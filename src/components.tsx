import { useEffect, useRef, type ReactNode } from "react";
import { ArrowUpRight, Leaf, X } from "lucide-react";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`brand solidarity-brand ${light ? "brand-light" : ""}`}
      href="#/"
      aria-label="Solidaridad LATAM, inicio"
    >
      <span className="solidarity-wordmark">
        solidaridad<span>.</span>
        <small>LATINOAMÉRICA</small>
      </span>
    </a>
  );
}

export function Modal({
  title,
  children,
  close,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
  wide?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const onClose = useRef(close);
  onClose.current = close;
  useEffect(() => {
    const element = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    element.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = old;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`modal ${wide ? "modal-wide" : ""}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose.current();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="modal-content">
        <div className="modal-heading">
          <h2 id="dialog-title">{title}</h2>
          <button
            className="icon-button"
            onClick={close}
            aria-label="Cerrar ventana"
          >
            <X size={21} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export function ReportCover({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`report-cover ${compact ? "compact" : ""}`}
      aria-label="Portada del documento EUDR de demostración"
    >
      <div className="cover-top">
        <Leaf size={23} />
        <span>SOLIDARIDAD LATAM</span>
        <ArrowUpRight size={20} />
      </div>
      <div className="cover-title">
        <span>RECURSO PILOTO · EUDR</span>
        <h2>
          Preparar
          <br />
          el futuro,
          <br />
          <em>desde el origen.</em>
        </h2>
        <p>
          EUDR · Trazabilidad y cadenas
          <br />
          de suministro responsables
        </p>
      </div>
      <div className="forest-art" aria-hidden="true">
        <div className="forest-orbit" />
        {Array.from({ length: 17 }, (_, i) => (
          <i key={i} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
      <div className="cover-bottom">
        <span>MUESTRA ACADÉMICA</span>
        <span>NO ES UN INFORME OFICIAL</span>
      </div>
    </div>
  );
}

export function PrivacyText() {
  return (
    <div className="prose">
      <p>
        Esta es una demostración académica. Usá datos ficticios: la información
        se guarda únicamente en el LocalStorage de este navegador y no se
        transmite a un servidor.
      </p>
      <h3>Finalidad y consentimiento</h3>
      <p>
        Los datos permiten simular el acceso al reporte, registrar un contacto y
        mostrar su seguimiento institucional. Se solicita consentimiento
        obligatorio para este tratamiento local. La casilla independiente de
        comunicaciones es opcional, empieza desmarcada y no condiciona la
        descarga. No se envían correos ni comunicaciones reales.
      </p>
      <h3>Acceso, rectificación y supresión</h3>
      <p>
        Como referencia a los derechos previstos por la Ley argentina 25.326,
        podés consultar tus datos en la ficha del CRM o eliminarlos junto con su
        actividad. Para rectificarlos, eliminá el contacto y volvé a
        registrarlo. “Reiniciar demo” borra todos los contactos ingresados y
        restaura los ejemplos. El almacenamiento persiste hasta su eliminación o
        la limpieza del navegador.
      </p>
      <h3>Antes de un uso real</h3>
      <p>
        Este prototipo académico toma como referencia a Solidaridad LATAM y no
        es una herramienta oficial ni está conectado con la organización. Un
        despliegue productivo requiere identificar al responsable del
        tratamiento y sus canales de contacto, informar destinatarios y plazos
        de conservación, e implementar seguridad y atención de derechos. Este
        aviso no certifica cumplimiento legal.
      </p>
    </div>
  );
}
