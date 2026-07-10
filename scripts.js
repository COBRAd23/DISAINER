// Global Theme Logic - Execute immediately to prevent FOUC (Flash of Unstyled Content)
function applyGlobalTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('themeToggle');

    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if (themeToggle) {
            const iconLight = themeToggle.querySelector('.theme-icon-light');
            const iconDark = themeToggle.querySelector('.theme-icon-dark');
            if (iconLight) iconLight.style.display = 'block';
            if (iconDark) iconDark.style.display = 'none';
        }
    } else {
        document.documentElement.removeAttribute('data-theme');
        if (themeToggle) {
            const iconLight = themeToggle.querySelector('.theme-icon-light');
            const iconDark = themeToggle.querySelector('.theme-icon-dark');
            if (iconLight) iconLight.style.display = 'none';
            if (iconDark) iconDark.style.display = 'block';
        }
    }
}

// Initial immediate call
applyGlobalTheme();

// Add Barba.js library link through CDN: https://unpkg.com/@barba/core

function initPage() {
    // --- Reveal on Scroll Logic ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- FAQ Interactive Reveal (Glass Mask) ---
    const glassMask = document.getElementById('glassMask');
    const faqSection = document.getElementById('faq');

    if (glassMask && faqSection) {
        faqSection.addEventListener('mousemove', (e) => {
            const rect = faqSection.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            // Updated with 150px size on move
            const maskValue = `radial-gradient(circle 150px at ${x}% ${y}%, transparent 0%, black 80%)`;
            glassMask.style.webkitMaskImage = maskValue;
            glassMask.style.maskImage = maskValue;
        });

        // Reset to 0 size on mouse leave to hide the "preset" ring
        faqSection.addEventListener('mouseleave', () => {
            const maskValue = `radial-gradient(circle 0px at 50% 50%, transparent 0%, black 100%)`;
            glassMask.style.webkitMaskImage = maskValue;
            glassMask.style.maskImage = maskValue;
        });
    }

    // --- Header Scroll Effect ---
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle --- (moved to global event delegation)
    // Removed from here to avoid multiple listeners in SPA

    // --- Portfolio Horizontal Marquee ---
    const portfolioWrapper = document.querySelector('.portfolio-grid-wrapper');
    const portfolioRow = document.querySelector('.portfolio-overlay-grid');

    if (portfolioWrapper && portfolioRow) {
        // Clone cards for infinite loop
        const cards = Array.from(portfolioRow.children);
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            portfolioRow.appendChild(clone);
        });

        let scrollX = 0;
        let rafId = null;
        let speed = 0.6;
        let isDragging = false;
        let dragStartX = 0;
        let dragStartScrollX = 0;
        let hasMoved = false;
        let justDragged = false;
        const dragThreshold = 5;

        function normalizeScroll(value) {
            const maxOffset = portfolioRow.scrollWidth / 2;
            return ((value % maxOffset) + maxOffset) % maxOffset;
        }

        function updateTransform() {
            portfolioRow.style.transform = `translateX(${-scrollX}px)`;
        }

        function animateMarquee() {
            if (!isDragging) {
                scrollX += speed;
                scrollX = normalizeScroll(scrollX);
                updateTransform();
            }
            rafId = requestAnimationFrame(animateMarquee);
        }

        function startMarquee() {
            if (rafId === null && !isDragging) rafId = requestAnimationFrame(animateMarquee);
        }

        function stopMarquee() {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }

        function beginDrag(clientX) {
            isDragging = true;
            hasMoved = false;
            justDragged = false;
            dragStartX = clientX;
            dragStartScrollX = scrollX;
            stopMarquee();
            portfolioWrapper.style.cursor = 'grabbing';
        }

        function doDrag(clientX) {
            const deltaX = clientX - dragStartX;
            if (!hasMoved && Math.abs(deltaX) > dragThreshold) {
                hasMoved = true;
                portfolioRow.style.pointerEvents = 'none';
            }
            if (hasMoved) {
                scrollX = normalizeScroll(dragStartScrollX - deltaX);
                updateTransform();
            }
        }

        function endDrag() {
            if (!isDragging) return;
            isDragging = false;
            if (hasMoved) {
                justDragged = true;
            }
            scrollX = normalizeScroll(scrollX);
            portfolioWrapper.style.cursor = 'grab';
            portfolioRow.style.pointerEvents = 'auto';
            startMarquee();
        }

        startMarquee();

        portfolioWrapper.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            beginDrag(e.clientX);
        });

        portfolioWrapper.addEventListener('mousemove', (e) => {
            if (isDragging) {
                doDrag(e.clientX);
            }
        });

        portfolioWrapper.addEventListener('mouseup', () => {
            endDrag();
        });

        portfolioWrapper.addEventListener('mouseleave', () => {
            endDrag();
        });

        portfolioWrapper.addEventListener('touchstart', (e) => {
            beginDrag(e.touches[0].clientX);
        }, { passive: true });

        portfolioWrapper.addEventListener('touchmove', (e) => {
            if (isDragging) {
                doDrag(e.touches[0].clientX);
            }
        }, { passive: true });

        portfolioWrapper.addEventListener('touchend', () => {
            endDrag();
        });

        portfolioWrapper.addEventListener('click', (e) => {
            if (justDragged) {
                e.preventDefault();
                e.stopPropagation();
                justDragged = false;
            }
        }, true);

        // Wheel for speed control
        portfolioWrapper.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 1 : -1;
            speed = Math.max(0.1, Math.min(2, speed + delta * 0.1)); // Clamp speed
        });

        // Pause on hover (but allow drag)
        portfolioWrapper.addEventListener('mouseenter', () => {
            if (!isDragging) stopMarquee();
            portfolioWrapper.style.cursor = 'grab';
        });
        portfolioWrapper.addEventListener('mouseleave', () => {
            if (!isDragging) startMarquee();
            portfolioWrapper.style.cursor = 'default';
        });

        // Touch support for mobile
        portfolioWrapper.addEventListener('touchstart', (e) => {
            isDragging = true;
            initialScrollX = scrollX;
            initialMouseX = e.touches[0].clientX;
            stopMarquee();
            portfolioRow.style.pointerEvents = 'none'; // Disable clicks during drag
        });

        portfolioWrapper.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const deltaX = e.touches[0].clientX - initialMouseX;
                scrollX = initialScrollX - deltaX; // Move row following touch
            }
        });

        portfolioWrapper.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                // Normalize scrollX to prevent jumps
                const maxOffset = portfolioRow.scrollWidth / 2;
                scrollX = ((scrollX % maxOffset) + maxOffset) % maxOffset;
                portfolioRow.style.pointerEvents = 'auto'; // Re-enable clicks
                startMarquee();
            }
        });
    }

    // --- Modal Logic ---
    window.openProjectModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeProjectModal = function () {
        const modals = document.querySelectorAll('.project-modal, #customModal');
        modals.forEach(modal => modal.classList.remove('active'));
        document.body.style.overflow = 'auto';
    };

    window.closeModal = closeProjectModal; // Alias for form modal

    // Delegation for Portfolio Cards
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.overlay-card');
        if (card) {
            const modalId = card.getAttribute('data-modal');
            if (modalId) openProjectModal(modalId);
        }
    });

    // --- Contact Form ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.btn-submit');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Enviando...';
            submitBtn.disabled = true;

            const formData = new FormData(this);
            formData.append('_subject', `Nuevo contacto web de ${formData.get('name')}`);
            formData.append('_captcha', 'false');

            fetch("https://formsubmit.co/ajax/hola@iamdisainer.com", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                const customModal = document.getElementById('customModal');
                if (customModal) customModal.classList.add('active');
                this.reset();
            })
            .catch(error => {
                console.error("Error al enviar el formulario:", error);
                alert("Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.");
            })
            .finally(() => {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            });
        });
    }

    // --- Back to Top ---
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) backToTop.classList.add('visible');
            else backToTop.classList.remove('visible');
        });
    }

    // --- Active Link Highlighting ---
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-links a').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === pageName || (pageName === 'index.html' && linkPath.startsWith('#'))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // --- FAQ Accordion Logic ---
    const categoryToggles = document.querySelectorAll('.faq-category-toggle');
    categoryToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const category = toggle.parentElement;
            const isActive = category.classList.contains('active');
            document.querySelectorAll('.faq-category').forEach(otherCat => otherCat.classList.remove('active'));
            if (!isActive) category.classList.add('active');
        });
    });

    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');
            const container = item.closest('.faq-accordion');
            if (container) {
                container.querySelectorAll('.faq-item').forEach(otherItem => otherItem.classList.remove('active'));
            }
            if (!isActive) item.classList.add('active');
        });
    });

    // --- Interactive Services Accordion (Refined) ---
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // If clicking the button, don't trigger accordion toggle again (though it works fine)
            if (e.target.classList.contains('btn-me-interesa')) return;

            const isActive = item.classList.contains('active');

            // Close all items
            accordionItems.forEach(i => i.classList.remove('active'));

            // If the clicked item wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    function getHeaderHeight() {
        const header = document.getElementById('header');
        return header ? header.offsetHeight : 0;
    }

    // --- Handle Initial Hash Scroll with Offset ---
    function scrollToHash() {
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const headerHeight = getHeaderHeight();
                const topOffset = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: topOffset,
                    behavior: "smooth"
                });
            }
        }
    }

    // --- Global smooth scroll with offset for ALL in-page anchor links (nav + footer + CTAs) ---
    function scrollToTarget(el, targetId) {
        // Special case for scrolling to top
        if (targetId === 'inicio') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const headerHeight = getHeaderHeight();
        const topOffset = el.offsetTop - headerHeight;
        window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }

    // Smooth Scroll Listener (updated for SPA/Barba)
    function handleAnchorClick(e) {
        const href = this.getAttribute('href');
        if (href.indexOf('#') === -1) return;
        const linkPath = href.split('#')[0];
        const currentPathName = window.location.pathname.split('/').pop() || 'index.html';
        const targetPathName = linkPath.split('/').pop() || 'index.html';

        if (linkPath === '' || targetPathName === currentPathName) {
            const targetId = href.split('#')[1];
            if (!targetId) return;
            const targetEl = document.getElementById(targetId);
            if (!targetEl) return;
            e.preventDefault();
            scrollToTarget(targetEl, targetId);
        }
    }

    // Remove previous listeners to avoid duplicates
    document.querySelectorAll('a[href^="#"], a[href*="#"]').forEach(link => {
        link.removeEventListener('click', handleAnchorClick);
    });

    // Add new listeners
    document.querySelectorAll('a[href^="#"], a[href*="#"]').forEach(link => {
        link.addEventListener('click', handleAnchorClick);
    });

    // --- Portfolio Hero Parallax ---
    const parallaxTitle = document.getElementById('parallax-title');
    if (parallaxTitle) {
        window.addEventListener('scroll', () => {
            let scrollY = window.scrollY;
            parallaxTitle.style.transform = `translateY(${scrollY * 0.4}px)`;
        }, { passive: true });
    }

    // --- Portfolio Bento Stagger Reveal ---
    const bentoElements = document.querySelectorAll('.bento-reveal');
    if (bentoElements.length > 0) {
        const bentoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-inview');
                    bentoObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        bentoElements.forEach(el => bentoObserver.observe(el));
    }

    // --- Portfolio Bento Hover Cursor Parallax ---
    const bentoCards = document.querySelectorAll('.bento-card');
    bentoCards.forEach(card => {
        const img = card.querySelector('.bento-img');
        if (img) {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                const moveX = (x / rect.width) * 6;
                const moveY = (y / rect.height) * 6;

                img.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });

            card.addEventListener('mouseleave', () => {
                img.style.transform = `translate(0px, 0px)`;
            });
        }
    });

    // --- Theme Icon Visibility Check ---
    applyGlobalTheme();
}

