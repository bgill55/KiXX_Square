# 🚀 DEPLOYMENT GUIDE - NETLIFY SETUP

## ✅ WHAT'S READY

Your KiXX Square website now has:
- ✅ Stripe checkout integration (frontend)
- ✅ Netlify serverless function (backend)
- ✅ Success page after purchase
- ✅ Loading states and error handling
- ✅ Configuration files ready

---

## 📋 PREREQUISITES

Before deploying, you need:

1. **Stripe Account** with API keys
2. **Netlify Account** (free) - https://netlify.com
3. **Node.js installed** (to install dependencies locally for testing)

---

## 🔧 STEP-BY-STEP DEPLOYMENT

### STEP 1: Install Dependencies

Open Command Prompt in your KiXX_new folder and run:

```bash
npm install
```

This installs the Stripe package needed by the serverless function.

---

### STEP 2: Get Your Stripe Keys

1. Log into Stripe Dashboard: https://dashboard.stripe.com
2. Go to: **Developers → API Keys**
3. Copy your **Publishable key** (starts with `pk_test_...`)
4. Copy your **Secret key** (starts with `sk_test_...`)

⚠️ **IMPORTANT**: Keep your Secret key private! Never commit it to Git!

---

### STEP 3: Update Your Frontend with Publishable Key

Open `script.js` and find this line (around line 173):

```javascript
const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE');
```

Replace `pk_test_YOUR_PUBLISHABLE_KEY_HERE` with your actual Stripe publishable key.

**Example:**
```javascript
const stripe = Stripe('pk_test_51Abc123xyz...');
```

---

### STEP 4: Create Netlify Account

1. Go to: https://app.netlify.com/signup
2. Sign up with GitHub, GitLab, Bitbucket, or Email
3. Verify your email

---

### STEP 5: Deploy Your Site

**METHOD A: Drag & Drop (Easiest)**

1. In Netlify, click **"Add new site" → "Deploy manually"**
2. Drag your entire `KiXX_new` folder into the upload area
3. Wait for deployment (usually 30-60 seconds)
4. Your site is live! 🎉

**METHOD B: Connect to Git Repository (Recommended for updates)**

1. Push your code to GitHub/GitLab
2. In Netlify, click **"Add new site" → "Import an existing project"**
3. Connect your repository
4. Netlify auto-deploys on every push!

---

### STEP 6: Add Environment Variables

**CRITICAL STEP - Your checkout won't work without this!**

1. In Netlify Dashboard, go to your site
2. Click **"Site configuration" → "Environment variables"**
3. Add these variables:

| Variable Name | Value |
|--------------|-------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key (sk_test_...) |
| `URL` | Your Netlify site URL (e.g., https://kixx-square.netlify.app) |

4. Click **Save**
5. **Trigger a new deploy** for changes to take effect:
   - Go to **Deploys** tab
   - Click **"Trigger deploy" → "Deploy site"**

---

### STEP 7: Test Your Checkout

1. Visit your live site
2. Add KiXX Square to cart
3. Go to cart and click "Proceed to Checkout"
4. You'll be redirected to Stripe's checkout page

**Test Card Numbers (only work in test mode):**

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | ✅ Successful payment |
| `4000 0000 0000 9995` | ❌ Card declined |
| `4000 0025 0000 3155` | ⚠️ Requires authentication |

- Use any future expiration date (e.g., 12/25)
- Use any 3-digit CVC
- Use any ZIP code

---

## 🎯 WHAT HAPPENS DURING CHECKOUT

1. User clicks "Proceed to Checkout"
2. Your frontend JavaScript sends cart data to Netlify Function
3. Netlify Function creates a Stripe Checkout Session
4. User is redirected to Stripe's secure payment page
5. User enters card details on Stripe (not your site!)
6. After payment, Stripe redirects to your success.html
7. Cart is cleared automatically

---

## 🔍 TROUBLESHOOTING

### "Failed to create checkout session"

**Check:**
- ✅ Did you add environment variables in Netlify?
- ✅ Did you trigger a new deploy after adding them?
- ✅ Is your Stripe Secret Key correct?
- ✅ Did you run `npm install` before deploying?

### "Stripe is not defined"

**Check:**
- ✅ Is Stripe.js loaded in cart.html?
- ✅ Did you replace the publishable key in script.js?

### "Cannot read property 'redirectToCheckout'"

**Check:**
- ✅ Did you replace `pk_test_YOUR_PUBLISHABLE_KEY_HERE` with your real key?

---

## 🎬 NEXT STEPS AFTER DEPLOYMENT

### 1. Set Up Webhooks (for order confirmations)

Webhooks tell your site when payments succeed:

1. In Stripe Dashboard: **Developers → Webhooks**
2. Click **"Add endpoint"**
3. Endpoint URL: `https://your-site.netlify.app/.netlify/functions/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add it as environment variable: `STRIPE_WEBHOOK_SECRET`

(I can create the webhook function for you - just ask!)

---

### 2. Switch to Live Mode

**When ready to accept real payments:**

1. Complete Stripe activation (business verification)
2. Get your LIVE API keys (pk_live_... and sk_live_...)
3. Replace test keys with live keys in:
   - script.js (publishable key)
   - Netlify environment variables (secret key)
4. Test with a real small transaction

---

### 3. Enable Email Notifications

**Options:**
- **Stripe emails**: Automatically sent by Stripe
- **Custom emails**: Use SendGrid, Mailgun, or AWS SES
- **Netlify forms**: For contact form (I can set this up too!)

---

## 💰 COSTS

| Service | Cost |
|---------|------|
| Netlify Hosting | **FREE** (up to 100GB bandwidth/month) |
| Netlify Functions | **FREE** (125k requests/month) |
| Stripe | 2.9% + $0.30 per transaction |
| Domain (optional) | ~$12/year |

---

## 📝 BEFORE GOING LIVE CHECKLIST

- [ ] Test checkout with test card
- [ ] Test on mobile devices
- [ ] Add real product images
- [ ] Create Privacy Policy page
- [ ] Create Terms & Conditions page
- [ ] Create Shipping Policy page
- [ ] Create Return/Refund Policy page
- [ ] Set up Google Analytics
- [ ] Test email notifications
- [ ] Switch to live Stripe keys
- [ ] Do a real test purchase
- [ ] Connect custom domain
- [ ] Add SSL (Netlify does this automatically!)

---

## 🆘 NEED HELP?

**Common Issues:**

1. **Checkout not working**: Check environment variables
2. **Can't find site**: Make sure deployment succeeded
3. **Stripe errors**: Check your API keys
4. **Function timeout**: Contact me for optimization

---

## 🎉 CONGRATULATIONS!

Once deployed, your site will be live at:
`https://your-site-name.netlify.app`

You can then:
- Connect a custom domain (kixxsquare.com)
- Start accepting pre-orders
- Test the full checkout flow

---

**Questions or stuck? Let me know and I'll help you troubleshoot!**