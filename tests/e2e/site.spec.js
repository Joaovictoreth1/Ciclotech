import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://www.google.com/maps/embed?*", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<html lang="pt-BR"><title>Mapa de teste</title><body>Mapa ilustrativo</body></html>',
    }),
  );
});

async function completeDraft(page, name = "Empresa Fictícia") {
  await page.getByLabel("Organização fictícia").fill(name);
  await page.getByLabel("CEP de exemplo").fill("01310100");
  await page.getByRole("button", { name: "Avançar" }).click();
  await page.getByText("Computação", { exact: true }).click();
  await page.getByRole("button", { name: "Avançar" }).click();
  await page.getByText("Ciência da demonstração").click();
}

test("redireciona a URL legada para a página inicial", async ({ page }) => {
  await page.goto("/ciclotech_nexus_os_enterprise_v6%20%281%29.html");
  await expect(page).toHaveURL("/");
});

test("baixa apenas o manifesto atualmente exibido na consulta", async ({
  page,
}) => {
  await page.goto("/#ledger");
  const input = page.getByRole("textbox", { name: "Código de referência" });
  const exportButton = page.getByRole("button", {
    name: "Baixar manifesto (.txt)",
  });
  await expect(exportButton).toBeHidden();
  await input.fill("CT-A1B2-C3D4");
  await input.press("Enter");
  const downloadPromise = page.waitForEvent("download");
  await exportButton.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("ciclotech-CT-A1B2-C3D4.txt");
  await input.fill("CT-1234-5678");
  await expect(exportButton).toBeHidden();
});

test("valida etapas e consulta um manifesto persistido pelo mesmo navegador", async ({
  page,
}) => {
  await page.goto("/#manifesto");
  await page.getByRole("button", { name: "Avançar" }).click();
  await expect(page.locator("#wizard-error")).toContainText(
    "Informe um nome fictício",
  );
  await expect(page.getByLabel("Organização fictícia")).toBeFocused();
  await page.getByLabel("Organização fictícia").fill("Empresa Fictícia");
  await page.getByLabel("CEP de exemplo").fill("123");
  await page.getByRole("button", { name: "Avançar" }).click();
  await expect(page.locator("#wizard-error")).toContainText("oito dígitos");
  await page.getByLabel("CEP de exemplo").fill("01310100");
  await page.getByLabel("CEP de exemplo").press("Enter");
  await expect(
    page.getByRole("heading", { name: "Inventário de Mídias" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Avançar" }).click();
  await expect(page.locator("#wizard-error")).toContainText(
    "Selecione pelo menos uma categoria",
  );
  await page.getByText("Computação", { exact: true }).click();
  await page.getByRole("button", { name: "Avançar" }).click();
  await page.getByRole("button", { name: "Salvar demonstração" }).click();
  await expect(page.locator("#wizard-error")).toContainText(
    "Confirme que entende",
  );
  await page.getByText("Ciência da demonstração").click();
  await page.getByRole("button", { name: "Salvar demonstração" }).click();
  const dialog = page.getByRole("dialog", { name: "Manifesto salvo" });
  await expect(dialog).toBeVisible();
  const reference = await dialog.locator("#hash-display").textContent();
  expect(reference).toMatch(/^CT-[0-9A-F]{4}-[0-9A-F]{4}$/);
  await dialog.getByRole("button", { name: "Consultar código" }).press("Enter");
  const lookup = page.getByRole("textbox", { name: "Código de referência" });
  await expect(lookup).toBeFocused();
  await expect(page.locator("#res-name")).toHaveText("Empresa Fictícia");
  await expect(page.locator("#res-cep")).toHaveText("01310-100");
  await page.reload();
  await lookup.fill(reference);
  await lookup.press("Enter");
  await expect(page.locator("#res-name")).toHaveText("Empresa Fictícia");
});

test("mantém o código visível após clique duplo ao salvar", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Gesto de mouse no desktop");
  await page.goto("/#manifesto");
  await completeDraft(page);
  const save = page.getByRole("button", { name: "Salvar demonstração" });
  await save.evaluate((button) =>
    button.scrollIntoView({ block: "end", behavior: "instant" }),
  );
  await save.dblclick();

  const dialog = page.getByRole("dialog", { name: "Manifesto salvo" });
  const reference = dialog.locator("#hash-display");
  await expect(dialog).toBeVisible();
  await expect(reference).toBeVisible();
  await expect(reference).toHaveText(/^CT-[0-9A-F]{4}-[0-9A-F]{4}$/);
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((key) =>
        key.startsWith("ciclotech:manifest:"),
      ),
    ),
  ).toHaveLength(1);

  await page.mouse.click(10, 10);
  await expect(dialog).toBeHidden();
});