// Global Music Handlers — persist state via sessionStorage across full reloads
function initGlobalMusic() {
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');

    if (!musicToggle || !bgMusic) return;

    bgMusic.preload = 'auto';

    // --- Restore state from sessionStorage ---
    const wasPlaying = sessionStorage.getItem('musicPlaying') === 'true';
    const savedTime = parseFloat(sessionStorage.getItem('musicTime') || '0');

    function applyMusicUI(playing) {
        if (playing) {
            musicToggle.classList.add('is-playing');
            musicToggle.setAttribute('aria-label', 'Pausar música de fondo');
        } else {
            musicToggle.classList.remove('is-playing');
            musicToggle.setAttribute('aria-label', 'Activar música de fondo');
        }
    }

    function saveMusicState() {
        sessionStorage.setItem('musicPlaying', String(!bgMusic.paused));
        sessionStorage.setItem('musicTime', String(bgMusic.currentTime || 0));
    }

    function resumeMusic() {
        if (!wasPlaying) return;

        const playNow = () => {
            if (savedTime > 0 && bgMusic.readyState > 0) {
                bgMusic.currentTime = savedTime;
            }
            bgMusic.play().then(() => {
                applyMusicUI(true);
            }).catch(() => {
                applyMusicUI(false);
            });
        };

        if (bgMusic.readyState > 0) {
            playNow();
        } else {
            bgMusic.addEventListener('loadedmetadata', playNow, { once: true });
        }
    }

    if (wasPlaying) {
        resumeMusic();
    }

    // --- Save state when the page is hidden or unloaded ---
    window.addEventListener('pagehide', saveMusicState);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            saveMusicState();
        }
    });

    // --- Toggle button ---
    if (musicToggle.dataset.listenerAttached) return;

    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                applyMusicUI(true);
                sessionStorage.setItem('musicPlaying', 'true');
            }).catch(() => { });
        } else {
            bgMusic.pause();
            applyMusicUI(false);
            sessionStorage.setItem('musicPlaying', 'false');
        }
    });

    musicToggle.dataset.listenerAttached = 'true';
}

