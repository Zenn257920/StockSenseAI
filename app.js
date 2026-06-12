/* =============================================================
   NexusAI — Intelligent Inventory Management System
   Complete JavaScript Engine (HTML/CSS/JS only — no backend)
   ============================================================= */

// ═══════════════════════════════════════════════════
//  ADMIN AUTHENTICATION SYSTEM
// ═══════════════════════════════════════════════════

// Simple hash function for client-side password storage (NOT for production)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return 'h_' + Math.abs(hash).toString(36) + '_' + str.length;
}

// Get admin accounts from localStorage
function getAdminAccounts() {
    return JSON.parse(localStorage.getItem('nexus_admins')) || [];
}

// Save admin accounts
function saveAdminAccounts(accounts) {
    localStorage.setItem('nexus_admins', JSON.stringify(accounts));
}

// Get current session
function getSession() {
    return JSON.parse(localStorage.getItem('nexus_session')) || null;
}

// Save session
function saveSession(session) {
    localStorage.setItem('nexus_session', JSON.stringify(session));
}

// Clear session
function clearSession() {
    localStorage.removeItem('nexus_session');
}

// ── Auth Tab Switching ──
function switchAuthTab(tab) {
    const loginTab = document.getElementById('authTabLogin');
    const signupTab = document.getElementById('authTabSignup');
    const loginPanel = document.getElementById('loginPanel');
    const signupPanel = document.getElementById('signupPanel');

    // Hide messages
    hideAuthMessages();

    if (tab === 'login') {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginPanel.classList.add('active');
        signupPanel.classList.remove('active');
    } else {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupPanel.classList.add('active');
        loginPanel.classList.remove('active');
    }
}

// ── Password Visibility Toggle ──
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}

// ── Password Strength Meter ──
function updatePasswordStrength(password) {
    const bars = [
        document.getElementById('str1'),
        document.getElementById('str2'),
        document.getElementById('str3'),
        document.getElementById('str4')
    ];
    const label = document.getElementById('strengthLabel');

    // Reset
    bars.forEach(b => { b.className = 'strength-bar'; });
    label.className = 'strength-label';
    label.textContent = '';

    if (!password) return;

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
        { min: 1, max: 1, name: 'Weak', cls: 'weak' },
        { min: 2, max: 2, name: 'Fair', cls: 'fair' },
        { min: 3, max: 3, name: 'Good', cls: 'good' },
        { min: 4, max: 5, name: 'Strong', cls: 'strong' }
    ];

    let level = levels[0];
    for (const l of levels) {
        if (score >= l.min && score <= l.max) { level = l; break; }
        if (score > l.max) level = l;
    }

    const activeBars = level.cls === 'weak' ? 1 : level.cls === 'fair' ? 2 : level.cls === 'good' ? 3 : 4;

    for (let i = 0; i < activeBars; i++) {
        bars[i].classList.add('active', level.cls);
    }

    label.textContent = level.name;
    label.classList.add(level.cls);
}

// ── Show/Hide Messages ──
function showAuthError(msg) {
    const el = document.getElementById('authError');
    const txt = document.getElementById('authErrorText');
    const success = document.getElementById('authSuccess');
    success.classList.remove('visible');
    txt.textContent = msg;
    el.classList.add('visible');
}

function showAuthSuccess(msg) {
    const el = document.getElementById('authSuccess');
    const txt = document.getElementById('authSuccessText');
    const error = document.getElementById('authError');
    error.classList.remove('visible');
    txt.textContent = msg;
    el.classList.add('visible');
}

function hideAuthMessages() {
    document.getElementById('authError').classList.remove('visible');
    document.getElementById('authSuccess').classList.remove('visible');
}

// ── Handle Sign Up ──
function handleSignup() {
    hideAuthMessages();

    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;

    // Validations
    if (!username) { showAuthError('Please enter a username.'); return; }
    if (username.length < 3) { showAuthError('Username must be at least 3 characters.'); return; }
    if (!email) { showAuthError('Please enter an email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showAuthError('Please enter a valid email address.'); return; }
    if (!password) { showAuthError('Please enter a password.'); return; }
    if (password.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { showAuthError('Passwords do not match.'); return; }

    const accounts = getAdminAccounts();

    // Check if username already exists
    if (accounts.find(a => a.username.toLowerCase() === username.toLowerCase())) {
        showAuthError('This username is already taken.');
        return;
    }

    // Check if email already exists
    if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
        showAuthError('An account with this email already exists.');
        return;
    }

    // Create account
    accounts.push({
        username,
        email,
        passwordHash: simpleHash(password),
        createdAt: new Date().toISOString()
    });

    saveAdminAccounts(accounts);

    // Clear form
    document.getElementById('signupUsername').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupConfirm').value = '';
    updatePasswordStrength('');

    showAuthSuccess('Account created successfully! You can now sign in.');

    // Auto-switch to login after a delay
    setTimeout(() => {
        switchAuthTab('login');
        document.getElementById('loginUsername').value = username;
        document.getElementById('loginUsername').focus();
    }, 1500);
}

// ── Handle Login ──
function handleLogin() {
    hideAuthMessages();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username) { showAuthError('Please enter your username.'); return; }
    if (!password) { showAuthError('Please enter your password.'); return; }

    const accounts = getAdminAccounts();
    const account = accounts.find(a => a.username.toLowerCase() === username.toLowerCase());

    if (!account) {
        showAuthError('No admin account found with that username.');
        return;
    }

    if (account.passwordHash !== simpleHash(password)) {
        showAuthError('Incorrect password. Please try again.');
        return;
    }

    // Success — create session
    const session = {
        username: account.username,
        email: account.email,
        loggedInAt: new Date().toISOString()
    };

    saveSession(session);
    enterApp(session);
}

// ── Handle Logout ──
function handleLogout() {
    clearSession();

    // Show auth screen
    const authScreen = document.getElementById('authScreen');
    const appContainer = document.getElementById('appContainer');

    authScreen.classList.remove('hidden');
    appContainer.classList.add('auth-locked');

    // Reset form
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    switchAuthTab('login');
    hideAuthMessages();

    // Stop simulation
    if (simInterval) {
        clearInterval(simInterval);
        simInterval = null;
    }
}

// ── Enter the App (after successful auth) ──
function enterApp(session) {
    const authScreen = document.getElementById('authScreen');
    const appContainer = document.getElementById('appContainer');

    // Update admin badge
    const adminName = document.getElementById('adminName');
    const adminAvatar = document.getElementById('adminAvatar');
    if (adminName) adminName.textContent = session.username;
    if (adminAvatar) adminAvatar.textContent = session.username.charAt(0).toUpperCase();

    // Animate auth screen out
    authScreen.classList.add('hidden');

    // Show app after animation
    setTimeout(() => {
        appContainer.classList.remove('auth-locked');

        // Initialize app
        initializeApp();
    }, 400);
}

// ── Check Auth on Load ──
function checkAuth() {
    const session = getSession();
    if (session) {
        // Already logged in
        enterApp(session);
    }
    // else: auth screen stays visible
}

// ─────────────────────── STATE ───────────────────────
let products = JSON.parse(localStorage.getItem("nexus_products")) || [];
let salesHistory = JSON.parse(localStorage.getItem("nexus_history")) || [];
let alerts = JSON.parse(localStorage.getItem("nexus_alerts")) || [];
let settings = JSON.parse(localStorage.getItem("nexus_settings")) || {
    lowStockThreshold: 5,
    simEnabled: true,
    simSpeed: 8
};

let chartInstances = {};
let simInterval = null;
let currentSort = { key: null, asc: true };

// ─────────────────────── INIT ───────────────────────
document.addEventListener("DOMContentLoaded", () => {
    // Check authentication first
    checkAuth();
});

// Called after successful authentication
function initializeApp() {
    startClock();

    // Load demo data if nothing exists
    if (products.length === 0) {
        loadDemoData();
    }

    // Load the default page
    showSection('dashboard');

    if (settings.simEnabled) startSimulation();

    // ── Mobile sidebar toggle ──
    const hamburger = document.getElementById("hamburgerBtn");
    const overlay   = document.getElementById("sidebarOverlay");
    const sidebar   = document.querySelector(".sidebar");

    function openSidebar() {
        sidebar.classList.add("open");
        overlay.classList.add("visible");
        hamburger.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
        sidebar.classList.remove("open");
        overlay.classList.remove("visible");
        hamburger.classList.remove("open");
        document.body.style.overflow = "";
    }

    hamburger.addEventListener("click", () => {
        sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
    });

    overlay.addEventListener("click", closeSidebar);

    // Close sidebar on nav link click (mobile)
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (window.innerWidth <= 768) closeSidebar();
        });
    });
}

