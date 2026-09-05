const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

menuBtn?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const sections = [...document.querySelectorAll("section[id]")];
const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];

const spy = () => {
  const y = window.scrollY + 96;
  let current = sections[0]?.id;
  for (const section of sections) {
    if (section.offsetTop <= y) current = section.id;
  }
  navAnchors.forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
  });
};

window.addEventListener("scroll", spy, { passive: true });
spy();

// Scroll-triggered reveal (replaces load-only animation for below-the-fold content)
const revealTargets = document.querySelectorAll(
  ".section-head, .prose, .skill-card, .job, .card, .panel, .meta"
);

if ("IntersectionObserver" in window) {
  revealTargets.forEach((el) => el.classList.add("reveal-io"));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );

  revealTargets.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
    io.observe(el);
  });
} else {
  revealTargets.forEach((el) => el.classList.add("in-view"));
}

// Magnetic hover glow on cards — follows cursor for a subtle spotlight effect
const glowEls = document.querySelectorAll(".card, .skill-card, .panel, .job");
glowEls.forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  });
});
