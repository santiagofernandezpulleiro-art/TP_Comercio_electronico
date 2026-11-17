export const sectors = [
  "Agricultura",
  "Ganadería",
  "Soja y oleaginosas",
  "Café y cacao",
  "Industria alimentaria",
  "Comercio y exportación agroindustrial",
  "Otro",
] as const;
export const statuses = [
  "Nuevo",
  "Contactado",
  "En seguimiento",
  "MQL",
  "SQL",
  "Reunión solicitada",
  "Derivado a Programas",
  "Cerrado",
] as const;
export const stages = ["Lead", "MQL", "SQL"] as const;
export type Stage = (typeof stages)[number];
export type Status = (typeof statuses)[number];
export type Sector = (typeof sectors)[number];
export const REPORT = "Preparación ante EUDR · Muestra académica";
export const STORAGE_KEY = "solidaridad-hub-v1";
export const eventNames = {
  visit: "Visita a landing",
  start: "Inicio de formulario",
  submit: "Formulario enviado",
  download: "Descarga de informe solicitada",
  meeting: "Solicitud de reunión",
  status: "Actualización de estado",
  referral: "Derivación a Programas",
  note: "Nota de seguimiento",
  review: "Revisión técnica",
  thresholds: "Configuración de puntuación",
} as const;
export type EventType = keyof typeof eventNames;
export type Attribution = { source: string; medium: string; campaign: string };
export type Interaction = {
  id: string;
  type: EventType;
  at: string;
  sessionId: string;
  leadId?: string;
  attribution: Attribution;
  detail?: string;
  demo: boolean;
};
export type Lead = {
  id: string;
  name: string;
  surname: string;
  email: string;
  company: string;
  sector: Sector;
  createdAt: string;
  status: Status;
  consent: true;
  consentAt: string;
  marketing: boolean;
  source: "Ejemplo" | "Formulario";
  report: string;
  attribution: Attribution;
  sessionId: string;
  technicalAccepted: boolean;
};
export type LeadInput = Pick<
  Lead,
  "name" | "surname" | "email" | "company" | "sector" | "marketing"
>;
export type Thresholds = { mql: number; sql: number };
export type Store = {
  version: 1;
  leads: Lead[];
  events: Interaction[];
  lastLeadId: string | null;
  thresholds: Thresholds;
};
export const fullName = (lead: Lead) => `${lead.name} ${lead.surname}`;
export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
export function formatDate(date: string, time = false) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(time ? ({ hour: "2-digit", minute: "2-digit" } as const) : {}),
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(date));
}
export function dayKey(date: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}
export function makeEvent(
  type: EventType,
  sessionId: string,
  attribution: Attribution,
  leadId?: string,
  detail?: string,
): Interaction {
  return {
    id: crypto.randomUUID(),
    type,
    at: new Date().toISOString(),
    sessionId,
    attribution,
    leadId,
    detail,
    demo: false,
  };
}
export function scoreLead(
  lead: Lead,
  events: Interaction[],
  thresholds: Thresholds,
) {
  const activity = events.filter((event) => event.leadId === lead.id);
  const downloaded = activity.some((event) => event.type === "download");
  const meeting = activity.some((event) => event.type === "meeting");
  const priority = lead.sector !== "Otro";
  const parts = [
    {
      label: "Organización declarada (no verificada)",
      points: lead.company.trim() ? 10 : 0,
      max: 10,
    },
    {
      label: "Sector prioritario de la demostración",
      points: priority ? 25 : 0,
      max: 25,
    },
    {
      label: "Formulario completado",
      points: activity.some((event) => event.type === "submit") ? 5 : 0,
      max: 5,
    },
    {
      label: "Descarga solicitada (sin sumar repeticiones)",
      points: downloaded ? 20 : 0,
      max: 20,
    },
    { label: "Interés en reunión técnica", points: meeting ? 30 : 0, max: 30 },
    {
      label: "Aceptación por Programas (simulada)",
      points: lead.technicalAccepted ? 10 : 0,
      max: 10,
    },
  ];
  const score = parts.reduce((total, part) => total + part.points, 0);
  const qualified = priority && downloaded && score >= thresholds.mql;
  const stage: Stage =
    qualified && meeting && lead.technicalAccepted && score >= thresholds.sql
      ? "SQL"
      : qualified
        ? "MQL"
        : "Lead";
  return { score, stage, parts, downloaded, meeting, priority };
}
export function readAttribution(): Attribution {
  const query = new URLSearchParams(location.search);
  const hashQuery = new URLSearchParams(location.hash.split("?")[1] || "");
  const get = (key: string) =>
    (query.get(key) || hashQuery.get(key) || "").trim().slice(0, 120);
  return {
    source: get("utm_source") || "Sin atribución",
    medium: get("utm_medium") || "No informado",
    campaign: get("utm_campaign") || "No informada",
  };
}
export function seed(): Store {
  const contacts = [
    ["Clara", "Méndez", "Bosque Sur"],
    ["Tomás", "Aguirre", "Origen Natural"],
    ["Lucía", "Torres", "Raíz Exportadora"],
    ["Mateo", "Silva", "Terra Insumos"],
    ["Valentina", "Ríos", "Nexo Agro"],
    ["Bruno", "Acosta", "Campo Circular"],
    ["Sofía", "Luna", "Cooperativa Horizonte"],
    ["Joaquín", "Paz", "Cacao del Valle"],
    ["Emma", "Vega", "Alimentos del Sur"],
    ["Nicolás", "Costa", "Semilla Andina"],
    ["Martina", "Díaz", "Red Ganadera"],
    ["Felipe", "Ruiz", "Granos del Litoral"],
    ["Julia", "Rey", "Café de Altura"],
    ["Pedro", "Sosa", "Agro Raíces"],
    ["Renata", "Gil", "Exportadora del Sol"],
    ["Santino", "León", "Cultivos Unidos"],
    ["Isabel", "Arias", "Tierra Fértil"],
    ["Benjamín", "Vidal", "Innovación Rural"],
  ];
  const result: Store = {
    version: 1,
    leads: [],
    events: [],
    lastLeadId: null,
    thresholds: { mql: 60, sql: 90 },
  };
  contacts.forEach(([name, surname, company], i) => {
    const id = `example-${i}`;
    const sessionId = `example-session-${i}`;
    const attribution = {
      source: ["linkedin", "boletín", "Sin atribución"][i % 3],
      medium: ["social", "email", "No informado"][i % 3],
      campaign: i % 3 === 2 ? "No informada" : "piloto-eudr-demo",
    };
    const timestamp =
      Date.now() -
      [17, 16, 15, 14, 12, 12, 11, 10, 9, 9, 8, 6, 5, 4, 2, 2, 1, 0][i] *
        86400000 -
      7200000 +
      i * 60000;
    const downloaded = i % 4 !== 3;
    const meeting = downloaded && i % 3 === 0;
    const accepted = meeting && i % 2 === 0;
    const lead: Lead = {
      id,
      name,
      surname,
      company,
      email: `contacto${i + 1}@ejemplo.test`,
      sector: sectors[i % sectors.length],
      createdAt: new Date(timestamp + 120000).toISOString(),
      status: meeting
        ? accepted
          ? "Derivado a Programas"
          : "Reunión solicitada"
        : i % 4 === 0
          ? "Contactado"
          : i % 2 === 0
            ? "En seguimiento"
            : "Nuevo",
      consent: true,
      consentAt: new Date(timestamp + 120000).toISOString(),
      marketing: i % 2 === 0,
      source: "Ejemplo",
      report: REPORT,
      attribution,
      sessionId,
      technicalAccepted: accepted,
    };
    result.leads.unshift(lead);
    const add = (
      type: EventType,
      offset: number,
      detail?: string,
      linked = true,
    ) =>
      result.events.push({
        id: `${id}-${type}-${offset}`,
        type,
        at: new Date(timestamp + offset).toISOString(),
        sessionId,
        leadId: linked ? id : undefined,
        attribution,
        detail,
        demo: true,
      });
    add("visit", 0);
    add("start", 60000);
    add("submit", 120000);
    if (downloaded) add("download", 180000);
    if (meeting)
      add("meeting", 240000, "Interés en una conversación sobre trazabilidad.");
    if (accepted) {
      add("review", 300000, "Aceptado por Programas en este ejemplo ficticio.");
      add("referral", 360000, "Derivación simulada al equipo de Programas.");
    }
    for (let extra = 0; extra < 3; extra++)
      result.events.push({
        id: `visit-${i}-${extra}`,
        type: "visit",
        at: new Date(timestamp - extra * 1800000).toISOString(),
        sessionId: `anonymous-${i}-${extra}`,
        attribution,
        demo: true,
      });
    if (i % 2 === 0)
      result.events.push({
        id: `abandoned-${i}`,
        type: "start",
        at: new Date(timestamp - 900000).toISOString(),
        sessionId: `anonymous-${i}-0`,
        attribution,
        demo: true,
      });
  });
  return result;
}
const isText = (value: unknown) => typeof value === "string";
const isDate = (value: unknown) =>
  isText(value) && Number.isFinite(Date.parse(value as string));
