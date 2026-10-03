/* ============================================================
   ZAGRANEASY TRAVEL — Global JavaScript
   Version: 25.0 (fixed navbar on iOS/Android)
   ============================================================ */

'use strict';

/* ============================================================
   THEME TOGGLE
   ============================================================ */
let isDark = false;

function toggleTheme() {
    isDark = !isDark;
    document.documentElement.classList.toggle('dark', isDark);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = isDark ? 'light_mode' : 'dark_mode';
    try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (e) {}
}

(function initTheme() {
    try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            isDark = true;
            document.documentElement.classList.add('dark');
            const icon = document.getElementById('themeIcon');
            if (icon) icon.textContent = 'light_mode';
        } else {
            document.documentElement.classList.remove('dark');
        }
    } catch (e) {
        document.documentElement.classList.remove('dark');
    }
})();

/* ============================================================
   NAVBAR SCROLL — оптимизировано для мобильных
   FIX: класс .scrolled переключается только при пересечении
   порога 80px. Высота navbar при этом НЕ меняется (это критично
   для iOS/Android — иначе "плавающий" хедер при скролле).
   ============================================================ */
const navbar = document.getElementById('navbar');
let scrollTicking = false;
let isScrolled = false;

function handleScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(function() {
        if (navbar) {
            const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;

            if (!isScrolled && currentScrollY > 80) {
                navbar.classList.add('scrolled');
                isScrolled = true;
            } else if (isScrolled && currentScrollY <= 80) {
                navbar.classList.remove('scrolled');
                isScrolled = false;
            }
        }
        scrollTicking = false;
    });
}

if (navbar) {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
const modal = document.getElementById('requestModal');

function toggleMenu() {
    if (!mobileMenu) return;
    const isOpen = mobileMenu.classList.toggle('open');
    if (menuToggle) {
        menuToggle.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    }
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
}
if (mobileClose) {
    mobileClose.addEventListener('click', toggleMenu);
}

document.querySelectorAll('.mobile-link').forEach(function(link) {
    link.addEventListener('click', function() {
        if (mobileMenu && mobileMenu.classList.contains('open')) {
            toggleMenu();
        }
    });
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (mobileMenu && mobileMenu.classList.contains('open')) toggleMenu();
        if (modal && modal.classList.contains('active')) closeModal();
    }
});

/* ============================================================
   MODAL
   ============================================================ */
function openModal() {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

if (modal) {
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
}

/* ============================================================
   FORM SUBMIT
   ============================================================ */
function handleSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('guestName');
    const phone = document.getElementById('guestPhone');
    const date = document.getElementById('guestDate');

    if (!name || !phone || !date) return;

    const nameVal = name.value.trim();
    const phoneVal = phone.value.trim();
    const dateVal = date.value;

    if (!nameVal || !phoneVal || !dateVal) {
        alert(window.currentLang === 'ru'
            ? 'Пожалуйста, заполните все поля.'
            : 'Please fill in all fields.');
        return;
    }

    alert(window.currentLang === 'ru'
        ? 'Спасибо! Мы свяжемся с вами в ближайшее время.'
        : 'Thank you! We will contact you shortly.');

    const form = document.getElementById('requestForm');
    if (form) form.reset();
    closeModal();
}

/* ============================================================
   LANGUAGE SWITCHER
   ============================================================ */
let currentLang = 'ru';
try {
    currentLang = localStorage.getItem('language') || 'ru';
} catch (e) {
    currentLang = 'ru';
}
window.currentLang = currentLang;

function applyTranslation(el, lang) {
    const text = el.dataset[lang];
    if (!text) return;

    const children = Array.from(el.children).filter(function(child) {
        return child.dataset && (child.dataset.en !== undefined || child.dataset.ru !== undefined);
    });

    if (children.length > 0) {
        let textNodeUpdated = false;
        for (let i = 0; i < el.childNodes.length; i++) {
            const node = el.childNodes[i];
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                const leading = node.textContent.match(/^\s*/)[0];
                const trailing = node.textContent.match(/\s*$/)[0];
                node.textContent = leading + text + trailing;
                textNodeUpdated = true;
                break;
            }
        }
        if (!textNodeUpdated) { /* только вложенные переводы */ }
        children.forEach(function(child) {
            applyTranslation(child, lang);
        });
    } else {
        el.textContent = text;
    }
}

