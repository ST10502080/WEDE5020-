
/**
 * Utility: safely run code after DOM is parsed
 */
document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initActiveNavLink();
    initSmoothScroll();
    initContactForm();
    initEnquiryForm();
    initImageLightbox();
    initScrollReveal();
    initBackToTop();
    setCurrentYear();
});

/* ------------------------------------------------------------
   1. Mobile Navigation Toggle
   ------------------------------------------------------------ */
function initMobileNav() {
    const nav = document.querySelector('.nav-links');
    const header = document.querySelector('header');
    if (!nav || !header) return;

    // Create hamburger button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'nav-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle navigation menu');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.innerHTML = '<span></span><span></span><span></span>';

    // Insert before nav
    header.insertBefore(toggleBtn, nav);

    toggleBtn.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('nav-open');
        toggleBtn.classList.toggle('active', isOpen);
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is clicked
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-open');
            toggleBtn.classList.remove('active');
            toggleBtn.setAttribute('aria-expanded', 'false');
        });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
            nav.classList.remove('nav-open');
            toggleBtn.classList.remove('active');
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.focus();
        }
    });
}

/* ------------------------------------------------------------
   2. Highlight Active Navigation Link
   ------------------------------------------------------------ */
function initActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

/* ------------------------------------------------------------
   3. Smooth Scroll for In-Page Anchors
   ------------------------------------------------------------ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/* ------------------------------------------------------------
   4. Contact Form Validation & Feedback
   ------------------------------------------------------------ */
function initContactForm() {
    const form = document.querySelector('.contact-container form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showFormMessage(form, '✅ Thank you! We will get back to you shortly.', 'success');
        form.reset();
    });
}

/* ------------------------------------------------------------
   5. Enquiry Form Validation & Feedback
   ------------------------------------------------------------ */
function initEnquiryForm() {
    const form = document.querySelector('form');
    if (!form) return;

    // Skip contact form (already handled)
    if (form.closest('.contact-container')) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic validation
        const name = form.querySelector('#name');
        const email = form.querySelector('#email');
        const phone = form.querySelector('#phonenumber');

        let errors = [];
        if (name && name.value.trim().length < 2) errors.push('Please enter your name.');
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
            errors.push('Please enter a valid email address.');
        }
        if (phone && phone.value.trim().length < 10) {
            errors.push('Please enter a valid phone number (at least 10 digits).');
        }

        if (errors.length > 0) {
            showFormMessage(form, '⚠️ ' + errors.join(' '), 'error');
            return;
        }

        showFormMessage(
            form,
            `✅ Thanks ${name.value.trim()}! Your enquiry has been sent. We'll be in touch soon.`,
            'success'
        );
        form.reset();
    });
}

/**
 * Display a message inside a form
 */
function showFormMessage(form, message, type) {
    let msgEl = form.querySelector('.form-message');
    if (!msgEl) {
        msgEl = document.createElement('div');
        msgEl.className = 'form-message';
        form.appendChild(msgEl);
    }
    msgEl.textContent = message;
    msgEl.className = `form-message ${type}`;
    msgEl.style.display = 'block';

    // Auto-hide after 6 seconds
    clearTimeout(msgEl._timer);
    msgEl._timer = setTimeout(() => {
        msgEl.style.display = 'none';
    }, 6000);
}

/* ------------------------------------------------------------
   6. Image Lightbox
   ------------------------------------------------------------ */
function initImageLightbox() {
    const images = document.querySelectorAll(
        '.gallery-container img, .category img, .image-container img'
    );
    if (images.length === 0) return;

    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close image">&times;</button>
        <img class="lightbox-img" src="" alt="">
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    function open(src, alt) {
        lightboxImg.src = src;
        lightboxImg.alt = alt || 'Enlarged product image';
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function close() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        lightboxImg.src = '';
    }

    images.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => open(img.src, img.alt));
    });

    closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) close();
    });
}

/* ------------------------------------------------------------
   7. Scroll Reveal Animation
   ------------------------------------------------------------ */
function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
        'h1, h2, p, .category, .gallery-container > div, .image-container img'
    );
    if (revealTargets.length === 0 || !('IntersectionObserver' in window)) return;

    revealTargets.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealTargets.forEach(el => observer.observe(el));
}

/* ------------------------------------------------------------
   8. Back-to-Top Button
   ------------------------------------------------------------ */
function initBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '↑';
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ------------------------------------------------------------
   9. Auto Year in Footer (optional)
   ------------------------------------------------------------ */
function setCurrentYear() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const year = new Date().getFullYear();
    const info = footer.querySelector('.contact-info');
    if (info) {
        const p = document.createElement('p');
        p.innerHTML = `<strong>&copy; ${year} Heritage Beadwork</strong>`;
        info.appendChild(p);
    }
}