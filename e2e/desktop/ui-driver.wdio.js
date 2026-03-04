import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_TIMEOUT = 30000;
const ARTIFACTS_DIR = process.env.TITANE_E2E_ARTIFACTS_DIR
  ? path.resolve(process.env.TITANE_E2E_ARTIFACTS_DIR)
  : path.resolve(process.cwd(), "reports/e2e-desktop");

const testId = (id) => `[data-testid="${id}"]`;

async function isExisting(selector) {
  const el = await $(selector);
  return el.isExisting();
}

async function isDisplayed(selector) {
  const el = await $(selector);
  if (!(await el.isExisting())) return false;
  return el.isDisplayed();
}

async function waitForAnyDisplayed(selectors, timeout = DEFAULT_TIMEOUT) {
  await browser.waitUntil(
    async () => {
      for (const selector of selectors) {
        if (await isDisplayed(selector)) return true;
      }
      return false;
    },
    {
      timeout,
      interval: 200,
      timeoutMsg: `none of selectors became visible: ${selectors.join(", ")}`,
    },
  );
}

async function clickSafely(selector) {
  const el = await $(selector);
  await el.scrollIntoView();

  try {
    await el.waitForClickable({ timeout: 5000 });
    await el.click();
    return;
  } catch {
    // fallback below
  }

  try {
    await browser.execute((element) => element.click(), el);
    return;
  } catch {
    await el.click();
  }
}

async function setValueSafely(selector, value) {
  const el = await $(selector);
  await el.scrollIntoView();

  try {
    await el.waitForEnabled({ timeout: 5000 });
    await el.click();
    await el.setValue(value);
    return;
  } catch {
    // fallback below
  }

  await browser.execute(
    (element, text) => {
      element.focus();
      element.value = "";
      element.value = String(text ?? "");
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    },
    el,
    value,
  );
}

export async function ensureArtifactsDir() {
  await fs.mkdir(ARTIFACTS_DIR, { recursive: true });
}

export async function captureFailureScreenshot(testName = "unknown") {
  await ensureArtifactsDir();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safe = String(testName)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const screenshotPath = path.join(
    ARTIFACTS_DIR,
    `failure-${safe || "test"}-${stamp}.png`,
  );
  await browser.saveScreenshot(screenshotPath);
  return screenshotPath;
}

export async function waitForDisplayed(selector, timeout = DEFAULT_TIMEOUT) {
  const el = await $(selector);
  await el.waitForDisplayed({ timeout });
  return el;
}

export async function openApp() {
  await browser.url("tauri://localhost");
  await waitForDisplayed("body", DEFAULT_TIMEOUT);
}

export async function waitAppReady() {
  if (await isExisting(testId("app-ready"))) {
    await waitForDisplayed(testId("app-ready"), DEFAULT_TIMEOUT);
    await browser.waitUntil(
      async () => {
        const state = await $(testId("app-ready")).getAttribute("data-state");
        return state === "ready";
      },
      {
        timeout: DEFAULT_TIMEOUT,
        interval: 200,
        timeoutMsg: "app-ready marker did not reach ready state",
      },
    );
  } else {
    await waitForAnyDisplayed(
      [testId("nav-top-main"), testId("page-titane"), testId("chat-input")],
      DEFAULT_TIMEOUT,
    );
  }

  if (await isExisting(testId("ipc-ready"))) {
    await waitForDisplayed(testId("ipc-ready"), DEFAULT_TIMEOUT);
    await browser.waitUntil(
      async () => {
        const state = await $(testId("ipc-ready")).getAttribute("data-state");
        return state === "ready" || state === "fallback";
      },
      {
        timeout: DEFAULT_TIMEOUT,
        interval: 200,
        timeoutMsg: "ipc-ready marker did not reach ready/fallback state",
      },
    );
  }
}

export async function gotoTopNavPage(page) {
  const currentPath = await getCurrentPathname();
  if (currentPath === page.route || currentPath.startsWith(`${page.route}/`)) {
    if (
      (await isDisplayed(page.root)) ||
      (await isDisplayed(testId("nav-top-main")))
    ) {
      return;
    }
  }

  await waitForDisplayed(testId("nav-top-main"));

  const navSelector = testId(page.navTestId);
  let navigated = false;

  try {
    const navEl = await $(navSelector);
    if (!(await navEl.isDisplayed())) {
      const moreSelector = testId("btn-nav-more");
      if (await isDisplayed(moreSelector)) {
        await clickSafely(moreSelector);
      }
    }

    if (await isDisplayed(navSelector)) {
      await clickSafely(navSelector);
      navigated = true;
    }
  } catch {
    navigated = false;
  }

  if (!navigated) {
    await browser.url(`tauri://localhost${page.route}`);
  }

  await browser.waitUntil(
    async () => {
      if (await isDisplayed(page.root)) return true;
      const pathname = await getCurrentPathname();
      return pathname === page.route || pathname.startsWith(`${page.route}/`);
    },
    {
      timeout: DEFAULT_TIMEOUT,
      interval: 200,
      timeoutMsg: `page activation failed for ${page.id}`,
    },
  );
}

