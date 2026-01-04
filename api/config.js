/**
 * =============================================
 * API Configuration & Endpoints
 * Backend-Ready API Structure
 * ============================================= 
 */

const API_CONFIG = {
    // Base URL - Update this when backend is deployed
    baseURL: 'https://api.noonopticals.com', // Change to your backend URL
    
    // API Endpoints
    endpoints: {
        // Products
        products: {
            getAll: '/api/products',
            getById: '/api/products/:id',
            getByCategory: '/api/products/category/:category',
            search: '/api/products/search'
        },
        
        // Cart
        cart: {
            get: '/api/cart',
            add: '/api/cart/add',
            update: '/api/cart/update',
            remove: '/api/cart/remove/:id',
            clear: '/api/cart/clear'
        },
        
        // Orders
        orders: {
            create: '/api/orders',
            getById: '/api/orders/:id',
            getByUser: '/api/orders/user/:userId',
            updateStatus: '/api/orders/:id/status'
        },
        
        // Users/Auth
        auth: {
            register: '/api/auth/register',
            login: '/api/auth/login',
            logout: '/api/auth/logout',
            refreshToken: '/api/auth/refresh',
            forgotPassword: '/api/auth/forgot-password',
            resetPassword: '/api/auth/reset-password'
        },
        
        // User Profile
        user: {
            getProfile: '/api/user/profile',
            updateProfile: '/api/user/profile',
            changePassword: '/api/user/change-password'
        },
        
        // Wishlist
        wishlist: {
            get: '/api/wishlist',
            add: '/api/wishlist/add',
            remove: '/api/wishlist/remove/:id'
        },
        
        // Contact
        contact: {
            send: '/api/contact/send'
        },
        
        // Reviews
        reviews: {
            getByProduct: '/api/reviews/product/:productId',
            create: '/api/reviews',
            update: '/api/reviews/:id',
            delete: '/api/reviews/:id'
        }
    },
    
    // Request timeout in milliseconds
    timeout: 30000,
    
    // Headers
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

/**
 * API Client Class
 */
class APIClient {
    constructor(config) {
        this.config = config;
    }

    async request(endpoint, options = {}) {
        const url = `${this.config.baseURL}${endpoint}`;
        const headers = {
            ...this.config.headers,
            ...options.headers
        };

        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const requestOptions = {
            ...options,
            headers
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

            const response = await fetch(url, {
                ...requestOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // PATCH request
    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// Create global API client instance
window.apiClient = new APIClient(API_CONFIG);

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, APIClient };
}

/**
 * Example Usage:
 * 
 * // Get all products
 * const products = await window.apiClient.get('/api/products');
 * 
 * // Add to cart
 * const cartItem = await window.apiClient.post('/api/cart/add', { productId: 1, quantity: 1 });
 * 
 * // User login
 * const user = await window.apiClient.post('/api/auth/login', { email: '...', password: '...' });
 */
