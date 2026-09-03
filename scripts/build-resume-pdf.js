const fs = require("fs");
const path = require("path");
const PDFDocument = require("/tmp/node_modules/pdfkit/js/pdfkit.js");

const ROOT = path.resolve(__dirname, "..");
const FONT = path.join(ROOT, "assets/fonts");
const mm = (n) => (n * 72) / 25.4;

const C = {
  dark: "#07090f",
  cream: "#f3efe6",
  paper: "#f6f2ea",
  rail: "#efe9dd",
  line: "#e0d8c8",
  ink: "#111318",
  body: "#2c3342",
  muted: "#4a5263",
  accent: "#2f5de0",
  accentSoft: "#6b93ff",
  chip: "#e4ebff",
  green: "#8fd6b2",
};

function roundRect(doc, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  doc.moveTo(x + rr, y);
  doc.lineTo(x + w - rr, y);
  doc.quadraticCurveTo(x + w, y, x + w, y + rr);
  doc.lineTo(x + w, y + h - rr);
  doc.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  doc.lineTo(x + rr, y + h);
  doc.quadraticCurveTo(x, y + h, x, y + h - rr);
  doc.lineTo(x, y + rr);
  doc.quadraticCurveTo(x, y, x + rr, y);
}

function clipRoundImage(doc, file, x, y, size, r) {
  doc.save();
  doc.fillColor("#000");
  roundRect(doc, x, y, size, size, r);
  doc.clip();
  doc.image(file, x, y, { width: size, height: size });
  doc.restore();
}

function heading(doc, label, x, y, width) {
  doc.font("mono").fontSize(7).fillColor(C.accent);
  doc.text(label.toUpperCase(), x, y, { characterSpacing: 1.35, width });
  const tw = doc.widthOfString(label.toUpperCase(), { characterSpacing: 1.35 });
  doc.strokeColor(C.line).lineWidth(0.6);
  doc.moveTo(x + tw + 8, y + 5).lineTo(x + width, y + 5).stroke();
  return y + 14;
}

function wrapRich(doc, text, x, y, width, size, leading) {
  const chunks = text.split(/(\*\*[^*]+?\*\*)/g).filter(Boolean).flatMap((part) => {
    const bold = part.startsWith("**") && part.endsWith("**");
    const raw = bold ? part.slice(2, -2) : part;
    return raw.split(/(\s+)/).filter((s) => s.length).map((s) => ({ bold, text: s }));
  });

  let cx = x;
  let cy = y;
  const space = () => {};
  for (const chunk of chunks) {
    doc.font(chunk.bold ? "sans-bold" : "sans").fontSize(size);
    if (chunk.text === "\n") {
      cx = x;
      cy += leading;
      continue;
    }
    const w = doc.widthOfString(chunk.text);
    if (cx > x && cx + w > x + width) {
      cx = x;
      cy += leading;
    }
    doc.fillColor(chunk.bold ? C.ink : C.body).text(chunk.text, cx, cy, { lineBreak: false });
    cx += w;
  }
  return cy + leading;
}

function bullets(doc, items, x, y, width) {
  let cy = y;
  for (const item of items) {
    doc.fillColor(C.accent).circle(x + 2.2, cy + 5.2, 1.35).fill();
    const end = wrapRich(doc, item, x + 10, cy, width - 10, 8.15, 11.1);
    cy = end + 2.1;
  }
  return cy;
}

function tags(doc, list, x, y) {
  let cx = x;
  const cy = y;
  for (const t of list) {
    doc.font("sans-bold").fontSize(6.2);
    const w = doc.widthOfString(t.toUpperCase()) + 10;
    roundRect(doc, cx, cy, w, 11, 2.5);
    doc.fillColor(C.chip).fill();
    doc.fillColor(C.accent).text(t.toUpperCase(), cx + 5, cy + 2.4, { lineBreak: false, characterSpacing: 0.4 });
    cx += w + 4;
  }
  return cy + 14;
}

const doc = new PDFDocument({
  size: "A4",
  margin: 0,
  info: {
    Title: "Matin Tavakoli — Resume",
    Author: "Matin Tavakoli",
    Subject: "Software Engineer / Backend Developer (.NET / C#)",
  },
});

const out = path.join(ROOT, "Matin-Tavakoli-Resume.pdf");
doc.pipe(fs.createWriteStream(out));

