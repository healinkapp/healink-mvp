# Manual Firebase Config Setup

**Use this if `config-quick.sh` script fails**

---

## Method 1: Single Command (Recommended)

Copy and paste this entire block:

```bash
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
```

---

## Method 2: Individual Commands

If the single command fails, run each one separately:

```bash
firebase functions:config:set emailjs.service_id="service_1tcang2"
firebase functions:config:set emailjs.public_key="kGc9NLe3dC-X0KMBL"
firebase functions:config:set emailjs.private_key="LJT3w2cFG0-5dSuMI"
firebase functions:config:set emailjs.template_day0="template_1tcang2"
firebase functions:config:set emailjs.template_day1="template_d75273a"
firebase functions:config:set emailjs.template_day3="template_xtdi2sx"
firebase functions:config:set emailjs.template_day5="template_ombo3rr"
firebase functions:config:set emailjs.template_day7="template_s8kfh7x"
firebase functions:config:set emailjs.template_day30="template_y1ovm08"
```

---

## Verify Configuration

After setting config, verify it was saved correctly:

```bash
firebase functions:config:get
```

**Expected Output:**
```json
{
  "emailjs": {
    "service_id": "service_1tcang2",
    "public_key": "kGc9NLe3dC-X0KMBL",
    "private_key": "LJT3w2cFG0-5dSuMI",
    "template_day0": "template_1tcang2",
    "template_day1": "template_d75273a",
    "template_day3": "template_xtdi2sx",
    "template_day5": "template_ombo3rr",
    "template_day7": "template_s8kfh7x",
    "template_day30": "template_y1ovm08"
  }
}
```

---

## Troubleshooting

### Error: "Not logged in"
```bash
firebase login
firebase projects:list  # Should show healink-mvp-27eff
```

### Error: "Permission denied"
Check that you're in the correct project:
```bash
firebase use healink-mvp-27eff
```

### Error: "Invalid config value"
Make sure to include quotes around values:
```bash
# CORRECT
firebase functions:config:set emailjs.service_id="service_1tcang2"

# WRONG
firebase functions:config:set emailjs.service_id=service_1tcang2
```

---

## Next Steps

Once configuration is verified:

1. **Deploy functions:**
   ```bash
   firebase deploy --only functions
   ```

2. **Verify deployment:**
   ```bash
   firebase functions:list
   ```

3. **Check logs:**
   ```bash
   firebase functions:log --only dailyAftercare
   ```

---

## Configuration Reference

| Variable | Value | Purpose |
|----------|-------|---------|
| `service_id` | `service_1tcang2` | EmailJS service ID |
| `public_key` | `kGc9NLe3dC-X0KMBL` | EmailJS public key |
| `private_key` | `LJT3w2cFG0-5dSuMI` | EmailJS private key (server-side only) |
| `template_day0` | `template_1tcang2` | Welcome email template |
| `template_day1` | `template_d75273a` | Day 1 aftercare email |
| `template_day3` | `template_xtdi2sx` | Day 3 aftercare email |
| `template_day5` | `template_ombo3rr` | Day 5 aftercare email |
| `template_day7` | `template_s8kfh7x` | Day 7 aftercare email |
| `template_day30` | `template_y1ovm08` | Day 30 completion email |

**Total:** 9 variables (8 EmailJS + 1 Day 0 template)
