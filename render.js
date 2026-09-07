import { broj, getData } from "./app.js";

const mainCard = document.getElementById("main-card");
const daysStrip = document.getElementById("days-strip");

const signData = {
  Aries: {
    fa: "حمل",
    symbol: "♈",
  },
  Taurus: {
    fa: "ثور",
    symbol: "♉",
  },
  Gemini: {
    fa: "جوزا",
    symbol: "♊",
  },
  Cancer: {
    fa: "سرطان",
    symbol: "♋",
  },
  Leo: {
    fa: "اسد",
    symbol: "♌",
  },
  Virgo: {
    fa: "سنبله",
    symbol: "♍",
  },
  Libra: {
    fa: "میزان",
    symbol: "♎",
  },
  Scorpio: {
    fa: "عقرب",
    symbol: "♏",
  },
  Sagittarius: {
    fa: "قوس",
    symbol: "♐",
  },
  Capricorn: {
    fa: "جدی",
    symbol: "♑",
  },
  Aquarius: {
    fa: "دلو",
    symbol: "♒",
  },
  Pisces: {
    fa: "حوت",
    symbol: "♓",
  },
};


function getSign(sign) {
  return signData[sign] || {
    fa: sign,
    symbol: "✦",
  };
}


function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function createMainCard(day) {
  const sign = getSign(day.sign);
  const description = broj[day.sign] || "توضیحی برای این برج ثبت نشده است.";

  mainCard.innerHTML = `
    <div class="main-card-glow"></div>

    <div class="main-card-content">

      <div class="main-card-top">
        <div>
          <span class="eyebrow">وضعیت ماه</span>
          <h1>ماه در <strong>${escapeHTML(sign.fa)}</strong></h1>
        </div>

        <div class="big-sign-symbol">
          ${sign.symbol}
        </div>
      </div>

      <div class="main-date">
        <span class="main-date-number">
          ${escapeHTML(day.date_fa)}
        </span>

        <span class="main-weekday">
          ${escapeHTML(day.weekday)}
        </span>
      </div>

      <div class="main-description">
        ${escapeHTML(description)}
      </div>

      <div class="main-card-footer">
        <span class="english-sign">${escapeHTML(day.sign)}</span>
        <span class="status">
          <span class="status-dot"></span>
          امروز
        </span>
      </div>

    </div>
  `;
}


function createDayCard(day, index) {
  const sign = getSign(day.sign);
  const description = broj[day.sign] || "توضیحی برای این برج ثبت نشده است.";

  return `
    <article
      class="day-card ${index === 0 ? "is-active" : ""}"
      style="--delay: ${index * 70}ms"
      data-index="${index}"
    >

      <div class="day-card-header">

        <div class="day-symbol">
          ${sign.symbol}
        </div>

        <div class="day-sign">
          <span>${escapeHTML(sign.fa)}</span>
          <small>${escapeHTML(day.sign)}</small>
        </div>

      </div>

      <div class="day-info">

        <div class="day-date">
          ${escapeHTML(day.date_fa)}
        </div>

        <div class="day-weekday">
          ${escapeHTML(day.weekday)}
        </div>

      </div>

      <div class="day-description">
        ${escapeHTML(description)}
      </div>

      <div class="day-card-number">
        ${String(index + 1).padStart(2, "0")}
      </div>

    </article>
  `;
}


function renderDays(days) {
  if (!Array.isArray(days) || days.length === 0) {
    renderError("اطلاعاتی برای نمایش وجود ندارد.");
    return;
  }

  createMainCard(days[0]);

  daysStrip.innerHTML = `
    <div class="section-heading">
      <div>
        <span class="eyebrow">پیش‌بینی نزدیک</span>
        <h2>۸ روز پیش رو</h2>
      </div>

      <span class="day-count">${days.length} روز</span>
    </div>

    <div class="days-grid">
      ${days.map(createDayCard).join("")}
    </div>
  `;

  setupDayCards(days);
}


function setupDayCards(days) {
  const cards = document.querySelectorAll(".day-card");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const index = Number(card.dataset.index);

      if (!days[index]) return;

      document
        .querySelectorAll(".day-card")
        .forEach((item) => item.classList.remove("is-active"));

      card.classList.add("is-active");

      createMainCard(days[index]);

      mainCard.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });
}


function renderLoading() {
  mainCard.innerHTML = `
    <div class="loading-card">
      <div class="loading-orbit">
        <div class="loading-moon">☾</div>
      </div>

      <div>
        <span class="eyebrow">در حال دریافت اطلاعات</span>
        <h1>ماه را پیدا می‌کنیم...</h1>
      </div>
    </div>
  `;

  daysStrip.innerHTML = "";
}


function renderError(message) {
  mainCard.innerHTML = `
    <div class="error-card">

      <div class="error-icon">!</div>

      <div>
        <span class="eyebrow">خطا</span>
        <h1>اطلاعات بارگذاری نشد</h1>
        <p>${escapeHTML(message)}</p>
      </div>

      <button class="retry-button" id="retry-button">
        تلاش دوباره
      </button>

    </div>
  `;

  daysStrip.innerHTML = "";

  document
    .getElementById("retry-button")
    ?.addEventListener("click", loadData);
}


function renderMPage() {
  mainCard.innerHTML = `
    <div class="info-card">

      <span class="eyebrow">ماه کجاست؟</span>

      <h1>درباره‌ی وضعیت ماه</h1>

      <p>
        این صفحه برای نمایش موقعیت ماه در برج‌های دوازده‌گانه
        و مشاهده‌ی وضعیت آن در روزهای پیش رو طراحی شده است.
      </p>

      <a href="#/" class="back-button">
        ← بازگشت به صفحه اصلی
      </a>

    </div>
  `;

  daysStrip.innerHTML = "";
}


function getRoute() {
  const hash = window.location.hash;

  if (hash === "#/m" || hash.startsWith("#/m/")) {
    return "m";
  }

  return "home";
}


async function loadData() {
  renderLoading();

  try {
    const data = await getData();

    if (!data || !Array.isArray(data.days)) {
      throw new Error("ساختار data.json معتبر نیست.");
    }

    renderDays(data.days);

  } catch (error) {
    console.error("Failed to load data:", error);

    renderError(
      "در دریافت فایل data.json مشکلی پیش آمد."
    );
  }
}


async function router() {
  const route = getRoute();

  if (route === "m") {
    renderMPage();
    return;
  }

  await loadData();
}


window.addEventListener("hashchange", router);

router();
