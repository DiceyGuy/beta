// ADD THIS TO YOUR CURRENT index.html AFTER LINE 888 (in the styles)

/* Usage Tracker from v1.3 */
.usage-tracker {
    background: #2a2a2a;
    border: 1px solid #4a90e2;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 20px;
}

.usage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.usage-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.usage-bar {
    background: #1a1a1a;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
}

.usage-fill {
    height: 100%;
    background: #4a90e2;
    transition: width 0.3s ease;
}

// ADD THIS HTML AFTER LINE 920 (after the nav-bar)

<!-- Usage Tracker -->
<div class="usage-tracker" style="max-width: 1400px; margin: 20px auto;">
    <div class="usage-header">
        <span style="color: #4a90e2; font-weight: bold;">
            📊 <span id="usagePeriodLabel">Daily</span> Usage (<span id="userTierDisplay">Free</span>)
        </span>
        <button onclick="openPricingModal()" class="btn btn-warning" style="padding: 6px 12px; font-size: 12px;">
            💎 Upgrade - Starting $4.99
        </button>
    </div>
    <div class="usage-stats">
        <span style="font-weight: bold;"><span id="usageCount">0</span> / <span id="usageLimit">20</span> scans</span>
        <span style="color: #888; font-size: 12px;"><span id="remainingCount">20</span> remaining</span>
    </div>
    <div class="usage-bar">
        <div id="usageBar" class="usage-fill" style="width: 0%;"></div>
    </div>
</div>

// ADD THIS JAVASCRIPT AFTER LINE 1237 (in the state object)

// Add to state object:
userPlan: localStorage.getItem('mtg_plan_type') || 'free',
dailyScans: 0,
monthlyScans: 0,

// ADD THESE FUNCTIONS AFTER LINE 1400

function checkScanLimit() {
    if (state.userTier === 'premium') {
        // Check monthly limits for premium users
        const limits = {
            'basic': 1000,
            'pro': 10000,
            'family': 10000,
            'store': 999999
        };
        const limit = limits[state.userPlan] || 1000;
        const usage = getMonthlyUsage();
        
        if (usage >= limit) {
            openPricingModal();
            showToast(`Monthly limit reached (${limit} scans)`, "warning");
            return false;
        }
        return true;
    } else {
        // Check daily limit for free users
        const usage = getTodayScans();
        if (usage >= 20) {
            openPricingModal();
            showToast("Daily limit reached (20 scans). Upgrade for more!", "warning");
            return false;
        }
        return true;
    }
}

function updateUsageDisplay() {
    const planDetails = {
        'free': { limit: 20, name: 'Free', period: 'Daily' },
        'basic': { limit: 1000, name: 'Basic', period: 'Monthly' },
        'pro': { limit: 10000, name: 'Pro', period: 'Monthly' },
        'family': { limit: 10000, name: 'Family', period: 'Monthly' },
        'store': { limit: 999999, name: 'Store', period: 'Monthly' }
    };
    
    const plan = planDetails[state.userPlan] || planDetails['free'];
    const usage = state.userTier === 'premium' ? getMonthlyUsage() : getTodayScans();
    const percentage = (usage / plan.limit) * 100;
    
    document.getElementById('usageCount').textContent = usage;
    document.getElementById('usageLimit').textContent = plan.limit;
    document.getElementById('remainingCount').textContent = Math.max(0, plan.limit - usage);
    document.getElementById('usageBar').style.width = Math.min(percentage, 100) + '%';
    document.getElementById('userTierDisplay').textContent = plan.name;
    document.getElementById('usagePeriodLabel').textContent = plan.period;
}

function getMonthlyUsage() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return parseInt(localStorage.getItem('mtg_monthly_scans_' + currentMonth) || '0');
}

function openPricingModal() {
    // Create pricing modal (add the full modal HTML here)
    showToast("Opening pricing options...", "info");
    // For now, redirect to Stripe
    if (confirm("View pricing plans?")) {
        window.location.href = CONFIG.STRIPE_PAYMENT_LINKS.pro;
    }
}

// MODIFY scanCard function - add this at the beginning:
if (!checkScanLimit()) return;

// ADD after successful scan:
if (state.userTier === 'premium') {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usage = getMonthlyUsage();
    localStorage.setItem('mtg_monthly_scans_' + currentMonth, (usage + 1).toString());
} else {
    const today = new Date().toDateString();
    const usage = getTodayScans();
    localStorage.setItem('mtg_scans_' + today, (usage + 1).toString());
}
updateUsageDisplay();

// CHECK FOR PAYMENT SUCCESS - Add to initializeApp():
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('payment') === 'success' || urlParams.get('success') === 'true') {
    const plan = urlParams.get('plan') || 'pro';
    state.userTier = 'premium';
    state.userPlan = plan;
    localStorage.setItem('mtg_user_tier', 'premium');
    localStorage.setItem('mtg_plan_type', plan);
    showToast(`🎉 Welcome to MTG Scanner ${plan.toUpperCase()}! Enjoy unlimited scanning!`, "success");
    window.history.replaceState({}, document.title, window.location.pathname);
}