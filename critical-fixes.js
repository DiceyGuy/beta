// MTG Scanner Pro - Critical Fixes to Apply
// Copy these methods to replace the existing ones in your index.html

// ========================================
// FIX 1: Card Name Parsing (Replace callGemini method)
// ========================================
async callGemini(imageData) {
    const body = {
        contents: [{
            parts: [
                { text: "Analyze this image for Magic: The Gathering cards. If you see an MTG card, respond with: CARD_NAME: [exact name] CONFIDENCE: [80-99]. If no MTG card, respond: NO_MTG_CARD" },
                { inline_data: { mime_type: "image/jpeg", data: imageData } }
            ]
        }]
    };

    const response = await fetch(this.geminiUrl + '?key=' + this.apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    console.log("🧠 Gemini raw response:", text);
    
    if (text.includes('NO_MTG_CARD')) {
        return { hasCard: false, message: "No MTG card detected" };
    }

    // FIXED: Better regex to capture only the card name
    const nameMatch = text.match(/CARD_NAME:\s*([^\n]*?)(?:\s*CONFIDENCE:|$)/i);
    const confMatch = text.match(/CONFIDENCE:\s*(\d+)/i);

    if (nameMatch) {
        let cardName = nameMatch[1].trim();
        
        // Additional safety check - remove anything after "CONFIDENCE" if it still exists
        const confIndex = cardName.toUpperCase().indexOf('CONFIDENCE');
        if (confIndex > -1) {
            cardName = cardName.substring(0, confIndex).trim();
        }
        
        console.log("📝 Parsed card name:", cardName);
        console.log("📝 Confidence:", confMatch?.[1] || '85');
        
        return {
            hasCard: true,
            name: cardName,
            confidence: parseInt(confMatch?.[1] || '85'),
            source: 'gemini_ai'
        };
    }

    return { hasCard: false, message: "Could not parse response" };
}

// ========================================
// FIX 2: Card Data Fetching (Replace getCardData method)
// ========================================
async getCardData(cardName) {
    try {
        console.log(`💰 Fetching real data for: "${cardName}"`);
        
        // Extra cleaning step to ensure no extra text
        const cleanCardName = cardName.trim()
            .replace(/CONFIDENCE:\s*\d+/gi, '') // Remove any confidence text
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
        
        console.log(`🔍 Clean card name: "${cleanCardName}"`);
        
        // Try exact match first
        let searchUrl = `${this.scryfallUrl}/cards/named?exact=${encodeURIComponent(cleanCardName)}`;
        console.log(`🔍 Trying exact match: ${searchUrl}`);
        
        let response = await fetch(searchUrl);
        
        // If exact match fails, try fuzzy search
        if (!response.ok && response.status === 404) {
            console.log('⚠️ Exact match failed, trying fuzzy search...');
            searchUrl = `${this.scryfallUrl}/cards/named?fuzzy=${encodeURIComponent(cleanCardName)}`;
            response = await fetch(searchUrl);
        }
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Scryfall data received:', data.name);
            
            // Get USD price, fallback to other prices
            let price = null;
            if (data.prices) {
                price = data.prices.usd || 
                       data.prices.usd_foil || 
                       data.prices.eur || 
                       data.prices.tix || 
                       'Price not available';
                
                // Format price with dollar sign if it's a number
                if (price && !isNaN(price)) {
                    price = '$' + parseFloat(price).toFixed(2);
                }
            }
            
            return {
                name: data.name,
                image: data.image_uris ? data.image_uris.normal : null,
                price: price,
                set: data.set_name,
                setCode: data.set.toUpperCase(),
                rarity: data.rarity,
                scryfallId: data.id,
                scryfallUri: data.scryfall_uri || data.uri,
                cmc: data.cmc || 0,
                colors: data.colors || [],
                type_line: data.type_line || '',
                collectorNumber: data.collector_number || '',
                releaseDate: data.released_at || ''
            };
        } else {
            console.error('❌ Scryfall error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('❌ Error details:', errorText);
            
            // Return partial data even if Scryfall fails
            return {
                name: cleanCardName,
                price: 'Price unavailable',
                set: 'Unknown',
                scryfallError: true
            };
        }
        
    } catch (error) {
        console.error('❌ Scryfall fetch error:', error);
        // Return partial data on error
        return {
            name: cardName,
            price: 'Price unavailable',
            set: 'Unknown',
            scryfallError: true
        };
    }
}

// ========================================
// FIX 3: Payment Success Handling (Add to window load event)
// ========================================
// Add this to your window.addEventListener('load', ...) function

// 🔥 HANDLE STRIPE PAYMENT SUCCESS
const urlParams = new URLSearchParams(window.location.search);

// Debug logging
console.log('🔍 URL Parameters:', window.location.search);
console.log('🔍 All params:', Array.from(urlParams.entries()));

// Check for various success indicators from Stripe
const isPaymentSuccess = 
    urlParams.get('payment') === 'success' || 
    urlParams.get('success') === 'true' ||
    urlParams.get('session_id') || // Stripe Checkout session
    urlParams.get('payment_intent') || // Stripe Payment Intent
    urlParams.get('payment_intent_client_secret'); // Another Stripe indicator

if (isPaymentSuccess) {
    // Determine which plan was purchased
    let plan = urlParams.get('plan') || 'pro'; // Default to pro if not specified
    
    // If we have a session_id but no plan, try to determine from the URL
    if (!urlParams.get('plan') && urlParams.get('session_id')) {
        // You might need to decode the plan from session metadata
        // For now, default to pro
        plan = 'pro';
    }
    
    console.log('✅ PAYMENT SUCCESS DETECTED! Plan:', plan);
    
    // Set premium status
    localStorage.setItem('mtg_user_tier', 'premium');
    localStorage.setItem('mtg_plan_type', plan);
    localStorage.setItem('mtg_premium_date', new Date().toISOString());
    localStorage.setItem('mtg_stripe_session', urlParams.get('session_id') || '');
    
    // Reset usage counters for premium users
    const currentMonth = new Date().toISOString().slice(0, 7);
    localStorage.setItem('mtg_monthly_scans_' + currentMonth, '0');
    
    userTier = 'premium';
    userPlan = plan;
    
    // Update display immediately
    updateUsageDisplay();
    
    // Show success message
    setTimeout(() => {
        const planNames = {
            'basic': 'Basic ($4.99/month)',
            'pro': 'Pro ($9.99/month)',
            'family': 'Family ($14.99/month)',
            'store': 'Store ($49.99/month)'
        };
        
        alert(`🎉 Payment Successful!\n\nWelcome to MTG Scanner Pro ${planNames[plan] || plan}!\n\nYou now have:\n✅ Increased scan limits\n✅ Premium features unlocked\n✅ Priority support\n\nThank you for your purchase!`);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }, 1000);
}

// ========================================
// FIX 4: Updated selectPlan function with return URLs
// ========================================
async function selectPlan(planType, priceInCents) {
    try {
        console.log(`🚀 REAL STRIPE CHECKOUT: ${planType}, $${priceInCents/100}`);
        
        document.getElementById('checkoutLoading').style.display = 'flex';
        
        // ✅ REAL STRIPE PAYMENT LINKS with return URL parameters
        const currentUrl = window.location.origin + window.location.pathname;
        const successUrl = `${currentUrl}?payment=success&plan=${planType}`;
        
        // Construct Stripe URLs with success parameters
        const stripePaymentUrls = {
            'basic': `https://buy.stripe.com/14A6oAcY64PZ7319qE48004?success_url=${encodeURIComponent(successUrl)}`,
            'pro': `https://buy.stripe.com/5kQ7sEf6edmv2ML6es48001?success_url=${encodeURIComponent(successUrl)}`,
            'family': `https://buy.stripe.com/fZu28k0bkeqzgDBdGU48000?success_url=${encodeURIComponent(successUrl)}`,
            'store': `https://buy.stripe.com/bJebIU1foaaj875cCQ48003?success_url=${encodeURIComponent(successUrl)}`
        };
        
        // Small delay for loading animation, then redirect
        setTimeout(() => {
            console.log(`🚀 Redirecting to Stripe checkout for ${planType}`);
            
            // ✅ REAL PAYMENT REDIRECT
            window.location.href = stripePaymentUrls[planType];
            
            // If redirect fails, hide loading after 2 seconds
            setTimeout(() => {
                document.getElementById('checkoutLoading').style.display = 'none';
            }, 2000);
            
        }, 1000);
        
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Something went wrong: ' + error.message);
        document.getElementById('checkoutLoading').style.display = 'none';
    }
}

// ========================================
// FIX 5: Monthly usage tracking for premium users
// ========================================
function getMonthlyUsage() {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    return parseInt(localStorage.getItem('mtg_monthly_scans_' + currentMonth) || '0');
}

function trackScan() {
    // Check for premium status first
    if (userTier === 'premium') {
        // Premium users have monthly limits
        const planLimits = {
            'basic': 1000,
            'pro': 10000,
            'family': 10000,
            'store': 999999
        };
        const limit = planLimits[userPlan] || 10000;
        const usage = getMonthlyUsage();
        
        if (usage >= limit) {
            alert(`You've reached your ${userPlan} plan limit of ${limit.toLocaleString()} scans this month. Please upgrade your plan or wait until next month.`);
            openUpgradeModal();
            return false;
        }
        
        // Track monthly usage for premium
        const currentMonth = new Date().toISOString().slice(0, 7);
        localStorage.setItem('mtg_monthly_scans_' + currentMonth, (usage + 1).toString());
    } else {
        // Free users have daily limits
        const dailyLimit = 20;
        const todayUsage = getTodayUsage();
        
        if (todayUsage >= dailyLimit) {
            openUpgradeModal();
            return false;
        }
        
        // Track daily usage for free
        const today = new Date().toDateString();
        localStorage.setItem('mtg_scans_' + today, (todayUsage + 1).toString());
    }
    
    updateUsageDisplay();
    return true;
}

// ========================================
// BONUS: Debug Helper (Add at the end of your script)
// ========================================
window.mtgDebug = {
    // Show all MTG-related localStorage
    showAll: () => {
        console.log('\n📦 All MTG Storage:');
        Object.keys(localStorage)
            .filter(k => k.includes('mtg'))
            .forEach(key => console.log(`${key}:`, localStorage.getItem(key)));
    },
    
    // Test scan without camera
    testScan: async (cardName = 'Lightning Bolt') => {
        if (window.aiService) {
            const mockResult = {
                hasCard: true,
                name: cardName,
                confidence: 95,
                source: 'test'
            };
            mockResult.cardData = await window.aiService.getCardData(cardName);
            window.displayResult(mockResult);
            console.log('✅ Test scan complete. Check results panel.');
        } else {
            console.log('❌ AI Service not initialized.');
        }
    },
    
    // Simulate premium user
    setPremium: (plan = 'pro') => {
        localStorage.setItem('mtg_user_tier', 'premium');
        localStorage.setItem('mtg_plan_type', plan);
        localStorage.setItem('mtg_premium_date', new Date().toISOString());
        console.log(`✅ Set to premium (${plan}). Refresh page to see changes.`);
    },
    
    // Reset to free user
    setFree: () => {
        localStorage.removeItem('mtg_user_tier');
        localStorage.removeItem('mtg_plan_type');
        localStorage.removeItem('mtg_premium_date');
        console.log('✅ Reset to free tier. Refresh page to see changes.');
    },
    
    // Clear all usage
    clearUsage: () => {
        Object.keys(localStorage)
            .filter(k => k.includes('mtg_scans_') || k.includes('mtg_monthly_scans_'))
            .forEach(key => localStorage.removeItem(key));
        console.log('✅ Cleared all usage data.');
    }
};