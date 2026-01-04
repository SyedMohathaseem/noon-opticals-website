/**
 * =============================================
 * Navigation Module
 * Handles navigation scroll effects and smooth scrolling
 * ============================================= 
 */

class NavigationManager {
    constructor() {
        this.nav = document.querySelector('.glass-nav');
        this.navLinks = document.querySelectorAll('.nav-menu a');
        this.sections = document.querySelectorAll('section[id]');
        this.isScrolling = false;
        this.menuToggle = document.querySelector('.menu-toggle');
        this.navMenu = document.querySelector('.nav-menu');
    }

    init() {
        this.initScrollEffect();
        this.initSmoothScroll();
        this.initActiveLinks();
        this.initMobileMenu();
    }

    initScrollEffect() {
        if (!this.nav) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.nav.classList.add('scrolled');
            } else {
                this.nav.classList.remove('scrolled');
            }
        });
    }

    initSmoothScroll() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.isScrolling = true;

                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                // Update active state immediately
                this.navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Re-enable scroll detection after animation
                    setTimeout(() => {
                        this.isScrolling = false;
                    }, 1000);
                }
            });
        });
    }

    initActiveLinks() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            if (this.isScrolling) return;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                let current = '';
                
                this.sections.forEach(section => {
                    const sectionTop = section.offsetTop - 150;
                    if (window.scrollY >= sectionTop) {
                        current = section.getAttribute('id');
                    }
                });

                // Map branches section to contact in navbar
                if (current === 'branches') {
                    current = 'contact';
                }

                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + current) {
                        link.classList.add('active');
                    }
                });
            }, 100);
        });
    }

    initMobileMenu() {
        if (!this.menuToggle || !this.navMenu) return;

        const closeMenu = () => {
            this.navMenu.classList.remove('open');
            this.menuToggle.classList.remove('is-open');
            document.body.classList.remove('nav-open');
        };

        this.menuToggle.addEventListener('click', () => {
            const isOpen = this.navMenu.classList.toggle('open');
            this.menuToggle.classList.toggle('is-open', isOpen);
            document.body.classList.toggle('nav-open', isOpen);
        });

        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });
    }
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
    const navManager = new NavigationManager();
    navManager.init();
});
