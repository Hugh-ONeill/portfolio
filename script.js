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
  function toggleCard(card) {
    const expanded = card.classList.toggle('expanded');
    card.setAttribute('aria-expanded', expanded);
  }

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => toggleCard(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard(card);
      }
    });
  });

  // --- Lightbox ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  let galleryItems = [];
  let galleryIndex = 0;

  function showSlide(i) {
    galleryIndex = (i + galleryItems.length) % galleryItems.length;
    lightboxImg.src = galleryItems[galleryIndex].src;
    lightboxCaption.textContent = galleryItems[galleryIndex].alt;
  }

  function openLightbox(src, alt, items, index) {
    lightboxImg.src = src;
    lightboxCaption.textContent = alt;
    if (items && items.length > 1) {
      galleryItems = items;
      galleryIndex = index || 0;
      lightbox.classList.add('has-gallery');
    } else {
      galleryItems = [];
      lightbox.classList.remove('has-gallery');
    }
    lightbox.classList.add('active');
  }

  function closeLightbox() {
    lightbox.classList.remove('active', 'has-gallery');
    lightboxImg.src = '';
    galleryItems = [];
  }

  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    showSlide(galleryIndex - 1);
  });

  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    showSlide(galleryIndex + 1);
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (galleryItems.length > 1) {
      if (e.key === 'ArrowLeft') showSlide(galleryIndex - 1);
      if (e.key === 'ArrowRight') showSlide(galleryIndex + 1);
    }
  });

  // single-image containers
  document.querySelectorAll('.showcase-img, .fun-img').forEach(container => {
    const img = container.querySelector('img');
    if (img && img.getAttribute('src') !== '') {
      container.addEventListener('click', () => openLightbox(img.src, img.alt));
    }
  });

  // gallery — collect all items for navigation
  const gallerySlides = document.querySelectorAll('.gallery-item');
  const slideData = Array.from(gallerySlides).map(item => {
    const img = item.querySelector('img');
    const caption = item.querySelector('figcaption');
    return { src: img.src, alt: caption ? caption.textContent : img.alt };
  });

  gallerySlides.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(slideData[i].src, slideData[i].alt, slideData, i));
  });

  // --- Gallery auto-scroll ---
  const gallery = document.querySelector('.showcase-gallery');
  if (gallery) {
    let autoScrollTimer = null;
    let paused = false;
    const scrollInterval = 5000;

    function autoAdvance() {
      if (paused) return;
      const itemWidth = gallery.scrollWidth / gallerySlides.length;
      const maxScroll = gallery.scrollWidth - gallery.clientWidth;
      if (gallery.scrollLeft >= maxScroll - 2) {
        gallery.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        gallery.scrollBy({ left: itemWidth, behavior: 'smooth' });
      }
    }

    function startAutoScroll() {
      stopAutoScroll();
      autoScrollTimer = setInterval(autoAdvance, scrollInterval);
    }

    function stopAutoScroll() {
      if (autoScrollTimer) clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }

    gallery.addEventListener('mouseenter', () => { paused = true; });
    gallery.addEventListener('mouseleave', () => { paused = false; });
    gallery.addEventListener('touchstart', () => { paused = true; }, { passive: true });
    gallery.addEventListener('touchend', () => {
      paused = false;
      startAutoScroll();
    });

    // pause while lightbox is open
    const origOpen = openLightbox;
    const origClose = closeLightbox;

    startAutoScroll();
  }

  // =========================================
  // MOUSE PARALLAX — Hero floating symbols
  // =========================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
