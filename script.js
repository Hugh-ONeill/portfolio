// Mouse-reactive parallax hero + scroll utilities

(function () {
  'use strict';

  // --- Theme Switcher ---
  const themeSwitcher = document.getElementById('theme-switcher');
  const saved = localStorage.getItem('portfolio-theme');
  if (saved) {
    document.documentElement.dataset.theme = saved;
    themeSwitcher.value = saved;
  }
  themeSwitcher.addEventListener('change', (e) => {
    const theme = e.target.value;
    if (theme) {
      document.documentElement.dataset.theme = theme;
    } else {
      delete document.documentElement.dataset.theme;
    }
    localStorage.setItem('portfolio-theme', theme);
  });

  // --- Nav ---
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section, .hero');

  function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }

  function updateActiveLink() {
    let current = '';
    for (const section of sections) {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.getAttribute('id');
      }
    }
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  // --- Fade-in on scroll ---
  const fadeEls = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  fadeEls.forEach(el => fadeObserver.observe(el));

  // --- Scroll indicator fade ---
  const scrollIndicator = document.querySelector('.scroll-indicator');

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateNav();
        updateActiveLink();
        if (scrollIndicator) {
          scrollIndicator.style.opacity = Math.max(0, 1 - window.scrollY / 300);
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateNav();
  updateActiveLink();

  // --- Expandable project cards ---
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('expanded'));
  });

  // =========================================
  // MOUSE PARALLAX — Hero floating symbols
  // =========================================
  const heroFloats = document.querySelectorAll('.hero-float');
  const heroSection = document.querySelector('.hero');
  let mouseX = 0.5, mouseY = 0.5;
  let smoothX = 0.5, smoothY = 0.5;

  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
    });

    heroSection.addEventListener('mouseleave', () => {
      mouseX = 0.5;
      mouseY = 0.5;
    });
  }

  function animateFloats() {
    smoothX += (mouseX - smoothX) * 0.06;
    smoothY += (mouseY - smoothY) * 0.06;

    const ox = (smoothX - 0.5) * 2; // -1 to 1
    const oy = (smoothY - 0.5) * 2;

    heroFloats.forEach(el => {
      const depth = parseFloat(el.dataset.speed) * 350;
      el.style.transform = `translate(${ox * depth}px, ${oy * depth}px)`;
    });

    requestAnimationFrame(animateFloats);
  }

  requestAnimationFrame(animateFloats);
})();
