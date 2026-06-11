/* =============================================================
   Page Templates — All page HTML stored as JS strings
   so the app works without a server (file:// protocol).
   The separate .html files in pages/ are kept as source reference.
   ============================================================= */

const PAGE_TEMPLATES = {

// ===================== DASHBOARD =====================
dashboard: `
<div class="page-header">
    <div class="page-header-left">
        <h2>Dashboard</h2>
        <p>Real-time overview of your inventory intelligence</p>
    </div>
    <div class="header-actions">
        <div class="sim-indicator">
            <span class="sim-dot"></span>
            AI Simulation Active
        </div>
        <span class="header-time" id="headerTime"></span>
    </div>
</div>

<div class="kpi-grid">
    <div class="kpi-card" id="kpiTotalProducts">
        <div class="kpi-icon purple">📦</div>
        <div class="kpi-label">Total Products</div>
        <div class="kpi-value" id="totalProducts">0</div>
        <div class="kpi-change up" id="kpiProductsChange">↑ Active</div>
    </div>
    <div class="kpi-card" id="kpiTotalRevenue">
        <div class="kpi-icon cyan">💰</div>
        <div class="kpi-label">Total Revenue</div>
        <div class="kpi-value" id="totalRevenue">$0</div>
        <div class="kpi-change up" id="kpiRevenueChange">↑ 0%</div>
    </div>
    <div class="kpi-card" id="kpiTotalSales">
        <div class="kpi-icon green">🛒</div>
        <div class="kpi-label">Units Sold</div>
        <div class="kpi-value" id="totalSales">0</div>
        <div class="kpi-change up" id="kpiSalesChange">↑ 0%</div>
    </div>
    <div class="kpi-card" id="kpiLowStock">
        <div class="kpi-icon orange">⚠️</div>
        <div class="kpi-label">Low Stock Alerts</div>
        <div class="kpi-value" id="lowStock">0</div>
        <div class="kpi-change down" id="kpiLowStockChange">Needs Attention</div>
    </div>
</div>

<div class="dashboard-grid">
    <div class="panel">
        <div class="panel-header">
            <h3>📊 Sales Performance</h3>
            <span class="badge badge-live">● Live</span>
        </div>
        <div class="panel-body">
            <div class="chart-container">
                <canvas id="salesChart"></canvas>
            </div>
        </div>
    </div>
    <div class="panel">
        <div class="panel-header">
            <h3>🧠 AI Insights</h3>
            <span class="badge badge-ai">AI Powered</span>
        </div>
        <div class="panel-body">
            <div class="ai-insights-grid" id="aiInsightsGrid"></div>
        </div>
    </div>
</div>

<div class="dashboard-grid">
    <div class="panel">
        <div class="panel-header">
            <h3>📈 Revenue Trend</h3>
        </div>
        <div class="panel-body">
            <div class="chart-container">
                <canvas id="revenueChart"></canvas>
            </div>
        </div>
    </div>
    <div class="panel">
        <div class="panel-header">
            <h3>🍩 Stock Distribution</h3>
        </div>
        <div class="panel-body">
            <div class="chart-container">
                <canvas id="stockDonutChart"></canvas>
            </div>
        </div>
    </div>
</div>
`,

// ===================== PRODUCTS =====================
products: `
<div class="page-header">
    <div class="page-header-left">
        <h2>Product Management</h2>
        <p>Add, edit, and manage your inventory items</p>
    </div>
    <div class="header-actions">
        <button class="btn btn-ghost btn-sm" onclick="exportCSV()">⬇ Export CSV</button>
    </div>
</div>

<div class="panel" style="margin-bottom:20px;">
    <div class="panel-header">
        <h3>➕ Add New Product</h3>
    </div>
    <div class="panel-body">
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Product Name</label>
                <input id="productName" class="form-input" placeholder="e.g. Wireless Headphones" />
            </div>
            <div class="form-group">
                <label class="form-label">Stock Qty</label>
                <input id="productStock" class="form-input" type="number" placeholder="100" min="0" />
            </div>
            <div class="form-group">
                <label class="form-label">Price ($)</label>
                <input id="productPrice" class="form-input" type="number" placeholder="29.99" min="0" step="0.01" />
            </div>
            <div class="form-group">
                <label class="form-label">Category</label>
                <select id="productCategory" class="form-select">
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Food">Food &amp; Beverage</option>
                    <option value="Home">Home &amp; Garden</option>
                    <option value="Sports">Sports</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">&nbsp;</label>
                <button class="btn btn-primary" onclick="addProduct()">Add Product</button>
            </div>
        </div>
    </div>
</div>

<div class="search-bar">
    <span class="search-icon">🔍</span>
    <input id="productSearch" placeholder="Search products by name or category..." oninput="renderProducts()" />
</div>

<div class="panel">
    <div class="panel-header">
        <h3>📋 Inventory Items <span id="productCount" style="color:var(--text-muted);font-weight:400;font-size:13px;"></span></h3>
        <div style="display:flex;gap:6px;">
            <button class="btn btn-ghost btn-sm" onclick="sortProducts('name')">Sort: Name</button>
            <button class="btn btn-ghost btn-sm" onclick="sortProducts('stock')">Sort: Stock</button>
            <button class="btn btn-ghost btn-sm" onclick="sortProducts('price')">Sort: Price</button>
        </div>
    </div>
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Stock Level</th>
                    <th>Price</th>
                    <th>Sales</th>
                    <th>Revenue</th>
                    <th>ABC</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="productTable"></tbody>
        </table>
    </div>
    <div id="emptyProductState" class="empty-state" style="display:none;">
        <div class="empty-icon">📦</div>
        <h3>No products yet</h3>
        <p>Add your first product above to get started with AI-powered inventory management.</p>
    </div>
</div>
`,

// ===================== FORECASTING =====================
forecast: `
<div class="page-header">
    <div class="page-header-left">
        <h2>AI Demand Forecasting</h2>
        <p>Predictive analytics powered by trend analysis and seasonality modeling</p>
    </div>
    <div class="header-actions">
        <span class="badge badge-ai" style="padding:8px 14px;font-size:12px;">🧠 Neural Forecast Engine v2.4</span>
    </div>
</div>

<div class="forecast-summary">
    <div class="forecast-stat">
        <div class="stat-value" id="forecast7d" style="color:var(--accent-secondary);">—</div>
        <div class="stat-label">7-Day Forecast (units)</div>
    </div>
    <div class="forecast-stat">
        <div class="stat-value" id="forecast30d" style="color:var(--accent-primary);">—</div>
        <div class="stat-label">30-Day Forecast (units)</div>
    </div>
    <div class="forecast-stat">
        <div class="stat-value" id="forecastConfidence" style="color:var(--accent-success);">—</div>
        <div class="stat-label">Confidence Score</div>
    </div>
</div>

<div class="panel" style="margin-bottom:20px;">
    <div class="panel-header">
        <h3>🔮 Demand Forecast — Next 14 Days</h3>
        <span class="badge badge-ai">AI Generated</span>
    </div>
    <div class="panel-body">
        <div class="chart-container" style="height:320px;">
            <canvas id="forecastChart"></canvas>
        </div>
    </div>
</div>

<div class="panel">
    <div class="panel-header">
        <h3>📦 Smart Reorder Suggestions</h3>
        <span class="badge badge-ai">Auto-Calculated</span>
    </div>
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Daily Velocity</th>
                    <th>Days Until Stockout</th>
                    <th>Reorder Qty</th>
                    <th>Priority</th>
                </tr>
            </thead>
            <tbody id="reorderTable"></tbody>
        </table>
    </div>
</div>
`,

// ===================== AI ALERTS =====================
alerts: `
<div class="page-header">
    <div class="page-header-left">
        <h2>AI Alert Center</h2>
        <p>Anomaly detection and intelligent inventory notifications</p>
    </div>
    <div class="header-actions">
        <button class="btn btn-ghost btn-sm" onclick="clearAlerts()">Clear All</button>
        <button class="btn btn-primary btn-sm" onclick="generateAlerts()">🔄 Refresh Analysis</button>
    </div>
</div>

<div class="alert-feed" id="alertFeed"></div>
`,

// ===================== ANALYTICS =====================
analytics: `
<div class="page-header">
    <div class="page-header-left">
        <h2>Advanced Analytics</h2>
        <p>Deep performance insights and inventory intelligence</p>
    </div>
</div>

<div class="kpi-grid" style="margin-bottom:24px;">
    <div class="kpi-card">
        <div class="kpi-icon green">📊</div>
        <div class="kpi-label">Inventory Turnover</div>
        <div class="kpi-value" id="turnoverRate">0x</div>
    </div>
    <div class="kpi-card">
        <div class="kpi-icon cyan">💎</div>
        <div class="kpi-label">Avg. Order Value</div>
        <div class="kpi-value" id="avgOrderValue">$0</div>
    </div>
    <div class="kpi-card">
        <div class="kpi-icon purple">🏆</div>
        <div class="kpi-label">Top Category</div>
        <div class="kpi-value" id="topCategory" style="font-size:20px;">—</div>
    </div>
    <div class="kpi-card">
        <div class="kpi-icon orange">📉</div>
        <div class="kpi-label">Stock Utilization</div>
        <div class="kpi-value" id="stockUtil">0%</div>
    </div>
</div>

<div class="dashboard-grid">
    <div class="panel">
        <div class="panel-header">
            <h3>🏷️ Category Revenue Breakdown</h3>
        </div>
        <div class="panel-body">
            <div class="chart-container">
                <canvas id="categoryChart"></canvas>
            </div>
        </div>
    </div>
    <div class="panel">
        <div class="panel-header">
            <h3>🏆 Top Performers</h3>
        </div>
        <div class="panel-body" id="topPerformers"></div>
    </div>
</div>

<div class="panel">
    <div class="panel-header">
        <h3>📊 Sales vs Stock Comparison</h3>
    </div>
    <div class="panel-body">
        <div class="chart-container">
            <canvas id="salesVsStockChart"></canvas>
        </div>
    </div>
</div>
`,

// ===================== AI ASSISTANT =====================
assistant: `
<div class="page-header">
    <div class="page-header-left">
        <h2>AI Assistant</h2>
        <p>Ask questions about your inventory in natural language</p>
    </div>
    <div class="header-actions">
        <span class="badge badge-ai" style="padding:8px 14px;font-size:12px;">🧠 NexusAI GPT v3.1</span>
    </div>
</div>

<div class="panel">
    <div class="chat-container">
        <div class="chat-messages" id="chatMessages">
            <div class="chat-message ai">
                <div class="chat-avatar">🧠</div>
                <div class="chat-bubble">
                    👋 Hi! I'm your NexusAI inventory assistant. I can analyze your stock levels, sales
                    trends, and give you smart recommendations. Try asking me something!
                </div>
            </div>
        </div>
        <div class="chat-suggestions" id="chatSuggestions">
            <button class="chat-suggestion-btn" onclick="askAI('What is my best selling product?')">🔥 Best seller?</button>
            <button class="chat-suggestion-btn" onclick="askAI('Which products need restock?')">📦 Need restock?</button>
            <button class="chat-suggestion-btn" onclick="askAI('Show me revenue summary')">💰 Revenue summary</button>
            <button class="chat-suggestion-btn" onclick="askAI('How is my inventory health?')">🏥 Inventory health</button>
            <button class="chat-suggestion-btn" onclick="askAI('What are the current trends?')">📈 Current trends</button>
        </div>
        <div class="chat-input-wrapper">
            <input id="chatInput" placeholder="Ask NexusAI anything about your inventory..." onkeypress="if(event.key==='Enter')sendChat()" />
            <button class="btn btn-primary" onclick="sendChat()">Send ➤</button>
        </div>
    </div>
</div>
`,

// ===================== SETTINGS =====================
settings: `
<div class="page-header">
    <div class="page-header-left">
        <h2>Settings</h2>
        <p>Configure your inventory management preferences</p>
    </div>
</div>

<div class="settings-grid">
    <div class="setting-card">
        <h4>⚠️ Low Stock Threshold</h4>
        <p>Set the minimum stock level before triggering AI alerts</p>
        <div class="range-wrapper">
            <input type="range" id="lowStockThreshold" min="1" max="50" value="5" oninput="updateThreshold(this.value)" />
            <span class="range-value" id="thresholdDisplay">5</span>
        </div>
    </div>

    <div class="setting-card">
        <h4>🔄 Auto Sales Simulation</h4>
        <p>Enable background sales simulation for demo purposes</p>
        <label class="toggle-switch">
            <input type="checkbox" id="simToggle" checked onchange="toggleSimulation(this.checked)" />
            <span class="toggle-slider"></span>
        </label>
    </div>

    <div class="setting-card">
        <h4>⚡ Simulation Speed</h4>
        <p>How frequently auto-sales occur (in seconds)</p>
        <div class="range-wrapper">
            <input type="range" id="simSpeed" min="2" max="30" value="8" oninput="updateSimSpeed(this.value)" />
            <span class="range-value" id="simSpeedDisplay">8s</span>
        </div>
    </div>

    <div class="setting-card">
        <h4>💾 Data Management</h4>
        <p>Export or reset your inventory data</p>
        <div class="export-btns">
            <button class="btn btn-ghost btn-sm" onclick="exportJSON()">📥 Export JSON</button>
            <button class="btn btn-ghost btn-sm" onclick="importJSON()">📤 Import JSON</button>
            <button class="btn btn-danger btn-sm" onclick="resetData()">🗑 Reset All Data</button>
        </div>
        <input type="file" id="importFile" accept=".json" style="display:none" onchange="handleImport(event)" />
    </div>

    <div class="setting-card full-width">
        <h4>🎮 Demo Mode</h4>
        <p>Load sample inventory data to explore all features instantly</p>
        <button class="btn btn-primary" onclick="loadDemoData()">🚀 Load Demo Data (Recommended for first time)</button>
    </div>
</div>
`

};
