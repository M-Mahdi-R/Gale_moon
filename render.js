import { getData, broj } from "./app.js";

const SIGNS = {
  Aries:      { fa:"قوچ",    ar:"حمل",  en:"ARIES",       sym:"♈" },
  Taurus:     { fa:"گاو",    ar:"ثور",  en:"TAURUS",      sym:"♉" },
  Gemini:     { fa:"دوپیکر", ar:"جوزا", en:"GEMINI",      sym:"♊" },
  Cancer:     { fa:"خرچنگ",  ar:"سرطان",en:"CANCER",      sym:"♋" },
  Leo:        { fa:"شیر",    ar:"اسد",  en:"LEO",         sym:"♌" },
  Virgo:      { fa:"خوشه",   ar:"سنبله",en:"VIRGO",       sym:"♍" },
  Libra:      { fa:"ترازو",  ar:"میزان",en:"LIBRA",       sym:"♎" },
  Scorpio:    { fa:"عقرب",   ar:"عقرب", en:"SCORPIO",     sym:"♏" },
  Sagittarius:{ fa:"کمان",   ar:"قوس",  en:"SAGITTARIUS", sym:"♐" },
  Capricorn:  { fa:"بزغاله", ar:"جدی",  en:"CAPRICORN",   sym:"♑" },
  Aquarius:   { fa:"دلو",    ar:"دلو",  en:"AQUARIUS",    sym:"♒" },
  Pisces:     { fa:"ماهی",   ar:"حوت",  en:"PISCES",      sym:"♓" },
};
const ELEMENT = {
  Aries:"fire", Taurus:"earth", Gemini:"air",
  Cancer:"water", Leo:"fire", Virgo:"earth",
  Libra:"air", Scorpio:"water", Sagittarius:"fire",
  Capricorn:"earth", Aquarius:"air", Pisces:"water",
};
const EL_STYLE = {
  fire:  { color:"#ff6b45", glow:"rgba(255,107,69,.35)" },
  earth: { color:"#4ade80", glow:"rgba(74,222,128,.3)" },
  water: { color:"#38bdf8", glow:"rgba(56,189,248,.32)" },
  air:   { color:"#a5c8ff", glow:"rgba(165,200,255,.3)" },
};
const GLOW = { fire:"rgba(255,107,69,.16)", earth:"rgba(74,222,128,.13)",
  water:"rgba(56,189,248,.15)", air:"rgba(165,200,255,.13)" };

/* زاویه‌ی برج‌های داخل دیتا: پخش روی قوس؛ بقیه ادامه‌ی چرخ */
function buildAngles(signsInData) {
  const angles = {};
  const arr = [...signsInData];
  const n = arr.length;
  arr.forEach((en, i) => {
    angles[en] = 48 - (96 * i) / (n - 1);   // +48 (راست) تا -48 (چپ)
  });
  let a = angles[arr[arr.length - 1]] - 30;
  Object.keys(SIGNS).filter(s => !(s in angles)).forEach(en => {
    angles[en] = a; a -= 30;
  });
  return angles;
}

