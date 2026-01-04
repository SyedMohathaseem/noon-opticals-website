/**
 * =============================================
 * Custom Alerts Module
 * Beautiful alert/confirm dialogs matching website theme
 * =============================================
 */

const CustomAlert = {
    // Modal container
    modalContainer: null,
    
    // Initialize the modal system
    init() {
        // Create modal container if it doesn't exist
        if (!document.getElementById('customAlertContainer')) {
            const container = document.createElement('div');
            container.id = 'customAlertContainer';
            container.innerHTML = `
                <div class="custom-alert-overlay"></div>
                <div class="custom-alert-modal">
                    <div class="custom-alert-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <h3 class="custom-alert-title">Alert</h3>
                    <p class="custom-alert-message"></p>
                    <div class="custom-alert-buttons">
                        <button class="custom-alert-btn custom-alert-cancel">Cancel</button>
                        <button class="custom-alert-btn custom-alert-confirm">OK</button>
                    </div>
                </div>
            `;
            document.body.appendChild(container);
            
            // Add styles
            this.addStyles();
            
            // Attach event listeners
            this.attachEvents();
        }
        
        this.modalContainer = document.getElementById('customAlertContainer');
    },
    
    // Add CSS styles
    addStyles() {
        if (document.getElementById('customAlertStyles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'customAlertStyles';
        styles.textContent = `
            #customAlertContainer {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                font-family: 'Poppins', sans-serif;
            }
            
            #customAlertContainer.show {
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .custom-alert-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                animation: fadeIn 0.3s ease;
            }
            
            .custom-alert-modal {
                position: relative;
                background: linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%);
                border: 1px solid rgba(148, 163, 184, 0.2);
                border-radius: 20px;
                padding: 30px 40px;
                max-width: 400px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6),
                            0 0 40px rgba(148, 163, 184, 0.05);
                animation: slideIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
            
            .custom-alert-icon {
                width: 70px;
                height: 70px;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: linear-gradient(145deg, rgba(148, 163, 184, 0.15), rgba(148, 163, 184, 0.05));
                border: 2px solid rgba(148, 163, 184, 0.3);
            }
            
            .custom-alert-icon i {
                font-size: 32px;
                color: #94A3B8;
            }
            
            .custom-alert-icon.success i { color: #4CAF50; }
            .custom-alert-icon.error i { color: #f44336; }
            .custom-alert-icon.warning i { color: #ff9800; }
            .custom-alert-icon.info i { color: #64B5F6; }
            .custom-alert-icon.question i { color: #94A3B8; }
            
            .custom-alert-icon.success {
                border-color: rgba(76, 175, 80, 0.4);
                background: linear-gradient(145deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05));
            }
            
            .custom-alert-icon.error {
                border-color: rgba(244, 67, 54, 0.4);
                background: linear-gradient(145deg, rgba(244, 67, 54, 0.15), rgba(244, 67, 54, 0.05));
            }
            
            .custom-alert-icon.warning {
                border-color: rgba(255, 152, 0, 0.4);
                background: linear-gradient(145deg, rgba(255, 152, 0, 0.15), rgba(255, 152, 0, 0.05));
            }
            
            .custom-alert-icon.info {
                border-color: rgba(100, 181, 246, 0.4);
                background: linear-gradient(145deg, rgba(100, 181, 246, 0.15), rgba(100, 181, 246, 0.05));
            }
            
            .custom-alert-icon.question {
                border-color: rgba(148, 163, 184, 0.4);
                background: linear-gradient(145deg, rgba(148, 163, 184, 0.15), rgba(148, 163, 184, 0.05));
            }
            
            .custom-alert-title {
                color: #fff;
                font-size: 22px;
                font-weight: 600;
                margin-bottom: 12px;
                letter-spacing: 0.5px;
            }
            
            .custom-alert-message {
                color: rgba(255, 255, 255, 0.8);
                font-size: 15px;
                line-height: 1.6;
                margin-bottom: 25px;
                white-space: pre-line;
            }
            
            .custom-alert-buttons {
                display: flex;
                gap: 12px;
                justify-content: center;
            }
            
            .custom-alert-btn {
                padding: 12px 30px;
                border-radius: 50px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
                font-family: 'Poppins', sans-serif;
                letter-spacing: 0.5px;
            }
            
            .custom-alert-confirm {
                background: linear-gradient(135deg, #94A3B8, #64748B);
                color: #1a1a1a;
                box-shadow: 0 4px 15px rgba(148, 163, 184, 0.3);
            }
            
            .custom-alert-confirm:hover {
                background: linear-gradient(135deg, #A8B5C4, #94A3B8);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(148, 163, 184, 0.4);
            }
            
            .custom-alert-cancel {
                background: transparent;
                color: rgba(255, 255, 255, 0.7);
                border: 1px solid rgba(148, 163, 184, 0.3);
            }
            
            .custom-alert-cancel:hover {
                background: rgba(148, 163, 184, 0.1);
                color: #fff;
                border-color: rgba(148, 163, 184, 0.5);
            }
            
            .custom-alert-buttons.single-btn {
                justify-content: center;
            }
            
            .custom-alert-buttons.single-btn .custom-alert-cancel {
                display: none;
            }
            
            /* Animation for closing */
            #customAlertContainer.closing .custom-alert-overlay {
                animation: fadeOut 0.2s ease forwards;
            }
            
            #customAlertContainer.closing .custom-alert-modal {
                animation: slideOut 0.2s ease forwards;
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes slideOut {
                from {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
                to {
                    opacity: 0;
                    transform: scale(0.9) translateY(-20px);
                }
            }
        `;
        document.head.appendChild(styles);
    },
    
    // Attach event listeners
    attachEvents() {
        const container = document.getElementById('customAlertContainer');
        const overlay = container.querySelector('.custom-alert-overlay');
        
        // Close on overlay click (only for alerts, not confirms)
        overlay.addEventListener('click', () => {
            if (container.dataset.type === 'alert') {
                this.close(false);
            }
        });
    },
    
    // Show alert (like alert())
    alert(message, options = {}) {
        return new Promise((resolve) => {
            this.init();
            
            const title = options.title || 'Alert';
            const type = options.type || 'info'; // success, error, warning, info
            const buttonText = options.buttonText || 'OK';
            
            const icons = {
                success: 'fa-check-circle',
                error: 'fa-times-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle',
                question: 'fa-question-circle'
            };
            
            const modal = this.modalContainer.querySelector('.custom-alert-modal');
            const iconDiv = modal.querySelector('.custom-alert-icon');
            const titleEl = modal.querySelector('.custom-alert-title');
            const messageEl = modal.querySelector('.custom-alert-message');
            const buttonsDiv = modal.querySelector('.custom-alert-buttons');
            const confirmBtn = modal.querySelector('.custom-alert-confirm');
            
            // Set content
            iconDiv.className = 'custom-alert-icon ' + type;
            iconDiv.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i>`;
            titleEl.textContent = title;
            messageEl.textContent = message;
            confirmBtn.textContent = buttonText;
            buttonsDiv.className = 'custom-alert-buttons single-btn';
            
            this.modalContainer.dataset.type = 'alert';
            
            // Show modal
            this.modalContainer.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Set up resolve
            this.currentResolve = resolve;
            
            // Focus confirm button
            confirmBtn.focus();
        });
    },
    
    // Show confirm (like confirm())
    confirm(message, options = {}) {
        return new Promise((resolve) => {
            this.init();
            
            const title = options.title || 'Confirm';
            const type = options.type || 'question';
            const confirmText = options.confirmText || 'OK';
            const cancelText = options.cancelText || 'Cancel';
            
            const icons = {
                success: 'fa-check-circle',
                error: 'fa-times-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle',
                question: 'fa-question-circle'
            };
            
            const modal = this.modalContainer.querySelector('.custom-alert-modal');
            const iconDiv = modal.querySelector('.custom-alert-icon');
            const titleEl = modal.querySelector('.custom-alert-title');
            const messageEl = modal.querySelector('.custom-alert-message');
            const buttonsDiv = modal.querySelector('.custom-alert-buttons');
            const confirmBtn = modal.querySelector('.custom-alert-confirm');
            const cancelBtn = modal.querySelector('.custom-alert-cancel');
            
            // Set content
            iconDiv.className = 'custom-alert-icon ' + type;
            iconDiv.innerHTML = `<i class="fas ${icons[type] || icons.question}"></i>`;
            titleEl.textContent = title;
            messageEl.textContent = message;
            confirmBtn.textContent = confirmText;
            cancelBtn.textContent = cancelText;
            buttonsDiv.className = 'custom-alert-buttons';
            
            this.modalContainer.dataset.type = 'confirm';
            
            // Show modal
            this.modalContainer.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Set up resolve
            this.currentResolve = resolve;
            
            // Focus confirm button
            confirmBtn.focus();
        });
    },
    
    // Close modal
    close(result) {
        if (!this.modalContainer) return;
        
        this.modalContainer.classList.add('closing');
        
        setTimeout(() => {
            this.modalContainer.classList.remove('show', 'closing');
            document.body.style.overflow = '';
            
            if (this.currentResolve) {
                this.currentResolve(result);
                this.currentResolve = null;
            }
        }, 200);
    }
};

// Initialize and attach button events
document.addEventListener('DOMContentLoaded', () => {
    CustomAlert.init();
    
    // Attach button click handlers after a short delay to ensure DOM is ready
    setTimeout(() => {
        const container = document.getElementById('customAlertContainer');
        if (container) {
            const confirmBtn = container.querySelector('.custom-alert-confirm');
            const cancelBtn = container.querySelector('.custom-alert-cancel');
            
            confirmBtn.addEventListener('click', () => CustomAlert.close(true));
            cancelBtn.addEventListener('click', () => CustomAlert.close(false));
            
            // Handle escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && container.classList.contains('show')) {
                    CustomAlert.close(false);
                }
            });
        }
    }, 100);
});

// Export for use in other modules
window.CustomAlert = CustomAlert;
