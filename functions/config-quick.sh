#!/bin/bash

# HEALINK MVP - Quick Firebase Functions Config
# Uses pre-filled values from .env.local

echo "🚀 Configuring Firebase Functions with Healink credentials..."
echo ""

# EmailJS Configuration
firebase functions:config:set \
  emailjs.service_id="service_13h3kki" \
  emailjs.public_key="uH10FXkw8yv434h5P" \
  emailjs.private_key="46LIXk6cVjUGFeUty-fg5" \
  emailjs.template_day1="template_d75273a" \
  emailjs.template_day3="template_xtdi2sx" \
  emailjs.template_day5="template_ombo3rr" \
  emailjs.template_day7="template_s8kfh7x" \
  emailjs.template_day30="template_y1ovm08"

echo ""
echo "✅ Configuration complete!"
echo ""

# Show config
echo "📋 Current configuration:"
firebase functions:config:get
echo ""

echo "✨ Ready to deploy!"
echo "Run: firebase deploy --only functions"
echo ""
