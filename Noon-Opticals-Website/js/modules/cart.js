/**
 * =============================================
 * Cart Management Module
 * Handles shopping cart functionality
 * Now integrated with SharedDataManager
 * ============================================= 
 */

class CartManager {
    constructor() {
        this.cartKey = 'noonOpticals_cart';
        this.scrollPosition = 0;
        this.cart = this.loadCart();
    }

    loadCart() {
        try {
            // Use SharedDataManager if available
            if (typeof SharedDataManager !== 'undefined') {
                return SharedDataManager.getCart();
            }
            const saved = localStorage.getItem(this.cartKey);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }

    saveCart() {
        try {
            // Use SharedDataManager if available
            if (typeof SharedDataManager !== 'undefined') {
                SharedDataManager.saveCart(this.cart);
            } else {
                localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
            }
            this.updateDisplay();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    addItem(product) {
        // Refresh cart from storage first
        this.cart = this.loadCart();
        
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.qty++;
        } else {
            this.cart.push({ 
                id: product.id,
                productId: product.id,
                name: product.name, 
                price: product.price,
                img: product.img,
                qty: 1 
            });
        }

        this.saveCart();
        this.openCart();
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.qty = Math.max(1, quantity);
            this.saveCart();
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.qty), 0);
    }

    getItemCount() {
        return this.cart.reduce((count, item) => count + item.qty, 0);
    }

