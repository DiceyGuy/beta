const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['https://www.mtgscanner.com', 'https://mtgscanner.com', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Serve static files
app.use(express.static('.'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/pricing', (req, res) => {
    res.sendFile(path.join(__dirname, 'pricing.html'));
});

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});

// Create Stripe checkout session
app.post('/create-checkout-session', async (req, res) => {
    const { plan, priceInCents } = req.body;
    
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `MTG Scanner Pro - ${plan}`,
                        description: getPlanDescription(plan),
                    },
                    unit_amount: priceInCents,
                    recurring: {
                        interval: 'month'
                    }
                },
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${process.env.DOMAIN || 'https://www.mtgscanner.com'}/index.html?payment=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.DOMAIN || 'https://www.mtgscanner.com'}/pricing.html`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Stripe webhook
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
        const event = stripe.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
        
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            console.log('✅ Payment successful:', session.id);
            // Here you would typically update user's subscription status in a database
        }
        
        res.json({received: true});
    } catch (err) {
        console.error('Webhook error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development'
    });
});

function getPlanDescription(plan) {
    const descriptions = {
        'basic': '1,000 scans per month',
        'pro': '10,000 scans per month + Analytics',
        'family': '3 users + 10,000 shared scans',
        'store': 'Unlimited scans + Multi-user'
    };
    return descriptions[plan] || 'MTG Scanner Subscription';
}

app.listen(PORT, () => {
    console.log(`🚀 MTG Scanner Pro server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
