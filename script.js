// --- Scroll Lock Helper (must be at top) ---
let scrollLockPosition = 0;
let isBodyLocked = false;

// Store initial touch position for scroll direction detection
let touchStartY = 0;

// Touch start handler to capture initial position
function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
}

// Touch event handler that allows scrolling inside modal but blocks outside
function handleTouchMove(e) {
    const cartItems = document.querySelector('.cart-items');
    const authModalInner = document.querySelector('.auth-modal-inner');
    const cartSidebar = document.querySelector('.cart-sidebar.open');
    const authModal = document.querySelector('.auth-modal.active');

    // If no modal is open, allow normal scrolling
    if (!cartSidebar && !authModal) {
        return;
    }

    let target = e.target;
    let scrollableElement = null;

    // Find if we're inside a scrollable element
    while (target && target !== document.body) {
        if (target === cartItems || target === authModalInner ||
            target.classList.contains('cart-items') ||
            target.classList.contains('auth-modal-inner')) {
            scrollableElement = target;
            break;
        }
        // Also check for cart-sidebar or auth-modal-content as containers
        if (target.classList.contains('cart-sidebar') ||
            target.classList.contains('auth-modal-content')) {
            scrollableElement = target.querySelector('.cart-items, .auth-modal-inner');
            break;
        }
        target = target.parentElement;
    }

    if (scrollableElement) {
        const touchY = e.touches[0].clientY;
        const touchDelta = touchStartY - touchY;
        const scrollTop = scrollableElement.scrollTop;
        const scrollHeight = scrollableElement.scrollHeight;
        const clientHeight = scrollableElement.clientHeight;

        // Check if at top and trying to scroll up, or at bottom and trying to scroll down
        const isAtTop = scrollTop <= 0 && touchDelta < 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 && touchDelta > 0;

        // Prevent overscroll at boundaries
        if (isAtTop || isAtBottom) {
            e.preventDefault();
        }
        // Allow normal scrolling within the element
    } else {
        // Not inside scrollable content, block all scrolling
        e.preventDefault();
    }
}

// Fallback touch event blocker for document-level scroll prevention
function preventDefaultTouch(e) {
    const cartSidebar = document.querySelector('.cart-sidebar.open');
    const authModal = document.querySelector('.auth-modal.active');

    // Only block if a modal is open
    if (!cartSidebar && !authModal) {
        return;
    }

    // Check if the touch is inside a scrollable element
    let target = e.target;
    while (target && target !== document.documentElement) {
        if (target.classList.contains('cart-items') ||
            target.classList.contains('auth-modal-inner')) {
            return; // Allow scrolling inside modal content
        }
        target = target.parentElement;
    }

    // Block scrolling outside modal content
    e.preventDefault();
}

// Wheel event handler for desktop
function handleWheel(e) {
    const cartSidebar = document.querySelector('.cart-sidebar.open');
    const authModal = document.querySelector('.auth-modal.active');

    if (!cartSidebar && !authModal) {
        return;
    }

    let target = e.target;
    let scrollableElement = null;

    while (target && target !== document.body) {
        if (target.classList.contains('cart-items') ||
            target.classList.contains('auth-modal-inner')) {
            scrollableElement = target;
            break;
        }
        target = target.parentElement;
    }

    if (!scrollableElement) {
        e.preventDefault();
    }
}

function lockBodyScroll() {
    if (isBodyLocked) return;
    isBodyLocked = true;

    scrollLockPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Add CSS classes
    document.documentElement.classList.add('scroll-locked');
    document.body.classList.add('scroll-locked');

    // iOS-specific scroll lock with inline styles
    document.body.style.top = `-${scrollLockPosition}px`;
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // Add touch handlers for mobile
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Add wheel handler for desktop
    document.addEventListener('wheel', handleWheel, { passive: false });

    // Additional mobile safeguard - prevent all scrolling on html element
    document.documentElement.addEventListener('touchmove', preventDefaultTouch, { passive: false });
}

function unlockBodyScroll() {
    if (!isBodyLocked) return;
    isBodyLocked = false;

    // Remove touch handlers - must match capture option used in addEventListener
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.documentElement.removeEventListener('touchmove', preventDefaultTouch);

    // Remove wheel handler
    document.removeEventListener('wheel', handleWheel, { passive: false });

    // Remove CSS classes
    document.documentElement.classList.remove('scroll-locked');
    document.body.classList.remove('scroll-locked');

    // Reset inline styles
    document.body.style.top = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.overflow = '';

    // Restore scroll position
    window.scrollTo(0, scrollLockPosition);
}

