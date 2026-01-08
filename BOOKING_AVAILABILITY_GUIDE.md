# Teacher Availability & Booking Management Guide

## Overview
The platform now has a complete booking system where:
1. **Students can book time slots** and pay for classes
2. **Booked slots automatically become unavailable** for other students
3. **Teachers can block time slots** when they're unavailable
4. **All unavailable slots (booked + blocked) are shown** to students during booking

## How It Works

### For Students

#### Booking a Class

1. **Navigate to Booking**
   - Click "Book a Class" or "Schedule Trial Session"
   - Opens booking modal

2. **Select Date & Time**
   - Choose a date from the calendar
   - Available time slots are shown in three categories:
     - ☀️ **Morning** (6:00 AM - 12:00 PM)
     - 🌤️ **Afternoon** (12:00 PM - 6:00 PM)
     - 🌙 **Evening** (6:00 PM - 10:00 PM)

3. **Slot Indicators**
   - **Green/White borders**: Available slots you can book
   - **Red background with "Booked"**: Already booked by another student
   - **Gray background with "Unavailable"**: Blocked by teacher
   - **Hover tooltips**: 
     - "Already booked by another student" (red slots)
     - "Teacher unavailable" (gray slots)

4. **Complete Payment**
   - Select payment method (PayPal, PhonePe, Google Pay)
   - Upload payment proof screenshot
   - Submit booking
   - Wait for teacher confirmation

5. **Booking Status**
   - **Pending**: Submitted, awaiting teacher approval
   - **Confirmed**: Teacher approved, class is scheduled
   - **Rejected**: Teacher declined (you can book another slot)

### For Teachers

#### Managing Availability

1. **Access Availability Manager**
   - Login as teacher
   - Navigate to Teacher Dashboard
   - Scroll to "Block Time Slots" section

2. **Block Time Slots**
   - **Select Date**: Choose from next 60 days
     - Dates with already-blocked slots show amber/yellow indicator
   - **Select Time**: Click on time slot you want to block
     - Red slots are already blocked
     - White/green slots are available to block
   - **Add Reason** (optional): e.g., "Personal appointment", "Holiday"
   - **Click "Block This Time Slot"**
   - Slot is immediately blocked and students can't book it

3. **View Blocked Slots**
   - See all your blocked slots in chronological order
   - Each entry shows:
     - Date and time
     - Reason (if provided)
     - **Unblock** button

4. **Unblock Time Slots**
   - Click "Unblock" button on any blocked slot
   - Confirm the action
   - Slot becomes immediately available for students to book

#### Reviewing Bookings

1. **Access Bookings**
   - Teacher Dashboard → Bookings section
   - See all pending, confirmed, and rejected bookings

2. **Confirm or Reject**
   - Review payment proof
   - Confirm: Class is scheduled
   - Reject: Student can book another slot

## Technical Architecture

### Collections

#### blockedSlots
Stores teacher's unavailable time slots:
```typescript
{
  id: string;
  teacherId: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM" (e.g., "14:30")
  duration: number; // minutes (default 25)
  reason?: string;
  createdAt: Timestamp;
}
```

#### bookings
Stores student booking requests:
```typescript
{
  id: string;
  studentName: string;
  studentEmail: string;
  studentUid?: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  duration: number; // minutes
  paymentMethod: "paypal" | "upi" | "phonepe" | "gpay";
  paymentProofUrl: string; // Firebase Storage URL
  amount: number;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  bookingRef: string;
  notes?: string;
  createdAt: Timestamp;
  confirmedAt?: Timestamp;
  rejectedAt?: Timestamp;
}
```

### Availability Logic

**When student selects a date:**
1. System queries `blockedSlots` collection for that date
2. System queries `bookings` collection for confirmed bookings on that date
3. Both are combined into an "unavailable slots" list
4. All time slots are checked against this list:
   - If in `blockedSlots` → Gray, "Teacher unavailable"
   - If in confirmed `bookings` → Red, "Already booked"
   - Otherwise → Available (green/white)

**Real-time updates:**
- When teacher blocks a slot → Students immediately see it as unavailable
- When student books and pays → Other students immediately see it as booked
- When teacher confirms booking → Slot status updates to confirmed

### Security Rules

```javascript
// blockedSlots collection
- Read: All signed-in users (to check availability)
- Create: Teachers only
- Delete: Teacher who created the block only
- Update: Not allowed

// bookings collection
- Read: All signed-in users (to check availability)
- Create: Any signed-in user (status must be 'pending')
- Update: Teachers only (to confirm/reject)
- Delete: Teachers only
```

## Files Created/Modified

### New Files
1. `src/lib/teacherAvailability.ts` - Teacher availability management functions
2. `src/components/TeacherAvailability.tsx` - UI for teacher to block/unblock slots

### Modified Files
1. `src/components/BookingModal.tsx` - Updated to show blocked + booked slots
2. `src/components/TeacherDashboard.tsx` - Added TeacherAvailability component
3. `firestore.rules` - Added security rules for `blockedSlots` collection

## Usage Examples

### Teacher Workflow
1. Teacher knows they have a personal appointment on Jan 15 at 2:00 PM
2. Opens Teacher Dashboard → Scroll to "Block Time Slots"
3. Selects Jan 15 from calendar
4. Clicks "14:00" time slot
5. Types "Personal appointment" in reason field
6. Clicks "Block This Time Slot"
7. ✅ Students can no longer book 2:00 PM on Jan 15

### Student Workflow
1. Student wants to book a class on Jan 15
2. Opens booking modal, selects Jan 15
3. Sees time slots:
   - 13:00 → Available (green border)
   - 14:00 → Unavailable (gray, blocked by teacher)
   - 15:00 → Booked (red, another student already booked)
   - 16:00 → Available (green border)
4. Student selects 13:00 or 16:00
5. Completes payment and booking
6. Other students immediately see that slot as "Booked"

## Deployment

Deploy both hosting and updated rules:
```bash
firebase deploy --only hosting,firestore:rules
```

## Testing

### Test Teacher Blocking
1. Login as teacher
2. Go to Teacher Dashboard
3. Block a few slots for tomorrow
4. Logout and login as student
5. Open booking modal
6. Verify blocked slots show as gray "Unavailable"

### Test Student Booking
1. Login as student A
2. Book a slot and complete payment (keep pending)
3. Logout and login as student B
4. Try to book same slot
5. Verify it shows as red "Booked" or unavailable

### Test Real-Time Updates
1. Open browser window A (teacher) and B (student booking modal)
2. In window A: Block a slot
3. In window B: Should immediately show as unavailable
4. In window A: Unblock the slot
5. In window B: Should immediately show as available

## Future Enhancements

- Recurring blocks (e.g., "Every Monday 2-3 PM")
- Bulk block operations (block entire day/week)
- Calendar view for teacher to see all bookings + blocks
- Notification when student books a slot
- Automatic calendar sync (Google Calendar, Outlook)
- Rescheduling workflow
- Cancellation policy
