/**
 * =============================================
 * Product Display Module
 * Handles product grid rendering and filtering
 * Now integrated with SharedDataManager
 * ============================================= 
 */

class ProductManager {
    constructor(products) {
        // Use SharedDataManager if available, otherwise fall back to passed products
        if (typeof SharedDataManager !== 'undefined') {
            this.products = SharedDataManager.getProducts();
        } else {
            this.products = products;
        }
        this.initialVisibleCount = this.getResponsiveCount();
        this.allProductsVisible = false;
        this.currentFilter = 'all';
    }

    // Refresh products from SharedDataManager
    refreshProducts() {
        if (typeof SharedDataManager !== 'undefined') {
            this.products = SharedDataManager.getProducts();
            this.renderProducts();
        }
    }

    getResponsiveCount() {
        return window.innerWidth <= 1024 ? 4 : 6;
    }

    updateResponsiveCount() {
        const newCount = this.getResponsiveCount();
        if (this.initialVisibleCount !== newCount) {
            this.initialVisibleCount = newCount;
            // Only re-apply if we haven't already shown all
            if (!this.allProductsVisible) {
                this.applyFilter(this.currentFilter);
            }
        }
    }

    init() {
        this.renderProducts();
        this.attachFilterListeners();
        this.initLoadMore();
        
        // Handle responsive count on resize
        window.addEventListener('resize', () => {
            this.updateResponsiveCount();
        });
    }

    renderProducts() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        // MOBILE FIX: Render cards with initial visibility calculated
        // This prevents layout shift from render-then-hide sequence
        const visibleCount = this.initialVisibleCount;
        let currentVisible = 0;
        
        grid.innerHTML = this.products.map(p => {
            const category = p.category.toLowerCase().replace(/\s+/g, '-');
            const matches = this.currentFilter === 'all' || category === this.currentFilter;
            const shouldShow = matches && currentVisible < visibleCount;
            
            if (matches && currentVisible < visibleCount) {
                currentVisible++;
            }
            
            // Set initial display state directly in the card element
            return this.createProductCard(p, shouldShow);
        }).join('');
        