test("trata entrada inválida, referência ausente e registros legados", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "ciclotech_os_v10",
      JSON.stringify([
        {
          hash: "CT-1010-2020",
          name: "Empresa anterior",
          cep: "01310-100",
          items: "Mobile",
          date: "20/01/2025",
          step: 4,
        },
      ]),
    );
  });
  await page.goto("/#ledger");
  const input = page.getByRole("textbox", { name: "Código de referência" });
  await input.fill("errado");
  await input.press("Enter");
  await expect(page.locator("#tracker-status")).toContainText(
    "Informe um código",
  );
  await input.fill("CT-1234-5678");
  await input.press("Enter");
  await expect(page.locator("#tracker-status")).toContainText("não encontrado");
  await input.fill("ct-a1b2-c3d4");
  await input.press("Enter");
  await expect(page.locator("#res-name")).toHaveText("Empresa Exemplo");
  await input.fill("CT-1010-2020");
  await input.press("Enter");
  await expect(page.locator("#res-name")).toHaveText("Empresa anterior");
  await expect(page.locator("#state-result")).toContainText(
    "Código de referência",
  );
  await expect(page.getByText("Registrado localmente")).toBeVisible();
  await expect(page.getByText("Não executado")).toHaveCount(3);
});

test("recupera de falhas de armazenamento e cópia", async ({ page }) => {
  await page.addInitScript(() => {
    const write = Storage.prototype.setItem;
    let failed = false;
    Storage.prototype.setItem = function (key, value) {
      if (!failed && key.startsWith("ciclotech:manifest:")) {
        failed = true;
        throw new DOMException("Quota excedida", "QuotaExceededError");
      }
      write.call(this, key, value);
    };
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("Sem permissão")) },
    });
  });
  await page.goto("/#manifesto");
  await completeDraft(page);
  const save = page.getByRole("button", { name: "Salvar demonstração" });
  await save.click();
  await expect(page.locator("#wizard-error")).toContainText(
    "Não foi possível salvar",
  );
  await save.click();
  const dialog = page.getByRole("dialog", { name: "Manifesto salvo" });
  await dialog
    .getByRole("button", { name: "Copiar código de referência" })
    .click();
  await expect(dialog.getByRole("status")).toContainText(
    "Não foi possível copiar",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.locator("#step-1 h3")).toBeFocused();
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((key) =>
        key.startsWith("ciclotech:manifest:"),
      ),
    ),
  ).toHaveLength(1);
});

test("permite consultar um manifesto temporário até recarregar", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Armazenamento bloqueado", "SecurityError");
      },
    });
  });
  await page.goto("/#manifesto");
  await completeDraft(page);
  await page.getByRole("button", { name: "Salvar demonstração" }).click();
  await expect(page.locator("#wizard-error")).toContainText(
    "Não foi possível salvar",
  );
  await page.getByRole("button", { name: "Salvar só nesta aba" }).click();
  const dialog = page.getByRole("dialog", { name: "Manifesto salvo" });
  await expect(
    dialog.getByText("Este manifesto ficará disponível"),
  ).toBeVisible();
  const reference = await dialog.locator("#hash-display").innerText();
  await dialog.getByRole("button", { name: "Consultar código" }).click();
  await expect(page.locator("#res-name")).toHaveText("Empresa Fictícia");

  await page.reload();
  const input = page.getByRole("textbox", { name: "Código de referência" });
  await input.fill(reference);
  await input.press("Enter");
  await expect(page.locator("#tracker-status")).toContainText(
    "Não foi possível consultar",
  );
});

test("serve o favicon sem erros no console", async ({ page }) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  const ico = page.locator('link[rel="icon"][href="/favicon.ico"]');
  await expect(ico).toHaveCount(1);
  await expect(await page.request.get("/favicon.ico")).toBeOK();
  const iconLoaded = await page
    .locator('link[rel="icon"][type="image/svg+xml"]')
    .evaluate(
      (link) =>
        new Promise((resolve) => {
          const image = new Image();
          image.onload = () => resolve(true);
          image.onerror = () => resolve(false);
          image.src = link.getAttribute("href");
        }),
    );
  expect(iconLoaded).toBe(true);
  expect(errors).toEqual([]);
});

test("identifica o mapa como ilustrativo", async ({ page }) => {
  await page.goto("/#nodes");
  await expect(
    page
      .locator("#nodes")
      .getByText("Visualização ilustrativa", { exact: true }),
  ).toHaveCount(1);
});

test("usa os cabeçalhos de produção e carrega gráficos sob demanda", async ({
  page,
}) => {
  const faults = [];
  const requested = [];
  page.on("pageerror", (error) => faults.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      faults.push(message.text());
    }
  });
  page.on("request", (request) => requested.push(request.url()));
  const response = await page.goto("/");
  expect(response.headers()["content-security-policy"]).toContain(
    "script-src 'self'",
  );
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(requested.some((url) => /assets\/charts-/.test(url))).toBe(false);
  const open = page.getByRole("button", { name: "Abrir painel ESG" });
  await open.click();
  const dialog = page.getByRole("dialog", { name: "Painel ESG" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("DADOS ESG FICTÍCIOS")).toBeVisible();
  await expect
    .poll(() => requested.some((url) => /assets\/charts-/.test(url)))
    .toBe(true);
  await expect(dialog.getByRole("status")).toBeEmpty();
  await expect(
    dialog.getByRole("img", { name: /Arrecadação fictícia/ }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
  await open.click();
  await expect(dialog.getByRole("status")).toBeEmpty();
  await dialog.getByRole("button", { name: "Fechar painel ESG" }).click();
  await expect(dialog).toBeHidden();
  expect(faults).toEqual([]);
});