// ─────────────────────── NAVIGATION (Page Loader) ───────────────────────
let currentPage = null;

function showSection(id) {
    // Update nav buttons
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    const navBtn = document.getElementById("nav-" + id);
    if (navBtn) navBtn.classList.add("active");

    // Load page content from templates
    const container = document.getElementById("page-container");
    const html = PAGE_TEMPLATES[id] || `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Page not found</h3><p>Could not load the "${id}" page.</p></div>`;
    container.innerHTML = html;
    currentPage = id;

    // Run section-specific rendering after content is injected
    if (id === "dashboard") renderDashboard();
    if (id === "products") renderProducts();
    if (id === "forecast") renderForecast();
    if (id === "alerts") renderAlerts();
    if (id === "analytics") renderAnalytics();
    if (id === "settings") applySettings();
}

// ─────────────────────── CLOCK ───────────────────────
function startClock() {
    const update = () => {
        const now = new Date();
        const el = document.getElementById("headerTime");
        if (el) {
            el.textContent = now.toLocaleString("en-US", {
                weekday: "short", month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit", second: "2-digit"
            });
        }
    };
    update();
    setInterval(update, 1000);
}

// ─────────────────────── SAVE / PERSIST ───────────────────────
function save() {
    localStorage.setItem("nexus_products", JSON.stringify(products));
    localStorage.setItem("nexus_history", JSON.stringify(salesHistory));
    localStorage.setItem("nexus_alerts", JSON.stringify(alerts));
    localStorage.setItem("nexus_settings", JSON.stringify(settings));
}