doc.registerFont("serif", path.join(FONT, "InstrumentSerif-Regular.ttf"));
doc.registerFont("serif-italic", path.join(FONT, "InstrumentSerif-Italic.ttf"));
doc.registerFont("sans", path.join(FONT, "PlusJakartaSans-Regular.ttf"));
doc.registerFont("sans-med", path.join(FONT, "PlusJakartaSans-Medium.ttf"));
doc.registerFont("sans-semi", path.join(FONT, "PlusJakartaSans-SemiBold.ttf"));
doc.registerFont("sans-bold", path.join(FONT, "PlusJakartaSans-Bold.ttf"));
doc.registerFont("mono", path.join(FONT, "IBMPlexMono-Medium.ttf"));

const W = doc.page.width;
const H = doc.page.height;

// paper
doc.rect(0, 0, W, H).fill(C.paper);
doc.rect(0, 0, 5.5, H).fill("#3b6bff");

// masthead
const headerH = 122;
doc.rect(0, 0, W, headerH).fill(C.dark);
doc.save();
const g = doc.linearGradient(0, headerH - 3.2, W, headerH - 3.2);
g.stop(0, "#3b6bff").stop(0.55, "#8fd6b2").stop(1, "#f3efe6");
doc.rect(0, headerH - 3.2, W, 3.2).fill(g);
doc.restore();

const photo = path.join(ROOT, "assets/photo.jpg");
const logo = path.join(ROOT, "assets/logo-mark.jpg");
clipRoundImage(doc, photo, 22, 16, 90, 18);
doc.save();
roundRect(doc, 22, 16, 90, 90, 18);
doc.lineWidth(1.1).strokeColor(C.cream).strokeOpacity(0.22).stroke();
doc.restore();
doc.strokeOpacity(1);

doc.font("serif").fontSize(30).fillColor(C.cream);
doc.text("Matin ", 126, 22, { lineBreak: false });
const nameW = doc.widthOfString("Matin ");
doc.font("serif-italic").fillColor("#9ec0ff").text("Tavakoli", 126 + nameW, 22, { lineBreak: false });

doc.font("sans-bold").fontSize(9.2).fillColor(C.accentSoft);
doc.text("Software Engineer  ·  Backend Developer (.NET / C#)", 126, 56);

const contacts = [
  ["WHERE", "Tabriz, Iran"],
  ["PHONE", "+98 914 321 5274"],
  ["MAIL", "matin.tavakoli.dev@gmail.com"],
  ["WEB", "matin-tavakoli.github.io"],
  ["GITHUB", "github.com/Matin-Tavakoli"],
  ["LINKEDIN", "linkedin.com/in/matin-tavakoli"],
];
let cx = 126;
let cy = 74;
contacts.forEach(([k, v], i) => {
  if (i === 3) {
    cx = 126;
    cy = 90;
  }
  doc.font("mono").fontSize(6).fillColor("#8b93a7").text(k, cx, cy, { lineBreak: false, characterSpacing: 0.6 });
  const kw = doc.widthOfString(k, { characterSpacing: 0.6 });
  doc.font("sans-med").fontSize(7.6).fillColor("#c8cdd8").text(v, cx + kw + 5, cy - 0.6, { lineBreak: false });
  cx += kw + 5 + doc.widthOfString(v) + 14;
});

clipRoundImage(doc, logo, W - 74, 34, 50, 12);
doc.save();
roundRect(doc, W - 74, 34, 50, 50, 12);
doc.lineWidth(0.8).strokeColor("#6b93ff").strokeOpacity(0.4).stroke();
doc.restore();
doc.strokeOpacity(1);

// columns
const railW = 168;
const bodyTop = headerH;
const footH = 22;
doc.rect(0, bodyTop, railW, H - bodyTop - footH).fill(C.rail);
doc.rect(railW, bodyTop, 0.8, H - bodyTop - footH).fill(C.line);

let y = bodyTop + 16;
const rx = 16;
const rw = railW - 26;

