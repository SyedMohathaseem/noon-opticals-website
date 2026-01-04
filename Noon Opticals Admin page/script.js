// ============== CUSTOM ALERT SYSTEM ==============
// Beautiful custom alert that matches admin panel design
const AdminAlert = {
    show(message, options = {}) {
        return new Promise((resolve) => {
            const title = options.title || 'Notice';
            const type = options.type || 'info'; // info, success, warning, error
            
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'admin-alert-overlay';
            overlay.innerHTML = `
                <div class="admin-alert-dialog">
                    <div class="admin-alert-icon ${type}">
                        <i class="fas ${this.getIcon(type)}"></i>
                    </div>
                    <h3 class="admin-alert-title">${title}</h3>
                    <p class="admin-alert-message">${message}</p>
                    <button class="admin-alert-btn ${type}">
                        <i class="fas fa-check"></i> OK
                    </button>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Animate in
            requestAnimationFrame(() => {
                overlay.classList.add('active');
            });
            
            // Handle close
            const closeAlert = () => {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
                resolve(true);
            };
            
            overlay.querySelector('.admin-alert-btn').addEventListener('click', closeAlert);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeAlert();
            });
            
            // Close on Escape
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    closeAlert();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        });
    },
    
    getIcon(type) {
        const icons = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        };
        return icons[type] || icons.info;
    },
    
    // Shorthand methods
    info(message, title = 'Information') {
        return this.show(message, { title, type: 'info' });
    },
    success(message, title = 'Success') {
        return this.show(message, { title, type: 'success' });
    },
    warning(message, title = 'Warning') {
        return this.show(message, { title, type: 'warning' });
    },
    error(message, title = 'Error') {
        return this.show(message, { title, type: 'error' });
    }
};

// Make globally available
window.AdminAlert = AdminAlert;

// ============== MOBILE SIDEBAR TOGGLE ==============
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Close sidebar when clicking on nav link (mobile)
document.addEventListener('click', function(e) {
    if (e.target.closest('.nav-link') && window.innerWidth <= 767) {
        closeMobileSidebar();
    }
});

// Close sidebar on window resize if larger than mobile
window.addEventListener('resize', function() {
    if (window.innerWidth > 767) {
        closeMobileSidebar();
    }
});

// ============== PASSWORD VISIBILITY TOGGLE ==============
function initPasswordToggle() {
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (input && icon) {
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                    this.classList.add('active');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                    this.classList.remove('active');
                }
            }
        });
    });
}

// Initialize password toggle on page load
document.addEventListener('DOMContentLoaded', function() {
    initPasswordToggle();
});

// ============== SESSION VERIFICATION ==============
// Check if user is logged in as admin
(function checkAdminSession() {
    const isAdmin = sessionStorage.getItem('isAdmin');
    if (!isAdmin || isAdmin !== 'true') {
        // Show custom access denied overlay instead of native alert
        const overlay = document.getElementById('accessDeniedOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        } else {
            // Fallback redirect if overlay not found
            window.location.href = '../index.html';
        }
    }
})();

// ============== DATA (Now using SharedDataManager) ==============
// Initialize SharedDataManager
if (typeof SharedDataManager !== 'undefined') {
    SharedDataManager.init();
}

// Get data from SharedDataManager or use defaults
function getProducts() {
    if (typeof SharedDataManager !== 'undefined') {
        return SharedDataManager.getProducts().map(p => ({
            id: p.id,
            name: p.name,
            category: getCategoryKey(p.category),
            brand: p.brand || 'noon',
            price: p.price,
            stock: p.stock !== undefined ? p.stock : (p.inStock ? 50 : 0),
            badge: p.discount > 20 ? 'sale' : (p.rating >= 4.5 ? 'bestseller' : null),
            image: p.img,
            description: p.description || '',
            tags: p.tags || ['New Arrival'],
            discount: p.discount || 0,
            rating: p.rating || 4.5,
            sku: p.sku || ''
        }));
    }
    return sampleProducts;
}

function getOrders() {
    // Get orders from localStorage (synced from Firebase)
    let orders = [];
    
    const localOrders = JSON.parse(localStorage.getItem('noonOpticals_orders') || '[]');
    
    if (localOrders.length > 0) {
        orders = localOrders.map(o => ({
            id: o.id,
            date: o.date || new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            customer: o.customer || {
                name: o.userName || 'Unknown',
                email: o.userEmail || 'N/A',
                initials: (o.userName || 'NA').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            },
            product: o.products ? o.products.map(p => `${p.name} x${p.quantity || p.qty || 1}`).join(', ') : 
                     (o.items ? o.items.map(i => `${i.name} x${i.qty || 1}`).join(', ') : 'N/A'),
            amount: o.amount || o.total || 0,
            payment: o.payment || 'pending',
            status: o.status || 'pending'
        }));
    } else if (typeof SharedDataManager !== 'undefined') {
        const sharedOrders = SharedDataManager.getOrders();
        if (sharedOrders && sharedOrders.length > 0) {
            orders = sharedOrders.map(o => ({
                id: o.id,
                date: o.date || new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                customer: o.customer || {
                    name: o.userName || 'Unknown',
                    email: o.userEmail || 'N/A',
                    initials: 'NA'
                },
                product: o.products ? o.products.map(p => `${p.name} x${p.quantity || p.qty || 1}`).join(', ') : 'N/A',
                amount: o.amount || o.total || 0,
                payment: o.payment || 'pending',
                status: o.status || 'pending'
            }));
        }
    }
    
    // Sort by date (newest first)
    if (orders.length > 0) {
        orders.sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB - dateA;
        });
    }
    
    // Update sampleOrders for other functions that reference it
    sampleOrders = orders;
    
    return orders;
}

function getCustomers() {
    // Get customers from Firebase users collection (synced to localStorage)
    const users = JSON.parse(localStorage.getItem('noonOpticals_localUsers') || '[]');
    
    let customers = [];
    
    if (users.length > 0) {
        customers = users.map((u, index) => ({
            id: index + 1,
            name: u.displayName || u.name || (u.email ? u.email.split('@')[0] : 'Unknown'),
            email: u.email || 'N/A',
            phone: u.phone || 'N/A',
            orders: u.orders || 0,
            spent: u.totalSpent || 0,
            status: (u.orders || 0) >= 5 ? 'vip' : 'active',
            provider: u.provider || 'email',
            photoURL: u.photoURL || null,
            createdAt: u.createdAt,
            lastLogin: u.lastLogin
        }));
    } else if (typeof SharedDataManager !== 'undefined') {
        const sharedCustomers = SharedDataManager.getCustomers();
        if (sharedCustomers && sharedCustomers.length > 0) {
            customers = sharedCustomers;
        }
    }
    
    // Update sampleCustomers for other functions that reference it
    sampleCustomers = customers;
    
    return customers;
}

function getAppointments() {
    // Get appointments from localStorage (synced from Firebase)
    const localAppointments = JSON.parse(localStorage.getItem('noonOpticals_appointments') || '[]');
    
    if (localAppointments.length > 0) {
        sampleAppointments = localAppointments;
        return localAppointments;
    }
    
    if (typeof SharedDataManager !== 'undefined') {
        const sharedAppointments = SharedDataManager.getAppointments();
        if (sharedAppointments && sharedAppointments.length > 0) {
            sampleAppointments = sharedAppointments;
            return sharedAppointments;
        }
    }
    
    return [];
}

function getActivityLog() {
    if (typeof SharedDataManager !== 'undefined') {
        const log = SharedDataManager.getActivityLog();
        return log.map(entry => ({
            action: entry.action,
            time: formatTimeAgo(entry.time)
        }));
    }
    return activityLog;
}

// Helper function to convert category names
function getCategoryKey(category) {
    const categoryMap = {
        'Sport': 'eyeglasses',
        'Reading': 'eyeglasses',
        'Sun': 'sunglasses',
        'Blue Light': 'eyeglasses',
        'Fashion': 'eyeglasses',
        'eyeglasses': 'eyeglasses',
        'sunglasses': 'sunglasses',
        'lenses': 'lenses',
        'accessories': 'accessories'
    };
    return categoryMap[category] || 'eyeglasses';
}

// Helper function to format time ago
function formatTimeAgo(isoTime) {
    if (!isoTime) return 'Just now';
    const now = new Date();
    const time = new Date(isoTime);
    const diff = Math.floor((now - time) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return time.toLocaleDateString();
}

// Legacy sample data (fallback)
let sampleProducts = [
    { id: 1, name: 'Ray-Ban Aviator Classic', category: 'eyeglasses', brand: 'rayban', price: 8500, stock: 45, badge: 'bestseller' },
    { id: 2, name: 'Oakley Holbrook XL', category: 'sunglasses', brand: 'oakley', price: 12000, stock: 28, badge: 'new' },
    { id: 3, name: 'Acuvue Oasys Pack', category: 'lenses', brand: 'acuvue', price: 2500, stock: 8, badge: null },
    { id: 4, name: 'Titan Eyeplus Premium', category: 'eyeglasses', brand: 'titan', price: 4200, stock: 62, badge: 'sale' },
    { id: 5, name: 'Carrera Grand Prix 2', category: 'sunglasses', brand: 'carrera', price: 15800, stock: 0, badge: null },
    { id: 6, name: 'Vogue VO5370S', category: 'eyeglasses', brand: 'vogue', price: 6800, stock: 34, badge: 'bestseller' },
    { id: 7, name: 'Ray-Ban Wayfarer', category: 'sunglasses', brand: 'rayban', price: 9500, stock: 52, badge: 'bestseller' },
    { id: 8, name: 'Bausch & Lomb SofLens', category: 'lenses', brand: 'bausch', price: 1800, stock: 120, badge: null }
];

// Empty arrays - data syncs from localStorage/Firebase only
let sampleOrders = [];

let sampleCustomers = [];

let sampleAppointments = [];

let activityLog = [];

// ============== BADGE TRACKING SYSTEM ==============
const BADGE_TRACKING_KEY = 'noonOpticals_badgeTracking';

function getBadgeTracking() {
    const saved = localStorage.getItem(BADGE_TRACKING_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        lastSeenOrders: [],
        lastSeenCustomers: [],
        lastSeenAppointments: [],
        lastSeenNotifications: []
    };
}

function saveBadgeTracking(tracking) {
    localStorage.setItem(BADGE_TRACKING_KEY, JSON.stringify(tracking));
}

function markSectionAsRead(section) {
    const tracking = getBadgeTracking();
    
    switch(section) {
        case 'orders':
            const orders = getOrders();
            tracking.lastSeenOrders = orders.map(o => o.id);
            break;
        case 'customers':
            const customers = getCustomers();
            tracking.lastSeenCustomers = customers.map(c => c.id);
            break;
        case 'appointments':
            const appointments = getAppointments();
            tracking.lastSeenAppointments = appointments.map(a => a.id);
            break;
        case 'notifications':
            const notifications = getNotifications();
            tracking.lastSeenNotifications = notifications.map(n => n.id);
            break;
    }
    
    saveBadgeTracking(tracking);
    updateAllBadges();
}

function getNewItemsCount(section) {
    const tracking = getBadgeTracking();
    
    switch(section) {
        case 'orders':
            const orders = getOrders();
            const newOrders = orders.filter(o => !tracking.lastSeenOrders.includes(o.id));
            return newOrders.length;
        case 'customers':
            const customers = getCustomers();
            const newCustomers = customers.filter(c => !tracking.lastSeenCustomers.includes(c.id));
            return newCustomers.length;
        case 'appointments':
            const appointments = getAppointments();
            const newAppointments = appointments.filter(a => !tracking.lastSeenAppointments.includes(a.id));
            return newAppointments.length;
        case 'notifications':
            const notifications = getNotifications();
            const newNotifications = notifications.filter(n => !tracking.lastSeenNotifications.includes(n.id));
            return newNotifications.length;
        default:
            return 0;
    }
}

function updateAllBadges() {
    // Update sidebar badges
    const ordersBadge = document.querySelector('[data-section="orders"]')?.querySelector('.badge');
    const customersBadge = document.querySelector('[data-section="customers"]')?.querySelector('.badge');
    const appointmentsBadge = document.querySelector('[data-section="appointments"]')?.querySelector('.badge');
    const notificationsBadge = document.querySelector('.notification-badge-count-sidebar');
    
    const newOrdersCount = getNewItemsCount('orders');
    const newCustomersCount = getNewItemsCount('customers');
    const newAppointmentsCount = getNewItemsCount('appointments');
    const newNotificationsCount = getNewItemsCount('notifications');
    
    // Orders badge
    if (ordersBadge) {
        ordersBadge.textContent = newOrdersCount;
        ordersBadge.style.display = newOrdersCount > 0 ? 'inline-flex' : 'none';
    }
    
    // Customers badge
    if (customersBadge) {
        customersBadge.textContent = newCustomersCount;
        customersBadge.style.display = newCustomersCount > 0 ? 'inline-flex' : 'none';
    }
    
    // Appointments badge
    if (appointmentsBadge) {
        appointmentsBadge.textContent = newAppointmentsCount;
        appointmentsBadge.style.display = newAppointmentsCount > 0 ? 'inline-flex' : 'none';
    }
    
    // Notifications sidebar badge
    if (notificationsBadge) {
        notificationsBadge.textContent = newNotificationsCount;
        notificationsBadge.style.display = newNotificationsCount > 0 ? 'inline-flex' : 'none';
    }
    
    // Header notification badge
    const headerNotifBadge = document.querySelector('.notification-badge-count');
    if (headerNotifBadge) {
        headerNotifBadge.textContent = newNotificationsCount > 0 ? newNotificationsCount + ' New' : '0';
    }
    
    // Notification dot
    const notifDot = document.querySelector('.notification-dot');
    if (notifDot) {
        notifDot.style.display = newNotificationsCount > 0 ? 'block' : 'none';
    }
}

// ============== NAVIGATION ==============
function navigateTo(section) {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-section="${section}"]`)?.parentElement.classList.add('active');
    
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => {
        sec.classList.remove('active');
        sec.style.opacity = '0';
    });
    
    const activeSection = document.getElementById(section);
    if (activeSection) {
        activeSection.classList.add('active');
        setTimeout(() => {
            activeSection.style.opacity = '1';
            activeSection.style.transition = 'opacity 0.3s ease-in-out';
        }, 10);
    }
    
    // Mark section as read when navigating to it
    if (['orders', 'customers', 'appointments', 'notifications'].includes(section)) {
        markSectionAsRead(section);
    }
    
    // Close sidebar on mobile/tablet (using 992px to match CSS breakpoint)
    if (window.innerWidth <= 992) {
        if (typeof closeMobileSidebar === 'function') {
            closeMobileSidebar();
        } else {
            document.getElementById('sidebar')?.classList.remove('active');
            document.getElementById('sidebarOverlay')?.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.section);
    });
});

document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    if (window.innerWidth <= 992 && sidebar && sidebar.classList.contains('active') && !sidebar.contains(e.target) && !menuToggle?.contains(e.target)) {
        closeMobileSidebar();
    }
});

// ============== CHARTS ==============
let salesChart, categoryChart, revenueChart, customerGrowthChart, regionChart;

// Helper functions to get real-time analytics data
function getSalesDataByDay() {
    const orders = getOrders();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [0, 0, 0, 0, 0, 0, 0];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    orders.forEach(order => {
        try {
            const dateStr = order.date; // Format expected: YYYY-MM-DD
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                const dayIndex = date.getDay(); // 0 is Sunday
                // Shift so Mon is first for chart display
                const chartIndex = dayIndex === 0 ? 6 : dayIndex - 1;
                data[chartIndex] += (order.amount || 0);
            }
        } catch (e) {}
    });
    
    // If no real data, use samples
    if (data.every(v => v === 0)) {
        return { labels, data: [12000, 19000, 15000, 25000, 22000, 30000, 28000] };
    }
    
    return { labels, data };
}

function getCategoryData() {
    const products = getProducts();
    const categories = { 'eyeglasses': 0, 'sunglasses': 0, 'contact lenses': 0, 'accessories': 0 };
    
    products.forEach(p => {
        const cat = p.category ? p.category.toLowerCase() : '';
        if (categories.hasOwnProperty(cat)) categories[cat]++;
        else categories['accessories']++;
    });
    
    const labels = Object.keys(categories).map(c => c.charAt(0).toUpperCase() + c.slice(1));
    const data = Object.values(categories);
    
    // If no real data, use samples
    if (data.every(v => v === 0)) {
        return { labels, data: [45, 30, 15, 10] };
    }
    
    return { labels, data };
}