// ─────────────────────── TOAST NOTIFICATIONS ───────────────────────
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `${getToastIcon(type)} ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "toastOut 0.3s var(--ease-out) forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function getToastIcon(type) {
    const icons = { success: "✅", warning: "⚠️", error: "❌", info: "ℹ️" };
    return icons[type] || icons.info;
}

// ═══════════════════════════════════════════════════
//  PRODUCT MANAGEMENT
// ═══════════════════════════════════════════════════

function addProduct() {
    const name = document.getElementById("productName").value.trim();
    const stock = parseInt(document.getElementById("productStock").value);
    const price = parseFloat(document.getElementById("productPrice").value);
    const category = document.getElementById("productCategory").value;

    if (!name) { showToast("Please enter a product name", "warning"); return; }
    if (isNaN(stock) || stock < 0) { showToast("Please enter a valid stock quantity", "warning"); return; }
    if (isNaN(price) || price <= 0) { showToast("Please enter a valid price", "warning"); return; }

    products.push({
        id: Date.now(),
        name,
        stock,
        price,
        category,
        sales: 0,
        salesHistory: [],
        addedDate: new Date().toISOString(),
        popularity: 0.3 + Math.random() * 0.7 // AI "popularity" score for sim
    });

    // Clear form
    document.getElementById("productName").value = "";
    document.getElementById("productStock").value = "";
    document.getElementById("productPrice").value = "";

    save();
    renderAll();
    showToast(`${name} added to inventory`, "success");
}

function sellProduct(index) {
    if (products[index].stock <= 0) {
        showToast(`${products[index].name} is out of stock!`, "error");
        return;
    }

    products[index].stock -= 1;
    products[index].sales += 1;

    // Track daily sales history
    const today = new Date().toISOString().split("T")[0];
    const existing = products[index].salesHistory.find(h => h.date === today);
    if (existing) {
        existing.qty += 1;
    } else {
        products[index].salesHistory.push({ date: today, qty: 1 });
    }

    // Global history
    const globalToday = salesHistory.find(h => h.date === today);
    if (globalToday) {
        globalToday.sales += 1;
        globalToday.revenue += products[index].price;
    } else {
        salesHistory.push({ date: today, sales: 1, revenue: products[index].price });
    }

    // Keep history manageable
    if (salesHistory.length > 60) salesHistory = salesHistory.slice(-60);
    products[index].salesHistory = products[index].salesHistory.slice(-60);

    save();
    renderAll();
}

function deleteProduct(index) {
    const name = products[index].name;
    products.splice(index, 1);
    save();
    renderAll();
    showToast(`${name} removed from inventory`, "info");
}

function sortProducts(key) {
    if (currentSort.key === key) {
        currentSort.asc = !currentSort.asc;
    } else {
        currentSort.key = key;
        currentSort.asc = true;
    }

    products.sort((a, b) => {
        let va = a[key], vb = b[key];
        if (typeof va === "string") va = va.toLowerCase();
        if (typeof vb === "string") vb = vb.toLowerCase();
        if (va < vb) return currentSort.asc ? -1 : 1;
        if (va > vb) return currentSort.asc ? 1 : -1;
        return 0;
    });

    save();
    renderProducts();
}

// ═══════════════════════════════════════════════════
//  RENDERING
// ═══════════════════════════════════════════════════

function renderAll() {
    // Only render the currently loaded page (other pages' DOM isn't available)
    if (currentPage === 'dashboard') renderDashboard();
    else if (currentPage === 'products') renderProducts();
    else if (currentPage === 'forecast') renderForecast();
    else if (currentPage === 'alerts') renderAlerts();
    else if (currentPage === 'analytics') renderAnalytics();
    updateAlertBadge();
}

// ─────── DASHBOARD ───────
function renderDashboard() {
    if (!document.getElementById("totalProducts")) return;
    const totalProd = products.length;
    const totalSalesVal = products.reduce((a, b) => a + b.sales, 0);
    const totalRev = products.reduce((a, b) => a + (b.sales * b.price), 0);
    const lowStockCount = products.filter(p => p.stock < settings.lowStockThreshold).length;

    document.getElementById("totalProducts").textContent = totalProd;
    document.getElementById("totalSales").textContent = totalSalesVal.toLocaleString();
    document.getElementById("totalRevenue").textContent = "$" + totalRev.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    document.getElementById("lowStock").textContent = lowStockCount;

    // KPI changes (simulated)
    const revGrowth = totalRev > 0 ? (5 + Math.floor(Math.random() * 12)) : 0;
    document.getElementById("kpiRevenueChange").textContent = `↑ ${revGrowth}% this week`;
    document.getElementById("kpiSalesChange").textContent = `↑ ${totalSalesVal > 0 ? Math.floor(Math.random() * 8 + 3) : 0}% growth`;

    if (lowStockCount === 0) {
        document.getElementById("kpiLowStockChange").textContent = "✓ All stocked";
        document.getElementById("kpiLowStockChange").className = "kpi-change up";
    } else {
        document.getElementById("kpiLowStockChange").textContent = `⚡ ${lowStockCount} need attention`;
        document.getElementById("kpiLowStockChange").className = "kpi-change down";
    }

    renderAIInsights();
    drawSalesChart();
    drawRevenueChart();
    drawStockDonutChart();
}

function renderAIInsights() {
    const grid = document.getElementById("aiInsightsGrid");
    const insights = generateAIInsights();
    grid.innerHTML = insights.map(i => `
        <div class="insight-card">
            <div class="insight-icon">${i.icon}</div>
            <div class="insight-title">${i.title}</div>
            <div class="insight-text">${i.text}</div>
            <div class="insight-meta">${i.meta}</div>
        </div>
    `).join("");
}

function generateAIInsights() {
    const insights = [];
    const sorted = [...products].sort((a, b) => b.sales - a.sales);

    // Top seller
    if (sorted.length > 0 && sorted[0].sales > 0) {
        insights.push({
            icon: "🔥", title: "Top Seller",
            text: `${sorted[0].name} leads with ${sorted[0].sales} units sold ($${(sorted[0].sales * sorted[0].price).toLocaleString()} revenue).`,
            meta: "Based on total sales data"
        });
    }

    // Low stock warning
    const lowItems = products.filter(p => p.stock < settings.lowStockThreshold && p.stock > 0);
    if (lowItems.length > 0) {
        insights.push({
            icon: "⚠️", title: "Stock Warning",
            text: `${lowItems.map(p => p.name).join(", ")} ${lowItems.length === 1 ? 'is' : 'are'} running low. Reorder recommended.`,
            meta: `Threshold: < ${settings.lowStockThreshold} units`
        });
    }

    // Out of stock
    const outOfStock = products.filter(p => p.stock === 0);
    if (outOfStock.length > 0) {
        insights.push({
            icon: "🚫", title: "Out of Stock",
            text: `${outOfStock.map(p => p.name).join(", ")} — immediate restock needed to avoid lost sales.`,
            meta: "Critical alert"
        });
    }

    // Revenue insight
    const totalRev = products.reduce((a, b) => a + (b.sales * b.price), 0);
    if (totalRev > 0) {
        const topRevProduct = [...products].sort((a, b) => (b.sales * b.price) - (a.sales * a.price))[0];
        const pct = ((topRevProduct.sales * topRevProduct.price) / totalRev * 100).toFixed(0);
        insights.push({
            icon: "💰", title: "Revenue Insight",
            text: `${topRevProduct.name} drives ${pct}% of total revenue. Consider increasing stock allocation.`,
            meta: `Total revenue: $${totalRev.toLocaleString()}`
        });
    }

    // Suggest a promo if a product has high stock but low sales
    const overstocked = products.filter(p => p.stock > 50 && p.sales < 5);
    if (overstocked.length > 0) {
        insights.push({
            icon: "📢", title: "Promotion Opportunity",
            text: `${overstocked[0].name} has high stock (${overstocked[0].stock}) but low sales. Consider a discount.`,
            meta: "AI recommendation"
        });
    }

    if (insights.length === 0) {
        insights.push({
            icon: "🧠", title: "Getting Started",
            text: "Add some products and make sales to see AI-powered insights appear here.",
            meta: "NexusAI is ready"
        });
    }

    return insights.slice(0, 4);
}

// ─────── PRODUCTS TABLE ───────
function renderProducts() {
    const table = document.getElementById("productTable");
    if (!table) return;
    const searchVal = (document.getElementById("productSearch")?.value || "").toLowerCase();

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchVal) ||
        (p.category || "").toLowerCase().includes(searchVal)
    );

    document.getElementById("productCount").textContent = `(${filtered.length} of ${products.length})`;
    document.getElementById("emptyProductState").style.display = filtered.length === 0 ? "block" : "none";

    const abcMap = computeABC();

    table.innerHTML = filtered.map((p, i) => {
        const origIndex = products.indexOf(p);
        const stockClass = p.stock === 0 ? "critical" : p.stock < settings.lowStockThreshold ? "warning" : "healthy";
        const stockLabel = p.stock === 0 ? "Out of stock" : p.stock < settings.lowStockThreshold ? "Low" : "In stock";
        const stockPct = Math.min(100, (p.stock / (p.stock + p.sales || 1)) * 100);
        const revenue = (p.sales * p.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const abc = abcMap[p.name] || "C";

        return `<tr>
            <td>${p.name}</td>
            <td><span class="category-tag">${p.category || 'Other'}</span></td>
            <td>
                <span class="stock-badge ${stockClass}">${stockLabel} (${p.stock})</span>
                <div class="stock-bar-track">
                    <div class="stock-bar-fill ${stockClass}" style="width:${stockPct}%"></div>
                </div>
            </td>
            <td>$${p.price.toFixed(2)}</td>
            <td>${p.sales}</td>
            <td>$${revenue}</td>
            <td><span class="abc-badge ${abc.toLowerCase()}">${abc}</span></td>
            <td>
                <button class="btn btn-success btn-sm" onclick="sellProduct(${origIndex})" ${p.stock === 0 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>Sell</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${origIndex})">Delete</button>
            </td>
        </tr>`;
    }).join("");
}

function computeABC() {
    const map = {};
    if (products.length === 0) return map;

    const sorted = [...products].sort((a, b) => (b.sales * b.price) - (a.sales * a.price));
    const totalRev = products.reduce((a, b) => a + (b.sales * b.price), 0);
    let cumulative = 0;

    sorted.forEach(p => {
        cumulative += (p.sales * p.price);
        const pct = totalRev > 0 ? (cumulative / totalRev) : 1;
        if (pct <= 0.8) map[p.name] = "A";
        else if (pct <= 0.95) map[p.name] = "B";
        else map[p.name] = "C";
    });

    return map;
}

// ═══════════════════════════════════════════════════
//  AI FORECASTING ENGINE
// ═══════════════════════════════════════════════════

function renderForecast() {
    if (products.length === 0) return;
    if (!document.getElementById("forecast7d")) return;

    // Calculate total daily velocity
    const totalDailyVelocity = products.reduce((sum, p) => {
        const hist = p.salesHistory || [];
        if (hist.length === 0) return sum + (p.sales > 0 ? p.sales / 7 : 0);
        const recent = hist.slice(-7);
        const avgDaily = recent.reduce((a, b) => a + b.qty, 0) / Math.max(recent.length, 1);
        return sum + avgDaily;
    }, 0);

    const forecast7 = Math.round(totalDailyVelocity * 7);
    const forecast30 = Math.round(totalDailyVelocity * 30);
    const confidence = products.length > 3 ? "87%" : products.length > 1 ? "72%" : "54%";

    document.getElementById("forecast7d").textContent = forecast7.toLocaleString();
    document.getElementById("forecast30d").textContent = forecast30.toLocaleString();
    document.getElementById("forecastConfidence").textContent = confidence;

    drawForecastChart(totalDailyVelocity);
    renderReorderTable();
}

function drawForecastChart(dailyVelocity) {
    const ctx = document.getElementById("forecastChart");
    if (!ctx) return;

    // Generate past 14 days + forecast 14 days
    const labels = [];
    const actualData = [];
    const forecastData = [];
    const upperBand = [];
    const lowerBand = [];

    const now = new Date();

    for (let i = -14; i <= 14; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        labels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));

        if (i <= 0) {
            // Actual data (with noise)
            const noise = 0.6 + Math.random() * 0.8;
            const seasonal = 1 + 0.15 * Math.sin((d.getDay() / 7) * Math.PI * 2);
            const val = Math.max(0, Math.round(dailyVelocity * noise * seasonal));
            actualData.push(val);
            forecastData.push(null);
            upperBand.push(null);
            lowerBand.push(null);
        } else {
            // Forecast
            const trend = 1 + (i * 0.008);
            const seasonal = 1 + 0.12 * Math.sin((d.getDay() / 7) * Math.PI * 2);
            const base = dailyVelocity * trend * seasonal;
            const val = Math.max(0, Math.round(base));
            actualData.push(null);
            forecastData.push(val);
            upperBand.push(Math.round(val * 1.25));
            lowerBand.push(Math.round(val * 0.75));
        }
    }

    if (chartInstances.forecast) chartInstances.forecast.destroy();

    chartInstances.forecast = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Actual Sales",
                    data: actualData,
                    borderColor: "#6366f1",
                    backgroundColor: "rgba(99, 102, 241, 0.1)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: "#6366f1",
                    borderWidth: 2
                },
                {
                    label: "AI Forecast",
                    data: forecastData,
                    borderColor: "#22d3ee",
                    borderDash: [6, 4],
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: "#22d3ee",
                    borderWidth: 2
                },
                {
                    label: "Upper Confidence",
                    data: upperBand,
                    borderColor: "transparent",
                    backgroundColor: "rgba(34, 211, 238, 0.08)",
                    fill: "+1",
                    pointRadius: 0
                },
                {
                    label: "Lower Confidence",
                    data: lowerBand,
                    borderColor: "transparent",
                    backgroundColor: "rgba(34, 211, 238, 0.08)",
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: getChartOptions("units")
    });
}

function renderReorderTable() {
    const table = document.getElementById("reorderTable");

    const rows = products.map(p => {
        const hist = p.salesHistory || [];
        const recent = hist.slice(-7);
        const dailyVelocity = recent.length > 0
            ? recent.reduce((a, b) => a + b.qty, 0) / Math.max(recent.length, 1)
            : (p.sales > 0 ? p.sales / 14 : 0.1);

        const daysUntilOut = dailyVelocity > 0 ? Math.round(p.stock / dailyVelocity) : 999;
        const reorderQty = Math.max(10, Math.round(dailyVelocity * 14)); // 2-week supply
        const priority = daysUntilOut <= 3 ? "urgent" : daysUntilOut <= 10 ? "moderate" : "low";
        const priorityLabel = daysUntilOut <= 3 ? "🔴 Urgent" : daysUntilOut <= 10 ? "🟡 Moderate" : "🟢 Low";

        return {
            name: p.name,
            stock: p.stock,
            velocity: dailyVelocity.toFixed(1),
            daysUntilOut: daysUntilOut > 99 ? "99+" : daysUntilOut,
            reorderQty,
            priority,
            priorityLabel,
            sortVal: daysUntilOut
        };
    }).sort((a, b) => a.sortVal - b.sortVal);

    table.innerHTML = rows.map(r => `
        <tr>
            <td>${r.name}</td>
            <td>${r.stock}</td>
            <td>${r.velocity}/day</td>
            <td>${r.daysUntilOut} days</td>
            <td>${r.reorderQty} units</td>
            <td><span class="reorder-priority ${r.priority}">${r.priorityLabel}</span></td>
        </tr>
    `).join("");
}

// ═══════════════════════════════════════════════════
//  AI ANOMALY DETECTION & ALERTS
// ═══════════════════════════════════════════════════

function generateAlerts() {
    alerts = [];

    products.forEach(p => {
        // Out of stock
        if (p.stock === 0) {
            alerts.push({
                severity: "critical",
                icon: "🚫",
                title: `${p.name} — Out of Stock`,
                desc: `This product has 0 units remaining. You've sold ${p.sales} total. Immediate reorder required to prevent revenue loss.`,
                time: new Date().toLocaleTimeString()
            });
        }
        // Low stock
        else if (p.stock < settings.lowStockThreshold) {
            alerts.push({
                severity: "warning",
                icon: "⚠️",
                title: `${p.name} — Low Stock Alert`,
                desc: `Only ${p.stock} units left. Based on current velocity, estimated stockout in ${Math.max(1, Math.round(p.stock / Math.max(0.1, p.sales / 14)))} days.`,
                time: new Date().toLocaleTimeString()
            });
        }

        // Rapid sales anomaly (high sales relative to stock)
        if (p.sales > 0 && p.stock > 0 && p.sales > p.stock * 2) {
            alerts.push({
                severity: "info",
                icon: "📈",
                title: `${p.name} — High Demand Detected`,
                desc: `Sales velocity is unusually high. Sales-to-stock ratio: ${(p.sales / p.stock).toFixed(1)}x. AI recommends increasing reorder quantity by 40%.`,
                time: new Date().toLocaleTimeString()
            });
        }

        // Overstock alert
        if (p.stock > 100 && p.sales < 3) {
            alerts.push({
                severity: "info",
                icon: "📦",
                title: `${p.name} — Potential Overstock`,
                desc: `High inventory (${p.stock} units) with very low movement (${p.sales} sales). Consider promotional pricing to improve turnover.`,
                time: new Date().toLocaleTimeString()
            });
        }
    });

    // General health alert
    if (products.length > 0 && alerts.length === 0) {
        alerts.push({
            severity: "info",
            icon: "✅",
            title: "Inventory Health — All Systems Normal",
            desc: "No anomalies detected. All products are within healthy stock levels and sales velocity is stable.",
            time: new Date().toLocaleTimeString()
        });
    }

    save();
    renderAlerts();
    updateAlertBadge();
    showToast("AI analysis complete — alerts refreshed", "success");
}