const CONST = {
  Aries:      { s:[[18,62,2.2],[42,42,2.4],[68,34,2],[88,46,2.4]], l:[[0,1],[1,2],[2,3]] },
  Taurus:     { s:[[22,32,2],[38,58,2.4],[52,68,2],[46,84,1.8],[78,26,2.2],[66,52,1.6]], l:[[0,1],[1,2],[2,3],[1,5],[5,4]] },
  Gemini:     { s:[[28,22,2],[34,44,2],[30,66,1.8],[38,86,2.2],[62,18,2.2],[68,40,2],[62,62,1.8],[66,84,2]], l:[[0,1],[1,2],[2,3],[4,5],[5,6],[6,7],[0,4]] },
  Cancer:     { s:[[50,30,2.2],[50,58,1.6],[28,88,2.6],[70,88,2.6]], l:[[0,1],[1,2],[1,3]] },
  Leo:        { s:[[58,14,1.5],[76,26,2.6],[71,44,1.4],[56,52,3.2],[39,46,1.8],[60,76,1.7],[88,64,2.4],[65,96,2.1]], l:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[5,7]] },
  Virgo:      { s:[[20,34,1.6],[40,54,2.8],[56,44,1.5],[64,68,2.4],[82,90,1.8],[46,80,1.4]], l:[[0,1],[1,2],[2,3],[3,4],[2,5]] },
  Libra:      { s:[[50,26,2.2],[26,62,2.5],[50,96,2.8],[74,62,2.5]], l:[[0,1],[1,2],[2,3],[3,0]] },
  Scorpio:    { s:[[76,18,2.4],[88,10,1.6],[90,26,1.8],[62,36,2.2],[48,50,2],[34,64,2.4],[26,82,2],[38,92,1.6],[52,84,1.8]], l:[[0,1],[0,2],[0,3],[3,4],[4,5],[5,6],[6,7],[7,8]] },
  Sagittarius:{ s:[[28,38,2],[44,30,2.2],[60,36,1.8],[66,52,2],[50,66,2.2],[34,60,1.8],[78,32,1.6]], l:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,6]] },
  Capricorn:  { s:[[16,58,2],[32,42,2.2],[54,34,1.8],[76,44,2.2],[88,62,2]], l:[[0,1],[1,2],[2,3],[3,4]] },
  Aquarius:   { s:[[22,38,1.8],[38,50,2.2],[48,34,1.8],[64,48,2.2],[80,36,1.6],[44,72,2],[60,76,1.8]], l:[[0,1],[1,2],[2,3],[3,4],[3,5],[5,6]] },
  Pisces:     { s:[[18,32,2],[42,52,2.2],[50,76,2.4],[82,30,2],[56,52,1.6]], l:[[0,1],[1,2],[2,4],[4,3]] },
};

/* ---------- فاز ماه (گرافیک) ---------- */
const SYNODIC = 29.53058867;
const KNOWN_NEW = Date.UTC(2000, 0, 6, 18, 14);
const phaseOf = ds => {
  const d = (Date.parse(ds + "T12:00:00Z") - KNOWN_NEW) / 864e5;
  return (((d % SYNODIC) + SYNODIC) % SYNODIC) / SYNODIC;
};
function litPath(p, R = 45) {
  const c = Math.cos(2 * Math.PI * p);
  const rx = Math.max(Math.abs(c) * R, 0.01);
  const waxing = p <= 0.5;
  const sweep = waxing ? (c > 0 ? 0 : 1) : (c < 0 ? 0 : 1);
  const arc = waxing ? `M 0 ${-R} A ${R} ${R} 0 0 1 0 ${R}` : `M 0 ${-R} A ${R} ${R} 0 0 0 0 ${R}`;
  return `${arc} A ${rx} ${rx} 0 0 ${sweep} 0 ${-R} Z`;
}
let uidN = 0;
function moonInner(p) {
  const id = "mg" + (++uidN);
  return `
    <defs>
      <radialGradient id="${id}" cx="35%" cy="35%">
        <stop offset="0%" stop-color="#fffdf2"/><stop offset="65%" stop-color="#f7e9c0"/>
        <stop offset="100%" stop-color="#d9c68a"/>
      </radialGradient>
      <clipPath id="${id}c"><path d="${litPath(p)}"/></clipPath>
    </defs>
    <circle r="45" fill="#1d2247"/>
    <path d="${litPath(p)}" fill="url(#${id})"/>
    <g clip-path="url(#${id}c)" fill="rgba(30,25,10,.09)">
      <circle cx="-14" cy="-10" r="7"/><circle cx="12" cy="15" r="9"/>
      <circle cx="20" cy="-18" r="5"/><circle cx="-8" cy="22" r="5"/>
    </g>
    <circle r="45" fill="none" stroke="rgba(255,255,255,.16)"/>`;
}
function moonSVGmini(p, i) {
  return `<svg viewBox="-55 -55 110 110" width="28" height="28">${moonInner(p).replace(/mg\d+/g, "mm" + i)}</svg>`;
}

