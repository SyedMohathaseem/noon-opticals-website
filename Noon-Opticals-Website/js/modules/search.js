/**
 * Search Module - Professional Search Functionality
 */

class SearchManager {
    constructor() {
        // Desktop search elements
        this.searchInput = document.getElementById('searchInput');
        this.voiceBtn = document.getElementById('voiceSearchBtn');
        this.clearBtn = document.querySelector('.search-container .search-clear-btn');
        
        // Mobile search elements
        this.mobileSearchInput = document.querySelector('.mobile-search-input');
        this.mobileVoiceBtn = document.querySelector('.mobile-voice-btn');
        this.mobileClearBtn = document.querySelector('.mobile-clear-btn');
        
        this.recognition = null;
        this.isListening = false;
        this.originalDisplayStates = new Map();
        this.activeInput = null; // Track which input triggered voice search
        
        this.initVoiceRecognition();
    }

    init() {
        // Desktop search handlers
        this.setupSearchInput(this.searchInput, this.clearBtn);
        this.setupVoiceButton(this.voiceBtn, this.searchInput, this.clearBtn);
        this.setupClearButton(this.clearBtn, this.searchInput);
        
        // Mobile search handlers
        this.setupSearchInput(this.mobileSearchInput, this.mobileClearBtn);
        this.setupVoiceButton(this.mobileVoiceBtn, this.mobileSearchInput, this.mobileClearBtn);
        this.setupClearButton(this.mobileClearBtn, this.mobileSearchInput);
        
        // Sync inputs
        this.syncInputs();
    }

