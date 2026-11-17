import { expect, test, type Page } from "@playwright/test";

async function register(page: Page, name = "Alex Pérez") {
  await page.goto("/#/registro");
  await page.getByLabel("Nombre y apellido").fill(name);
  await page
    .getByLabel("Correo electrónico corporativo")
    .fill("alex@origen.test");
  await page.getByLabel(/^Empresa/).fill("Origen Demo");
  await page.getByLabel("Cargo o puesto").fill("Responsable de sostenibilidad");
  await page.getByRole("button", { name: "Acceder al reporte" }).click();
  await expect(
    page.getByRole("heading", { name: "¡Gracias por tu interés!" }),
  ).toBeVisible();
}

test("recorrido, clasificación, indicadores, búsqueda, filtros y persistencia", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "El origen importa.",
  );
  await page.getByRole("link", { name: "Descargar reporte gratuito" }).click();
  await expect(
    page.getByRole("heading", { name: "El primer paso es conectar." }),
  ).toBeVisible();
  await page.getByLabel("Nombre y apellido").fill("Alex Pérez");
  await page
    .getByLabel("Correo electrónico corporativo")
    .fill("alex@origen.test");
  await page.getByLabel(/^Empresa/).fill("Origen Demo");
  await page.getByLabel("Cargo o puesto").fill("Responsable");
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await page.getByRole("button", { name: "Acceder al reporte" }).click();
  await expect(
    page.getByRole("heading", { name: "¡Gracias por tu interés!" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Ver el contacto en el dashboard CRM" })
    .click();
  await expect(page.locator(".stat-card").nth(0)).toContainText("7");
  await expect(page.locator(".stat-card").nth(1)).toContainText("3");
  const row = page.getByRole("row").filter({ hasText: "Alex Pérez" });
  await expect(row).toContainText("Desde formulario");
  await row.getByRole("combobox").selectOption("MQL");
  await expect(page.locator(".stat-card").nth(2)).toContainText("3");
  await row.getByRole("combobox").selectOption("SQL");
  await expect(page.locator(".stat-card").nth(3)).toContainText("3");
  await expect(page.locator(".stat-card").nth(2)).toContainText("2");
  await expect(page.locator(".donut")).toHaveAttribute(
    "aria-label",
    "71% de contactos en MQL o SQL",
  );
  await page.getByRole("textbox", { name: "Buscar leads" }).fill("origen demo");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page
    .getByRole("combobox", { name: "Filtrar por estado" })
    .selectOption("En seguimiento");
  await expect(page.getByText("No encontramos contactos")).toBeVisible();
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(7);
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Clasificación de Alex Pérez" }),
  ).toHaveValue("SQL");
  expect(errors).toEqual([]);
});

test("validación, privacidad y consentimiento opcional", async ({ page }) => {
  await page.goto("/#/registro");
  await page.getByRole("button", { name: "Acceder al reporte" }).click();
  await expect(page.getByRole("alert")).toHaveCount(4);
  await expect(page.getByLabel("Nombre y apellido")).toBeFocused();
  await page
    .getByLabel("Correo electrónico corporativo")
    .fill("correo-invalido");
  await page.getByRole("button", { name: "Acceder al reporte" }).click();
  await expect(
    page.getByText("Ingresá un correo válido", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Aviso de privacidad" }).click();
  await expect(page.getByRole("dialog")).toContainText("Ley argentina 25.326");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Aviso de privacidad" }),
  ).toBeFocused();
  const leads = await page.evaluate(
    () => JSON.parse(localStorage.getItem("silva-eudr-demo-v1")!).leads,
  );
  expect(leads).toHaveLength(6);
});

test("PDF local válido, reserva simulada y ficha de contacto", async ({
  page,
  request,
}) => {
  await register(page);
  const response = await request.get("/reporte-eudr-demostracion.pdf");
  expect(response.status()).toBe(200);
  expect((await response.body()).subarray(0, 8).toString()).toBe("%PDF-1.4");
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "Descargar reporte", exact: true })
    .click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("Silva-EUDR-Demostracion.pdf");
  expect(await download.failure()).toBeNull();
  await page
    .getByRole("button", { name: "Agendar reunión con nuestro equipo técnico" })
    .click();
  await expect(
    page.getByRole("button", { name: "Confirmar reserva simulada" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "10:30", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirmar reserva simulada" })
    .click();
  await expect(
    page.getByRole("heading", { name: "¡Reserva simulada confirmada!" }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText(
    "No se creó una reunión real",
  );
  await page.getByRole("button", { name: "Entendido" }).click();
  await page
    .getByRole("link", { name: "Ver el contacto en el dashboard CRM" })
    .click();
  await page.getByRole("button", { name: "Ver ficha de Alex Pérez" }).click();
  await expect(page.getByRole("dialog")).toContainText("10:30");
  await expect(page.getByLabel("Estado", { exact: true })).toHaveValue(
    "Reunión agendada",
  );
  await page.getByLabel(/^Empresa/).fill("Origen Actualizado");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await page.reload();
  await expect(
    page.getByRole("row").filter({ hasText: "Alex Pérez" }),
  ).toContainText("Origen Actualizado");
});

test("exportación, supresión de contacto y reinicio confirmado", async ({
  page,
}) => {
  await register(page);
  await page.goto("/#/crm");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV" }).click();
  expect((await downloadEvent).suggestedFilename()).toBe(
    "silva-contactos-demostracion.csv",
  );
  await page.getByRole("button", { name: "Ver ficha de Alex Pérez" }).click();
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await page.getByRole("button", { name: "Sí, eliminar" }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "Alex Pérez" }),
  ).toHaveCount(0);
  await register(page, "Alex Nuevo");
  await page.getByRole("button", { name: "Reiniciar demo" }).click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.goto("/#/crm");
  await expect(page.locator("tbody tr")).toHaveCount(7);
  await page.getByRole("button", { name: "Reiniciar demo" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reiniciar demo" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "El origen importa.",
  );
  await page.goto("/#/crm");
  await expect(page.locator("tbody tr")).toHaveCount(6);
  await page.reload();
  await expect(
    page.getByRole("row").filter({ hasText: "Alex Nuevo" }),
  ).toHaveCount(0);
});

test("cuatro pantallas responsive y recorrido sin servicios externos", async ({
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
  for (const label of ["Registro", "Confirmación", "CRM", "Reporte"]) {
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
  await context.setOffline(true);
  await page.getByRole("link", { name: "Descargar reporte gratuito" }).click();
  await page.getByLabel("Nombre y apellido").fill("Prueba Offline");
  await page
    .getByLabel("Correo electrónico corporativo")
    .fill("offline@ejemplo.test");
  await page.getByLabel(/^Empresa/).fill("Sin Red");
  await page.getByLabel("Cargo o puesto").fill("Analista");
  await page.getByRole("button", { name: "Acceder al reporte" }).click();
  await page
    .getByRole("link", { name: "Ver el contacto en el dashboard CRM" })
    .click();
  await expect(
    page.getByRole("row").filter({ hasText: "Prueba Offline" }),
  ).toBeVisible();
  expect(external).toEqual([]);
});

test("almacenamiento dañado se recupera sin pantalla en blanco", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("silva-eudr-demo-v1", "{no-es-json"),
  );
  await page.goto("/#/crm");
  await expect(page.getByRole("alert")).toContainText(
    "No se pudieron recuperar",
  );
  await expect(page.locator("tbody tr")).toHaveCount(6);
});