function initInstitutionalVideo() {
    const video = document.getElementById('institutionalVideo');
    if (!video) return;

    const playPauseBtn = document.getElementById('instPlayPause');
    const stopBtn = document.getElementById('instStop');
    const prevBtn = document.getElementById('instPrev');
    const nextBtn = document.getElementById('instNext');
    const muteBtn = document.getElementById('instMute');
    const progress = document.getElementById('instProgress');
    const volume = document.getElementById('instVolume');

    const updatePlayPauseUI = () => {
        if (!playPauseBtn) return;
        const icon = playPauseBtn.querySelector('svg path');
        if (icon) {
            icon.setAttribute('d', video.paused
                ? 'M8 5v14l11-7z'
                : 'M8 5h3v14H8zM13 5h3v14h-3z');
        }
        playPauseBtn.setAttribute('aria-label', video.paused ? 'Reproducir video' : 'Pausar video');
    };

    const updateMuteUI = () => {
        if (!muteBtn) return;
        muteBtn.classList.toggle('active', !video.muted && video.volume > 0);
        muteBtn.setAttribute('aria-label', video.muted ? 'Activar sonido' : 'Silenciar sonido');
    };

    const scrubTo = (value) => {
        if (!video.duration || Number.isNaN(video.duration)) return;
        video.currentTime = (value / 100) * video.duration;
    };

    if (progress) {
        progress.addEventListener('input', () => scrubTo(progress.value));
    }

    if (volume) {
        volume.addEventListener('input', () => {
            video.volume = Number(volume.value);
            video.muted = video.volume === 0;
            updateMuteUI();
        });
    }

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (video.paused) {
                video.play().catch(() => { });
            } else {
                video.pause();
            }
            updatePlayPauseUI();
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            video.pause();
            video.currentTime = 0;
            updatePlayPauseUI();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            video.currentTime = Math.max(0, video.currentTime - 10);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (video.duration && !Number.isNaN(video.duration)) {
                video.currentTime = Math.min(video.duration, video.currentTime + 10);
            }
        });
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            if (!video.muted && video.volume === 0) {
                video.volume = 0.5;
                if (volume) volume.value = '0.5';
            }
            updateMuteUI();
        });
    }

    video.addEventListener('timeupdate', () => {
        if (progress && video.duration && !Number.isNaN(video.duration)) {
            progress.value = (video.currentTime / video.duration) * 100;
        }
    });

    video.addEventListener('play', updatePlayPauseUI);
    video.addEventListener('pause', updatePlayPauseUI);
    video.addEventListener('loadedmetadata', () => {
        if (volume) {
            volume.value = String(video.volume);
        }
        updateMuteUI();
        updatePlayPauseUI();
    });
}

