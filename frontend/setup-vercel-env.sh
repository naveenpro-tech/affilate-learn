#!/bin/bash

# Vercel Environment Variables Setup Script
# This script helps you add environment variables to Vercel

echo "🔧 Vercel Environment Variables Setup"
echo "======================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Add NEXT_PUBLIC_API_URL
echo "📝 Adding NEXT_PUBLIC_API_URL..."
echo "https://affilate-learn.onrender.com" | vercel env add NEXT_PUBLIC_API_URL production
echo "https://affilate-learn.onrender.com" | vercel env add NEXT_PUBLIC_API_URL preview
echo "https://affilate-learn.onrender.com" | vercel env add NEXT_PUBLIC_API_URL development

echo ""
echo "✅ NEXT_PUBLIC_API_URL added"
echo ""

# Add NEXT_PUBLIC_RAZORPAY_KEY_ID
echo "📝 Adding NEXT_PUBLIC_RAZORPAY_KEY_ID..."
echo "rzp_test_RBrPafmy42Nmd7" | vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID production
echo "rzp_test_RBrPafmy42Nmd7" | vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID preview
echo "rzp_test_RBrPafmy42Nmd7" | vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID development

echo ""
echo "✅ NEXT_PUBLIC_RAZORPAY_KEY_ID added"
echo ""

echo "🎉 All environment variables added successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Redeploy your application: vercel --prod"
echo "2. Test login at: https://frontend-k01kudwt0-naveenvide-9992s-projects.vercel.app"
echo ""