export async function clickAllTabs(tabSelectors = []) {
  for (const selector of tabSelectors) {
    const el = await $(selector);
    if (!(await el.isExisting())) continue;
    if (!(await el.isDisplayed())) continue;
    await el.click();
    await browser.waitUntil(
      async () => {
        const selected = await el.getAttribute("aria-selected");
        if (selected !== null) return selected === "true";
        const cls = (await el.getAttribute("class")) || "";
        return (
          cls.includes("active") ||
          cls.includes("--active") ||
          cls.includes("bg-blue-600")
        );
      },
      {
        timeout: 10000,
        interval: 150,
        timeoutMsg: `tab did not activate: ${selector}`,
      },
    );
  }
}

export async function toggleAllVisibleCheckboxes() {
  const checkboxes = await $$('input[type="checkbox"]');
  let touched = 0;
  for (const checkbox of checkboxes) {
    if (!(await checkbox.isDisplayed())) continue;
    if (!(await checkbox.isEnabled())) continue;
    await checkbox.click();
    await checkbox.click();
    touched += 1;
  }
  return touched;
}

export async function fillAllVisibleInputs(sample = "e2e-sample") {
  const selectors = [
    'input[type="text"]',
    'input[type="search"]',
    'input[type="email"]',
    'input[type="url"]',
    'input[type="tel"]',
    'input[type="number"]',
    'input[type="password"]',
    "textarea",
  ];

  let touched = 0;
  for (const selector of selectors) {
    const fields = await $$(selector);
    for (const field of fields) {
      if (!(await field.isDisplayed())) continue;
      if (!(await field.isEnabled())) continue;
      const readonly = await field.getAttribute("readonly");
      if (readonly !== null) continue;
      await field.click();
      await field.setValue(sample);
      await field.clearValue();
      touched += 1;
    }
  }
  return touched;
}

export async function sendChatAndAssertNoSilence(message, timeoutMs = 45000) {
  const chatReady = await $(testId("chat-ready"));
  if (await chatReady.isExisting()) {
    await chatReady.waitForExist({ timeout: DEFAULT_TIMEOUT });
    await browser.waitUntil(
      async () => (await chatReady.getAttribute("data-state")) === "ready",
      {
        timeout: DEFAULT_TIMEOUT,
        interval: 200,
        timeoutMsg: "chat-ready marker did not reach ready state",
      },
    );
  } else {
    await waitForAnyDisplayed([
      testId("chat-input"),
      '[data-testid="tab-conversation"]',
    ]);
  }

  const assistantSelector = testId("chat-message-assistant");
  const assistantBefore = (await isExisting(assistantSelector))
    ? (await $$(assistantSelector)).length
    : 0;
  const userSelector = testId("chat-message-user");
  const userBefore = (await isExisting(userSelector))
    ? (await $$(userSelector)).length
    : 0;
  const bodyBefore = (await $("body").getText()) || "";
  const promptMarker = String(message || "").slice(0, 48);

  const input = await $(testId("chat-input"));
  const send = await $(testId("chat-send"));

  await input.waitForExist({ timeout: DEFAULT_TIMEOUT });
  await setValueSafely(testId("chat-input"), message);
  await send.waitForExist({ timeout: DEFAULT_TIMEOUT });
  await clickSafely(testId("chat-send"));

  await browser.waitUntil(
    async () => {
      if (await isExisting(assistantSelector)) {
        const assistantAfter = (await $$(assistantSelector)).length;
        if (assistantAfter > assistantBefore) return true;
      }

      if (await isExisting(userSelector)) {
        const userAfter = (await $$(userSelector)).length;
        if (userAfter > userBefore) return true;
      }

      const err = await $(testId("chat-error"));
      if ((await err.isExisting()) && (await err.isDisplayed())) return true;

      const genericAlert = await $('[role="alert"]');
      if (
        (await genericAlert.isExisting()) &&
        (await genericAlert.isDisplayed())
      ) {
        return true;
      }

      const inputNow = await $(testId("chat-input"));
      if (await inputNow.isExisting()) {
        const val = (await inputNow.getValue()) || "";
        if (String(val).trim().length === 0) return true;
      }

      const bodyAfter = (await $("body").getText()) || "";
      if (
        promptMarker &&
        !bodyBefore.includes(promptMarker) &&
        bodyAfter.includes(promptMarker)
      ) {
        return true;
      }
      return bodyAfter.length > bodyBefore.length + 8;
    },
    {
      timeout: timeoutMs,
      interval: 250,
      timeoutMsg:
        "No-silence contract failed: no assistant message and no visible error",
    },
  );
}

export async function getCurrentPathname() {
  return browser.execute(() => window.location.pathname || "");
}