function setLanguage(lang) {
    currentLang = lang;
    window.currentLang = lang;
    try {
        localStorage.setItem('language', lang);
    } catch (e) {}

    document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    document.querySelectorAll('[data-en][data-ru]').forEach(function(el) {
        applyTranslation(el, lang);
    });

    // Плейсхолдеры формы
    const nameInput = document.getElementById('guestName');
    const phoneInput = document.getElementById('guestPhone');
    if (nameInput) {
        nameInput.placeholder = lang === 'ru'
            ? 'Как вас зовут?'
            : 'What\'s your name?';
    }
    if (phoneInput) {
        phoneInput.placeholder = '+7 777 123 4567';
    }

    // Плейсхолдер поиска отелей
    const searchInput = document.getElementById('hotelSearch');
    if (searchInput) {
        const ruPh = searchInput.dataset.ruPlaceholder;
        const enPh = searchInput.dataset.enPlaceholder;
        if (ruPh || enPh) {
            searchInput.placeholder = lang === 'ru'
                ? (ruPh || 'Поиск отелей...')
                : (enPh || 'Search hotels...');
        }
    }

    // Событие для перерисовки динамических сеток
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
}

(function initLanguage() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setLanguage(currentLang);
        });
    } else {
        setLanguage(currentLang);
    }
})();

/* ============================================================
   VIDEO — остановка + visibility
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('heroVideo');
    if (!video) return;

    // Остановка в конце видео
    video.addEventListener('ended', function() { video.pause(); });

    // Для страницы routes.html — остановка за 2 сек до конца
    const isRoutesPage = document.body.contains(document.getElementById('expressTour'));
    if (isRoutesPage) {
        video.addEventListener('timeupdate', function() {
            if (video.duration && video.duration - video.currentTime <= 2) {
                video.pause();
            }
        });
    }

    // Пауза при уходе со вкладки
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            video.pause();
        } else if (video.paused && video.currentTime > 0 && !video.ended) {
            video.play().catch(function() {});
        }
    });
});

/* ============================================================
   3D TILT — универсальный для всех страниц
   ============================================================ */
(function initTilt() {
    const isTouchOnly = ('ontouchstart' in window) &&
                        !window.matchMedia('(any-pointer: fine)').matches;
    if (isTouchOnly) return;

    let activeCard = null;
    let rafId = null;
    let lastEvent = null;

    function resetCard(card) {
        if (!card) return;
        card.classList.remove('tilt-active');
        card.style.setProperty('--tilt-rotate-x', '0deg');
        card.style.setProperty('--tilt-rotate-y', '0deg');
        card.style.setProperty('--tilt-glow-x', '50%');
        card.style.setProperty('--tilt-glow-y', '50%');
    }

    document.addEventListener('mousemove', function(e) {
        if (window.innerWidth <= 768) {
            if (activeCard) { resetCard(activeCard); activeCard = null; }
            return;
        }
        const card = e.target.closest && e.target.closest('.tilt-card');
        if (!card) {
            if (activeCard) { resetCard(activeCard); activeCard = null; }
            return;
        }
        if (activeCard && activeCard !== card) resetCard(activeCard);
        activeCard = card;
        lastEvent = e;
        if (rafId) return;
        rafId = requestAnimationFrame(function() {
            const rect = card.getBoundingClientRect();
            const x = lastEvent.clientX - rect.left;
            const y = lastEvent.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 18;
            const rotateY = (centerX - x) / 18;
            card.style.setProperty('--tilt-rotate-x', rotateX.toFixed(2) + 'deg');
            card.style.setProperty('--tilt-rotate-y', rotateY.toFixed(2) + 'deg');
            card.style.setProperty('--tilt-glow-x', (x / rect.width * 100).toFixed(2) + '%');
            card.style.setProperty('--tilt-glow-y', (y / rect.height * 100).toFixed(2) + '%');
            card.classList.add('tilt-active');
            rafId = null;
        });
    }, { passive: true });

    document.addEventListener('mouseleave', function() {
        if (activeCard) { resetCard(activeCard); activeCard = null; }
    });
    window.addEventListener('scroll', function() {
        if (activeCard) { resetCard(activeCard); activeCard = null; }
    }, { passive: true });
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768 && activeCard) {
            resetCard(activeCard);
            activeCard = null;
        }
    }, { passive: true });
})();

/* ============================================================
   ACCORDION ДЛЯ <details>
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
    const allDetails = document.querySelectorAll('.tour-program-details');
    if (!allDetails.length) return;
    allDetails.forEach(function(details) {
        details.addEventListener('toggle', function() {
            if (details.open) {
                allDetails.forEach(function(other) {
                    if (other !== details) other.open = false;
                });
            }
        });
    });
});

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            const offset = 100;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
        }
    });
});

/* ============================================================
   FAQ TOGGLE
   ============================================================ */
function toggleFaq(button) {
    const item = button.closest('.faq-item');
    if (!item) return;
    const isOpen = item.classList.contains('open');
    const parent = item.parentElement;
    if (parent) {
        parent.querySelectorAll('.faq-item').forEach(function(el) {
            el.classList.remove('open');
        });
    }
    if (!isOpen) {
        item.classList.add('open');
    }
}