function getMonthlyRevenue() {
    const orders = getOrders();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = new Array(12).fill(0);
    
    orders.forEach(order => {
        try {
            const date = new Date(order.date);
            if (!isNaN(date.getTime())) {
                const month = date.getMonth();
                data[month] += (order.amount || 0);
            }
        } catch (e) {}
    });
    
    // Filter to last 12 months with activity or just show all
    if (data.every(v => v === 0)) {
        return { labels: months, data: [350000, 420000, 380000, 450000, 520000, 480000, 510000, 490000, 550000, 620000, 580000, 680000] };
    }
    
    return { labels: months, data };
}

function getCustomerGrowthData() {
    const customers = getCustomers();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const count = customers.length;
    
    if (count === 0) return { labels: months, data: [800, 920, 1050, 1100, 1180, 1248] };
    
    // Simple distribution for visual
    const step = Math.floor(count / 6);
    return { labels: months, data: [count - step*5, count - step*4, count - step*3, count - step*2, count - step, count] };
}

function getRegionData() {
    const orders = getOrders();
    const regions = {};
    
    orders.forEach(o => {
        if (o.customer && o.customer.city) {
            regions[o.customer.city] = (regions[o.customer.city] || 0) + 1;
        }
    });
    
    const labels = Object.keys(regions).slice(0, 5);
    const data = labels.map(l => regions[l]);
    
    if (labels.length === 0) {
        return { labels: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Others'], data: [35, 25, 20, 12, 8] };
    }
    
    return { labels, data };
}

function refreshCharts() {
    if (!salesChart && !categoryChart) return;
    
    console.log('🔄 Refreshing analytics charts with real-time data...');
    
    const salesData = getSalesDataByDay();
    const catData = getCategoryData();
    const revData = getMonthlyRevenue();
    const growthData = getCustomerGrowthData();
    const regData = getRegionData();
    
    if (salesChart) {
        salesChart.data.labels = salesData.labels;
        salesChart.data.datasets[0].data = salesData.data;
        salesChart.update();
    }
    
    if (categoryChart) {
        categoryChart.data.labels = catData.labels;
        categoryChart.data.datasets[0].data = catData.data;
        categoryChart.update();
    }
    
    if (revenueChart) {
        revenueChart.data.labels = revData.labels;
        revenueChart.data.datasets[0].data = revData.data;
        revenueChart.update();
    }
    
    if (customerGrowthChart) {
        customerGrowthChart.data.labels = growthData.labels;
        customerGrowthChart.data.datasets[0].data = growthData.data;
        customerGrowthChart.update();
    }
    
    if (regionChart) {
        regionChart.data.labels = regData.labels;
        regionChart.data.datasets[0].data = regData.data;
        regionChart.update();
    }
}

function initCharts() {
    const salesData = getSalesDataByDay();
    const catData = getCategoryData();
    const revData = getMonthlyRevenue();
    const growthData = getCustomerGrowthData();
    const regData = getRegionData();

    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        salesChart = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: salesData.labels,
                datasets: [{
                    label: 'Sales',
                    data: salesData.data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true, tension: 0.4, borderWidth: 3,
                    pointBackgroundColor: '#667eea', pointBorderColor: '#fff',
                    pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)', callback: v => '₹' + (v >= 1000 ? (v/1000) + 'K' : v) } },
                    x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.6)' } }
                }
            }
        });
    }

    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: catData.labels,
                datasets: [{ data: catData.data, backgroundColor: ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fbbf24'], borderColor: '#1c1c2b', borderWidth: 2 }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }
        });
    }

    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        revenueChart = new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: revData.labels,
                datasets: [{ label: 'Revenue', data: revData.data, backgroundColor: '#667eea', borderRadius: 5 }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } }, 
                scales: { 
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)', callback: v => '₹' + (v >= 1000 ? (v/1000) + 'K' : v) } },
                    x: { ticks: { color: 'rgba(255,255,255,0.6)' } }
                } 
            }
        });
    }

    const growthCtx = document.getElementById('customerGrowthChart');
    if (growthCtx) {
        customerGrowthChart = new Chart(growthCtx, {
            type: 'line',
            data: {
                labels: growthData.labels,
                datasets: [{ label: 'Customers', data: growthData.data, borderColor: '#4facfe', backgroundColor: 'rgba(79,172,254,0.1)', fill: true, tension: 0.4 }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.6)' } },
                    x: { ticks: { color: 'rgba(255,255,255,0.6)' } }
                }
            }
        });
    }

    const regionCtx = document.getElementById('regionChart');
    if (regionCtx) {
        regionChart = new Chart(regionCtx, {
            type: 'pie',
            data: {
                labels: regData.labels,
                datasets: [{ data: regData.data, backgroundColor: ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fbbf24'], borderColor: '#1c1c2b', borderWidth: 2 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'rgba(255,255,255,0.8)' } } } }
        });
    }
}

// ============== RENDER FUNCTIONS ==============
function renderProducts(filter = {}) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    // Use SharedDataManager getter
    let filtered = [...getProducts()];
    if (filter.category) filtered = filtered.filter(p => p.category === filter.category);
    if (filter.brand) filtered = filtered.filter(p => p.brand === filter.brand);
    if (filter.search) filtered = filtered.filter(p => p.name.toLowerCase().includes(filter.search.toLowerCase()));

    grid.innerHTML = filtered.map(p => `
        <div class="product-card" data-id="${p.id}">
            <div class="product-card-image">
                ${p.image 
                    ? `<img src="${p.image}" alt="${p.name}" class="product-img">`
                    : `<i class="fas ${p.category === 'sunglasses' ? 'fa-sun' : p.category === 'lenses' ? 'fa-eye' : 'fa-glasses'}"></i>`
                }
                ${p.badge ? `<span class="product-badge ${p.badge}">${p.badge === 'bestseller' ? 'Bestseller' : p.badge === 'new' ? 'New' : '30% Off'}</span>` : ''}
            </div>
            <div class="product-card-body">
                <h3>${p.name}</h3>
                <p class="product-brand">${(p.brand || 'noon').charAt(0).toUpperCase() + (p.brand || 'noon').slice(1)}</p>
                <p class="product-category">${p.category.charAt(0).toUpperCase() + p.category.slice(1)}</p>
                <div class="product-meta">
                    <span class="product-stock ${p.stock === 0 ? 'out-stock' : p.stock < 10 ? 'low-stock' : 'in-stock'}">
                        <i class="fas fa-circle"></i> ${p.stock === 0 ? 'Out of Stock' : p.stock < 10 ? `Low Stock (${p.stock})` : `In Stock (${p.stock})`}
                    </span>
                </div>
                <div class="product-card-footer">
                    <span class="product-price">₹${p.price.toLocaleString()}</span>
                    <div class="product-actions">
                        <button class="action-btn edit" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderOrders() {
    const grid = document.getElementById('ordersGrid');
    if (!grid) return;
    
    // Use getter function for orders
    const orders = getOrders();
    
    // Handle empty orders
    if (orders.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><p>No orders yet</p><span>Orders will appear here when customers make purchases</span></div>';
        return;
    }
    
    grid.innerHTML = orders.map(o => `
        <div class="order-card">
            <div class="card-header">
                <span class="order-id">#${o.id}</span>
                <span class="order-date">${o.date}</span>
            </div>
            <div class="order-card-body">
                <div class="customer-cell">
                    <div class="customer-avatar">${o.customer.initials || getInitials(o.customer.name)}</div>
                    <div>
                        <span class="customer-name">${o.customer.name}</span>
                        <span class="customer-email">${o.customer.email}</span>
                    </div>
                </div>
                <div class="order-product-info">
                        <p class="product-label">Products:</p>
                        <p class="product-names">${o.product}</p>
                    </div>
                    <div class="order-meta">
                        <div class="meta-item">
                            <span class="meta-label">Total Amount:</span>
                            <span class="meta-value amount">₹${o.amount.toLocaleString()}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Payment:</span>
                            <span class="payment-badge ${o.payment}">${o.payment.charAt(0).toUpperCase() + o.payment.slice(1)}</span>
                        </div>
                    </div>
                </div>
                <div class="order-card-footer">
                    <span class="status ${o.status}">${o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span>
                    <div class="table-actions">
                        <button class="table-action-btn" onclick="viewOrder('${o.id}')"><i class="fas fa-eye"></i></button>
                        <button class="table-action-btn" onclick="editOrder('${o.id}')"><i class="fas fa-edit"></i></button>
                        <button class="table-action-btn delete" onclick="deleteOrder('${o.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
}

// Helper function to get initials from name
function getInitials(name) {
    if (!name) return 'NA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function renderCustomers() {
    const grid = document.getElementById('customersGrid');
    if (!grid) return;
    
    // Use getter function for customers
    const customers = getCustomers();
    
    // Handle empty customers
    if (customers.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No customers yet</p><span>Customers will appear here when they sign up</span></div>';
        return;
    }
    
    grid.innerHTML = customers.map(c => `
        <div class="customer-card">
            <div class="customer-card-header">
                <div class="customer-avatar">${getInitials(c.name)}</div>
                <div class="customer-info-main">
                    <h3>${c.name}</h3>
                    <span class="status ${c.status}">${c.status === 'vip' ? 'VIP Customer' : 'Active Member'}</span>
                </div>
            </div>
            <div class="customer-card-body">
                <div class="contact-info">
                    <p><i class="fas fa-envelope"></i> ${c.email}</p>
                    <p><i class="fas fa-phone"></i> ${c.phone}</p>
                </div>
                <div class="customer-card-stats">
                    <div class="card-stat-item">
                        <span class="label">Orders</span>
                        <span class="value">${c.orders}</span>
                    </div>
                    <div class="card-stat-item">
                        <span class="label">Total Spent</span>
                        <span class="value">₹${c.spent.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div class="customer-card-footer">
                <div class="table-actions">
                    <button class="table-action-btn view-btn" onclick="viewCustomer(${c.id})"><i class="fas fa-eye"></i> View Profile</button>
                    <button class="table-action-btn" onclick="editCustomer(${c.id})"><i class="fas fa-edit"></i></button>
                    <button class="table-action-btn delete" onclick="deleteCustomer(${c.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderAppointments() {
    const list = document.getElementById('appointmentsList');
    if (!list) return;
    
    // Use getter function for appointments
    const appointments = getAppointments();
    
    // Handle empty appointments
    if (appointments.length === 0) {
        list.innerHTML = '<div class="empty-state" style="text-align: center; padding: 40px; color: #666;"><i class="fas fa-calendar-alt" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i><p>No appointments yet</p></div>';
        return;
    }
    
    list.innerHTML = appointments.map(a => `
        <div class="appointment-item">
            <div class="time">${a.time}<br><small>${a.duration}</small></div>
            <div><h4>${a.type}</h4><p><i class="fas fa-user"></i> ${a.customer}</p><p><i class="fas fa-phone"></i> ${a.phone}</p></div>
            <span class="status ${a.status}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span>
            <div class="table-actions">
                <button class="table-action-btn" onclick="confirmAppointment(${a.id})"><i class="fas fa-check"></i></button>
                <button class="table-action-btn delete" onclick="cancelAppointment(${a.id})"><i class="fas fa-times"></i></button>
            </div>
        </div>
    `).join('');
}

function renderRecentOrders() {
    const tbody = document.getElementById('recentOrdersBody');
    if (!tbody) return;
    
    // Use getter function for orders
    const orders = getOrders();
    
    // Handle empty orders
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #666;">No recent orders</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.slice(0, 4).map(o => `
        <tr><td>#${o.id.split('-').pop()}</td><td>${o.customer.name}</td><td>₹${o.amount.toLocaleString()}</td><td><span class="status ${o.status}">${o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span></td></tr>
    `).join('');
}

function renderTopProducts() {
    const list = document.getElementById('topProductsList');
    if (!list) return;
    
    const products = getProducts();
    
    if (products.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">No products yet</div>';
        return;
    }
    
    list.innerHTML = products.slice(0, 3).map(p => `
        <div class="product-item"><i class="fas ${p.category === 'sunglasses' ? 'fa-sun' : 'fa-glasses'}"></i><div><h4>${p.name}</h4><p>${Math.floor(Math.random() * 100 + 50)} sold</p></div><span>₹${p.price.toLocaleString()}</span></div>
    `).join('');
}

function renderTodayAppointments() {
    const container = document.getElementById('todayAppointments');
    if (!container) return;
    
    const appointments = getAppointments();
    
    if (appointments.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">No appointments today</div>';
        return;
    }
    
    container.innerHTML = appointments.slice(0, 3).map(a => `
        <div class="appointment-item"><div class="time">${a.time}</div><div><h4>${a.type}</h4><p>${a.customer}</p></div><span class="status ${a.status}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span></div>
    `).join('');
}

function renderTopSellers() {
    const list = document.getElementById('topSellersList');
    if (!list) return;
    
    const products = getProducts();
    
    if (products.length === 0) {
        list.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">No products yet</div>';
        return;
    }
    
    list.innerHTML = products.slice(0, 5).map((p, i) => `
        <div class="top-seller-item"><span class="rank">${i + 1}</span><div><h4>${p.name}</h4><p>₹${p.price.toLocaleString()} • ${Math.floor(Math.random() * 100 + 50)} sold</p></div></div>
    `).join('');
}

function renderActivityLog() {
    const timeline = document.getElementById('activityTimeline');
    if (!timeline) return;
    
    const log = getActivityLog();
    timeline.innerHTML = log.map(a => `
        <div class="activity-item"><div class="activity-content">${a.action}<div class="activity-time">${a.time}</div></div></div>
    `).join('');
}

// ============== MODAL ==============
function openModal(type) {
    const modal = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    if (type === 'addProduct') {
        title.textContent = 'Add New Product';
        body.innerHTML = `
            <form class="profile-form" onsubmit="saveProduct(event)">
                <div class="image-upload-section">
                    <div class="image-preview" id="imagePreview">
                        <i class="fas fa-glasses"></i>
                        <span>Product Image</span>
                    </div>
                    <div class="image-upload-controls">
                        <label class="upload-btn">
                            <i class="fas fa-cloud-upload-alt"></i> Choose Image
                            <input type="file" accept="image/*" onchange="previewProductImage(this)" id="productImageInput" hidden>
                        </label>
                        <button type="button" class="remove-image-btn" onclick="removeProductImage()" style="display:none" id="removeImageBtn">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                        <p class="upload-hint">PNG, JPG up to 5MB</p>
                    </div>
                </div>
                <div class="form-row"><div class="form-group"><label>Product Name</label><input type="text" required placeholder="Enter product name"></div><div class="form-group"><label>Brand</label><input type="text" required placeholder="Enter brand"></div></div>
                <div class="form-row"><div class="form-group"><label>Category</label><select required><option value="">Select Category</option><option value="Sport">Sport</option><option value="Reading">Reading</option><option value="Sun">Sunglasses</option><option value="Blue Light">Blue Light</option><option value="Fashion">Fashion</option><option value="lenses">Contact Lenses</option><option value="accessories">Accessories</option></select></div><div class="form-group"><label>Price (₹)</label><input type="number" required placeholder="Enter price"></div></div>
                <div class="form-row"><div class="form-group"><label>Stock Quantity</label><input type="number" required placeholder="Enter quantity" id="stockInput"></div><div class="form-group"><label>SKU</label><input type="text" placeholder="Enter SKU" id="skuInput"></div></div>
                <div class="form-row"><div class="form-group"><label>Discount (%)</label><input type="number" min="0" max="100" placeholder="Enter discount" id="discountInput"></div><div class="form-group"><label>Rating (1-5)</label><input type="number" min="1" max="5" step="0.1" placeholder="Enter rating" id="ratingInput"></div></div>
                <div class="form-group">
                    <label>Tags</label>
                    <div class="tag-input-container" id="tagInputContainer" onclick="document.getElementById('tagInputField').focus()">
                        <input type="text" class="tag-input-field" id="tagInputField" placeholder="Type and press Enter to add tag..." onkeydown="handleTagInput(event)">
                    </div>
                    <div class="tag-suggestions">
                        <span class="tag-suggestion" onclick="addTagFromSuggestion('Blue-Light')">+ Blue-Light</span>
                        <span class="tag-suggestion" onclick="addTagFromSuggestion('Anti-Glare')">+ Anti-Glare</span>
                        <span class="tag-suggestion" onclick="addTagFromSuggestion('UV Protection')">+ UV Protection</span>
                        <span class="tag-suggestion" onclick="addTagFromSuggestion('Polarized')">+ Polarized</span>
                        <span class="tag-suggestion" onclick="addTagFromSuggestion('Lightweight')">+ Lightweight</span>
                        <span class="tag-suggestion" onclick="addTagFromSuggestion('Comfort Fit')">+ Comfort Fit</span>
                    </div>
                </div>
                <div class="form-group"><label>Description</label><textarea placeholder="Enter product description" id="descInput"></textarea></div>
                <div class="form-actions"><button type="submit" class="btn btn-primary"><i class="fas fa-plus"></i> Add Product</button><button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button></div>
            </form>`;
    } else if (type === 'addCustomer') {
        title.textContent = 'Add New Customer';
        body.innerHTML = `
            <form class="profile-form" onsubmit="saveCustomer(event)">
                <div class="form-row"><div class="form-group"><label>First Name</label><input type="text" required placeholder="Enter first name"></div><div class="form-group"><label>Last Name</label><input type="text" required placeholder="Enter last name"></div></div>
                <div class="form-row"><div class="form-group"><label>Email</label><input type="email" required placeholder="Enter email address"></div><div class="form-group"><label>Phone</label><input type="tel" required placeholder="Enter phone number"></div></div>
                <div class="form-group"><label>Address</label><textarea placeholder="Enter full address"></textarea></div>
                <div class="form-actions"><button type="submit" class="btn btn-primary">Add Customer</button><button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button></div>
            </form>`;
    } else if (type === 'addAppointment') {
        title.textContent = 'New Appointment';
        body.innerHTML = `
            <form class="profile-form" onsubmit="saveAppointment(event)">
                <div class="form-row"><div class="form-group"><label>Customer Name</label><input type="text" required placeholder="Enter customer name"></div><div class="form-group"><label>Phone</label><input type="tel" required placeholder="Enter phone number"></div></div>
                <div class="form-row"><div class="form-group"><label>Date</label><input type="date" required></div><div class="form-group"><label>Time</label><input type="time" required></div></div>
                <div class="form-group"><label>Appointment Type</label><select required><option value="">Select Type</option><option value="exam">Eye Examination</option><option value="fitting">Lens Fitting</option><option value="trial">Contact Lens Trial</option><option value="checkup">Full Checkup</option></select></div>
                <div class="form-group"><label>Notes</label><textarea placeholder="Enter any additional notes"></textarea></div>
                <div class="form-actions"><button type="submit" class="btn btn-primary">Schedule</button><button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button></div>
            </form>`;
    }
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// ============== IMAGE UPLOAD ==============
let selectedProductImage = null;

function previewProductImage(input) {
    const preview = document.getElementById('imagePreview');
    const removeBtn = document.getElementById('removeImageBtn');
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size should be less than 5MB', 'error');
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedProductImage = e.target.result;
            preview.innerHTML = `<img src="${e.target.result}" alt="Product Preview">`;
            preview.classList.add('has-image');
            if (removeBtn) removeBtn.style.display = 'inline-flex';
        };
        reader.readAsDataURL(file);
        showToast('Image uploaded successfully!');
    }
}

function removeProductImage() {
    const preview = document.getElementById('imagePreview');
    const removeBtn = document.getElementById('removeImageBtn');
    const input = document.getElementById('productImageInput');
    
    selectedProductImage = null;
    preview.innerHTML = `<i class="fas fa-glasses"></i><span>Product Image</span>`;
    preview.classList.remove('has-image');
    if (removeBtn) removeBtn.style.display = 'none';
    if (input) input.value = '';
    showToast('Image removed');
}

// ============== TAG INPUT FUNCTIONS ==============
function handleTagInput(event, mode = 'add') {
    if (event.key === 'Enter') {
        event.preventDefault();
        const input = event.target;
        const tagValue = input.value.trim();
        
        if (tagValue) {
            addTag(tagValue, mode);
            input.value = '';
        }
    }
}

function addTag(tagValue, mode = 'add') {
    const containerId = mode === 'edit' ? 'editTagInputContainer' : 'tagInputContainer';
    const inputId = mode === 'edit' ? 'editTagInputField' : 'tagInputField';
    const container = document.getElementById(containerId);
    const input = document.getElementById(inputId);
    
    if (!container || !input) return;
    
    // Check if tag already exists
    const existingTags = container.querySelectorAll('.tag-badge');
    for (let tag of existingTags) {
        if (tag.textContent.replace('×', '').trim().toLowerCase() === tagValue.toLowerCase()) {
            showToast('Tag already exists', 'warning');
            return;
        }
    }
    
    // Create tag badge
    const tagBadge = document.createElement('span');
    tagBadge.className = 'tag-badge';
    tagBadge.innerHTML = `${tagValue}<button type="button" class="tag-remove" onclick="removeTag(this, '${mode}')"><i class="fas fa-times"></i></button>`;
    
    // Insert before the input field
    container.insertBefore(tagBadge, input);
    
    showToast(`Tag "${tagValue}" added`);
}

function addTagFromSuggestion(tagValue, mode = 'add') {
    addTag(tagValue, mode);
}

function removeTag(button, mode = 'add') {
    event.preventDefault();
    event.stopPropagation();
    const tagBadge = button.parentElement;
    const tagValue = tagBadge.childNodes[0].textContent.trim();
    tagBadge.remove();
    showToast(`Tag "${tagValue}" removed`);
}

function getTagsFromContainer(mode = 'add') {
    const containerId = mode === 'edit' ? 'editTagInputContainer' : 'tagInputContainer';
    const container = document.getElementById(containerId);
    
    if (!container) return ['New Arrival'];
    
    const tagBadges = container.querySelectorAll('.tag-badge');
    const tags = Array.from(tagBadges).map(badge => {
        // Get text content excluding the remove button
        return badge.childNodes[0].textContent.trim();
    });
    
    return tags.length > 0 ? tags : ['New Arrival'];
}

// ============== TOAST ==============
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon mapping for different types
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `<i class="fas ${iconMap[type] || iconMap.info}"></i><span>${message}</span>`;
    container.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============== CUSTOM CONFIRM DIALOG ==============
function showConfirm(options) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('confirmOverlay');
        const icon = document.getElementById('confirmIcon');
        const title = document.getElementById('confirmTitle');
        const message = document.getElementById('confirmMessage');
        const confirmBtn = document.getElementById('confirmOkBtn');
        const cancelBtn = document.getElementById('confirmCancelBtn');
        
        // Set content
        title.textContent = options.title || 'Are you sure?';
        message.textContent = options.message || 'This action cannot be undone.';
        
        // Set icon type
        const iconType = options.type || 'warning';
        const iconMap = {
            danger: 'fa-trash-alt',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            logout: 'fa-sign-out-alt'
        };
        icon.className = `confirm-icon ${iconType}`;
        icon.innerHTML = `<i class="fas ${iconMap[iconType] || iconMap.warning}"></i>`;
        
        // Set button styles
        confirmBtn.className = `confirm-btn ${options.confirmClass || 'confirm'}`;
        confirmBtn.innerHTML = `<i class="fas ${options.confirmIcon || 'fa-check'}"></i> ${options.confirmText || 'Confirm'}`;
        cancelBtn.innerHTML = `<i class="fas fa-times"></i> ${options.cancelText || 'Cancel'}`;
        
        // Show dialog
        overlay.classList.add('active');
        
        // Handle actions
        const handleConfirm = () => {
            overlay.classList.remove('active');
            cleanup();
            resolve(true);
        };
        
        const handleCancel = () => {
            overlay.classList.remove('active');
            cleanup();
            resolve(false);
        };
        
        const handleOverlayClick = (e) => {
            if (e.target === overlay) {
                handleCancel();
            }
        };
        
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
            }
        };
        
        const cleanup = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            overlay.removeEventListener('click', handleOverlayClick);
            document.removeEventListener('keydown', handleEscape);
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        overlay.addEventListener('click', handleOverlayClick);
        document.addEventListener('keydown', handleEscape);
    });
}

// ============== CRUD FUNCTIONS ==============
function saveProduct(e) {
    e.preventDefault();
    const form = e.target;
    
    // Get all text inputs, selects, and textareas (excluding file input)
    const nameInput = form.querySelectorAll('.form-group input[type="text"]')[0];
    const brandInput = form.querySelectorAll('.form-group input[type="text"]')[1];
    const categorySelect = form.querySelector('.form-group select');
    const priceInput = form.querySelector('.form-group input[type="number"]');
    const stockInput = document.getElementById('stockInput');
    const discountInput = document.getElementById('discountInput');
    const ratingInput = document.getElementById('ratingInput');
    const descTextarea = document.getElementById('descInput');
    
    const stock = parseInt(stockInput?.value) || 0;
    const discount = parseInt(discountInput?.value) || 0;
    const rating = parseFloat(ratingInput?.value) || 4.5;
    const tags = getTagsFromContainer('add');
    const price = parseInt(priceInput?.value) || 0;
    const oldPrice = discount > 0 ? Math.round(price / (1 - discount / 100)) : null;
    
    const newProduct = {
        name: nameInput?.value || 'Untitled Product',
        brand: brandInput?.value?.toLowerCase() || 'noon',
        category: categorySelect?.value || 'eyeglasses',
        price: price,
        oldPrice: oldPrice,
        stock: stock,
        inStock: stock > 0,
        img: selectedProductImage || 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop',
        image: selectedProductImage || null,
        description: descTextarea?.value || '',
        discount: discount,
        tags: tags,
        rating: rating,
        reviewCount: 0,
        badge: null
    };
    
    // Use SharedDataManager if available
    if (typeof SharedDataManager !== 'undefined') {
        SharedDataManager.addProduct(newProduct);
    } else {
        newProduct.id = sampleProducts.length > 0 ? Math.max(...sampleProducts.map(p => p.id)) + 1 : 1;
        sampleProducts.push(newProduct);
    }
    
    selectedProductImage = null; // Reset after save
    renderProducts();
    renderTopProducts();
    updateDashboardStats();
    addActivityLog(`Added new product <strong>${newProduct.name}</strong>`);
    showToast('Product added successfully!');
    closeModal();
}

function editProduct(id) {
    // Get full product data from SharedDataManager to include all fields like tags
    let product;
    if (typeof SharedDataManager !== 'undefined') {
        product = SharedDataManager.getProductById(id);
    } else {
        const products = getProducts();
        product = products.find(p => p.id === id);
    }
    if (!product) return;
    
    const modal = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    const hasImage = (product.image || product.img) && (product.image || product.img) !== '';
    const imageUrl = product.image || product.img;
    const imagePreviewContent = hasImage 
        ? `<img src="${imageUrl}" alt="Product">`
        : `<i class="fas fa-glasses"></i><span>Product Image</span>`;
    
    title.textContent = 'Edit Product';
    body.innerHTML = `
        <form class="profile-form" onsubmit="updateProduct(event, ${id})">
            <div class="image-upload-section">
                <div class="image-preview ${hasImage ? 'has-image' : ''}" id="imagePreview">
                    ${imagePreviewContent}
                </div>
                <div class="image-upload-controls">
                    <label class="upload-btn">
                        <i class="fas fa-cloud-upload-alt"></i> ${hasImage ? 'Change Image' : 'Choose Image'}
                        <input type="file" accept="image/*" onchange="previewProductImage(this)" id="productImageInput" hidden>
                    </label>
                    <button type="button" class="remove-image-btn" onclick="removeProductImage()" style="display:${hasImage ? 'inline-flex' : 'none'}" id="removeImageBtn">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                    <p class="upload-hint">PNG, JPG up to 5MB</p>
                </div>
            </div>
            <div class="form-row"><div class="form-group"><label>Product Name</label><input type="text" required value="${product.name}"></div><div class="form-group"><label>Brand</label><input type="text" required value="${product.brand}"></div></div>
            <div class="form-row"><div class="form-group"><label>Category</label><select required><option value="">Select Category</option><option value="Sport" ${product.category === 'Sport' ? 'selected' : ''}>Sport</option><option value="Reading" ${product.category === 'Reading' ? 'selected' : ''}>Reading</option><option value="Sun" ${product.category === 'Sun' ? 'selected' : ''}>Sunglasses</option><option value="Blue Light" ${product.category === 'Blue Light' ? 'selected' : ''}>Blue Light</option><option value="Fashion" ${product.category === 'Fashion' ? 'selected' : ''}>Fashion</option><option value="lenses" ${product.category === 'lenses' ? 'selected' : ''}>Contact Lenses</option><option value="accessories" ${product.category === 'accessories' ? 'selected' : ''}>Accessories</option></select></div><div class="form-group"><label>Price (₹)</label><input type="number" required value="${product.price}"></div></div>
            <div class="form-row"><div class="form-group"><label>Stock Quantity</label><input type="number" required value="${product.stock !== undefined ? product.stock : 0}" id="editStockInput"></div><div class="form-group"><label>SKU</label><input type="text" placeholder="Enter SKU" value="${product.sku || ''}" id="editSkuInput"></div></div>
            <div class="form-row"><div class="form-group"><label>Discount (%)</label><input type="number" min="0" max="100" value="${product.discount || 0}" id="editDiscountInput"></div><div class="form-group"><label>Rating (1-5)</label><input type="number" min="1" max="5" step="0.1" value="${product.rating || 4.5}" id="editRatingInput"></div></div>
            <div class="form-group">
                <label>Tags</label>
                <div class="tag-input-container" id="editTagInputContainer" onclick="document.getElementById('editTagInputField').focus()">
                    ${Array.isArray(product.tags) ? product.tags.map(tag => `<span class="tag-badge">${tag}<button type="button" class="tag-remove" onclick="removeTag(this, 'edit')"><i class="fas fa-times"></i></button></span>`).join('') : ''}
                    <input type="text" class="tag-input-field" id="editTagInputField" placeholder="Type and press Enter to add tag..." onkeydown="handleTagInput(event, 'edit')">
                </div>
                <div class="tag-suggestions">
                    <span class="tag-suggestion" onclick="addTagFromSuggestion('Blue-Light', 'edit')">+ Blue-Light</span>
                    <span class="tag-suggestion" onclick="addTagFromSuggestion('Anti-Glare', 'edit')">+ Anti-Glare</span>
                    <span class="tag-suggestion" onclick="addTagFromSuggestion('UV Protection', 'edit')">+ UV Protection</span>
                    <span class="tag-suggestion" onclick="addTagFromSuggestion('Polarized', 'edit')">+ Polarized</span>
                    <span class="tag-suggestion" onclick="addTagFromSuggestion('Lightweight', 'edit')">+ Lightweight</span>
                    <span class="tag-suggestion" onclick="addTagFromSuggestion('Comfort Fit', 'edit')">+ Comfort Fit</span>
                </div>
            </div>
            <div class="form-actions sticky-actions"><button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Update Product</button><button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button></div>
        </form>`;
    modal.classList.add('active');
}

function updateProduct(e, id) {
    e.preventDefault();
    const form = e.target;
    
    // Get all text inputs, selects, and textareas (excluding file input)
    const nameInput = form.querySelectorAll('.form-group input[type="text"]')[0];
    const brandInput = form.querySelectorAll('.form-group input[type="text"]')[1];
    const categorySelect = form.querySelector('.form-group select');
    const priceInput = form.querySelector('.form-group input[type="number"]');
    const stockInput = document.getElementById('editStockInput');
    const discountInput = document.getElementById('editDiscountInput');
    const ratingInput = document.getElementById('editRatingInput');
    
    const stock = parseInt(stockInput?.value) || 0;
    const discount = parseInt(discountInput?.value) || 0;
    const rating = parseFloat(ratingInput?.value) || 4.5;
    const tags = getTagsFromContainer('edit');
    const price = parseInt(priceInput?.value) || 0;
    const oldPrice = discount > 0 ? Math.round(price / (1 - discount / 100)) : null;
    
    const updatedData = {
        name: nameInput?.value,
        brand: brandInput?.value?.toLowerCase(),
        category: categorySelect?.value,
        price: price,
        oldPrice: oldPrice,
        stock: stock,
        inStock: stock > 0,
        discount: discount,
        rating: rating,
        tags: tags,
        image: selectedProductImage || null
    };
    
    let productName = updatedData.name;
    
    // Use SharedDataManager if available
    if (typeof SharedDataManager !== 'undefined') {
        // Get the original product to merge with updates
        const originalProduct = SharedDataManager.getProductById(id);
        if (originalProduct) {
            const merged = { ...originalProduct, ...updatedData };
            if (updatedData.image) merged.img = updatedData.image;
            SharedDataManager.updateProduct(id, merged);
        }
    } else {
        const productIndex = sampleProducts.findIndex(p => p.id === id);
        if (productIndex === -1) return;
        sampleProducts[productIndex] = {
            ...sampleProducts[productIndex],
            ...updatedData
        };
    }
    
    selectedProductImage = null; // Reset after update
    renderProducts();
    renderTopProducts();
    addActivityLog(`Updated product <strong>${productName}</strong>`);
    showToast('Product updated successfully!');
    closeModal();
}

async function deleteProduct(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    const productName = product ? product.name : 'Product';
    
    const confirmed = await showConfirm({
        title: 'Delete Product',
        message: `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
        type: 'danger',
        confirmClass: 'danger',
        confirmIcon: 'fa-trash-alt',
        confirmText: 'Delete'
    });
    
    if (confirmed) {
        // Use SharedDataManager if available
        if (typeof SharedDataManager !== 'undefined') {
            SharedDataManager.deleteProduct(id);
        } else {
            const index = sampleProducts.findIndex(p => p.id === id);
            if (index !== -1) {
                sampleProducts.splice(index, 1);
            }
        }
        renderProducts();
        renderTopProducts();
        updateDashboardStats();
        addActivityLog(`Deleted product <strong>${productName}</strong>`);
        showToast('Product deleted!', 'error');
    }
}

function saveCustomer(e) {
    e.preventDefault();
    const form = e.target;
    const inputs = form.querySelectorAll('input, textarea');
    
    const newCustomer = {
        name: `${inputs[0].value} ${inputs[1].value}`,
        email: inputs[2].value,
        phone: inputs[3].value
    };
    
    // Use SharedDataManager if available
    if (typeof SharedDataManager !== 'undefined') {
        SharedDataManager.addCustomer(newCustomer);
    } else {
        newCustomer.id = sampleCustomers.length > 0 ? Math.max(...sampleCustomers.map(c => c.id)) + 1 : 1;
        newCustomer.orders = 0;
        newCustomer.spent = 0;
        newCustomer.status = 'active';
        sampleCustomers.push(newCustomer);
    }
    
    renderCustomers();
    updateDashboardStats();
    addActivityLog(`New customer <strong>${newCustomer.name}</strong> registered`);
    showToast('Customer added successfully!');
    closeModal();
}

function viewCustomer(id) {
    const customers = getCustomers();
    const customer = customers.find(c => c.id === id);
    if (!customer) return;
    
    const modal = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    title.textContent = 'Customer Details';
    body.innerHTML = `
        <div class="customer-details">
            <div class="customer-header">
                <div class="customer-avatar-large">${getInitials(customer.name)}</div>
                <div class="customer-info-details">
                    <h3>${customer.name}</h3>
                    <span class="status ${customer.status}">${customer.status === 'vip' ? 'VIP' : 'Active'}</span>
                </div>
            </div>
            <div class="customer-stats-grid">
                <div class="detail-item"><label>Email</label><span>${customer.email}</span></div>
                <div class="detail-item"><label>Phone</label><span>${customer.phone}</span></div>
                <div class="detail-item"><label>Total Orders</label><span>${customer.orders}</span></div>
                <div class="detail-item"><label>Total Spent</label><span>₹${customer.spent.toLocaleString()}</span></div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-primary" onclick="openSendEmailModal('${customer.email}', '${customer.name}')"><i class="fas fa-envelope"></i> Send Email</button>
                <button type="button" class="btn btn-outline" onclick="closeModal()">Close</button>
            </div>
        </div>`;
    modal.classList.add('active');
}

function editCustomer(id) {
    const customers = getCustomers();
    const customer = customers.find(c => c.id === id);
    if (!customer) return;
    
    const nameParts = customer.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    const modal = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    title.textContent = 'Edit Customer';
    body.innerHTML = `
        <form class="profile-form" onsubmit="updateCustomer(event, ${id})">
            <div class="form-row"><div class="form-group"><label>First Name</label><input type="text" required value="${firstName}"></div><div class="form-group"><label>Last Name</label><input type="text" required value="${lastName}"></div></div>
            <div class="form-row"><div class="form-group"><label>Email</label><input type="email" required value="${customer.email}"></div><div class="form-group"><label>Phone</label><input type="tel" required value="${customer.phone}"></div></div>
            <div class="form-group"><label>Status</label><select><option value="active" ${customer.status === 'active' ? 'selected' : ''}>Active</option><option value="vip" ${customer.status === 'vip' ? 'selected' : ''}>VIP</option></select></div>
            <div class="form-actions"><button type="submit" class="btn btn-primary">Update Customer</button><button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button></div>
        </form>`;
    modal.classList.add('active');
}

function updateCustomer(e, id) {
    e.preventDefault();
    const form = e.target;
    const inputs = form.querySelectorAll('input, select');
    
    const updatedData = {
        name: `${inputs[0].value} ${inputs[1].value}`,
        email: inputs[2].value,
        phone: inputs[3].value,
        status: inputs[4].value
    };
    
    // Use SharedDataManager if available
    if (typeof SharedDataManager !== 'undefined') {
        SharedDataManager.updateCustomer(id, updatedData);
    } else {
        const customerIndex = sampleCustomers.findIndex(c => c.id === id);
        if (customerIndex === -1) return;
        sampleCustomers[customerIndex] = {
            ...sampleCustomers[customerIndex],
            ...updatedData
        };
    }
    
    renderCustomers();
    addActivityLog(`Updated customer <strong>${updatedData.name}</strong>`);
    showToast('Customer updated successfully!');
    closeModal();
}

async function deleteCustomer(id) {
    const customers = getCustomers();
    const customer = customers.find(c => c.id === id);
    const customerName = customer ? customer.name : 'Customer';
    
    const confirmed = await showConfirm({
        title: 'Delete Customer',
        message: `Are you sure you want to delete "${customerName}"? This action cannot be undone.`,
        type: 'danger',
        confirmClass: 'danger',
        confirmIcon: 'fa-trash-alt',
        confirmText: 'Delete'
    });
    
    if (confirmed) {
        // Use SharedDataManager if available
        if (typeof SharedDataManager !== 'undefined') {
            SharedDataManager.deleteCustomer(id);
        } else {
            const index = sampleCustomers.findIndex(c => c.id === id);
            if (index !== -1) {
                sampleCustomers.splice(index, 1);
            }
        }
        renderCustomers();
        updateDashboardStats();
        addActivityLog(`Deleted customer <strong>${customerName}</strong>`);
        showToast('Customer deleted!', 'error');
    }
}

function viewOrder(id) {
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    if (!order) return;
    
    const modal = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    title.textContent = 'Order Details';
    body.innerHTML = `
        <div class="order-details">
            <div class="order-header">
                <h3>#${order.id}</h3>
                <span class="status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
            </div>
            <div class="order-info-grid">
                <div class="detail-item"><label>Date</label><span>${order.date}</span></div>
                <div class="detail-item"><label>Customer</label><span>${order.customer.name}</span></div>
                <div class="detail-item"><label>Email</label><span>${order.customer.email}</span></div>
                <div class="detail-item"><label>Product</label><span>${order.product}</span></div>
                <div class="detail-item"><label>Amount</label><span>₹${order.amount.toLocaleString()}</span></div>
                <div class="detail-item"><label>Payment</label><span class="payment-badge ${order.payment}">${order.payment.charAt(0).toUpperCase() + order.payment.slice(1)}</span></div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-primary" onclick="openSendEmailModal('${order.customer.email}', '${order.customer.name}')"><i class="fas fa-envelope"></i> Email Customer</button>
                <button type="button" class="btn btn-outline" onclick="editOrder('${id}')"><i class="fas fa-edit"></i> Update Status</button>
                <button type="button" class="btn btn-outline" onclick="closeModal()">Close</button>
            </div>
        </div>`;
    modal.classList.add('active');
}

function editOrder(id) {
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    if (!order) return;
    
    const modal = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    title.textContent = 'Update Order Status';
    body.innerHTML = `
        <form class="profile-form" onsubmit="updateOrder(event, '${id}')">
            <div class="form-group"><label>Order ID</label><input type="text" value="#${order.id}" disabled></div>
            <div class="form-group"><label>Customer</label><input type="text" value="${order.customer.name}" disabled></div>
            <div class="form-group"><label>Customer Email</label><input type="text" value="${order.customer.email}" disabled></div>
            <div class="form-row">
                <div class="form-group"><label>Payment Status</label><select id="paymentStatus"><option value="pending" ${order.payment === 'pending' ? 'selected' : ''}>Pending</option><option value="paid" ${order.payment === 'paid' ? 'selected' : ''}>Paid</option></select></div>
                <div class="form-group"><label>Order Status</label><select id="orderStatus"><option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option><option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option><option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option><option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option></select></div>
            </div>
            <div class="form-group" style="background: #f0f7ff; padding: 15px; border-radius: 8px; margin-top: 10px;">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin: 0;">
                    <input type="checkbox" id="sendEmailNotification" checked style="width: 18px; height: 18px;">
                    <span><i class="fas fa-envelope" style="margin-right: 5px;"></i> Send email notification to customer</span>
                </label>
                <p style="margin: 8px 0 0 28px; font-size: 12px; color: #666;">Customer will be notified about the status change</p>
            </div>
            <div class="form-actions"><button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Update Order</button><button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button></div>
        </form>`;
    modal.classList.add('active');
}

async function updateOrder(e, id) {
    e.preventDefault();
    
    const paymentStatus = document.getElementById('paymentStatus').value;
    const orderStatus = document.getElementById('orderStatus').value;
    const sendEmail = document.getElementById('sendEmailNotification')?.checked;
    
    // Get the original order for comparison and customer info
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    const previousStatus = order?.status;
    const previousPayment = order?.payment;
    
    // Use SharedDataManager if available
    if (typeof SharedDataManager !== 'undefined') {
        SharedDataManager.updateOrder(id, {
            payment: paymentStatus,
            status: orderStatus
        });
    } else {
        const orderIndex = sampleOrders.findIndex(o => o.id === id);
        if (orderIndex === -1) return;
        sampleOrders[orderIndex] = {
            ...sampleOrders[orderIndex],
            payment: paymentStatus,
            status: orderStatus
        };
    }
    
    // Send email notification to customer if checkbox is checked
    if (sendEmail && order?.customer?.email && typeof AdminEmailService !== 'undefined') {
        const orderDetails = {
            orderId: id,
            products: order.product,
            amount: order.amount
        };
        
        try {
            let emailSent = false;
            
            // Send email based on status change
            if (orderStatus !== previousStatus) {
                switch (orderStatus) {
                    case 'processing':
                        await AdminEmailService.sendOrderProcessing(order.customer.email, order.customer.name, orderDetails);
                        emailSent = true;
                        break;
                    case 'shipped':
                        await AdminEmailService.sendOrderShipped(order.customer.email, order.customer.name, orderDetails);
                        emailSent = true;
                        break;
                    case 'delivered':
                        await AdminEmailService.sendOrderDelivered(order.customer.email, order.customer.name, orderDetails);
                        emailSent = true;
                        break;
                }
            }
            
            // Send payment confirmation email
            if (paymentStatus === 'paid' && previousPayment !== 'paid') {
                await AdminEmailService.sendPaymentReceived(order.customer.email, order.customer.name, orderDetails);
                emailSent = true;
            }
            
            if (emailSent) {
                console.log('📧 Email notification sent to:', order.customer.email);
            }
        } catch (error) {
            console.error('📧 Failed to send email:', error);
        }
    }
    
    renderOrders();
    renderRecentOrders();
    updateOrderStats();
    addActivityLog(`Updated order <strong>#${id}</strong> status to ${orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}`);
    showToast('Order updated successfully!');
    closeModal();
}

async function deleteOrder(id) {
    const confirmed = await showConfirm({
        title: 'Delete Order',
        message: `Are you sure you want to delete Order #${id}? This action cannot be undone.`,
        type: 'danger',
        confirmClass: 'danger',
        confirmIcon: 'fa-trash-alt',
        confirmText: 'Delete'
    });
    
    if (confirmed) {
        // Use SharedDataManager if available
        if (typeof SharedDataManager !== 'undefined') {
            SharedDataManager.deleteOrder(id);
        } else {
            const index = sampleOrders.findIndex(o => o.id === id);
            if (index !== -1) {
                sampleOrders.splice(index, 1);
            }
        }
        renderOrders();
        renderRecentOrders();
        updateOrderStats();
        updateDashboardStats();
        addActivityLog(`Deleted order <strong>#${id}</strong>`);
        showToast('Order deleted!', 'error');
    }
}

function saveAppointment(e) {
    e.preventDefault();
    const form = e.target;
    const inputs = form.querySelectorAll('input, select, textarea');
    
    const timeValue = inputs[3].value;
    const [hours, minutes] = timeValue.split(':');
    const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
    const formattedHours = parseInt(hours) % 12 || 12;
    const formattedTime = `${formattedHours}:${minutes} ${period}`;
    
    const typeMap = {
        'exam': 'Eye Examination',
        'fitting': 'Lens Fitting',
        'trial': 'Contact Lens Trial',
        'checkup': 'Full Checkup'
    };
    
    const newAppointment = {
        time: formattedTime,
        date: inputs[2]?.value || new Date().toISOString().split('T')[0],
        duration: '30 min',
        type: typeMap[inputs[4].value] || inputs[4].value,
        customer: inputs[0].value,
        phone: inputs[1].value,
        email: '',
        status: 'pending',
        notes: ''
    };
    
    // Use SharedDataManager if available
    if (typeof SharedDataManager !== 'undefined') {
        SharedDataManager.addAppointment(newAppointment);
    } else {
        newAppointment.id = sampleAppointments.length > 0 ? Math.max(...sampleAppointments.map(a => a.id)) + 1 : 1;
        sampleAppointments.push(newAppointment);
    }
    
    renderAppointments();
    renderTodayAppointments();
    updateAppointmentStats();
    addActivityLog(`Scheduled appointment with <strong>${newAppointment.customer}</strong>`);
    showToast('Appointment scheduled!');
    closeModal();
}

function confirmAppointment(id) {
    // Use SharedDataManager if available
    if (typeof SharedDataManager !== 'undefined') {
        const appointments = SharedDataManager.getAppointments();
        const appointment = appointments.find(a => a.id === id);
        if (appointment) {
            SharedDataManager.updateAppointment(id, { status: 'confirmed' });
            renderAppointments();
            renderTodayAppointments();
            addActivityLog(`Confirmed appointment with <strong>${appointment.customer}</strong>`);
            showToast('Appointment confirmed!');
        }
    } else {
        const appointmentIndex = sampleAppointments.findIndex(a => a.id === id);
        if (appointmentIndex !== -1) {
            sampleAppointments[appointmentIndex].status = 'confirmed';
            renderAppointments();
            renderTodayAppointments();
            addActivityLog(`Confirmed appointment with <strong>${sampleAppointments[appointmentIndex].customer}</strong>`);
            showToast('Appointment confirmed!');
        }
    }
}

async function cancelAppointment(id) {
    const appointments = getAppointments();
    const appointment = appointments.find(a => a.id === id);
    const customerName = appointment ? appointment.customer : 'Customer';
    
    const confirmed = await showConfirm({
        title: 'Cancel Appointment',
        message: `Are you sure you want to cancel the appointment with "${customerName}"?`,
        type: 'warning',
        confirmClass: 'warning',
        confirmIcon: 'fa-ban',
        confirmText: 'Cancel Appointment'
    });
    
    if (confirmed) {
        // Use SharedDataManager if available
        if (typeof SharedDataManager !== 'undefined') {
            SharedDataManager.deleteAppointment(id);
        } else {
            const index = sampleAppointments.findIndex(a => a.id === id);
            if (index !== -1) {
                sampleAppointments.splice(index, 1);
            }
        }
        renderAppointments();
        renderTodayAppointments();
        updateAppointmentStats();
        addActivityLog(`Cancelled appointment with <strong>${customerName}</strong>`);
        showToast('Appointment cancelled!', 'error');
    }
}

// ============== HELPER FUNCTIONS FOR REAL-TIME UPDATES ==============
function addActivityLog(action) {
    // Use SharedDataManager if available
    if (typeof SharedDataManager !== 'undefined') {
        SharedDataManager.addActivityLogEntry(action);
    } else {
        const newActivity = {
            action: action,
            time: 'Just now'
        };
        activityLog.unshift(newActivity);
        if (activityLog.length > 10) activityLog.pop();
    }
    renderActivityLog();
}

function updateDashboardStats() {
    // Get data from SharedDataManager
    const products = getProducts();
    const customers = getCustomers();
    const orders = getOrders();
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    
    // Update revenue/sales (first stat card)
    const revenueEl = document.querySelector('.stat-card:nth-child(1) .stat-info h3');
    if (revenueEl) revenueEl.textContent = 'Rs. ' + totalRevenue.toLocaleString('en-IN');
    
    // Update order count (second stat card)
    const orderCountEl = document.querySelector('.stat-card:nth-child(2) .stat-info h3');
    if (orderCountEl) orderCountEl.textContent = orders.length;
    
    // Update customer count (third stat card)
    const customerCountEl = document.querySelector('.stat-card:nth-child(3) .stat-info h3');
    if (customerCountEl) customerCountEl.textContent = customers.length.toLocaleString();
    
    // Update product count (fourth stat card)
    const productCountEl = document.querySelector('.stat-card:nth-child(4) .stat-info h3');
    if (productCountEl) productCountEl.textContent = products.length;
    
    // Also update any other dashboard elements with these counts
    document.querySelectorAll('[data-stat="revenue"]').forEach(el => {
        el.textContent = 'Rs. ' + totalRevenue.toLocaleString('en-IN');
    });
    document.querySelectorAll('[data-stat="orders"]').forEach(el => {
        el.textContent = orders.length;
    });
    document.querySelectorAll('[data-stat="customers"]').forEach(el => {
        el.textContent = customers.length;
    });
    document.querySelectorAll('[data-stat="products"]').forEach(el => {
        el.textContent = products.length;
    });
}

function updateOrderStats() {
    const orders = getOrders();
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const processingCount = orders.filter(o => o.status === 'processing').length;
    const shippedCount = orders.filter(o => o.status === 'shipped').length;
    const deliveredCount = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
    
    const pendingEl = document.getElementById('pendingCount');
    const processingEl = document.getElementById('processingCount');
    const shippedEl = document.getElementById('shippedCount');
    const deliveredEl = document.getElementById('deliveredCount');
    
    if (pendingEl) pendingEl.textContent = pendingCount;
    if (processingEl) processingEl.textContent = processingCount;
    if (shippedEl) shippedEl.textContent = shippedCount;
    if (deliveredEl) deliveredEl.textContent = deliveredCount;
}

function updateCustomerStats() {
    const customers = getCustomers();
    const orders = getOrders();
    
    // Calculate new customers this month
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const newThisMonth = customers.filter(c => {
        if (!c.joined && !c.date) return false;
        const joinDate = new Date(c.joined || c.date);
        return joinDate.getMonth() === thisMonth && joinDate.getFullYear() === thisYear;
    }).length;
    
    // Calculate VIP members (customers with more than 3 orders or spent > 10000)
    const vipCount = customers.filter(c => {
        return (c.orders || 0) >= 3 || (c.totalSpent || c.spent || 0) >= 10000;
    }).length;
    
    // Update customer section stats
    const totalCustomersEl = document.querySelector('.customers-stats .stat-card:nth-child(1) .stat-info h3');
    const newThisMonthEl = document.querySelector('.customers-stats .stat-card:nth-child(2) .stat-info h3');
    const vipCountEl = document.querySelector('.customers-stats .stat-card:nth-child(3) .stat-info h3');
    
    if (totalCustomersEl) totalCustomersEl.textContent = customers.length.toLocaleString();
    if (newThisMonthEl) newThisMonthEl.textContent = newThisMonth;
    if (vipCountEl) vipCountEl.textContent = vipCount;
}

function updateAppointmentStats() {
    const appointments = getAppointments();
    const todayCount = appointments.length;
    const todayEl = document.getElementById('todayApptCount');
    if (todayEl) todayEl.textContent = todayCount;
}

// ============== PROFILE ==============
const profileUploadInput = document.getElementById('profileUploadInput');
const triggerProfileUpload = document.getElementById('triggerProfileUpload');
const profileDisplayLarge = document.getElementById('profileDisplayLarge');
const headerProfileImg = document.getElementById('headerProfileImg');
const sidebarAvatarImg = document.getElementById('sidebarAvatarImg');

triggerProfileUpload?.addEventListener('click', () => {
    profileUploadInput.click();
});

profileUploadInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imageData = event.target.result;
            // Update UI
            if (profileDisplayLarge) profileDisplayLarge.src = imageData;
            if (headerProfileImg) headerProfileImg.src = imageData;
            if (sidebarAvatarImg) sidebarAvatarImg.src = imageData;
            
            // Persist to localStorage
            localStorage.setItem('adminProfileDP', imageData);
            
            showToast('Profile picture updated!');
            addActivityLog('Updated profile picture');
        };
        reader.readAsDataURL(file);
    }
});

