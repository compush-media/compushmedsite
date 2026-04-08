/* ============================================================
   COMPUSH MEDIA — script.js
   Scroll reveal · Header · Mobile menu · Form
============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Header scroll state ──────────────────────────── */
  const header = document.getElementById('header');

  const updateHeader = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  /* ── 1b. Scroll progress bar ─────────────────────────── */
  const progressBar = document.getElementById('scrollProgress');

  const updateProgress = () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
    progressBar.setAttribute('aria-valuenow', Math.round(pct));
  };

  window.addEventListener('scroll', updateProgress, { passive: true });

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();


  /* ── 2. Mobile hamburger menu ────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('nav');
  let menuOpen    = false;

  const openMenu = () => {
    menuOpen = true;
    hamburger.classList.add('open');
    nav.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menuOpen = false;
    hamburger.classList.remove('open');
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    menuOpen ? closeMenu() : openMenu();
  });

  // Close on nav link click
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (menuOpen && !nav.contains(e.target) && !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });


  /* ── 3. Scroll reveal (IntersectionObserver) ─────────── */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all immediately
    revealEls.forEach(el => el.classList.add('visible'));
  }


  /* ── 4. Smooth anchor scrolling (offset for sticky header) */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerHeight = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ── 5. Active nav link on scroll ───────────────────── */
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => activeObserver.observe(s));


  /* ── 6. Demo form submission ──────────────────────────── */
  const demoForm = document.getElementById('demoForm');

  if (demoForm) {
    demoForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name  = demoForm.querySelector('#name').value.trim();
      const email = demoForm.querySelector('#email').value.trim();

      if (!name || !email) {
        showFormError(demoForm, 'Veuillez renseigner votre nom et votre email.');
        return;
      }

      if (!isValidEmail(email)) {
        showFormError(demoForm, 'Veuillez entrer une adresse email valide.');
        return;
      }

      const phone    = (demoForm.querySelector('#phone')    || {}).value || '';
      const business = (demoForm.querySelector('#business') || {}).value || '';

      // Send to Make.com → Google Sheets
      fetch('https://hook.eu1.make.com/brfzfyxl9xat8thjcgdk8wm0pmdwgpw5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date:     new Date().toLocaleString('fr-FR'),
          nom:      name,
          email:    email,
          telephone: phone,
          activite: business,
          source:   'Site web'
        })
      }).catch(() => {}); // silencieux si erreur réseau

      // Success state
      const btn = demoForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Demande envoyée — Nous vous contactons sous 24h
      `;
      btn.style.background = '#22C55E';
      btn.style.borderColor = '#22C55E';
      btn.style.color = 'white';
      btn.style.transform = 'scale(1)';

      // Animate: brief pulse feedback
      btn.animate([
        { transform: 'scale(1.01)' },
        { transform: 'scale(1)' }
      ], { duration: 300, easing: 'ease-out' });

      // Reset after 7s
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = `Demander ma démonstration personnalisée
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>`;
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
        btn.style.transform = '';
        demoForm.reset();
      }, 7000);
    });
  }

  function showFormError(form, message) {
    let err = form.querySelector('.form-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'form-error';
      err.style.cssText = 'color:#ff6b6b;font-size:.82rem;margin-top:.5rem;text-align:center;';
      form.appendChild(err);
    }
    err.textContent = message;
    setTimeout(() => { if (err.parentNode) err.remove(); }, 4000);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }


  /* ── 7. Stat counters (animate on first visible) ──────── */
  const statEls = document.querySelectorAll('.stat__number[data-target]');

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statEls.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = target > 50 ? 1800 : 1400; /* larger numbers get more time */
    const start    = performance.now();

    const update = (time) => {
      const elapsed  = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOut(progress) * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    };

    requestAnimationFrame(update);
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }


  /* ── 8. Sticky mobile CTA (UX 3) ─────────────────────── */
  const mobileCta   = document.getElementById('mobileCta');
  const heroSection = document.getElementById('accueil');
  const ctaSection  = document.getElementById('contact');

  if (mobileCta) {
    const mobilCtaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === heroSection) {
          // Show bar once user scrolls past hero
          if (!entry.isIntersecting) {
            mobileCta.classList.add('visible');
          } else {
            mobileCta.classList.remove('visible');
          }
        }
        if (entry.target === ctaSection) {
          // Hide bar when contact section is visible (form is on screen)
          if (entry.isIntersecting) {
            mobileCta.classList.remove('visible');
          }
        }
      });
    }, { threshold: 0.1 });

    if (heroSection) mobilCtaObserver.observe(heroSection);
    if (ctaSection)  mobilCtaObserver.observe(ctaSection);
  }


  /* ── 9. Video modal (Conversion 2) ───────────────────── */
  const videoBtn      = document.getElementById('videoBtn');
  const videoModal    = document.getElementById('videoModal');
  const videoClose    = document.getElementById('videoClose');
  const videoBackdrop = document.getElementById('videoBackdrop');
  const videoCta      = document.getElementById('videoCta');
  const demoVideo     = document.getElementById('demoVideo');

  const openVideoModal = () => {
    videoModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (demoVideo) demoVideo.play();
  };
  const closeVideoModal = () => {
    videoModal.classList.remove('open');
    document.body.style.overflow = '';
    if (demoVideo) { demoVideo.pause(); demoVideo.currentTime = 0; }
  };

  if (videoBtn)      videoBtn.addEventListener('click', openVideoModal);
  if (videoClose)    videoClose.addEventListener('click', closeVideoModal);
  if (videoBackdrop) videoBackdrop.addEventListener('click', closeVideoModal);
  if (videoCta)      videoCta.addEventListener('click', closeVideoModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('open')) {
      closeVideoModal();
    }
  });


  /* ── 10. Social proof counter (Conversion 1) ──────────── */
  const demoCountEl = document.getElementById('demoCount');
  const liveCountEl = document.getElementById('liveCount');
  if (demoCountEl || liveCountEl) {
    let count = 12;
    const setAll = (val) => {
      if (demoCountEl) demoCountEl.textContent = val;
      if (liveCountEl) liveCountEl.textContent = val;
    };
    setAll(count);
    setInterval(() => {
      if (Math.random() > 0.6) {
        count += 1;
        setAll(count);
      }
    }, 9000);
  }


  /* ── 11. Exit-intent popup (Conversion 3) ─────────────── */
  const exitPopup    = document.getElementById('exitPopup');
  const exitClose    = document.getElementById('exitClose');
  const exitBackdrop = document.getElementById('exitBackdrop');
  const exitForm     = document.getElementById('exitForm');
  let   exitShown    = false;

  const openExit  = () => {
    if (exitShown) return;
    exitShown = true;
    exitPopup.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeExit = () => {
    exitPopup.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (exitClose)    exitClose.addEventListener('click', closeExit);
  if (exitBackdrop) exitBackdrop.addEventListener('click', closeExit);

  // Desktop: mouse leaves viewport toward top
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 10 && !exitShown) openExit();
  });

  // Mobile: back button / popstate hint
  // Push a dummy state so we can catch the back gesture
  history.pushState({ exitIntent: true }, '');
  window.addEventListener('popstate', () => {
    if (!exitShown) {
      openExit();
      // Restore state so navigation still works after closing
      history.pushState({ exitIntent: true }, '');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && exitPopup && exitPopup.classList.contains('open')) {
      closeExit();
    }
  });

  // Exit form submission
  if (exitForm) {
    exitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('exitEmail');
      if (!emailInput || !isValidEmail(emailInput.value.trim())) {
        emailInput.style.borderColor = 'rgba(255,100,100,.6)';
        setTimeout(() => { emailInput.style.borderColor = ''; }, 2000);
        return;
      }

      // Envoi vers Make → Google Sheets
      fetch('https://hook.eu1.make.com/brfzfyxl9xat8thjcgdk8wm0pmdwgpw5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date:      new Date().toLocaleString('fr-FR'),
          nom:       '',
          email:     emailInput.value.trim(),
          telephone: '',
          activite:  '',
          source:    'Popup exit-intent'
        })
      }).catch(() => {});

      const btn = exitForm.querySelector('button');
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> C'est noté — à très vite !`;
      btn.style.background = '#4CAF50';
      btn.style.borderColor = '#4CAF50';
      setTimeout(closeExit, 2500);
    });
  }

});
