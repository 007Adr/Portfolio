document.addEventListener('DOMContentLoaded', () => {

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionPreference.matches;
  const motionPreferenceHandlers = [];
  const onMotionPreferenceChange = handler => motionPreferenceHandlers.push(handler);
  const updateMotionPreference = () => {
    reducedMotion = motionPreference.matches;
    document.documentElement.classList.toggle('reduced-motion', reducedMotion);
    motionPreferenceHandlers.forEach(handler => handler(reducedMotion));
  };
  updateMotionPreference();
  if (typeof motionPreference.addEventListener === 'function') motionPreference.addEventListener('change', updateMotionPreference);
  else if (typeof motionPreference.addListener === 'function') motionPreference.addListener(updateMotionPreference);

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // 1. SUPPRESSION PRELOADER
  const preloader = document.getElementById('preloader');
  if (preloader) {
    let preloaderFallbackTimer;
    const hidePreloader = () => {
      if (preloader.classList.contains('hidden')) return;
      preloader.classList.add('hidden');
      window.clearTimeout(preloaderFallbackTimer);
    };
    window.addEventListener('load', hidePreloader, { once: true });
    preloaderFallbackTimer = window.setTimeout(hidePreloader, 4000);
    onMotionPreferenceChange(isReduced => { if (isReduced) hidePreloader(); });
    if (reducedMotion) hidePreloader();
  }

  // 2. EFFET CYBER GLITCH SUR LE TITRE (ACCUEIL)
  const glitchTarget = document.querySelector('.highlight');
  if (glitchTarget) {
    const originalText = glitchTarget.textContent;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    let glitchInterval = null;
    const stopGlitch = () => {
      if (glitchInterval !== null) window.clearInterval(glitchInterval);
      glitchInterval = null;
      glitchTarget.textContent = originalText;
    };
    const startGlitch = () => {
      if (reducedMotion || glitchInterval !== null) return;
      let iteration = 0;
      glitchInterval = window.setInterval(() => {
        glitchTarget.textContent = originalText.split('').map((letter, index) => {
          if(index < iteration) return originalText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        if(iteration >= originalText.length) {
          window.clearInterval(glitchInterval);
          glitchInterval = null;
        }
        iteration += 1 / 3;
      }, 30);
    };
    startGlitch();
    onMotionPreferenceChange(isReduced => isReduced ? stopGlitch() : startGlitch());
  }

  // 3. EFFET SPOTLIGHT SUR LES CARTES
  const spotlightCards = document.querySelectorAll('.project-card, .exp-card, .contact-card, .objectif-card, .tool-card');
  spotlightCards.forEach(card => {
    card.classList.add('spotlight-card');
    if (!isTouchDevice) {
      card.addEventListener('mousemove', e => {
        if (reducedMotion) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    }
  });

  // 4. MENU MOBILE HAMBURGER
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    const mobileBreakpoint = window.matchMedia('(max-width: 860px)');
    const menuItems = [...navLinks.querySelectorAll('a, button')];
    const originalTabIndexes = new Map(menuItems.map(item => [item, item.getAttribute('tabindex')]));

    menuToggle.setAttribute('aria-controls', navLinks.id || 'primary-navigation');

    const setMenuAccessibility = (open) => {
      const isMobile = mobileBreakpoint.matches;
      const menuIsOpen = isMobile && open;
      menuToggle.setAttribute('aria-expanded', String(menuIsOpen));
      menuToggle.setAttribute('aria-label', menuIsOpen ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation');
      navLinks.setAttribute('aria-hidden', String(isMobile && !menuIsOpen));

      menuItems.forEach(item => {
        if (isMobile && !menuIsOpen) {
          item.setAttribute('tabindex', '-1');
        } else {
          const originalTabIndex = originalTabIndexes.get(item);
          if (originalTabIndex === null) item.removeAttribute('tabindex');
          else item.setAttribute('tabindex', originalTabIndex);
        }
      });
    };

    const closeMenu = (restoreFocus = false) => {
      navLinks.classList.remove('active');
      document.body.classList.remove('no-scroll'); // Empêche le scroll en arrière-plan
      setMenuAccessibility(false);
      if (restoreFocus) menuToggle.focus();
    };

    const syncMenuWithViewport = () => {
      if (!mobileBreakpoint.matches) {
        navLinks.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
      setMenuAccessibility(navLinks.classList.contains('active'));
    };

    syncMenuWithViewport();
    if (typeof mobileBreakpoint.addEventListener === 'function') mobileBreakpoint.addEventListener('change', syncMenuWithViewport);
    else if (typeof mobileBreakpoint.addListener === 'function') mobileBreakpoint.addListener(syncMenuWithViewport);

    menuToggle.addEventListener('click', () => {
      const menuIsOpen = !navLinks.classList.contains('active');
      navLinks.classList.toggle('active', menuIsOpen);
      document.body.classList.toggle('no-scroll', menuIsOpen);
      setMenuAccessibility(menuIsOpen);
      if (menuIsOpen) menuItems[0]?.focus();
      else menuToggle.focus();
    });

    // Fermeture automatique du menu au clic sur un lien interne
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && navLinks.classList.contains('active')) {
        event.preventDefault();
        closeMenu(true);
      }
    });
  }

  // 5. BARRE DE PROGRESSION & BOUTON RETOUR HAUT
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  const progressContainer = document.createElement('div');
  progressContainer.className = 'scroll-progress-container';
  progressContainer.appendChild(progressBar);
  document.body.appendChild(progressContainer);

  let scrollFrame = null;
  const updateScrollUI = () => {
    scrollFrame = null;
    const scrollableHeight = Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight);
    const scrolled = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
    progressBar.style.width = `${scrolled}%`;
    if (window.scrollY > 300) backToTopBtn.classList.add('visible');
    else backToTopBtn.classList.remove('visible');
  };
  const scheduleScrollUI = () => {
    if (scrollFrame === null) scrollFrame = window.requestAnimationFrame(updateScrollUI);
  };

  const backToTopBtn = document.createElement('button');
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.innerHTML = '↑';
  backToTopBtn.setAttribute('aria-label', 'Retour en haut');
  document.body.appendChild(backToTopBtn);

  window.addEventListener('scroll', scheduleScrollUI, { passive: true });
  window.addEventListener('resize', scheduleScrollUI, { passive: true });
  updateScrollUI();

  backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

  // 6. TÉLÉCHARGEMENT CV INTERACTIF
  const cvBtns = document.querySelectorAll('.btn-download-cv');
  cvBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const originalText = btn.innerHTML;
      btn.innerHTML = '⏳ Préparation...';
      btn.style.pointerEvents = 'none';
      setTimeout(() => {
        btn.innerHTML = '✅ Téléchargé !';
        btn.style.background = '#22c55e';
        btn.style.borderColor = '#22c55e';
        btn.style.color = 'white';
        const link = document.createElement('a');
        link.href = btn.getAttribute('href');
        link.download = 'CV_Adrien_BLAIZE.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => { btn.innerHTML = originalText; btn.style = ''; }, 3000);
      }, 1500);
    });
  });

  // 7. INFOBULLES (TOOLTIPS)
  const tooltipBox = document.createElement('div');
  tooltipBox.className = 'tooltip-box';
  document.body.appendChild(tooltipBox);
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  tooltipElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      tooltipBox.style.left = `${e.clientX + 15}px`;
      tooltipBox.style.top = `${e.clientY + 15}px`;
    });
    el.addEventListener('mouseenter', (e) => {
      let target = e.target;
      while (!target.hasAttribute('data-tooltip')) target = target.parentElement;
      tooltipBox.textContent = target.getAttribute('data-tooltip');
      tooltipBox.classList.add('visible');
    });
    el.addEventListener('mouseleave', () => tooltipBox.classList.remove('visible'));
  });

  // 8. TRANSITIONS DE PAGES FLUIDES & FIX DU BUG DE SCROLL
  document.body.classList.add('page-transition-enter');
  setTimeout(() => {
    document.body.classList.remove('page-transition-enter');
    document.body.style.transform = 'none';
  }, 600); 

  const links = document.querySelectorAll('a[href^="index.html"], a[href^="pages/"], a[href^="../"]');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      if (this.target === '_blank' || this.getAttribute('href').startsWith('#') || this.hasAttribute('download') || this.classList.contains('btn-download-cv')) return;
      e.preventDefault();
      const targetUrl = this.getAttribute('href');
      document.body.classList.remove('page-transition-enter');
      document.body.classList.add('page-transition-leave');
      setTimeout(() => { window.location.href = targetUrl; }, 400);
    });
  });

  // 9. THEME SOMBRE (Dark Mode)
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if(themeToggle) themeToggle.textContent = '☀️';
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
      themeToggle.textContent = isDark ? '🌙' : '☀️';
      localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });
  }

  // 10. VALIDATION FORMULAIRE DE CONTACT
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const inputs = contactForm.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        if (input.checkValidity()) { input.classList.remove('invalid'); input.classList.add('valid'); } 
        else { input.classList.remove('valid'); input.classList.add('invalid'); }
      });
    });
  }

  // 11. TRI ANIMÉ DES PROJETS
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filterValue = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        if (filterValue === 'all' || card.getAttribute('data-category').includes(filterValue)) card.classList.remove('hide-anim');
        else card.classList.add('hide-anim');
      });
    });
  });

  // 13. FENÊTRES MODALES (PROJETS)
  const modalTriggers = document.querySelectorAll('.project-card[data-modal-target]');
  const modalOverlay = document.getElementById('project-modal');
  if (modalTriggers.length > 0 && modalOverlay) {
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalData = {
      cub: { 
        title: "Projet CUB : Architecture réseau", 
        imageSrc: "../files/Schema_Radius.jpg",
        imageAlt: "Schéma Infrastructure CUB",
        content: `
          <section style="color:var(--muted); line-height:1.7;">
            <h3 style="color:var(--accent); margin-top:0;">1. Contexte</h3>
            <p>Le projet CUB concerne une infrastructure réseau réellement déployée. Le schéma présente une architecture segmentée combinant un cœur de réseau Cisco de niveau 3, des équipements TP-Link Omada et une authentification centralisée des accès Wi-Fi.</p>

            <h3 style="color:var(--accent);">2. Objectifs</h3>
            <p>L'architecture vise à contrôler les accès au réseau, à séparer les usages par VLAN et à permettre le routage inter-VLAN depuis le cœur de réseau. L'authentification centralisée permet d'associer un utilisateur à un profil réseau sans gérer séparément chaque accès.</p>

            <h3 style="color:var(--accent);">3. Architecture</h3>
            <p>Les clients se connectent à l'infrastructure Wi-Fi TP-Link Omada en 802.1X. La demande d'authentification est transmise au serveur RADIUS Windows NPS, qui s'appuie sur Active Directory pour vérifier l'identité. En cas d'acceptation, la réponse RADIUS fournit l'attribut du VLAN correspondant au profil autorisé : le point d'accès et les commutateurs appliquent alors l'affectation dynamique prévue. Le cœur Cisco L3 assure le routage inter-VLAN via ses interfaces de niveau 3 ; les liaisons entre équipements sont transportées en trunks 802.1Q.</p>

            <h3 style="color:var(--accent);">4. Technologies</h3>
            <ul style="padding-left:1.2rem;">
              <li style="margin-bottom:0.5rem;"><strong>Réseau :</strong> Cisco L3, VLAN, routage inter-VLAN et trunks 802.1Q.</li>
              <li style="margin-bottom:0.5rem;"><strong>Contrôle d'accès :</strong> 802.1X, RADIUS et Windows NPS.</li>
              <li style="margin-bottom:0.5rem;"><strong>Annuaire :</strong> Active Directory.</li>
              <li style="margin-bottom:0.5rem;"><strong>Accès sans-fil :</strong> TP-Link Omada.</li>
            </ul>

            <h3 style="color:var(--accent);">5. Réalisations</h3>
            <ul style="padding-left:1.2rem;">
              <li style="margin-bottom:0.5rem;">Documentation du chemin d'authentification 802.1X/RADIUS entre les clients, l'accès Wi-Fi, Windows NPS et Active Directory.</li>
              <li style="margin-bottom:0.5rem;">Mise en œuvre documentée de la segmentation par VLAN et de l'affectation dynamique renvoyée par RADIUS.</li>
              <li style="margin-bottom:0.5rem;">Intégration du routage inter-VLAN Cisco L3 et des trunks 802.1Q dans l'architecture déployée.</li>
            </ul>

            <h3 style="color:var(--accent);">6. Résultats et limites</h3>
            <p>Le schéma permet de présenter clairement une séparation des flux, une authentification centralisée et une attribution dynamique des VLAN. Aucun résultat chiffré ni compte-rendu de test n'est publié ici. OSPF et HSRP ne sont pas présentés comme des réalisations personnelles dans cette fiche.</p>
          </section>
        ` 
      },
      python: { 
        title: "Projet HunterDex : Plateforme applicative", 
        imageSrc: "../files/Schema_Hunterdex.png",
        imageAlt: "Architecture HunterDex",
        content: `
          <section style="color:var(--muted); line-height:1.7;">
            <h3 style="color:var(--accent); margin-top:0;">1. Contexte</h3>
            <p>HunterDex est une plateforme applicative opérationnelle hébergée sur un hyperviseur Proxmox VE, dans une machine virtuelle Debian. Son architecture sépare le backend, l'interface frontend et le bot Discord afin de distinguer les responsabilités et les flux.</p>

            <h3 style="color:var(--accent);">2. Objectifs</h3>
            <p>Le projet vise à fournir une application accessible via une interface web, un backend exposant ses données par API REST et un bot Discord indépendant. Le déploiement doit conserver une séparation des composants, limiter les flux entrants et protéger les accès d'administration.</p>

            <h3 style="color:var(--accent);">3. Architecture</h3>
            <p>Proxmox VE héberge une VM Debian qui exécute les services conteneurisés avec Docker et Docker Compose. Le backend PocketBase utilise SQLite et fournit l'API REST. Le frontend Vue.js est servi par Nginx. Le bot Discord est exécuté séparément en Python et communique avec les services nécessaires via <code>discord.py</code> et <code>aiohttp</code>.</p>
            <p>Les services sont reliés par un réseau Docker interne. Le tunnel Cloudflare assure l'accès publié sans exposer directement les services applicatifs ; l'isolation des flux est complétée par UFW, tandis que Fail2Ban protège notamment les accès SSH. La MFA renforce les accès protégés.</p>

            <h3 style="color:var(--accent);">4. Technologies</h3>
            <ul style="padding-left:1.2rem;">
              <li style="margin-bottom:0.5rem;"><strong>Infrastructure :</strong> Proxmox VE et machine virtuelle Debian.</li>
              <li style="margin-bottom:0.5rem;"><strong>Conteneurisation :</strong> Docker et Docker Compose.</li>
              <li style="margin-bottom:0.5rem;"><strong>Backend :</strong> PocketBase, SQLite et API REST.</li>
              <li style="margin-bottom:0.5rem;"><strong>Frontend :</strong> Vue.js et Nginx.</li>
              <li style="margin-bottom:0.5rem;"><strong>Bot :</strong> Python, <code>discord.py</code> et <code>aiohttp</code>.</li>
              <li style="margin-bottom:0.5rem;"><strong>Sécurité et exposition :</strong> Cloudflare Tunnel, MFA, UFW et Fail2Ban.</li>
            </ul>

            <h3 style="color:var(--accent);">5. Réalisations</h3>
            <ul style="padding-left:1.2rem;">
              <li style="margin-bottom:0.5rem;">Déploiement séparé du backend PocketBase, du frontend Vue.js/Nginx et du bot Discord.</li>
              <li style="margin-bottom:0.5rem;">Organisation des services dans Docker Compose et séparation des échanges par réseau interne.</li>
              <li style="margin-bottom:0.5rem;">Publication contrôlée via Cloudflare Tunnel et ajout de mesures de protection avec MFA, UFW et Fail2Ban.</li>
              <li style="margin-bottom:0.5rem;">Documentation d'une chaîne de sauvegarde comprenant une tâche planifiée, une archive ZIP, une copie vers Google Drive via Rclone, un webhook Discord et la conservation d'une copie locale.</li>
            </ul>

            <h3 style="color:var(--accent);">6. Résultats et limites</h3>
            <p>La séparation des composants, l'isolation réseau et les contrôles d'accès structurent une plateforme maintenable et protégée. L'architecture de sauvegarde est documentée, mais aucun résultat de restauration, taux de disponibilité ou indicateur chiffré n'est publié. Les fonctionnalités non explicitement décrites dans cette présentation ne sont pas considérées comme garanties.</p>
          </section>
        ` 
      }
    };

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const createSchemaViewer = ({ imageSrc, imageAlt }) => {
      const viewer = document.createElement('section');
      viewer.className = 'schema-viewer';
      viewer.setAttribute('aria-label', `Visualiseur : ${imageAlt}`);
      viewer.innerHTML = `
        <div class="schema-toolbar" role="toolbar" aria-label="Commandes du schéma">
          <button type="button" class="schema-control" data-zoom="out" aria-label="Réduire le zoom" title="Réduire le zoom">−</button>
          <span class="schema-zoom-level" aria-live="polite">100&nbsp;%</span>
          <button type="button" class="schema-control" data-zoom="in" aria-label="Augmenter le zoom" title="Augmenter le zoom">+</button>
          <button type="button" class="schema-control" data-zoom="reset" aria-label="Réinitialiser le zoom" title="Réinitialiser le zoom">↺</button>
        </div>
        <div class="schema-viewport" tabindex="0" role="region" aria-label="Zone de visualisation. Utilisez les flèches pour déplacer le schéma agrandi.">
          <img class="schema-image" src="${imageSrc}" alt="${imageAlt}" draggable="false" />
        </div>
        <p class="schema-help">Molette avec Ctrl/Cmd pour zoomer · glisser pour déplacer · touches +, −, 0 et flèches disponibles</p>
      `;

      const viewport = viewer.querySelector('.schema-viewport');
      const image = viewer.querySelector('.schema-image');
      const zoomLevel = viewer.querySelector('.schema-zoom-level');
      let scale = 1;
      let offsetX = 0;
      let offsetY = 0;
      let pointerId = null;
      let pointerStartX = 0;
      let pointerStartY = 0;
      let startOffsetX = 0;
      let startOffsetY = 0;

      const constrainOffset = () => {
        const maxX = Math.max(0, (viewport.clientWidth * (scale - 1)) / 2);
        const maxY = Math.max(0, (viewport.clientHeight * (scale - 1)) / 2);
        offsetX = clamp(offsetX, -maxX, maxX);
        offsetY = clamp(offsetY, -maxY, maxY);
      };

      const updateViewer = () => {
        constrainOffset();
        image.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`;
        zoomLevel.textContent = `${Math.round(scale * 100)} %`;
      };

      const setZoom = (nextScale, resetPosition = false) => {
        scale = clamp(nextScale, 1, 4);
        if (resetPosition || scale === 1) {
          offsetX = 0;
          offsetY = 0;
        }
        updateViewer();
      };

      const moveBy = (deltaX, deltaY) => {
        offsetX += deltaX;
        offsetY += deltaY;
        updateViewer();
      };

      viewer.querySelector('[data-zoom="out"]').addEventListener('click', () => setZoom(scale - 0.25));
      viewer.querySelector('[data-zoom="in"]').addEventListener('click', () => setZoom(scale + 0.25));
      viewer.querySelector('[data-zoom="reset"]').addEventListener('click', () => setZoom(1, true));

      viewport.addEventListener('wheel', (event) => {
        if (!event.ctrlKey && !event.metaKey) return;
        event.preventDefault();
        setZoom(scale + (event.deltaY < 0 ? 0.25 : -0.25));
      }, { passive: false });

      viewport.addEventListener('pointerdown', (event) => {
        if (scale <= 1) return;
        pointerId = event.pointerId;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        startOffsetX = offsetX;
        startOffsetY = offsetY;
        viewport.classList.add('is-dragging');
        viewport.setPointerCapture(pointerId);
      });

      viewport.addEventListener('pointermove', (event) => {
        if (event.pointerId !== pointerId) return;
        offsetX = startOffsetX + event.clientX - pointerStartX;
        offsetY = startOffsetY + event.clientY - pointerStartY;
        updateViewer();
      });

      const endPointer = (event) => {
        if (event.pointerId !== pointerId) return;
        pointerId = null;
        viewport.classList.remove('is-dragging');
        if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      };
      viewport.addEventListener('pointerup', endPointer);
      viewport.addEventListener('pointercancel', endPointer);

      viewport.addEventListener('keydown', (event) => {
        if (event.key === '+' || event.key === '=') {
          event.preventDefault();
          setZoom(scale + 0.25);
        } else if (event.key === '-' || event.key === '_') {
          event.preventDefault();
          setZoom(scale - 0.25);
        } else if (event.key === '0' || event.key === 'Home') {
          event.preventDefault();
          setZoom(1, true);
        } else if (scale > 1 && event.key === 'ArrowLeft') {
          event.preventDefault();
          moveBy(40, 0);
        } else if (scale > 1 && event.key === 'ArrowRight') {
          event.preventDefault();
          moveBy(-40, 0);
        } else if (scale > 1 && event.key === 'ArrowUp') {
          event.preventDefault();
          moveBy(0, 40);
        } else if (scale > 1 && event.key === 'ArrowDown') {
          event.preventDefault();
          moveBy(0, -40);
        }
      });

      requestAnimationFrame(updateViewer);
      return viewer;
    };

    let lastFocusedElement = null;
    let previousBodyOverflow = '';
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const closeModal = () => {
      if (!modalOverlay.classList.contains('active')) return;
      modalOverlay.classList.remove('active');
      modalOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = previousBodyOverflow;
      modalBody.replaceChildren();
      if (lastFocusedElement && document.body.contains(lastFocusedElement)) lastFocusedElement.focus();
      lastFocusedElement = null;
    };

    const openModal = (card, data) => {
      lastFocusedElement = document.activeElement;
      modalTitle.textContent = data.title;
      modalBody.replaceChildren();
      modalBody.appendChild(createSchemaViewer(data));
      const details = document.createElement('div');
      details.innerHTML = data.content;
      modalBody.appendChild(details);
      previousBodyOverflow = document.body.style.overflow;
      modalOverlay.classList.add('active');
      modalOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      modalClose.focus();
      requestAnimationFrame(() => {
        if (modalOverlay.classList.contains('active')) modalClose.focus();
      });
      setTimeout(() => {
        if (modalOverlay.classList.contains('active')) modalClose.focus();
      }, 0);
    };

    modalTriggers.forEach(card => {
      const activateCard = () => {
        const targetId = card.getAttribute('data-modal-target');
        const data = modalData[targetId];
        if (data) openModal(card, data);
      };
      card.addEventListener('click', activateCard);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activateCard();
        }
      });
    });
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('focusin', (event) => {
      if (modalOverlay.classList.contains('active') && !modalOverlay.contains(event.target)) modalClose.focus();
    });
    document.addEventListener('keydown', (event) => {
      if (modalOverlay.classList.contains('active') && event.key === 'Escape') {
        event.preventDefault();
        closeModal();
      }
    });
    modalOverlay.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusableElements = [...modalOverlay.querySelectorAll(focusableSelector)].filter(element => !element.disabled);
      if (focusableElements.length === 0) return;
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    });
  }

  // 14. APPARITION FLUIDE AU DÉFILEMENT (FADE-IN)
  const reveals = document.querySelectorAll('.reveal');
  let revealObserver = null;
  if (!reducedMotion && typeof window.IntersectionObserver === 'function') {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    reveals.forEach(reveal => revealObserver.observe(reveal));
  } else {
    reveals.forEach(reveal => reveal.classList.add('active'));
  }
  onMotionPreferenceChange(isReduced => {
    if (isReduced) {
      if (revealObserver) revealObserver.disconnect();
      reveals.forEach(reveal => reveal.classList.add('active'));
    }
  });

  // 15. EFFET PARALLAXE SUBTIL
  const parallaxElements = [...document.querySelectorAll('.parallax')];
  if (!isTouchDevice && parallaxElements.length > 0) {
    let parallaxFrame = null;
    let pointerX = 0;
    let pointerY = 0;
    const clearParallax = () => {
      if (parallaxFrame !== null) window.cancelAnimationFrame(parallaxFrame);
      parallaxFrame = null;
      parallaxElements.forEach(element => { element.style.transform = ''; });
    };
    const renderParallax = () => {
      parallaxFrame = null;
      if (reducedMotion) return;
      const x = (window.innerWidth - pointerX * 2) / 100;
      const y = (window.innerHeight - pointerY * 2) / 100;
      parallaxElements.forEach(element => { element.style.transform = `translate(${x}px, ${y}px)`; });
    };
    document.addEventListener('mousemove', (e) => {
      if (reducedMotion) return;
      pointerX = e.pageX;
      pointerY = e.pageY;
      if (parallaxFrame === null) parallaxFrame = window.requestAnimationFrame(renderParallax);
    });
    onMotionPreferenceChange(isReduced => { if (isReduced) clearParallax(); });
  }

  // 16. ANIMATION RÉSEAU (Particles.js)
  const particlesContainer = document.getElementById('particles-js');
  let particlesInitialized = false;
  const destroyParticles = () => {
    if (!particlesInitialized) return;
    try {
      if (Array.isArray(window.pJSDom)) {
        window.pJSDom.forEach(instance => instance?.pJS?.fn?.vendors?.destroypJS?.());
      }
      particlesContainer?.replaceChildren();
    } catch (error) {
      console.warn('Particles.js indisponible : arrêt de l’animation impossible.', error);
    }
    particlesInitialized = false;
  };
  const initParticles = () => {
    if (reducedMotion || particlesInitialized || !particlesContainer || typeof window.particlesJS !== 'function') return;
    try {
      window.particlesJS('particles-js', {
        "particles": { "number": { "value": 50, "density": { "enable": true, "value_area": 800 } }, "color": { "value": "#2563eb" }, "shape": { "type": "circle" }, "opacity": { "value": 0.3 }, "size": { "value": 3, "random": true }, "line_linked": { "enable": true, "distance": 150, "color": "#2563eb", "opacity": 0.3, "width": 1 }, "move": { "enable": true, "speed": 1.5, "direction": "none" } },
        "interactivity": { "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" } }, "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.8 } }, "push": { "particles_nb": 3 } } },
        "retina_detect": true
      });
      particlesInitialized = true;
    } catch (error) {
      console.warn('Particles.js indisponible : animation désactivée.', error);
    }
  };
  initParticles();
  onMotionPreferenceChange(isReduced => isReduced ? destroyParticles() : initParticles());

  // 17. INITIALISATION TILT 3D
  const tiltCards = document.querySelectorAll('.project-card');
  let tiltInitialized = false;
  const destroyTilt = () => {
    if (!tiltInitialized) return;
    tiltCards.forEach(card => card.vanillaTilt?.destroy());
    tiltInitialized = false;
  };
  const initTilt = () => {
    if (reducedMotion || isTouchDevice || tiltInitialized || tiltCards.length === 0 || !window.VanillaTilt || typeof window.VanillaTilt.init !== 'function') return;
    try {
      window.VanillaTilt.init(tiltCards, { max: 6, speed: 400, glare: true, "max-glare": 0.15, scale: 1.02 });
      tiltInitialized = true;
    } catch (error) {
      console.warn('Vanilla Tilt indisponible : inclinaison désactivée.', error);
    }
  };
  initTilt();
  onMotionPreferenceChange(isReduced => isReduced ? destroyTilt() : initTilt());

  // 18. COPIE EMAIL & TOAST NOTIFICATION
  const emailCards = document.querySelectorAll('.copy-email-card');
  if (emailCards.length > 0) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = '✅ Adresse e-mail copiée avec succès !';
    document.body.appendChild(toast);

    let toastTimeout;

    emailCards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault(); // Empêche l'ouverture d'Outlook/Mail
        const email = card.getAttribute('data-email');
        
        navigator.clipboard.writeText(email).then(() => {
          // Afficher le toast
          toast.classList.add('show');
          
          // Changer le texte dans la carte
          const hint = card.querySelector('.copy-hint');
          if(hint) {
             const originalText = "Cliquez pour copier 📋";
             hint.innerHTML = 'Copié ! ✔️';
             hint.style.color = '#22c55e';
             setTimeout(() => {
               hint.innerHTML = originalText;
               hint.style.color = 'var(--accent)';
             }, 3000);
          }
          
          // Masquer le toast après 3s
          clearTimeout(toastTimeout);
          toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
          }, 3000);
        });
      });
    });
  }
});