function loadProfileDP() {
    const savedDP = localStorage.getItem('adminProfileDP');
    if (savedDP) {
        if (profileDisplayLarge) profileDisplayLarge.src = savedDP;
        if (headerProfileImg) headerProfileImg.src = savedDP;
        if (sidebarAvatarImg) sidebarAvatarImg.src = savedDP;
    }
}

document.querySelectorAll('.profile-menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.profile-menu-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
        document.getElementById(`${item.dataset.tab}-tab`)?.classList.add('active');
    });
});

document.getElementById('editProfileBtn')?.addEventListener('click', () => {
    const form = document.getElementById('profileForm');
    const inputs = form.querySelectorAll('input:not([type="text"][value="Super Administrator"]), textarea');
    inputs.forEach(input => input.disabled = false);
    document.getElementById('profileActions').style.display = 'flex';
});

document.getElementById('cancelEdit')?.addEventListener('click', () => {
    const form = document.getElementById('profileForm');
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => input.disabled = true);
    document.getElementById('profileActions').style.display = 'none';
});

document.getElementById('profileForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Profile updated successfully!');
    const inputs = document.querySelectorAll('#profileForm input, #profileForm textarea');
    inputs.forEach(input => input.disabled = true);
    document.getElementById('profileActions').style.display = 'none';
});