    setupSearchInput(input, clearBtn) {
        if (!input) return;
        
        // Debounce timer for real-time search
        let debounceTimer = null;
        
        input.addEventListener('input', () => {
            this.updateClearButton(input, clearBtn);
            
            // Real-time search with debouncing (waits 300ms after user stops typing)
            clearTimeout(debounceTimer);
            const value = input.value.trim();
            
            if (value.length === 0) {
                // Clear search - reset products
                this.resetProducts();
            } else if (value.length >= 2) {
                // Only search with 2+ characters for performance
                debounceTimer = setTimeout(() => {
                    this.performSearch(value);
                }, 300);
            }
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(debounceTimer); // Cancel debounced search
                const value = input.value.trim();
                if (value.length > 0) {
                    this.performSearch(value);
                }
            }
        });
    }

    setupVoiceButton(btn, input, clearBtn) {
        if (!btn) return;
        
        btn.addEventListener('click', () => {
            this.activeInput = input;
            this.activeClearBtn = clearBtn;
            this.toggleVoiceSearch(btn, input);
        });
    }

    setupClearButton(clearBtn, input) {
        if (!clearBtn) return;
        
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.clearSearch(input, clearBtn);
        });
    }

    syncInputs() {
        // Sync desktop to mobile
        if (this.searchInput && this.mobileSearchInput) {
            this.searchInput.addEventListener('input', () => {
                this.mobileSearchInput.value = this.searchInput.value;
                this.updateClearButton(this.mobileSearchInput, this.mobileClearBtn);
            });
            
            this.mobileSearchInput.addEventListener('input', () => {
                this.searchInput.value = this.mobileSearchInput.value;
                this.updateClearButton(this.searchInput, this.clearBtn);
            });
        }
    }

    initVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            if (this.voiceBtn) this.voiceBtn.style.display = 'none';
            if (this.mobileVoiceBtn) this.mobileVoiceBtn.style.display = 'none';
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            if (this.voiceBtn) this.voiceBtn.classList.add('listening');
            if (this.mobileVoiceBtn) this.mobileVoiceBtn.classList.add('listening');
            if (this.searchInput) this.searchInput.placeholder = 'Listening...';
            if (this.mobileSearchInput) this.mobileSearchInput.placeholder = 'Listening...';
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            if (transcript) {
                // Update both inputs
                if (this.searchInput) {
                    this.searchInput.value = transcript;
                    this.updateClearButton(this.searchInput, this.clearBtn);
                }
                if (this.mobileSearchInput) {
                    this.mobileSearchInput.value = transcript;
                    this.updateClearButton(this.mobileSearchInput, this.mobileClearBtn);
                }
                this.performSearch(transcript);
            }
        };

        this.recognition.onerror = () => {
            this.stopListening();
        };

        this.recognition.onend = () => {
            this.stopListening();
        };
    }

    toggleVoiceSearch(btn, input) {
        if (!this.recognition) return;

        if (this.isListening) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (e) {}
        }
    }

    stopListening() {
        this.isListening = false;
        if (this.voiceBtn) this.voiceBtn.classList.remove('listening');
        if (this.mobileVoiceBtn) this.mobileVoiceBtn.classList.remove('listening');
        if (this.searchInput) this.searchInput.placeholder = 'Search eyewear...';
        if (this.mobileSearchInput) this.mobileSearchInput.placeholder = 'Search eyewear...';
    }

    updateClearButton(input, clearBtn) {
        if (clearBtn && input) {
            clearBtn.style.display = input.value.trim().length > 0 ? 'flex' : 'none';
        }
    }

    clearSearch(input, clearBtn) {
        if (input) {
            input.value = '';
            this.updateClearButton(input, clearBtn);
        }
        // Clear both inputs
        if (this.searchInput) {
            this.searchInput.value = '';
            this.updateClearButton(this.searchInput, this.clearBtn);
        }
        if (this.mobileSearchInput) {
            this.mobileSearchInput.value = '';
            this.updateClearButton(this.mobileSearchInput, this.mobileClearBtn);
        }
        this.resetProducts();
    }

    resetProducts() {
        const productCards = document.querySelectorAll('.luxury-product-card');
        
        // Remove search highlight
        productCards.forEach(card => {
            card.classList.remove('search-found');
        });

        // Restore original display states
        this.originalDisplayStates.forEach((display, card) => {
            card.style.display = display;
        });
        this.originalDisplayStates.clear();
        
        // Refresh products to ensure latest data is shown
        if (window.productManager) {
            window.productManager.refreshProducts();
        }
    }

    /**
     * Get products from SharedDataManager (latest data including admin updates)
     */
    getLatestProducts() {
        if (typeof SharedDataManager !== 'undefined') {
            return SharedDataManager.getProducts();
        }
        return window.productsData || [];
    }

    performSearch(query) {
        if (!query || query.trim().length === 0) return;
        
        const searchTerm = query.toLowerCase().trim();
        
        // First, refresh products to ensure we have latest data from admin
        if (window.productManager) {
            window.productManager.refreshProducts();
        }
        
        // Wait a bit for DOM to update after refresh
        setTimeout(() => {
            this.executeSearch(searchTerm);
        }, 100);
    }
    
    executeSearch(searchTerm) {
        const productCards = document.querySelectorAll('.luxury-product-card');
        let matchedCard = null;
        let bestScore = 0;

        // Save original display states and reset highlights
        productCards.forEach(card => {
            if (!this.originalDisplayStates.has(card)) {
                this.originalDisplayStates.set(card, card.style.display);
            }
            card.classList.remove('search-found');
        });
        
        // Also search in product data (for products that might not be rendered yet)
        const products = this.getLatestProducts();
        let bestProductMatch = null;
        let bestProductScore = 0;
        
        products.forEach(product => {
            const name = product.name.toLowerCase();
            const category = (product.category || '').toLowerCase();
            const brand = (product.brand || '').toLowerCase();
            const tags = (product.tags || []).join(' ').toLowerCase();
            
            let score = 0;
            
            // Exact name match
            if (name === searchTerm) {
                score = 100;
            } else if (name.includes(searchTerm)) {
                score = 60;
            } else {
                // Check each word
                const searchWords = searchTerm.split(' ');
                searchWords.forEach(word => {
                    if (word.length > 1) {
                        if (name.includes(word)) score += 30;
                        if (category.includes(word)) score += 20;
                        if (brand.includes(word)) score += 15;
                        if (tags.includes(word)) score += 10;
                    }
                });
            }
            
            // Category/brand match
            if (category.includes(searchTerm)) score += 15;
            if (brand.includes(searchTerm)) score += 15;
            
            if (score > bestProductScore) {
                bestProductScore = score;
                bestProductMatch = product;
            }
        });

        // Find the best matching product card in DOM
        productCards.forEach(card => {
            const name = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
            const category = card.querySelector('.card-category')?.textContent.toLowerCase() || '';
            
            let score = 0;
            
            // Exact match
            if (name === searchTerm) {
                score = 100;
            } else if (name.includes(searchTerm)) {
                score = 60;
            } else {
                // Check each word
                const searchWords = searchTerm.split(' ');
                searchWords.forEach(word => {
                    if (word.length > 1 && name.includes(word)) {
                        score += 25;
                    }
                });
            }
            
            // Category match
            if (category.includes(searchTerm)) {
                score += 15;
            }

            if (score > bestScore) {
                bestScore = score;
                matchedCard = card;
            }
        });

        if (matchedCard && bestScore > 0) {
            // Hide ALL products except the matched one
            productCards.forEach(card => {
                if (card === matchedCard) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });

            // Scroll to shop section
            const shopSection = document.getElementById('shop');
            if (shopSection) {
                shopSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            // Scroll to product and highlight
            setTimeout(() => {
                matchedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                matchedCard.classList.add('search-found');
                
                const productName = matchedCard.querySelector('.card-title')?.textContent || 'Product';
                this.showNotification('Found: ' + productName);

                // Remove highlight after 6 seconds
                setTimeout(() => {
                    matchedCard.classList.remove('search-found');
                }, 6000);
            }, 500);
        } else if (bestProductMatch && bestProductScore > 0) {
            // Product found in data but not visible in DOM - show it
            this.showProductFromData(bestProductMatch);
        } else {
            this.showNotification('No product found. Try different keywords.');
        }
    }
    
    /**
     * Show a product that was found in data but not visible in DOM
     */
    showProductFromData(product) {
        // Apply 'all' filter to show all products
        if (window.productManager) {
            window.productManager.currentFilter = 'all';
            window.productManager.allProductsVisible = true;
            window.productManager.renderProducts();
            
            // Wait for render then find and highlight the card
            setTimeout(() => {
                const productCards = document.querySelectorAll('.luxury-product-card');
                productCards.forEach(card => {
                    const name = card.querySelector('.card-title')?.textContent || '';
                    if (name.toLowerCase() === product.name.toLowerCase()) {
                        // Hide other products
                        productCards.forEach(c => {
                            if (c !== card) c.style.display = 'none';
                        });
                        card.style.display = '';
                        
                        // Scroll to shop section
                        const shopSection = document.getElementById('shop');
                        if (shopSection) {
                            shopSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                        
                        setTimeout(() => {
                            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            card.classList.add('search-found');
                            this.showNotification('Found: ' + product.name);
                            
                            setTimeout(() => {
                                card.classList.remove('search-found');
                            }, 6000);
                        }, 500);
                    }
                });
            }, 200);
        } else {
            this.showNotification('Found: ' + product.name + ' - Scroll to shop section to see it.');
        }
    }

    showNotification(message) {
        const existing = document.querySelector('.search-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'search-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const searchManager = new SearchManager();
    searchManager.init();
});
