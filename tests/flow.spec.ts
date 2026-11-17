import { expect, test, type Page } from "@playwright/test";
import { scoreLead, seed, type Interaction } from "../src/data";

const KEY = "solidaridad-hub-v1";
async function fillForm(page: Page, email = "alex@origen.test") {
  await page.getByLabel(/^Nombre/).fill("Alex");
  await page.getByLabel(/^Apellido/).fill("Pérez");
  await page.getByLabel("Correo electrónico corporativo").fill(email);
  await page
    .getByLabel("Organización o empresa")
    .fill("Cooperativa Origen Demo");
  await page.getByLabel("Sector productivo").selectOption("Café y cacao");
  await page.getByRole("checkbox", { name: "Acepto el tratamiento" }).check();
}
async function register(page: Page, email = "alex@origen.test") {
  await page.goto("/#/registro");
  await fillForm(page, email);
  await page.getByRole("button", { name: "Acceder al informe" }).click();
  await expect(
    page.getByRole("heading", { name: "¡Gracias, Alex!" }),
  ).toBeVisible();
}
test("recorrido institucional completo: UTM, PDF, MQL, reunión, SQL, historial y derivación", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(
    "/?utm_source=linkedin&utm_medium=social&utm_campaign=demo-eudr#/",
  );
  await page.getByRole("link", { name: "Descargar informe técnico" }).click();
  await fillForm(page);
  await expect(
    page.getByRole("checkbox", { name: "Quiero recibir" }),
  ).not.toBeChecked();
  await page.getByRole("button", { name: "Acceder al informe" }).click();
  await expect(
    page.getByRole("heading", { name: "¡Gracias, Alex!" }),
  ).toBeVisible();
  const response = await request.get("/informe-eudr-demostracion.pdf");
  expect(response.status()).toBe(200);
  expect((await response.body()).subarray(0, 8).toString()).toBe("%PDF-1.4");
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Descargar informe", exact: true })
    .click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("EUDR-Muestra-Academica.pdf");
  expect(await download.failure()).toBeNull();
  await page
    .getByRole("button", { name: "Solicitar reunión técnica", exact: true })
    .click();
  await page
    .getByLabel("¿Qué te gustaría conversar?")
    .fill("Trazabilidad de la cadena de café.");
  await page.getByRole("button", { name: "Registrar solicitud" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "No se reservó un horario",
  );
  await page.getByRole("button", { name: "Entendido" }).click();
  await page
    .getByRole("link", { name: "Ver contacto e historial en el CRM" })
    .click();
  await expect(
    page.getByRole("article", { name: "Leads captados" }),
  ).toContainText("19");
  const row = page.getByRole("row").filter({ hasText: "Alex Pérez" });
  await expect(row).toContainText("Desde formulario");
  await expect(row).toContainText("MQL");
  await expect(row).toContainText("90 / 100");
  await expect(row.getByRole("combobox")).toHaveValue("Reunión solicitada");
  await page.getByRole("button", { name: "Ver ficha de Alex Pérez" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("demo-eudr");
  await expect(dialog).toContainText("linkedin / social");
  await expect(dialog).toContainText("Trazabilidad de la cadena de café.");
  await page.getByRole("checkbox", { name: "Aceptado por Programas" }).check();
  await expect(dialog.locator(".contact-detail-heading")).toContainText(
    "SQL · 100/100",
  );
  await page
    .getByLabel("Nota de seguimiento")
    .fill("Revisar el contexto con la coordinación regional.");
  await page.getByRole("button", { name: "Agregar nota" }).click();
  await expect(dialog).toContainText(
    "Revisar el contexto con la coordinación regional.",
  );
  await page
    .getByRole("button", { name: "Derivar a Programas", exact: true })
    .click();
  await expect(
    page.getByLabel("Estado operativo", { exact: true }),
  ).toHaveValue("Derivado a Programas");
  await page.getByRole("button", { name: "Cerrar ventana" }).click();
  await page.reload();
  await expect(row).toContainText("SQL");
  await expect(row.getByRole("combobox")).toHaveValue("Derivado a Programas");
  await page.getByRole("button", { name: "Ver ficha de Alex Pérez" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Revisar el contexto con la coordinación regional.",
  );
  expect(errors).toEqual([]);
});
test("validación por campo, consentimiento obligatorio y bloqueo de correo duplicado", async ({
  page,
}) => {
  await page.goto("/#/registro");
  await page.getByRole("button", { name: "Acceder al informe" }).click();
  await expect(page.getByRole("alert")).toHaveCount(6);
  await expect(page.getByLabel(/^Nombre/)).toBeFocused();
  await page
    .getByLabel("Correo electrónico corporativo")
    .fill("correo-invalido");
  await page.getByLabel("Correo electrónico corporativo").blur();
  await expect(
    page.getByText("Ingresá un correo corporativo con formato válido."),
  ).toBeVisible();
  await fillForm(page);
  await page.getByRole("checkbox", { name: "Acepto el tratamiento" }).uncheck();
  await page.getByRole("button", { name: "Acceder al informe" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Necesitamos tu consentimiento",
  );
  await page.getByRole("button", { name: "Aviso de privacidad" }).click();
  await expect(page.getByRole("dialog")).toContainText("Ley argentina 25.326");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Aviso de privacidad" }),
  ).toBeFocused();
  await page.getByRole("checkbox", { name: "Acepto el tratamiento" }).check();
  await page.getByRole("button", { name: "Acceder al informe" }).dblclick();
  await expect(
    page.getByRole("heading", { name: "¡Gracias, Alex!" }),
  ).toBeVisible();
  await page.goto("/#/registro");
  await fillForm(page);
  await page.getByRole("button", { name: "Acceder al informe" }).click();
  await expect(page.getByRole("alert")).toContainText("Ya existe un contacto");
  expect(
    await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).leads.filter(
          (lead: { email: string }) => lead.email === "alex@origen.test",
        ).length,
      KEY,
    ),
  ).toBe(1);
});
test("filtros, ordenamiento, cambios inmediatos y calificación independiente del estado", async ({
  page,
}) => {
  await register(page);
  await page.goto("/#/crm");
  const search = page.getByRole("textbox", {
    name: "Buscar por nombre o empresa",
  });
  await search.fill("cooperativa origen");
  await expect(page.locator("#contacts tbody tr")).toHaveCount(1);
  const row = page.getByRole("row").filter({ hasText: "Alex Pérez" });
  await expect(row).toContainText("Lead");
  await row.getByRole("combobox").selectOption("SQL");
  await expect(row).toContainText("Lead");
  await page
    .getByRole("combobox", { name: "Filtrar por estado" })
    .selectOption("Contactado");
  await expect(page.getByText("No encontramos contactos")).toBeVisible();
  await page
    .getByRole("button", { name: "Limpiar filtros", exact: true })
    .first()
    .click();
  await page
    .getByRole("combobox", { name: "Filtrar por sector" })
    .selectOption("Café y cacao");
  await expect(page.locator("#contacts tbody tr")).toHaveCount(4);
  await page
    .getByRole("combobox", { name: "Filtrar por calificación" })
    .selectOption("Lead");
  await expect(page.locator("#contacts tbody tr")).not.toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Ordenar por fecha" })
    .selectOption("asc");
  await expect(page.locator("#contacts tbody tr").first()).toContainText(
    "Mateo Silva",
  );
  await page
    .getByRole("button", { name: "Limpiar filtros", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Ordenar por fecha" })
    .selectOption("desc");
  await expect(page.locator("#contacts tbody tr").first()).toContainText(
    "Alex Pérez",
  );
  await page.reload();
  await expect(row.getByRole("combobox")).toHaveValue("SQL");
  await expect(row).toContainText("Lead");
});
test("umbrales configurables validados, recálculo automático y persistencia", async ({
  page,
}) => {
  await register(page);
  await page
    .getByRole("link", { name: "Descargar informe", exact: true })
    .click();
  await page.goto("/#/crm");
  const row = page.getByRole("row").filter({ hasText: "Alex Pérez" });
  await expect(row).toContainText("MQL");
  await page.getByRole("button", { name: "Criterios de calificación" }).click();
  await page.getByLabel("Umbral MQL").fill("95");
  await page.getByLabel("Umbral SQL").fill("90");
  await page.getByRole("button", { name: "Aplicar criterios" }).click();
  await expect(page.getByRole("alert")).toContainText("1 ≤ MQL < SQL ≤ 100");
  await page.getByLabel("Umbral MQL").fill("70");
  await page.getByRole("button", { name: "Aplicar criterios" }).click();
  await expect(row).toContainText("Lead");
  await page.reload();
  await expect(row).toContainText("Lead");
  await page.getByRole("button", { name: "Criterios de calificación" }).click();
  await expect(page.getByLabel("Umbral MQL")).toHaveValue("70");
});
test("campaña UTM local, métricas de eventos y navegación sin doble conteo", async ({
  page,
}) => {
  await page.goto("/#/crm");
  await page.getByRole("button", { name: "Simular campaña" }).click();
  await page.getByLabel("Fuente · utm_source").fill("alianza-demo");
  await page.getByLabel("Medio · utm_medium").fill("boletin");
  await page.getByLabel("Campaña · utm_campaign").fill("trazabilidad");
  await page.getByRole("link", { name: "Probar el recorrido con UTM" }).click();
  await page.getByRole("link", { name: "Descargar informe técnico" }).click();
  await fillForm(page);
  await page.getByRole("button", { name: "Acceder al informe" }).click();
  await page
    .getByRole("link", { name: "Ver contacto e historial en el CRM" })
    .click();
  const sourceRow = page
    .locator("#attribution tbody tr")
    .filter({ hasText: "alianza-demo" });
  await expect(sourceRow).toContainText("100%");
  await expect(
    page.getByRole("article", { name: "Visitas a la landing" }),
  ).toContainText("73");
  await page.reload();
  await expect(
    page.getByRole("article", { name: "Visitas a la landing" }),
  ).toContainText("73");
  await page
    .getByRole("navigation", { name: "Recorrido de presentación" })
    .getByRole("link", { name: "Informe" })
    .click();
  await page
    .getByRole("navigation", { name: "Recorrido de presentación" })
    .getByRole("link", { name: "CRM" })
    .click();
  await expect(
    page.getByRole("article", { name: "Visitas a la landing" }),
  ).toContainText("73");
  await page.goto("/?utm_medium=email&utm_campaign=solo-medio#/");
  await page.getByRole("link", { name: "Descargar informe técnico" }).click();
  await fillForm(page, "medio@ejemplo.test");
  await page.getByRole("button", { name: "Acceder al informe" }).click();
  const attribution = await page.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key)!);
    return data.leads.find(
      (lead: { id: string }) => lead.id === data.lastLeadId,
    ).attribution;
  }, KEY);
  expect(attribution).toEqual({
    source: "Sin atribución",
    medium: "email",
    campaign: "solo-medio",
  });
});
test("exportación, supresión, reinicio y cuatro pantallas responsive", async ({
  page,
}) => {
  await register(page);
  await page.goto("/#/crm");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV" }).click();
  expect((await downloadEvent).suggestedFilename()).toBe(
    "hub-aliados-demostracion.csv",
  );
  await page.getByRole("button", { name: "Ver ficha de Alex Pérez" }).click();
  await page
    .getByRole("button", { name: "Eliminar contacto y actividad" })
    .click();
  await page.getByRole("button", { name: "Sí, eliminar" }).click();
  await expect(page.locator("#contacts tbody tr")).toHaveCount(18);
  await page.getByRole("button", { name: "Reiniciar demo" }).click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.getByRole("button", { name: "Reiniciar demo" }).click();
  await page.getByRole("button", { name: "Restaurar datos" }).click();
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const label of ["Registro", "Confirmación", "CRM", "Informe"]) {
      await page
        .getByRole("navigation", { name: "Recorrido de presentación" })
        .getByRole("link", { name: label })
        .click();
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBeTruthy();
    }
  }
  await page.goto("/#/crm");
  await expect(page.locator("#contacts tbody tr")).toHaveCount(18);
  await expect(page.locator("#contacts tbody")).not.toContainText("Alex Pérez");
});
test("sin servicios externos y recuperación de almacenamiento dañado", async ({
  page,
  context,
}) => {
  const external: string[] = [];
  page.on("request", (request) => {
    if (
      !request.url().startsWith("http://127.0.0.1:5173") &&
      !request.url().startsWith("data:")
    )
      external.push(request.url());
  });
  await page.goto("/");
  await context.setOffline(true);
  await page.getByRole("link", { name: "Descargar informe técnico" }).click();
  await fillForm(page, "offline@ejemplo.test");
  await page.getByRole("button", { name: "Acceder al informe" }).click();
  await page
    .getByRole("link", { name: "Ver contacto e historial en el CRM" })
    .click();
  await expect(page.locator("#contacts tbody")).toContainText(
    "offline@ejemplo.test",
  );
  expect(external).toEqual([]);
  await context.setOffline(false);
  await page.evaluate((key) => localStorage.setItem(key, "{malformado"), KEY);
  await page.reload();
  await expect(page.getByRole("alert")).toContainText(
    "No se pudieron recuperar",
  );
  await expect(page.locator("#contacts tbody tr")).toHaveCount(18);
});
test("solicitud de reunión idempotente sin calendario", async ({ page }) => {
  await register(page);
  await page.getByRole("button", { name: "Solicitar reunión técnica" }).click();
  await expect(page.getByRole("dialog").getByRole("combobox")).toHaveCount(0);
  await page.getByRole("button", { name: "Registrar solicitud" }).click();
  await page.getByRole("button", { name: "Entendido" }).click();
  await page.getByRole("button", { name: "Ver solicitud registrada" }).click();
  await expect(page.getByRole("dialog")).toContainText("Solicitud registrada");
  await page.getByRole("button", { name: "Entendido" }).click();
  await page.reload();
  expect(
    await page.evaluate((key) => {
      const data = JSON.parse(localStorage.getItem(key)!);
      return data.events.filter(
        (event: { type: string; leadId: string }) =>
          event.type === "meeting" && event.leadId === data.lastLeadId,
      ).length;
    }, KEY),
  ).toBe(1);
});
test("puntuación exige descarga, sector, solicitud y aceptación, sin sumar repeticiones", () => {
  const data = seed();
  const lead = {
    ...data.leads[0],
    sector: "Café y cacao" as const,
    technicalAccepted: false,
  };
  const make = (type: Interaction["type"]): Interaction => ({
    id: type,
    type,
    at: new Date().toISOString(),
    leadId: lead.id,
    sessionId: lead.sessionId,
    attribution: lead.attribution,
    demo: true,
  });
  const events = [make("submit")];
  expect(scoreLead(lead, events, data.thresholds).stage).toBe("Lead");
  events.push(make("download"));
  expect(scoreLead(lead, events, data.thresholds).stage).toBe("MQL");
  events.push(make("download"));
  expect(scoreLead(lead, events, data.thresholds).score).toBe(60);
  events.push(make("meeting"));
  expect(scoreLead(lead, events, data.thresholds).stage).toBe("MQL");
  expect(
    scoreLead({ ...lead, technicalAccepted: true }, events, data.thresholds)
      .stage,
  ).toBe("SQL");
  expect(
    scoreLead(
      { ...lead, sector: "Otro", technicalAccepted: true },
      events,
      data.thresholds,
    ).stage,
  ).toBe("Lead");
});
