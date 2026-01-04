/**
 * =============================================
 * Product Data Configuration
 * Backend-Ready Data Structure
 * ============================================= 
 */

const productsData = [
    {
        id: 1,
        name: "Neon Vision",
        category: "Sport",
        price: 3499,
        oldPrice: 4299,
        img: "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=2070&auto=format&fit=crop",
        discount: 18,
        tags: ["UV400", "Polarized"],
        inStock: true,
        rating: 4.5,
        reviewCount: 128
    },
    {
        id: 2,
        name: "Crystal Clear",
        category: "Reading",
        price: 2299,
        oldPrice: 2899,
        img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=2080&auto=format&fit=crop",
        discount: 20,
        tags: ["Blue-Light", "Anti-Glare"],
        inStock: true,
        rating: 4.5,
        reviewCount: 128
    },
    {
        id: 3,
        name: "Golden Hour",
        category: "Sun",
        price: 4199,
        oldPrice: 5299,
        img: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=2070&auto=format&fit=crop",
        discount: 20,
        tags: ["UV400", "Polarized"],
        inStock: false,
        rating: 4.5,
        reviewCount: 128
    },
    {
        id: 4,
        name: "Urban Tech",
        category: "Blue Light",
        price: 2699,
        oldPrice: 3499,
        img: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=2070&auto=format&fit=crop",
        discount: 22,
        tags: ["Blue-Light", "Anti-Glare"],
        inStock: true,
        rating: 4.5,
        reviewCount: 128
    },
    {
        id: 5,
        name: "Classic Aviator",
        category: "Sun",
        price: 3899,
        oldPrice: 4899,
        img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop",
        discount: 20,
        tags: ["UV400", "Polarized"],
        inStock: true,
        rating: 4.5,
        reviewCount: 128
    },
    {
        id: 6,
        name: "Retro Round",
        category: "Fashion",
        price: 2999,
        oldPrice: 3899,
        img: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=2070&auto=format&fit=crop",
        discount: 23,
        tags: ["Vintage", "Anti-Glare"],
        inStock: true,
        rating: 4.5,
        reviewCount: 128
    },
    {
        id: 7,
        name: "Smart Vision",
        category: "Blue Light",
        price: 2899,
        oldPrice: 3599,
        img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=2084&auto=format&fit=crop",
        discount: 19,
        tags: ["Blue-Light", "Anti-Glare"],
        inStock: true,
        rating: 4.5,
        reviewCount: 128
    },
    {
        id: 8,
        name: "Elite Pro",
        category: "Sport",
        price: 4899,
        oldPrice: 5999,
        img: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=2073&auto=format&fit=crop",
        discount: 18,
        tags: ["UV400", "Polarized"],
        inStock: true,
        rating: 4.5,
        reviewCount: 128
    },
    {
        id: 9,
        name: "Midnight Matte",
        category: "Fashion",
        price: 3199,
        oldPrice: 3799,
        img: "https://images.unsplash.com/photo-1542293787938-4d36399c31d7?q=80&w=2070&auto=format&fit=crop",
        discount: 16,
        tags: ["Matte", "Featherlight"],
        inStock: true,
        rating: 4.5,
        reviewCount: 128
    },
    {
        id: 10,
        name: "Aurora Blue",
        category: "Blue Light",
        price: 2799,
        oldPrice: 3399,
        img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop",
        discount: 18,
        tags: ["Blue-Light", "Anti-Glare"],
        inStock: true,
        rating: 4.5,
        reviewCount: 128
    },
    {
        id: 11,
        name: "Desert Trail",
        category: "Sport",
        price: 4599,
        oldPrice: 5499,
        img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2070&auto=format&fit=crop",
        discount: 16,
        tags: ["UV400", "Impact-Resist"],
        inStock: true,
        rating: 4.5,
        reviewCount: 128
    },
    {
        id: 12,
        name: "azhan pro",
        category: "Reading",
        price: 2499,
        oldPrice: 3099,
        img: "https://images.unsplash.com/photo-1522938974444-f12497b69347?q=80&w=2070&auto=format&fit=crop",
        discount: 19,
        tags: ["Blue-Light", "Comfort Fit"],
        inStock: true,
        rating: 4.5,
        reviewCount: 128
    },
    {
        id: 13,
        name: "Titanium Edge",
        category: "Fashion",
        price: 5299,
        oldPrice: 6499,
        img: "https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=2080&auto=format&fit=crop",
        discount: 18,
        tags: ["Titanium", "Lightweight"],
        inStock: true,
        rating: 4.8,
        reviewCount: 245
    },
    {
        id: 14,
        name: "Ocean Drift",
        category: "Sun",
        price: 3799,
        oldPrice: 4599,
        img: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?q=80&w=2070&auto=format&fit=crop",
        discount: 17,
        tags: ["UV400", "Polarized"],
        inStock: true,
        rating: 4.6,
        reviewCount: 189
    },
    {
        id: 15,
        name: "Night Owl",
        category: "Blue Light",
        price: 2599,
        oldPrice: 3199,
        img: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=2070&auto=format&fit=crop",
        discount: 19,
        tags: ["Blue-Light", "Anti-Fatigue"],
        inStock: true,
        rating: 4.4,
        reviewCount: 156
    },
    {
        id: 16,
        name: "Mountain Peak",
        category: "Sport",
        price: 4999,
        oldPrice: 5999,
        img: "https://images.unsplash.com/photo-1504198070170-4ca53bb1c1fa?q=80&w=2070&auto=format&fit=crop",
        discount: 16,
        tags: ["UV400", "Impact-Resist"],
        inStock: true,
        rating: 4.7,
        reviewCount: 203
    },
    {
        id: 17,
        name: "Vintage Scholar",
        category: "Reading",
        price: 1999,
        oldPrice: 2599,
        img: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=2070&auto=format&fit=crop",
        discount: 23,
        tags: ["Anti-Glare", "Comfort Fit"],
        inStock: true,
        rating: 4.3,
        reviewCount: 142
    },
    {
        id: 18,
        name: "Sunset Boulevard",
        category: "Sun",
        price: 4499,
        oldPrice: 5499,
        img: "https://images.unsplash.com/photo-1625591340248-f9bf4f1d6527?q=80&w=2070&auto=format&fit=crop",
        discount: 18,
        tags: ["UV400", "Gradient Lens"],
        inStock: false,
        rating: 4.9,
        reviewCount: 312
    },
    {
        id: 19,
        name: "Metro Style",
        category: "Fashion",
        price: 3599,
        oldPrice: 4299,
        img: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=2070&auto=format&fit=crop",
        discount: 16,
        tags: ["Acetate", "Designer"],
        inStock: true,
        rating: 4.5,
        reviewCount: 178
    },
    {
        id: 20,
        name: "Pro Gamer",
        category: "Blue Light",
        price: 3299,
        oldPrice: 3999,
        img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=2084&auto=format&fit=crop",
        discount: 17,
        tags: ["Blue-Light", "Gaming"],
        inStock: true,
        rating: 4.6,
        reviewCount: 267
    },
    {
        id: 21,
        name: "Executive Class",
        category: "Reading",
        price: 2899,
        oldPrice: 3599,
        img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=2080&auto=format&fit=crop",
        discount: 19,
        tags: ["Premium", "Anti-Glare"],
        inStock: true,
        rating: 4.7,
        reviewCount: 198
    },
    {
        id: 22,
        name: "Cyber Punk",
        category: "Fashion",
        price: 4199,
        oldPrice: 5199,
        img: "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=2070&auto=format&fit=crop",
        discount: 19,
        tags: ["Futuristic", "Mirror Lens"],
        inStock: true,
        rating: 4.4,
        reviewCount: 156
    },
    {
        id: 23,
        name: "Trail Blazer",
        category: "Sport",
        price: 5499,
        oldPrice: 6799,
        img: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=2073&auto=format&fit=crop",
        discount: 19,
        tags: ["UV400", "Shatterproof"],
        inStock: true,
        rating: 4.8,
        reviewCount: 234
    },
    {
        id: 24,
        name: "Rose Gold",
        category: "Sun",
        price: 4799,
        oldPrice: 5899,
        img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop",
        discount: 18,
        tags: ["UV400", "Rose Tint"],
        inStock: true,
        rating: 4.9,
        reviewCount: 289
    }
];

// Use SharedDataManager if available, otherwise use static productsData
// This allows products added from admin panel to appear on the website
window.productsData = (function() {
    if (typeof SharedDataManager !== 'undefined') {
        return SharedDataManager.getProducts();
    }
    return productsData;
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = productsData;
}