y = heading(doc, "Expertise", rx, y, rw);
const skills = [
  ["Backend", "C#, .NET / ASP.NET Core, Web API, EF Core, LINQ, Minimal APIs"],
  ["Architecture", "Clean Architecture, Modular Monolith, DDD, CQRS / MediatR, N-Tier, SOLID"],
  ["Data", "PostgreSQL (indexing, query plans), SQL Server, Redis, MongoDB"],
  ["Quality", "Hangfire, Hosted Services, xUnit, Swagger / Postman"],
  ["Security", "JWT, granular RBAC, payment gateways, POS terminals, IAP"],
  ["Product", "React, React Native / Expo, Tailwind, Figma, Docker, GitHub"],
];
for (const [k, v] of skills) {
  doc.font("sans-bold").fontSize(8).fillColor(C.ink).text(k, rx, y);
  y += 11;
  doc.font("sans").fontSize(7.4).fillColor(C.muted).text(v, rx, y, { width: rw, lineGap: 1.4 });
  y = doc.y + 8;
}

y += 4;
y = heading(doc, "Education", rx, y, rw);
doc.font("sans-bold").fontSize(8.4).fillColor(C.ink).text("University of Tabriz", rx, y);
y += 12;
doc.font("sans").fontSize(7.4).fillColor(C.muted)
  .text("B.Sc. Computer Engineering", rx, y, { width: rw });
y = doc.y + 2;
doc.text("Sep 2024 — Exp. Jun 2028", rx, y, { width: rw });
y = doc.y + 2;
doc.text("Data Structures, Algorithms, Databases, Software Engineering, OS", rx, y, { width: rw });
y = doc.y + 12;

y = heading(doc, "Languages", rx, y, rw);
doc.font("sans-bold").fontSize(8).fillColor(C.ink).text("Persian", rx, y, { lineBreak: false });
doc.font("sans").fillColor(C.muted).text("  —  Native", rx + doc.widthOfString("Persian"), y);
y += 12;
doc.font("sans-bold").fillColor(C.ink).text("English", rx, y, { lineBreak: false });
doc.font("sans").fillColor(C.muted).text("  —  Professional working", rx + doc.widthOfString("English"), y);
y += 22;

y = heading(doc, "Now shipping", rx, y, rw);
roundRect(doc, rx, y, rw, 78, 8);
doc.fillColor(C.dark).fill();
doc.font("sans-bold").fontSize(7.6).fillColor(C.cream).text("Live product surfaces", rx + 8, y + 9);
const live = ["konkurplus.com", "karafan.irantvto.ir", "mozayedegar.ir", "matin-tavakoli.github.io"];
live.forEach((u, i) => {
  doc.fillColor(C.accentSoft).circle(rx + 12, y + 28 + i * 11, 1.2).fill();
  doc.fillColor("#d7dce8").font("sans").fontSize(7).text(u, rx + 18, y + 23.5 + i * 11);
});


// main column
const mx = railW + 16;
const mw = W - mx - 18;
y = bodyTop + 16;

y = heading(doc, "Summary", mx, y, mw);
y = wrapRich(
  doc,
  "Results-driven software engineer in the **C# / .NET** ecosystem, shipping maintainable architectures, high-throughput APIs, and enterprise systems. Proven with **Clean Architecture**, **Modular Monolith**, and **DDD**. Strong on PostgreSQL & SQL Server design, Redis caching, and Hangfire background work — backend-first, with full-stack range in React, React Native, and Figma.",
  mx,
  y,
  mw,
  8.3,
  11.4
);
y += 8;

y = heading(doc, "Experience", mx, y, mw);
const moza = path.join(ROOT, "assets/projects/mozayedegar-pdf.jpg");
clipRoundImage(doc, moza, mx, y - 1, 13, 3);
doc.font("sans-bold").fontSize(11).fillColor(C.ink).text("Backend Developer  ·  .NET / C#", mx + 17, y, { width: mw - 110 });
doc.font("mono").fontSize(7).fillColor(C.accent).text("Nov 2025 — Present", mx, y + 2, { width: mw, align: "right" });
y += 15;
doc.font("sans-semi").fontSize(8.2).fillColor(C.accent).text("Mozayedegar Co.", mx, y, { lineBreak: false });
doc.font("sans").fillColor(C.muted).text("Tabriz, Iran", mx, y, { width: mw, align: "right" });
y += 13;

