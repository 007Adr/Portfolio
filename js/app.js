document.addEventListener('DOMContentLoaded', () => {

  // 1. SUPPRESSION PRELOADER
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('hidden');
  });

  // 2. EFFET CYBER GLITCH SUR LE TITRE (ACCUEIL)
  const glitchTarget = document.querySelector('.highlight');
  if (glitchTarget) {
    const originalText = glitchTarget.textContent;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    let iteration = 0;
    let interval = setInterval(() => {
      glitchTarget.textContent = originalText.split('').map((letter, index) => {
        if(index < iteration) return originalText[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      if(iteration >= originalText.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
  }

  // 3. EFFET SPOTLIGHT SUR LES CARTES
  const spotlightCards = document.querySelectorAll('.project-card, .exp-card, .contact-card, .objectif-card, .tool-card');
  spotlightCards.forEach(card => {
    card.classList.add('spotlight-card');
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 4. MENU MOBILE HAMBURGER
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      document.body.classList.toggle('no-scroll'); // Empêche le scroll en arrière-plan
    });
    
    // Fermeture automatique du menu au clic sur un lien interne
    const mobileLinks = navLinks.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // 5. BARRE DE PROGRESSION & BOUTON RETOUR HAUT
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  const progressContainer = document.createElement('div');
  progressContainer.className = 'scroll-progress-container';
  progressContainer.appendChild(progressBar);
  document.body.appendChild(progressContainer);

  const backToTopBtn = document.createElement('button');
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.innerHTML = '↑';
  backToTopBtn.setAttribute('aria-label', 'Retour en haut');
  document.body.appendChild(backToTopBtn);

  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = `${scrolled}%`;
    if (window.scrollY > 300) backToTopBtn.classList.add('visible');
    else backToTopBtn.classList.remove('visible');
  });

  backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

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
        title: "Projet CUB : Architecture Cisco", 
        imageSrc: "../files/Schema_Radius.jpg",
        imageAlt: "Schéma Infrastructure CUB",
        content: `
          <h3 style="color:var(--accent); margin-top:0;">Contexte & Architecture</h3>
          <p style="color:var(--muted); line-height:1.7;">Maquettage et déploiement d'une architecture réseau complexe pour l'entreprise CUB, intégrant une affectation dynamique de VLANs et un routage inter-VLAN sécurisé.</p>
          
          <h3 style="color:var(--accent);">Détails Techniques</h3>
          <ul style="color:var(--muted); line-height:1.7; padding-left:1.2rem;">
            <li style="margin-bottom:0.5rem"><strong>Authentification 802.1X / RADIUS :</strong> Sécurisation des accès sans-fil via une borne TP-Link Omada (PEAP-MSCHAPv2). Les requêtes EAPOL sont transmises au serveur RADIUS (Windows NPS).</li>
            <li style="margin-bottom:0.5rem"><strong>Affectation Dynamique :</strong> Vérification de l'identité via Active Directory (LDAP/Kerberos). Le serveur RADIUS renvoie un <code>Access-Accept</code> avec l'attribut du VLAN correspondant au profil de l'utilisateur (ex: VLAN 4 Marketing, VLAN 54 Infrasys, VLAN 206).</li>
            <li style="margin-bottom:0.5rem"><strong>Cœur de Réseau (Cisco L3) :</strong> Routage inter-VLAN assuré par un switch de niveau 3 (Cisco 3650) via des interfaces SVI, interconnecté aux switchs de distribution (Catalyst 2960 et 3750 PoE) par des liens TRUNK 802.1Q.</li>
            <li style="margin-bottom:0.5rem"><strong>Ferme de Serveurs (VLAN 306) :</strong> Isolation de l'infrastructure critique contenant l'Active Directory, le contrôleur Omada SDN, le serveur RADIUS et le système de ticketing GLPI.</li>
          </ul>
        ` 
      },
      python: { 
        title: "Projet HunterDex : Architecture & Automatisation", 
        imageSrc: "../files/Schema_Hunterdex.png",
        imageAlt: "Architecture HunterDex",
        content: `
          <h3 style="color:var(--accent); margin-top:0;">Vue d'Ensemble</h3>
          <p style="color:var(--muted); line-height:1.7;">Le projet HunterDex est un écosystème complet séparant le Backend, le Frontend et le Bot Discord, hébergé sur un hyperviseur Proxmox VE avec une approche Zero Trust.</p>
  
          <h3 style="color:var(--accent);">Infrastructure & Sécurité</h3>
          <ul style="color:var(--muted); line-height:1.7; padding-left:1.2rem;">
            <li style="margin-bottom:0.5rem">Déploiement de l'application via Docker Compose sur un réseau bridge isolé (hunterdex_net).</li>
            <li style="margin-bottom:0.5rem">Mise en place d'un tunnel Cloudflare (cloudflared) pour sécuriser le trafic sortant sans ouvrir de ports sur le pare-feu externe.</li>
            <li style="margin-bottom:0.5rem">Sécurisation avancée de l'hôte via pare-feu UFW, Fail2Ban (jail SSH), et authentification Multi-Facteurs (MFA) via Cloudflare Access.</li>
            <li style="margin-bottom:0.5rem">Automatisation des sauvegardes vers Google Drive via Rclone et supervision interne en temps réel.</li>
          </ul>
  
          <h3 style="color:var(--accent);">Développement Applicatif</h3>
          <ul style="color:var(--muted); line-height:1.7; padding-left:1.2rem;">
            <li style="margin-bottom:0.5rem">Utilisation de PocketBase comme Backend léger pour gérer la base de données SQLite et l'API REST.</li>
            <li style="margin-bottom:0.5rem">Création d'un Dashboard d'administration (SPA) en Vue.js intégrant un système de verrouillage concurrentiel d'édition et la compression d'images côté client.</li>
            <li style="margin-bottom:0.5rem">Développement du Bot Discord en Python (discord.py) avec une refonte asynchrone utilisant <code>aiohttp</code> pour garantir de hautes performances et limiter les connexions bloquantes.</li>
            <li style="margin-bottom:0.5rem">Intégration d'une recherche autocomplétée tolérante aux fautes (Fuzzy Search), d'un radar de salon intelligent, et de tâches CRON d'arrière-plan.</li>
          </ul>
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
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  reveals.forEach(reveal => revealObserver.observe(reveal));

  // 15. EFFET PARALLAXE SUBTIL
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
      const x = (window.innerWidth - e.pageX * 2) / 100;
      const y = (window.innerHeight - e.pageY * 2) / 100;
      document.querySelectorAll('.parallax').forEach(el => { el.style.transform = `translate(${x}px, ${y}px)`; });
    });
  }

  // 16. ANIMATION RÉSEAU (Particles.js)
  if (document.getElementById('particles-js')) {
    particlesJS('particles-js', {
      "particles": { "number": { "value": 50, "density": { "enable": true, "value_area": 800 } }, "color": { "value": "#2563eb" }, "shape": { "type": "circle" }, "opacity": { "value": 0.3 }, "size": { "value": 3, "random": true }, "line_linked": { "enable": true, "distance": 150, "color": "#2563eb", "opacity": 0.3, "width": 1 }, "move": { "enable": true, "speed": 1.5, "direction": "none" } },
      "interactivity": { "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" } }, "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.8 } }, "push": { "particles_nb": 3 } } },
      "retina_detect": true
    });
  }

  // 17. INITIALISATION TILT 3D
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll(".project-card"), { max: 6, speed: 400, glare: true, "max-glare": 0.15, scale: 1.02 });
  }

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
