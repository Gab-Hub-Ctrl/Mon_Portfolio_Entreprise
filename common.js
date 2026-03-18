/**
 * common.js IT Dashboard / Presentation
 * Scripts partages : modal navigation, modal Important, accordeons, chatbot simule
 * Gabriel ROULON 2026
 */

(function () {
  'use strict';

  /* ============================================================
   * initModal modal "Important" ou "Lecture rapide"
   * ============================================================ */
  function initModal() {
    var overlay = document.getElementById('quick-read-modal');
    if (!overlay) return;

    var card = overlay.querySelector('.modal-card');
    var closeBtn = overlay.querySelector('.modal-close');
    var openBtn = document.querySelector('.btn-important') || document.querySelector('.btn-quick-read');
    var lastFocus = null;

    function getFocusable() {
      return Array.from(overlay.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )).filter(function (el) { return !el.disabled; });
    }

    function openModal() {
      lastFocus = document.activeElement;
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var focusable = getFocusable();
      if (focusable.length) focusable[0].focus();
    }

    function closeModal() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', function (e) {
      if (!card.contains(e.target)) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    overlay.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusable = getFocusable();
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ============================================================
   * initAccordions sections accordeon
   * ============================================================ */
  function initAccordions() {
    var headers = document.querySelectorAll('.accordion-header');

    headers.forEach(function (header) {
      var accordion = header.closest('.accordion');
      if (!accordion) return;

      var content = accordion.querySelector('.accordion-content');
      if (content) {
        var id = content.id || ('acc-' + Math.random().toString(36).slice(2, 8));
        content.id = id;
        header.setAttribute('aria-controls', id);
        header.setAttribute('aria-expanded', accordion.classList.contains('active') ? 'true' : 'false');
      }

      function toggle() {
        var willOpen = !accordion.classList.contains('active');
        if (willOpen) {
          document.querySelectorAll('.accordion.active').forEach(function (other) {
            if (other !== accordion) {
              other.classList.remove('active');
              var h = other.querySelector('.accordion-header');
              if (h) h.setAttribute('aria-expanded', 'false');
            }
          });
        }
        accordion.classList.toggle('active');
        header.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      }

      header.addEventListener('click', toggle);
      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  /* ============================================================
   * initChatbot chatbot simule avec animation de frappe
   * ============================================================ */
  function initChatbot() {
    var btn = document.querySelector('.btn-chatbot-fab') || document.querySelector('.btn-chatbot');
    var panel = document.getElementById('chatbot-panel');
    if (!btn || !panel) return;

    var summary = btn.getAttribute('data-summary') || '';
    var msgEl = panel.querySelector('.chatbot-msg');
    var thinkEl = panel.querySelector('.chatbot-think');
    var closeBtn = panel.querySelector('.chatbot-close-btn');
    var statusEl = panel.querySelector('.chatbot-status');
    var isOpen = false;
    var typeTimer = null;
    var thinkTimer = null;
    var ignoreNextClose = false;

    function calcDelay(text) {
      return Math.max(10, Math.min(32, 6000 / Math.max(text.length, 1)));
    }

    function typeText(text, el, onDone) {
      el.innerHTML = '';
      var cursor = document.createElement('span');
      cursor.className = 'chatbot-cursor-blink';
      el.appendChild(cursor);
      var i = 0;
      var delay = calcDelay(text);
      var bodyEl = panel.querySelector('.chatbot-body');

      function step() {
        if (i < text.length) {
          if (text[i] === '\n') {
            var para = document.createElement('span');
            para.className = 'chatbot-para';
            el.insertBefore(para, cursor);
          } else {
            el.insertBefore(document.createTextNode(text[i]), cursor);
          }
          i++;
          if (bodyEl) bodyEl.scrollTop = bodyEl.scrollHeight;
          typeTimer = setTimeout(step, delay);
        } else {
          cursor.remove();
          panel.classList.remove('typing');
          panel.classList.add('done');
          var importantBtn = document.querySelector('.btn-important');
          if (importantBtn) {
            var prompt = document.createElement('div');
            prompt.className = 'chatbot-important-prompt';
            prompt.innerHTML =
              '<hr class="chatbot-prompt-sep">' +
              '<span class="chatbot-prompt-text">Note importante d\u00e9tect\u00e9e - souhaitez-vous la lire\u00a0?</span>' +
              '<div class="chatbot-prompt-btns">' +
              '<button class="chatbot-prompt-yes">Oui</button>' +
              '<button class="chatbot-prompt-no">Non</button>' +
              '</div>';
            el.appendChild(prompt);
            prompt.querySelector('.chatbot-prompt-yes').addEventListener('click', function (e) {
              e.stopPropagation();
              prompt.remove();
              if (statusEl) { statusEl.textContent = 'R\u00e9sum\u00e9 termin\u00e9'; statusEl.classList.add('done'); }
              importantBtn.click();
            });
            prompt.querySelector('.chatbot-prompt-no').addEventListener('click', function (e) {
              e.stopPropagation();
              prompt.remove();
              if (statusEl) { statusEl.textContent = 'R\u00e9sum\u00e9 termin\u00e9'; statusEl.classList.add('done'); }
            });
          } else {
            if (statusEl) {
              statusEl.textContent = 'Resume complet';
              statusEl.classList.add('done');
            }
          }
          if (onDone) onDone();
        }
      }
      step();
    }

    function open() {
      if (isOpen) return;
      isOpen = true;
      panel.classList.add('open', 'typing');
      panel.classList.remove('done');
      btn.classList.add('active');
      if (msgEl) msgEl.innerHTML = '';
      if (statusEl) { statusEl.textContent = 'Analyse en cours...'; statusEl.classList.remove('done'); }
      if (thinkEl) thinkEl.classList.remove('hidden');
      thinkTimer = setTimeout(function () {
        if (thinkEl) thinkEl.classList.add('hidden');
        typeText(summary, msgEl);
      }, 2000);
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      panel.classList.remove('open', 'typing', 'done');
      btn.classList.remove('active');
      if (typeTimer) clearTimeout(typeTimer);
      if (thinkTimer) clearTimeout(thinkTimer);
      if (msgEl) msgEl.innerHTML = '';
      if (thinkEl) thinkEl.classList.remove('hidden');
      if (statusEl) { statusEl.textContent = ''; statusEl.classList.remove('done'); }
    }

    btn.addEventListener('click', function () { isOpen ? close() : open(); });
    if (closeBtn) closeBtn.addEventListener('click', close);

    if (window.location.search.indexOf('summary=1') !== -1) {
      setTimeout(function () {
        open();
        ignoreNextClose = true;
        setTimeout(function () { ignoreNextClose = false; }, 800);
      }, 400);
    }

    document.addEventListener('click', function (e) {
      var navPanel = document.getElementById('nav-panel');
      var navBtn = document.querySelector('.chatbot-nav-btn');
      var modal = document.getElementById('quick-read-modal');
      var importantTrigger = document.querySelector('.btn-important');
      if (isOpen && !ignoreNextClose && !panel.contains(e.target) && !btn.contains(e.target) &&
          !(navPanel && navPanel.contains(e.target)) &&
          !(navBtn && navBtn.contains(e.target)) &&
          !(modal && modal.contains(e.target)) &&
          !(importantTrigger && importantTrigger.contains(e.target))) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !isOpen) return;
      var modal = document.getElementById('quick-read-modal');
      if (modal && modal.getAttribute('aria-hidden') === 'false') return;
      close();
    });
  }

  /* ============================================================
   * initBreadcrumb - fil d'Ariane dynamique avec vue intermédiaire
   * ============================================================ */
  function initBreadcrumb() {
    var nav = document.getElementById('site-breadcrumb');
    if (!nav) return;

    var page = nav.getAttribute('data-page');
    if (!page) return;

    var PAGE_LABELS = {
      'profil':           'Profil personnel',
      'cv':               'Curriculum Vitae',
      'lettre-ecole':     'Lettre de motivation (École)',
      'lettre-entreprise':'Lettre de motivation (Entreprise)',
      'contact':          'Contact',
      'synthese':         'IT Dashboard',
      'init':             'INIT_SEQUENCE',
      'poc':              'POC Agents',
      'standards':        'Réalisation de standards',
      'doc-financiere':   'Documentation financière',
      'pea-document':     'Étude PEA v2.0',
      'simulation-pea':   'Simulation PEA',
      'doc-technique':    'Documentation technique',
      'maintenance':      'Maintenance Agent',
      'laboratoire':      'Mon Laboratoire'
    };

    var VUE_DATA = {
      'rh':    { label: 'Vue RH / Recruteur', href: 'vue_rh.html' },
      'ecole': { label: 'Vue Jury école',     href: 'vue_ecole.html' },
      'tech':  { label: 'Vue Technicien',     href: 'vue_tech.html' }
    };

    var SEP = '<span class="breadcrumb-sep" aria-hidden="true">&#8250;</span>';
    var pageLabel = PAGE_LABELS[page] || page;
    var vue = sessionStorage.getItem('lastVue');
    var vueData = vue ? VUE_DATA[vue] : null;

    var html = '<a href="index.html">Présentation</a>' + SEP;
    if (vueData) {
      html += '<a href="' + vueData.href + '">' + vueData.label + '</a>' + SEP;
    }
    html += '<span class="breadcrumb-current" aria-current="page">' + pageLabel + '</span>';

    nav.innerHTML = html;
  }

  /* ============================================================
   * initFabVisibility - masque le FAB quand le footer est visible
   * ============================================================ */
  function initFabVisibility() {
    var fab = document.querySelector('.btn-chatbot-fab');
    var footer = document.querySelector('footer');
    if (!fab || !footer || !window.IntersectionObserver) return;

    /* Ne rien faire si la page ne nécessite pas de scroll */
    if (document.documentElement.scrollHeight <= window.innerHeight + 2) return;

    var observer = new IntersectionObserver(function (entries) {
      fab.classList.toggle('fab-hidden', entries[0].isIntersecting);
    }, { threshold: 0.1 });

    observer.observe(footer);
  }

  /* ============================================================
   * initNavPanel - panneau de navigation Vue Jury
   * ============================================================ */
  function initNavPanel() {
    var btn = document.querySelector('.chatbot-nav-btn');
    var panel = document.getElementById('nav-panel');
    if (!btn || !panel) return;


    var closeBtn = panel.querySelector('.nav-panel-close');
    var isOpen = false;

    function open() {
      if (isOpen) return;
      isOpen = true;
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    }

    btn.addEventListener('click', function () { isOpen ? close() : open(); });
    if (closeBtn) closeBtn.addEventListener('click', close);
    document.addEventListener('click', function (e) {
      if (isOpen && !panel.contains(e.target) && !btn.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) close();
    });
  }

  /* ============================================================
   * Auto-init
   * ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    initModal();
    initAccordions();
    initChatbot();
    initNavPanel();
    initBreadcrumb();
    initFabVisibility();
  });

})();

/* ============================================================
 * Navigation filtree par profil
 * Filtre les cartes index selon le profil actif (localStorage).
 * Expose window.applyProfileToNav pour index.html.
 * ============================================================ */
(function () {
  'use strict';

  var NAV_PROFILES = {
    rh:    ['profil', 'cv', 'lettre-entreprise', 'contact', 'synthese'],
    ecole: ['profil', 'lettre-ecole', 'contact', 'synthese', 'init', 'poc', 'standards',
            'doc-financiere', 'pea-document', 'simulation-pea'],
    tech:  ['profil', 'contact', 'synthese', 'init', 'poc', 'standards',
            'doc-technique', 'maintenance', 'laboratoire']
  };

  /* Fonction vide conservee pour compatibilite avec index.html inline script */
  function applyProfileToNav() {}

  window.applyProfileToNav = applyProfileToNav;

})();
