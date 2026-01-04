/**
 * =============================================
 * Firebase Data Manager (Admin Panel)
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
        console.log('FirebaseDataManager initialized (Admin Panel)');
        // Load sync queue from localStorage
        this.syncQueue = this.getFromLocalStorage('noonOpticals_syncQueue') || [];
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
        let products = this.getFromLocalStorage(this.STORAGE_KEYS.PRODUCTS);
        
        if (this.isFirebaseAvailable()) {
            await this.syncProductsFromFirebase();
            products = this.getFromLocalStorage(this.STORAGE_KEYS.PRODUCTS);
        }
        
        return products || [];
    },

    /**
     * Save products to both localStorage and Firebase
     */
    async saveProducts(products) {
        this.saveToLocalStorage(this.STORAGE_KEYS.PRODUCTS, products);
        
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
        
        if (this.isFirebaseAvailable()) {
            try {
                await this.getDB().collection(this.COLLECTIONS.PRODUCTS).doc(String(newId)).set(newProduct);
                console.log('Product added to Firebase:', newId);
            } catch (error) {
                console.error('Error adding product to Firebase:', error);
                this.addToSyncQueue('products', 'add', newProduct);
            }
        }
        
        // Log activity
        await this.addActivityLog('product_added', { productId: newId, productName: product.name });
        
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
            
            if (this.isFirebaseAvailable()) {
                try {
                    await this.getDB().collection(this.COLLECTIONS.PRODUCTS).doc(String(id)).set(products[index]);
                    console.log('Product updated in Firebase:', id);
                } catch (error) {
                    console.error('Error updating product in Firebase:', error);
                    this.addToSyncQueue('products', 'update', products[index]);
                }
            }
            
            // Log activity
            await this.addActivityLog('product_updated', { productId: id, productName: updatedProduct.name || products[index].name });
            
            return products[index];
        }
        return null;
    },

    /**
     * Delete a product
     */
    async deleteProduct(id) {
        let products = this.getFromLocalStorage(this.STORAGE_KEYS.PRODUCTS) || [];
        const product = products.find(p => p.id === id);
        products = products.filter(p => p.id !== id);
        this.saveToLocalStorage(this.STORAGE_KEYS.PRODUCTS, products);
        
        if (this.isFirebaseAvailable()) {
            try {
                await this.getDB().collection(this.COLLECTIONS.PRODUCTS).doc(String(id)).delete();
                console.log('Product deleted from Firebase:', id);
            } catch (error) {
                console.error('Error deleting product from Firebase:', error);
                this.addToSyncQueue('products', 'delete', { id });
            }
        }
        
        // Log activity
        if (product) {
            await this.addActivityLog('product_deleted', { productId: id, productName: product.name });
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
                const products = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return { 
                        ...data, 
                        id: parseInt(doc.id) || doc.id 
                    };
                });
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
        if (!this.isFirebaseAvailable() || !products || products.length === 0) return;
        
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
            await this.syncCollectionFromFirebase(this.COLLECTIONS.ORDERS, this.STORAGE_KEYS.ORDERS);
            orders = this.getFromLocalStorage(this.STORAGE_KEYS.ORDERS);
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
        
        await this.addActivityLog('order_created', { orderId: newId });
        
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
                    await this.getDB().collection(this.COLLECTIONS.ORDERS).doc(String(id)).set(orders[index]);
                } catch (error) {
                    console.error('Error updating order in Firebase:', error);
                }
            }
            
            await this.addActivityLog('order_updated', { orderId: id, status: updates.status });
            
            return orders[index];
        }
        return null;
    },

    // ==================== CUSTOMERS ====================

    async getCustomers() {
        let customers = this.getFromLocalStorage(this.STORAGE_KEYS.CUSTOMERS);
        if (this.isFirebaseAvailable()) {
            await this.syncCollectionFromFirebase(this.COLLECTIONS.CUSTOMERS, this.STORAGE_KEYS.CUSTOMERS);
            customers = this.getFromLocalStorage(this.STORAGE_KEYS.CUSTOMERS);
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
        
        await this.addActivityLog('customer_added', { customerId: newId, customerName: customer.name });
        
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
                    await this.getDB().collection(this.COLLECTIONS.CUSTOMERS).doc(String(id)).set(customers[index]);
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
            await this.syncCollectionFromFirebase(this.COLLECTIONS.APPOINTMENTS, this.STORAGE_KEYS.APPOINTMENTS);
            appointments = this.getFromLocalStorage(this.STORAGE_KEYS.APPOINTMENTS);
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
        
        await this.addActivityLog('appointment_scheduled', { appointmentId: newId, customerName: appointment.customerName });
        
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
                    await this.getDB().collection(this.COLLECTIONS.APPOINTMENTS).doc(String(id)).set(appointments[index]);
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

    // ==================== USERS/CUSTOMERS ====================

    /**
     * Get all users/customers from Firebase
     */
    async getUsers() {
        let users = this.getFromLocalStorage(this.STORAGE_KEYS.LOCAL_USERS);
        if (this.isFirebaseAvailable()) {
            await this.syncUsersFromFirebase();
            users = this.getFromLocalStorage(this.STORAGE_KEYS.LOCAL_USERS);
        }
        return users || [];
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

    // ==================== ACTIVITY LOG ====================

    async addActivityLog(action, details = {}) {
        const logs = this.getFromLocalStorage(this.STORAGE_KEYS.ACTIVITY_LOG) || [];
        const newLog = {
            id: Date.now(),
            action,
            details,
            timestamp: new Date().toISOString(),
            userId: 'admin'
        };
        
        logs.unshift(newLog);
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

    // ==================== SYNC QUEUE ====================

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

    getLastSyncTime() {
        return this.getFromLocalStorage(this.STORAGE_KEYS.LAST_SYNC);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to initialize
    setTimeout(() => {
        FirebaseDataManager.init();
        // Initial sync from Firebase
        if (FirebaseDataManager.isFirebaseAvailable()) {
            FirebaseDataManager.syncFromFirebase();
        }
    }, 500);
});

// Export for global access
window.FirebaseDataManager = FirebaseDataManager;