function renderAlerts() {
    const feed = document.getElementById("alertFeed");
    if (!feed) return;

    if (alerts.length === 0) {
        feed.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔔</div>
                <h3>No alerts yet</h3>
                <p>Click "Refresh Analysis" to run AI anomaly detection on your inventory.</p>
            </div>`;
        return;
    }

    feed.innerHTML = alerts.map(a => `
        <div class="alert-item">
            <div class="alert-severity ${a.severity}">
                ${a.icon}
            </div>
            <div class="alert-body">
                <div class="alert-title">${a.title}</div>
                <div class="alert-desc">${a.desc}</div>
                <div class="alert-time">🕐 ${a.time}</div>
            </div>
        </div>
    `).join("");
}

function clearAlerts() {
    alerts = [];
    save();
    renderAlerts();
    updateAlertBadge();
    showToast("Alerts cleared", "info");
}

function updateAlertBadge() {
    const badge = document.getElementById("alertBadge");
    if (!badge) return;
    const critical = alerts.filter(a => a.severity === "critical" || a.severity === "warning").length;
    badge.textContent = critical;
    badge.style.display = critical > 0 ? "inline" : "none";
}

// ═══════════════════════════════════════════════════
//  ANALYTICS ENGINE
// ═══════════════════════════════════════════════════

function renderAnalytics() {
    if (products.length === 0) return;
    if (!document.getElementById("turnoverRate")) return;

    // Inventory Turnover
    const totalSales = products.reduce((a, b) => a + b.sales, 0);
    const totalStock = products.reduce((a, b) => a + b.stock, 0);
    const turnover = totalStock > 0 ? (totalSales / totalStock).toFixed(1) : "0.0";
    document.getElementById("turnoverRate").textContent = turnover + "x";

    // Average order value
    const totalRev = products.reduce((a, b) => a + (b.sales * b.price), 0);
    const avgOV = totalSales > 0 ? (totalRev / totalSales).toFixed(2) : "0.00";
    document.getElementById("avgOrderValue").textContent = "$" + avgOV;

    // Top category
    const catMap = {};
    products.forEach(p => {
        const cat = p.category || "Other";
        catMap[cat] = (catMap[cat] || 0) + (p.sales * p.price);
    });
    const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
    document.getElementById("topCategory").textContent = topCat ? topCat[0] : "—";

    // Stock utilization
    const totalCapacity = products.reduce((a, b) => a + b.stock + b.sales, 0);
    const utilized = totalCapacity > 0 ? Math.round((totalSales / totalCapacity) * 100) : 0;
    document.getElementById("stockUtil").textContent = utilized + "%";

    drawCategoryChart(catMap);
    renderTopPerformers();
    drawSalesVsStockChart();
}

function renderTopPerformers() {
    const container = document.getElementById("topPerformers");
    const sorted = [...products].sort((a, b) => (b.sales * b.price) - (a.sales * a.price)).slice(0, 5);

    if (sorted.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No sales data yet</p></div>';
        return;
    }

    const maxRev = sorted[0].sales * sorted[0].price || 1;

    container.innerHTML = sorted.map((p, i) => {
        const rev = p.sales * p.price;
        const pct = Math.round((rev / maxRev) * 100);
        return `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;${i < sorted.length - 1 ? 'border-bottom:1px solid var(--border-subtle);' : ''}">
                <span style="font-size:14px;font-weight:800;color:var(--text-muted);width:20px;">${i + 1}</span>
                <div style="flex:1;">
                    <div style="font-size:13px;font-weight:600;">${p.name}</div>
                    <div style="font-size:11px;color:var(--text-muted);">${p.sales} sales · $${rev.toLocaleString()}</div>
                    <div class="stock-bar-track" style="width:100%;margin-top:6px;height:3px;">
                        <div class="stock-bar-fill healthy" style="width:${pct}%;background:var(--accent-gradient);"></div>
                    </div>
                </div>
            </div>`;
    }).join("");
}

// ═══════════════════════════════════════════════════
//  AI CHAT ASSISTANT
// ═══════════════════════════════════════════════════

function sendChat() {
    const input = document.getElementById("chatInput");
    const msg = input.value.trim();
    if (!msg) return;
    input.value = "";
    askAI(msg);
}

function askAI(question) {
    const messagesEl = document.getElementById("chatMessages");

    // Add user message
    messagesEl.innerHTML += `
        <div class="chat-message user">
            <div class="chat-avatar">👤</div>
            <div class="chat-bubble">${escapeHTML(question)}</div>
        </div>`;

    // Show typing indicator
    const typingId = "typing-" + Date.now();
    messagesEl.innerHTML += `
        <div class="chat-message ai" id="${typingId}">
            <div class="chat-avatar">🧠</div>
            <div class="chat-bubble">
                <div class="chat-typing">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>`;

    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Simulate AI thinking delay
    setTimeout(() => {
        const response = processAIQuery(question);
        const typingEl = document.getElementById(typingId);
        if (typingEl) {
            typingEl.querySelector(".chat-bubble").innerHTML = response;
        }
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 800 + Math.random() * 1200);
}

function processAIQuery(query) {
    const q = query.toLowerCase();
    const totalSales = products.reduce((a, b) => a + b.sales, 0);
    const totalRev = products.reduce((a, b) => a + (b.sales * b.price), 0);
    const totalStock = products.reduce((a, b) => a + b.stock, 0);
    const lowItems = products.filter(p => p.stock < settings.lowStockThreshold);
    const outItems = products.filter(p => p.stock === 0);
    const sorted = [...products].sort((a, b) => b.sales - a.sales);

    // Best seller
    if (q.includes("best sell") || q.includes("top sell") || q.includes("most popular") || q.includes("top product")) {
        if (sorted.length > 0 && sorted[0].sales > 0) {
            return `🔥 <strong>${sorted[0].name}</strong> is your #1 best seller with <strong>${sorted[0].sales} units sold</strong> and <strong>$${(sorted[0].sales * sorted[0].price).toLocaleString()}</strong> in revenue.<br><br>` +
                `📊 Top 3 sellers:<br>` +
                sorted.slice(0, 3).map((p, i) => `${i + 1}. ${p.name} — ${p.sales} sales`).join("<br>");
        }
        return "📭 No sales recorded yet. Try selling some products to see your best sellers!";
    }

    // Restock / low stock
    if (q.includes("restock") || q.includes("low stock") || q.includes("need order") || q.includes("running low")) {
        if (lowItems.length > 0) {
            return `⚠️ <strong>${lowItems.length} product${lowItems.length > 1 ? 's' : ''}</strong> need restocking:<br><br>` +
                lowItems.map(p => `📦 <strong>${p.name}</strong> — only ${p.stock} left (threshold: ${settings.lowStockThreshold})`).join("<br>") +
                `<br><br>💡 <em>Recommendation: Place reorder for these items within the next 48 hours to avoid stockouts.</em>`;
        }
        return "✅ All products are above the low-stock threshold. Inventory is healthy!";
    }

    // Revenue
    if (q.includes("revenue") || q.includes("money") || q.includes("earn") || q.includes("income")) {
        return `💰 <strong>Revenue Summary</strong><br><br>` +
            `Total Revenue: <strong>$${totalRev.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong><br>` +
            `Total Units Sold: <strong>${totalSales.toLocaleString()}</strong><br>` +
            `Average Order Value: <strong>$${totalSales > 0 ? (totalRev / totalSales).toFixed(2) : '0.00'}</strong><br>` +
            `Total Products: <strong>${products.length}</strong><br><br>` +
            `📈 <em>Revenue is trending positively based on current sales velocity.</em>`;
    }

    // Inventory health
    if (q.includes("health") || q.includes("status") || q.includes("overview") || q.includes("summary")) {
        const healthScore = Math.max(0, Math.min(100, Math.round(100 - (lowItems.length / Math.max(products.length, 1)) * 100)));
        return `🏥 <strong>Inventory Health Report</strong><br><br>` +
            `Health Score: <strong>${healthScore}/100</strong> ${healthScore > 80 ? '🟢' : healthScore > 50 ? '🟡' : '🔴'}<br>` +
            `Products in Stock: <strong>${products.length - outItems.length}/${products.length}</strong><br>` +
            `Total Inventory Value: <strong>$${products.reduce((a, b) => a + (b.stock * b.price), 0).toLocaleString()}</strong><br>` +
            `Low Stock Alerts: <strong>${lowItems.length}</strong><br>` +
            `Out of Stock: <strong>${outItems.length}</strong><br><br>` +
            `${healthScore > 80 ? '✨ <em>Your inventory is in excellent shape!</em>' : '⚡ <em>Some items need attention. Check the AI Alerts section.</em>'}`;
    }

    // Trends
    if (q.includes("trend") || q.includes("forecast") || q.includes("predict") || q.includes("future")) {
        const avgDaily = totalSales / 14;
        return `📈 <strong>Trend Analysis</strong><br><br>` +
            `Avg. Daily Sales: <strong>${avgDaily.toFixed(1)} units</strong><br>` +
            `7-Day Forecast: <strong>~${Math.round(avgDaily * 7)} units</strong><br>` +
            `30-Day Forecast: <strong>~${Math.round(avgDaily * 30)} units</strong><br>` +
            `Est. 30-Day Revenue: <strong>$${Math.round(avgDaily * 30 * (totalRev / Math.max(totalSales, 1))).toLocaleString()}</strong><br><br>` +
            `🔮 <em>Visit the Forecasting section for detailed demand prediction charts with confidence intervals.</em>`;
    }

    // Category
    if (q.includes("category") || q.includes("categor")) {
        const catMap = {};
        products.forEach(p => {
            const c = p.category || "Other";
            if (!catMap[c]) catMap[c] = { count: 0, sales: 0, rev: 0 };
            catMap[c].count++;
            catMap[c].sales += p.sales;
            catMap[c].rev += p.sales * p.price;
        });
        return `🏷️ <strong>Category Breakdown</strong><br><br>` +
            Object.entries(catMap).map(([cat, d]) =>
                `<strong>${cat}</strong>: ${d.count} products, ${d.sales} sales, $${d.rev.toLocaleString()} revenue`
            ).join("<br>");
    }

    // Help
    if (q.includes("help") || q.includes("can you") || q.includes("what can")) {
        return `🤖 I can help you with:<br><br>` +
            `🔥 <strong>"What's my best seller?"</strong> — Top performing products<br>` +
            `📦 <strong>"Which products need restock?"</strong> — Low stock alerts<br>` +
            `💰 <strong>"Show revenue summary"</strong> — Financial overview<br>` +
            `🏥 <strong>"How is my inventory health?"</strong> — Health score & status<br>` +
            `📈 <strong>"What are the current trends?"</strong> — Sales forecasts<br>` +
            `🏷️ <strong>"Category breakdown"</strong> — Performance by category<br><br>` +
            `Just type your question naturally — I'll do my best to answer!`;
    }

    // Default / catch-all
    return `🧠 I analyzed your query: "<em>${escapeHTML(query)}</em>"<br><br>` +
        `Here's what I found in your inventory:<br>` +
        `📦 ${products.length} products tracked<br>` +
        `🛒 ${totalSales.toLocaleString()} total units sold<br>` +
        `💰 $${totalRev.toLocaleString()} total revenue<br>` +
        `📊 ${totalStock.toLocaleString()} units in stock<br><br>` +
        `💡 <em>Try asking about your best seller, restock needs, revenue, or inventory health!</em>`;
}

