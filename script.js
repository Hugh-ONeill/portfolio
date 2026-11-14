// Mouse-reactive parallax hero + scroll utilities

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Theme Switcher ---
  const themeSwitcher = document.getElementById('theme-switcher');
  const itchEmbed = document.getElementById('itch-embed');

  // itch.io embed colors per theme: bg, fg, link, border
  const itchColors = {
    '':          { bg: '1e1e2e', fg: 'cdd6f4', link: '89dceb', border: '45475a' },
    cardstock:   { bg: 'e4dcd0', fg: '2c2622', link: '688898', border: 'ccc4b8' },
    cassette:    { bg: '1a1028', fg: 'f8f0e8', link: 'f03888', border: '2e203e' },
    cavelight:   { bg: '100304', fg: 'f4e8e4', link: '80a090', border: '220708' },
    chalkboard:  { bg: '151518', fg: 'eef0f2', link: 'acc4d8', border: '252628' },
    confetti:    { bg: '120e0e', fg: 'f4e0e8', link: '78d0ec', border: '302828' },
    crocus:      { bg: '131018', fg: 'ece8f0', link: '9878b0', border: '24202e' },
    crystal:     { bg: '1a1424', fg: 'f0e8f8', link: '8878c8', border: '2e243c' },
    cyberpunk:   { bg: '060c10', fg: 'f0faff', link: 'a078ff', border: '18242c' },
  };

  function updateItchEmbed(theme) {
    if (!itchEmbed) return;
    const c = itchColors[theme] || itchColors[''];
    itchEmbed.src = `https://itch.io/embed/4314893?bg_color=${c.bg}&fg_color=${c.fg}&link_color=${c.link}&border_color=${c.border}`;
  }

  const saved = localStorage.getItem('portfolio-theme');
  if (saved) {
    document.documentElement.dataset.theme = saved;
    themeSwitcher.value = saved;
    updateItchEmbed(saved);
  }
  themeSwitcher.addEventListener('change', (e) => {
    const theme = e.target.value;
    if (theme) {
      document.documentElement.dataset.theme = theme;
    } else {
      delete document.documentElement.dataset.theme;
    }
    localStorage.setItem('portfolio-theme', theme);
    updateItchEmbed(theme);
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
  function toggleCard(card) {
    const expanded = card.classList.toggle('expanded');
    card.setAttribute('aria-expanded', expanded);
  }

  // --- Expandable experience cards ---
  // the <summary> is the real control; clicking elsewhere on the card is
  // a pointer convenience on top of it
  document.querySelectorAll('.project-card').forEach(card => {
    const details = card.querySelector('details');
    if (!details) return;
    card.addEventListener('click', (e) => {
      if (e.target.closest('summary, a')) return;
      if (String(window.getSelection())) return;
      details.open = !details.open;
    });
  });

  // --- Lightbox ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  let slides = [];
  let slideIndex = 0;

  function showSlide(i) {
    slideIndex = (i + slides.length) % slides.length;
    lightboxImg.src = slides[slideIndex].full;
    lightboxImg.alt = slides[slideIndex].alt;
    lightboxCaption.textContent = slides[slideIndex].caption;
  }

  function openLightbox(items, index) {
    slides = items;
    lightbox.classList.toggle('has-gallery', items.length > 1);
    showSlide(index);
    lightbox.showModal();
  }

  // Esc, the close button, and backdrop clicks all end up here
  lightbox.addEventListener('close', () => {
    lightboxImg.removeAttribute('src');
    slides = [];
  });

  lightboxPrev.addEventListener('click', () => showSlide(slideIndex - 1));
  lightboxNext.addEventListener('click', () => showSlide(slideIndex + 1));

  lightbox.addEventListener('keydown', (e) => {
    if (slides.length < 2) return;
    if (e.key === 'ArrowLeft') showSlide(slideIndex - 1);
    if (e.key === 'ArrowRight') showSlide(slideIndex + 1);
  });

  // backdrop click for browsers without <dialog closedby>
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    lightbox.addEventListener('click', (e) => {
      // the prev/next/close buttons sit outside the box but are children
      if (e.target !== lightbox) return;
      const rect = lightbox.getBoundingClientRect();
      const inside = rect.top <= e.clientY && e.clientY <= rect.bottom &&
        rect.left <= e.clientX && e.clientX <= rect.right;
      if (!inside) lightbox.close();
    });
  }

  // data-alt carries a fuller description where the caption is only a name
  const slideFor = (trigger) => ({
    full: trigger.dataset.full,
    caption: trigger.dataset.caption,
    alt: trigger.dataset.alt || trigger.dataset.caption,
  });

  // gallery thumbnails share one set so prev/next can walk them
  const galleryTriggers = Array.from(document.querySelectorAll('.gallery-item .lightbox-trigger'));
  const gallerySlides = galleryTriggers.map(slideFor);
  galleryTriggers.forEach((trigger, i) => {
    trigger.addEventListener('click', () => openLightbox(gallerySlides, i));
  });

  document.querySelectorAll('.lightbox-trigger').forEach(trigger => {
    if (galleryTriggers.includes(trigger)) return;
    trigger.addEventListener('click', () => openLightbox([slideFor(trigger)], 0));
  });

  // --- Gallery auto-scroll ---
  const gallery = document.querySelector('.showcase-gallery');
  if (gallery && galleryTriggers.length && !prefersReducedMotion) {
    const scrollInterval = 5000;
    let touching = false;

    // hover, keyboard focus, touch, or an open lightbox all hold it still
    const isPaused = () => touching || lightbox.open || document.hidden ||
      gallery.matches(':hover') || gallery.contains(document.activeElement);

    setInterval(() => {
      if (isPaused()) return;
      const itemWidth = gallery.scrollWidth / galleryTriggers.length;
      const maxScroll = gallery.scrollWidth - gallery.clientWidth;
      if (gallery.scrollLeft >= maxScroll - 2) {
        gallery.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        gallery.scrollBy({ left: itemWidth, behavior: 'smooth' });
      }
    }, scrollInterval);

    gallery.addEventListener('touchstart', () => { touching = true; }, { passive: true });
    gallery.addEventListener('touchend', () => { touching = false; });
  }

  // --- Demo clips ---
  // play only while on screen; with reduced motion the poster stays put
  const clips = document.querySelectorAll('.fun-img video');
  if (clips.length && !prefersReducedMotion) {
    const clipObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.play().catch(() => {});
        } else {
          entry.target.pause();
        }
      });
    }, { threshold: 0.25 });
    clips.forEach(clip => clipObserver.observe(clip));
  }

  // =========================================
  // MOUSE PARALLAX — Hero floating symbols
  // =========================================
  const heroFloats = document.querySelectorAll('.hero-float');
  const heroSection = document.querySelector('.hero');
  let mouseX = 0.5, mouseY = 0.5;
  let smoothX = 0.5, smoothY = 0.5;
  let heroVisible = true;
  let rafId = null;

  if (heroSection && !prefersReducedMotion) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
    });

    heroSection.addEventListener('mouseleave', () => {
      mouseX = 0.5;
      mouseY = 0.5;
    });

    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible && !rafId) rafId = requestAnimationFrame(animateFloats);
    }, { threshold: 0 }).observe(heroSection);

    function animateFloats() {
      if (!heroVisible) { rafId = null; return; }

      smoothX += (mouseX - smoothX) * 0.06;
      smoothY += (mouseY - smoothY) * 0.06;

      const ox = (smoothX - 0.5) * 2; // -1 to 1
      const oy = (smoothY - 0.5) * 2;

      heroFloats.forEach(el => {
        const depth = parseFloat(el.dataset.speed) * 350;
        el.style.transform = `translate(${ox * depth}px, ${oy * depth}px)`;
      });

      rafId = requestAnimationFrame(animateFloats);
    }

    rafId = requestAnimationFrame(animateFloats);
  }
})();