const chips = [
  [path.join(ROOT, "assets/projects/karafan-pdf.jpg"), "Karafan"],
  [path.join(ROOT, "assets/projects/mozayedegar-pdf.jpg"), "Mozayedegar"],
];
let chipX = mx;
for (const [file, label] of chips) {
  roundRect(doc, chipX, y, 62, 14, 4);
  doc.fillColor("#e8e2d6").fill();
  clipRoundImage(doc, file, chipX + 2, y + 2, 10, 2);
  doc.font("sans-semi").fontSize(6.2).fillColor(C.ink).text(label, chipX + 14, y + 3.5);
  chipX += 68;
}
y += 18;
y = bullets(doc, [
  "**Karafan** (karafan.irantvto.ir): led the full server-side system for a nationwide National TVTO platform on .NET Core and Clean Architecture.",
  "Designed a multi-tiered **RBAC** engine for institutional and coaching permissions; built checkout and appointment services with physical **POS** and bank gateways.",
  "Tuned PostgreSQL plans/indexes and layered **Redis** to cut latency on heavy reporting endpoints; backed transactions with **xUnit** and functional tests.",
  "**Tickcar & Ticktruck**: procurement/inspection modules with DDD bounded contexts; offloaded PDFs and schedules to **Hangfire**.",
  "**Mozayedegar** (mozayedegar.ir): REST APIs with CQRS via MediatR, isolating command and query pipelines.",
], mx, y, mw);
y += 6;

y = heading(doc, "Ventures", mx, y, mw);

function project(title, when, role, items, tagList, logoFile) {
  if (logoFile) {
    clipRoundImage(doc, logoFile, mx, y - 1, 14, 3.5);
  }
  doc.font("sans-bold").fontSize(10).fillColor(C.ink).text(title, mx + (logoFile ? 19 : 0), y, { width: mw - 108 });
  doc.font("mono").fontSize(7).fillColor(C.accent).text(when, mx, y + 1.5, { width: mw, align: "right" });
  y += 13;
  doc.font("sans-semi").fontSize(7.4).fillColor(C.muted).text(role, mx, y);
  y += 12;
  y = bullets(doc, items, mx, y, mw);
  y = tags(doc, tagList, mx, y + 1) + 6;
}

const P = (name) => path.join(ROOT, "assets/projects", name);

project(
  "Konkur Plus — konkurplus.com",
  "2025 — Present",
  "Co-Founder & Full-Stack Engineer  ·  EdTech",
  [
    "Modular monolith in .NET (schema-per-module PostgreSQL, MediatR, JWT) with isolated Identity, Learning, AI, Orders, and Support domains.",
    "React Native / Expo app: study timers, planners, exam engines, Cafe Bazaar & Myket IAP, plus LLM agents and Redis leaderboards.",
  ],
  ["Modular Monolith", ".NET", "React Native", "LLM", "IAP"],
  P("konkurplus-pdf.jpg")
);

project(
  "Golabi — Construction accounting",
  "2025 — Present",
  "Co-Founder & Product Designer  ·  RTL desktop product",
  [
    "Figma design system for contractor finance: projects, units, sales, installments, cheques, counterparties.",
    "Persian RTL client in React + Vite + Tailwind (shadcn/ui) — dense desktop workspace, not a marketing site.",
  ],
  ["Figma", "React", "Tailwind", "RTL / FA"],
  P("golabi-pdf.jpg")
);

project(
  "Sellura — Inventory & supply chain",
  "2025",
  "Product Designer & Full-Stack Developer",
  [
    "Multi-tier stock flow from suppliers and drivers through warehouse tracking and retail POS; N-Tier C# /.NET backend for adjustments, audit logs, and P&L.",
  ],
  ["N-Tier", "C# .NET", "React"],
  P("sellura-pdf.jpg")
);

// footer
doc.rect(0, H - footH, W, footH).fill(C.dark);
doc.font("mono").fontSize(6.4).fillColor("#8b93a7");
doc.text("MATIN TAVAKOLI  ·  SOFTWARE ENGINEER", 16, H - 14, { lineBreak: false, characterSpacing: 0.8 });
doc.text("MATIN-TAVAKOLI.GITHUB.IO", 16, H - 14, { width: W - 32, align: "right", characterSpacing: 0.8 });

doc.end();

doc.on("end", () => {
  const size = fs.statSync(out).size;
  console.log(`wrote ${out} (${size} bytes)`);
});
