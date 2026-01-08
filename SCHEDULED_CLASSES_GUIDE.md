# Scheduled Classes Feature Guide

## Overview
Teachers can now manually add, manage, and track their scheduled classes directly in the Teacher Dashboard. This replaces the previous static "This Week" section with a dynamic, interactive class management system.

## Features

### For Teachers

#### 1. **View This Week's Classes**
- See all classes scheduled for the current week (next 7 days)
- Visual distinction between scheduled and completed classes
- Shows student name, date, time, and topic
- Empty state when no classes are scheduled

#### 2. **Add Scheduled Classes**
Click the **+** button to add a new class with:
- **Student Name*** (required)
- **Student Email** (optional)
- **Date*** (required)
- **Time*** (required)
- **Duration** (default: 60 minutes)
- **Topic** (optional)
- **Notes** (optional)

#### 3. **Manage Classes**
Each scheduled class card shows:
- ✅ **Mark as Completed** - Mark when class is done
- ❌ **Delete** - Remove the scheduled class

#### 4. **Visual Status**
- **Blue card** = Scheduled (upcoming)
- **Green card** = Completed
- Completed classes show with checkmark

## How to Use

### Add a New Class

1. **Navigate to Teacher Dashboard**
2. **Find "This Week's Classes" section** (right column, top)
3. **Click the + button** next to the calendar icon
4. **Fill in the form**:
   - Student Name (required)
   - Student Email (optional, for your reference)
   - Select Date
   - Select Time
   - Add Topic if desired (e.g., "Lesson 5 - Pronunciation")
5. **Click "Add Class"**
6. Class appears in the list instantly

### Mark Class as Completed

1. **Find the class** in the list
2. **Click the green checkmark icon** (✓)
3. Class card turns green showing it's completed
4. Completed classes remain visible for tracking

### Delete a Class

1. **Find the class** in the list
2. **Click the red X icon**
3. **Confirm deletion**
4. Class is removed permanently

## Technical Details

### Firestore Collection: `scheduledClasses`

```typescript
{
  id: string;
  teacherId: string;
  studentName: string;
  studentEmail: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM" (24-hour format)
  duration: number; // minutes
  topic?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### Real-Time Updates
- Uses Firestore subscriptions
- Changes sync instantly
- No page refresh needed

### Security Rules
- Only teachers can create/read/update/delete their own scheduled classes
- Students cannot access this collection
- Teachers can only see their own classes

## Files Added/Modified

### New Files
1. `src/lib/scheduledClasses.ts` - CRUD operations and helpers
   - `createScheduledClass()` - Add new class
   - `updateScheduledClass()` - Update class details
   - `deleteScheduledClass()` - Remove class
   - `subscribeTeacherScheduledClasses()` - Real-time subscription
   - `getThisWeekClasses()` - Filter for current week

### Modified Files
1. `src/components/TeacherDashboard.tsx`
   - Removed static "This Week" section
   - Added dynamic scheduled classes UI
   - Added "Add Class" form
   - Added class management handlers

2. `firestore.rules`
   - Added security rules for `scheduledClasses` collection

3. `firestore.indexes.json`
   - Added composite index for efficient queries

## Benefits

### Before (Static)
- ❌ Showed fake data (18 classes, 3/day avg)
- ❌ No way to track actual classes
- ❌ Manual counting required
- ❌ No integration with schedule

### After (Dynamic)
- ✅ Shows real scheduled classes
- ✅ Easy to add/manage classes
- ✅ Automatic weekly filtering
- ✅ Track completion status
- ✅ Real-time updates
- ✅ Integrated with teacher workflow

## Use Cases

### 1. Regular Student Classes
```
Student Name: Priya Sharma
Date: 2026-01-10
Time: 14:00
Topic: Lesson 8 - Advanced Pronunciation
```

### 2. Trial Sessions
```
Student Name: Rahul Kumar
Date: 2026-01-11
Time: 10:00
Topic: Trial Session - Level Assessment
```

### 3. Makeup Classes
```
Student Name: Anita Patel
Date: 2026-01-12
Time: 16:30
Topic: Makeup for Jan 5 class
Notes: Reschedule due to student emergency
```

## Future Enhancements

Potential additions:
- Email reminders to students
- Recurring classes support
- Calendar export (iCal)
- Student dashboard view of their scheduled classes
- Payment tracking per class
- Attendance tracking
- Class notes/feedback
- Integration with Zoom meetings

## Testing

### Test Adding a Class
1. Login as teacher
2. Go to Teacher Dashboard
3. Click + button in "This Week's Classes"
4. Fill form with:
   - Student Name: Test Student
   - Date: Tomorrow's date
   - Time: 10:00
5. Click "Add Class"
6. Verify class appears in list

### Test Completing a Class
1. Find a scheduled class
2. Click checkmark icon
3. Verify card turns green
4. Verify status shows as completed

### Test Deleting a Class
1. Find a scheduled class
2. Click X icon
3. Confirm deletion
4. Verify class disappears from list

## Deployment

Deploy both hosting and Firestore rules:
```bash
npm run build
firebase deploy --only hosting,firestore:rules,firestore:indexes
```

## Support

### Common Issues

**Q: Classes not showing up?**
A: Make sure you're logged in as a teacher and have added classes for this week.

**Q: Can't add a class?**
A: Ensure Student Name, Date, and Time are all filled in (required fields).

**Q: Old completed classes showing?**
A: Completed classes within this week remain visible. They'll automatically disappear after the week ends.

**Q: How far in advance can I schedule?**
A: You can schedule classes for any future date. Only classes within the next 7 days show in "This Week's Classes" section.

---

**Version**: 1.0  
**Last Updated**: January 4, 2026  
**Status**: ✅ Production Ready
