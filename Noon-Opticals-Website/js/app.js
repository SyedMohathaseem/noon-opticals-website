/**
 * =============================================
 * NOON OPTICALS - Main Application
 * Professional Modular JavaScript Architecture
 * ============================================= 
 */

// Import product data
window.productsData = typeof productsData !== 'undefined' ? productsData : [];

// Global ProductManager instance for refresh capability
window.productManager = null;

/**
 * Application Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🌟 NOON OPTICALS', 'color: #94A3B8; font-size: 24px; font-weight: bold;');
    console.log('%cProfessional Eyewear Solution', 'color: #CBD5E1; font-size: 14px;');
    console.log('%c─────────────────────────────', 'color: #94A3B8;');
    
    initializeApp();
    
    // Listen for storage changes (when admin updates products)
    initStorageListener();
});

/**
 * Initialize Application
 */
function initializeApp() {
    // Initialize product display
    if (window.productsData && window.productsData.length > 0 || typeof SharedDataManager !== 'undefined') {
        window.productManager = new ProductManager(window.productsData);
        window.productManager.init();
    }

    // Initialize cart
    if (window.cartManager) {
        window.cartManager.updateDisplay();
    }

    // Add scroll animations
    initScrollAnimations();
    
    // Initialize lazy loading for images
    initLazyLoading();
    
    // Initialize back to top button if not already initialized
    initBackToTopButton();
    
    // Log initialization complete
    console.log('%c✓ Application Initialized Successfully', 'color: #4CAF50; font-weight: bold;');
}

/**
 * Storage Event Listener - Auto refresh when admin updates products
 */
function initStorageListener() {
    // Listen for storage changes from other tabs (when admin updates products)
    window.addEventListener('storage', (event) => {
        // Check if products were updated
        if (event.key === 'noonOpticals_products') {
            console.log('%c🔄 Products updated from admin panel, refreshing...', 'color: #FFA500;');
            refreshProductDisplay();
        }
    });
    
    // Listen for same-tab product updates (custom event from SharedDataManager)
    window.addEventListener('productsUpdated', () => {
        console.log('%c🔄 Products updated, refreshing display...', 'color: #FFA500;');
        refreshProductDisplay();
    });
    
    // Also check for product updates on focus (when switching back to this tab)
    let lastProductsHash = getProductsHash();
    
    window.addEventListener('focus', () => {
        const currentHash = getProductsHash();
        if (currentHash !== lastProductsHash) {
            console.log('%c🔄 Products changed, refreshing display...', 'color: #FFA500;');
            lastProductsHash = currentHash;
            refreshProductDisplay();
        }
    });
}

/**
 * Get a simple hash of products for change detection
 */
function getProductsHash() {
    try {
        const products = localStorage.getItem('noonOpticals_products') || '';
        return products.length + '_' + (products.slice(0, 100) + products.slice(-100));
    } catch (e) {
        return '';
    }
}

/**
 * Refresh Product Display
 */
function refreshProductDisplay() {
    if (window.productManager) {
        window.productManager.refreshProducts();
        console.log('%c✓ Product display refreshed', 'color: #4CAF50;');
    } else {
        // Re-initialize ProductManager if it doesn't exist
        window.productManager = new ProductManager(window.productsData);
        window.productManager.init();
    }
    
    // Also update productsData global variable
    if (typeof SharedDataManager !== 'undefined') {
        window.productsData = SharedDataManager.getProducts();
    }
}

/**
 * Scroll Animations
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    const animatedElements = document.querySelectorAll('.luxury-product-card, .feature-card-new, .branch-card, .contact-card');
    animatedElements.forEach(el => observer.observe(el));
}

/**
 * Lazy Loading Images
 */
function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports lazy loading
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    } else {
        // Fallback for older browsers
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }
}

/**
 * Back to Top Button
 */
function initBackToTopButton() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (!backToTopBtn) {
        // Create button if it doesn't exist
        const btn = document.createElement('button');
        btn.id = 'backToTopBtn';
        btn.className = 'back-to-top';
        btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
        btn.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(btn);
        
        btn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Error Handling
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // TODO: Send to error tracking service
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // TODO: Send to error tracking service
});

/**
 * Performance Monitoring
 */
window.addEventListener('load', () => {
    if (window.performance && window.performance.timing) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`%cPage Load Time: ${pageLoadTime}ms`, 'color: #94A3B8;');
    }
});

/**
 * Mobile Menu Toggle (if needed)
 */
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
}

/**
 * Utility Functions
 */
window.utils = {
    // Format currency
    formatCurrency: (amount) => {
        return '₹' + amount.toLocaleString('en-IN');
    },
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Validate email
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Validate phone (Indian format)
    validatePhone: (phone) => {
        const re = /^[6-9]\d{9}$/;
        return re.test(phone.replace(/\D/g, '').slice(-10));
    }
};

/**
 * =============================================
 * Contact Form Handler
 * Sends messages to hello@noonopticals.com
 * =============================================
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalBtnContent = submitBtn.innerHTML;
        
        // Get form data
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            message: document.getElementById('message').value.trim()
        };
        
        // Validate
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
            if (typeof CustomAlert !== 'undefined') {
                CustomAlert.alert('Please fill in all required fields.', { title: 'Missing Information', type: 'warning' });
            } else {
                alert('Please fill in all required fields.');
            }
            return;
        }
        
        if (!window.utils.validateEmail(formData.email)) {
            if (typeof CustomAlert !== 'undefined') {
                CustomAlert.alert('Please enter a valid email address.', { title: 'Invalid Email', type: 'warning' });
            } else {
                alert('Please enter a valid email address.');
            }
            return;
        }
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Check if EmailService is available
            if (typeof EmailService !== 'undefined' && EmailService.isConfigured()) {
                const result = await EmailService.sendContactForm(formData);
                
                if (result.success) {
                    // Success
                    if (typeof CustomAlert !== 'undefined') {
                        CustomAlert.alert('Thank you! Your message has been sent successfully. We will get back to you soon.', { 
                            title: 'Message Sent! ✓', 
                            type: 'success' 
                        });
                    } else {
                        alert('Thank you! Your message has been sent successfully.');
                    }
                    contactForm.reset();
                } else {
                    throw new Error(result.error || 'Failed to send message');
                }
            } else {
                // Fallback - open email client
                const subject = encodeURIComponent(`Contact Form: Message from ${formData.firstName} ${formData.lastName}`);
                const body = encodeURIComponent(`Name: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\nPhone: ${formData.phone || 'Not provided'}\n\nMessage:\n${formData.message}`);
                window.location.href = `mailto:hello@noonopticals.com?subject=${subject}&body=${body}`;
                
                if (typeof CustomAlert !== 'undefined') {
                    CustomAlert.alert('Opening your email client to send the message...', { title: 'Redirecting', type: 'info' });
                }
            }
        } catch (error) {
            console.error('Contact form error:', error);
            if (typeof CustomAlert !== 'undefined') {
                CustomAlert.alert('Sorry, there was an error sending your message. Please try again or email us directly at hello@noonopticals.com', { 
                    title: 'Error', 
                    type: 'error' 
                });
            } else {
                alert('Sorry, there was an error sending your message. Please try again.');
            }
        } finally {
            // Reset button
            submitBtn.innerHTML = originalBtnContent;
            submitBtn.disabled = false;
        }
    });
    
    console.log('📧 Contact form initialized');
}

// Initialize contact form on DOM ready
document.addEventListener('DOMContentLoaded', initContactForm);
