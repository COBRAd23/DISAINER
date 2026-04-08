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

        function animateMarquee() {
            scrollX += speed;
            const maxOffset = portfolioRow.scrollWidth / 2;
            if (scrollX >= maxOffset) scrollX = 0;
            portfolioRow.style.transform = `translateX(${-scrollX}px)`;
            rafId = requestAnimationFrame(animateMarquee);
        }

        function startMarquee() {
            if (rafId === null) rafId = requestAnimationFrame(animateMarquee);
        }

        function stopMarquee() {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }

        startMarquee();

        // Pause on hover
        portfolioWrapper.addEventListener('mouseenter', stopMarquee);
        portfolioWrapper.addEventListener('mouseleave', startMarquee);

        // Touch support for mobile
        portfolioWrapper.addEventListener('touchstart', stopMarquee);
        portfolioWrapper.addEventListener('touchend', startMarquee);
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
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');

            const subject = encodeURIComponent(`Nuevo contacto de ${name}`);
            const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`);
            const mailtoLink = `mailto:agustin.disainer@gmail.com?subject=${subject}&body=${body}`;

            const customModal = document.getElementById('customModal');
            if (customModal) customModal.classList.add('active');

            setTimeout(() => {
                window.location.href = mailtoLink;
            }, 800);

            this.reset();
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

    // --- Handle Initial Hash Scroll with Offset ---
    function scrollToHash() {
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }
    }

    if (window.location.hash) {
        const checkLoaded = () => {
            if (document.body.classList.contains('is-loaded')) {
                scrollToHash();
            } else {
                setTimeout(checkLoaded, 100);
            }
        };
        checkLoaded();
    }

    // --- Global smooth scroll with offset for ALL in-page anchor links (nav + footer + CTAs) ---
    const HEADER_OFFSET = 80;
    function scrollToTarget(el, targetId) {
        // Special case for scrolling to top
        if (targetId === 'inicio') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const elTop = el.getBoundingClientRect().top;
        const offsetPos = elTop + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top: offsetPos, behavior: 'smooth' });
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

    if (wasPlaying) {
        bgMusic.currentTime = savedTime;
        bgMusic.play().then(() => {
            applyMusicUI(true);
        }).catch(() => {
            // Autoplay blocked — keep UI silent, user can click
            applyMusicUI(false);
        });
    }

    // --- Save state before the page unloads (full navigation) ---
    window.addEventListener('beforeunload', () => {
        sessionStorage.setItem('musicPlaying', String(!bgMusic.paused));
        sessionStorage.setItem('musicTime', String(bgMusic.currentTime));
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

// Initial Call
document.addEventListener('DOMContentLoaded', () => {
    // --- Preloader Logic ---
    const preloader = document.getElementById('preloader');
    const percentSpan = document.getElementById('preloader-percent');
    if (preloader && percentSpan) {
        if (sessionStorage.getItem('preloaderPlayed') === 'true') {
            preloader.classList.add('hidden');
            document.body.style.overflow = '';
            document.body.classList.add('is-loaded');
        } else {
            const videoDark = document.getElementById('preloader-video-dark');
            const videoLight = document.getElementById('preloader-video-light');
            const savedTheme = localStorage.getItem('theme');
            const activeVideo = savedTheme === 'light' ? videoLight : videoDark;

            if (activeVideo) {
                activeVideo.addEventListener('timeupdate', () => {
                    let percent = Math.round((activeVideo.currentTime / activeVideo.duration) * 100);
                    percentSpan.textContent = percent;
                });
                activeVideo.addEventListener('ended', () => {
                    preloader.classList.add('hidden');
                    document.body.style.overflow = '';
                    document.body.classList.add('is-loaded');
                    sessionStorage.setItem('preloaderPlayed', 'true');
                });
            } else {
                preloader.classList.add('hidden');
            }
        }
    }

    initPage();
    initGlobalMusic();

    // Barba Initialization - Activate SPA transitions on all pages for consistent navigation
    if (typeof barba !== "undefined") {
        const currentContainer = document.querySelector('[data-barba="container"]');

        if (currentContainer) {
            barba.init({
                transitions: [{
                    name: 'opacity-transition',
                    leave(data) {
                        return gsap.to(data.current.container, {
                            opacity: 0,
                            duration: 0.5
                        });
                    },
                    enter(data) {
                        return gsap.from(data.next.container, {
                            opacity: 0,
                            duration: 0.5
                        });
                    },
                    afterEnter(data) {
                        // Scroll to top immediately before any re-init
                        window.scrollTo(0, 0);

                        initPage();

                        // Re-sync music toggle after Barba SPA swap
                        const musicToggle = document.getElementById('musicToggle');
                        if (musicToggle) {
                            delete musicToggle.dataset.listenerAttached;
                        }
                        initGlobalMusic();

                        // Extract hash from the clicked link (trigger), the destination
                        // URL href string, or window.location — in that priority order.
                        // NOTE: Barba v2's data.next.url object does NOT have a .hash
                        // property, so we must parse the href string manually.
                        let hash = '';
                        const triggerHref = data.trigger?.getAttribute?.('href') || '';
                        const nextHref    = data.next?.url?.href || '';

                        if (triggerHref.includes('#')) {
                            hash = '#' + triggerHref.split('#')[1];
                        } else if (nextHref.includes('#')) {
                            hash = '#' + nextHref.split('#')[1];
                        } else if (window.location.hash) {
                            hash = window.location.hash;
                        }

                        if (hash) {
                            const targetId = hash.replace('#', '');
                            setTimeout(() => {
                                const targetEl = document.getElementById(targetId);
                                if (targetEl) {
                                    const headerOffset = 80;
                                    const offsetPos = targetEl.getBoundingClientRect().top + window.scrollY - headerOffset;
                                    window.scrollTo({ top: offsetPos, behavior: 'smooth' });
                                }
                            }, 350); // after initPage's own 300ms hash handler
                        }
                    }
                }]
            });
        }
    }
});

// Single handle for theme toggle across transitions
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

// Global event delegation for mobile menu to avoid multiple listeners in SPA
document.addEventListener('click', (e) => {
    const hamburger = e.target.closest('#hamburgerMenu');
    const navLinks = document.getElementById('navLinks');

    if (hamburger) {
        e.stopPropagation();
        if (navLinks) {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        }
    }

    // Close menu when clicking on a nav link
    const navLink = e.target.closest('#navLinks a');
    if (navLink) {
        const hamburgerEl = document.getElementById('hamburgerMenu');
        const navLinksEl = document.getElementById('navLinks');
        if (hamburgerEl && navLinksEl) {
            hamburgerEl.classList.remove('active');
            navLinksEl.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    }

    // Close menu when clicking outside
    if (navLinks && hamburger && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
});
