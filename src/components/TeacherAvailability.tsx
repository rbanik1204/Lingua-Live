import { useState, useEffect } from 'react';
import { Calendar, Clock, X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  blockTimeSlot,
  unblockTimeSlot,
  subscribeTeacherBlockedSlots,
  type BlockedSlot,
} from '../lib/teacherAvailability';

export function TeacherAvailability() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [isBlocking, setIsBlocking] = useState(false);

  // Subscribe to teacher's blocked slots
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeTeacherBlockedSlots(
      user.uid,
      (slots) => setBlockedSlots(slots),
      (err) => console.error('Error loading blocked slots:', err)
    );

    return () => unsubscribe();
  }, [user]);

  // Generate time slots for selection
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 6; hour < 22; hour++) {
      ['00', '30'].forEach((min) => {
        const time = `${hour.toString().padStart(2, '0')}:${min}`;
        slots.push(time);
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get blocked slots for the selected date
  const blockedSlotsForDate = selectedDate
    ? blockedSlots.filter((slot) => slot.date === selectedDate.toISOString().split('T')[0])
    : [];

  const handleBlockSlot = async () => {
    if (!user || !selectedDate || !selectedTime) return;

    try {
      setIsBlocking(true);
      await blockTimeSlot({
        teacherId: user.uid,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        duration: 25, // Fixed 25-minute slots
        reason,
      });
      setSelectedTime(null);
      setReason('');
    } catch (error) {
      console.error('Error blocking slot:', error);
      alert('Failed to block slot. Please try again.');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockSlot = async (blockId: string) => {
    if (!window.confirm('Are you sure you want to unblock this time slot?')) return;

    try {
      await unblockTimeSlot(blockId);
    } catch (error) {
      console.error('Error unblocking slot:', error);
      alert('Failed to unblock slot. Please try again.');
    }
  };

  // Generate next 60 days for date selection
  const generateDateOptions = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dateOptions = generateDateOptions();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Block Time Slots</h2>
        <p className="text-sm text-slate-600 mt-1">
          Block time slots when you're unavailable so students can't book them
        </p>
      </div>

      {/* Date Selection */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Select Date
        </label>
        <div className="grid grid-cols-7 gap-2">
          {dateOptions.slice(0, 14).map((date) => {
            const isSelected =
              selectedDate && date.toDateString() === selectedDate.toDateString();
            const dateStr = date.toISOString().split('T')[0];
            const hasBlockedSlots = blockedSlots.some((slot) => slot.date === dateStr);

            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary text-white'
                    : hasBlockedSlots
                    ? 'border-amber-200 bg-amber-50 hover:border-primary'
                    : 'border-slate-200 hover:border-primary'
                }`}
              >
                <div className="text-xs font-semibold">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold">{date.getDate()}</div>
                <div className="text-[10px] opacity-75">
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Selection & Blocking */}
      {selectedDate && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Select Time to Block
          </label>

          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-4">
            {timeSlots.map((time) => {
              const isBlocked = blockedSlotsForDate.some((slot) => slot.time === time);
              const isSelected = selectedTime === time;

              return (
                <button
                  key={time}
                  onClick={() => !isBlocked && setSelectedTime(time)}
                  disabled={isBlocked}
                  className={`p-3 rounded-xl border-2 transition-all text-sm ${
                    isBlocked
                      ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed'
                      : isSelected
                      ? 'border-primary bg-primary text-white'
                      : 'border-slate-200 hover:border-primary'
                  }`}
                >
                  {time}
                  {isBlocked && <div className="text-[10px] mt-0.5">Blocked</div>}
                </button>
              );
            })}
          </div>

          {selectedTime && (
            <div className="space-y-3">
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (optional)"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none"
              />

              <button
                onClick={handleBlockSlot}
                disabled={isBlocking}
                className="w-full px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {isBlocking ? 'Blocking...' : 'Block This Time Slot'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* List of Blocked Slots */}
      {blockedSlots.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Your Blocked Time Slots</h3>
          <div className="space-y-3">
            {blockedSlots
              .sort((a, b) => {
                const dateCompare = a.date.localeCompare(b.date);
                if (dateCompare !== 0) return dateCompare;
                return a.time.localeCompare(b.time);
              })
              .map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-200"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Calendar className="w-4 h-4" />
                        {new Date(slot.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Clock className="w-4 h-4" />
                        {slot.time}
                      </div>
                    </div>
                    {slot.reason && (
                      <div className="text-xs text-slate-600 mt-1">{slot.reason}</div>
                    )}
                  </div>

                  <button
                    onClick={() => handleUnblockSlot(slot.id)}
                    className="px-4 py-2 rounded-xl bg-white border border-red-300 text-red-700 hover:bg-red-100 flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Unblock
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
