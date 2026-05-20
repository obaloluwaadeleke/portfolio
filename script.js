/* =========================
   script.js
   Obaloluwa Enoch Adeleke — Portfolio
   Vanilla JavaScript — Production Ready
========================= */

'use strict';

// =========================
// UTILITIES
// =========================

/**
 * Shorthand query selectors
 */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/**
 * Run function after DOM is ready
 */
const onReady = (fn) => {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
};


// =========================
// PRELOADER
// =========================

const initPreloader = () => {
  const preloader = $('#preloader');
  if (!preloader) return;

  // A17: If user prefers reduced motion, skip preloader entirely
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    preloader.style.display = 'none';
    document.body.style.overflow = '';
    return;
  }

  // Section 2: Preloader duration capped at 600ms maximum
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('loaded');
      document.body.style.overflow = '';
    }, 600);
  });

  // Prevent scroll during preload
  document.body.style.overflow = 'hidden';
};


// =========================
// CUSTOM CURSOR
// =========================

const initCursor = () => {
  const cursor = $('#cursor');
  const follower = $('#cursor-follower');
  if (!cursor || !follower) return;

  // Only on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) {
    cursor.style.display = 'none';
    follower.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  // Smooth follower animation loop
  const animateFollower = () => {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';
    requestAnimationFrame(animateFollower);
  };
  animateFollower();

  // Hover effect on interactive elements
  const hoverTargets = $$('a, button, .project-card, .service-card, .why-item, .cert-card, .tft-pillar, .testimonials__btn');

  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor--hover');
      follower.classList.add('cursor--hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor--hover');
      follower.classList.remove('cursor--hover');
    });
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    follower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    follower.style.opacity = '1';
  });
};


// =========================
// STICKY NAVBAR
// =========================

const initNavbar = () => {
  const header = $('#header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run on init
};


// =========================
// MOBILE NAVIGATION
// A4: Dialog pattern with focus trap, aria-expanded, Escape key
// =========================

const initMobileNav = () => {
  const burger = $('#nav-burger');
  const mobileNav = $('#mobile-nav');
  const mobileLinks = $$('.mobile-nav__link');
  if (!burger || !mobileNav) return;

  let previouslyFocusedElement = null;

  // Returns all focusable elements inside the nav
  const getFocusableElements = () => {
    return Array.from(
      mobileNav.querySelectorAll(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled'));
  };

  // Focus trap handler
  const handleTrapFocus = (e) => {
    if (e.key !== 'Tab') return;
    const focusable = getFocusableElements();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const openNav = () => {
    previouslyFocusedElement = document.activeElement;
    mobileNav.removeAttribute('hidden');
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    burger.classList.add('open');
    // Focus first focusable element inside dialog
    const focusable = getFocusableElements();
    if (focusable.length) focusable[0].focus();
    mobileNav.addEventListener('keydown', handleTrapFocus);
  };

  const closeNav = () => {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    burger.classList.remove('open');
    mobileNav.removeEventListener('keydown', handleTrapFocus);
    // Restore focus to burger after a brief delay for transition
    requestAnimationFrame(() => {
      mobileNav.setAttribute('hidden', '');
      if (previouslyFocusedElement) previouslyFocusedElement.focus();
    });
  };

  burger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('open');
    isOpen ? closeNav() : openNav();
  });

  // Close on link click
  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeNav();
  });
};


// =========================
// ACTIVE NAV LINK ON SCROLL
// =========================

const initActiveNavLinks = () => {
  const sections = $$('section[id]');
  const navLinks = $$('.nav__link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
};


// =========================
// SMOOTH SCROLLING
// =========================

const initSmoothScroll = () => {
  const anchors = $$('a[href^="#"]');

  anchors.forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();

      const navHeight = document.getElementById('header')?.offsetHeight || 80;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });
    });
  });
};


// =========================
// SCROLL REVEAL ANIMATIONS
// =========================

const initScrollReveal = () => {
  const elements = $$('.reveal');
  if (!elements.length) return;

  // Add staggered delays within the same parent
  const addStaggerDelay = () => {
    const parents = new Map();

    elements.forEach((el) => {
      const parent = el.parentElement;
      if (!parents.has(parent)) {
        parents.set(parent, []);
      }
      parents.get(parent).push(el);
    });

    parents.forEach((children) => {
      if (children.length > 1) {
        children.forEach((child, i) => {
          if (!child.style.transitionDelay) {
            child.style.transitionDelay = `${i * 0.08}s`;
          }
        });
      }
    });
  };

  addStaggerDelay();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
  );

  elements.forEach((el) => observer.observe(el));
};