document.getElementById('securityForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Password updated successfully!');
});

// ============== FILTERS ==============
document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
    renderProducts({ category: e.target.value });
});

document.getElementById('brandFilter')?.addEventListener('change', (e) => {
    renderProducts({ brand: e.target.value });
});

document.getElementById('productSearch')?.addEventListener('input', (e) => {
    renderProducts({ search: e.target.value });
});

// ============== LOGOUT ==============
document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const confirmed = await showConfirm({
        title: 'Logout',
        message: 'Are you sure you want to logout from the admin panel?',
        type: 'info',
        confirmClass: 'confirm',
        confirmIcon: 'fa-sign-out-alt',
        confirmText: 'Logout'
    });
    
    if (confirmed) {
        showToast('Logging out...', 'warning');
        // Clear admin session
        sessionStorage.removeItem('isAdmin');
        sessionStorage.removeItem('adminUser');
        // Redirect to main website after short delay
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    }
});

// ============== SEARCH CLEAR BUTTON ==============
const globalSearch = document.getElementById('globalSearch');
const searchClearBtn = document.getElementById('searchClearBtn');

globalSearch?.addEventListener('input', (e) => {
    if (e.target.value.length > 0) {
        searchClearBtn?.classList.add('visible');
    } else {
        searchClearBtn?.classList.remove('visible');
    }
});

