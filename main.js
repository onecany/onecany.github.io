/* ============================================
   ONECANY SCI-FI — main.js
   Particles, Glitch, Scroll Reveals, Nav
   ============================================ */

// ---- Particle System ----
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.connections = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.animationId = null;

    this.resize();
    this.init();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    const count = Math.min(80, Math.floor((this.canvas.width * this.canvas.height) / 15000));
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.6 ? '#ff2d95' : (Math.random() > 0.5 ? '#b829f5' : '#00f0ff')
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.init();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  drawParticle(p) {
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    this.ctx.fillStyle = p.color;
    this.ctx.globalAlpha = p.opacity;
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  }

  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 * (1 - dist / 120)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
  }

  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Mouse interaction
      if (this.mouse.x !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.x += dx * force * 0.02;
          p.y += dy * force * 0.02;
        }
      }
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.update();
    this.drawConnections();
    this.particles.forEach(p => this.drawParticle(p));
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}

// ---- Navigation ----
function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const navAnchors = document.querySelectorAll('.nav-links a');

  // Scroll behavior
  if (nav) {
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
  }

  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.classList.toggle('active');
    });

    // Close on link click
    navAnchors.forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('active');
      });
    });
  }

  // Active link highlight
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navAnchors.forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// ---- Scroll Reveal ----
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

// ---- Typing Effect ----
function typeWriter(element, text, speed = 50) {
  let i = 0;
  element.textContent = '';
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

// ---- Counter Animation ----
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    const duration = 2000;
    const start = Date.now();

    function update() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.floor(target * eased);
      if (progress < 1) requestAnimationFrame(update);
    }
    update();
  });
}

// ---- GitHub Stats ----
// Fetches live data from the GitHub REST API and renders terminal-style cards.
// (Previous implementation used third-party SVG badge services that are now dead.)
function injectGitHubStats() {
  const container = document.getElementById('github-stats');
  if (!container) return;

  const GITHUB_USER = 'onecany';
  const fallback = () => {
    container.innerHTML = `
      <div class="stats-row">
        <div class="terminal-card gh-card">
          <div class="terminal-header">
            <div class="terminal-dot red"></div>
            <div class="terminal-dot yellow"></div>
            <div class="terminal-dot green"></div>
            <span class="terminal-title">github_stats.sh</span>
          </div>
          <div class="terminal-body">
            <div><span class="prompt">$</span> <span class="cmd">gh api users/${GITHUB_USER}</span></div>
            <div class="output mt-1">
              <span class="text-cyan">public_repos:</span> multiple<br>
              <span class="text-cyan">followers:</span> growing<br>
              <span class="text-cyan">commits:</span> <span class="text-green">3,890+</span> and counting
            </div>
          </div>
        </div>
      </div>
    `;
  };

  Promise.all([
    fetch(`https://api.github.com/users/${GITHUB_USER}`),
    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`)
  ])
    .then(responses => Promise.all(responses.map(r => {
      if (!r.ok) throw new Error(`GitHub API ${r.status}`);
      return r.json();
    })))
    .then(([user, repos]) => {
      if (!user || typeof user.public_repos !== 'number') throw new Error('bad payload');
      const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
      const langCount = {};
      repos.forEach(r => {
        if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
      });
      const topLangs = Object.entries(langCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([lang]) => lang)
        .join(', ') || 'N/A';
      const latestRepo = repos[0] ? repos[0].name : 'N/A';

      container.innerHTML = `
        <div class="stats-row">
          <div class="terminal-card gh-card">
            <div class="terminal-header">
              <div class="terminal-dot red"></div>
              <div class="terminal-dot yellow"></div>
              <div class="terminal-dot green"></div>
              <span class="terminal-title">profile.json</span>
            </div>
            <div class="terminal-body">
              <div><span class="prompt">$</span> <span class="cmd">gh api users/${GITHUB_USER}</span></div>
              <div class="output mt-1">
                <span class="text-cyan">public_repos:</span> ${user.public_repos.toLocaleString()}<br>
                <span class="text-cyan">followers:</span> ${user.followers.toLocaleString()}<br>
                <span class="text-cyan">following:</span> ${user.following.toLocaleString()}
              </div>
            </div>
          </div>
          <div class="terminal-card gh-card">
            <div class="terminal-header">
              <div class="terminal-dot red"></div>
              <div class="terminal-dot yellow"></div>
              <div class="terminal-dot green"></div>
              <span class="terminal-title">repos.json</span>
            </div>
            <div class="terminal-body">
              <div><span class="prompt">$</span> <span class="cmd">gh api repos --sort=updated</span></div>
              <div class="output mt-1">
                <span class="text-cyan">total_stars:</span> ${totalStars.toLocaleString()}<br>
                <span class="text-cyan">top_langs:</span> ${topLangs}<br>
                <span class="text-cyan">latest:</span> ${latestRepo}
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .catch(fallback);
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  // Particles
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    new ParticleSystem(canvas);
  }

  // Navigation
  initNav();

  // Scroll reveals
  initScrollReveal();

  // Counter animation (trigger on visible)
  const statsSection = document.querySelector('.hero-status');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounters();
        observer.disconnect();
      }
    });
    observer.observe(statsSection);
  }

  // Dynamic content
  injectGitHubStats();

  // Typing effect for terminal
  const typingEl = document.querySelector('.typing-text');
  if (typingEl) {
    const text = typingEl.getAttribute('data-text');
    typeWriter(typingEl, text, 60);
  }
});
