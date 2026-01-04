/**
 * =============================================
 * Shared Data Manager
 * Handles data synchronization between Website and Admin Panel
 * Uses localStorage to persist data across both applications
 * ============================================= 
 */

const SharedDataManager = {
    STORAGE_KEYS: {
        PRODUCTS: 'noonOpticals_products',
        ORDERS: 'noonOpticals_orders',
        CUSTOMERS: 'noonOpticals_customers',
        APPOINTMENTS: 'noonOpticals_appointments',
        ACTIVITY_LOG: 'noonOpticals_activityLog',
        CART: 'noonOpticals_cart',
        WISHLIST: 'noonOpticals_wishlist'
    },

    // Default Products Data (initial data)
    defaultProducts: [
        {
            id: 1,
            name: "Neon Vision",
            category: "Sport",
            brand: "noon",
            price: 3499,
            oldPrice: 4299,
            img: "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=2070&auto=format&fit=crop",
            discount: 18,
            tags: ["UV400", "Polarized"],
            inStock: true,
            stock: 45,
            rating: 4.5,
            reviewCount: 128,
            description: "High-performance sport eyewear with UV400 protection"
        },
        {
            id: 2,
            name: "Crystal Clear",
            category: "Reading",
            brand: "noon",
            price: 2299,
            oldPrice: 2899,
            img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=2080&auto=format&fit=crop",
            discount: 20,
            tags: ["Blue-Light", "Anti-Glare"],
            inStock: true,
            stock: 62,
            rating: 4.5,
            reviewCount: 128,
            description: "Perfect for reading with blue light protection"
        },
        {
            id: 3,
            name: "Golden Hour",
            category: "Sun",
            brand: "rayban",
            price: 4199,
            oldPrice: 5299,
            img: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=2070&auto=format&fit=crop",
            discount: 20,
            tags: ["UV400", "Polarized"],
            inStock: false,
            stock: 0,
            rating: 4.5,
            reviewCount: 128,
            description: "Stylish sunglasses for those golden hour moments"
        },
        {
            id: 4,
            name: "Urban Tech",
            category: "Blue Light",
            brand: "oakley",
            price: 2699,
            oldPrice: 3499,
            img: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=2070&auto=format&fit=crop",
            discount: 22,
            tags: ["Blue-Light", "Anti-Glare"],
            inStock: true,
            stock: 34,
            rating: 4.5,
            reviewCount: 128,
            description: "Modern eyewear for digital lifestyle"
        },
        {
            id: 5,
            name: "Classic Aviator",
            category: "Sun",
            brand: "rayban",
            price: 3899,
            oldPrice: 4899,
            img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop",
            discount: 20,
            tags: ["UV400", "Polarized"],
            inStock: true,
            stock: 52,
            rating: 4.5,
            reviewCount: 128,
            description: "Timeless aviator design with premium lenses"
        },
        {
            id: 6,
            name: "Retro Round",
            category: "Fashion",
            brand: "vogue",
            price: 2999,
            oldPrice: 3899,
            img: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=2070&auto=format&fit=crop",
            discount: 23,
            tags: ["Vintage", "Anti-Glare"],
            inStock: true,
            stock: 28,
            rating: 4.5,
            reviewCount: 128,
            description: "Vintage inspired round frames"
        },
        {
            id: 7,
            name: "Smart Vision",
            category: "Blue Light",
            brand: "titan",
            price: 2899,
            oldPrice: 3599,
            img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=2084&auto=format&fit=crop",
            discount: 19,
            tags: ["Blue-Light", "Anti-Glare"],
            inStock: true,
            stock: 75,
            rating: 4.5,
            reviewCount: 128,
            description: "Smart protection for your eyes"
        },
        {
            id: 8,
            name: "Elite Pro",
            category: "Sport",
            brand: "oakley",
            price: 4899,
            oldPrice: 5999,
            img: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=2073&auto=format&fit=crop",
            discount: 18,
            tags: ["UV400", "Polarized"],
            inStock: true,
            stock: 40,
            rating: 4.5,
            reviewCount: 128,
            description: "Professional grade sports eyewear"
        },
        {
            id: 9,
            name: "Midnight Matte",
            category: "Fashion",
            brand: "carrera",
            price: 3199,
            oldPrice: 3799,
            img: "https://images.unsplash.com/photo-1542293787938-4d36399c31d7?q=80&w=2070&auto=format&fit=crop",
            discount: 16,
            tags: ["Matte", "Featherlight"],
            inStock: true,
            stock: 55,
            rating: 4.5,
            reviewCount: 128,
            description: "Sleek matte finish for modern look"
        },
        {
            id: 10,
            name: "Aurora Blue",
            category: "Blue Light",
            brand: "noon",
            price: 2799,
            oldPrice: 3399,
            img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop",
            discount: 18,
            tags: ["Blue-Light", "Anti-Glare"],
            inStock: true,
            stock: 90,
            rating: 4.5,
            reviewCount: 128,
            description: "Premium blue light filtering glasses"
        },
        {
            id: 11,
            name: "Desert Trail",
            category: "Sport",
            brand: "oakley",
            price: 4599,
            oldPrice: 5499,
            img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2070&auto=format&fit=crop",
            discount: 16,
            tags: ["UV400", "Impact-Resist"],
            inStock: true,
            stock: 35,
            rating: 4.5,
            reviewCount: 128,
            description: "Adventure-ready sports eyewear"
        },
        {
            id: 12,
            name: "Scholar Pro",
            category: "Reading",
            brand: "titan",
            price: 2499,
            oldPrice: 3099,
            img: "https://images.unsplash.com/photo-1522938974444-f12497b69347?q=80&w=2070&auto=format&fit=crop",
            discount: 19,
            tags: ["Blue-Light", "Comfort Fit"],
            inStock: true,
            stock: 80,
            rating: 4.5,
            reviewCount: 128,
            description: "Comfortable reading glasses for long hours"
        }
    ],

    // Default Orders Data
    defaultOrders: [
        { id: 'ORD-2024-001', date: '2024-12-30', customer: { name: 'Rahul Kumar', email: 'rahul@email.com', phone: '+91 98765 43210', initials: 'RK' }, products: [{ productId: 1, name: 'Neon Vision', quantity: 1, price: 3499 }], amount: 3499, payment: 'paid', status: 'delivered', address: '123 Main St, Mumbai' },
        { id: 'ORD-2024-002', date: '2024-12-30', customer: { name: 'Priya Sharma', email: 'priya@email.com', phone: '+91 87654 32109', initials: 'PS' }, products: [{ productId: 5, name: 'Classic Aviator', quantity: 1, price: 3899 }], amount: 3899, payment: 'paid', status: 'processing', address: '456 Oak Ave, Delhi' },
        { id: 'ORD-2024-003', date: '2024-12-29', customer: { name: 'Amit Mehta', email: 'amit@email.com', phone: '+91 76543 21098', initials: 'AM' }, products: [{ productId: 2, name: 'Crystal Clear', quantity: 2, price: 2299 }], amount: 4598, payment: 'pending', status: 'pending', address: '789 Pine Rd, Bangalore' },
        { id: 'ORD-2024-004', date: '2024-12-29', customer: { name: 'Neha Singh', email: 'neha@email.com', phone: '+91 65432 10987', initials: 'NS' }, products: [{ productId: 7, name: 'Smart Vision', quantity: 1, price: 2899 }], amount: 2899, payment: 'paid', status: 'shipped', address: '321 Elm St, Chennai' },
        { id: 'ORD-2024-005', date: '2024-12-28', customer: { name: 'Vijay Gupta', email: 'vijay@email.com', phone: '+91 54321 09876', initials: 'VG' }, products: [{ productId: 9, name: 'Midnight Matte', quantity: 1, price: 3199 }], amount: 3199, payment: 'paid', status: 'delivered', address: '654 Maple Dr, Pune' },
        { id: 'ORD-2024-006', date: '2024-12-28', customer: { name: 'Sneha Patel', email: 'sneha@email.com', phone: '+91 43210 98765', initials: 'SP' }, products: [{ productId: 6, name: 'Retro Round', quantity: 1, price: 2999 }], amount: 2999, payment: 'paid', status: 'delivered', address: '987 Cedar Ln, Ahmedabad' }
    ],

    // Default Customers Data
    defaultCustomers: [
        { id: 1, name: 'Rahul Kumar', email: 'rahul@email.com', phone: '+91 98765 43210', orders: 5, spent: 42500, status: 'active', joinDate: '2024-01-15' },
        { id: 2, name: 'Priya Sharma', email: 'priya@email.com', phone: '+91 87654 32109', orders: 3, spent: 28000, status: 'active', joinDate: '2024-02-20' },
        { id: 3, name: 'Amit Mehta', email: 'amit@email.com', phone: '+91 76543 21098', orders: 8, spent: 65000, status: 'vip', joinDate: '2023-11-10' },
        { id: 4, name: 'Neha Singh', email: 'neha@email.com', phone: '+91 65432 10987', orders: 2, spent: 12500, status: 'active', joinDate: '2024-06-05' },
        { id: 5, name: 'Vijay Gupta', email: 'vijay@email.com', phone: '+91 54321 09876', orders: 12, spent: 125000, status: 'vip', joinDate: '2023-08-22' }
    ],

    // Default Appointments Data
    defaultAppointments: [
        { id: 1, date: '2026-01-04', time: '10:00 AM', duration: '30 min', type: 'Eye Examination', customer: 'Rahul Verma', phone: '+91 98765 43210', email: 'rahul.v@email.com', status: 'confirmed', notes: 'First time visitor' },
        { id: 2, date: '2026-01-04', time: '11:30 AM', duration: '45 min', type: 'Lens Fitting', customer: 'Sneha Patel', phone: '+91 87654 32109', email: 'sneha.p@email.com', status: 'pending', notes: 'Progressive lenses' },
        { id: 3, date: '2026-01-04', time: '02:00 PM', duration: '30 min', type: 'Contact Lens Trial', customer: 'Arjun Reddy', phone: '+91 76543 21098', email: 'arjun.r@email.com', status: 'confirmed', notes: '' },
        { id: 4, date: '2026-01-05', time: '03:30 PM', duration: '60 min', type: 'Full Checkup', customer: 'Meera Iyer', phone: '+91 65432 10987', email: 'meera.i@email.com', status: 'confirmed', notes: 'Annual checkup' },
        { id: 5, date: '2026-01-05', time: '05:00 PM', duration: '30 min', type: 'Eye Examination', customer: 'Kiran Kumar', phone: '+91 54321 09876', email: 'kiran.k@email.com', status: 'pending', notes: '' }
    ],

    // Initialize data from localStorage or use defaults
    init() {
        // Initialize products if not exists
        if (!localStorage.getItem(this.STORAGE_KEYS.PRODUCTS)) {
            this.saveProducts(this.defaultProducts);
        }
        // Initialize orders if not exists
        if (!localStorage.getItem(this.STORAGE_KEYS.ORDERS)) {
            this.saveOrders(this.defaultOrders);
        }
        // Initialize customers if not exists
        if (!localStorage.getItem(this.STORAGE_KEYS.CUSTOMERS)) {
            this.saveCustomers(this.defaultCustomers);
        }
        // Initialize appointments if not exists
        if (!localStorage.getItem(this.STORAGE_KEYS.APPOINTMENTS)) {
            this.saveAppointments(this.defaultAppointments);
        }
        // Initialize activity log if not exists
        if (!localStorage.getItem(this.STORAGE_KEYS.ACTIVITY_LOG)) {
            this.saveActivityLog([]);
        }
        // Initialize cart if not exists
        if (!localStorage.getItem(this.STORAGE_KEYS.CART)) {
            this.saveCart([]);
        }
        // Initialize wishlist if not exists
        if (!localStorage.getItem(this.STORAGE_KEYS.WISHLIST)) {
            this.saveWishlist([]);
        }
    },

    // ============== PRODUCTS ==============
    getProducts() {
        const data = localStorage.getItem(this.STORAGE_KEYS.PRODUCTS);
        return data ? JSON.parse(data) : this.defaultProducts;
    },

    saveProducts(products) {
        localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    },

    addProduct(product) {
        const products = this.getProducts();
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        product.id = newId;
        products.push(product);
        this.saveProducts(products);
        this.addActivityLogEntry(`Added new product: ${product.name}`);
        return product;
    },

    updateProduct(id, updatedProduct) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedProduct };
            this.saveProducts(products);
            this.addActivityLogEntry(`Updated product: ${products[index].name}`);
            return products[index];
        }
        return null;
    },

    deleteProduct(id) {
        const products = this.getProducts();
        const product = products.find(p => p.id === id);
        const filtered = products.filter(p => p.id !== id);
        this.saveProducts(filtered);
        if (product) {
            this.addActivityLogEntry(`Deleted product: ${product.name}`);
        }
        return product;
    },

    getProductById(id) {
        const products = this.getProducts();
        return products.find(p => p.id === id);
    },

    // ============== ORDERS ==============
    getOrders() {
        const data = localStorage.getItem(this.STORAGE_KEYS.ORDERS);
        return data ? JSON.parse(data) : this.defaultOrders;
    },

    saveOrders(orders) {
        localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    },

    addOrder(order) {
        const orders = this.getOrders();
        const orderCount = orders.length + 1;
        const year = new Date().getFullYear();
        order.id = `ORD-${year}-${String(orderCount).padStart(3, '0')}`;
        order.date = new Date().toISOString().split('T')[0];
        orders.unshift(order);
        this.saveOrders(orders);
        this.addActivityLogEntry(`New order placed: ${order.id}`);
        
        // Update customer stats
        this.updateCustomerStats(order.customer.email, order.amount);
        
        // Update product stock
        order.products.forEach(item => {
            this.updateProductStock(item.productId, -item.quantity);
        });
        
        return order;
    },

    updateOrder(id, updates) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...updates };
            this.saveOrders(orders);
            this.addActivityLogEntry(`Updated order ${id} status to ${updates.status || 'updated'}`);
            return orders[index];
        }
        return null;
    },

    deleteOrder(id) {
        const orders = this.getOrders();
        const filtered = orders.filter(o => o.id !== id);
        this.saveOrders(filtered);
        this.addActivityLogEntry(`Deleted order: ${id}`);
    },

    // ============== CUSTOMERS ==============
    getCustomers() {
        const data = localStorage.getItem(this.STORAGE_KEYS.CUSTOMERS);
        return data ? JSON.parse(data) : this.defaultCustomers;
    },

    saveCustomers(customers) {
        localStorage.setItem(this.STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    },

    addCustomer(customer) {
        const customers = this.getCustomers();
        const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
        customer.id = newId;
        customer.orders = 0;
        customer.spent = 0;
        customer.status = 'active';
        customer.joinDate = new Date().toISOString().split('T')[0];
        customers.push(customer);
        this.saveCustomers(customers);
        this.addActivityLogEntry(`New customer registered: ${customer.name}`);
        return customer;
    },

    updateCustomer(id, updates) {
        const customers = this.getCustomers();
        const index = customers.findIndex(c => c.id === id);
        if (index !== -1) {
            customers[index] = { ...customers[index], ...updates };
            this.saveCustomers(customers);
            return customers[index];
        }
        return null;
    },

    updateCustomerStats(email, orderAmount) {
        const customers = this.getCustomers();
        const customer = customers.find(c => c.email === email);
        if (customer) {
            customer.orders = (customer.orders || 0) + 1;
            customer.spent = (customer.spent || 0) + orderAmount;
            if (customer.spent >= 50000) {
                customer.status = 'vip';
            }
            this.saveCustomers(customers);
        }
    },

    deleteCustomer(id) {
        const customers = this.getCustomers();
        const customer = customers.find(c => c.id === id);
        const filtered = customers.filter(c => c.id !== id);
        this.saveCustomers(filtered);
        if (customer) {
            this.addActivityLogEntry(`Deleted customer: ${customer.name}`);
        }
    },

    // ============== APPOINTMENTS ==============
    getAppointments() {
        const data = localStorage.getItem(this.STORAGE_KEYS.APPOINTMENTS);
        return data ? JSON.parse(data) : this.defaultAppointments;
    },

    saveAppointments(appointments) {
        localStorage.setItem(this.STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    },

    addAppointment(appointment) {
        const appointments = this.getAppointments();
        const newId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
        appointment.id = newId;
        appointments.push(appointment);
        this.saveAppointments(appointments);
        this.addActivityLogEntry(`New appointment booked: ${appointment.type} with ${appointment.customer}`);
        return appointment;
    },

    updateAppointment(id, updates) {
        const appointments = this.getAppointments();
        const index = appointments.findIndex(a => a.id === id);
        if (index !== -1) {
            appointments[index] = { ...appointments[index], ...updates };
            this.saveAppointments(appointments);
            this.addActivityLogEntry(`Updated appointment for ${appointments[index].customer}`);
            return appointments[index];
        }
        return null;
    },

    deleteAppointment(id) {
        const appointments = this.getAppointments();
        const appointment = appointments.find(a => a.id === id);
        const filtered = appointments.filter(a => a.id !== id);
        this.saveAppointments(filtered);
        if (appointment) {
            this.addActivityLogEntry(`Cancelled appointment for ${appointment.customer}`);
        }
    },

    // ============== CART ==============
    getCart() {
        const data = localStorage.getItem(this.STORAGE_KEYS.CART);
        return data ? JSON.parse(data) : [];
    },

    saveCart(cart) {
        localStorage.setItem(this.STORAGE_KEYS.CART, JSON.stringify(cart));
    },

    addToCart(productId, quantity = 1) {
        const cart = this.getCart();
        const product = this.getProductById(productId);
        if (!product) return null;

        const existingItem = cart.find(item => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                productId,
                name: product.name,
                price: product.price,
                img: product.img,
                quantity
            });
        }
        this.saveCart(cart);
        return cart;
    },

    updateCartQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(i => i.productId === productId);
        if (item) {
            item.quantity = quantity;
            if (item.quantity <= 0) {
                return this.removeFromCart(productId);
            }
            this.saveCart(cart);
        }
        return cart;
    },

    removeFromCart(productId) {
        const cart = this.getCart().filter(item => item.productId !== productId);
        this.saveCart(cart);
        return cart;
    },

    clearCart() {
        this.saveCart([]);
    },

    getCartTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getCartCount() {
        const cart = this.getCart();
        return cart.reduce((count, item) => count + item.quantity, 0);
    },

    // ============== WISHLIST ==============
    getWishlist() {
        const data = localStorage.getItem(this.STORAGE_KEYS.WISHLIST);
        return data ? JSON.parse(data) : [];
    },

    saveWishlist(wishlist) {
        localStorage.setItem(this.STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    },

    toggleWishlist(productId) {
        const wishlist = this.getWishlist();
        const index = wishlist.indexOf(productId);
        if (index === -1) {
            wishlist.push(productId);
        } else {
            wishlist.splice(index, 1);
        }
        this.saveWishlist(wishlist);
        return wishlist;
    },

    isInWishlist(productId) {
        return this.getWishlist().includes(productId);
    },

    // ============== ACTIVITY LOG ==============
    getActivityLog() {
        const data = localStorage.getItem(this.STORAGE_KEYS.ACTIVITY_LOG);
        return data ? JSON.parse(data) : [];
    },

    saveActivityLog(log) {
        localStorage.setItem(this.STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(log));
    },

    addActivityLogEntry(action) {
        const log = this.getActivityLog();
        log.unshift({
            action,
            time: new Date().toISOString(),
            displayTime: 'Just now'
        });
        // Keep only last 50 entries
        if (log.length > 50) {
            log.pop();
        }
        this.saveActivityLog(log);
    },

    // ============== UTILITY ==============
    updateProductStock(productId, change) {
        const products = this.getProducts();
        const product = products.find(p => p.id === productId);
        if (product) {
            product.stock = Math.max(0, (product.stock || 0) + change);
            product.inStock = product.stock > 0;
            this.saveProducts(products);
        }
    },

    // Get dashboard stats
    getDashboardStats() {
        const products = this.getProducts();
        const orders = this.getOrders();
        const customers = this.getCustomers();
        const appointments = this.getAppointments();

        const totalRevenue = orders
            .filter(o => o.payment === 'paid')
            .reduce((sum, o) => sum + o.amount, 0);

        const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
        const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 10).length;
        const outOfStock = products.filter(p => p.stock === 0).length;
        const todayAppointments = appointments.filter(a => {
            const today = new Date().toISOString().split('T')[0];
            return a.date === today;
        }).length;

        return {
            totalProducts: products.length,
            totalOrders: orders.length,
            totalCustomers: customers.length,
            totalRevenue,
            pendingOrders,
            lowStockProducts,
            outOfStock,
            todayAppointments
        };
    },

    // Reset all data to defaults
    resetAllData() {
        this.saveProducts(this.defaultProducts);
        this.saveOrders(this.defaultOrders);
        this.saveCustomers(this.defaultCustomers);
        this.saveAppointments(this.defaultAppointments);
        this.saveActivityLog([]);
        this.saveCart([]);
        this.saveWishlist([]);
    }
};

// Initialize on load
SharedDataManager.init();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SharedDataManager;
}
