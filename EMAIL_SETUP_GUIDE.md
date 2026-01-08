# Email Notification Setup Guide

## 📧 Automatic Email Notifications

When a student books a class, an automatic email will be sent to **lingualive.nandini@gmail.com** with all booking details.

---

## 🚀 Setup Required (EmailJS)

### Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Sign up for a **FREE account** (up to 200 emails/month)
3. Verify your email address

### Step 2: Add Email Service
1. Click **"Add New Service"**
2. Choose **Gmail** (recommended)
3. Click **"Connect Account"** and authorize with `lingualive.nandini@gmail.com`
4. Copy the **Service ID** (e.g., `service_xyz123`)

### Step 3: Create Email Template
1. Go to **"Email Templates"**
2. Click **"Create New Template"**
3. Name it: `booking_notification`
4. Use this template:

```
Subject: New Booking - {{student_name}} (Ref: #{{booking_ref}})

From: LinguaLive Booking System <noreply@lingualive.com>
To: lingualive.nandini@gmail.com

━━━━━━━━━━━━━━━━━━━━━━━━
NEW CLASS BOOKING RECEIVED
━━━━━━━━━━━━━━━━━━━━━━━━

📋 BOOKING DETAILS:
• Booking Reference: #{{booking_ref}}
• Date: {{booking_date}}
• Time: {{booking_time}} IST
• Duration: {{duration}} minutes
• Amount: ${{amount}} USD

👤 STUDENT INFORMATION:
• Name: {{student_name}}
• Email: {{student_email}}

💳 PAYMENT DETAILS:
• Method: {{payment_method}}
• Status: Awaiting Verification

📸 PAYMENT PROOF:
View Screenshot: {{payment_proof_url}}
(Click the link above to view the payment proof image)

⚠️ NEXT STEPS:
1. Click the payment proof link above to view screenshot
2. Verify the payment in your {{payment_method}} account
3. Send Zoom link to: {{student_email}}
4. Confirm the booking with the student

━━━━━━━━━━━━━━━━━━━━━━━━
Reply to this email will go to the student: {{student_email}}

This is an automated notification from LinguaLive.
```

5. Save the template
6. Copy the **Template ID** (e.g., `template_abc456`)

### Step 4: Get Public Key
1. Go to **"Account"** → **"General"**
2. Find **"Public Key"** (e.g., `xyzABC123_DEF456`)
3. Copy it

### Step 5: Update Code
Open `src/components/BookingModal.tsx` and replace these lines (around line 107):

```typescript
const EMAILJS_SERVICE_ID = 'service_wyfddhr'; // ← Paste your Service ID
const EMAILJS_TEMPLATE_ID = 'template_in9utnq'; // ← Paste your Template ID
const EMAILJS_PUBLIC_KEY = '4h15AGBuWd2E0GcU6'; // ← Paste your Public Key
```

### Step 6: Install EmailJS
Run this command in your project terminal:
```bash
npm install emailjs-com
```

### Step 7: Uncomment Email Code
In `BookingModal.tsx`, find this section (around line 120) and **uncomment it**:

```typescript
// Uncomment after EmailJS setup:
/*
const emailjs = (await import('emailjs-com')).default;
await emailjs.send(
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  emailData,
  EMAILJS_PUBLIC_KEY
);
*/
```

Remove the `/*` and `*/` to activate it.

### Step 8: Build & Deploy
```bash
npm run build
npx firebase deploy --only hosting
```

---

## ✅ What the Email Will Include

**Sent to:** lingualive.nandini@gmail.com

**Contains:**
- 📋 Booking reference number
- 📅 Date and time of class
- ⏱️ Duration (25 or 50 mins)
- 💰 Amount paid
- 👤 Student name and email
- 💳 Payment method used
- 📸 Note that payment proof was uploaded

---

## 🧪 Testing

1. After setup, book a test class
2. Check `lingualive.nandini@gmail.com` inbox
3. Email should arrive within 1-2 minutes
4. Verify all details are correct

---

## 🆓 Free Tier Limits

EmailJS Free Plan:
- ✅ 200 emails per month
- ✅ Unlimited templates
- ✅ Gmail integration
- ✅ No credit card required

If you need more emails:
- **Personal Plan:** $15/month (1,000 emails)
- **Professional Plan:** $25/month (5,000 emails)

---

## 🔒 Security Notes

- EmailJS Public Key is safe to use in frontend code
- Only your pre-defined templates can be sent
- Prevents spam and abuse
- Rate limited to prevent misuse

---

## 🛠️ Alternative: Firebase Functions (Advanced)

For a more robust solution, you can use Firebase Cloud Functions with SendGrid/Nodemailer:

**Pros:**
- Server-side (more secure)
- Can attach payment proof images
- Better for high volume
- Full email customization

**Cons:**
- Requires Firebase Blaze plan (pay-as-you-go)
- More complex setup
- Need backend coding

Let me know if you want to implement this instead!

---

## 📞 Need Help?

If you encounter any issues:
1. Check EmailJS dashboard for errors
2. Verify Service ID, Template ID, and Public Key
3. Check browser console for error messages
4. Ensure Gmail account is properly connected

---

## 📝 Summary Checklist

- [ ] Create EmailJS account
- [ ] Connect Gmail (lingualive.nandini@gmail.com)
- [ ] Create email template
- [ ] Copy Service ID, Template ID, Public Key
- [ ] Update BookingModal.tsx with IDs
- [ ] Install `emailjs-com` package
- [ ] Uncomment email sending code
- [ ] Build and deploy
- [ ] Test with a booking
- [ ] Verify email received

Once complete, you'll automatically receive an email for every booking! 📧✨