        // MOBILE FIX: Mark grid as loaded to release reserved space
        grid.classList.add('loaded');
        this.updateLoadMoreButton(this.currentFilter);
    }

    createProductCard(product, shouldShow = true) {
        const { id, name, category, price, oldPrice, img, discount, tags, inStock, rating, reviewCount } = product;
        
        // MOBILE FIX: Set display state at render time to prevent reflow
        const displayStyle = shouldShow ? 'display: block;' : 'display: none;';
        const showClass = shouldShow ? ' show' : '';
        
        // Handle image URL - don't add query params to base64 data URLs
        const imageUrl = img ? (img.startsWith('data:') ? img : `${img}?q=80&w=400&auto=format&fit=crop`) : 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400&auto=format&fit=crop';
        
        // Ensure tags is an array
        const productTags = Array.isArray(tags) ? tags : ['New Arrival'];
        
        // Ensure rating and reviewCount have defaults
        const productRating = rating || 4.5;
        const productReviewCount = reviewCount || 0;
        
        // Determine if product is a bestseller (rating >= 4.5)
        const isBestseller = productRating >= 4.5;
        
        return `
            <div class="luxury-product-card${showClass}" data-category="${category.toLowerCase().replace(/\s+/g, '-')}" style="${displayStyle}">
                <div class="card-image-container">
                    <img src="${imageUrl}" 
                         alt="${name}" 
                         class="card-image" 
                         loading="lazy" 
                         decoding="async"
                         width="400"
                         height="275">
                    <button class="wishlist-btn" onclick="toggleWishlist(event, ${id})" title="Add to Wishlist" aria-label="Add to wishlist">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                    ${discount ? `<div class="discount-badge">${discount}% OFF</div>` : ''}
                    ${isBestseller ? `<div class="bestseller-badge"><i class="fa-solid fa-crown"></i> Bestseller</div>` : ''}
                    ${!inStock ? 
                        `<div class="stock-badge out-of-stock">Out of Stock</div>` : 
                        `<div class="stock-badge in-stock">In Stock</div>`
                    }
                </div>
                
                <div class="card-content">
                    <div class="card-category">${category}</div>
                    <h3 class="card-title">${name}</h3>
                    
                    <div class="card-rating">
                        <div class="stars">
                            ${this.generateStars(productRating)}
                        </div>
                        <span class="rating-count">(${productReviewCount})</span>
                    </div>
                    
                    <div class="card-tags">
                        ${productTags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    
                    <div class="card-pricing">
                        <div class="price-container">
                            <span class="current-price">₹${price.toLocaleString('en-IN')}</span>
                            ${oldPrice ? `<span class="old-price">₹${oldPrice.toLocaleString('en-IN')}</span>` : ''}
                        </div>
                    </div>
                    
                    <div class="card-badges">
                        <span class="free-shipping"><i class="fa-solid fa-truck"></i> Free Delivery</span>
                    </div>
                    
                    <button class="add-to-cart-btn ${!inStock ? 'disabled' : ''}" 
                            onclick="addToCart(${id})" 
                            ${!inStock ? 'disabled' : ''}
                            aria-label="Add ${name} to cart">
                        <i class="fa-solid fa-shopping-bag"></i>
                        ${!inStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        `;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const decimal = rating % 1;
        const hasHalfStar = decimal >= 0.25 && decimal < 0.75;
        const roundUp = decimal >= 0.75;
        let stars = '';
        
        const totalFull = roundUp ? fullStars + 1 : fullStars;
        for (let i = 0; i < Math.min(totalFull, 5); i++) {
            stars += '<i class="fa-solid fa-star"></i>';
        }
        
        if (hasHalfStar && totalFull < 5) {
            stars += '<i class="fa-solid fa-star-half-stroke"></i>';
        }
        
        const filledStars = totalFull + (hasHalfStar ? 1 : 0);
        const emptyStars = Math.max(0, 5 - filledStars);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="fa-regular fa-star"></i>';
        }
        
        return stars;
    }

    attachFilterListeners() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.getAttribute('data-filter');
                this.applyFilter(this.currentFilter);
            });
        });
    }

    applyFilter(filter) {
        const cards = document.querySelectorAll('.luxury-product-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const category = card.getAttribute('data-category');
            const matches = filter === 'all' || category === filter;

            if (matches) {
                if (this.allProductsVisible || visibleCount < this.initialVisibleCount) {
                    card.style.display = 'block';
                    card.classList.add('show');
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                    card.classList.remove('show');
                }
            } else {
                card.style.display = 'none';
                card.classList.remove('show');
            }
        });

        this.updateLoadMoreButton(filter);
    }

    initLoadMore() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;

        loadMoreBtn.addEventListener('click', () => {
            this.allProductsVisible = true;
            this.applyFilter(this.currentFilter);
            loadMoreBtn.style.display = 'none';
        });
    }

    updateLoadMoreButton(filter) {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;

        const cards = Array.from(document.querySelectorAll('.luxury-product-card'));
        const matchingCards = cards.filter(card => 
            filter === 'all' || card.getAttribute('data-category') === filter
        );

        if (this.allProductsVisible || matchingCards.length <= this.initialVisibleCount) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
        }
    }
}

// Wishlist functionality
window.toggleWishlist = function(event, productId) {
    event.preventDefault();
    event.stopPropagation();
    
    // Check if user is logged in
    const user = localStorage.getItem('noonOpticals_user');
    if (!user || user === 'null') {
        CustomAlert.alert('Please login to add items to wishlist', { title: 'Login Required', type: 'warning' }).then(() => {
            // Open login modal after alert closes
            if (typeof authManager !== 'undefined' && authManager.openModal) {
                authManager.openModal();
            } else {
                const modal = document.getElementById('authModal');
                if (modal) modal.classList.add('active');
            }
        });
        return;
    }
    
    const btn = event.currentTarget;
    
    // Use SharedDataManager for wishlist
    if (typeof SharedDataManager !== 'undefined') {
        SharedDataManager.toggleWishlist(productId);
        const isInWishlist = SharedDataManager.isInWishlist(productId);
        
        const icon = btn.querySelector('i');
        if (isInWishlist) {
            btn.classList.add('active');
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            showNotification('Added to wishlist!', 'success');
        } else {
            btn.classList.remove('active');
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
            showNotification('Removed from wishlist', 'info');
        }
    } else {
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
};

// Helper notification function
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('sharedNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'sharedNotification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(notification);
    }
    
    // Set color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
    }, 3000);
}
