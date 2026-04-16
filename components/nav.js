/**
 * nav.js — Navigation Bar Behavior
 * Usage: <script src="components/nav.js"></script> before </body>
 *
 * Handles:
 *   - Scroll state: adds .is-scrolled to .nav-wrap when scrollY > 50px
 *   - Dropdowns: open on click, close on outside click or Escape
 *   - Accessibility: syncs aria-expanded on trigger buttons
 */

(function () {
  'use strict';

  function initNav() {
    const navWrap = document.getElementById('site-nav-wrap');
    if (!navWrap) return;

    // ── Scroll state ──────────────────────────────────────────────────────────
    function updateScrollState() {
      navWrap.classList.toggle('is-scrolled', window.scrollY > 50);
    }

    window.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState(); // run once on init in case page loads mid-scroll

    // ── Dropdowns ─────────────────────────────────────────────────────────────
    const navBar = navWrap.querySelector('.nav-bar');
    const triggers = navWrap.querySelectorAll('.nav-trigger');
    const productsPanel = navWrap.querySelector('.nav-products-panel');
    const featuresPanel = navWrap.querySelector('.nav-features-panel');
    const explorePanel = navWrap.querySelector('.nav-explore-panel');

    function closeAll() {
      triggers.forEach(function (trigger) {
        trigger.classList.remove('is-open');
        var btn = trigger.querySelector('.nav-link[aria-expanded]');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
      if (navBar) navBar.classList.remove('products-open', 'features-open', 'explore-open');
    }

    function open(trigger) {
      closeAll();
      trigger.classList.add('is-open');
      var btn = trigger.querySelector('.nav-link[aria-expanded]');
      if (btn) btn.setAttribute('aria-expanded', 'true');

      var panel = trigger.dataset.panel;
      if (panel && navBar) {
        navBar.classList.add(panel + '-open');
      }
    }

    triggers.forEach(function (trigger) {
      var btn = trigger.querySelector('.nav-link');
      if (!btn) return;

      btn.addEventListener('click', function (e) {
        var isOpen = trigger.classList.contains('is-open');
        if (isOpen) {
          closeAll();
        } else {
          open(trigger);
        }
        e.stopPropagation();
      });
    });

    // Close on outside click
    document.addEventListener('click', closeAll);

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });

    // Prevent clicks inside dropdowns / products panel from closing
    triggers.forEach(function (trigger) {
      var dropdown = trigger.querySelector('.nav-dropdown');
      if (dropdown) {
        dropdown.addEventListener('click', function (e) {
          e.stopPropagation();
        });
      }
    });

    [productsPanel, featuresPanel, explorePanel].forEach(function (panel) {
      if (panel) {
        panel.addEventListener('click', function (e) {
          e.stopPropagation();
        });
      }
    });
  }

  // Init after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
