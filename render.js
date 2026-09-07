import { getData, broj } from "./app.js";

const SIGN_FA = {
  Aries: "قوچ", Taurus: "گاو", Gemini: "دوپیکر", Cancer: "خرچنگ",
  Leo: "شیر", Virgo: "خوشه", Libra: "ترازو", Scorpio: "عقرب",
  Sagittarius: "کمان", Capricorn: "بزغاله", Aquarius: "دلو", Pisces: "ماهی",
};

const mainCard = document.getElementById("main-card");
const strip = document.getElementById("days-strip");

function mainHTML(day) {
  const sign = SIGN_FA[day.sign] ?? day.sign;
  const desc = broj[day.sign] ?? "توضیح این برج هنوز نوشته نشده";
  return `
    <div class="main-top">
      <div>
        <div class="main-date">${day.date_fa}</div>
        <div class="main-weekday">${day.weekday}</div>
      </div>
      <div class="main-phase">🌙</div>
    </div>
    <h2 class="main-sign">ماه در برج ${sign}</h2>
    <p class="main-desc">${desc}</p>
  `;
}

try {
  const data = await getData();
  const days = data.days;
  let current = 0;

  // کارت‌های کوچیک ۸ روز
  strip.innerHTML = days.map((d, i) => `
    <button class="day-card ${i === 0 ? "active" : ""}" data-i="${i}">
      <span class="day-card-weekday">${d.weekday}</span>
      <span class="day-card-date">${d.date_fa}</span>
      <span>🌙 ${SIGN_FA[d.sign] ?? d.sign}</span>
    </button>
  `).join("");

  const renderMain = () => { mainCard.innerHTML = mainHTML(days[current]); };
  renderMain();

  // یه listener روی کل نوار، نه ۸ تا روی کارت‌ها (event delegation)
  strip.addEventListener("click", (e) => {
    const btn = e.target.closest(".day-card");
    if (!btn) return;
    current = Number(btn.dataset.i);
    strip.querySelectorAll(".day-card").forEach(c =>
      c.classList.toggle("active", Number(c.dataset.i) === current)
    );
    renderMain();
  });
} catch (error) {
  mainCard.innerHTML = `<p class="error">دیتا در دسترس نیست: ${error.message}</p>`;
}
