export const stages = ["Lead", "MQL", "SQL"] as const;
export const statuses = [
  "Nuevo",
  "En seguimiento",
  "Reunión agendada",
  "Cerrado",
] as const;
export type Stage = (typeof stages)[number];
export type Status = (typeof statuses)[number];
export type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  createdAt: string;
  status: Status;
  stage: Stage;
  marketing: boolean;
  source: "Ejemplo" | "Formulario";
  meeting?: { date: string; time: string };
};
export type Store = { version: 1; leads: Lead[]; lastLeadId: string | null };
export const STORAGE_KEY = "silva-eudr-demo-v1";

export function seed(): Store {
  const contacts = [
    [
      "Clara Méndez",
      "Bosque Sur",
      "Responsable de sostenibilidad",
      "SQL",
      "Reunión agendada",
    ],
    [
      "Tomás Aguirre",
      "Origen Natural",
      "Gerente de operaciones",
      "MQL",
      "En seguimiento",
    ],
    [
      "Lucía Torres",
      "Raíz Exportadora",
      "Directora comercial",
      "Lead",
      "Nuevo",
    ],
    [
      "Mateo Silva",
      "Terra Insumos",
      "Analista de comercio exterior",
      "MQL",
      "En seguimiento",
    ],
    [
      "Valentina Ríos",
      "Nexo Forestal",
      "Gerenta de compras",
      "SQL",
      "En seguimiento",
    ],
    [
      "Bruno Acosta",
      "Campo Circular",
      "Coordinador de calidad",
      "Lead",
      "Nuevo",
    ],
  ];
  return {
    version: 1,
    lastLeadId: null,
    leads: contacts.map(([name, company, role, stage, status], index) => ({
      id: `example-${index}`,
      name,
      company,
      role,
      stage: stage as Stage,
      status: status as Status,
      email: `contacto${index + 1}@ejemplo.test`,
      marketing: false,
      source: "Ejemplo",
      createdAt: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
    })),
  };
}

function isLead(value: unknown): value is Lead {
  if (!value || typeof value !== "object") return false;
  const lead = value as Lead;
  return (
    ["id", "name", "email", "company", "role"].every(
      (key) => typeof lead[key as keyof Lead] === "string",
    ) &&
    stages.includes(lead.stage) &&
    statuses.includes(lead.status) &&
    ["Ejemplo", "Formulario"].includes(lead.source) &&
    typeof lead.marketing === "boolean" &&
    typeof lead.createdAt === "string" &&
    Number.isFinite(Date.parse(lead.createdAt)) &&
    (!lead.meeting ||
      (typeof lead.meeting.date === "string" &&
        typeof lead.meeting.time === "string"))
  );
}

export function loadStore(): { data: Store; warning: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: seed(), warning: "" };
    const parsed = JSON.parse(raw) as Store;
    if (
      parsed.version !== 1 ||
      !Array.isArray(parsed.leads) ||
      !parsed.leads.every(isLead) ||
      !(parsed.lastLeadId === null || typeof parsed.lastLeadId === "string")
    )
      throw new Error("invalid");
    return { data: parsed, warning: "" };
  } catch {
    return {
      data: seed(),
      warning:
        "No se pudieron recuperar los datos locales. Se cargó una nueva demostración.",
    };
  }
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(date));
}
export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
