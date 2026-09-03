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