    updateDisplay() {
        const totalItems = this.getItemCount();
        const floatingBadge = document.getElementById('floatingCartCount');
        if (floatingBadge) {
            floatingBadge.textContent = totalItems;
        }

        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        if (!cartItems || !cartTotal) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div style="text-align:center; padding:40px 20px; color:rgba(255,255,255,0.6);">
                    <i class="fa-solid fa-shopping-bag" style="font-size:3rem; margin-bottom:15px; opacity:0.3;"></i>
                    <p>Your cart is empty.</p>
                </div>
            `;
            cartTotal.textContent = '₹0';
        } else {
            const total = this.getTotal();
            cartItems.innerHTML = this.cart.map(item => `
                <div class="c-item">
                    <img src="${item.img}" alt="${item.name}" loading="lazy" decoding="async">
                    <div class="c-info">
                        <h4>${item.name}</h4>
                        <p>₹${item.price.toLocaleString('en-IN')} x ${item.qty}</p>
                        <span class="remove-item" onclick="window.cartManager.removeItem(${item.id})">Remove</span>
                    </div>
                </div>
            `).join('');
            cartTotal.textContent = '₹' + total.toLocaleString('en-IN');
        }
    }

    openCart() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('overlay');
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');

        // Use global lock function if available
        if (typeof lockBodyScroll === 'function') {
            lockBodyScroll();
        } else {
            // Fallback: robust mobile scroll lock using scroll-locked class
            this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            document.documentElement.classList.add('scroll-locked');
            document.body.classList.add('scroll-locked');
            document.body.style.top = `-${this.scrollPosition}px`;
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');

        // Use global unlock function if available
        if (typeof unlockBodyScroll === 'function') {
            unlockBodyScroll();
        } else {
            // Fallback: restore scroll
            document.documentElement.classList.remove('scroll-locked');
            document.body.classList.remove('scroll-locked');
            document.body.style.top = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            window.scrollTo(0, this.scrollPosition);
        }
    }

    toggleCart() {
        const sidebar = document.getElementById('cartSidebar');
        if (sidebar && sidebar.classList.contains('open')) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }
}

// Create global instance
window.cartManager = new CartManager();

// Check if user is logged in
function isUserLoggedIn() {
    const user = localStorage.getItem('noonOpticals_user');
    return user !== null && user !== 'null';
}

// Show login popup if not logged in
function requireLogin(action) {
    if (!isUserLoggedIn()) {
        CustomAlert.alert('Please login to ' + action, { title: 'Login Required', type: 'warning' }).then(() => {
            // Open login modal after alert closes
            if (typeof authManager !== 'undefined' && authManager.openModal) {
                authManager.openModal();
            } else {
                const modal = document.getElementById('authModal');
                if (modal) modal.classList.add('active');
            }
        });
        return false;
    }
    return true;
}

// Expose functions globally for inline onclick handlers
window.toggleCart = () => window.cartManager.toggleCart();
window.addToCart = (productId) => {
    // Check if user is logged in
    if (!requireLogin('add items to cart')) {
        return;
    }
    
    // Try SharedDataManager first, then fall back to productsData
    let product = null;
    if (typeof SharedDataManager !== 'undefined') {
        product = SharedDataManager.getProductById(productId);
    } else if (window.productsData) {
        product = window.productsData.find(p => p.id === productId);
    }
    
    if (product && product.inStock) {
        window.cartManager.addItem(product);
    } else if (product && !product.inStock) {
        CustomAlert.alert('Sorry, this product is out of stock.', { title: 'Out of Stock', type: 'warning' });
    }
};

// Checkout via WhatsApp
window.checkoutViaWhatsApp = async () => {
    // Check if user is logged in
    if (!requireLogin('checkout')) {
        return;
    }
    
    const cart = window.cartManager.cart;
    if (cart.length === 0) {
        CustomAlert.alert('Your cart is empty!', { title: 'Empty Cart', type: 'info' });
        return;
    }
    
    // Get user info
    const user = JSON.parse(localStorage.getItem('noonOpticals_user') || '{}');
    const userName = user.displayName || user.email || 'Customer';
    const userEmail = user.email || '';
    const userPhone = user.phone || '';
    
    // Build order message
    const total = window.cartManager.getTotal();
    let orderMessage = `🛒 *New Order from Noon Opticals Website*\n\n`;
    orderMessage += `👤 *Customer:* ${userName}\n`;
    orderMessage += `📧 *Email:* ${userEmail}\n\n`;
    orderMessage += `📦 *Order Details:*\n`;
    orderMessage += `─────────────────\n`;
    
    cart.forEach((item, index) => {
        orderMessage += `${index + 1}. ${item.name}\n`;
        orderMessage += `   Qty: ${item.qty} × ₹${item.price.toLocaleString('en-IN')}\n`;
        orderMessage += `   Subtotal: ₹${(item.price * item.qty).toLocaleString('en-IN')}\n\n`;
    });
    
    orderMessage += `─────────────────\n`;
    orderMessage += `💰 *Total Amount:* ₹${total.toLocaleString('en-IN')}\n\n`;
    orderMessage += `📍 Please share your delivery address.`;
    
    // Format date for admin panel
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
    
    // Create order in admin panel format
    const orderId = 'ORD-' + Date.now();
    const order = {
        id: orderId,
        date: formattedDate,
        customer: {
            name: userName,
            email: userEmail,
            phone: userPhone,
            initials: userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            userId: user.uid || user.email,
            provider: user.provider || 'email',
            photoURL: user.photoURL || null
        },
        products: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.qty,
            image: item.img
        })),
        amount: total,
        payment: 'pending',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Save to localStorage (for SharedDataManager)
    const orders = JSON.parse(localStorage.getItem('noonOpticals_orders') || '[]');
    orders.push(order);
    localStorage.setItem('noonOpticals_orders', JSON.stringify(orders));
    
    // Save to Firebase
    if (typeof getFirebaseDB === 'function') {
        try {
            const db = getFirebaseDB();
            if (db) {
                await db.collection('orders').doc(orderId).set(order);
                console.log('✅ Order saved to Firebase:', orderId);
            }
        } catch (error) {
            console.error('❌ Error saving order to Firebase:', error);
        }
    }
    
    // Also update customer in Firebase with order info
    if (typeof getFirebaseDB === 'function' && userEmail) {
        try {
            const db = getFirebaseDB();
            if (db) {
                const customerDocId = userEmail.replace(/\./g, '_').replace(/@/g, '_at_');
                const customerRef = db.collection('users').doc(customerDocId);
                const customerDoc = await customerRef.get();
                
                if (customerDoc.exists) {
                    const customerData = customerDoc.data();
                    await customerRef.update({
                        orders: (customerData.orders || 0) + 1,
                        totalSpent: (customerData.totalSpent || 0) + total,
                        lastOrder: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                    console.log('✅ Customer order info updated in Firebase');
                }
            }
        } catch (error) {
            console.error('Error updating customer order info:', error);
        }
    }
    
    // Open WhatsApp with message
    const whatsappNumber = '917010531695'; // Noon Opticals WhatsApp
    const encodedMessage = encodeURIComponent(orderMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Send order confirmation email to customer
    if (typeof EmailService !== 'undefined' && EmailService.isConfigured() && userEmail) {
        try {
            const orderDetails = {
                orderId: orderId,
                items: window.cartManager.cart,
                total: `₹${total.toLocaleString('en-IN')}`,
                address: 'Will be confirmed via WhatsApp',
                paymentMethod: 'Cash on Delivery / WhatsApp'
            };
            await EmailService.sendOrderConfirmation(userEmail, userName, orderDetails);
            console.log('📧 Order confirmation email sent to:', userEmail);
        } catch (emailError) {
            console.warn('📧 Could not send order confirmation email:', emailError);
        }
    }
    
    // Clear cart after successful checkout
    window.cartManager.clearCart();
    window.cartManager.closeCart();
    
    CustomAlert.alert('Order sent! Please complete your order on WhatsApp. Confirmation email sent to your inbox.', { title: 'Order Placed', type: 'success' });
};
