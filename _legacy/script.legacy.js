// ── Leaderboard row toggle ──
function toggleRow(el, id) {
  const bars = document.getElementById('bars-' + id);
  const isOpen = bars.classList.contains('visible');
  document.querySelectorAll('.lb-bars').forEach(b => b.classList.remove('visible'));
  document.querySelectorAll('.lb-row').forEach(r => r.classList.remove('open'));
  if (!isOpen) {
    bars.classList.add('visible');
    el.classList.add('open');
    setTimeout(() => {
      bars.querySelectorAll('.bar-fill').forEach(fill => {
        fill.style.width = fill.getAttribute('data-w') + '%';
      });
    }, 30);
  }
}

// ── Task tabs ──
function switchTask(idx) {
  document.querySelectorAll('.task-btn').forEach((b, i) => b.classList.toggle('active', i === idx));
  document.querySelectorAll('.task-panel').forEach((p, i) => p.classList.toggle('active', i === idx));
}

// ── Code modal open / close ──
function openCodeModal(taskId) {
  const modal = document.getElementById('code-modal-' + taskId);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function openThinkModal(taskId) {
  const modal = document.getElementById('think-modal-' + taskId);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Close on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('bm-modal')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.bm-modal.open').forEach(m => {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  }
});

// ── Modal tab switching ──
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.bm-modal-tab');
  if (!tab) return;
  const modal = tab.closest('.bm-modal-inner');
  if (!modal) return;
  const paneId = tab.dataset.pane;
  modal.querySelectorAll('.bm-modal-tab').forEach(t => t.classList.remove('active'));
  modal.querySelectorAll('.bm-pane').forEach(p => p.classList.remove('active'));
  tab.classList.add('active');
  document.getElementById(paneId)?.classList.add('active');
});

// ── Leaderboard keyboard accessibility ──
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lb-row').forEach(row => {
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        row.click();
      }
    });
  });
});

// ── Model logos ──
document.addEventListener('DOMContentLoaded', () => {
  const logoMap = {
    'mc-osshigh':  ['logo-openai',  'OAI'],
    'mc-ossmed':   ['logo-openai',  'OAI'],
    'mc-osslow':   ['logo-openai',  'OAI'],
    'mc-gemma':    ['logo-google',  'G'],
    'mc-devstral': ['logo-mistral', 'M'],
    'mc-codestral':['logo-mistral', 'M'],
    'mc-lfm2':     ['logo-liquid',  'LQ'],
  };
  document.querySelectorAll('.model-card').forEach(card => {
    for (const [cls, [logoCls, label]] of Object.entries(logoMap)) {
      if (!card.classList.contains(cls)) continue;
      const header = card.querySelector('.mc-header');
      const name = header.querySelector('.mc-name');
      const logo = document.createElement('span');
      logo.className = `mc-logo ${logoCls}`;
      logo.textContent = label;
      header.insertBefore(logo, name);
      break;
    }
  });
});

// ── Animate OSS bars on load ──
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.oss-bar-fill').forEach(f => {
      f.style.width = (f.getAttribute('data-w') || 0) + '%';
    });
  }, 300);
});

// ── Intersection observer for fade-up ──
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.style.animationPlayState = 'running';
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up').forEach(el => {
  el.style.animationPlayState = 'paused';
  obs.observe(el);
});
