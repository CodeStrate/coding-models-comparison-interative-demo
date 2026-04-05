// Tab switching logic
document.querySelectorAll(".test-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".test-tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".test-content")
      .forEach((c) => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// Animated score counters
function animateScores() {
  document.querySelectorAll(".animate-score").forEach((el) => {
    const target = parseFloat(el.dataset.final);
    if (!target) return;
    let current = 0;
    const step = target / 40;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      // Preserve child nodes (e.g. <span>/10</span>) — only update first text node
      const firstText = [...el.childNodes].find((n) => n.nodeType === 3);
      if (firstText) {
        firstText.textContent = current % 1 === 0 ? current : current.toFixed(1);
      } else {
        el.textContent = current % 1 === 0 ? current : current.toFixed(1);
      }
    }, 30);
  });
}

// Intersection Observer for fade-in animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.1 },
);

document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

// Nav link active state toggle
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", function () {
    document
      .querySelectorAll(".nav-links a")
      .forEach((l) => l.classList.remove("active"));
    this.classList.add("active");
  });
});

// Smooth scrolling mechanism
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// Modal tab switching
document.querySelectorAll(".cm-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const paneId = tab.dataset.pane;
    const inner = tab.closest(".code-modal-inner");
    inner.querySelectorAll(".cm-tab").forEach((t) => t.classList.remove("active"));
    inner.querySelectorAll(".cm-pane").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(paneId).classList.add("active");
  });
});

// Code modal open / close
function openCodeModal(id) {
  document.getElementById("modal-" + id).classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCodeModal(id) {
  document.getElementById("modal-" + id).classList.remove("open");
  document.body.style.overflow = "";
}

function handleModalBackdropClick(event) {
  if (event.target === event.currentTarget) {
    event.currentTarget.classList.remove("open");
    document.body.style.overflow = "";
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".code-modal.open").forEach((m) => {
      m.classList.remove("open");
    });
    document.body.style.overflow = "";
  }
});

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  animateScores();
});
