#!/bin/bash

# MTG Scanner Pro - Deployment Script

echo "🃏 MTG Scanner Pro - Deployment Script"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check for .env file
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env with your API keys before deploying!"
    echo ""
    read -p "Press Enter to continue after updating .env..."
fi

# Railway check
echo ""
echo "🚂 Checking Railway CLI..."
if command -v railway &> /dev/null; then
    echo "✅ Railway CLI is installed"
    
    read -p "Deploy to Railway? (y/n): " deploy_railway
    if [ "$deploy_railway" = "y" ]; then
        echo "📤 Deploying to Railway..."
        railway up
    fi
else
    echo "⚠️  Railway CLI not installed."
    echo "Install with: npm install -g @railway/cli"
fi

# Git setup
echo ""
echo "📝 Setting up Git..."
if [ ! -d .git ]; then
    git init
    git add .
    git commit -m "Initial commit: MTG Scanner Pro v1.3"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Local test
echo ""
read -p "Start local server for testing? (y/n): " start_local
if [ "$start_local" = "y" ]; then
    echo "🚀 Starting local server on http://localhost:3000"
    npm start
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your Stripe and other API keys"
echo "2. Set up Stripe products and webhooks"
echo "3. Deploy to Railway or your preferred host"
echo "4. Configure custom domain"
echo ""
echo "Happy scanning! 🃏"
