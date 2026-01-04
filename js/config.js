/**
 * =============================================
 * Site Configuration
 * Update these values for your deployment
 * ============================================= 
 */

const SITE_CONFIG = {
    // Site Information
    siteName: 'NOON Opticals',
    siteUrl: 'https://noonopticals.com',
    companyName: 'NOON Opticals',
    tagline: 'Modern Eyewear',
    
    // Contact Information
    contact: {
        email: 'noonopticals@gmail.com',
        phone: '+917010531695',
        whatsapp: '+917010531695',
        address: {
            main: {
                street: 'HIG-47/2, Avalapalli Rd, Avalapalli Hudco',
                city: 'Hosur',
                state: 'Tamil Nadu',
                zip: '635109',
                country: 'India'
            },
            branch: {
                street: 'Near Lal Masjid, Aachari Street',
                city: 'Pernambut',
                state: 'Tamil Nadu',
                zip: '635810',
                country: 'India'
            }
        }
    },
    
    // Business Hours
    businessHours: {
        main: 'Mon - Sat: 9:00 AM - 10:00 PM | Sun: Closed',
        branch: 'Mon - Sun: 9:00 AM - 10:00 PM'
    },
    
    // Social Media
    social: {
        instagram: 'https://www.instagram.com/noon_opticals_pbt',
        facebook: 'https://www.facebook.com/share/1DFskkeogd/',
        whatsapp: 'https://wa.me/917010531695'
    },
    
    // Features
    features: {
        cart: true,
        wishlist: true,
        userAuth: true,
        guestCheckout: true,
        reviews: true,
        newsletter: false
    },
    
    // Payment Methods (for future integration)
    paymentMethods: {
        cod: true, // Cash on Delivery
        online: true,
        upi: true,
        cards: true
    },
    
    // Shipping
    shipping: {
        freeShippingThreshold: 0, // Free shipping on all orders
        deliveryTime: '3-5 business days',
        returnWindow: 30 // days
    },
    
    // Currency
    currency: {
        code: 'INR',
        symbol: '₹',
        locale: 'en-IN'
    },
    
    // SEO
    seo: {
        keywords: 'eyewear, glasses, sunglasses, blue light glasses, reading glasses, NOON Opticals, Hosur',
        description: 'NOON Opticals - Premium eyewear with modern design, UV protection, and blue-light filtering. Find your perfect frame today.',
        author: 'Azhan'
    },
    
    // Google Analytics (Add your tracking ID)
    analytics: {
        ga4: '', // GA4 Measurement ID
        gtm: ''  // Google Tag Manager ID
    },
    
    // Version
    version: '1.0.0',
    lastUpdated: '2025-01-01'
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SITE_CONFIG;
}

// Make available globally
window.SITE_CONFIG = SITE_CONFIG;