function isAttribution(value: unknown): value is Attribution {
  return (
    !!value &&
    typeof value === "object" &&
    ["source", "medium", "campaign"].every((key) =>
      isText((value as Record<string, unknown>)[key]),
    )
  );
}
function isLead(value: unknown): value is Lead {
  if (!value || typeof value !== "object") return false;
  const lead = value as Lead;
  return (
    ["id", "name", "surname", "email", "company", "report", "sessionId"].every(
      (key) => isText(lead[key as keyof Lead]),
    ) &&
    sectors.includes(lead.sector) &&
    statuses.includes(lead.status) &&
    ["Ejemplo", "Formulario"].includes(lead.source) &&
    lead.consent === true &&
    isDate(lead.consentAt) &&
    isDate(lead.createdAt) &&
    typeof lead.marketing === "boolean" &&
    typeof lead.technicalAccepted === "boolean" &&
    isAttribution(lead.attribution)
  );
}
function isEvent(value: unknown): value is Interaction {
  if (!value || typeof value !== "object") return false;
  const event = value as Interaction;
  return (
    isText(event.id) &&
    Object.hasOwn(eventNames, event.type) &&
    isDate(event.at) &&
    isText(event.sessionId) &&
    (event.leadId === undefined || isText(event.leadId)) &&
    (event.detail === undefined || isText(event.detail)) &&
    typeof event.demo === "boolean" &&
    isAttribution(event.attribution)
  );
}
export function loadStore(): { data: Store; warning: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: seed(), warning: "" };
    const data = JSON.parse(raw) as Store;
    if (
      data.version !== 1 ||
      !Array.isArray(data.leads) ||
      !data.leads.every(isLead) ||
      !Array.isArray(data.events) ||
      !data.events.every(isEvent) ||
      !(data.lastLeadId === null || isText(data.lastLeadId)) ||
      !data.thresholds ||
      !Number.isInteger(data.thresholds.mql) ||
      !Number.isInteger(data.thresholds.sql) ||
      data.thresholds.mql < 1 ||
      data.thresholds.sql <= data.thresholds.mql ||
      data.thresholds.sql > 100
    )
      throw Error("invalid");
    return { data, warning: "" };
  } catch {
    return {
      data: seed(),
      warning:
        "No se pudieron recuperar los datos locales. Se cargó una nueva demostración.",
    };
  }
}
