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
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
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
            portfolioRow.style.transform = `translateX(${-scrollX}px)`;
            rafId = requestAnimationFrame(step);
        }

        function startMarquee() {
            if (rafId === null) rafId = requestAnimationFrame(step);
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

    // Delegation for Portfolio Buttons (Works with clones)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.portfolio-btn');
        if (btn) {
            const modalId = btn.getAttribute('data-modal');
            if (modalId) {
                openProjectModal(modalId);
            }
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

            // Show confirmation modal
            const customModal = document.getElementById('customModal');
            if (customModal) {
                customModal.classList.add('active');
            }

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
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
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

    // Category Toggle
    const categoryToggles = document.querySelectorAll('.faq-category-toggle');
    categoryToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const category = toggle.parentElement;
            const isActive = category.classList.contains('active');

            // Close other categories
            document.querySelectorAll('.faq-category').forEach(otherCat => {
                otherCat.classList.remove('active');
            });

            if (!isActive) {
                category.classList.add('active');
            }
        });
    });

    // Question Toggle
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');

            // Close others only within the same category
            const container = item.closest('.faq-accordion');
            if (container) {
                container.querySelectorAll('.faq-item').forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
            }

            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});