searchClearBtn?.addEventListener('click', () => {
    if (globalSearch) {
        globalSearch.value = '';
        globalSearch.focus();
        searchClearBtn.classList.remove('visible');
    }
});

// ============== NOTIFICATION DROPDOWN ==============
const notificationBtn = document.getElementById('notificationBtn');
const notificationDropdown = document.getElementById('notificationDropdown');
const markAllReadBtn = document.getElementById('markAllRead');

notificationBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    notificationDropdown?.classList.toggle('active');
});

// Close notification dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (notificationDropdown && !notificationDropdown.contains(e.target) && e.target !== notificationBtn) {
        notificationDropdown.classList.remove('active');
    }
});

// Mark all notifications as read
markAllReadBtn?.addEventListener('click', () => {
    const unreadItems = document.querySelectorAll('.notification-item.unread');
    unreadItems.forEach(item => item.classList.remove('unread'));
    const notificationDot = document.querySelector('.notification-dot');
    if (notificationDot) notificationDot.style.display = 'none';
    showToast('All notifications marked as read');
});

// Close notifications function (called from View All link)
function closeNotifications() {
    notificationDropdown?.classList.remove('active');
}

// Dismiss individual notification
function dismissNotification(btn) {
    const notificationItem = btn.closest('.notification-item');
    if (notificationItem) {
        notificationItem.style.transform = 'translateX(100%)';
        notificationItem.style.opacity = '0';
        setTimeout(() => {
            notificationItem.remove();
            updateNotificationBadge();
            checkEmptyNotifications();
        }, 300);
    }
}

// Update notification badge count
function updateNotificationBadge() {
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    const badgeCount = document.querySelector('.notification-badge-count');
    const notificationDot = document.querySelector('.notification-dot');
    
    if (badgeCount) {
        if (unreadCount > 0) {
            badgeCount.textContent = `${unreadCount} New`;
            badgeCount.style.display = 'inline';
        } else {
            badgeCount.textContent = '0 New';
        }
    }
    
    if (notificationDot) {
        notificationDot.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

// Check if notifications list is empty
function checkEmptyNotifications() {
    const remainingItems = document.querySelectorAll('.notification-item');
    if (remainingItems.length === 0) {
        const notificationList = document.getElementById('notificationList');
        if (notificationList) {
            notificationList.innerHTML = '<div class="no-notifications"><i class="fas fa-bell-slash"></i><p>No notifications</p></div>';
        }
        const notificationDot = document.querySelector('.notification-dot');
        if (notificationDot) notificationDot.style.display = 'none';
        const badgeCount = document.querySelector('.notification-badge-count');
        if (badgeCount) badgeCount.textContent = '0 New';
    }
}

// Clear all notifications
function clearAllNotifications() {
    const notificationItems = document.querySelectorAll('.notification-item');
    notificationItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.transform = 'translateX(100%)';
            item.style.opacity = '0';
        }, index * 50);
    });
    
    setTimeout(() => {
        const notificationList = document.getElementById('notificationList');
        if (notificationList) {
            notificationList.innerHTML = '<div class="no-notifications"><i class="fas fa-bell-slash"></i><p>All notifications cleared</p></div>';
        }
        const notificationDot = document.querySelector('.notification-dot');
        if (notificationDot) notificationDot.style.display = 'none';
        const badgeCount = document.querySelector('.notification-badge-count');
        if (badgeCount) badgeCount.textContent = '0 New';
        showToast('All notifications cleared');
    }, notificationItems.length * 50 + 300);
}

// Notification tab filtering
document.querySelectorAll('.notification-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Update active tab
        document.querySelectorAll('.notification-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const filter = tab.dataset.filter;
        const notificationItems = document.querySelectorAll('.notification-item');
        
        notificationItems.forEach(item => {
            if (filter === 'all') {
                item.style.display = 'flex';
            } else {
                const itemType = item.dataset.type;
                item.style.display = itemType === filter ? 'flex' : 'none';
            }
        });
    });
});

// ============== MOBILE SIDEBAR TOGGLE (Global Functions) ==============
function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (sidebar?.classList.contains('active')) {
        sidebar.classList.remove('active');
        sidebarOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    } else {
        sidebar?.classList.add('active');
        sidebarOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    sidebar?.classList.remove('active');
    sidebarOverlay?.classList.remove('active');
    document.body.style.overflow = '';
}

// ============== GLOBAL SEARCH FUNCTIONALITY ==============
let searchTimeout = null;
let currentSearchResults = {
    products: [],
    orders: [],
    customers: [],
    appointments: []
};

function setupSearch() {
    const globalSearch = document.getElementById('globalSearch');
    const searchClearBtn = document.getElementById('searchClearBtn');
    const productSearch = document.getElementById('productSearch');
    const customerSearch = document.getElementById('customerSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const brandFilter = document.getElementById('brandFilter');
    
    // Global Search
    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Show/hide clear button
            if (searchClearBtn) {
                searchClearBtn.classList.toggle('visible', query.length > 0);
            }
            
            // Debounce search
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performGlobalSearch(query);
            }, 300);
        });
        
        // Handle Enter key
        globalSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = globalSearch.value.trim();
                if (query) {
                    performGlobalSearch(query);
                }
            }
        });
    }
    
    // Clear button
    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            if (globalSearch) {
                globalSearch.value = '';
                searchClearBtn.classList.remove('visible');
                clearSearch();
            }
        });
    }
    
    // Product Search
    if (productSearch) {
        productSearch.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            const category = categoryFilter?.value || '';
            const brand = brandFilter?.value || '';
            renderProducts({ search: query, category, brand });
        });
    }
    
    // Category Filter
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            const query = productSearch?.value.trim() || '';
            const brand = brandFilter?.value || '';
            renderProducts({ search: query, category: categoryFilter.value, brand });
        });
    }
    
    // Brand Filter
    if (brandFilter) {
        brandFilter.addEventListener('change', () => {
            const query = productSearch?.value.trim() || '';
            const category = categoryFilter?.value || '';
            renderProducts({ search: query, category, brand: brandFilter.value });
        });
    }
    
    // Customer Search
    if (customerSearch) {
        customerSearch.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            filterCustomers(query);
        });
    }
}

function performGlobalSearch(query) {
    if (!query || query.length < 2) {
        clearSearchForCurrentSection();
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    
    // Get the currently active section
    const activeSection = getActiveSection();
    
    // Search based on the current active section
    switch (activeSection) {
        case 'products':
            searchProducts(lowerQuery);
            break;
        case 'orders':
            searchOrders(lowerQuery);
            break;
        case 'customers':
            searchCustomers(lowerQuery);
            break;
        case 'appointments':
            searchAppointments(lowerQuery);
            break;
        case 'dashboard':
            // On dashboard, search all and show toast
            searchAllSections(lowerQuery, query);
            break;
        default:
            // For other sections like reports, settings, profile - search all
            searchAllSections(lowerQuery, query);
    }
}

function getActiveSection() {
    const activeSection = document.querySelector('.content-section.active');
    return activeSection ? activeSection.id : 'dashboard';
}

function searchProducts(query) {
    // Use getProducts() to get current products from SharedDataManager
    const allProducts = getProducts();
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.brand || '').toLowerCase().includes(query) ||
        (p.category || '').toLowerCase().includes(query) ||
        (p.price || 0).toString().includes(query) ||
        (p.sku || '').toLowerCase().includes(query) ||
        (p.description || '').toLowerCase().includes(query) ||
        (p.tags || []).join(' ').toLowerCase().includes(query)
    );
    
    if (filtered.length === 0) {
        showToast(`No products found for "${query}"`, 'warning');
        renderProducts(); // Show all products
    } else {
        renderFilteredProducts(filtered, query);
        showToast(`Found ${filtered.length} product${filtered.length > 1 ? 's' : ''}`);
    }
}

function searchOrders(query) {
    const filtered = sampleOrders.filter(o => 
        o.id.toLowerCase().includes(query) ||
        o.customer.name.toLowerCase().includes(query) ||
        o.customer.email.toLowerCase().includes(query) ||
        o.product.toLowerCase().includes(query) ||
        o.status.toLowerCase().includes(query) ||
        o.amount.toString().includes(query)
    );
    
    if (filtered.length === 0) {
        showToast(`No orders found for "${query}"`, 'warning');
        renderOrders(); // Show all orders
    } else {
        renderFilteredOrders(filtered, query);
        showToast(`Found ${filtered.length} order${filtered.length > 1 ? 's' : ''}`);
    }
}

function searchCustomers(query) {
    const filtered = sampleCustomers.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query) ||
        c.status.toLowerCase().includes(query)
    );
    
    if (filtered.length === 0) {
        showToast(`No customers found for "${query}"`, 'warning');
        renderCustomers(); // Show all customers
    } else {
        renderFilteredCustomers(filtered, query);
        showToast(`Found ${filtered.length} customer${filtered.length > 1 ? 's' : ''}`);
    }
}

function searchAppointments(query) {
    const filtered = sampleAppointments.filter(a => 
        a.customer.toLowerCase().includes(query) ||
        a.type.toLowerCase().includes(query) ||
        a.phone.toLowerCase().includes(query) ||
        a.time.toLowerCase().includes(query) ||
        a.status.toLowerCase().includes(query)
    );
    
    if (filtered.length === 0) {
        showToast(`No appointments found for "${query}"`, 'warning');
        renderAppointments(); // Show all appointments
    } else {
        renderFilteredAppointments(filtered, query);
        showToast(`Found ${filtered.length} appointment${filtered.length > 1 ? 's' : ''}`);
    }
}

