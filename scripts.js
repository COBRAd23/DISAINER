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