// Initial Call
document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const preloaderBar = document.getElementById('preloaderBar');

    if (preloader && preloaderBar) {
      if (sessionStorage.getItem('preloaderPlayed') === 'true') {
        preloader.classList.add('hidden');
        document.body.style.overflow = '';
        document.body.classList.add('is-loaded');
      } else {
        const videoDark  = document.getElementById('preloader-video-dark');
        const videoLight = document.getElementById('preloader-video-light');
        const savedTheme = localStorage.getItem('theme');
        const activeVideo = savedTheme === 'light' ? videoLight : videoDark;

        if (activeVideo) {
          activeVideo.addEventListener('timeupdate', () => {
            const percent = (activeVideo.currentTime / activeVideo.duration) * 100;
            preloaderBar.style.width = percent + '%';
          });

          activeVideo.addEventListener('ended', () => {
            // Completar la barra al 100%
            preloaderBar.style.width = '100%';
            preloaderBar.style.transition = 'width 0.2s linear';

            // Parpadeo y salida
            setTimeout(() => {
              let blinks = 0;
              const blink = setInterval(() => {
                preloaderBar.style.opacity = preloaderBar.style.opacity === '0' ? '1' : '0';
                blinks++;
                if (blinks >= 6) {
                  clearInterval(blink);
                  preloader.classList.add('hidden');
                  document.body.style.overflow = '';
                  document.body.classList.add('is-loaded');
                  sessionStorage.setItem('preloaderPlayed', 'true');
                }
              }, 120);
            }, 200);
          });
        } else {
          preloader.classList.add('hidden');
        }
      }
    }

    initPage();
    initGlobalMusic();
    initInstitutionalVideo();
});

