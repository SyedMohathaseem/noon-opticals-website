/**
 * =============================================
 * Firebase Data Manager
 * Syncs data between localStorage and Firebase Firestore
 * ============================================= 
 */

const FirebaseDataManager = {
    // Collection names
    COLLECTIONS: {
        PRODUCTS: 'products',
        ORDERS: 'orders',
        CUSTOMERS: 'customers',
        APPOINTMENTS: 'appointments',
        USERS: 'users',
        CART: 'cart',
        WISHLIST: 'wishlist',
        ACTIVITY_LOG: 'activityLog',
        SETTINGS: 'settings'
    },

    // Local storage keys (matching SharedDataManager)
    STORAGE_KEYS: {
        PRODUCTS: 'noonOpticals_products',
        ORDERS: 'noonOpticals_orders',
        CUSTOMERS: 'noonOpticals_customers',
        APPOINTMENTS: 'noonOpticals_appointments',
        ACTIVITY_LOG: 'noonOpticals_activityLog',
        CART: 'noonOpticals_cart',
        WISHLIST: 'noonOpticals_wishlist',
        LOCAL_USERS: 'noonOpticals_localUsers',
        LAST_SYNC: 'noonOpticals_lastSync'
    },

    // Sync status
    isSyncing: false,
    syncQueue: [],

    /**
     * Initialize the data manager
     */
    init() {
        console.log('FirebaseDataManager initialized');
        // Auto-sync from Firebase on init
        setTimeout(() => {
            if (this.isFirebaseAvailable()) {
                this.syncFromFirebase();
            }
        }, 500);
    },

    /**
     * Get Firestore instance
     */
    getDB() {
        return typeof getFirebaseDB === 'function' ? getFirebaseDB() : null;
    },

    /**
     * Check if Firebase is available
     */
    isFirebaseAvailable() {
        return this.getDB() !== null;
    },

    // ==================== PRODUCTS ====================

    /**
     * Get all products (from localStorage first, then sync with Firebase)
     */
    async getProducts() {
        // Get from localStorage first for fast access
        let products = this.getFromLocalStorage(this.STORAGE_KEYS.PRODUCTS);
        
        // If Firebase is available, sync in background
        if (this.isFirebaseAvailable()) {
            this.syncProductsFromFirebase();
        }
        
        return products || [];
    },

    /**
     * Save products to both localStorage and Firebase
     */
    async saveProducts(products) {
        // Save to localStorage immediately
        this.saveToLocalStorage(this.STORAGE_KEYS.PRODUCTS, products);
        
        // Sync to Firebase
        if (this.isFirebaseAvailable()) {
            await this.syncProductsToFirebase(products);
        }
    },

    /**
     * Add a product
     */
    async addProduct(product) {
        const products = this.getFromLocalStorage(this.STORAGE_KEYS.PRODUCTS) || [];
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = { ...product, id: newId, createdAt: new Date().toISOString() };
        
        products.push(newProduct);
        this.saveToLocalStorage(this.STORAGE_KEYS.PRODUCTS, products);
        
        // Sync to Firebase
        if (this.isFirebaseAvailable()) {
            try {
                await this.getDB().collection(this.COLLECTIONS.PRODUCTS).doc(String(newId)).set(newProduct);
            } catch (error) {
                console.error('Error adding product to Firebase:', error);
                this.addToSyncQueue('products', 'add', newProduct);
            }
        }
        
        return newProduct;
    },

    /**
     * Update a product
     */
    async updateProduct(id, updatedProduct) {
        const products = this.getFromLocalStorage(this.STORAGE_KEYS.PRODUCTS) || [];
        const index = products.findIndex(p => p.id === id);
        
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedProduct, updatedAt: new Date().toISOString() };
            this.saveToLocalStorage(this.STORAGE_KEYS.PRODUCTS, products);
            
            // Sync to Firebase
            if (this.isFirebaseAvailable()) {
                try {
                    await this.getDB().collection(this.COLLECTIONS.PRODUCTS).doc(String(id)).update(products[index]);
                } catch (error) {
                    console.error('Error updating product in Firebase:', error);
                    this.addToSyncQueue('products', 'update', products[index]);
                }
            }
            
            return products[index];
        }
        return null;
    },

    /**
     * Delete a product
     */
    async deleteProduct(id) {
        let products = this.getFromLocalStorage(this.STORAGE_KEYS.PRODUCTS) || [];
        products = products.filter(p => p.id !== id);
        this.saveToLocalStorage(this.STORAGE_KEYS.PRODUCTS, products);
        
        // Sync to Firebase
        if (this.isFirebaseAvailable()) {
            try {
                await this.getDB().collection(this.COLLECTIONS.PRODUCTS).doc(String(id)).delete();
            } catch (error) {
                console.error('Error deleting product from Firebase:', error);
                this.addToSyncQueue('products', 'delete', { id });
            }
        }
    },

    /**
     * Sync products from Firebase to localStorage
     */
    async syncProductsFromFirebase() {
        if (!this.isFirebaseAvailable()) return;
        
        try {
            const snapshot = await this.getDB().collection(this.COLLECTIONS.PRODUCTS).get();
            if (!snapshot.empty) {
                const products = snapshot.docs.map(doc => ({ id: parseInt(doc.id) || doc.id, ...doc.data() }));
                this.saveToLocalStorage(this.STORAGE_KEYS.PRODUCTS, products);
                console.log('Products synced from Firebase:', products.length);
            }
        } catch (error) {
            console.error('Error syncing products from Firebase:', error);
        }
    },

    /**
     * Sync products to Firebase from localStorage
     */
    async syncProductsToFirebase(products) {
        if (!this.isFirebaseAvailable()) return;
        
        const batch = this.getDB().batch();
        const collectionRef = this.getDB().collection(this.COLLECTIONS.PRODUCTS);
        
        try {
            for (const product of products) {
                const docRef = collectionRef.doc(String(product.id));
                batch.set(docRef, product);
            }
            await batch.commit();
            console.log('Products synced to Firebase:', products.length);
        } catch (error) {
            console.error('Error syncing products to Firebase:', error);
        }
    },

    // ==================== ORDERS ====================

    async getOrders() {
        let orders = this.getFromLocalStorage(this.STORAGE_KEYS.ORDERS);
        if (this.isFirebaseAvailable()) {
            this.syncCollectionFromFirebase(this.COLLECTIONS.ORDERS, this.STORAGE_KEYS.ORDERS);
        }
        return orders || [];
    },

    async saveOrders(orders) {
        this.saveToLocalStorage(this.STORAGE_KEYS.ORDERS, orders);
        if (this.isFirebaseAvailable()) {
            await this.syncCollectionToFirebase(this.COLLECTIONS.ORDERS, orders);
        }
    },

    async addOrder(order) {
        const orders = this.getFromLocalStorage(this.STORAGE_KEYS.ORDERS) || [];
        const newId = `ORD-${Date.now()}`;
        const newOrder = { ...order, id: newId, createdAt: new Date().toISOString(), status: order.status || 'pending' };
        
        orders.push(newOrder);
        this.saveToLocalStorage(this.STORAGE_KEYS.ORDERS, orders);
        
        if (this.isFirebaseAvailable()) {
            try {
                await this.getDB().collection(this.COLLECTIONS.ORDERS).doc(newId).set(newOrder);
            } catch (error) {
                console.error('Error adding order to Firebase:', error);
            }
        }
        
        return newOrder;
    },

    async updateOrder(id, updates) {
        const orders = this.getFromLocalStorage(this.STORAGE_KEYS.ORDERS) || [];
        const index = orders.findIndex(o => o.id === id);
        
        if (index !== -1) {
            orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
            this.saveToLocalStorage(this.STORAGE_KEYS.ORDERS, orders);
            
            if (this.isFirebaseAvailable()) {
                try {
                    await this.getDB().collection(this.COLLECTIONS.ORDERS).doc(String(id)).update(orders[index]);
                } catch (error) {
                    console.error('Error updating order in Firebase:', error);
                }
            }
            
            return orders[index];
        }
        return null;
    },

    // ==================== CUSTOMERS ====================

    async getCustomers() {
        let customers = this.getFromLocalStorage(this.STORAGE_KEYS.CUSTOMERS);
        if (this.isFirebaseAvailable()) {
            this.syncCollectionFromFirebase(this.COLLECTIONS.CUSTOMERS, this.STORAGE_KEYS.CUSTOMERS);
        }
        return customers || [];
    },

    async saveCustomers(customers) {
        this.saveToLocalStorage(this.STORAGE_KEYS.CUSTOMERS, customers);
        if (this.isFirebaseAvailable()) {
            await this.syncCollectionToFirebase(this.COLLECTIONS.CUSTOMERS, customers);
        }
    },

    async addCustomer(customer) {
        const customers = this.getFromLocalStorage(this.STORAGE_KEYS.CUSTOMERS) || [];
        const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id || 0)) + 1 : 1;
        const newCustomer = { ...customer, id: newId, createdAt: new Date().toISOString() };
        
        customers.push(newCustomer);
        this.saveToLocalStorage(this.STORAGE_KEYS.CUSTOMERS, customers);
        
        if (this.isFirebaseAvailable()) {
            try {
                await this.getDB().collection(this.COLLECTIONS.CUSTOMERS).doc(String(newId)).set(newCustomer);
            } catch (error) {
                console.error('Error adding customer to Firebase:', error);
            }
        }
        
        return newCustomer;
    },

    async updateCustomer(id, updates) {
        const customers = this.getFromLocalStorage(this.STORAGE_KEYS.CUSTOMERS) || [];
        const index = customers.findIndex(c => c.id === id);
        
        if (index !== -1) {
            customers[index] = { ...customers[index], ...updates, updatedAt: new Date().toISOString() };
            this.saveToLocalStorage(this.STORAGE_KEYS.CUSTOMERS, customers);
            
            if (this.isFirebaseAvailable()) {
                try {
                    await this.getDB().collection(this.COLLECTIONS.CUSTOMERS).doc(String(id)).update(customers[index]);
                } catch (error) {
                    console.error('Error updating customer in Firebase:', error);
                }
            }
            
            return customers[index];
        }
        return null;
    },

    async deleteCustomer(id) {
        let customers = this.getFromLocalStorage(this.STORAGE_KEYS.CUSTOMERS) || [];
        customers = customers.filter(c => c.id !== id);
        this.saveToLocalStorage(this.STORAGE_KEYS.CUSTOMERS, customers);
        
        if (this.isFirebaseAvailable()) {
            try {
                await this.getDB().collection(this.COLLECTIONS.CUSTOMERS).doc(String(id)).delete();
            } catch (error) {
                console.error('Error deleting customer from Firebase:', error);
            }
        }
    },

    // ==================== APPOINTMENTS ====================

    async getAppointments() {
        let appointments = this.getFromLocalStorage(this.STORAGE_KEYS.APPOINTMENTS);
        if (this.isFirebaseAvailable()) {
            this.syncCollectionFromFirebase(this.COLLECTIONS.APPOINTMENTS, this.STORAGE_KEYS.APPOINTMENTS);
        }
        return appointments || [];
    },

    async saveAppointments(appointments) {
        this.saveToLocalStorage(this.STORAGE_KEYS.APPOINTMENTS, appointments);
        if (this.isFirebaseAvailable()) {
            await this.syncCollectionToFirebase(this.COLLECTIONS.APPOINTMENTS, appointments);
        }
    },

    async addAppointment(appointment) {
        const appointments = this.getFromLocalStorage(this.STORAGE_KEYS.APPOINTMENTS) || [];
        const newId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id || 0)) + 1 : 1;
        const newAppointment = { ...appointment, id: newId, createdAt: new Date().toISOString(), status: 'scheduled' };
        
        appointments.push(newAppointment);
        this.saveToLocalStorage(this.STORAGE_KEYS.APPOINTMENTS, appointments);
        
        if (this.isFirebaseAvailable()) {
            try {
                await this.getDB().collection(this.COLLECTIONS.APPOINTMENTS).doc(String(newId)).set(newAppointment);
            } catch (error) {
                console.error('Error adding appointment to Firebase:', error);
            }
        }
        
        return newAppointment;
    },

    async updateAppointment(id, updates) {
        const appointments = this.getFromLocalStorage(this.STORAGE_KEYS.APPOINTMENTS) || [];
        const index = appointments.findIndex(a => a.id === id);
        
        if (index !== -1) {
            appointments[index] = { ...appointments[index], ...updates, updatedAt: new Date().toISOString() };
            this.saveToLocalStorage(this.STORAGE_KEYS.APPOINTMENTS, appointments);
            
            if (this.isFirebaseAvailable()) {
                try {
                    await this.getDB().collection(this.COLLECTIONS.APPOINTMENTS).doc(String(id)).update(appointments[index]);
                } catch (error) {
                    console.error('Error updating appointment in Firebase:', error);
                }
            }
            
            return appointments[index];
        }
        return null;
    },

    async deleteAppointment(id) {
        let appointments = this.getFromLocalStorage(this.STORAGE_KEYS.APPOINTMENTS) || [];
        appointments = appointments.filter(a => a.id !== id);
        this.saveToLocalStorage(this.STORAGE_KEYS.APPOINTMENTS, appointments);
        
        if (this.isFirebaseAvailable()) {
            try {
                await this.getDB().collection(this.COLLECTIONS.APPOINTMENTS).doc(String(id)).delete();
            } catch (error) {
                console.error('Error deleting appointment from Firebase:', error);
            }
        }
    },

    // ==================== CART (User-specific) ====================

    async getCart(userId) {
        const key = userId ? `${this.STORAGE_KEYS.CART}_${userId}` : this.STORAGE_KEYS.CART;
        let cart = this.getFromLocalStorage(key);
        
        if (this.isFirebaseAvailable() && userId) {
            try {
                const doc = await this.getDB().collection(this.COLLECTIONS.CART).doc(userId).get();
                if (doc.exists) {
                    cart = doc.data().items || [];
                    this.saveToLocalStorage(key, cart);
                }
            } catch (error) {
                console.error('Error getting cart from Firebase:', error);
            }
        }
        
        return cart || [];
    },

    async saveCart(userId, cart) {
        const key = userId ? `${this.STORAGE_KEYS.CART}_${userId}` : this.STORAGE_KEYS.CART;
        this.saveToLocalStorage(key, cart);
        
        if (this.isFirebaseAvailable() && userId) {
            try {
                await this.getDB().collection(this.COLLECTIONS.CART).doc(userId).set({
                    items: cart,
                    updatedAt: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error saving cart to Firebase:', error);
            }
        }
    },

    // ==================== WISHLIST (User-specific) ====================

    async getWishlist(userId) {
        const key = userId ? `${this.STORAGE_KEYS.WISHLIST}_${userId}` : this.STORAGE_KEYS.WISHLIST;
        let wishlist = this.getFromLocalStorage(key);
        
        if (this.isFirebaseAvailable() && userId) {
            try {
                const doc = await this.getDB().collection(this.COLLECTIONS.WISHLIST).doc(userId).get();
                if (doc.exists) {
                    wishlist = doc.data().items || [];
                    this.saveToLocalStorage(key, wishlist);
                }
            } catch (error) {
                console.error('Error getting wishlist from Firebase:', error);
            }
        }
        
        return wishlist || [];
    },

    async saveWishlist(userId, wishlist) {
        const key = userId ? `${this.STORAGE_KEYS.WISHLIST}_${userId}` : this.STORAGE_KEYS.WISHLIST;
        this.saveToLocalStorage(key, wishlist);
        
        if (this.isFirebaseAvailable() && userId) {
            try {
                await this.getDB().collection(this.COLLECTIONS.WISHLIST).doc(userId).set({
                    items: wishlist,
                    updatedAt: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error saving wishlist to Firebase:', error);
            }
        }
    },

    // ==================== USER PROFILE ====================

    /**
     * Get all users from Firebase
     */
    async getUsers() {
        let users = this.getFromLocalStorage(this.STORAGE_KEYS.LOCAL_USERS);
        if (this.isFirebaseAvailable()) {
            this.syncUsersFromFirebase();
        }
        return users || [];
    },

    /**
     * Save user to Firebase
     */
    async saveUser(userData) {
        if (!userData || !userData.email) return false;

        try {
            // Save to localStorage
            const users = this.getFromLocalStorage(this.STORAGE_KEYS.LOCAL_USERS) || [];
            const existingIndex = users.findIndex(u => u.email === userData.email);
            
            if (existingIndex >= 0) {
                users[existingIndex] = { ...users[existingIndex], ...userData, updatedAt: new Date().toISOString() };
            } else {
                users.push({ ...userData, createdAt: new Date().toISOString() });
            }
            this.saveToLocalStorage(this.STORAGE_KEYS.LOCAL_USERS, users);

            // Save to Firebase 'users' collection
            if (this.isFirebaseAvailable()) {
                const docId = userData.email.replace(/\./g, '_').replace(/@/g, '_at_');
                await this.getDB().collection(this.COLLECTIONS.USERS).doc(docId).set({
                    uid: userData.uid || userData.id,
                    email: userData.email,
                    displayName: userData.displayName || userData.name,
                    photoURL: userData.photoURL || null,
                    provider: userData.provider || 'email',
                    phone: userData.phone || null,
                    address: userData.address || null,
                    createdAt: userData.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }, { merge: true });
                console.log('User saved to Firebase users collection:', userData.email);
            }
            return true;
        } catch (error) {
            console.error('Error saving user:', error);
            return false;
        }
    },

    /**
     * Sync users from Firebase to localStorage
     */
    async syncUsersFromFirebase() {
        if (!this.isFirebaseAvailable()) return;
        
        try {
            const snapshot = await this.getDB().collection(this.COLLECTIONS.USERS).get();
            if (!snapshot.empty) {
                const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                this.saveToLocalStorage(this.STORAGE_KEYS.LOCAL_USERS, users);
                console.log('Users synced from Firebase users collection:', users.length);
            }
        } catch (error) {
            console.error('Error syncing users from Firebase:', error);
        }
    },

    /**
     * Sync all local users to Firebase
     */
    async syncUsersToFirebase() {
        if (!this.isFirebaseAvailable()) return;
        
        const users = this.getFromLocalStorage(this.STORAGE_KEYS.LOCAL_USERS) || [];
        
        try {
            for (const user of users) {
                if (user.email) {
                    const docId = user.email.replace(/\./g, '_').replace(/@/g, '_at_');
                    await this.getDB().collection(this.COLLECTIONS.USERS).doc(docId).set({
                        uid: user.uid || user.id,
                        email: user.email,
                        displayName: user.displayName || user.name,
                        photoURL: user.photoURL || null,
                        provider: user.provider || 'email',
                        phone: user.phone || null,
                        address: user.address || null,
                        createdAt: user.createdAt || new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }, { merge: true });
                }
            }
            console.log('Users synced to Firebase users collection:', users.length);
        } catch (error) {
            console.error('Error syncing users to Firebase:', error);
        }
    },

    async getUserProfile(userId) {
        if (this.isFirebaseAvailable() && userId) {
            try {
                const doc = await this.getDB().collection(this.COLLECTIONS.USERS).doc(userId).get();
                if (doc.exists) {
                    return doc.data();
                }
            } catch (error) {
                console.error('Error getting user profile from Firebase:', error);
            }
        }
        return null;
    },

    async saveUserProfile(userId, profile) {
        if (this.isFirebaseAvailable() && userId) {
            try {
                await this.getDB().collection(this.COLLECTIONS.USERS).doc(userId).set({
                    ...profile,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
                return true;
            } catch (error) {
                console.error('Error saving user profile to Firebase:', error);
            }
        }
        return false;
    },

    // ==================== ACTIVITY LOG ====================

    async addActivityLog(action, details = {}) {
        const logs = this.getFromLocalStorage(this.STORAGE_KEYS.ACTIVITY_LOG) || [];
        const user = JSON.parse(localStorage.getItem('noonOpticals_user') || '{}');
        const newLog = {
            id: Date.now(),
            action,
            details,
            timestamp: new Date().toISOString(),
            userId: user?.uid || 'anonymous'
        };
        
        logs.unshift(newLog);
        // Keep only last 100 logs in localStorage
        const trimmedLogs = logs.slice(0, 100);
        this.saveToLocalStorage(this.STORAGE_KEYS.ACTIVITY_LOG, trimmedLogs);
        
        if (this.isFirebaseAvailable()) {
            try {
                await this.getDB().collection(this.COLLECTIONS.ACTIVITY_LOG).add(newLog);
            } catch (error) {
                console.error('Error adding activity log to Firebase:', error);
            }
        }
        
        return newLog;
    },

    async getActivityLogs(limit = 50) {
        let logs = this.getFromLocalStorage(this.STORAGE_KEYS.ACTIVITY_LOG) || [];
        
        if (this.isFirebaseAvailable()) {
            try {
                const snapshot = await this.getDB()
                    .collection(this.COLLECTIONS.ACTIVITY_LOG)
                    .orderBy('timestamp', 'desc')
                    .limit(limit)
                    .get();
                
                if (!snapshot.empty) {
                    logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    this.saveToLocalStorage(this.STORAGE_KEYS.ACTIVITY_LOG, logs);
                }
            } catch (error) {
                console.error('Error getting activity logs from Firebase:', error);
            }
        }
        
        return logs.slice(0, limit);
    },

    // ==================== GENERIC SYNC HELPERS ====================

    async syncCollectionFromFirebase(collectionName, storageKey) {
        if (!this.isFirebaseAvailable()) return;
        
        try {
            const snapshot = await this.getDB().collection(collectionName).get();
            if (!snapshot.empty) {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                this.saveToLocalStorage(storageKey, data);
                console.log(`${collectionName} synced from Firebase:`, data.length);
            }
        } catch (error) {
            console.error(`Error syncing ${collectionName} from Firebase:`, error);
        }
    },

    async syncCollectionToFirebase(collectionName, data) {
        if (!this.isFirebaseAvailable() || !data || data.length === 0) return;
        
        const batch = this.getDB().batch();
        const collectionRef = this.getDB().collection(collectionName);
        
        try {
            for (const item of data) {
                const docId = String(item.id);
                const docRef = collectionRef.doc(docId);
                batch.set(docRef, item);
            }
            await batch.commit();
            console.log(`${collectionName} synced to Firebase:`, data.length);
        } catch (error) {
            console.error(`Error syncing ${collectionName} to Firebase:`, error);
        }
    },

    /**
     * Full sync from Firebase to localStorage
     */
    async syncFromFirebase() {
        if (!this.isFirebaseAvailable()) {
            console.log('Firebase not available, using localStorage only');
            return;
        }

        this.isSyncing = true;
        console.log('Starting full sync from Firebase...');

        try {
            await Promise.all([
                this.syncCollectionFromFirebase(this.COLLECTIONS.PRODUCTS, this.STORAGE_KEYS.PRODUCTS),
                this.syncCollectionFromFirebase(this.COLLECTIONS.ORDERS, this.STORAGE_KEYS.ORDERS),
                this.syncCollectionFromFirebase(this.COLLECTIONS.USERS, this.STORAGE_KEYS.LOCAL_USERS),
                this.syncCollectionFromFirebase(this.COLLECTIONS.APPOINTMENTS, this.STORAGE_KEYS.APPOINTMENTS)
            ]);

            this.saveToLocalStorage(this.STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
            console.log('Full sync from Firebase completed');
        } catch (error) {
            console.error('Error during full sync from Firebase:', error);
        }

        this.isSyncing = false;
        
        // Process sync queue
        this.processSyncQueue();
    },

    /**
     * Full sync from localStorage to Firebase
     */
    async syncToFirebase() {
        if (!this.isFirebaseAvailable()) {
            console.log('Firebase not available');
            return;
        }

        this.isSyncing = true;
        console.log('Starting full sync to Firebase...');

        try {
            const products = this.getFromLocalStorage(this.STORAGE_KEYS.PRODUCTS);
            const orders = this.getFromLocalStorage(this.STORAGE_KEYS.ORDERS);
            const appointments = this.getFromLocalStorage(this.STORAGE_KEYS.APPOINTMENTS);

            await Promise.all([
                products && this.syncCollectionToFirebase(this.COLLECTIONS.PRODUCTS, products),
                orders && this.syncCollectionToFirebase(this.COLLECTIONS.ORDERS, orders),
                appointments && this.syncCollectionToFirebase(this.COLLECTIONS.APPOINTMENTS, appointments),
                this.syncUsersToFirebase()
            ]);

            this.saveToLocalStorage(this.STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
            console.log('Full sync to Firebase completed');
        } catch (error) {
            console.error('Error during full sync to Firebase:', error);
        }

        this.isSyncing = false;
    },

    // ==================== SYNC QUEUE (for offline support) ====================

    addToSyncQueue(collection, action, data) {
        this.syncQueue.push({ collection, action, data, timestamp: Date.now() });
        this.saveToLocalStorage('noonOpticals_syncQueue', this.syncQueue);
    },

    async processSyncQueue() {
        if (!this.isFirebaseAvailable() || this.syncQueue.length === 0) return;

        const queue = [...this.syncQueue];
        this.syncQueue = [];

        for (const item of queue) {
            try {
                const docRef = this.getDB().collection(item.collection).doc(String(item.data.id));
                
                if (item.action === 'add' || item.action === 'update') {
                    await docRef.set(item.data);
                } else if (item.action === 'delete') {
                    await docRef.delete();
                }
            } catch (error) {
                console.error('Error processing sync queue item:', error);
                this.syncQueue.push(item);
            }
        }

        this.saveToLocalStorage('noonOpticals_syncQueue', this.syncQueue);
    },

    // ==================== LOCAL STORAGE HELPERS ====================

    getFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    removeFromLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    /**
     * Clear all local data
     */
    clearLocalData() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            this.removeFromLocalStorage(key);
        });
        console.log('Local data cleared');
    },

    /**
     * Get last sync time
     */
    getLastSyncTime() {
        return this.getFromLocalStorage(this.STORAGE_KEYS.LAST_SYNC);
    }
};

// Export for global access
window.FirebaseDataManager = FirebaseDataManager;
