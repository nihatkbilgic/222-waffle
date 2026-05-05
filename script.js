document.documentElement.classList.add("js-enabled");

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const toast = document.querySelector("[data-toast]");
const revealItems = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("main section[id], #about, #menu, #gallery, #contact, #location, #suggestions, #qr");

const defaultSuggestions = [
  {
    name: "Elif",
    flavor: "Meyveli",
    rating: "5",
    message: "Taze meyve ve beyaz çikolata uyumu menüde mutlaka olsun."
  },
  {
    name: "Mert",
    flavor: "Bardakta",
    rating: "5",
    message: "Gel-al için bardakta waffle çok iyi olur, üstüne karamel eklenebilir."
  }
];

const suggestionsStorageKey = "twoTwoTwoWaffleSuggestions";
const storedSuggestions = JSON.parse(localStorage.getItem(suggestionsStorageKey) || "[]");
const suggestions = [...storedSuggestions, ...defaultSuggestions];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function closeNav() {
  document.body.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Menüyü aç");
}

function openNav() {
  document.body.classList.add("nav-open");
  navToggle.setAttribute("aria-expanded", "true");
  navToggle.setAttribute("aria-label", "Menüyü kapat");
}

navToggle.addEventListener("click", () => {
  if (document.body.classList.contains("nav-open")) {
    closeNav();
  } else {
    openNav();
  }
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = targetId && targetId.length > 1 ? document.querySelector(targetId) : null;
    if (!target) return;
    event.preventDefault();
    closeNav();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", targetId);
  });
});

function onScroll() {
  const progress = Math.min(window.scrollY / 600, 1);
  document.documentElement.style.setProperty("--hero-shift", progress.toFixed(3));
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

revealItems.forEach((item) => revealObserver.observe(item));

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const number = entry.target;
    const target = Number(number.dataset.count || 0);
    const duration = 900;
    const start = performance.now();

    function tick(now) {
      const percent = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - percent, 3);
      number.textContent = Math.round(target * eased);
      if (percent < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    countObserver.unobserve(number);
  });
}, { threshold: 0.6 });

document.querySelectorAll("[data-count]").forEach((number) => {
  number.textContent = "0";
  countObserver.observe(number);
});

const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  });
}, { rootMargin: "-40% 0px -48% 0px", threshold: 0.01 });

sections.forEach((section) => {
  if (section.id) sectionObserver.observe(section);
});

document.querySelectorAll(".gallery-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-6px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

const suggestionWall = document.querySelector("[data-suggestion-wall]");
const suggestionForm = document.querySelector("[data-suggestion-form]");

function renderSuggestions() {
  suggestionWall.innerHTML = suggestions.slice(0, 4).map((item) => `
    <article>
      <strong>${escapeHtml(item.name)} <span>${escapeHtml(item.rating)}/5</span></strong>
      <p>${escapeHtml(item.flavor)} için: ${escapeHtml(item.message)}</p>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

suggestionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(suggestionForm);
  const suggestion = {
    name: formData.get("name").toString().trim(),
    flavor: formData.get("flavor").toString().trim(),
    message: formData.get("message").toString().trim(),
    rating: formData.get("rating").toString()
  };

  if (!suggestion.name || !suggestion.flavor || !suggestion.message) {
    showToast("Lütfen öneri formunu tamamla.");
    return;
  }

  suggestions.unshift(suggestion);
  localStorage.setItem(suggestionsStorageKey, JSON.stringify(suggestions.filter((item) => !defaultSuggestions.includes(item)).slice(0, 8)));
  renderSuggestions();
  suggestionForm.reset();
  suggestionForm.rating.value = "4";
  showToast("Önerin kaydedildi. Teşekkürler!");
});

renderSuggestions();