function searchAllSections(lowerQuery, originalQuery) {
    // Search all sections
    currentSearchResults.products = sampleProducts.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.brand.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
    );
    
    currentSearchResults.orders = sampleOrders.filter(o => 
        o.id.toLowerCase().includes(lowerQuery) ||
        o.customer.name.toLowerCase().includes(lowerQuery) ||
        o.customer.email.toLowerCase().includes(lowerQuery) ||
        o.product.toLowerCase().includes(lowerQuery) ||
        o.status.toLowerCase().includes(lowerQuery)
    );
    
    currentSearchResults.customers = sampleCustomers.filter(c => 
        c.name.toLowerCase().includes(lowerQuery) ||
        c.email.toLowerCase().includes(lowerQuery) ||
        c.phone.toLowerCase().includes(lowerQuery)
    );
    
    currentSearchResults.appointments = sampleAppointments.filter(a => 
        a.customer.toLowerCase().includes(lowerQuery) ||
        a.type.toLowerCase().includes(lowerQuery) ||
        a.phone.toLowerCase().includes(lowerQuery)
    );
    
    // Determine which section has the most results and navigate there
    const resultCounts = {
        products: currentSearchResults.products.length,
        orders: currentSearchResults.orders.length,
        customers: currentSearchResults.customers.length,
        appointments: currentSearchResults.appointments.length
    };
    
    const totalResults = Object.values(resultCounts).reduce((a, b) => a + b, 0);
    
    if (totalResults === 0) {
        showToast(`No results found for "${originalQuery}"`, 'warning');
        return;
    }
    
    // Find section with most results
    const bestSection = Object.keys(resultCounts).reduce((a, b) => 
        resultCounts[a] > resultCounts[b] ? a : b
    );
    
    // Navigate to best matching section
    navigateTo(bestSection);
    
    // Apply filtered results to that section
    switch (bestSection) {
        case 'products':
            renderFilteredProducts(currentSearchResults.products, lowerQuery);
            break;
        case 'orders':
            renderFilteredOrders(currentSearchResults.orders, lowerQuery);
            break;
        case 'customers':
            renderFilteredCustomers(currentSearchResults.customers, lowerQuery);
            break;
        case 'appointments':
            renderFilteredAppointments(currentSearchResults.appointments, lowerQuery);
            break;
    }
    
    showToast(`Found ${totalResults} result${totalResults > 1 ? 's' : ''} for "${originalQuery}"`);
}

function clearSearchForCurrentSection() {
    const activeSection = getActiveSection();
    
    switch (activeSection) {
        case 'products':
            renderProducts();
            break;
        case 'orders':
            renderOrders();
            break;
        case 'customers':
            renderCustomers();
            break;
        case 'appointments':
            renderAppointments();
            break;
        default:
            // Reset all sections
            renderProducts();
            renderOrders();
            renderCustomers();
            renderAppointments();
    }
}

function renderFilteredProducts(products, query) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = products.map(p => {
        const brand = p.brand || 'noon';
        const category = p.category || 'eyewear';
        return `
        <div class="product-card" data-id="${p.id}">
            <div class="product-card-image">
                ${p.image 
                    ? `<img src="${p.image}" alt="${p.name}" class="product-img">`
                    : `<i class="fas ${category === 'sunglasses' || category === 'Sun' ? 'fa-sun' : category === 'lenses' ? 'fa-eye' : 'fa-glasses'}"></i>`
                }
                ${p.badge ? `<span class="product-badge ${p.badge}">${p.badge === 'bestseller' ? 'Bestseller' : p.badge === 'new' ? 'New' : '30% Off'}</span>` : ''}
            </div>
            <div class="product-card-body">
                <h3>${highlightText(p.name, query)}</h3>
                <p class="product-brand">${highlightText(brand.charAt(0).toUpperCase() + brand.slice(1), query)}</p>
                <p class="product-category">${highlightText(category.charAt(0).toUpperCase() + category.slice(1), query)}</p>
                <div class="product-meta">
                    <span class="product-stock ${p.stock === 0 ? 'out-stock' : p.stock < 10 ? 'low-stock' : 'in-stock'}">
                        <i class="fas fa-circle"></i> ${p.stock === 0 ? 'Out of Stock' : p.stock < 10 ? `Low Stock (${p.stock})` : `In Stock (${p.stock})`}
                    </span>
                </div>
                <div class="product-card-footer">
                    <span class="product-price">₹${(p.price || 0).toLocaleString()}</span>
                    <div class="product-actions">
                        <button class="action-btn edit" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `}).join('');
}

function renderFilteredOrders(orders, query) {
    const tbody = document.getElementById('ordersTableBody');
    const grid = document.getElementById('ordersGrid');
    
    const ordersHtml = orders.map(o => `
        <tr>
            <td><input type="checkbox"></td>
            <td><strong>#${highlightText(o.id, query)}</strong></td>
            <td>${o.date}</td>
            <td><div class="customer-cell"><div class="customer-avatar">${o.customer.initials}</div><div><span class="customer-name">${highlightText(o.customer.name, query)}</span><span class="customer-email">${highlightText(o.customer.email, query)}</span></div></div></td>
            <td>${highlightText(o.product, query)}</td>
            <td><strong>₹${o.amount.toLocaleString()}</strong></td>
            <td><span class="payment-badge ${o.payment}">${o.payment.charAt(0).toUpperCase() + o.payment.slice(1)}</span></td>
            <td><span class="status ${o.status}">${highlightText(o.status.charAt(0).toUpperCase() + o.status.slice(1), query)}</span></td>
            <td><div class="table-actions"><button class="table-action-btn" onclick="viewOrder('${o.id}')"><i class="fas fa-eye"></i></button><button class="table-action-btn" onclick="editOrder('${o.id}')"><i class="fas fa-edit"></i></button><button class="table-action-btn delete" onclick="deleteOrder('${o.id}')"><i class="fas fa-trash"></i></button></div></td>
        </tr>
    `).join('');

    if (tbody) tbody.innerHTML = ordersHtml;

    if (grid) {
        grid.innerHTML = orders.map(o => `
            <div class="order-card">
                <div class="card-header">
                    <span class="order-id">#${highlightText(o.id, query)}</span>
                    <span class="order-date">${o.date}</span>
                </div>
                <div class="order-card-body">
                    <div class="customer-cell">
                        <div class="customer-avatar">${o.customer.initials}</div>
                        <div>
                            <span class="customer-name">${highlightText(o.customer.name, query)}</span>
                            <span class="customer-email">${highlightText(o.customer.email, query)}</span>
                        </div>
                    </div>
                    <div class="order-product-info">
                        <p class="product-label">Products:</p>
                        <p class="product-names">${highlightText(o.product, query)}</p>
                    </div>
                    <div class="order-meta">
                        <div class="meta-item">
                            <span class="meta-label">Total Amount:</span>
                            <span class="meta-value amount">₹${o.amount.toLocaleString()}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Payment:</span>
                            <span class="payment-badge ${o.payment}">${o.payment.charAt(0).toUpperCase() + o.payment.slice(1)}</span>
                        </div>
                    </div>
                </div>
                <div class="order-card-footer">
                    <span class="status ${o.status}">${highlightText(o.status.charAt(0).toUpperCase() + o.status.slice(1), query)}</span>
                    <div class="table-actions">
                        <button class="table-action-btn" onclick="viewOrder('${o.id}')"><i class="fas fa-eye"></i></button>
                        <button class="table-action-btn" onclick="editOrder('${o.id}')"><i class="fas fa-edit"></i></button>
                        <button class="table-action-btn delete" onclick="deleteOrder('${o.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function renderFilteredCustomers(customers, query) {
    const tbody = document.getElementById('customersTableBody');
    const grid = document.getElementById('customersGrid');
    
    const customersHtml = customers.map(c => `
        <tr>
            <td><div class="customer-cell"><div class="customer-avatar">${c.name.split(' ').map(n => n[0]).join('')}</div><span class="customer-name">${highlightText(c.name, query)}</span></div></td>
            <td>${highlightText(c.email, query)}</td>
            <td>${highlightText(c.phone, query)}</td>
            <td>${c.orders}</td>
            <td><strong>₹${c.spent.toLocaleString()}</strong></td>
            <td><span class="status ${c.status}">${c.status === 'vip' ? 'VIP' : 'Active'}</span></td>
            <td><div class="table-actions"><button class="table-action-btn" onclick="viewCustomer(${c.id})"><i class="fas fa-eye"></i></button><button class="table-action-btn" onclick="editCustomer(${c.id})"><i class="fas fa-edit"></i></button><button class="table-action-btn delete" onclick="deleteCustomer(${c.id})"><i class="fas fa-trash"></i></button></div></td>
        </tr>
    `).join('');

    if (tbody) tbody.innerHTML = customersHtml;

    if (grid) {
        grid.innerHTML = customers.map(c => `
            <div class="customer-card">
                <div class="customer-card-header">
                    <div class="customer-avatar">${c.name.split(' ').map(n => n[0]).join('')}</div>
                    <div class="customer-info-main">
                        <h3>${highlightText(c.name, query)}</h3>
                        <span class="status ${c.status}">${c.status === 'vip' ? 'VIP Customer' : 'Active Member'}</span>
                    </div>
                </div>
                <div class="customer-card-body">
                    <div class="contact-info">
                        <p><i class="fas fa-envelope"></i> ${highlightText(c.email, query)}</p>
                        <p><i class="fas fa-phone"></i> ${highlightText(c.phone, query)}</p>
                    </div>
                    <div class="customer-card-stats">
                        <div class="card-stat-item">
                            <span class="label">Orders</span>
                            <span class="value">${c.orders}</span>
                        </div>
                        <div class="card-stat-item">
                            <span class="label">Total Spent</span>
                            <span class="value">₹${c.spent.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div class="customer-card-footer">
                    <div class="table-actions">
                        <button class="table-action-btn" onclick="viewCustomer(${c.id})"><i class="fas fa-eye"></i> View Profile</button>
                        <button class="table-action-btn" onclick="editCustomer(${c.id})"><i class="fas fa-edit"></i></button>
                        <button class="table-action-btn delete" onclick="deleteCustomer(${c.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function renderFilteredAppointments(appointments, query) {
    const list = document.getElementById('appointmentsList');
    if (!list) return;
    
    list.innerHTML = appointments.map(a => `
        <div class="appointment-item">
            <div class="time">${a.time}<br><small>${a.duration}</small></div>
            <div><h4>${highlightText(a.type, query)}</h4><p><i class="fas fa-user"></i> ${highlightText(a.customer, query)}</p><p><i class="fas fa-phone"></i> ${highlightText(a.phone, query)}</p></div>
            <span class="status ${a.status}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span>
            <div class="table-actions">
                <button class="table-action-btn" onclick="confirmAppointment(${a.id})"><i class="fas fa-check"></i></button>
                <button class="table-action-btn delete" onclick="cancelAppointment(${a.id})"><i class="fas fa-times"></i></button>
            </div>
        </div>
    `).join('');
}

function highlightText(text, query) {
    if (!query || !text) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.toString().replace(regex, '<mark class="search-highlight">$1</mark>');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function filterCustomers(query) {
    const tbody = document.getElementById('customersTableBody');
    const grid = document.getElementById('customersGrid');
    
    if (!query) {
        renderCustomers();
        return;
    }
    
    const filtered = sampleCustomers.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query)
    );
    
    renderFilteredCustomers(filtered, query);
}

function clearSearch() {
    // Reset all search results
    currentSearchResults = {
        products: [],
        orders: [],
        customers: [],
        appointments: []
    };
    
    // Re-render all sections with original data
    renderProducts();
    renderOrders();
    renderCustomers();
    renderAppointments();
}

// ============== ADMIN CREDENTIALS MANAGEMENT ==============
const ADMIN_CREDENTIALS_KEY = 'noonOpticals_adminCredentials';

function getAdminCredentials() {
    const saved = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    // Default credentials
    return {
        email: 'noon@gmail.com',
        password: 'noon@admin'
    };
}

function saveAdminCredentials(email, password) {
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify({ email, password }));
}

// Security form - Change password functionality
document.addEventListener('DOMContentLoaded', function() {
    const securityForm = document.getElementById('securityForm');
    if (securityForm) {
        securityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            const adminCreds = getAdminCredentials();
            
            // Validate current password
            if (currentPassword !== adminCreds.password) {
                showToast('Current password is incorrect!', 'error');
                return;
            }
            
            // Validate new password
            if (newPassword.length < 6) {
                showToast('New password must be at least 6 characters!', 'warning');
                return;
            }
            
            // Validate confirm password
            if (newPassword !== confirmPassword) {
                showToast('New passwords do not match!', 'error');
                return;
            }
            
            // Save new password
            saveAdminCredentials(adminCreds.email, newPassword);
            
            // Clear form
            securityForm.reset();
            
            // Add to activity log
            addActivityLog('Changed admin password');
            addNotification('security', 'Password Changed', 'Admin password was successfully updated', 'system');
            
            showToast('Password updated successfully!', 'success');
        });
    }
});

// ============== UNIFIED NOTIFICATION SYSTEM ==============
const NOTIFICATIONS_KEY = 'noonOpticals_notifications';

function getNotifications() {
    const saved = localStorage.getItem(NOTIFICATIONS_KEY);
    return saved ? JSON.parse(saved) : [];
}

function saveNotifications(notifications) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

function addNotification(type, title, message, category = 'system') {
    const notifications = getNotifications();
    
    const newNotification = {
        id: 'notif_' + Date.now(),
        type: type, // orders, alerts, system, customer
        category: category,
        title: title,
        message: message,
        time: new Date().toISOString(),
        read: false
    };
    
    notifications.unshift(newNotification);
    
    // Keep only last 50 notifications
    if (notifications.length > 50) {
        notifications.pop();
    }
    
    saveNotifications(notifications);
    renderNotifications();
    updateAllBadges(); // Use new badge system
}