// Single handle for theme toggle
document.addEventListener('click', (e) => {
    const toggle = e.target.closest('#themeToggle');
    if (toggle) {
        const iconLight = toggle.querySelector('.theme-icon-light');
        const iconDark = toggle.querySelector('.theme-icon-dark');
        let theme = document.documentElement.getAttribute('data-theme');

        if (theme === 'light') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
            if (iconLight) iconLight.style.display = 'none';
            if (iconDark) iconDark.style.display = 'block';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            if (iconLight) iconLight.style.display = 'block';
            if (iconDark) iconDark.style.display = 'none';
        }
    }
});

// Global event delegation for fullscreen menu to avoid multiple listeners in SPA
document.addEventListener('click', (e) => {
    const hamburger = e.target.closest('#hamburgerMenu');
    const fullscreenMenu = document.getElementById('fullscreenMenu');

    if (hamburger) {
        e.stopPropagation();
        if (fullscreenMenu) {
            hamburger.classList.toggle('active');
            fullscreenMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        }
    }

    // Close menu when clicking on a nav link
    const navLink = e.target.closest('#fullscreenMenu a');
    if (navLink) {
        const hamburgerEl = document.getElementById('hamburgerMenu');
        const fullscreenMenuEl = document.getElementById('fullscreenMenu');
        if (hamburgerEl && fullscreenMenuEl) {
            hamburgerEl.classList.remove('active');
            
            // Wait slightly for smooth transition before removing overlay
            setTimeout(() => {
                fullscreenMenuEl.classList.remove('active');
                document.body.classList.remove('menu-open');
            }, 100);
        }
    }

    // Close menu when clicking outside (prevent accidental close, only close if clicking explicitly out)
    /* Since menu is fullscreen, clicking 'outside' doesn't apply the same way, 
       but if we add a click on the stripe background, it could close it. */
});
// Smooth Scroll — Lenis
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

/* =============================================
   BUSTOS INTERVENIDOS — Click + Scroll Zoom
   ============================================= */
(function () {
  const img  = document.getElementById('bustoImg');
  const hero = document.querySelector('.hero-v4');
  if (!img || !hero) return;

  const versiones = [
    'img/bustosversiones/amarillo.webp',
    'img/bustosversiones/collage.webp',
    'img/bustosversiones/grafiti.webp',
    'img/bustosversiones/marmol-doradas.webp',
    'img/bustosversiones/negro-doradas.webp',
    'img/bustosversiones/oleo.webp',
  ];

  versiones.forEach(src => { new Image().src = src; });

  const original = 'img/yo_busto.png';
  let currentVersion = null;
  let usados = [];

  // Click directo en el img — funciona sin importar pointer-events del padre
  img.style.pointerEvents = 'auto';
  img.style.cursor = 'pointer';

  img.addEventListener('click', (e) => {
    e.stopPropagation();
    if (img.dataset.changing === 'true') return;
    img.dataset.changing = 'true';

    if (usados.length === versiones.length) usados = [];
    let idx;
    do { idx = Math.floor(Math.random() * versiones.length); }
    while (usados.includes(idx));
    usados.push(idx);
    const siguiente = versiones[idx];
    currentVersion = siguiente;

    // Glitch usando solo opacity y filter, sin tocar transform
    let step = 0;
    const steps = [
      { opacity: '0.6', filter: 'brightness(2) saturate(0) contrast(2)' },
      { opacity: '1',   filter: '' },
      { opacity: '0.4', filter: 'hue-rotate(90deg) brightness(1.5)' },
      { opacity: '1',   filter: '' },
      { opacity: '0.2', filter: 'brightness(3) saturate(0)' },
      { opacity: '0',   filter: '' },
    ];

    const glitch = setInterval(() => {
      img.style.opacity = steps[step].opacity;
      img.style.filter  = steps[step].filter;
      step++;
      if (step >= steps.length) {
        clearInterval(glitch);
        img.src = siguiente;
        img.style.transition = 'opacity 0.3s ease';
        img.style.filter = '';
        img.style.opacity = '1';
        setTimeout(() => {
          img.style.transition = '';
          img.dataset.changing = 'false';
        }, 300);
      }
    }, 55);
  });


  // Scroll Zoom — sobre el IMG directamente, no el div animado
  gsap.registerPlugin(ScrollTrigger);

gsap.to(img, {
    scale: 2.8,
    x: '65%',
    y: '25%',
    rotation: -8,
    rotationY: 25,
    ease: 'none',
    transformOrigin: 'center center',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    }
  });

})();