// =========================
// ANIMATED COUNTERS
// =========================

const initCounters = () => {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  // A17: If reduced motion, jump to final value immediately
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);

    if (reducedMotion) {
      el.textContent = target;
      return;
    }

    const duration = 1800;
    const startTime = performance.now();

    const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(ease(progress) * target);
      el.textContent = value;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
};


// =========================
// TESTIMONIALS SLIDER
// A19: Dots created as <button> elements (initKeyboardNav removed)
// =========================

const initTestimonialsSlider = () => {
  const slider = $('#testimonials-slider');
  const dotsContainer = $('#testimonials-dots');
  const prevBtn = $('#prev-testimonial');
  const nextBtn = $('#next-testimonial');
  if (!slider) return;

  const cards = $$('.testimonial-card');
  let current = 0;
  let autoPlayTimer = null;

  // Build dots as <button> elements (A19: native button handles keyboard)
  if (dotsContainer) {
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('testimonials__dot');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }

  const updateDots = (index) => {
    $$('.testimonials__dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  };

  const goTo = (index) => {
    cards[current].classList.remove('active');
    current = (index + cards.length) % cards.length;
    cards[current].classList.add('active');
    updateDots(current);
    resetAutoPlay();
  };

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Keyboard navigation
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // A17: Gate autoplay behind reduced-motion check
  const startAutoPlay = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    autoPlayTimer = setInterval(() => goTo(current + 1), 5500);
  };

  const resetAutoPlay = () => {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  };

  // Touch / swipe support
  let touchStartX = 0;
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
    }
  });

  startAutoPlay();
};


// =========================
// BACK TO TOP BUTTON
// =========================