function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// ═══════════════════════════════════════════════════
//  CHARTS (Chart.js)
// ═══════════════════════════════════════════════════

function getChartOptions(yLabel = "") {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600, easing: "easeOutQuart" },
        plugins: {
            legend: {
                labels: {
                    color: "#94a3b8",
                    font: { family: "Inter", size: 11 },
                    usePointStyle: true,
                    pointStyle: "circle",
                    padding: 16
                }
            },
            tooltip: {
                backgroundColor: "#1e293b",
                titleColor: "#f1f5f9",
                bodyColor: "#94a3b8",
                borderColor: "rgba(148,163,184,0.1)",
                borderWidth: 1,
                cornerRadius: 8,
                padding: 10,
                titleFont: { family: "Inter", weight: "600" },
                bodyFont: { family: "Inter" }
            }
        },
        scales: {
            x: {
                grid: { color: "rgba(148,163,184,0.06)" },
                ticks: { color: "#64748b", font: { family: "Inter", size: 10 } }
            },
            y: {
                grid: { color: "rgba(148,163,184,0.06)" },
                ticks: { color: "#64748b", font: { family: "Inter", size: 10 } },
                title: yLabel ? {
                    display: true,
                    text: yLabel,
                    color: "#64748b",
                    font: { family: "Inter", size: 11 }
                } : undefined
            }
        }
    };
}

