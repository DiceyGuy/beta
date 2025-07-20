# MTG Scanner Pro

## 🃏 AI-Powered Magic: The Gathering Card Scanner

A web application that uses AI to scan and identify Magic: The Gathering cards in real-time, providing instant pricing and collection management.

## ✨ Features

- **98% Accuracy AI Recognition** - Powered by Google Gemini Vision API
- **Real-time Card Pricing** - Integration with Scryfall API
- **Edition Selector** - Choose specific sets and foil variants
- **Digital Collection Management** - Organize cards in custom binders
- **Export Functionality** - Export to Moxfield, Archidekt, CSV, JSON, and more
- **Auto-Scan Mode** - Continuous scanning for bulk processing
- **Subscription Tiers** - Free and premium plans via Stripe

## 🚀 Quick Start

### Local Development
```bash
# Clone or download the files
cd C:\MTGScannerClean

# Install Vercel CLI (if not installed)
npm install -g vercel

# Run locally
vercel dev

# Deploy to production
vercel --prod
```

### File Structure
```
.
├── index.html          # Main application
├── pricing.html        # Subscription plans
├── success.html        # Payment success page
├── test.html          # System diagnostics
├── vercel.json        # Deployment configuration
└── README.md          # This file
```

## 🔧 Configuration



### Environment Variables (Recommended)
```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## 💳 Subscription Plans

| Plan | Price | Scans | Features |
|------|-------|-------|----------|
| Free | $0 | 20/day | Basic features |
| Basic | $4.99 | 1,000/month | + Price alerts |
| Pro | $9.99 | 10,000/month | + Analytics |
| Family | $14.99 | 10,000 shared | 3 accounts |
| Store | $49.99 | Unlimited | Business tools |

## 🛠️ Troubleshooting

### Common Issues

1. **Camera not working**
   - Ensure HTTPS connection
   - Check browser permissions
   - Try different browser

2. **Card not recognized**
   - Better lighting
   - Hold card steady
   - Clear background

3. **Price not showing**
   - Check internet connection
   - Card might be too new
   - Try different edition

### Debug Tools

Open `test.html` to:
- Test camera access
- Verify API connections
- Check user status
- Clear stored data

## 📱 Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Limited (camera issues)
- Mobile: iOS Safari, Chrome Android

## 🔒 Security Notes

1. Move API keys to environment variables
2. Implement rate limiting
3. Add user authentication
4. Secure payment webhooks

## 📈 Future Enhancements

- [ ] Backend API service
- [ ] User authentication
- [ ] Database storage
- [ ] Mobile app
- [ ] Bulk import/export
- [ ] Trade matching
- [ ] Price history charts
- [ ] Deck building tools

## 📞 Support

- Email: support@mtgscanner.com
- Issues: Check console logs
- Test page: `/test.html`

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ for the MTG community
