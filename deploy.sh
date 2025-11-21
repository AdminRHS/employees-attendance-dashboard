#!/bin/bash

# Vercel Deployment Script
# Використання: ./deploy.sh [--prod]

set -e

echo "🚀 Starting Vercel deployment..."

# Перевірка чи залогінений користувач
if ! vercel whoami &>/dev/null; then
    echo "❌ Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

# Перевірка чи проект залінкований
if [ ! -f ".vercel/project.json" ]; then
    echo "📦 Linking project to Vercel..."
    vercel link
fi

# Deploy
if [ "$1" == "--prod" ]; then
    echo "🌐 Deploying to production..."
    vercel --prod
else
    echo "🔍 Deploying to preview..."
    vercel
fi

echo "✅ Deployment complete!"
echo "📊 Check status: vercel ls"
echo "🌐 Open in browser: vercel open"