function drawSalesChart() {
    const ctx = document.getElementById("salesChart");
    if (!ctx) return;

    const labels = products.map(p => p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name);
    const data = products.map(p => p.sales);

    if (chartInstances.sales) chartInstances.sales.destroy();

    const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.8)");
    gradient.addColorStop(1, "rgba(34, 211, 238, 0.4)");

    chartInstances.sales = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Units Sold",
                data,
                backgroundColor: gradient,
                borderRadius: 6,
                borderSkipped: false,
                barPercentage: 0.65
            }]
        },
        options: getChartOptions("Units")
    });
}

function drawRevenueChart() {
    const ctx = document.getElementById("revenueChart");
    if (!ctx) return;

    // Generate fake historical revenue data based on current products
    const labels = [];
    const data = [];
    const totalRev = products.reduce((a, b) => a + (b.sales * b.price), 0);

    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));

        const base = totalRev / 14;
        const noise = 0.5 + Math.random();
        const trend = 1 + ((14 - i) * 0.03);
        data.push(Math.max(0, Math.round(base * noise * trend)));
    }

    if (chartInstances.revenue) chartInstances.revenue.destroy();

    const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, "rgba(34, 211, 238, 0.2)");
    gradient.addColorStop(1, "rgba(34, 211, 238, 0.01)");

    chartInstances.revenue = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Daily Revenue ($)",
                data,
                borderColor: "#22d3ee",
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: "#22d3ee",
                borderWidth: 2
            }]
        },
        options: getChartOptions("$")
    });
}