/* =============================================
   CURSOR — Estela orgánica que difumina el fondo
   ============================================= */
(function () {

  document.body.style.cursor = 'none';

  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    z-index: 99991;
    pointer-events: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #FFCC00;
    box-shadow: 0 0 8px 2px rgba(255, 204, 0, 0.6);
    transform: translate(-50%, -50%);
    transition: width 0.25s ease, height 0.25s ease, opacity 0.25s ease, box-shadow 0.25s ease;
  `;
  document.body.appendChild(cursor);

  const trailContainer = document.createElement('div');
  trailContainer.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 99989;
    pointer-events: none;
    overflow: hidden;
  `;
  document.body.appendChild(trailContainer);

  let mouseX = -100, mouseY = -100;
  let lastX = -100, lastY = -100;
  let isHover = false;
  let lastSpawn = 0;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';

    const now  = performance.now();
    const dist = Math.hypot(mouseX - lastX, mouseY - lastY);

    if (now - lastSpawn > 30 || dist > 18) {
      spawnWisp(mouseX, mouseY, isHover);
      lastSpawn = now;
      lastX = mouseX;
      lastY = mouseY;
    }
  });

  const interactivos = 'a, button, .overlay-card, .accordion-item, #bustoImg, .btn-cta, .portfolio-btn';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactivos)) {
      isHover = true;
      cursor.style.width      = '24px';
      cursor.style.height     = '24px';
      cursor.style.boxShadow  = '0 0 22px 6px rgba(255, 204, 0, 0.85)';
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactivos)) {
      isHover = false;
      cursor.style.width      = '10px';
      cursor.style.height     = '10px';
      cursor.style.boxShadow  = '0 0 8px 2px rgba(255, 204, 0, 0.6)';
    }
  });

  function spawnWisp(x, y, hover) {
    const size = hover ? (60 + Math.random() * 30) : (30 + Math.random() * 18);
    const blur = hover ? (22 + Math.random() * 8) : (10 + Math.random() * 4);
    const glow = hover ? 0.30 : 0.12;

    const wisp = document.createElement('div');

    const r1 = 40 + Math.random() * 20;
    const r2 = 40 + Math.random() * 20;
    const r3 = 40 + Math.random() * 20;
    const r4 = 40 + Math.random() * 20;

    // Estado inicial (invisible, chico)
    wisp.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      transform: translate(-50%, -50%) scale(0.3) rotate(${Math.random() * 40 - 20}deg);
      border-radius: ${r1}% ${100 - r1}% ${r2}% ${100 - r2}% / ${r3}% ${r4}% ${100 - r4}% ${100 - r3}%;
      backdrop-filter: blur(${blur}px) saturate(1.3);
      -webkit-backdrop-filter: blur(${blur}px) saturate(1.3);
      background: radial-gradient(circle, rgba(255,204,0,${glow}) 0%, rgba(255,204,0,0) 70%);
      mix-blend-mode: screen;
      opacity: 0;
      pointer-events: none;
      transition: transform 1.4s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.4s ease-out;
    `;

    trailContainer.appendChild(wisp);

    // Forzar reflow ANTES de animar — sin esto la transición no dispara
    void wisp.offsetWidth;

    requestAnimationFrame(() => {
      wisp.style.opacity   = '1';
      wisp.style.transform = `translate(-50%, -50%) scale(1.9) rotate(${Math.random() * 40 - 20}deg) translateY(-${12 + Math.random() * 16}px)`;
    });

    setTimeout(() => { wisp.style.opacity = '0'; }, 250);
    setTimeout(() => { wisp.remove(); }, 1600);
  }

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });

})();