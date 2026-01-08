# Payment Setup Guide

## 🔒 Secure Payment Integration

Your booking system now includes payment verification with proof upload. Students must upload payment screenshots before booking confirmation.

---

## 📋 Required Information from Client

Please provide the following details to complete the payment integration:

### 1. **PayPal** (International Payments)
- [ ] **PayPal Email Address**: _________________________
- [ ] **PayPal.me Link** (e.g., `paypal.me/yourname`): _________________________
- [ ] OR **PayPal Client ID** (for API integration): _________________________

**Test it:** Send yourself $1 to confirm the email/link works

---

### 2. **UPI Payment** (India Only)
- [ ] **UPI ID**: Currently set to `nandini@paytm` - is this correct? ✅/❌
- [ ] **Phone Number** linked to UPI: _________________________
- [ ] **Generate UPI QR Code**:
  1. Open PhonePe/GPay/Paytm
  2. Go to "Receive Money" → "Show QR Code"
  3. Save/Screenshot the QR code
  4. **Upload to:** `public/assets/upi-qr-code.png`

**Test it:** Have someone send ₹1 to verify

---

### 3. **MoneyGram** (International Wire Transfer)
- [ ] **Full Name** (as per ID): _________________________
- [ ] **Country**: _________________________
- [ ] **City/Location**: _________________________
- [ ] **Phone Number**: _________________________
- [ ] **MoneyGram Reference Number** (if business account): _________________________

---

## 🎯 How the Payment Flow Works

1. **Student selects** class duration (25 or 50 mins)
2. **Student picks** date & time from available slots
3. **Student enters** name and email
4. **Student chooses** payment method (PayPal/UPI/MoneyGram)
5. **Student sees** payment instructions with QR code/link
6. **Student makes payment** through their chosen method
7. **Student uploads** payment screenshot/receipt
8. **System validates** file (image only, max 5MB)
9. **Booking submitted** - awaiting verification
10. **Admin reviews** payment proof (manual verification)
11. **Email confirmation** sent with Zoom link

---

## 🔧 Setup Steps

### Step 1: Update Payment Details
Edit `src/components/BookingModal.tsx` around line 20:

```typescript
const PAYMENT_CONFIG = {
  paypal: {
    email: 'YOUR_PAYPAL_EMAIL@example.com',
    link: 'https://paypal.me/YOURNAME'
  },
  upi: {
    id: 'YOURNAME@paytm', // or @phonepe, @gpay
    qrCode: '/assets/upi-qr-code.png'
  },
  moneygram: {
    name: 'YOUR FULL NAME',
    location: 'City, Country'
  }
};
```

### Step 2: Upload UPI QR Code
1. Generate QR code from your UPI app
2. Save as `public/assets/upi-qr-code.png`
3. Recommended size: 500x500px minimum

### Step 3: Test All Payment Methods
- Send test payments to each method
- Verify amounts are received correctly
- Upload test screenshots to ensure file upload works

---

## 🛡️ Security Features

✅ **File Validation**
- Only image files accepted
- Maximum 5MB file size
- Preview before upload

✅ **Required Fields**
- Name and email mandatory
- Payment proof required
- Cannot skip verification

✅ **Manual Verification**
- All payments reviewed by admin
- 24-hour verification window
- Email confirmation only after approval

✅ **Booking Reference**
- Unique reference number generated
- Easy to track and verify

---

## 📧 Email Notifications (To Implement)

After payment verification, the system should send:

### To Student:
```
Subject: Class Booking Confirmed - [Date & Time]

Hi [Student Name],

Your payment has been verified! ✅

Class Details:
- Date: [Date]
- Time: [Time]
- Duration: [25/50] minutes
- Booking Reference: #[Reference]

Zoom Link: [Link will be sent 1 hour before class]

See you in class!
Teacher Nandini
```

### To Teacher:
```
Subject: New Booking - [Student Name]

New class booked:
- Student: [Name] ([Email])
- Date/Time: [Date] at [Time]
- Duration: [Duration]
- Payment: [Method] - $[Amount]
- Reference: #[Reference]

Payment proof attached.
```

---

## 🚀 Going Live Checklist

- [ ] Update all payment details in code
- [ ] Upload UPI QR code image
- [ ] Test PayPal link
- [ ] Test UPI payment with ₹1
- [ ] Verify MoneyGram details
- [ ] Set up Firebase Storage for payment proofs
- [ ] Configure Firestore for booking records
- [ ] Set up email notifications (optional)
- [ ] Deploy to Firebase Hosting
- [ ] Test full booking flow end-to-end

---

## 💡 Future Enhancements

1. **Firebase Storage Integration** - Store payment proofs securely
2. **Firestore Database** - Save all booking details
3. **Admin Dashboard** - Review pending bookings, approve/reject payments
4. **Automated Email** - Send confirmations and Zoom links automatically
5. **Payment Webhooks** - Auto-verify PayPal payments via API
6. **Razorpay/Stripe** - Full payment gateway integration

---

## 📞 Support

If you need help setting up:
1. Provide all payment details listed above
2. Upload UPI QR code to `public/assets/` folder
3. Test each payment method before going live

**Current Status:**
- ✅ Payment UI complete
- ✅ File upload working
- ✅ Validation & security implemented
- ⏳ Awaiting client payment details
- ⏳ Need to upload real UPI QR code
- ⏳ Need Firebase Storage/Firestore setup for production
