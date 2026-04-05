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

// Expandable code blocks
function toggleCode(btn) {
  btn.classList.toggle("open");
  const body = btn.nextElementSibling;
  body.classList.toggle("open");
}

// Animated score counters
function animateScores() {
  document.querySelectorAll(".animate-score").forEach((el) => {
    const target = parseFloat(el.dataset.final);
    if (el.tagName === "DIV" && el.dataset.final) {
      let current = 0;
      const step = target / 40;
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.childNodes[0].textContent =
          current % 1 === 0 ? current : current.toFixed(1);
      }, 30);
    }
  });
}

// Bar fill animation
function animateBars() {
  document.querySelectorAll(".bar-fill-anim").forEach((bar) => {
    setTimeout(() => {
      bar.style.width = bar.dataset.width;
    }, 500);
  });
}

// Radar Chart
function drawRadarChart() {
  const canvas = document.getElementById("radarChart");
  if (!canvas) return; // Guard clause in case element doesn't exist

  const ctx = canvas.getContext("2d");

  const size = 500;
  canvas.width = size;
  canvas.height = size;

  const center = size / 2;
  const radius = 180;
  const axes = [
    "FIM Discipline",
    "Edge Cases",
    "Async Correctness",
    "Exception Handling",
    "Code Conciseness",
    "Concurrency Reasoning",
    "Fix Correctness",
  ];

  const data = {
    gemma: [9, 9, 8, 9, 6, 8, 5],
    devstral: [8, 7, 9, 8, 9, 10, 10],
    codestral: [7, 7, 6, 4, 8, 9, 9],
  };

  const maxValue = 10;
  const numAxes = axes.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Draw grid
  for (let ring = 1; ring <= 5; ring++) {
    const r = (ring / 5) * radius;
    ctx.beginPath();
    for (let i = 0; i <= numAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw axes
  for (let i = 0; i < numAxes; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Labels
    const labelX = center + (radius + 35) * Math.cos(angle); // slightly pushed out
    const labelY = center + (radius + 35) * Math.sin(angle);
    ctx.fillStyle = "#9496a6";
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(axes[i], labelX, labelY);
  }

  // Draw data polygons
  function drawPolygon(values, color, alpha) {
    ctx.beginPath();
    for (let i = 0; i <= numAxes; i++) {
      const idx = i % numAxes;
      const value = values[idx] / maxValue;
      const r = value * radius;
      const angle = idx * angleStep - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color.replace(")", `,${alpha})`).replace("rgb", "rgba");
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    for (let i = 0; i < numAxes; i++) {
      const value = values[i] / maxValue;
      const r = value * radius;
      const angle = i * angleStep - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#0a0b0f";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Draw with alpha overlays
  drawPolygon(data.codestral, "rgb(255, 112, 67)", 0.15);
  drawPolygon(data.gemma, "rgb(76, 175, 80)", 0.15);
  drawPolygon(data.devstral, "rgb(124, 77, 255)", 0.2);
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

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  animateScores();
  animateBars();
  drawRadarChart();
});
