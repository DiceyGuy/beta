# 🃏 MTG Scanner Pro

AI-Powered Magic: The Gathering card scanner with 98% accuracy, real-time pricing, and digital collection management.

![MTG Scanner Pro](https://img.shields.io/badge/version-1.3.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![AI Accuracy](https://img.shields.io/badge/AI%20Accuracy-98%25-success)

## 🚀 Features

- **98% AI Recognition Accuracy** - Powered by Google Gemini Vision API
- **Real-Time Pricing** - Live card prices from Scryfall API
- **Digital Collection Manager** - Organize cards in custom folders
- **Multiple Export Formats** - Moxfield, Archidekt, MTGO, Arena, CSV, JSON
- **Subscription Model** - Free tier + Pro/Family/Store plans
- **Secure Payments** - Stripe integration for subscriptions

## 📋 Prerequisites

- Node.js 16+ 
- Stripe account (for payments)
- Google Cloud account (for Gemini API)
- Railway account (for deployment)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mtg-scanner-pro.git
   cd mtg-scanner-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   STRIPE_SECRET_KEY=sk_live_YOUR_KEY
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
   DOMAIN=https://www.mtgscanner.com
   NODE_ENV=production
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`

## 🚂 Railway Deployment

1. **Connect to Railway**
   ```bash
   railway login
   railway link
   ```

2. **Add environment variables in Railway dashboard**
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `DOMAIN`
   - `NODE_ENV=production`

3. **Deploy**
   ```bash
   railway up
   ```

## 💳 Stripe Setup

1. **Create Products in Stripe Dashboard**
   - Basic: $4.99/month (1,000 scans)
   - Pro: $9.99/month (10,000 scans)
   - Family: $14.99/month (3 users)
   - Store: $49.99/month (unlimited)

2. **Set up Webhook**
   - URL: `https://your-domain.com/webhook`
   - Events: `checkout.session.completed`

3. **Get Webhook Secret**
   - Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

## 📱 Features Overview

### Scanner Modes
- **Fast Mode** - Quick single card scanning
- **Accurate Mode** - Full card details with set/number
- **Manual Mode** - Type card name for lookup

### Collection Organization
- **Folders** - Main, Decks (by format), Wishlist, Trade Binder
- **Views** - Grid, List, Image-only
- **Sort Options** - Name, Price, Set, Rarity, Color, CMC
- **Batch Operations** - Move, Copy, Delete multiple cards

### Export Formats
- **Moxfield/Archidekt** - Simple card list
- **MTGO** - Online play format
- **Arena** - With set codes
- **CSV** - For spreadsheets
- **JSON** - Full backup

## 🔧 API Keys

### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to frontend code (index.html)

### Scryfall API
- No key required
- Rate limit: 10 requests/second
- Automatically handled by the app

## 📊 Architecture

```
mtg-scanner-pro/
├── server.js          # Express backend
├── index.html         # Main scanner app
├── pricing.html       # Pricing page
├── success.html       # Payment success
├── package.json       # Dependencies
├── railway.json       # Railway config
└── .env              # Environment variables
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- Email: support@mtgscanner.com
- Discord: [Join our community](https://discord.gg/mtgscanner)
- Issues: [GitHub Issues](https://github.com/YOUR_USERNAME/mtg-scanner-pro/issues)

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Deck building features
- [ ] Price alerts
- [ ] Trade matching
- [ ] Tournament support
- [ ] API for developers

## 💡 Tips

- For best scanning results, use good lighting
- Hold cards flat and steady
- Avoid reflective sleeves if possible
- Use manual mode for damaged cards

---

Built with ❤️ by the MTG Scanner Pro team
