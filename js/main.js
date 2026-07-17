/* Dhruv — Portfolio Site — main.js */

(function () {
  'use strict';

  // Mark JS as active so CSS only hides .reveal elements pre-animation
  // once something is actually guaranteed to reveal them again.
  document.documentElement.classList.add('js');

  // ── Custom cursor dot ────────────────────────────────────────────────────
  var cursorDot = document.querySelector('.cursor-dot');
  if (cursorDot && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var dotX = mouseX;
    var dotY = mouseY;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.classList.add('is-active');
    });
    document.addEventListener('mouseleave', function () {
      cursorDot.classList.remove('is-active');
    });

    var renderCursor = function () {
      dotX += (mouseX - dotX) * 0.2;
      dotY += (mouseY - dotY) * 0.2;
      cursorDot.style.transform = 'translate(' + (dotX + 16).toFixed(1) + 'px, ' + (dotY + 16).toFixed(1) + 'px) translate(-50%, -50%)';
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    var hoverTargets = document.querySelectorAll('a, button, .skill-tile, .persona-card__btn');
    hoverTargets.forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursorDot.classList.add('is-hovering'); });
      el.addEventListener('mouseleave', function () { cursorDot.classList.remove('is-hovering'); });
    });
  }

  // ── Header scroll state ─────────────────────────────────────────────────
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // ── Mobile nav toggle ────────────────────────────────────────────────────
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.documentElement.classList.toggle('nav-locked', isOpen);
    });

    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('nav-locked');
      });
    });
  }

  // ── Persona photo scroll parallax ───────────────────────────────────────
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    var updateParallax = function () {
      var viewportCenter = window.innerHeight / 2;
      parallaxEls.forEach(function (el) {
        var rect = el.parentElement.getBoundingClientRect();
        var elCenter = rect.top + rect.height / 2;
        var offset = (elCenter - viewportCenter) * 0.08;
        offset = Math.max(-18, Math.min(18, offset));
        el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
      });
    };
    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax);
    updateParallax();
  }

  // ── Blog carousel ────────────────────────────────────────────────────────
  var blogTrack = document.getElementById('blogCarouselTrack');

  if (blogTrack) {
    var blogSlides = blogTrack.querySelectorAll('.blog-carousel__slide');
    var blogOffset = 0;

    var getBlogStep = function () {
      var slide = blogSlides[0];
      if (!slide) return 0;
      var style = getComputedStyle(blogTrack);
      var gap = parseFloat(style.columnGap || style.gap) || 0;
      return slide.getBoundingClientRect().width + gap;
    };
    var getBlogMaxOffset = function () {
      var viewport = blogTrack.parentElement;
      return Math.max(0, blogTrack.scrollWidth - viewport.clientWidth);
    };
    var applyBlogOffset = function () {
      blogOffset = Math.max(0, Math.min(blogOffset, getBlogMaxOffset()));
      blogTrack.style.transform = 'translateX(-' + blogOffset.toFixed(1) + 'px)';
    };
    var shiftBlog = function (direction) {
      var max = getBlogMaxOffset();
      if (direction > 0) {
        if (blogOffset >= max - 0.5) {
          blogOffset = 0;
        } else {
          blogOffset = Math.min(blogOffset + getBlogStep(), max);
        }
      } else {
        if (blogOffset <= 0.5) {
          blogOffset = max;
        } else {
          blogOffset = Math.max(blogOffset - getBlogStep(), 0);
        }
      }
      applyBlogOffset();
    };

    var prevArrow = document.querySelector('.blog-carousel__arrow--prev');
    var nextArrow = document.querySelector('.blog-carousel__arrow--next');
    if (prevArrow) prevArrow.addEventListener('click', function () { shiftBlog(-1); });
    if (nextArrow) nextArrow.addEventListener('click', function () { shiftBlog(1); });

    window.addEventListener('resize', applyBlogOffset);
    setInterval(function () { shiftBlog(1); }, 18000);
  }

  // ── Projects page tabs ───────────────────────────────────────────────────
  var projectTabs = document.querySelectorAll('.projects-tab');
  if (projectTabs.length) {
    projectTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        projectTabs.forEach(function (t) {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');

        document.querySelectorAll('.projects-panel').forEach(function (panel) {
          panel.classList.remove('is-active');
        });
        var panel = document.getElementById('panel-' + tab.dataset.tab);
        if (panel) panel.classList.add('is-active');
      });
    });
  }

  // ── Scroll-reveal animation ─────────────────────────────────────────────
  var revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 60 + 'ms';
      observer.observe(el);
    });

    // Safety net: if the observer never fires (throttled background tab,
    // reduced-motion setups, odd browser edge cases), don't leave content
    // permanently invisible.
    setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      observer.disconnect();
    }, 2000);
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ── Contact form (Formspree) ─────────────────────────────────────────────
  var contactForm = document.getElementById('contactForm');
  var contactFormStatus = document.getElementById('contactFormStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = contactForm.querySelector('.about-form__submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      contactFormStatus.textContent = '';
      contactFormStatus.classList.remove('about-form__status--error');

      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          contactFormStatus.textContent = "Thanks for reaching out! I'll get back to you soon.";
          contactForm.reset();
        } else {
          contactFormStatus.textContent = 'Something went wrong. Please try again or email me directly.';
          contactFormStatus.classList.add('about-form__status--error');
        }
      }).catch(function () {
        contactFormStatus.textContent = 'Something went wrong. Please try again or email me directly.';
        contactFormStatus.classList.add('about-form__status--error');
      }).finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      });
    });
  }

})();
