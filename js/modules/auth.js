/**
 * =============================================
 * Authentication Module
 * Handles login/signup with localStorage
 * (Firebase Auth disabled - using local storage)
 * ============================================= 
 */

class AuthManager {
    constructor() {
        this.modal = document.getElementById('authModal');
        this.loginBtn = document.getElementById('loginBtn');
        this.closeBtn = document.getElementById('authClose');
        this.tabs = document.querySelectorAll('.auth-tab');
        this.forms = document.querySelectorAll('.auth-form-container');
        this.scrollPosition = 0;
        this.currentUser = null;
    }

    init() {
        // Initialize Firebase Data Manager for data sync (not auth)
        if (typeof FirebaseDataManager !== 'undefined') {
            FirebaseDataManager.init();
        }

        this.attachEventListeners();
        this.checkExistingLogin();
        this.loadRememberedEmail();
    }

    /**
     * Load remembered email if exists
     */
    loadRememberedEmail() {
        const rememberedEmail = localStorage.getItem('noonOpticals_rememberedEmail');
        const rememberMeChecked = localStorage.getItem('noonOpticals_rememberMe') === 'true';
        
        if (rememberedEmail && rememberMeChecked) {
            const emailInput = document.getElementById('loginEmail');
            const rememberCheckbox = document.getElementById('rememberMe');
            
            if (emailInput) emailInput.value = rememberedEmail;
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }
    }

    /**
     * Check if user is already logged in from localStorage
     */
    checkExistingLogin() {
        const user = this.getUserFromLocalStorage();
        if (user) {
            this.currentUser = user;
            this.updateUIForAuthState(user);
        }
    }