/* ============================================================
   GSAP — общие анимации
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Карточки в общих сетках
    const cards = document.querySelectorAll(
        '.attraction-card, .hotel-card, .tour-card, .tier-card, ' +
        '.team-member, .partner-card, .stat-card, .recommendation-card, ' +
        '.photo-service-card, .inc-card'
    );

    if (cards.length) {
        const container = cards[0].closest(
            '.attractions-grid, .hotels-grid, .tour-cards-grid, .tier-cards-grid, ' +
            '.team-grid, .partners-grid, .stats-grid, .recommendations-grid, ' +
            '.photo-services-grid, .inc-grid'
        );

        if (container) {
            gsap.from(cards, {
                scrollTrigger: {
                    trigger: container,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                duration: 0.7,
                opacity: 0,
                y: 30,
                stagger: 0.04,
                ease: 'power3.out'
            });
        }
    }

    // CTA
    const ctaWrapper = document.querySelector('.cta-wrapper');
    if (ctaWrapper) {
        gsap.from(ctaWrapper, {
            scrollTrigger: {
                trigger: ctaWrapper,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            duration: 0.8,
            opacity: 0,
            y: 30,
            scale: 0.98,
            ease: 'power3.out'
        });
    }

    // Booking CTA
    const bookingCta = document.querySelector('.booking-cta');
    if (bookingCta) {
        gsap.from(bookingCta, {
            scrollTrigger: {
                trigger: bookingCta,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            duration: 1,
            opacity: 0,
            y: 40,
            scale: 0.98,
            ease: 'power4.out'
        });
    }

    // FAQ
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length) {
        const faqList = document.querySelector('.faq-list');
        if (faqList) {
            gsap.from(faqItems, {
                scrollTrigger: {
                    trigger: faqList,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                duration: 0.6,
                opacity: 0,
                y: 15,
                stagger: 0.06,
                ease: 'power3.out'
            });
        }
    }

    // Timeline
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length) {
        const timeline = document.querySelector('.timeline');
        if (timeline) {
            gsap.from(timelineItems, {
                scrollTrigger: {
                    trigger: timeline,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                },
                duration: 0.8,
                opacity: 0,
                x: -30,
                stagger: 0.15,
                ease: 'power4.out'
            });
        }
    }

    // Map
    const mapSection = document.querySelector('.map-section');
    if (mapSection) {
        gsap.from(mapSection, {
            scrollTrigger: {
                trigger: mapSection,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            duration: 1,
            opacity: 0,
            y: 40,
            ease: 'power4.out'
        });
    }

    // Mission (about.html)
    const missionContent = document.querySelector('.mission-content');
    const missionImage = document.querySelector('.mission-image');
    if (missionContent) {
        gsap.from(missionContent, {
            scrollTrigger: {
                trigger: missionContent,
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            duration: 1,
            opacity: 0,
            x: -40,
            ease: 'power4.out'
        });
    }
    if (missionImage) {
        gsap.from(missionImage, {
            scrollTrigger: {
                trigger: missionImage,
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            duration: 1,
            opacity: 0,
            x: 40,
            ease: 'power4.out'
        });
    }

    setTimeout(function() { ScrollTrigger.refresh(); }, 500);
});

/* ============================================================
   LAZY LOAD FALLBACK
   ============================================================ */
if (!('loading' in HTMLImageElement.prototype) && 'IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) img.src = img.dataset.src;
                imageObserver.unobserve(img);
            }
        });
    });
    lazyImages.forEach(function(img) { imageObserver.observe(img); });
}

/* ============================================================
   iOS/Android — оптимизации
   ============================================================ */

// Предотвращение двойного тапа (iOS zoom)
(function preventDoubleTapZoom() {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) e.preventDefault();
        lastTouchEnd = now;
    }, { passive: false });
})();

// Отключение bounce-scroll на iOS для body
if ('ontouchstart' in window) {
    document.body.style.overscrollBehaviorY = 'contain';
    document.documentElement.style.overscrollBehaviorY = 'contain';
}

// Обработка resize при смене ориентации
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }, 250);
}, { passive: true });

/* ============================================================
   GLOBAL EXPORTS
   ============================================================ */
window.toggleTheme = toggleTheme;
window.setLanguage = setLanguage;
window.openModal = openModal;
window.closeModal = closeModal;
window.handleSubmit = handleSubmit;
window.toggleFaq = toggleFaq;
window.toggleMenu = toggleMenu;
window.currentLang = currentLang;

console.log('ZagranEasy Travel — Global JS v25.0 loaded.');