// --- Data ---
const products = [
    { id: 1, name: "Neon Vision", category: "Sport", price: 3499, oldPrice: 4299, img: "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=2070&auto=format&fit=crop", discount: 18, tags: ["UV400", "Polarized"], inStock: true },
    { id: 2, name: "Crystal Clear", category: "Reading", price: 2299, oldPrice: 2899, img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=2080&auto=format&fit=crop", discount: 20, tags: ["Blue-Light", "Anti-Glare"], inStock: true },
    { id: 3, name: "Golden Hour", category: "Sun", price: 4199, oldPrice: 5299, img: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=2070&auto=format&fit=crop", discount: 20, tags: ["UV400", "Polarized"], inStock: false },
    { id: 4, name: "Urban Tech", category: "Blue Light", price: 2699, oldPrice: 3499, img: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=2070&auto=format&fit=crop", discount: 22, tags: ["Blue-Light", "Anti-Glare"], inStock: true },
    { id: 5, name: "Classic Aviator", category: "Sun", price: 3899, oldPrice: 4899, img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop", discount: 20, tags: ["UV400", "Polarized"], inStock: true },
    { id: 6, name: "Retro Round", category: "Fashion", price: 2999, oldPrice: 3899, img: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=2070&auto=format&fit=crop", discount: 23, tags: ["Vintage", "Anti-Glare"], inStock: true },
    { id: 7, name: "Smart Vision", category: "Blue Light", price: 2899, oldPrice: 3599, img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=2084&auto=format&fit=crop", discount: 19, tags: ["Blue-Light", "Anti-Glare"], inStock: true },
    { id: 8, name: "Elite Pro", category: "Sport", price: 4899, oldPrice: 5999, img: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=2073&auto=format&fit=crop", discount: 18, tags: ["UV400", "Polarized"], inStock: true },
    { id: 9, name: "Midnight Matte", category: "Fashion", price: 3199, oldPrice: 3799, img: "https://images.unsplash.com/photo-1542293787938-4d36399c31d7?q=80&w=2070&auto=format&fit=crop", discount: 16, tags: ["Matte", "Featherlight"], inStock: true },
    { id: 10, name: "Aurora Blue", category: "Blue Light", price: 2799, oldPrice: 3399, img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop", discount: 18, tags: ["Blue-Light", "Anti-Glare"], inStock: true },
    { id: 11, name: "Desert Trail", category: "Sport", price: 4599, oldPrice: 5499, img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2070&auto=format&fit=crop", discount: 16, tags: ["UV400", "Impact-Resist"], inStock: true },
    { id: 12, name: "Library Luxe", category: "Reading", price: 2499, oldPrice: 3099, img: "https://images.unsplash.com/photo-1522938974444-f12497b69347?q=80&w=2070&auto=format&fit=crop", discount: 19, tags: ["Blue-Light", "Comfort Fit"], inStock: true },
];

let cart = JSON.parse(localStorage.getItem('prismCart')) || [];
const INITIAL_VISIBLE_PRODUCTS = 6;
let productsUnlocked = false;

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartDisplay();
    initNavScroll();
    initSmoothScroll();
    initCallCards();
    initLegalModal();
});

// --- Navbar Scroll Effect (Throttled) ---
function initNavScroll() {
    const nav = document.querySelector('.glass-nav');
    let scrollTimeout;

    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }, 100);
    }, { passive: true });
}

// --- Smooth Scroll & Active Link (Optimized) ---
let isScrolling = false;

function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('section[id]');
    let scrollTimeout;
    let lastScrollUpdate = 0;
    const scrollThrottle = 150; // milliseconds

    // Smooth scroll on click
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            isScrolling = true;

            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            // Update active state immediately
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Re-enable scroll detection after animation completes
                setTimeout(() => {
                    isScrolling = false;
                }, 1000);
            }
        });
    });

    // Update active link on scroll (throttled to prevent excessive updates)
    window.addEventListener('scroll', () => {
        if (isScrolling) return;

        const now = Date.now();
        if (now - lastScrollUpdate < scrollThrottle) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                updateActiveLink(sections, navLinks);
                lastScrollUpdate = Date.now();
            }, scrollThrottle);
        } else {
            updateActiveLink(sections, navLinks);
            lastScrollUpdate = now;
        }
    }, { passive: true });

    function updateActiveLink(sections, navLinks) {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }
}

// --- Helper Functions ---
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
    const hasFullInsteadOfHalf = rating % 1 >= 0.75;
    let stars = '';
    
    const totalFull = hasFullInsteadOfHalf ? fullStars + 1 : fullStars;
    for (let i = 0; i < totalFull; i++) {
        stars += '<i class="fa-solid fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fa-solid fa-star-half-stroke"></i>';
    }
    
    const emptyStars = 5 - totalFull - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="fa-regular fa-star"></i>';
    }
    
    return stars;
}

