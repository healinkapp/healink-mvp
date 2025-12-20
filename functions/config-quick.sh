#!/bin/bash

# HEALINK MVP - Quick Firebase Functions Config
# Sets production EmailJS credentials for automated emails

echo "� Setting Firebase Functions Configuration..."
echo ""

# EmailJS Configuration (9 variables)
firebase functions:config:set \
  emailjs.service_id="service_1tcang2" \
  emailjs.public_key="kGc9NLe3dC-X0KMBL" \
  emailjs.private_key="LJT3w2cFG0-5dSuMI" \
  emailjs.template_day0="template_1tcang2" \
  emailjs.template_day1="template_d75273a" \
  emailjs.template_day3="template_xtdi2sx" \
  emailjs.template_day5="template_ombo3rr" \
  emailjs.template_day7="template_s8kfh7x" \
  emailjs.template_day30="template_y1ovm08"

echo ""
echo "✅ Config set! Verifying..."
echo ""

# Show config
echo "📋 Current configuration:"
firebase functions:config:get
echo ""

echo "🎉 Ready to deploy!"
echo "Next command: firebase deploy --only functions"
echo ""