    /**
     * Update UI based on auth state
     */
    updateUIForAuthState(user) {
        const loginBtn = document.getElementById('loginBtn');
        
        if (user) {
            // User is logged in - update button to show user initials
            if (loginBtn) {
                const displayName = user.displayName || user.email.split('@')[0];
                // Get initials from name (e.g., "Mohammed Imran" -> "MI")
                const initials = displayName
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase())
                    .slice(0, 2)  // Max 2 initials
                    .join('');
                loginBtn.innerHTML = `
                    <span class="user-initials">${initials}</span>
                `;
                loginBtn.onclick = () => this.showUserMenu();
            }
        } else {
            // User is logged out - show login button
            if (loginBtn) {
                loginBtn.innerHTML = `
                    <i class="fa-regular fa-user"></i>
                    <span>Login</span>
                `;
                loginBtn.onclick = () => this.openModal();
            }
        }
    }

    /**
     * Show user menu dropdown
     */
    async showUserMenu() {
        // Show user profile modal
        this.showUserProfileModal();
    }

    /**
     * Show user profile modal with account information
     */
    showUserProfileModal() {
        const user = this.currentUser || this.getUserFromLocalStorage();
        if (!user) return;

        // Remove existing profile modal if any
        const existingModal = document.getElementById('userProfileModal');
        if (existingModal) existingModal.remove();

        const displayName = user.displayName || user.email?.split('@')[0] || 'User';
        const email = user.email || 'N/A';
        const provider = user.provider || 'email';
        const photoURL = user.photoURL || null;
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'N/A';

        const providerIcon = provider === 'google' ? 'fa-google' : 
                            provider === 'facebook' ? 'fa-facebook' : 'fa-envelope';
        const providerName = provider === 'google' ? 'Google' : 
                            provider === 'facebook' ? 'Facebook' : 'Email';

        const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

        const modal = document.createElement('div');
        modal.id = 'userProfileModal';
        modal.className = 'user-profile-modal';
        modal.innerHTML = `
            <div class="user-profile-overlay"></div>
            <div class="user-profile-content">
                <button class="user-profile-close">&times;</button>
                <div class="user-profile-header">
                    ${photoURL ? 
                        `<img src="${photoURL}" alt="${displayName}" class="user-profile-avatar">` :
                        `<div class="user-profile-avatar-placeholder">${initials}</div>`
                    }
                    <h2 class="user-profile-name">${displayName}</h2>
                    <p class="user-profile-email">${email}</p>
                </div>
                <div class="user-profile-info">
                    <div class="user-profile-item">
                        <i class="fas ${providerIcon}"></i>
                        <div>
                            <span class="label">Login Method</span>
                            <span class="value">${providerName}</span>
                        </div>
                    </div>
                    <div class="user-profile-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <span class="label">Last Login</span>
                            <span class="value">${lastLogin}</span>
                        </div>
                    </div>
                </div>
                <div class="user-profile-actions">
                    <button class="user-profile-btn logout" id="profileLogoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </div>
        `;

        // Add styles if not already added
        this.addProfileModalStyles();

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Show with animation
        setTimeout(() => modal.classList.add('show'), 10);

        // Event listeners
        const closeBtn = modal.querySelector('.user-profile-close');
        const overlay = modal.querySelector('.user-profile-overlay');
        const logoutBtn = modal.querySelector('#profileLogoutBtn');

        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        logoutBtn.addEventListener('click', async () => {
            closeModal();
            const result = await CustomAlert.confirm('Do you want to logout?', {
                title: 'Logout',
                type: 'question',
                confirmText: 'Logout',
                cancelText: 'Cancel'
            });
            if (result) {
                this.logout();
            }
        });
    }

    /**
     * Add profile modal styles
     */
    addProfileModalStyles() {
        if (document.getElementById('userProfileStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'userProfileStyles';
        styles.textContent = `
            .user-profile-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                font-family: 'Poppins', sans-serif;
            }

            .user-profile-modal.show {
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .user-profile-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                animation: fadeIn 0.3s ease;
            }

            .user-profile-content {
                position: relative;
                background: linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%);
                border: 1px solid rgba(148, 163, 184, 0.2);
                border-radius: 24px;
                padding: 40px;
                max-width: 420px;
                width: 90%;
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

            .user-profile-close {
                position: absolute;
                top: 15px;
                right: 20px;
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                font-size: 28px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .user-profile-close:hover {
                color: #fff;
                transform: rotate(90deg);
            }

            .user-profile-header {
                text-align: center;
                margin-bottom: 30px;
            }

            .user-profile-avatar {
                width: 90px;
                height: 90px;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid rgba(148, 163, 184, 0.3);
                margin-bottom: 15px;
            }

            .user-profile-avatar-placeholder {
                width: 90px;
                height: 90px;
                border-radius: 50%;
                background: linear-gradient(135deg, #94A3B8, #64748B);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                font-weight: 600;
                color: #1a1a1a;
                margin: 0 auto 15px;
            }

            .user-profile-name {
                color: #fff;
                font-size: 24px;
                font-weight: 600;
                margin: 0 0 5px;
            }

            .user-profile-email {
                color: rgba(255, 255, 255, 0.6);
                font-size: 14px;
                margin: 0;
            }

            .user-profile-info {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 25px;
            }

            .user-profile-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 12px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .user-profile-item:last-child {
                border-bottom: none;
            }

            .user-profile-item i {
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(148, 163, 184, 0.1);
                border-radius: 10px;
                color: #94A3B8;
                font-size: 16px;
            }

            .user-profile-item div {
                display: flex;
                flex-direction: column;
            }

            .user-profile-item .label {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .user-profile-item .value {
                font-size: 14px;
                color: #fff;
                font-weight: 500;
            }

            .user-profile-actions {
                display: flex;
                justify-content: center;
            }

            .user-profile-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 14px 40px;
                border-radius: 50px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
                font-family: 'Poppins', sans-serif;
            }

            .user-profile-btn.logout {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: #fff;
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
            }

            .user-profile-btn.logout:hover {
                background: linear-gradient(135deg, #f87171, #ef4444);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
            }
        `;
        document.head.appendChild(styles);
    }

    attachEventListeners() {
        // Open modal
        if (this.loginBtn) {
            this.loginBtn.addEventListener('click', () => {
                if (this.currentUser) {
                    this.showUserMenu();
                } else {
                    this.openModal();
                }
            });
        }

        // Close modal
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Close on outside click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }

        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });

        // Handle form submissions
        const loginFormElement = document.getElementById('loginFormElement');
        if (loginFormElement) {
            loginFormElement.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const signupFormElement = document.querySelector('#signupForm .auth-form');
        if (signupFormElement) {
            signupFormElement.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Fallback: attach to all auth forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e, form));
        });

        // Social auth buttons
        this.attachSocialAuthListeners();

        // Forgot password
        const forgotPasswordLink = document.querySelector('.forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }

        // Password visibility toggle
        this.initPasswordToggle();
    }

    /**
     * Initialize password visibility toggle functionality
     */
    initPasswordToggle() {
        document.querySelectorAll('.password-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = btn.getAttribute('data-target');
                const input = document.getElementById(targetId);
                const icon = btn.querySelector('i');
                
                if (input && icon) {
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                        btn.classList.add('active');
                    } else {
                        input.type = 'password';
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                        btn.classList.remove('active');
                    }
                }
            });
        });
    }

    /**
     * Attach social auth button listeners
     */
    attachSocialAuthListeners() {
        // Google login buttons (both in login and signup forms)
        document.querySelectorAll('.social-btn.google').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleGoogleLogin();
            });
        });

        // Facebook login buttons (both in login and signup forms)
        document.querySelectorAll('.social-btn.facebook').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleFacebookLogin();
            });
        });
    }

    openModal() {
        if (this.modal) {
            this.modal.classList.add('active');

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
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');

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
    }

    switchTab(targetTab) {
        // Update active tab
        this.tabs.forEach(t => t.classList.remove('active'));
        const activeTab = Array.from(this.tabs).find(t => t.getAttribute('data-tab') === targetTab);
        if (activeTab) activeTab.classList.add('active');

        // Show corresponding form
        this.forms.forEach(form => {
            form.classList.remove('active');
            if (form.id === targetTab + 'Form') {
                form.classList.add('active');
            }
        });
    }

    handleSubmit(e, form) {
        e.preventDefault();
        const isLogin = form.closest('#loginForm');

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (isLogin) {
            this.handleLoginData(data);
        } else {
            this.handleSignupData(data);
        }
    }

    /**
     * Handle Email/Password Login
     */
    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const emailInput = form.querySelector('input[name="username"]');
        const passwordInput = form.querySelector('input[name="password"]');
        
        const email = emailInput?.value?.trim();
        const password = passwordInput?.value;

        await this.handleLoginData({ username: email, password: password });
    }

    /**
     * Handle login with data object (localStorage only)
     */
    async handleLoginData(data) {
        const email = data.username?.trim();
        const password = data.password;

        // Validation
        if (!email || !password) {
            CustomAlert.alert('Please enter both email and password.', { title: 'Missing Information', type: 'warning' });
            return;
        }

        // Handle Remember Me
        const rememberMe = document.getElementById('rememberMe')?.checked;
        if (rememberMe) {
            localStorage.setItem('noonOpticals_rememberedEmail', email);
            localStorage.setItem('noonOpticals_rememberMe', 'true');
        } else {
            localStorage.removeItem('noonOpticals_rememberedEmail');
            localStorage.setItem('noonOpticals_rememberMe', 'false');
        }

        // Admin credentials check (supports updated password from admin panel)
        const adminCreds = this.getAdminCredentials();
        if (email === adminCreds.email && password === adminCreds.password) {
            sessionStorage.setItem('isAdmin', 'true');
            sessionStorage.setItem('adminUser', email);
            this.closeModal();
            window.location.href = '/Noon%20Opticals%20Admin%20page/index.html';
            return;
        }

        // Use localStorage based auth
        this.handleLocalLogin(email, password);
    }

    /**
     * Get admin credentials (supports password change from admin panel)
     */
    getAdminCredentials() {
        const saved = localStorage.getItem('noonOpticals_adminCredentials');
        if (saved) {
            return JSON.parse(saved);
        }
        // Default credentials
        return {
            email: 'noon@gmail.com',
            password: 'noon@admin'
        };
    }

    /**
     * Handle Email/Password Signup
     */
    async handleSignup(e) {
        e.preventDefault();
        
        const form = e.target;
        const inputs = form.querySelectorAll('input');
        
        const name = inputs[0]?.value?.trim();
        const email = inputs[1]?.value?.trim();
        const password = inputs[2]?.value;
        const termsAccepted = form.querySelector('input[type="checkbox"]')?.checked;

        await this.handleSignupData({ name, email, password, termsAccepted });
    }

    /**
     * Handle signup with data object (localStorage only)
     */
    async handleSignupData(data) {
        const name = data.name?.trim() || data.fullname?.trim();
        const email = data.email?.trim();
        const password = data.password;
        const termsAccepted = data.termsAccepted ?? true;

        // Validation
        if (!name || !email || !password) {
            CustomAlert.alert('Please fill in all required fields.', { title: 'Missing Information', type: 'warning' });
            return;
        }

        if (!termsAccepted) {
            CustomAlert.alert('Please accept the Terms & Conditions.', { title: 'Terms Required', type: 'warning' });
            return;
        }

        if (password.length < 6) {
            CustomAlert.alert('Password must be at least 6 characters long.', { title: 'Weak Password', type: 'warning' });
            return;
        }

        // Use localStorage based auth
        this.handleLocalSignup(name, email, password);
    }

    /**
     * Handle Google Login using Firebase Auth popup
     */
    async handleGoogleLogin() {
        const auth = typeof getFirebaseAuth === 'function' ? getFirebaseAuth() : null;
        
        if (!auth || typeof firebase === 'undefined') {
            CustomAlert.alert('Google Sign-In is not available. Please try again later.', { title: 'Service Unavailable', type: 'error' });
            return;
        }

        try {
            // Create Google provider
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');
            
            // Show Google account chooser popup
            const result = await auth.signInWithPopup(provider);
            const user = result.user;
            
            console.log('Google login successful:', user.email);
            
            // Save user to localStorage
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                provider: 'google',
                lastLogin: new Date().toISOString()
            };
            localStorage.setItem('noonOpticals_user', JSON.stringify(userData));
            
            // Also save to local users list
            const users = JSON.parse(localStorage.getItem('noonOpticals_localUsers') || '[]');
            const isNewUser = !users.find(u => u.email === user.email);
            if (isNewUser) {
                users.push({
                    id: user.uid,
                    name: user.displayName,
                    email: user.email,
                    provider: 'google',
                    createdAt: new Date().toISOString()
                });
                localStorage.setItem('noonOpticals_localUsers', JSON.stringify(users));
                
                // Send welcome email to new Google users
                try {
                    await this.sendWelcomeEmail(user, user.displayName);
                    console.log('✉️ Welcome email sent to new Google user:', user.email);
                } catch (emailError) {
                    console.warn('Could not send welcome email:', emailError.message);
                }
            }

            // Save user to Firebase Firestore
            await this.saveUserToFirebase(userData);

            this.currentUser = userData;
            this.closeModal();
            CustomAlert.alert('Welcome, ' + user.displayName + '!', { title: 'Login Successful', type: 'success' });
            setTimeout(() => window.location.reload(), 1500);
            
        } catch (error) {
            console.error('Google login error:', error);
            
            if (error.code === 'auth/popup-closed-by-user') {
                // User closed popup - do nothing
                return;
            }
            
            if (error.code === 'auth/unauthorized-domain') {
                CustomAlert.alert('Please add this domain to Firebase authorized domains:\n\nFirebase Console → Authentication → Settings → Authorized domains\n\nAdd: 127.0.0.1', { title: 'Domain Not Authorized', type: 'error' });
                return;
            }
            
            CustomAlert.alert('Google login failed. Please try again.', { title: 'Login Failed', type: 'error' });
        }
    }

    /**
     * Handle Facebook Login using Firebase Auth popup
     */
    async handleFacebookLogin() {
        const auth = typeof getFirebaseAuth === 'function' ? getFirebaseAuth() : null;
        
        if (!auth || typeof firebase === 'undefined') {
            CustomAlert.alert('Facebook Sign-In is not available. Please try again later.', { title: 'Service Unavailable', type: 'error' });
            return;
        }

        try {
            // Create Facebook provider
            const provider = new firebase.auth.FacebookAuthProvider();
            provider.addScope('email');
            provider.addScope('public_profile');
            
            // Show Facebook login popup
            const result = await auth.signInWithPopup(provider);
            const user = result.user;
            
            console.log('Facebook login successful:', user.email);
            
            // Save user to localStorage
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                provider: 'facebook',
                lastLogin: new Date().toISOString()
            };
            localStorage.setItem('noonOpticals_user', JSON.stringify(userData));
            
            // Also save to local users list
            const users = JSON.parse(localStorage.getItem('noonOpticals_localUsers') || '[]');
            if (!users.find(u => u.email === user.email)) {
                users.push({
                    id: user.uid,
                    name: user.displayName,
                    email: user.email,
                    provider: 'facebook',
                    createdAt: new Date().toISOString()
                });
                localStorage.setItem('noonOpticals_localUsers', JSON.stringify(users));
            }

            // Save user to Firebase Firestore
            await this.saveUserToFirebase(userData);

            this.currentUser = userData;
            this.closeModal();
            CustomAlert.alert('Welcome, ' + user.displayName + '!', { title: 'Login Successful', type: 'success' });
            setTimeout(() => window.location.reload(), 1500);
            
        } catch (error) {
            console.error('Facebook login error:', error);
            
            if (error.code === 'auth/popup-closed-by-user') {
                // User closed popup - do nothing
                return;
            }
            
            if (error.code === 'auth/unauthorized-domain') {
                CustomAlert.alert('Please add this domain to Firebase authorized domains:\n\nFirebase Console → Authentication → Settings → Authorized domains\n\nAdd: 127.0.0.1', { title: 'Domain Not Authorized', type: 'error' });
                return;
            }
            
            if (error.code === 'auth/operation-not-allowed') {
                CustomAlert.alert('Facebook login is not enabled.\n\nTo enable:\n1. Go to Firebase Console → Authentication → Sign-in method\n2. Enable Facebook provider\n3. Add your Facebook App ID and Secret', { title: 'Feature Not Enabled', type: 'warning' });
                return;
            }
            
            CustomAlert.alert('Facebook login failed. Please try again.', { title: 'Login Failed', type: 'error' });
        }
    }

    /**
     * Handle Forgot Password - Opens modal to enter email and sends reset link via Firebase
     */
    handleForgotPassword() {
        // Get the email from login form if available
        const loginEmailInput = document.getElementById('loginEmail');
        const prefillEmail = loginEmailInput?.value || '';
        
        // Show forgot password modal
        this.showForgotPasswordModal(prefillEmail);
    }

    /**
     * Show Forgot Password Modal
     */
    showForgotPasswordModal(prefillEmail = '') {
        // Remove existing modal if any
        const existingModal = document.getElementById('forgotPasswordModal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'forgotPasswordModal';
        modal.className = 'forgot-password-modal';
        modal.innerHTML = `
            <div class="forgot-password-overlay"></div>
            <div class="forgot-password-content">
                <button class="forgot-password-close">&times;</button>
                <div class="forgot-password-icon">
                    <i class="fas fa-key"></i>
                </div>
                <h2>Reset Password</h2>
                <p>Enter your email address and we'll send you a link to reset your password.</p>
                <form id="forgotPasswordForm" class="forgot-password-form">
                    <div class="forgot-password-input-group">
                        <i class="fa-solid fa-envelope"></i>
                        <input type="email" id="forgotPasswordEmail" placeholder="Enter your email" value="${prefillEmail}" required>
                    </div>
                    <button type="submit" class="forgot-password-submit" id="forgotPasswordSubmit">
                        <span>Send Reset Link</span>
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </form>
                <div class="forgot-password-back">
                    <a href="#" id="backToLogin">
                        <i class="fa-solid fa-arrow-left"></i>
                        Back to Login
                    </a>
                </div>
            </div>
        `;

        // Add styles
        this.addForgotPasswordStyles();

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Show with animation
        setTimeout(() => modal.classList.add('show'), 10);

        // Focus on email input
        const emailInput = modal.querySelector('#forgotPasswordEmail');
        setTimeout(() => emailInput?.focus(), 300);

        // Event listeners
        const closeBtn = modal.querySelector('.forgot-password-close');
        const overlay = modal.querySelector('.forgot-password-overlay');
        const form = modal.querySelector('#forgotPasswordForm');
        const backToLoginLink = modal.querySelector('#backToLogin');

        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        
        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            
            if (!email) {
                CustomAlert.alert('Please enter your email address.', { title: 'Email Required', type: 'warning' });
                return;
            }

            // Show loading state
            const submitBtn = modal.querySelector('#forgotPasswordSubmit');
            const originalContent = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            try {
                await this.sendPasswordResetEmail(email);
                closeModal();
                CustomAlert.alert(
                    `Password reset email sent to ${email}. Please check your inbox and spam folder.\n\nNote: The email may take a few minutes to arrive.`,
                    { title: 'Email Sent!', type: 'success' }
                );
            } catch (error) {
                submitBtn.innerHTML = originalContent;
                submitBtn.disabled = false;
                
                console.error('Forgot password error:', error);
                
                let errorMessage = 'Failed to send reset email. Please try again.';
                if (error.code === 'auth/user-not-found') {
                    errorMessage = 'No account found with this email address. Please check your email or create a new account.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Please enter a valid email address.';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Too many requests. Please wait a few minutes and try again.';
                } else if (error.code === 'auth/service-unavailable') {
                    errorMessage = 'Password reset service is temporarily unavailable. Please try again later.';
                } else if (error.code === 'auth/network-request-failed') {
                    errorMessage = 'Network error. Please check your internet connection and try again.';
                }
                
                CustomAlert.alert(errorMessage, { title: 'Error', type: 'error' });
            }
        });
    }

    /**
     * Send password reset email via Firebase Auth
     */
    async sendPasswordResetEmail(email) {
        const auth = typeof getFirebaseAuth === 'function' ? getFirebaseAuth() : null;
        const db = typeof getFirebaseDB === 'function' ? getFirebaseDB() : null;
        
        console.log('🔐 Password Reset: Starting for email:', email);
        console.log('🔐 Firebase Auth available:', !!auth);
        console.log('🔐 Firebase DB available:', !!db);
        
        if (!auth) {
            console.error('🔐 Firebase Auth is not initialized!');
            throw { code: 'auth/service-unavailable', message: 'Firebase Auth not available' };
        }

        let userPassword = null;
        let userFound = false;

        // Check Firestore for user and get their password
        if (db) {
            try {
                const docId = email.replace(/\./g, '_').replace(/@/g, '_at_');
                console.log('🔐 Checking Firestore for user:', docId);
                const userDoc = await db.collection('users').doc(docId).get();
                
                if (userDoc.exists) {
                    console.log('🔐 User found in Firestore');
                    userFound = true;
                    const userData = userDoc.data();
                    userPassword = userData.password; // Get password from Firestore
                    console.log('🔐 Password available in Firestore:', !!userPassword);
                }
            } catch (firestoreError) {
                console.warn('🔐 Error checking Firestore:', firestoreError);
            }
        }

        // Also check localStorage for password
        if (!userPassword) {
            const localUsers = JSON.parse(localStorage.getItem('noonOpticals_localUsers') || '[]');
            const localUser = localUsers.find(u => u.email === email);
            if (localUser) {
                console.log('🔐 User found in localStorage');
                userFound = true;
                userPassword = localUser.password;
                console.log('🔐 Password available in localStorage:', !!userPassword);
            }
        }

        if (!userFound) {
            console.log('🔐 User not found anywhere');
            throw { code: 'auth/user-not-found', message: 'No account found with this email' };
        }

        // Try to create user in Firebase Auth if they don't exist there
        if (userPassword) {
            console.log('🔐 Attempting to create/migrate user to Firebase Auth...');
            try {
                await auth.createUserWithEmailAndPassword(email, userPassword);
                console.log('🔐 ✅ User created in Firebase Auth successfully');
            } catch (createError) {
                if (createError.code === 'auth/email-already-in-use') {
                    console.log('🔐 User already exists in Firebase Auth - good!');
                } else if (createError.code === 'auth/weak-password') {
                    console.warn('🔐 Password too weak for Firebase Auth, but will try to send reset anyway');
                } else {
                    console.warn('🔐 Could not create user in Firebase Auth:', createError.code, createError.message);
                }
            }
        }

        // Now send password reset email
        try {
            console.log('🔐 Sending password reset email via Firebase Auth...');
            await auth.sendPasswordResetEmail(email);
            console.log('🔐 ✅ Password reset email sent successfully to:', email);
        } catch (error) {
            console.error('🔐 Firebase sendPasswordResetEmail error:', error.code, error.message);
            
            // If user doesn't exist in Firebase Auth even after trying to create
            if (error.code === 'auth/user-not-found') {
                // User couldn't be created in Firebase Auth - throw appropriate error
                throw { code: 'auth/user-not-found', message: 'Could not send reset email. Please contact support.' };
            }
            throw error;
        }
    }

    /**
     * Check if user is new (first login) and send welcome email if needed
     * This handles users added manually via Firebase Console
     */
    async checkAndSendWelcomeIfNewUser(firebaseUser, displayName) {
        if (!firebaseUser) return false;
        
        const db = typeof getFirebaseDB === 'function' ? getFirebaseDB() : null;
        if (!db) return false;
        
        try {
            const docId = firebaseUser.email.replace(/\./g, '_').replace(/@/g, '_at_');
            const userDoc = await db.collection('users').doc(docId).get();
            
            // If user doesn't exist in Firestore, they're new (added via Firebase Console)
            if (!userDoc.exists) {
                console.log('✉️ New user detected (added via Firebase Console):', firebaseUser.email);
                
                // Send welcome email
                try {
                    await this.sendWelcomeEmail(firebaseUser, displayName);
                    console.log('✉️ Welcome email sent to new user:', firebaseUser.email);
                } catch (emailError) {
                    console.warn('Could not send welcome email:', emailError.message);
                }
                
                return true; // Is new user
            }
            
            // Check if welcome email was already sent
            const userData = userDoc.data();
            if (!userData.welcomeEmailSent) {
                console.log('✉️ User exists but welcome email not sent yet:', firebaseUser.email);
                
                // Send welcome email
                try {
                    await this.sendWelcomeEmail(firebaseUser, displayName);
                    
                    // Mark welcome email as sent
                    await db.collection('users').doc(docId).update({
                        welcomeEmailSent: true,
                        welcomeEmailSentAt: new Date().toISOString()
                    });
                    
                    console.log('✉️ Welcome email sent and marked in Firestore');
                } catch (emailError) {
                    console.warn('Could not send welcome email:', emailError.message);
                }
                
                return true; // First time getting welcome
            }
            
            return false; // Not a new user
            
        } catch (error) {
            console.warn('Error checking if new user:', error);
            return false;
        }
    }

    /**
     * Send welcome email using EmailService
     */
    async sendWelcomeEmail(firebaseUser, displayName) {
        const userEmail = firebaseUser?.email;
        const userName = displayName || firebaseUser?.displayName || userEmail?.split('@')[0] || 'Valued Customer';
        
        if (!userEmail) {
            console.warn('✉️ No email address for welcome email');
            return;
        }

        console.log('✉️ Sending welcome email to:', userEmail);

        // Use EmailService if available
        if (typeof EmailService !== 'undefined' && EmailService.isConfigured()) {
            const result = await EmailService.sendWelcomeEmail(userEmail, userName);
            if (result.success) {
                console.log('✉️ ✅ Welcome email sent via EmailService');
            }
            return;
        }

        // Fallback: Try Firebase email verification
        console.warn('✉️ EmailService not configured, trying Firebase fallback...');
        try {
            const auth = typeof getFirebaseAuth === 'function' ? getFirebaseAuth() : null;
            const user = auth?.currentUser;
            if (user && !user.emailVerified) {
                await user.sendEmailVerification();
                console.log('✉️ Firebase verification email sent as fallback');
            }
        } catch (fbError) {
            console.warn('✉️ Firebase fallback also failed:', fbError.message);
        }
    }

    /**
     * Add Forgot Password Modal Styles
     */
    addForgotPasswordStyles() {
        if (document.getElementById('forgotPasswordStyles')) return;

        const styles = document.createElement('style');
        styles.id = 'forgotPasswordStyles';
        styles.textContent = `
            .forgot-password-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10001;
                font-family: 'Poppins', sans-serif;
            }

            .forgot-password-modal.show {
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .forgot-password-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(10px);
                animation: forgotFadeIn 0.3s ease;
            }

            .forgot-password-content {
                position: relative;
                background: linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%);
                border: 1px solid rgba(148, 163, 184, 0.2);
                border-radius: 24px;
                padding: 40px;
                max-width: 420px;
                width: 90%;
                text-align: center;
                animation: forgotSlideIn 0.3s ease;
            }

            @keyframes forgotFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes forgotSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            .forgot-password-close {
                position: absolute;
                top: 15px;
                right: 20px;
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                font-size: 28px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .forgot-password-close:hover {
                color: #fff;
                transform: rotate(90deg);
            }

            .forgot-password-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: linear-gradient(135deg, rgba(148, 163, 184, 0.2), rgba(148, 163, 184, 0.05));
                border: 2px solid rgba(148, 163, 184, 0.3);
            }

            .forgot-password-icon i {
                font-size: 36px;
                color: #94A3B8;
            }

            .forgot-password-content h2 {
                color: #fff;
                font-size: 24px;
                font-weight: 600;
                margin: 0 0 10px;
            }

            .forgot-password-content p {
                color: rgba(255, 255, 255, 0.6);
                font-size: 14px;
                line-height: 1.6;
                margin: 0 0 25px;
            }

            .forgot-password-form {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .forgot-password-input-group {
                position: relative;
                display: flex;
                align-items: center;
            }

            .forgot-password-input-group i {
                position: absolute;
                left: 15px;
                color: rgba(255, 255, 255, 0.4);
                font-size: 16px;
            }

            .forgot-password-input-group input {
                width: 100%;
                padding: 15px 15px 15px 45px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(148, 163, 184, 0.2);
                border-radius: 12px;
                color: #fff;
                font-size: 15px;
                font-family: 'Poppins', sans-serif;
                transition: all 0.3s ease;
            }

            .forgot-password-input-group input:focus {
                outline: none;
                border-color: rgba(148, 163, 184, 0.5);
                background: rgba(0, 0, 0, 0.4);
            }

            .forgot-password-input-group input::placeholder {
                color: rgba(255, 255, 255, 0.4);
            }

            .forgot-password-submit {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 15px 30px;
                background: linear-gradient(135deg, #94A3B8, #64748B);
                border: none;
                border-radius: 50px;
                color: #1a1a1a;
                font-size: 15px;
                font-weight: 600;
                font-family: 'Poppins', sans-serif;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(148, 163, 184, 0.3);
            }

            .forgot-password-submit:hover:not(:disabled) {
                background: linear-gradient(135deg, #A8B5C4, #94A3B8);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(148, 163, 184, 0.4);
            }

            .forgot-password-submit:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }

            .forgot-password-back {
                margin-top: 20px;
            }

            .forgot-password-back a {
                color: rgba(255, 255, 255, 0.6);
                font-size: 14px;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
            }

            .forgot-password-back a:hover {
                color: #fff;
            }

            .forgot-password-back a i {
                font-size: 12px;
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem('noonOpticals_user');
        sessionStorage.removeItem('isAdmin');
        sessionStorage.removeItem('adminUser');
        this.currentUser = null;
        console.log('User logged out');
        window.location.reload();
    }

    /**
     * Save user to Firebase Firestore
     */
    async saveUserToFirebase(userData, password = null, welcomeEmailSent = false) {
        console.log('Attempting to save user to Firebase:', userData.email);
        
        try {
            // Wait a moment for Firebase to be ready
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const db = typeof getFirebaseDB === 'function' ? getFirebaseDB() : null;
            console.log('Firebase DB instance:', db ? 'Available' : 'Not available');
            
            if (!db) {
                console.warn('Firebase DB not available, user saved to localStorage only');
                return;
            }

            const userDoc = {
                uid: userData.uid,
                email: userData.email,
                displayName: userData.displayName || userData.email.split('@')[0],
                photoURL: userData.photoURL || null,
                provider: userData.provider || 'email',
                lastLogin: userData.lastLogin || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Add password for email/password users (store securely)
            if (password && userData.provider === 'email') {
                userDoc.password = password;
            }

            // Use email as document ID (replace dots and @ for valid Firestore ID)
            const docId = userData.email.replace(/\./g, '_').replace(/@/g, '_at_');
            console.log('Saving to users collection with docId:', docId);
            
            // Check if user already exists in 'users' collection
            const existingDoc = await db.collection('users').doc(docId).get();
            
            if (existingDoc.exists) {
                // Update existing user
                await db.collection('users').doc(docId).update({
                    lastLogin: userDoc.lastLogin,
                    updatedAt: userDoc.updatedAt,
                    provider: userDoc.provider
                });
                console.log('✅ User login updated in Firebase users collection:', userData.email);
            } else {
                // Create new user
                userDoc.createdAt = new Date().toISOString();
                if (welcomeEmailSent) {
                    userDoc.welcomeEmailSent = true;
                    userDoc.welcomeEmailSentAt = new Date().toISOString();
                }
                await db.collection('users').doc(docId).set(userDoc);
                console.log('✅ New user saved to Firebase users collection:', userData.email);
            }
        } catch (error) {
            console.error('❌ Error saving user to Firebase:', error);
            // Don't block login if Firebase save fails
        }
    }

    /**
     * Save user info to localStorage
     */
    saveUserToLocalStorage(user) {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLogin: new Date().toISOString()
        };
        localStorage.setItem('noonOpticals_user', JSON.stringify(userData));
    }

    /**
     * Get user from localStorage
     */
    getUserFromLocalStorage() {
        try {
            const data = localStorage.getItem('noonOpticals_user');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Fallback: Local login (when Firebase is not available)
     */
    async handleLocalLogin(email, password) {
        const auth = typeof getFirebaseAuth === 'function' ? getFirebaseAuth() : null;
        
        // First, try to login with Firebase Auth
        if (auth && typeof firebase !== 'undefined') {
            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const firebaseUser = userCredential.user;
                
                console.log('Firebase Auth login successful:', email);
                
                const userData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || email.split('@')[0],
                    provider: 'email',
                    lastLogin: new Date().toISOString()
                };
                localStorage.setItem('noonOpticals_user', JSON.stringify(userData));
                
                // Check if this is a new user (added via Firebase Console) - send welcome email
                const isNewUser = await this.checkAndSendWelcomeIfNewUser(firebaseUser, userData.displayName);
                
                // Save user login to Firebase Firestore
                await this.saveUserToFirebase(userData, password);
                
                // Update local users list
                let users = JSON.parse(localStorage.getItem('noonOpticals_localUsers') || '[]');
                const existingIndex = users.findIndex(u => u.email === email);
                if (existingIndex >= 0) {
                    users[existingIndex].password = password;
                    users[existingIndex].id = firebaseUser.uid;
                } else {
                    users.push({
                        id: firebaseUser.uid,
                        name: userData.displayName,
                        email: email,
                        password: password,
                        provider: 'email',
                        createdAt: new Date().toISOString()
                    });
                }
                localStorage.setItem('noonOpticals_localUsers', JSON.stringify(users));
                
                // Trigger browser password manager
                this.triggerPasswordManagerSave(email, password);
                
                this.closeModal();
                const welcomeMsg = isNewUser ? 'Welcome to NOON Opticals, ' : 'Welcome back, ';
                CustomAlert.alert(welcomeMsg + userData.displayName + '!', { title: isNewUser ? 'Welcome!' : 'Login Successful', type: 'success' });
                setTimeout(() => window.location.reload(), 1500);
                return;
                
            } catch (firebaseError) {
                console.log('Firebase Auth login error:', firebaseError.code, firebaseError.message);
                
                // If user not found in Firebase Auth, check if they exist locally but were deleted from Firebase
                if (firebaseError.code === 'auth/user-not-found') {
                    // Remove stale local data for this user
                    let users = JSON.parse(localStorage.getItem('noonOpticals_localUsers') || '[]');
                    const staleUser = users.find(u => u.email === email);
                    if (staleUser) {
                        console.log('Removing stale local user data for deleted Firebase user:', email);
                        users = users.filter(u => u.email !== email);
                        localStorage.setItem('noonOpticals_localUsers', JSON.stringify(users));
                        
                        // Also remove from Firestore
                        try {
                            const db = typeof getFirebaseDB === 'function' ? getFirebaseDB() : null;
                            if (db) {
                                const docId = email.replace(/\./g, '_').replace(/@/g, '_at_');
                                await db.collection('users').doc(docId).delete();
                            }
                        } catch (deleteError) {
                            console.warn('Could not delete stale Firestore data:', deleteError);
                        }
                    }
                    CustomAlert.alert('This account has been deleted. Please sign up again.', { title: 'Account Not Found', type: 'warning' });
                    return;
                }
                
                // Wrong password
                if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
                    CustomAlert.alert('Invalid email or password.', { title: 'Login Failed', type: 'error' });
                    return;
                }
                
                // For other errors, fall through to local login
                console.log('Falling back to local login...');
            }
        }
        
        // Check if user exists in Firestore before allowing local login
        const db = typeof getFirebaseDB === 'function' ? getFirebaseDB() : null;
        if (db) {
            try {
                const docId = email.replace(/\./g, '_').replace(/@/g, '_at_');
                const userDoc = await db.collection('users').doc(docId).get();
                
                if (!userDoc.exists) {
                    // User not in Firestore - check if they exist locally (stale data)
                    let users = JSON.parse(localStorage.getItem('noonOpticals_localUsers') || '[]');
                    const staleUser = users.find(u => u.email === email);
                    
                    if (staleUser) {
                        // Remove stale local data
                        console.log('Removing stale local user data (not in Firestore):', email);
                        users = users.filter(u => u.email !== email);
                        localStorage.setItem('noonOpticals_localUsers', JSON.stringify(users));
                    }
                    
                    CustomAlert.alert('This account has been deleted. Please sign up again.', { title: 'Account Not Found', type: 'warning' });
                    return;
                }
            } catch (firestoreError) {
                console.warn('Could not check Firestore for user:', firestoreError);
                // Continue with local login if Firestore check fails
            }
        }
        
        // Fallback: Local login
        const users = JSON.parse(localStorage.getItem('noonOpticals_localUsers') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            const userData = {
                uid: user.id,
                email: user.email,
                displayName: user.name,
                provider: 'email',
                lastLogin: new Date().toISOString()
            };
            localStorage.setItem('noonOpticals_user', JSON.stringify(userData));
            
            // Save user login to Firebase Firestore (with password)
            await this.saveUserToFirebase(userData, password);
            
            // Trigger browser password manager to save/update credentials
            this.triggerPasswordManagerSave(email, password);
            
            this.closeModal();
            CustomAlert.alert('Welcome back, ' + user.name + '!', { title: 'Login Successful', type: 'success' });
            setTimeout(() => window.location.reload(), 1500);
        } else {
            CustomAlert.alert('Invalid email or password.', { title: 'Login Failed', type: 'error' });
        }
    }

    /**
     * Fallback: Local signup (when Firebase is not available)
     */
    async handleLocalSignup(name, email, password) {
        let users = JSON.parse(localStorage.getItem('noonOpticals_localUsers') || '[]');
        
        // Check if user exists locally
        const existingLocalUser = users.find(u => u.email === email);
        
        // Check if user exists in Firestore (to determine if it's truly an existing account)
        let existsInFirestore = false;
        const db = typeof getFirebaseDB === 'function' ? getFirebaseDB() : null;
        if (db) {
            try {
                const docId = email.replace(/\./g, '_').replace(/@/g, '_at_');
                const userDoc = await db.collection('users').doc(docId).get();
                existsInFirestore = userDoc.exists;
                console.log('User exists in Firestore:', existsInFirestore);
            } catch (firestoreError) {
                console.warn('Could not check Firestore:', firestoreError);
            }
        }

        let firebaseUid = null;
        let firebaseUser = null;
        let userExistsInFirebase = false;
        
        // Try to create user in Firebase Auth (for password reset functionality)
        try {
            const auth = typeof getFirebaseAuth === 'function' ? getFirebaseAuth() : null;
            if (auth && typeof firebase !== 'undefined') {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                firebaseUid = userCredential.user.uid;
                firebaseUser = userCredential.user;
                
                // Update display name in Firebase Auth
                await userCredential.user.updateProfile({
                    displayName: name
                });
                
                console.log('User created in Firebase Auth:', email);
                
                // If user was deleted from Firebase but exists locally, remove old local data
                if (existingLocalUser) {
                    console.log('Removing old local user data for:', email);
                    users = users.filter(u => u.email !== email);
                    
                    // Also remove from Firestore if it was stale data
                    if (existsInFirestore) {
                        try {
                            const docId = email.replace(/\./g, '_').replace(/@/g, '_at_');
                            await db.collection('users').doc(docId).delete();
                            console.log('Old Firestore user data deleted');
                        } catch (deleteError) {
                            console.warn('Could not delete old Firestore data:', deleteError);
                        }
                    }
                }
                
                // Send welcome/verification email
                try {
                    await this.sendWelcomeEmail(firebaseUser, name);
                    console.log('✉️ Welcome email sent to:', email);
                } catch (emailError) {
                    console.warn('Could not send welcome email:', emailError.message);
                }
            }
        } catch (firebaseError) {
            console.warn('Firebase Auth signup error:', firebaseError.code, firebaseError.message);
            
            // If email already exists in Firebase Auth, don't allow signup
            if (firebaseError.code === 'auth/email-already-in-use') {
                userExistsInFirebase = true;
                CustomAlert.alert('An account with this email already exists.', { title: 'Email In Use', type: 'warning' });
                return;
            }
            
            // For other Firebase errors, check if user exists in both Firestore AND local (true existing user)
            if (existingLocalUser && existsInFirestore) {
                CustomAlert.alert('An account with this email already exists.', { title: 'Email In Use', type: 'warning' });
                return;
            }
            
            // If user only exists locally but not in Firestore, they were deleted - allow re-signup
            if (existingLocalUser && !existsInFirestore) {
                console.log('User exists locally but not in Firestore - allowing re-signup');
                users = users.filter(u => u.email !== email);
            }
            
            // Continue with local signup if Firebase is just unavailable
        }
        
        const newUser = {
            id: firebaseUid || 'local_' + Date.now(),
            name: name,
            email: email,
            password: password,
            provider: 'email',
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('noonOpticals_localUsers', JSON.stringify(users));
        
        const userData = {
            uid: newUser.id,
            email: newUser.email,
            displayName: newUser.name,
            provider: 'email',
            lastLogin: new Date().toISOString()
        };
        localStorage.setItem('noonOpticals_user', JSON.stringify(userData));
        
        // Save user to Firebase Firestore (with password for email users, mark welcome email as sent)
        await this.saveUserToFirebase(userData, password, true);
        
        // Trigger browser password manager to save credentials
        this.triggerPasswordManagerSave(email, password);
        
        this.closeModal();
        CustomAlert.alert('Account created successfully! Welcome, ' + name + '!', { title: 'Welcome!', type: 'success' });
        setTimeout(() => window.location.reload(), 1500);
    }

    /**
     * Trigger browser's password manager to save credentials
     */
    triggerPasswordManagerSave(email, password) {
        // Create a hidden form and submit it to trigger password manager
        const form = document.createElement('form');
        form.style.display = 'none';
        form.method = 'POST';
        form.action = window.location.href;
        
        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.name = 'email';
        emailInput.autocomplete = 'email';
        emailInput.value = email;
        
        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.name = 'password';
        passwordInput.autocomplete = 'new-password';
        passwordInput.value = password;
        
        form.appendChild(emailInput);
        form.appendChild(passwordInput);
        document.body.appendChild(form);
        
        // Use PasswordCredential API if available (Chrome)
        if (window.PasswordCredential) {
            const credential = new PasswordCredential({
                id: email,
                password: password,
                name: email
            });
            navigator.credentials.store(credential).then(() => {
                console.log('Credentials saved to password manager');
            }).catch(err => {
                console.log('Password manager save skipped:', err);
            });
        }
        
        // Remove the hidden form
        setTimeout(() => form.remove(), 100);
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.currentUser !== null || this.getUserFromLocalStorage() !== null;
    }

    /**
     * Get current user data
     */
    getCurrentUserData() {
        if (this.currentUser) {
            return {
                uid: this.currentUser.uid,
                email: this.currentUser.email,
                displayName: this.currentUser.displayName,
                photoURL: this.currentUser.photoURL
            };
        }
        return this.getUserFromLocalStorage();
    }
}

// Initialize auth manager
let authManager;
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
    authManager.init();
});

// Export for global access
window.AuthManager = AuthManager;
window.getAuthManager = () => authManager;