function drawStockDonutChart() {
    const ctx = document.getElementById("stockDonutChart");
    if (!ctx) return;

    const catMap = {};
    products.forEach(p => {
        const cat = p.category || "Other";
        catMap[cat] = (catMap[cat] || 0) + p.stock;
    });

    const labels = Object.keys(catMap);
    const data = Object.values(catMap);
    const colors = ["#6366f1", "#22d3ee", "#34d399", "#fbbf24", "#f87171", "#a78bfa"];

    if (chartInstances.stockDonut) chartInstances.stockDonut.destroy();

    chartInstances.stockDonut = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            animation: { duration: 600, easing: "easeOutQuart" },
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#94a3b8",
                        font: { family: "Inter", size: 11 },
                        usePointStyle: true,
                        pointStyle: "circle",
                        padding: 16
                    }
                },
                tooltip: {
                    backgroundColor: "#1e293b",
                    titleColor: "#f1f5f9",
                    bodyColor: "#94a3b8",
                    cornerRadius: 8
                }
            }
        }
    });
}

function drawCategoryChart(catMap) {
    const ctx = document.getElementById("categoryChart");
    if (!ctx) return;

    const labels = Object.keys(catMap);
    const data = Object.values(catMap);
    const colors = ["#6366f1", "#22d3ee", "#34d399", "#fbbf24", "#f87171", "#a78bfa"];

    if (chartInstances.category) chartInstances.category.destroy();

    chartInstances.category = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Revenue by Category ($)",
                data,
                backgroundColor: colors.slice(0, labels.length),
                borderRadius: 6,
                borderSkipped: false,
                barPercentage: 0.6
            }]
        },
        options: getChartOptions("$")
    });
}

function drawSalesVsStockChart() {
    const ctx = document.getElementById("salesVsStockChart");
    if (!ctx) return;

    const labels = products.map(p => p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name);

    if (chartInstances.salesVsStock) chartInstances.salesVsStock.destroy();

    chartInstances.salesVsStock = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Current Stock",
                    data: products.map(p => p.stock),
                    backgroundColor: "rgba(99, 102, 241, 0.6)",
                    borderRadius: 4,
                    barPercentage: 0.4,
                    categoryPercentage: 0.8
                },
                {
                    label: "Total Sales",
                    data: products.map(p => p.sales),
                    backgroundColor: "rgba(34, 211, 238, 0.6)",
                    borderRadius: 4,
                    barPercentage: 0.4,
                    categoryPercentage: 0.8
                }
            ]
        },
        options: getChartOptions("Units")
    });
}

