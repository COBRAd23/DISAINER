document.addEventListener('DOMContentLoaded', () => {
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

    // --- Hero Interactive Reveal (Glass Mask) ---
    const glassMask = document.getElementById('glassMask');
    const heroSection = document.getElementById('inicio');

    if (glassMask && heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            const maskValue = `radial-gradient(circle 150px at ${x}% ${y}%, transparent 0%, black 80%)`;
            glassMask.style.webkitMaskImage = maskValue;
            glassMask.style.maskImage = maskValue;
        });

        // Reset to center on mouse leave
        heroSection.addEventListener('mouseleave', () => {
            const maskValue = `radial-gradient(circle 150px at 50% 50%, transparent 0%, black 80%)`;
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

    // --- Mobile Menu Toggle ---
    const hamburger = document.getElementById('hamburgerMenu');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Cerrar menú al hacer clic en un enlace (el scroll con offset lo maneja el listener global)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

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

        function step() {
            scrollX += speed;
            const maxOffset = portfolioRow.scrollWidth / 2;
            if (scrollX >= maxOffset) {
                scrollX = 0;
            }
            portfolioRow.style.transform = `translateX(${offset}px)`; // Offset variable fix
            rafId = requestAnimationFrame(step);
        }

        // Corrected step function with local scrollX
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

    // --- Services Carousel (Phase 7) ---
    const servicesTrack = document.getElementById('servicesTrack');
    const serviceSlides = document.querySelectorAll('.carousel-slide');
    const serviceDots = document.querySelectorAll('.indicator-bar');
    const prevSBtn = document.getElementById('prevService');
    const nextSBtn = document.getElementById('nextService');

    let currentSIndex = 0;
    let sInterval;

    function updateSCarousel(index) {
        if (!servicesTrack || serviceSlides.length === 0) return;
        if (index >= serviceSlides.length) currentSIndex = 0;
        else if (index < 0) currentSIndex = serviceSlides.length - 1;
        else currentSIndex = index;

        const offset = -currentSIndex * 100;
        servicesTrack.style.transform = `translateX(${offset}%)`;

        serviceSlides.forEach((slide, i) => slide.classList.toggle('active', i === currentSIndex));
        serviceDots.forEach((dot, i) => dot.classList.toggle('active', i === currentSIndex));
    }

    function startSAutoPlay() {
        stopSAutoPlay();
        sInterval = setInterval(() => updateSCarousel(currentSIndex + 1), 6000);
    }

    function stopSAutoPlay() {
        if (sInterval) clearInterval(sInterval);
    }

    if (servicesTrack && serviceSlides.length > 0) {
        if (prevSBtn) {
            prevSBtn.addEventListener('click', () => {
                updateSCarousel(currentSIndex - 1);
                startSAutoPlay();
            });
        }
        if (nextSBtn) {
            nextSBtn.addEventListener('click', () => {
                updateSCarousel(currentSIndex + 1);
                startSAutoPlay();
            });
        }
        serviceDots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                updateSCarousel(parseInt(e.target.dataset.index));
                startSAutoPlay();
            });
        });

        updateSCarousel(0);
        startSAutoPlay();

        servicesTrack.addEventListener('mouseenter', stopSAutoPlay);
        servicesTrack.addEventListener('mouseleave', startSAutoPlay);
    }

    // --- Handle Initial Hash Scroll with Offset ---
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            setTimeout(() => {
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }, 300); // Small delay to ensure layout and resources are ready
        }
    }

    // --- Global smooth scroll with offset for ALL in-page anchor links (nav + footer + CTAs) ---
    const HEADER_OFFSET = 100;
    const MENU_CLOSE_DURATION = 520; // ms, un poco más que la transición del menú (0.5s) para que el layout del index se asiente (quita margin-top del hero)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link || !link.getAttribute('href')) return;
        const href = link.getAttribute('href');
        if (href.indexOf('#') === -1) return;
        const targetId = href.split('#')[1];
        if (!targetId) return;
        const targetEl = document.getElementById(targetId);
        // Si el destino está en esta página, hacer scroll con offset en lugar de salto nativo
        if (targetEl) {
            e.preventDefault();
            const menuWasOpen = navLinks && navLinks.classList.contains('active');
            // En index con menú abierto, el hero tiene margin-top: 48vh; hay que cerrar primero y esperar al cierre para calcular bien la posición (como en portfolio)
            if (menuWasOpen) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
                setTimeout(() => {
                    const elTop = targetEl.getBoundingClientRect().top;
                    const offsetPos = elTop + window.scrollY - HEADER_OFFSET;
                    window.scrollTo({ top: offsetPos, behavior: 'smooth' });
                }, MENU_CLOSE_DURATION);
            } else {
                const elTop = targetEl.getBoundingClientRect().top;
                const offsetPos = elTop + window.scrollY - HEADER_OFFSET;
                window.scrollTo({ top: offsetPos, behavior: 'smooth' });
            }
        }
    });
});