function renderNotifications() {
    const notifications = getNotifications();
    
    // Render in header dropdown
    const dropdownList = document.getElementById('notificationList');
    if (dropdownList) {
        if (notifications.length === 0) {
            dropdownList.innerHTML = '<div class="no-notifications" style="text-align: center; padding: 40px; color: #666;"><i class="fas fa-bell-slash" style="font-size: 32px; margin-bottom: 10px; opacity: 0.5;"></i><p>No notifications</p></div>';
        } else {
            dropdownList.innerHTML = notifications.slice(0, 10).map(n => {
                const timeAgo = getTimeAgo(n.time);
                const iconClass = getNotificationIcon(n.type);
                return `
                    <div class="notification-item ${n.read ? '' : 'unread'}" data-type="${n.category}" data-id="${n.id}">
                        <div class="notification-icon ${n.type}">
                            <i class="fas ${iconClass}"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-title">${n.title}</div>
                            <p>${n.message}</p>
                            <div class="notification-meta">
                                <span class="notification-time"><i class="fas fa-clock"></i> ${timeAgo}</span>
                            </div>
                        </div>
                        <button class="notification-close" onclick="dismissNotificationById('${n.id}')" title="Dismiss"><i class="fas fa-times"></i></button>
                    </div>
                `;
            }).join('');
        }
    }
    
    // Render in notifications page
    const fullList = document.getElementById('notificationsFullList');
    if (fullList) {
        const emptyView = document.getElementById('emptyNotifView');
        if (notifications.length === 0) {
            fullList.innerHTML = '';
            if (emptyView) emptyView.style.display = 'block';
        } else {
            if (emptyView) emptyView.style.display = 'none';
            fullList.innerHTML = notifications.map(n => {
                const timeAgo = getTimeAgo(n.time);
                const iconClass = getNotificationIcon(n.type);
                return `
                    <div class="full-notif-item ${n.read ? '' : 'unread'}" data-category="${n.category}" data-id="${n.id}">
                        <div class="notif-full-icon ${n.type}"><i class="fas ${iconClass}"></i></div>
                        <div class="notif-full-details">
                            <div class="notif-full-header">
                                <h3>${n.title}</h3>
                                <span class="notif-full-time">${timeAgo}</span>
                            </div>
                            <p>${n.message}</p>
                            <div class="notif-full-actions">
                                <button class="btn btn-sm btn-outline" onclick="dismissNotificationById('${n.id}')"><i class="fas fa-times"></i> Dismiss</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

function getNotificationIcon(type) {
    const icons = {
        orders: 'fa-shopping-bag',
        alerts: 'fa-exclamation-triangle',
        system: 'fa-cog',
        customer: 'fa-user-plus',
        security: 'fa-shield-alt',
        product: 'fa-glasses',
        appointment: 'fa-calendar-check',
        success: 'fa-check-circle'
    };
    return icons[type] || 'fa-bell';
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + ' mins ago';
    if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
    if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
    return time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function updateNotificationBadges() {
    const notifications = getNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;
    
    // Update header badge
    const headerBadge = document.querySelector('.notification-badge-count');
    if (headerBadge) {
        headerBadge.textContent = unreadCount > 0 ? unreadCount + ' New' : '0';
    }
    
    // Update sidebar badge
    const sidebarBadge = document.querySelector('.notification-badge-count-sidebar');
    if (sidebarBadge) {
        sidebarBadge.textContent = unreadCount;
        sidebarBadge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
    }
    
    // Update notification dot
    const notifDot = document.querySelector('.notification-dot');
    if (notifDot) {
        notifDot.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

function dismissNotificationById(id) {
    let notifications = getNotifications();
    notifications = notifications.filter(n => n.id !== id);
    saveNotifications(notifications);
    renderNotifications();
    updateAllBadges();
}

function markAllRead() {
    // Mark section as read when marking all as read
    markSectionAsRead('notifications');
    showToast('All notifications marked as read', 'success');
}

function clearAllNotifications() {
    saveNotifications([]);
    // Also clear the tracking for notifications
    const tracking = getBadgeTracking();
    tracking.lastSeenNotifications = [];
    saveBadgeTracking(tracking);
    renderNotifications();
    updateAllBadges();
    showToast('All notifications cleared', 'success');
}

function clearActivityLog() {
    if (typeof SharedDataManager !== 'undefined') {
        localStorage.removeItem('noonOpticals_activityLog');
    }
    activityLog = [];
    renderActivityLog();
    showToast('Activity log cleared', 'success');
}

// Override the addActivityLog to also create notification
const originalAddActivityLog = typeof addActivityLog === 'function' ? addActivityLog : null;

function addActivityLog(action) {
    // Use SharedDataManager if available
    if (typeof SharedDataManager !== 'undefined') {
        SharedDataManager.addActivityLogEntry(action);
    } else {
        const newActivity = {
            action: action,
            time: 'Just now'
        };
        activityLog.unshift(newActivity);
        if (activityLog.length > 10) activityLog.pop();
    }
    renderActivityLog();
    
    // Also add as notification
    const notifType = action.toLowerCase().includes('order') ? 'orders' :
                      action.toLowerCase().includes('customer') ? 'customer' :
                      action.toLowerCase().includes('product') ? 'product' :
                      action.toLowerCase().includes('appointment') ? 'appointment' : 'system';
    
    // Extract title from action (strip HTML)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = action;
    const plainText = tempDiv.textContent || tempDiv.innerText;
    
    addNotification(notifType, plainText.slice(0, 30) + (plainText.length > 30 ? '...' : ''), plainText, notifType);
}

// ============== EXPORT FUNCTIONALITY ==============
function exportData(type) {
    let data = [];
    let filename = '';
    let headers = [];
    
    switch(type) {
        case 'products':
            data = getProducts();
            filename = `NoonOpticals_Products_${getDateString()}`;
            headers = ['ID', 'Name', 'Category', 'Brand', 'Price', 'Stock', 'Status', 'Rating', 'SKU'];
            data = data.map(p => ({
                'ID': p.id,
                'Name': p.name,
                'Category': p.category || '',
                'Brand': (p.brand || 'noon').toUpperCase(),
                'Price': (p.price || 0).toLocaleString('en-IN'),
                'Stock': p.stock || 0,
                'Status': p.stock > 0 ? (p.stock < 10 ? 'Low Stock' : 'In Stock') : 'Out of Stock',
                'Rating': p.rating || 'N/A',
                'SKU': p.sku || ''
            }));
            break;
            
        case 'orders':
            data = getOrders();
            filename = `NoonOpticals_Orders_${getDateString()}`;
            headers = ['Order ID', 'Date', 'Customer', 'Email', 'Product', 'Amount', 'Payment', 'Status'];
            data = data.map(o => ({
                'Order ID': o.id,
                'Date': o.date,
                'Customer': o.customer?.name || 'N/A',
                'Email': o.customer?.email || 'N/A',
                'Product': o.product || 'Multiple Items',
                'Amount': (o.amount || 0).toLocaleString('en-IN'),
                'Payment': (o.payment || 'pending').toUpperCase(),
                'Status': (o.status || 'pending').toUpperCase()
            }));
            break;
            
        case 'customers':
            data = getCustomers();
            filename = `NoonOpticals_Customers_${getDateString()}`;
            headers = ['ID', 'Name', 'Email', 'Phone', 'Orders', 'Total Spent', 'Status', 'Joined'];
            data = data.map(c => ({
                'ID': c.id,
                'Name': c.name,
                'Email': c.email,
                'Phone': c.phone || 'N/A',
                'Orders': c.orders || 0,
                'Total Spent': (c.totalSpent || c.spent || 0).toLocaleString('en-IN'),
                'Status': (c.status || 'active').toUpperCase(),
                'Joined': c.joined || c.date || 'N/A'
            }));
            break;
            
        case 'appointments':
            data = getAppointments();
            filename = `NoonOpticals_Appointments_${getDateString()}`;
            headers = ['ID', 'Customer', 'Email', 'Phone', 'Service', 'Date', 'Time', 'Status'];
            data = data.map(a => ({
                'ID': a.id,
                'Customer': a.customer?.name || a.name || 'N/A',
                'Email': a.customer?.email || a.email || 'N/A',
                'Phone': a.customer?.phone || a.phone || 'N/A',
                'Service': a.service || 'Eye Examination',
                'Date': a.date,
                'Time': a.time,
                'Status': (a.status || 'pending').toUpperCase()
            }));
            break;
            
        case 'reports':
            // Export summary report
            exportSummaryReport();
            return;
            
        default:
            showToast('Unknown export type', 'error');
            return;
    }
    
    if (data.length === 0) {
        showToast(`No ${type} data to export`, 'warning');
        return;
    }
    
    // Show export format options
    showExportOptions(data, filename, type);
}

function showExportOptions(data, filename, type) {
    // Create export modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'exportModal';
    modal.innerHTML = `
        <div class="modal" style="max-width: 400px;">
            <div class="modal-header">
                <h2><i class="fas fa-download"></i> Export ${type.charAt(0).toUpperCase() + type.slice(1)}</h2>
                <button class="modal-close" onclick="closeExportModal()">&times;</button>
            </div>
            <div class="modal-body" style="padding: 30px;">
                <p style="margin-bottom: 20px; color: #666;">Choose export format:</p>
                <div style="display: flex; gap: 15px; flex-direction: column;">
                    <button class="btn btn-primary" onclick="downloadPDF('${type}')" style="padding: 15px; font-size: 16px;">
                        <i class="fas fa-file-pdf"></i> Export as PDF
                    </button>
                    <button class="btn btn-outline" onclick="downloadCSV()" style="padding: 15px; font-size: 16px;">
                        <i class="fas fa-file-csv"></i> Export as CSV
                    </button>
                    <button class="btn btn-outline" onclick="downloadExcel()" style="padding: 15px; font-size: 16px;">
                        <i class="fas fa-file-excel"></i> Export as Excel
                    </button>
                    <button class="btn btn-outline" onclick="downloadJSON()" style="padding: 15px; font-size: 16px;">
                        <i class="fas fa-file-code"></i> Export as JSON
                    </button>
                </div>
                <p style="margin-top: 20px; font-size: 13px; color: #888; text-align: center;">
                    <i class="fas fa-info-circle"></i> ${data.length} records will be exported
                </p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Store data for download functions
    window._exportData = data;
    window._exportFilename = filename;
    
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function downloadCSV() {
    const data = window._exportData;
    const filename = window._exportFilename;
    
    if (!data || data.length === 0) return;
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content with branding header
    let csv = '';
    csv += 'NOON OPTICALS - Premium Eyewear Solutions\n';
    csv += `Report Generated: ${new Date().toLocaleString('en-IN')}\n`;
    csv += `Total Records: ${data.length}\n`;
    csv += '\n'; // Empty line before data
    csv += headers.join(',') + '\n';
    
    data.forEach(row => {
        const values = headers.map(header => {
            let value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma
            value = String(value).replace(/"/g, '""');
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                value = `"${value}"`;
            }
            return value;
        });
        csv += values.join(',') + '\n';
    });
    
    // Add footer
    csv += '\n';
    csv += `© ${new Date().getFullYear()} Noon Opticals - Confidential Business Document\n`;
    
    // Download
    downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
    closeExportModal();
    showToast(`Downloaded CSV with ${data.length} records`, 'success');
    addActivityLog(`Exported ${data.length} records to CSV`);
}

function downloadExcel() {
    const data = window._exportData;
    const filename = window._exportFilename;
    
    if (!data || data.length === 0) return;
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create HTML table for Excel
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">';
    html += '<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';
    html += '<x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>';
    html += '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>';
    html += '<body><table border="1">';
    
    // Header row
    html += '<tr>';
    headers.forEach(h => {
        html += `<th style="background:#333;color:#fff;padding:10px;font-weight:bold;">${h}</th>`;
    });
    html += '</tr>';
    
    // Data rows
    data.forEach(row => {
        html += '<tr>';
        headers.forEach(h => {
            html += `<td style="padding:8px;">${row[h] || ''}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</table></body></html>';
    
    // Download
    downloadFile(html, `${filename}.xls`, 'application/vnd.ms-excel');
    closeExportModal();
    showToast(`Exported ${data.length} records to Excel`, 'success');
    addActivityLog(`Exported ${data.length} records to Excel`);
}

function downloadJSON() {
    const data = window._exportData;
    const filename = window._exportFilename;
    
    if (!data || data.length === 0) return;
    
    const json = JSON.stringify(data, null, 2);
    
    downloadFile(json, `${filename}.json`, 'application/json');
    closeExportModal();
    showToast(`Exported ${data.length} records to JSON`, 'success');
    addActivityLog(`Exported ${data.length} records to JSON`);
}

function downloadPDF(type) {
    const data = window._exportData;
    const filename = window._exportFilename;
    
    if (!data || data.length === 0) return;
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Check if jsPDF is available
    if (typeof window.jspdf === 'undefined') {
        showToast('PDF library loading, please try again...', 'warning');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Brand colors
    const primaryColor = [26, 26, 46]; // #1a1a2e
    const accentColor = [148, 163, 184]; // #94A3B8
    
    // Add logo/brand header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F');
    
    // Brand name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('NOON OPTICALS', 105, 18, { align: 'center' });
    
    // Tagline
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium Eyewear Solutions', 105, 26, { align: 'center' });
    
    // Report title
    doc.setTextColor(...primaryColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, 14, 48);
    
    // Meta info
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 55);
    doc.text(`Total Records: ${data.length}`, 14, 60);
    
    // Prepare table data
    const tableHeaders = headers;
    const tableData = data.map(row => headers.map(h => String(row[h] || '-')));
    
    // Add table using autoTable
    doc.autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: 68,
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8,
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [50, 50, 50]
        },
        alternateRowStyles: {
            fillColor: [248, 249, 250]
        },
        columnStyles: {
            0: { cellWidth: 'auto' }
        },
        margin: { left: 14, right: 14 },
        didDrawPage: function(data) {
            // Footer on each page
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `© ${new Date().getFullYear()} Noon Opticals - Page ${doc.internal.getNumberOfPages()}`,
                105,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }
    });
    
    // Save the PDF
    doc.save(`${filename}.pdf`);
    
    closeExportModal();
    showToast(`Downloaded PDF with ${data.length} records`, 'success');
    addActivityLog(`Exported ${data.length} records to PDF`);
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function getDateString() {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}

function exportSummaryReport() {
    const products = getProducts();
    const orders = getOrders();
    const customers = getCustomers();
    const appointments = getAppointments();
    
    // Calculate summary stats
    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
    
    const report = {
        'Report Generated': new Date().toLocaleString('en-IN'),
        'Business Name': 'Noon Opticals',
        '---': '--- SUMMARY ---',
        'Total Products': totalProducts,
        'Total Orders': totalOrders,
        'Total Customers': totalCustomers,
        'Total Appointments': appointments.length,
        '----': '--- REVENUE ---',
        'Total Revenue': 'Rs. ' + totalRevenue.toLocaleString('en-IN'),
        'Average Order Value': 'Rs. ' + (totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString('en-IN') : '0'),
        '-----': '--- ORDER STATUS ---',
        'Pending Orders': pendingOrders,
        'Completed Orders': completedOrders,
        'Processing Orders': orders.filter(o => o.status === 'processing').length,
        'Shipped Orders': orders.filter(o => o.status === 'shipped').length,
        '------': '--- INVENTORY ---',
        'In Stock Products': products.filter(p => (p.stock || 0) > 10).length,
        'Low Stock Products': products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length,
        'Out of Stock': products.filter(p => (p.stock || 0) === 0).length
    };
    
    // Convert to text format
    let reportText = '='.repeat(50) + '\n';
    reportText += '       NOON OPTICALS - BUSINESS REPORT\n';
    reportText += '='.repeat(50) + '\n\n';
    
    Object.entries(report).forEach(([key, value]) => {
        if (key.startsWith('-')) {
            reportText += '\n' + value + '\n';
        } else {
            reportText += `${key}: ${value}\n`;
        }
    });
    
    reportText += '\n' + '='.repeat(50);
    
    downloadFile(reportText, `NoonOpticals_Report_${getDateString()}.txt`, 'text/plain');
    showToast('Summary report exported successfully', 'success');
    addActivityLog('Exported business summary report');
}

function openOrderFilter() {
    showToast('Filter options coming soon!', 'info');
}

// ============== EMAIL FUNCTIONS ==============
function openSendEmailModal(email, name) {
    const modal = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    title.textContent = 'Send Email to Customer';
    body.innerHTML = `
        <form class="profile-form" onsubmit="sendCustomerEmail(event)">
            <div class="form-group">
                <label>To</label>
                <input type="email" id="emailTo" value="${email}" readonly style="background: #f5f5f5;">
            </div>
            <div class="form-group">
                <label>Customer Name</label>
                <input type="text" id="emailName" value="${name}" readonly style="background: #f5f5f5;">
            </div>
            <div class="form-group">
                <label>Subject</label>
                <input type="text" id="emailSubject" placeholder="Enter email subject..." required>
            </div>
            <div class="form-group">
                <label>Message</label>
                <textarea id="emailMessage" rows="6" placeholder="Enter your message here..." required style="resize: vertical;"></textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Send Email</button>
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
            </div>
        </form>`;
    modal.classList.add('active');
}

async function sendCustomerEmail(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailTo').value;
    const name = document.getElementById('emailName').value;
    const subject = document.getElementById('emailSubject').value;
    const message = document.getElementById('emailMessage').value;
    
    if (!email || !subject || !message) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (typeof AdminEmailService === 'undefined') {
        showToast('Email service not available', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    try {
        const result = await AdminEmailService.sendCustomEmail(email, name, subject, message);
        
        if (result.success) {
            showToast(`Email sent to ${name}!`, 'success');
            addActivityLog(`Sent email to <strong>${name}</strong> (${email})`);
            closeModal();
        } else {
            showToast('Failed to send email: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Email error:', error);
        showToast('Failed to send email', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Send email to all customers (for promotions/newsletters)
function openBulkEmailModal() {
    const customers = getCustomers();
    
    const modal = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    
    title.textContent = 'Send Email to All Customers';
    body.innerHTML = `
        <form class="profile-form" onsubmit="sendBulkEmail(event)">
            <div class="form-group" style="background: #fff3cd; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <p style="margin: 0; color: #856404;"><i class="fas fa-users"></i> This will send an email to <strong>${customers.length}</strong> customers</p>
            </div>
            <div class="form-group">
                <label>Subject</label>
                <input type="text" id="bulkEmailSubject" placeholder="e.g., New Arrivals at NOON Opticals!" required>
            </div>
            <div class="form-group">
                <label>Message</label>
                <textarea id="bulkEmailMessage" rows="8" placeholder="Enter your promotional message here..." required style="resize: vertical;"></textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Send to All (${customers.length})</button>
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
            </div>
        </form>`;
    modal.classList.add('active');
}

async function sendBulkEmail(e) {
    e.preventDefault();
    
    const subject = document.getElementById('bulkEmailSubject').value;
    const message = document.getElementById('bulkEmailMessage').value;
    const customers = getCustomers();
    
    if (!subject || !message) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (typeof AdminEmailService === 'undefined') {
        showToast('Email service not available', 'error');
        return;
    }
    
    const confirmed = await showConfirm({
        title: 'Send Bulk Email',
        message: `Are you sure you want to send this email to ${customers.length} customers?`,
        type: 'info',
        confirmClass: 'confirm',
        confirmIcon: 'fa-paper-plane',
        confirmText: 'Send All'
    });
    
    if (!confirmed) return;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    let successCount = 0;
    let failCount = 0;
    
    try {
        for (const customer of customers) {
            if (customer.email) {
                try {
                    const result = await AdminEmailService.sendCustomEmail(customer.email, customer.name, subject, message);
                    if (result.success) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                    // Rate limiting - wait 500ms between emails
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (err) {
                    failCount++;
                }
            }
        }
        
        showToast(`Emails sent: ${successCount} success, ${failCount} failed`, successCount > 0 ? 'success' : 'error');
        addActivityLog(`Sent bulk email to <strong>${successCount}</strong> customers`);
        closeModal();
    } catch (error) {
        console.error('Bulk email error:', error);
        showToast('Failed to send bulk emails', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ============== LOAD ADMIN PROFILE INFO ==============
function loadAdminProfile() {
    // Get admin email from session storage (set during login)
    let adminEmail = sessionStorage.getItem('adminUser');
    
    // Also check saved admin credentials
    const savedCreds = localStorage.getItem('noonOpticals_adminCredentials');
    if (savedCreds) {
        const creds = JSON.parse(savedCreds);
        if (creds.email) {
            adminEmail = creds.email;
            sessionStorage.setItem('adminUser', adminEmail); // Keep session in sync
        }
    }
    
    // Load saved profile info
    const savedProfile = localStorage.getItem('noonOpticals_adminProfile');
    let profileData = null;
    if (savedProfile) {
        profileData = JSON.parse(savedProfile);
    }
    
    if (adminEmail || profileData) {
        // Update email field in profile section
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.value = adminEmail || (profileData ? profileData.email : '');
        }
        
        // Get name from saved profile or extract from email
        let firstName = profileData ? profileData.firstName : '';
        let lastName = profileData ? profileData.lastName : '';
        
        if (!firstName && adminEmail) {
            // Extract name from email for display (before @ symbol)
            const adminName = adminEmail.split('@')[0];
            firstName = adminName.charAt(0).toUpperCase() + adminName.slice(1);
        }
        
        // Update first name field
        const firstNameField = document.getElementById('firstName');
        if (firstNameField) {
            firstNameField.value = firstName;
        }
        
        // Update last name field
        const lastNameField = document.getElementById('lastName');
        if (lastNameField && lastName) {
            lastNameField.value = lastName;
        }
        
        // Update phone field
        const phoneField = document.getElementById('phone');
        if (phoneField && profileData && profileData.phone) {
            phoneField.value = profileData.phone;
        }
        
        // Update department field
        const deptField = document.getElementById('department');
        if (deptField && profileData && profileData.department) {
            deptField.value = profileData.department;
        }
        
        // Update address field
        const addressField = document.getElementById('address');
        if (addressField && profileData && profileData.address) {
            addressField.value = profileData.address;
        }
        
        // Update profile name displays
        const displayName = firstName + (lastName ? ' ' + lastName : '');
        const profileName = document.querySelector('.profile-name');
        if (profileName) {
            profileName.textContent = displayName;
        }
        
        // Update sidebar admin name
        const sidebarAdminName = document.querySelector('.admin-name');
        if (sidebarAdminName) {
            sidebarAdminName.textContent = firstName;
        }
        
        // Update sidebar admin role/email display
        const sidebarAdminRole = document.querySelector('.admin-role');
        if (sidebarAdminRole) {
            sidebarAdminRole.textContent = adminEmail || '';
        }
        
        console.log('✅ Admin profile loaded:', adminEmail);
    }
}

// ============== PROFILE FORM HANDLING ==============
function setupProfileForm() {
    const editBtn = document.getElementById('editProfileBtn');
    const cancelBtn = document.getElementById('cancelEdit');
    const profileForm = document.getElementById('profileForm');
    const profileActions = document.getElementById('profileActions');
    
    // Editable fields
    const editableFields = ['firstName', 'lastName', 'email', 'phone', 'department', 'address'];
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            // Enable editing
            editableFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) field.disabled = false;
            });
            profileActions.style.display = 'flex';
            editBtn.style.display = 'none';
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            // Cancel editing - reload original values
            loadAdminProfile();
            editableFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) field.disabled = true;
            });
            profileActions.style.display = 'none';
            editBtn.style.display = 'inline-flex';
        });
    }
    
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newEmail = document.getElementById('email').value.trim();
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            
            // Validate email
            if (!newEmail || !newEmail.includes('@')) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            // Get current admin credentials
            const savedCreds = localStorage.getItem('noonOpticals_adminCredentials');
            const currentCreds = savedCreds ? JSON.parse(savedCreds) : { email: 'noon@gmail.com', password: 'noon@admin' };
            
            // Update admin credentials with new email
            const updatedCreds = {
                email: newEmail,
                password: currentCreds.password // Keep existing password
            };
            localStorage.setItem('noonOpticals_adminCredentials', JSON.stringify(updatedCreds));
            
            // Update session storage with new email
            sessionStorage.setItem('adminUser', newEmail);
            
            // Save profile info to localStorage
            const profileInfo = {
                firstName: firstName,
                lastName: lastName,
                email: newEmail,
                phone: document.getElementById('phone').value,
                department: document.getElementById('department').value,
                address: document.getElementById('address').value
            };
            localStorage.setItem('noonOpticals_adminProfile', JSON.stringify(profileInfo));
            
            // Update UI displays
            const profileName = document.querySelector('.profile-name');
            if (profileName) {
                profileName.textContent = firstName + (lastName ? ' ' + lastName : '');
            }
            
            const sidebarAdminName = document.querySelector('.admin-name');
            if (sidebarAdminName) {
                sidebarAdminName.textContent = firstName;
            }
            
            const sidebarAdminRole = document.querySelector('.admin-role');
            if (sidebarAdminRole) {
                sidebarAdminRole.textContent = newEmail;
            }
            
            // Disable fields and hide actions
            editableFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) field.disabled = true;
            });
            profileActions.style.display = 'none';
            document.getElementById('editProfileBtn').style.display = 'inline-flex';
            
            showToast('Profile updated successfully! Admin login email is now: ' + newEmail, 'success');
            addActivityLog('Updated admin profile - Email changed to <strong>' + newEmail + '</strong>');
        });
    }
}

// ============== SECURITY & FORGOT PASSWORD ==============
function setupSecurityForms() {
    const securityForm = document.getElementById('securityForm');
    const securityQuestionForm = document.getElementById('securityQuestionForm');
    const securityQuestionSelect = document.getElementById('securityQuestion');
    const customQuestionGroup = document.getElementById('customQuestionGroup');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeForgotPassword = document.getElementById('closeForgotPassword');
    const verifySecurityForm = document.getElementById('verifySecurityForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const masterResetBtn = document.getElementById('masterResetBtn');
    const resetWithSecurityBtn = document.getElementById('resetWithSecurityBtn');
    const resetDirectBtn = document.getElementById('resetDirectBtn');
    const backToMethodsBtn = document.getElementById('backToMethodsBtn');
    
    // Load existing security question status
    loadSecurityQuestionStatus();
    
    // Reset method buttons
    if (resetWithSecurityBtn) {
        resetWithSecurityBtn.addEventListener('click', () => {
            showSecurityQuestionStep();
        });
    }
    
    if (resetDirectBtn) {
        resetDirectBtn.addEventListener('click', () => {
            showDirectResetStep();
        });
    }
    
    if (backToMethodsBtn) {
        backToMethodsBtn.addEventListener('click', () => {
            document.getElementById('forgotStep1').style.display = 'block';
            document.getElementById('forgotStepSecurity').style.display = 'none';
            document.getElementById('forgotStep2').style.display = 'none';
        });
    }
    
    // Show/hide custom question field
    if (securityQuestionSelect) {
        securityQuestionSelect.addEventListener('change', () => {
            if (securityQuestionSelect.value === 'custom') {
                customQuestionGroup.style.display = 'block';
            } else {
                customQuestionGroup.style.display = 'none';
            }
        });
    }
    
    // Save security question
    if (securityQuestionForm) {
        securityQuestionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const questionType = document.getElementById('securityQuestion').value;
            const customQuestion = document.getElementById('customQuestion').value;
            const answer = document.getElementById('securityAnswer').value.trim().toLowerCase();
            
            if (!questionType) {
                showToast('Please select a security question', 'error');
                return;
            }
            
            if (!answer) {
                showToast('Please enter your answer', 'error');
                return;
            }
            
            // Get the actual question text
            let questionText = '';
            const questionMap = {
                'pet': "What is your pet's name?",
                'city': 'What city were you born in?',
                'school': "What was your first school's name?",
                'food': 'What is your favorite food?',
                'custom': customQuestion
            };
            questionText = questionMap[questionType];
            
            // Save security question
            const securityData = {
                question: questionText,
                answer: answer // Stored lowercase for case-insensitive comparison
            };
            localStorage.setItem('noonOpticals_securityQuestion', JSON.stringify(securityData));
            
            // Show success status
            const statusEl = document.getElementById('securityStatus');
            statusEl.className = 'security-status success';
            statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Security question saved successfully!';
            statusEl.style.display = 'block';
            
            showToast('Security question saved!', 'success');
            addActivityLog('Set up security question for password recovery');
            
            // Clear form
            document.getElementById('securityAnswer').value = '';
        });
    }
    
    // Password change form
    if (securityForm) {
        securityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Get current credentials
            const savedCreds = localStorage.getItem('noonOpticals_adminCredentials');
            const creds = savedCreds ? JSON.parse(savedCreds) : { email: 'noon@gmail.com', password: 'noon@admin' };
            
            // Verify current password
            if (currentPassword !== creds.password) {
                showToast('Current password is incorrect', 'error');
                return;
            }
            
            // Check new passwords match
            if (newPassword !== confirmPassword) {
                showToast('New passwords do not match', 'error');
                return;
            }
            
            // Check minimum length
            if (newPassword.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
            
            // Update password
            creds.password = newPassword;
            localStorage.setItem('noonOpticals_adminCredentials', JSON.stringify(creds));
            
            showToast('Password updated successfully!', 'success');
            addActivityLog('Changed admin password');
            
            // Clear form
            securityForm.reset();
        });
    }
    
    // Open forgot password modal
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', () => {
            openForgotPasswordModal();
        });
    }
    
    // Close forgot password modal
    if (closeForgotPassword) {
        closeForgotPassword.addEventListener('click', () => {
            forgotPasswordModal.style.display = 'none';
        });
    }
    
    // Close on overlay click
    if (forgotPasswordModal) {
        forgotPasswordModal.addEventListener('click', (e) => {
            if (e.target === forgotPasswordModal) {
                forgotPasswordModal.style.display = 'none';
            }
        });
    }
    
    // Verify security answer
    if (verifySecurityForm) {
        verifySecurityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const answer = document.getElementById('verifyAnswer').value.trim().toLowerCase();
            const savedSecurity = localStorage.getItem('noonOpticals_securityQuestion');
            
            if (!savedSecurity) {
                showToast('No security question set up', 'error');
                return;
            }
            
            const securityData = JSON.parse(savedSecurity);
            
            if (answer === securityData.answer) {
                // Correct answer - show password reset form
                document.getElementById('forgotStepSecurity').style.display = 'none';
                document.getElementById('forgotStep2').style.display = 'block';
                showToast('Answer verified! Set your new password.', 'success');
            } else {
                showToast('Incorrect answer. Please try again.', 'error');
            }
        });
    }
    
    // Reset password form
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newPassword = document.getElementById('resetNewPassword').value;
            const confirmPassword = document.getElementById('resetConfirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
            
            // Get current credentials and update password
            const savedCreds = localStorage.getItem('noonOpticals_adminCredentials');
            const creds = savedCreds ? JSON.parse(savedCreds) : { email: 'noon@gmail.com', password: 'noon@admin' };
            creds.password = newPassword;
            localStorage.setItem('noonOpticals_adminCredentials', JSON.stringify(creds));
            
            showToast('Password reset successfully!', 'success');
            addActivityLog('Reset admin password via security question');
            
            // Close modal
            forgotPasswordModal.style.display = 'none';
            
            // Reset modal state
            document.getElementById('forgotStep1').style.display = 'block';
            document.getElementById('forgotStep2').style.display = 'none';
            document.getElementById('verifyAnswer').value = '';
            resetPasswordForm.reset();
        });
    }
    
    // Master reset button
    if (masterResetBtn) {
        masterResetBtn.addEventListener('click', () => {
            showConfirmDialog(
                'Master Reset Credentials',
                'This will reset admin credentials to default:<br><br><strong>Email:</strong> noon@gmail.com<br><strong>Password:</strong> noon@admin<br><br>Are you sure?',
                () => {
                    // Reset to default credentials
                    const defaultCreds = {
                        email: 'noon@gmail.com',
                        password: 'noon@admin'
                    };
                    localStorage.setItem('noonOpticals_adminCredentials', JSON.stringify(defaultCreds));
                    localStorage.removeItem('noonOpticals_securityQuestion');
                    localStorage.removeItem('noonOpticals_adminProfile');
                    
                    showToast('Credentials reset to default!', 'success');
                    addActivityLog('Master reset - Admin credentials restored to default');
                    
                    // Close modal
                    forgotPasswordModal.style.display = 'none';
                    
                    // Reload profile
                    loadAdminProfile();
                    loadSecurityQuestionStatus();
                }
            );
        });
    }
}

function openForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    
    // Reset modal state - show method selection
    document.getElementById('forgotStep1').style.display = 'block';
    document.getElementById('forgotStepSecurity').style.display = 'none';
    document.getElementById('forgotStep2').style.display = 'none';
    document.getElementById('verifyAnswer').value = '';
    
    modal.style.display = 'flex';
}

function showSecurityQuestionStep() {
    const savedSecurity = localStorage.getItem('noonOpticals_securityQuestion');
    const displayQuestion = document.getElementById('displaySecurityQuestion');
    const noSecurityQuestion = document.getElementById('noSecurityQuestion');
    const verifyForm = document.getElementById('verifySecurityForm');
    
    document.getElementById('forgotStep1').style.display = 'none';
    document.getElementById('forgotStepSecurity').style.display = 'block';
    document.getElementById('forgotStep2').style.display = 'none';
    
    if (savedSecurity) {
        const securityData = JSON.parse(savedSecurity);
        displayQuestion.innerHTML = `
            <label>Security Question</label>
            <p>${securityData.question}</p>
        `;
        displayQuestion.style.display = 'block';
        noSecurityQuestion.style.display = 'none';
        verifyForm.style.display = 'block';
    } else {
        displayQuestion.style.display = 'none';
        noSecurityQuestion.style.display = 'block';
        verifyForm.style.display = 'none';
    }
}

function showDirectResetStep() {
    document.getElementById('forgotStep1').style.display = 'none';
    document.getElementById('forgotStepSecurity').style.display = 'none';
    document.getElementById('forgotStep2').style.display = 'block';
}

function loadSecurityQuestionStatus() {
    const savedSecurity = localStorage.getItem('noonOpticals_securityQuestion');
    const statusEl = document.getElementById('securityStatus');
    
    if (savedSecurity && statusEl) {
        const securityData = JSON.parse(savedSecurity);
        statusEl.className = 'security-status success';
        statusEl.innerHTML = `<i class="fas fa-check-circle"></i> Security question is set: "${securityData.question}"`;
        statusEl.style.display = 'block';
    }
}

// ============== INIT ==============
async function initAdminPanel() {
    // Sync data from Firebase first
    if (typeof FirebaseDataManager !== 'undefined') {
        console.log('Syncing data from Firebase...');
        try {
            await FirebaseDataManager.syncFromFirebase();
            console.log('✅ Firebase sync completed');
        } catch (error) {
            console.error('Firebase sync error:', error);
        }
    }
    
    initCharts();
    renderProducts();
    renderOrders();
    renderCustomers();
    renderAppointments();
    renderRecentOrders();
    renderTopProducts();
    renderTodayAppointments();
    renderTopSellers();
    renderActivityLog();
    loadProfileDP();
    loadAdminProfile(); // Load admin email and name into profile section
    setupProfileForm(); // Setup profile form editing
    setupSecurityForms(); // Setup security question and forgot password
    setupSearch(); // Initialize search functionality
    renderNotifications(); // Initialize notifications
    updateAllBadges(); // Update all section badges (new items count)
    updateDashboardStats(); // Update dashboard statistics
    updateOrderStats(); // Update order status counts
    updateCustomerStats(); // Update customer stats
    
    // Real-time analytics sync
    refreshCharts();
    
    console.log('✅ Noon Opticals Admin Panel Initialized and Analytics Synced!');
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initAdminPanel);

// Fallback: also try on window load if DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initAdminPanel, 100);
}