// ═══════════════════════════════════════════════════
//  SALES SIMULATION ENGINE
// ═══════════════════════════════════════════════════

function startSimulation() {
    stopSimulation();
    simInterval = setInterval(() => {
        if (products.length === 0) return;

        // Pick a random product weighted by popularity
        const weights = products.map(p => p.stock > 0 ? p.popularity : 0);
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        if (totalWeight === 0) return;

        let rand = Math.random() * totalWeight;
        let chosenIndex = 0;
        for (let i = 0; i < weights.length; i++) {
            rand -= weights[i];
            if (rand <= 0) { chosenIndex = i; break; }
        }

        if (products[chosenIndex].stock > 0) {
            // Sell 1-3 units at a time
            const qty = Math.min(products[chosenIndex].stock, 1 + Math.floor(Math.random() * 2));
            for (let j = 0; j < qty; j++) {
                sellProduct(chosenIndex);
            }
        }
    }, settings.simSpeed * 1000);
}

function stopSimulation() {
    if (simInterval) {
        clearInterval(simInterval);
        simInterval = null;
    }
}

function toggleSimulation(enabled) {
    settings.simEnabled = enabled;
    save();
    if (enabled) {
        startSimulation();
        showToast("Sales simulation started", "success");
    } else {
        stopSimulation();
        showToast("Sales simulation paused", "info");
    }
}

function updateSimSpeed(val) {
    settings.simSpeed = parseInt(val);
    document.getElementById("simSpeedDisplay").textContent = val + "s";
    save();
    if (settings.simEnabled) startSimulation();
}

// ═══════════════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════════════

function applySettings() {
    const el = document.getElementById("lowStockThreshold");
    if (!el) return;
    el.value = settings.lowStockThreshold;
    document.getElementById("thresholdDisplay").textContent = settings.lowStockThreshold;
    document.getElementById("simToggle").checked = settings.simEnabled;
    document.getElementById("simSpeed").value = settings.simSpeed;
    document.getElementById("simSpeedDisplay").textContent = settings.simSpeed + "s";
}

function updateThreshold(val) {
    settings.lowStockThreshold = parseInt(val);
    document.getElementById("thresholdDisplay").textContent = val;
    save();
    renderAll();
}

// ═══════════════════════════════════════════════════
//  DATA MANAGEMENT
// ═══════════════════════════════════════════════════

function exportJSON() {
    const data = JSON.stringify({ products, salesHistory, alerts, settings }, null, 2);
    downloadFile(data, "nexusai-inventory-export.json", "application/json");
    showToast("Data exported as JSON", "success");
}

function exportCSV() {
    if (products.length === 0) { showToast("No data to export", "warning"); return; }

    let csv = "Name,Category,Stock,Price,Sales,Revenue\n";
    products.forEach(p => {
        csv += `"${p.name}","${p.category || 'Other'}",${p.stock},${p.price},${p.sales},${(p.sales * p.price).toFixed(2)}\n`;
    });

    downloadFile(csv, "nexusai-inventory.csv", "text/csv");
    showToast("Data exported as CSV", "success");
}

function downloadFile(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function importJSON() {
    document.getElementById("importFile").click();
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.products) products = data.products;
            if (data.salesHistory) salesHistory = data.salesHistory;
            if (data.alerts) alerts = data.alerts;
            if (data.settings) {
                settings = { ...settings, ...data.settings };
                applySettings();
            }
            save();
            renderAll();
            showToast(`Imported ${products.length} products successfully!`, "success");
        } catch (err) {
            showToast("Invalid JSON file", "error");
        }
    };
    reader.readAsText(file);
    event.target.value = "";
}

function resetData() {
    if (!confirm("⚠️ This will delete ALL inventory data. Are you sure?")) return;

    products = [];
    salesHistory = [];
    alerts = [];
    save();
    renderAll();
    showToast("All data has been reset", "info");
}

// ═══════════════════════════════════════════════════
//  DEMO DATA
// ═══════════════════════════════════════════════════

function loadDemoData() {
    const demoProducts = [
        { name: "Wireless Headphones", stock: 45, price: 79.99, category: "Electronics", popularity: 0.9 },
        { name: "Smart Watch Pro", stock: 28, price: 199.99, category: "Electronics", popularity: 0.85 },
        { name: "USB-C Hub 7-in-1", stock: 120, price: 34.99, category: "Electronics", popularity: 0.6 },
        { name: "Yoga Mat Premium", stock: 67, price: 49.99, category: "Sports", popularity: 0.55 },
        { name: "Running Shoes X1", stock: 12, price: 129.99, category: "Sports", popularity: 0.75 },
        { name: "Organic Coffee Beans", stock: 3, price: 18.99, category: "Food", popularity: 0.95 },
        { name: "LED Desk Lamp", stock: 88, price: 42.99, category: "Home", popularity: 0.5 },
        { name: "Cotton T-Shirt Pack", stock: 150, price: 24.99, category: "Clothing", popularity: 0.4 },
        { name: "Bluetooth Speaker", stock: 6, price: 59.99, category: "Electronics", popularity: 0.8 },
        { name: "Protein Powder 2kg", stock: 22, price: 39.99, category: "Food", popularity: 0.65 },
        { name: "Ergonomic Mouse", stock: 55, price: 44.99, category: "Electronics", popularity: 0.7 },
        { name: "Winter Jacket", stock: 8, price: 89.99, category: "Clothing", popularity: 0.35 }
    ];

    products = demoProducts.map(p => {
        const sales = Math.floor(p.popularity * (20 + Math.random() * 60));
        const history = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            history.push({
                date: d.toISOString().split("T")[0],
                qty: Math.max(0, Math.round((sales / 14) * (0.5 + Math.random())))
            });
        }

        return {
            id: Date.now() + Math.random(),
            name: p.name,
            stock: p.stock,
            price: p.price,
            category: p.category,
            sales,
            salesHistory: history,
            addedDate: new Date().toISOString(),
            popularity: p.popularity
        };
    });

    // Build global sales history
    salesHistory = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];

        let daySales = 0, dayRev = 0;
        products.forEach(p => {
            const h = p.salesHistory.find(e => e.date === dateStr);
            if (h) {
                daySales += h.qty;
                dayRev += h.qty * p.price;
            }
        });

        salesHistory.push({ date: dateStr, sales: daySales, revenue: dayRev });
    }

    // Generate initial alerts
    generateAlerts();

    save();
    renderAll();
    showToast("🚀 Demo data loaded — 12 products with sales history!", "success");
}