/* ---------- المان‌های ثابت ---------- */
const scene = document.getElementById("scene");
const info = document.getElementById("info");
const loader = document.getElementById("loader");
const track = document.getElementById("track");

try {
  const data = await getData();
  loader?.remove();

  const days = data.days;
  let current = 0;

  const BASE = buildAngles(new Set(days.map(d => d.sign)));
  const signDays = {};
  days.forEach((d, i) => (signDays[d.sign] ??= i));

  /* --- چرخ --- */
  const CX = 490, CY = 120, R = 560;
  const pt = (radius, aDeg) => {
    const t = aDeg * Math.PI / 180;
    return [CX + radius * Math.sin(t), CY + radius * Math.cos(t)];
  };

  let wheel = `
    <circle class="ring" cx="${CX}" cy="${CY}" r="${R}"/>
    <circle class="ring faint" cx="${CX}" cy="${CY}" r="${R - 26}"/>
    <circle class="dust" cx="${CX}" cy="${CY}" r="${R - 13}" stroke-dasharray="2 9">
      <animateTransform attributeName="transform" type="rotate"
        from="0 ${CX} ${CY}" to="360 ${CX} ${CY}" dur="140s" repeatCount="indefinite"/>
    </circle>`;

  for (let k = 0; k < 12; k++) {
    const a = 15 + k * 30;
    const [x1, y1] = pt(180, a), [x2, y2] = pt(R - 6, a);
    wheel += `<line class="divider" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
    <circle class="bdot" cx="${x2}" cy="${y2}" r="3"/>`;
  }

  Object.entries(BASE).forEach(([en, B]) => {
    const s = SIGNS[en], c = CONST[en];
    const [cx, cy] = pt(300, B);
    const [nx, ny] = pt(420, B);
    let inner = ``;
    c.l.forEach(([a, b]) =>
      inner += `<line class="cline" x1="${c.s[a][0]}" y1="${c.s[a][1]}" x2="${c.s[b][0]}" y2="${c.s[b][1]}"/>`);
    c.s.forEach(([x, y, r], i) =>
      inner += `<circle class="chalo" cx="${x}" cy="${y}" r="${r * 2.6}"/>
                <circle class="cstar" style="animation-delay:${(i * .4).toFixed(1)}s"
                  cx="${x}" cy="${y}" r="${(r * .9).toFixed(2)}"/>`);

    wheel += `
      <g class="g dim ${signDays[en] !== undefined ? "has-days" : ""}" data-sign="${en}">
        <g transform="translate(${(cx - 66).toFixed(1)},${(cy - 66).toFixed(1)}) scale(1.15)">${inner}</g>
        <text class="z-name" x="${nx.toFixed(1)}" y="${ny.toFixed(1)}" text-anchor="middle">
          <tspan>${s.ar}</tspan> <tspan class="sym">${s.sym}</tspan> <tspan class="en">${s.en}</tspan>
        </text>
      </g>`;
  });

  const deco = `
    <path d="M -60 480 Q 380 600 1040 340" fill="none" stroke="rgba(160,175,255,.1)" stroke-width="1"/>
    <path d="M 1040 480 Q 600 600 0 340" fill="none" stroke="rgba(160,175,255,.1)" stroke-width="1"/>`;

  const glowDefs = `
    <defs>
      <filter id="blurBig" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="12"/>
      </filter>
    </defs>`;

  scene.innerHTML = glowDefs + deco + wheel + `<g id="moonG" class="moon-g"></g>`;
  const moonEl = document.getElementById("moonG");

  /* --- خزش ماه داخل بازه‌ی برج --- */
  function moonAngle(i) {
    const d = days[i];
    const sameSign = days.filter(x => x.sign === d.sign);
    const idx = sameSign.indexOf(d);
    const n = sameSign.length;
    if (n <= 1) return BASE[d.sign];
    const A = BASE[d.sign];
    const dir = A >= 0 ? -1 : 1;
    return A + dir * (12 * idx) / (n - 1);   // ۱۲ درجه پیمایش داخل بازه
  }

  function render(i) {
    current = i;
    const d = days[i];
    const p = phaseOf(d.date);
    const el = ELEMENT[d.sign] ?? "air";
    const es = EL_STYLE[el] ?? {};

    const A = moonAngle(i);
    const [mx, my] = pt(R + 60, A);
    moonEl.setAttribute("transform", `translate(${mx.toFixed(1)},${my.toFixed(1)})`);
    moonEl.innerHTML = `
      <circle r="62" class="halo" fill="${GLOW[el] ?? "rgba(255,209,102,.14)"}" filter="url(#blurBig)"/>
      <g class="zoomer">
        <svg x="-42" y="-42" width="84" height="84" viewBox="-55 -55 110 110" style="overflow:visible">${moonInner(p)}</svg>
        <text y="106" text-anchor="middle" font-size="12" letter-spacing="4"
          fill="rgba(143,150,196,.8)" style="font-weight:600">MOON</text>
      </g>`;

    scene.querySelectorAll(".g").forEach(g => {
      g.classList.toggle("dim", g.dataset.sign !== d.sign);
      g.classList.toggle("on", g.dataset.sign === d.sign);
    });

    const elName = { fire:"آتش", earth:"خاک", water:"آب", air:"هوا" }[el] ?? "";
    info.style.setProperty("--el-color", es.color ?? "var(--gold)");
    info.style.setProperty("--el-glow", es.glow ?? "rgba(255,209,102,.3)");

    info.classList.remove("swap"); void info.offsetWidth; info.classList.add("swap");
    info.innerHTML = `
      <div class="sign-badge-row">
        <div class="sym-box">${SIGNS[d.sign].sym}</div>
        <div>
          <div class="sign-name">ماه در برج ${SIGNS[d.sign].fa}</div>
          <div class="sign-sub">${SIGNS[d.sign].ar} • ${SIGNS[d.sign].en} • عنصر ${elName}</div>
        </div>
      </div>
      <div class="date-line">
        <span class="date-big">${d.date_fa}</span>
        <span class="greg">${d.date}</span>
        <span class="weekday">${d.weekday}${i === 0 ? " • امروز" : ""}</span>
      </div>
      <p class="desc">${broj[d.sign] ?? ""}</p>`;

    document.title = `ماه در ${SIGNS[d.sign].fa} — موقعیت ماه`;
    track.querySelectorAll(".t-dot").forEach(b =>
      b.classList.toggle("active", Number(b.dataset.i) === i));
    track.querySelector(".t-dot.active")?.scrollIntoView({ behavior:"smooth", inline:"center", block:"nearest" });
  }

  /* --- خط زمانی --- */
  track.innerHTML = days.map((d, i) => `
    <button class="t-dot" data-i="${i}">
      <span class="mini">${moonSVGmini(phaseOf(d.date), i)}</span>
      <span class="dot"></span>
      <span class="wd">${d.weekday}</span>
    </button>`).join("");

  track.addEventListener("click", e => {
    const b = e.target.closest(".t-dot");
    if (b) render(Number(b.dataset.i));
  });
  scene.querySelectorAll(".g.has-days").forEach(g =>
    g.addEventListener("click", () => render(signDays[g.dataset.sign])));
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft")  render(Math.min(current + 1, days.length - 1));
    if (e.key === "ArrowRight") render(Math.max(current - 1, 0));
  });

  render(0);
} catch (error) {
  loader?.remove();
  info.innerHTML = `<p class="error">دیتا در دسترس نیست: ${error.message}</p>`;
}
