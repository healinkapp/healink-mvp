#!/bin/bash

# HEALINK MVP - Firebase Functions Setup Script
# Run this after creating functions folder

echo "🚀 Setting up Healink Firebase Functions..."
echo ""

# Check if we're in the right directory
if [ ! -d "functions" ]; then
    echo "❌ Error: functions directory not found"
    echo "Run this script from the project root"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd functions
npm install
cd ..
echo "✅ Dependencies installed"
echo ""

# Set Firebase Functions config
echo "🔧 Setting Firebase Functions configuration..."
echo ""

read -p "Enter EmailJS Service ID (service_xxxxx): " SERVICE_ID
read -p "Enter EmailJS Public Key: " PUBLIC_KEY
read -p "Enter EmailJS Private Key: " PRIVATE_KEY
echo ""

read -p "Enter Day 1 Template ID: " TEMPLATE_DAY1
read -p "Enter Day 3 Template ID: " TEMPLATE_DAY3
read -p "Enter Day 5 Template ID: " TEMPLATE_DAY5
read -p "Enter Day 7 Template ID: " TEMPLATE_DAY7
read -p "Enter Day 30 Template ID: " TEMPLATE_DAY30
echo ""

# Set all configs at once
firebase functions:config:set \
  emailjs.service_id="$SERVICE_ID" \
  emailjs.public_key="$PUBLIC_KEY" \
  emailjs.private_key="$PRIVATE_KEY" \
  emailjs.template_day1="$TEMPLATE_DAY1" \
  emailjs.template_day3="$TEMPLATE_DAY3" \
  emailjs.template_day5="$TEMPLATE_DAY5" \
  emailjs.template_day7="$TEMPLATE_DAY7" \
  emailjs.template_day30="$TEMPLATE_DAY30"

echo ""
echo "✅ Configuration set successfully"
echo ""

# Show current config
echo "📋 Current configuration:"
firebase functions:config:get
echo ""

# Ask to deploy
read -p "Deploy to Firebase now? (y/n): " DEPLOY

if [ "$DEPLOY" = "y" ] || [ "$DEPLOY" = "Y" ]; then
    echo ""
    echo "🚀 Deploying to Firebase..."
    firebase deploy --only functions
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📊 Check logs with: firebase functions:log --only dailyAftercare"
else
    echo ""
    echo "⏭️  Skipping deployment"
    echo "Deploy later with: firebase deploy --only functions"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Monitor first execution at 9 AM Dublin time"
echo "2. Check logs: firebase functions:log"
echo "3. Verify emails/pushes are sent correctly"
echo ""