// --- Functions ---
function loadProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = products.map(p => {
        const productRating = p.rating || 4.5;
        const productReviewCount = p.reviewCount || 0;
        const isBestseller = productRating >= 4.5;
        return `
        <div class="luxury-product-card" data-category="${p.category.toLowerCase().replace(/\s+/g, '-')}">
            <div class="card-image-container">
                <img src="${p.img}" alt="${p.name}" class="card-image" loading="lazy" decoding="async">
                <button class="wishlist-btn" onclick="toggleWishlist(event, ${p.id})" title="Add to Wishlist">
                    <i class="fa-regular fa-heart"></i>
                </button>
                ${p.discount ? `<div class="discount-badge">${p.discount}% OFF</div>` : ''}
                ${isBestseller ? `<div class="bestseller-badge"><i class="fa-solid fa-crown"></i> Bestseller</div>` : ''}
                ${!p.inStock ? `<div class="stock-badge out-of-stock">Out of Stock</div>` : `<div class="stock-badge in-stock">In Stock</div>`}
            </div>
            
            <div class="card-content">
                <div class="card-category">${p.category}</div>
                <h3 class="card-title">${p.name}</h3>
                
                <div class="card-rating">
                    <div class="stars">
                        ${generateStars(productRating)}
                    </div>
                    <span class="rating-count">(${productReviewCount})</span>
                </div>
                
                <div class="card-tags">
                    ${p.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                
                <div class="card-pricing">
                    <div class="price-container">
                        <span class="current-price">₹${p.price.toLocaleString('en-IN')}</span>
                        ${p.oldPrice ? `<span class="old-price">₹${p.oldPrice.toLocaleString('en-IN')}</span>` : ''}
                    </div>
                </div>
                
                <div class="card-badges">
                    <span class="free-shipping"><i class="fa-solid fa-truck"></i> Free Delivery</span>
                </div>
                
                <button class="add-to-cart-btn ${!p.inStock ? 'disabled' : ''}" 
                        onclick="addToCart(${p.id})" 
                        ${!p.inStock ? 'disabled' : ''}>
                    <i class="fa-solid fa-shopping-bag"></i>
                    ${!p.inStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    `;
    }).join('');

    // MOBILE FIX: Mark grid as loaded to release reserved space
    grid.classList.add('loaded');

    applyFilterWithLimit('all');
    attachFilterListeners();
    initLoadMore();
}

function attachFilterListeners() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const filter = e.target.getAttribute('data-filter');
            applyFilterWithLimit(filter);
        });
    });
}

function applyFilterWithLimit(filter) {
    const cards = document.querySelectorAll('.luxury-product-card');
    let shown = 0;
    cards.forEach(card => {
        const category = card.getAttribute('data-category');
        const matches = filter === 'all' || category === filter;
        if (matches) {
            if (productsUnlocked || shown < INITIAL_VISIBLE_PRODUCTS) {
                card.style.display = 'block';
                card.classList.add('show');
                card.classList.remove('locked-card');
                shown++;
            } else {
                card.style.display = 'none';
                card.classList.add('locked-card');
            }
        } else {
            card.style.display = 'none';
            card.classList.remove('show');
        }
    });
    toggleLoadMoreVisibility(filter);
}

function initLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener('click', () => {
        productsUnlocked = true;
        const currentFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
        applyFilterWithLimit(currentFilter);
        loadMoreBtn.style.display = 'none';
    });
    toggleLoadMoreVisibility('all');
}

function toggleLoadMoreVisibility(filter) {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;
    if (productsUnlocked) {
        loadMoreBtn.style.display = 'none';
        return;
    }

    const cards = Array.from(document.querySelectorAll('.luxury-product-card'));
    const matches = cards.filter(card => filter === 'all' || card.getAttribute('data-category') === filter);
    loadMoreBtn.style.display = matches.length > INITIAL_VISIBLE_PRODUCTS ? 'inline-flex' : 'none';
}

function toggleWishlist(event, id) {
    event.preventDefault();
    const btn = event.target.closest('.wishlist-btn');
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (btn.classList.contains('active')) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
    } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
    }
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    saveCart();
    toggleCart(true);
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
}

function saveCart() {
    localStorage.setItem('prismCart', JSON.stringify(cart));
    updateCartDisplay();
}

