import { writeFileSync } from "node:fs";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
chromium.use(StealthPlugin());

const TZ = "Asia/Tehran";

const MONTHS = ["january","february","march","april","may","june",
  "july","august","september","october","november","december"];

const MONTH_ABBR = { jan:1, feb:2, mar:3, apr:4, may:5, jun:6,
  jul:7, aug:8, sep:9, oct:10, nov:11, dec:12 };

/////////////////////////////////////////////////////
function buildWindow() {
  const fmt = new Intl.DateTimeFormat("en-CA",
    { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  const fmtFA = new Intl.DateTimeFormat("fa-IR-u-nu-latn",
    { timeZone: TZ, year: "numeric", month: "long", day: "numeric" });
  const fmtWd = new Intl.DateTimeFormat("fa-IR", { timeZone: TZ, weekday: "long" });

  const [y, m, d] = fmt.format(new Date()).split("-").map(Number);

  return Array.from({ length: 8 }, (_, i) => {        // ← حلقه برگشت
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    return {
      date: fmt.format(dt),
      date_fa: fmtFA.format(dt),
      weekday: fmtWd.format(dt),
    };
  });
}

///////////////////////////////////////////////////
async function browserOpenCheck(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(8000);
  let title = await page.title();
  if (/just a moment|attention required/i.test(title)) {
    await page.waitForTimeout(10000);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(8000);
    title = await page.title();
  }
  if (/just a moment|attention required/i.test(title)) {
    throw new Error("We Blocked /: " + title);
  }
}

async function openWithRetry(page, url, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try {
      await browserOpenCheck(page, url);
      return;
    } catch (e) {
      console.log(`تلاش ${i}/${tries} بلاک شد`);
      if (i === tries) throw e;
      await page.waitForTimeout(5000);
    }
  }
}

///////////////////////////////////////////
async function takeAllrows(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("#tab1 table tbody tr.ruka")].map(tr => ({
      dateText: tr.querySelector("td:nth-of-type(2)")?.innerText.trim() ?? "",
      signText: tr.querySelector("td:nth-of-type(5) strong")?.innerText.trim() ?? "",
    }))
  );
}

//////////////////////////////////////////////
function parserAllrows(text, year) {
  // "Sep 1" یا "1 Sep" — هر دو فرمت
  let m = text.match(/^([A-Za-z]{3})\s+(\d{1,2})$/);      // ماه اول
  if (m) {
    const month = MONTH_ABBR[m[1].toLowerCase()];
    if (!month) return null;
    return `${year}-${String(month).padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  }
  m = text.match(/^(\d{1,2})\s+([A-Za-z]{3})$/);          // روز اول
  if (m) {
    const month = MONTH_ABBR[m[2].toLowerCase()];
    if (!month) return null;
    return `${year}-${String(month).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return null;
}

// ---------- ۵) تطبیق ----------
function merge(days, rows) {
  return days.map(d => {
    const row = rows.find(r => r.dateISO === d.date);
    return { ...d, sign: row ? row.signText : null };   // فیلدهای روز + برجِ خام
  });
}

// ================= اجرا =================
const browser = await chromium.launch({ channel: "chromium" }); 
const context = await browser.newContext({
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  locale: "en-US",
  timezoneId: "Asia/Tehran",
  viewport: { width: 1366, height: 768 },
  extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
});
const page = await context.newPage();
await page.addInitScript(() =>
  Object.defineProperty(navigator, "webdriver", { get: () => undefined })
);

try {
  const days = buildWindow();
  console.log("پنجره:", days.map(d => d.date).join(" , "));

  const needed = [...new Set(days.map(d => d.date.slice(0, 7)))]
    .map(k => { const [y, m] = k.split("-").map(Number); return { y, m }; });
  console.log("ماه‌های لازم:", needed.map(n => `${n.y}-${n.m}`).join(" , "));

 await openWithRetry(page, "https://mooncalendar.astro-seek.com/");
  const allLinks = await page.evaluate(() =>
    [...document.querySelectorAll("a[href]")].map(a => a.href)
  );

  const rows = [];
  for (const { y, m } of needed) {
    const url = allLinks.find(h =>
      h.includes("calendar") &&          // ← شل‌تر از "moon-calendar" چون لینک‌های این ساب‌دامین ممکنه moon-phases-calendar باشن
      h.includes(MONTHS[m - 1]) &&
      h.includes(String(y))
    );
    if (!url) {
      console.log(`❌ لینک ماه ${m}/${y} پیدا نشد. لینک‌های تقویمی موجود:`);
      console.log(allLinks.filter(h => h.includes("calendar")).join("\n"));
      continue;
    }

    await openWithRetry(page, url);
    const raw = await takeAllrows(page);
    console.log(`✓ ${url} → ${raw.length} ردیف`);

    if (raw.length === 0) {              // ← هشدار: شاید ساختار این صفحه با tab1/ruka فرق داره
      console.log("⚠️ جدول ruka توی این صفحه خالی بود — ساختار صفحه رو چک کن");
      continue;
    }

    for (const r of raw) {
      const dateISO = parserAllrows(r.dateText, y);   // ← سالِ همین صفحه
      if (dateISO) rows.push({ ...r, dateISO });
      else console.log("⚠️ ردیف ناخوانا:", JSON.stringify(r));
    }
  }

  if (!rows.length) throw new Error("هیچ ردیفی استخراج نشد");

  const final = merge(days, rows);
  const missing = final.filter(f => f.sign === null).map(f => f.date);
  console.log(missing.length
    ? "⚠️ ردیف این روزها پیدا نشد: " + missing.join(", ")
    : "✓ هر ۸ روز کامل شد");

  // ---------- آخرِ کار، فقط بعد از موفقیت ----------
  writeFileSync("data.json", JSON.stringify(
    { generated_at: new Date().toISOString(), source: "astro-seek", days: final },
    null, 2
  ));
  console.log("نمونه:\n" + JSON.stringify(final[0], null, 2));
} finally {
  await browser.close();
}





