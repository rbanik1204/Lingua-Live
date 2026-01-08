# Payment Verification System Guide

## Overview
The platform now has a complete payment verification workflow where students upload payment proof, teachers review and approve/reject, and lessons unlock automatically upon approval.

## How It Works

### For Students

1. **Initiate Payment**
   - Navigate to Pronunciation Practice
   - Click "Unlock Lesson X" button on any premium lesson (5-20) or AI Bot
   - Select payment method (PayPal, PhonePe, Google Pay)

2. **Upload Payment Proof**
   - Make payment to the instructor using selected method
   - Take a screenshot or photo of the payment confirmation
   - Upload the proof image in the modal
   - Add optional notes about the payment
   - Submit

3. **Wait for Verification**
   - Modal shows "Awaiting Verification" status
   - Payment goes to pending queue
   - Wait for teacher to review and approve
   - Lesson will auto-unlock once approved (works across all devices)

### For Teachers/Admins

1. **Access Payment Admin**
   - Login as teacher/admin
   - Navigate to Teacher Dashboard
   - Scroll to "Payment Verifications" section

2. **Review Pending Payments**
   - See all pending payment submissions
   - View student name, lesson/feature purchased, amount
   - Click "View Proof" to see the uploaded payment screenshot

3. **Approve or Reject**
   - **Approve**: Click "Approve" → Add optional notes → Confirm
     - Updates payment status to 'approved'
     - Adds lesson to user's purchased lessons in Firebase
     - Student's app receives real-time update and unlocks lesson
   - **Reject**: Click "Reject" → Add reason → Confirm
     - Updates payment status to 'rejected'
     - Student can see rejection and resubmit if needed

## Technical Architecture

### Collections
- **payments**: Stores all payment records
  ```typescript
  {
    id: string;
    userId: string;
    type: 'lesson' | 'aiBotAccess' | 'bulkPremium';
    lessonId?: number;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    proofUrl: string; // Firebase Storage URL
    notes?: string;
    reviewedBy?: string;
    reviewedAt?: Timestamp;
    createdAt: Timestamp;
  }
  ```

- **userPurchases**: Source of truth for user access
  ```typescript
  {
    userId: string;
    purchasedLessons: number[];
    hasAIBotAccess: boolean;
    hasBulkPremium: boolean;
  }
  ```

### Storage
- Payment proofs stored at: `payment-proofs/{userId}/{timestamp}_{filename}`
- Accessible only by admin/teacher and the user who uploaded

### Real-Time Sync
- Students subscribe to their `userPurchases` document
- When teacher approves payment, `userPurchases` updates
- Student app receives update instantly → Lesson unlocks
- Works across all devices (no localStorage)

### Security Rules
- Students can:
  - Create payment records (status must be 'pending')
  - Read their own payments
- Teachers can:
  - Read all payments
  - Update payment status and add review notes
  - Create/update userPurchases documents
- Users can:
  - Read their own userPurchases document

## Payment Methods

Current payment details in the system:
- **PayPal**: payments@nandini.com
- **PhonePe**: +91-XXXXXXXXXX
- **Google Pay**: +91-XXXXXXXXXX

## Pricing
- Lessons 1-4: Free
- Lessons 5-20: $2 each (individual unlock)
- AI Bot Access: $5

## Files Modified/Created

### New Files
1. `src/lib/payments.ts` - Payment workflow functions
2. `src/components/PaymentAdmin.tsx` - Teacher verification UI

### Modified Files
1. `src/components/PremiumPaymentModal.tsx` - Real payment submission
2. `src/components/PronunciationPractice.tsx` - Firebase subscription for purchases
3. `src/components/TeacherDashboard.tsx` - Added PaymentAdmin section
4. `firestore.rules` - Security rules for payment collections

## Testing Workflow

1. **Student Side**:
   - Create student account or login
   - Go to Pronunciation Practice
   - Try to access Lesson 5 (premium)
   - Click "Unlock This Lesson ($2)"
   - Select payment method
   - Upload a test image as proof
   - Submit and see "Awaiting Verification"

2. **Teacher Side**:
   - Login as teacher/admin
   - Go to Teacher Dashboard
   - Scroll to "Payment Verifications"
   - See the pending payment
   - Click "View Proof" to see image
   - Click "Approve"
   - Add optional notes
   - Confirm approval

3. **Verification**:
   - Student app should immediately unlock the lesson
   - Student can now access lesson content
   - If student logs in on different device, lesson is already unlocked
   - Check Firebase Console to see updated `userPurchases` document

## Deployment

Deploy both hosting and rules:
```bash
firebase deploy --only hosting,firestore:rules
```

## Future Enhancements

- Email notifications when payment approved/rejected
- Automated payment gateway integration (Stripe, Razorpay)
- Payment history view for students
- Bulk approval for teachers
- Refund workflow
- Payment analytics dashboard