function updateCartDisplay() {
    const totalItems = cart.reduce((a, b) => a + b.qty, 0);
    document.getElementById('floatingCartCount').innerText = totalItems;
    const cartItems = document.getElementById('cartItems');

    if (cart.length === 0) {
        cartItems.innerHTML = "<p style='text-align:center; padding:20px; color:#666;'>Your cart is empty.</p>";
        document.getElementById('cartTotal').innerText = "₹0";
    } else {
        let total = 0;
        cartItems.innerHTML = cart.map(item => {
            total += item.price * item.qty;
            return `
                <div class="c-item">
                    <img src="${item.img}" alt="" loading="lazy" decoding="async">
                    <div class="c-info">
                        <h4>${item.name}</h4>
                        <p>₹${item.price.toLocaleString('en-IN')} x ${item.qty}</p>
                        <span class="remove-item" onclick="removeFromCart(${item.id})">Remove</span>
                    </div>
                </div>
            `;
        }).join('');
        document.getElementById('cartTotal').innerText = "₹" + total.toLocaleString('en-IN');
    }
}

// --- UI Toggles ---
function toggleCart(forceOpen = false) {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');

    if (forceOpen) {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        lockBodyScroll();
    } else {
        const isOpen = sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        if (isOpen) {
            lockBodyScroll();
        } else {
            unlockBodyScroll();
        }
    }
}

// --- Legal Modal ---
function initLegalModal() {
    const modal = document.getElementById('legalModal');
    const links = document.querySelectorAll('.legal-link');
    const tabs = modal?.querySelectorAll('.legal-tab');
    const panes = modal?.querySelectorAll('.legal-pane');
    const closeEls = modal?.querySelectorAll('[data-close-legal]');

    if (!modal || !links.length) return;

    const openModal = (target) => {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setActivePane(target);
    };

    const closeModal = () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    const setActivePane = (key) => {
        tabs?.forEach(tab => {
            const isActive = tab.getAttribute('data-legal-tab') === key;
            tab.classList.toggle('active', isActive);
        });
        panes?.forEach(pane => {
            const isActive = pane.getAttribute('data-legal-pane') === key;
            pane.classList.toggle('active', isActive);
        });
    };

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const key = link.getAttribute('data-legal') || 'privacy';
            openModal(key);
        });
    });

    tabs?.forEach(tab => {
        tab.addEventListener('click', () => {
            const key = tab.getAttribute('data-legal-tab');
            setActivePane(key);
        });
    });

    closeEls?.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });
}

// --- Phone Call Cards ---
function initCallCards() {
    const callCards = document.querySelectorAll('.call-card[data-phone]');
    callCards.forEach(card => {
        const phone = card.getAttribute('data-phone');
        if (!phone) return;

        card.addEventListener('click', (event) => {
            // Let actual links handle their own default navigation
            if (event.target.closest('a')) return;
            window.location.href = `tel:${phone}`;
        });
    });
}

// --- Contact Form ---
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                message: document.getElementById('message').value
            };

            // Simulate form submission
            const submitBtn = this.querySelector('.premium-submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            setTimeout(() => {
                // Show success message
                submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
                submitBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';

                // Log form data (in production, send to server)
                console.log('Form submitted:', formData);

                // Reset form after 2 seconds
                setTimeout(() => {
                    contactForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;

                    // Optional: Show a notification
                    if (typeof CustomAlert !== 'undefined') {
                        CustomAlert.alert('Thank you for reaching out! We\'ll get back to you soon.', { title: 'Message Sent', type: 'success' });
                    }
                }, 2000);
            }, 1500);
        });
    }
});

// --- Auth Modal Functions ---
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const authClose = document.getElementById('authClose');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form-container');

// Open modal
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        authModal.classList.add('active');
        lockBodyScroll();
    });
}

// Close modal
if (authClose) {
    authClose.addEventListener('click', () => {
        authModal.classList.remove('active');
        unlockBodyScroll();
    });
}

// Close on outside click
authModal?.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.classList.remove('active');
        unlockBodyScroll();
    }
});

// Tab switching
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');

        // Update active tab
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show corresponding form
        authForms.forEach(form => {
            form.classList.remove('active');
            if (form.id === targetTab + 'Form') {
                form.classList.add('active');
            }
        });
    });
});

// Handle form submissions
document.querySelectorAll('.auth-form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const isLogin = form.closest('#loginForm');

        if (isLogin) {
            console.log('Login submitted');
            // Handled by auth module
        } else {
            console.log('Signup submitted');
            // Handled by auth module
        }
    });
});

// --- Back to Top Button ---
const backToTopBtn = document.getElementById('backToTopBtn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopBtn?.classList.add('show');
    } else {
        backToTopBtn?.classList.remove('show');
    }
});

backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});