# 🔧 QUICK FIX GUIDE - MTG Scanner Pro

## 🚨 Current Issue: Scryfall API Card Name Parsing

The scanner is including "CONFIDENCE: 95" in the card name when searching Scryfall, causing 404 errors.

### Fix Location: `index.html` (Line ~210 in the original file)

**Find this code:**
```javascript
// FIXED: Better regex to capture only the card name
const nameMatch = text.match(/CARD_NAME:\s*([^\n]+?)(?:\s*CONFIDENCE:|$)/i);
const confMatch = text.match(/CONFIDENCE:\s*(\d+)/i);

if (nameMatch) {
    const cardName = nameMatch[1].trim();
    console.log("📝 Parsed card name:", cardName);
```

**Replace with:**
```javascript
// FIXED: Better regex to capture only the card name
const nameMatch = text.match(/CARD_NAME:\s*([^|\n]*?)(?:\s*(?:CONFIDENCE:|$))/i);
const confMatch = text.match(/CONFIDENCE:\s*(\d+)/i);

if (nameMatch) {
    // Remove any trailing CONFIDENCE text that might have been captured
    const cardName = nameMatch[1].trim().replace(/\s*CONFIDENCE:.*$/i, '');
    console.log("📝 Parsed card name:", cardName);
```

## 🚂 Railway Setup Instructions

### Step 1: Prepare Your Project

1. **Copy all files to the fixed directory:**
   ```
   C:\MTGScannerClean\mtg-scanner-pro-fixed\
   ```

2. **Install dependencies:**
   ```bash
   cd C:\MTGScannerClean\mtg-scanner-pro-fixed
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   copy .env.example .env
   ```

4. **Edit `.env` with your actual keys:**
   ```env
   STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   NODE_ENV=production
   PORT=3000
   DOMAIN=https://www.mtgscanner.com
   ```

### Step 2: Set Up Stripe

1. **Go to Stripe Dashboard**
   - https://dashboard.stripe.com

2. **Create Products:**
   - Basic Plan: $4.99/month
   - Pro Plan: $9.99/month
   - Family Plan: $14.99/month
   - Store Plan: $49.99/month

3. **For each product, create a Payment Link:**
   - Go to Product → Create payment link
   - Set as recurring/subscription
   - Set success URL: `https://www.mtgscanner.com/index.html?payment=success&plan={PRODUCT_NAME}`
   - Set cancel URL: `https://www.mtgscanner.com/pricing.html`

4. **Set up Webhook:**
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-railway-domain.up.railway.app/webhook`
   - Select events: `checkout.session.completed`
   - Copy the signing secret

### Step 3: Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Create new project:**
   ```bash
   railway init
   ```

4. **Link to GitHub (recommended):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/mtg-scanner-pro.git
   git push -u origin main
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Set Environment Variables in Railway Dashboard:**
   - Go to your project on https://railway.app
   - Click on your service
   - Go to Variables tab
   - Add all variables from your `.env` file

7. **Get your Railway domain:**
   - In Railway dashboard → Settings → Domains
   - Copy your domain (e.g., `mtg-scanner.up.railway.app`)

### Step 4: Update Frontend Code

In your `index.html`, update the payment function to use the backend:

```javascript
async function selectPlan(planType, priceInCents) {
    try {
        document.getElementById('checkoutLoading').style.display = 'flex';
        
        // Call your backend instead of Stripe directly
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                plan: planType,
                priceInCents: priceInCents
            })
        });
        
        const { url } = await response.json();
        
        if (url) {
            window.location.href = url;
        } else {
            throw new Error('No checkout URL received');
        }
        
    } catch (error) {
        console.error('Checkout error:', error);
        alert('Something went wrong: ' + error.message);
        document.getElementById('checkoutLoading').style.display = 'none';
    }
}
```

### Step 5: Configure Custom Domain (Optional)

1. **In Railway Dashboard:**
   - Go to Settings → Custom Domains
   - Add `www.mtgscanner.com`

2. **Update your DNS:**
   - Add CNAME record: `www` → `your-app.up.railway.app`
   - Or use Railway's nameservers

## 🧪 Testing

1. **Test locally first:**
   ```bash
   npm start
   ```
   Visit http://localhost:3000

2. **Test card scanning:**
   - Point camera at an MTG card
   - Click "Scan Card"
   - Check console for parsed card name (should NOT include "CONFIDENCE:")

3. **Test payment flow:**
   - Click Upgrade
   - Select a plan
   - Complete test payment
   - Verify redirect to success page

## 📊 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_51R...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_3F9...` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3000` |
| `DOMAIN` | Your domain | `https://www.mtgscanner.com` |

## 🆘 Troubleshooting

### Issue: "Card not found" errors
- Check console for the parsed card name
- Ensure it doesn't include "CONFIDENCE:" text
- Verify the regex fix is applied correctly

### Issue: Payment not working
- Check Stripe dashboard for errors
- Verify webhook is receiving events
- Check Railway logs: `railway logs`

### Issue: Camera not working
- Ensure HTTPS is enabled
- Check browser permissions
- Try different browser

## 📞 Need Help?

- **Railway Logs:** `railway logs`
- **Stripe Logs:** Dashboard → Developers → Logs
- **Browser Console:** F12 → Console tab

---

Remember to update the payment links in your code once you have the real Stripe payment URLs!