const initBackToTop = () => {
  const btn = $('#back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};


// =========================
// CONTACT FORM VALIDATION
// A15: aria-invalid on showError/clearError
// A16: Replace alert() with #form-status live region
// =========================

const initContactForm = () => {
  const form = $('#contact-form');
  if (!form) return;

  const nameInput = $('#name');
  const emailInput = $('#email');
  const messageInput = $('#message');
  const successMsg = $('#form-success');
  const formStatus = $('#form-status');

  const showError = (inputEl, errorId, message) => {
    const errorEl = $(`#${errorId}`);
    if (errorEl) errorEl.textContent = message;
    if (inputEl) {
      inputEl.classList.add('error');
      // A15: mark invalid for screen readers
      inputEl.setAttribute('aria-invalid', 'true');
    }
  };

  const clearError = (inputEl, errorId) => {
    const errorEl = $(`#${errorId}`);
    if (errorEl) errorEl.textContent = '';
    if (inputEl) {
      inputEl.classList.remove('error');
      // A15: clear invalid state
      inputEl.removeAttribute('aria-invalid');
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Live validation on blur
  nameInput?.addEventListener('blur', () => {
    if (!nameInput.value.trim()) {
      showError(nameInput, 'name-error', 'Please enter your full name.');
    } else {
      clearError(nameInput, 'name-error');
    }
  });

  emailInput?.addEventListener('blur', () => {
    if (!emailInput.value.trim()) {
      showError(emailInput, 'email-error', 'Please enter your email address.');
    } else if (!validateEmail(emailInput.value)) {
      showError(emailInput, 'email-error', 'Please enter a valid email address.');
    } else {
      clearError(emailInput, 'email-error');
    }
  });

  messageInput?.addEventListener('blur', () => {
    if (!messageInput.value.trim()) {
      showError(messageInput, 'message-error', 'Please describe your project briefly.');
    } else {
      clearError(messageInput, 'message-error');
    }
  });

  // Submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Validate name
    if (!nameInput?.value.trim()) {
      showError(nameInput, 'name-error', 'Please enter your full name.');
      isValid = false;
    } else {
      clearError(nameInput, 'name-error');
    }

    // Validate email
    if (!emailInput?.value.trim()) {
      showError(emailInput, 'email-error', 'Please enter your email address.');
      isValid = false;
    } else if (!validateEmail(emailInput.value)) {
      showError(emailInput, 'email-error', 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearError(emailInput, 'email-error');
    }

    // Validate message
    if (!messageInput?.value.trim()) {
      showError(messageInput, 'message-error', 'Please describe your project briefly.');
      isValid = false;
    } else {
      clearError(messageInput, 'message-error');
    }

    if (isValid) {
      const submitBtn = form.querySelector('[type="submit"]');
      const btnText = submitBtn?.querySelector('.btn__text');

      if (btnText) btnText.textContent = 'Sending...';
      if (submitBtn) submitBtn.disabled = true;
      // Clear any previous status
      if (formStatus) formStatus.textContent = '';

      const formData = new FormData(form);

      fetch('https://formspree.io/f/xojrgrlr', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
      .then(response => {
        if (response.ok) {
          form.reset();
          if (successMsg) successMsg.classList.add('show');
          setTimeout(() => successMsg.classList.remove('show'), 5000);
          // A16: Announce success via live region instead of alert()
          if (formStatus) formStatus.textContent = "Message sent! I'll be in touch soon.";
        } else {
          // A16: Announce failure via live region instead of alert()
          if (formStatus) formStatus.textContent = 'Something went wrong. Please try again or email me directly.';
        }
      })
      .catch(() => {
        // A16: Announce network error via live region instead of alert()
        if (formStatus) formStatus.textContent = 'Something went wrong. Please try again or email me directly.';
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Send Message';
      });
    }
  });
};


// =========================
// PROJECT CARD IMAGE FALLBACK
// =========================

const initImageFallbacks = () => {
  const images = $$('img');

  // Generate gradient placeholder colors based on index
  const gradients = [
    'linear-gradient(135deg, #1c1c2e 0%, #16213e 100%)',
    'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
    'linear-gradient(135deg, #162032 0%, #1e3a4a 100%)',
    'linear-gradient(135deg, #1f1f1f 0%, #2d2d2d 100%)',
    'linear-gradient(135deg, #1a1212 0%, #2e1a1a 100%)',
  ];

  images.forEach((img, i) => {
    img.addEventListener('error', () => {
      img.style.background = gradients[i % gradients.length];
      img.style.opacity = '0.7';
      img.removeAttribute('src'); // prevent broken icon
    });
  });
};


// =========================
// HERO SECTION PARALLAX (subtle)
// A17: Gated behind prefers-reduced-motion check
// =========================

const initHeroParallax = () => {
  // A17: Skip parallax if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const glows = $$('.hero__glow');
  if (!glows.length) return;

  // Only on desktop
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;

    glows[0].style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
    if (glows[1]) glows[1].style.transform = `translate(${-x * 0.3}px, ${-y * 0.3}px)`;
  });
};


// =========================
// FOOTER CURRENT YEAR
// =========================

const initFooterYear = () => {
  const yearEls = $$('.footer__year');
  const currentYear = new Date().getFullYear();
  yearEls.forEach((el) => {
    el.textContent = currentYear;
  });

  // Also update copyright text if it has the year hardcoded
  const bottomEl = $('.footer__bottom p');
  if (bottomEl) {
    bottomEl.textContent = bottomEl.textContent.replace(/\d{4}/, currentYear);
  }
};


// =========================
// SECTION ENTRANCE TIMING FIX
// =========================

/**
 * Ensures hero content animates in after preloader
 * by triggering hero .reveal elements with a slight delay
 */
const initHeroEntrance = () => {
  const heroReveals = $$('.hero .reveal');
  if (!heroReveals.length) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      heroReveals.forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, 300 + i * 100);
      });
    }, 700); // aligned with reduced preloader cap
  });
};


// =========================
// MARQUEE PAUSE ON HOVER
// =========================

const initMarqueePause = () => {
  const track = $('.marquee-track');
  if (!track) return;

  track.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });
  track.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
  });
};


// =========================
// SERVICE CARD HOVER TILT (subtle)
// A17: Gated behind prefers-reduced-motion check
// =========================

const initCardTilt = () => {
  // A17: Skip tilt if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = $$('.service-card');
  if (window.matchMedia('(pointer: coarse)').matches) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const rotateX = ((y - midY) / midY) * -3;
      const rotateY = ((x - midX) / midX) * 3;

      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });
};

// A19: initKeyboardNav() removed — dots are now native <button> elements
// that handle keyboard interaction natively without manual role/tabindex patches.


// =========================
// INIT ALL MODULES
// =========================

onReady(() => {
  initPreloader();
  initCursor();
  initNavbar();
  initMobileNav();
  initActiveNavLinks();
  initSmoothScroll();
  initScrollReveal();
  initHeroEntrance();
  initCounters();
  initTestimonialsSlider();
  initBackToTop();
  initContactForm();
  initImageFallbacks();
  initHeroParallax();
  initFooterYear();
  initMarqueePause();
  initCardTilt();

  console.log('✦ Portfolio loaded — Obaloluwa Enoch Adeleke');
});
