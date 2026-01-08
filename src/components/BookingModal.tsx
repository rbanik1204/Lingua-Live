import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CreditCard, Check, Upload, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createBooking, getConfirmedBookingsForDate, type Booking } from '../lib/bookings';
import { getUnavailableSlotsForDate } from '../lib/teacherAvailability';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'datetime' | 'payment' | 'upload-proof' | 'confirmed'>('datetime');
  const [selectedDuration] = useState<25>(25); // Fixed to 25 minutes
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'upi' | 'phonepe' | 'gpay' | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set());
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Payment configuration - to be updated with real client details
  const PAYMENT_CONFIG = {
    paypal: {
      email: 'nandini.nandini01@gmail.com',
      link: 'https://paypal.me/nandini787'
    },
    upi: {
      id: 'nandini.nandini01@okicici',
      name: 'NANDINI GHOSH',
      qrCode: '/assets/images/gpay-qr.png'
    },
    phonepe: {
      id: 'PhonePe',
      name: 'NANDINI GHOSH',
      qrCode: '/assets/images/phonepe-qr.png'
    },
    gpay: {
      id: 'Google Pay',
      name: 'NANDINI GHOSH',
      upiId: 'nandini.nandini01@okicici',
      qrCode: '/assets/images/gpay-qr.png'
    }
  };

  const getPrice = () => 5; // Fixed price for trial session

  // Load booked and blocked slots when date changes
  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots(new Set());
      setBlockedSlots(new Set());
      return;
    }

    const dateStr = selectedDate.toISOString().split('T')[0];
    setLoadingSlots(true);
    
    getUnavailableSlotsForDate(dateStr)
      .then(({ bookedTimes, allUnavailableTimes, blockedSlots: blocked }) => {
        setBookedSlots(new Set(bookedTimes));
        setBlockedSlots(new Set(blocked.map(s => s.time)));
      })
      .catch((err) => {
        console.error('Error loading unavailable slots:', err);
        setBookedSlots(new Set());
        setBlockedSlots(new Set());
      })
      .finally(() => {
        setLoadingSlots(false);
      });
  }, [selectedDate]);

  const handleDateTimeConfirm = () => {
    if (selectedDate && selectedTime) {
      setStep('payment');
    }
  };

  const handlePaymentMethodSelect = (method: 'paypal' | 'upi' | 'phonepe' | 'gpay') => {
    setPaymentMethod(method);
  };

  const handleProceedToUpload = () => {
    if (paymentMethod && userEmail && userName) {
      setStep('upload-proof');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setPaymentProof(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitBooking = async () => {
    if (!paymentProof || !selectedDate || !selectedTime) {
      alert('Please complete all required fields');
      return;
    }
    
    try {
      // Generate booking reference
      const bookingRef = Date.now().toString().slice(-6);
      
      // Upload payment proof to Firebase Storage and get URL
      const paymentProofUrl = await uploadPaymentProof(paymentProof, bookingRef);
      
      // Save booking to database
      const dateStr = selectedDate.toISOString().split('T')[0];
      await createBooking({
        studentName: userName,
        studentEmail: userEmail,
        studentUid: user?.uid,
        date: dateStr,
        time: selectedTime,
        duration: selectedDuration || 25,
        paymentMethod: paymentMethod!,
        paymentProofUrl,
        amount: getPrice(),
        bookingRef,
      });
      
      // Send email notification to teacher with payment proof URL
      await sendBookingEmail({
        bookingRef,
        studentName: userName,
        studentEmail: userEmail,
        duration: selectedDuration!,
        date: selectedDate!,
        time: selectedTime!,
        paymentMethod: paymentMethod!,
        amount: getPrice(),
        paymentProofUrl,
      });
      
      setTimeout(() => {
        setStep('confirmed');
      }, 1500);
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('There was an error submitting your booking. Please try again or contact support.');
    }
  };

  // Upload payment proof to Firebase Storage
  const uploadPaymentProof = async (file: File, bookingRef: string): Promise<string> => {
    try {
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('../lib/firebase');
      
      const fileName = `payment-proofs/${bookingRef}-${Date.now()}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log('✅ Payment proof uploaded:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('❌ Failed to upload payment proof:', error);
      return 'Failed to upload - check manually';
    }
  };

  // Function to send email notification
  const sendBookingEmail = async (bookingData: {
    bookingRef: string;
    studentName: string;
    studentEmail: string;
    duration: number;
    date: Date;
    time: string;
    paymentMethod: string;
    amount: number;
    paymentProofUrl: string;
  }) => {
    const emailData = {
      to_email: 'lingualive.nandini@gmail.com',
      subject: `New Booking - ${bookingData.studentName} (Ref: #${bookingData.bookingRef})`,
      message: `
NEW CLASS BOOKING RECEIVED
━━━━━━━━━━━━━━━━━━━━━━━━

📋 BOOKING DETAILS:
Booking Reference: #${bookingData.bookingRef}
Date & Time: ${bookingData.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at ${bookingData.time} IST
Duration: ${bookingData.duration} minutes
Amount: $${bookingData.amount} USD

👤 STUDENT INFORMATION:
Name: ${bookingData.studentName}
Email: ${bookingData.studentEmail}

💳 PAYMENT DETAILS:
Method: ${bookingData.paymentMethod.toUpperCase()}
Status: Awaiting Verification

📸 PAYMENT PROOF:
View Image: ${bookingData.paymentProofUrl}

⚠️ NEXT STEPS:
1. Click the link above to view payment proof
2. Verify the payment in your ${bookingData.paymentMethod.toUpperCase()} account
3. Send Zoom or Meet link to student at: ${bookingData.studentEmail}
4. Confirm the booking with the student

━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated notification from LinguaLive Booking System
      `.trim(),
      student_name: bookingData.studentName,
      student_email: bookingData.studentEmail,
      booking_date: bookingData.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      booking_time: bookingData.time,
      duration: bookingData.duration,
      amount: bookingData.amount,
      payment_method: bookingData.paymentMethod.toUpperCase(),
      booking_ref: bookingData.bookingRef,
      payment_proof_url: bookingData.paymentProofUrl,
    };

    // Using EmailJS for client-side email sending
    const EMAILJS_SERVICE_ID = 'service_wyfddhr';
    const EMAILJS_TEMPLATE_ID = 'template_in9utnq';
    const EMAILJS_PUBLIC_KEY = '4h15AGBuWd2E0GcU6';

    try {
      const emailjs = (await import('@emailjs/browser')).default;
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        emailData,
        EMAILJS_PUBLIC_KEY
      );
      console.log('✅ Booking notification email sent successfully!');
    } catch (error) {
      console.error('❌ Failed to send email notification:', error);
      // Don't block the booking if email fails
    }
  };

  const resetAndClose = () => {
    setStep('datetime');
    setSelectedDate(null);
    setSelectedTime(null);
    setPaymentMethod(null);
    setPaymentProof(null);
    setPaymentProofPreview(null);
    setUserEmail('');
    setUserName('');
    onClose();
  };

  // Generate calendar dates for next 7 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Get time slots based on day of week
  const getTimeSlotsForDay = (date: Date) => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    switch (dayOfWeek) {
      case 0: // Sunday
        return {
          morning: [],
          afternoon: [],
          evening: ['22:00', '22:30']
        };
      case 1: // Monday
        return {
          morning: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
          afternoon: [],
          evening: ['20:00', '20:30', '21:00', '21:30', '22:00']
        };
      case 2: // Tuesday
        return {
          morning: ['10:30', '11:00', '11:30'],
          afternoon: [],
          evening: ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30']
        };
      case 3: // Wednesday
        return {
          morning: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
          afternoon: ['12:00'],
          evening: ['20:00', '20:30', '21:00']
        };
      case 4: // Thursday
        return {
          morning: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
          afternoon: ['12:00'],
          evening: []
        };
      case 5: // Friday
        return {
          morning: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
          afternoon: ['12:00'],
          evening: ['18:00', '18:30']
        };
      case 6: // Saturday
        return {
          morning: ['08:00', '08:30', '09:00', '09:30', '10:00'],
          afternoon: [],
          evening: ['18:00', '18:30', '19:00']
        };
      default:
        return {
          morning: ['08:00', '08:30', '09:00'],
          afternoon: [],
          evening: ['18:00', '18:30', '19:00']
        };
    }
  };

  const timeSlots = selectedDate ? getTimeSlotsForDay(selectedDate) : { morning: [], afternoon: [], evening: [] };
  const morningSlots = timeSlots.morning;
  const afternoonSlots = timeSlots.afternoon;
  const eveningSlots = timeSlots.evening;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop - hidden on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm hidden md:block"
            onClick={resetAndClose}
          />
          
          {/* Modal Content - Full screen on mobile, modal on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 1, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full md:h-auto md:max-w-2xl md:max-h-[90vh] overflow-y-auto bg-white md:rounded-3xl shadow-2xl"
          >
            {/* Scrollable Content Container */}
            <div className="min-h-full md:min-h-0 p-6 md:p-8 pb-20 md:pb-8">
              {/* Close Button */}
              <button
                onClick={resetAndClose}
                className="fixed md:absolute top-4 right-4 md:top-6 md:right-6 p-3 md:p-2 rounded-full bg-white md:bg-transparent hover:bg-slate-100 transition-colors shadow-lg md:shadow-none z-10"
              >
                <X className="w-5 h-5" />
              </button>

            {/* Date & Time Selection */}
            {step === 'datetime' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-2 mt-12 md:mt-0">Book a Trial Lesson</h2>
                <p className="text-slate-600 mb-6">{selectedDuration} mins session - $5</p>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Choose Date</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {generateDates().map((date, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(date)}
                        className={`p-2 md:p-3 rounded-xl border-2 transition-all active:scale-95 ${
                          selectedDate?.toDateString() === date.toDateString()
                            ? 'border-primary bg-primary text-white'
                            : 'border-slate-200 hover:border-primary'
                        }`}
                      >
                        <div className="text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className="text-base md:text-lg font-bold">{date.getDate()}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Choose Time</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">In your time zone, Asia/Kolkata (GMT +5:30)</p>
                    
                    {morningSlots.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold mb-2">☀️ Morning</div>
                        <div className="grid grid-cols-3 gap-2">
                          {morningSlots.map((time) => {
                            const isBooked = bookedSlots.has(time);
                            const isBlocked = blockedSlots.has(time);
                            const isUnavailable = isBooked || isBlocked;
                            return (
                              <button
                                key={time}
                                onClick={() => !isUnavailable && setSelectedTime(time)}
                                disabled={isUnavailable || loadingSlots}
                                className={`p-3 rounded-xl border-2 transition-all ${
                                  isBlocked
                                    ? 'border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : isBooked
                                    ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed'
                                    : selectedTime === time
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-slate-200 hover:border-primary active:scale-95'
                                }`}
                                title={isBlocked ? 'Teacher unavailable' : isBooked ? 'Already booked by another student' : undefined}
                              >
                                {time}
                                {isBooked && <div className="text-[10px] mt-0.5">Booked</div>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {afternoonSlots.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold mb-2">☀️ Afternoon</div>
                        <div className="grid grid-cols-3 gap-2">
                          {afternoonSlots.map((time) => {
                            const isBooked = bookedSlots.has(time);
                            const isBlocked = blockedSlots.has(time);
                            const isUnavailable = isBooked || isBlocked;
                            return (
                              <button
                                key={time}
                                onClick={() => !isUnavailable && setSelectedTime(time)}
                                disabled={isUnavailable || loadingSlots}
                                className={`p-3 rounded-xl border-2 transition-all ${
                                  isBlocked
                                    ? 'border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : isBooked
                                    ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed'
                                    : selectedTime === time
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-slate-200 hover:border-primary active:scale-95'
                                }`}
                                title={isBlocked ? 'Teacher unavailable' : isBooked ? 'Already booked by another student' : undefined}
                              >
                                {time}
                                {isBooked && <div className="text-[10px] mt-0.5">Booked</div>}
                                {isBlocked && <div className="text-[10px] mt-0.5">Unavailable</div>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {eveningSlots.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold mb-2">🌙 Evening</div>
                        <div className="grid grid-cols-3 gap-2">
                          {eveningSlots.map((time) => {
                            const isBooked = bookedSlots.has(time);
                            const isBlocked = blockedSlots.has(time);
                            const isUnavailable = isBooked || isBlocked;
                            return (
                              <button
                                key={time}
                                onClick={() => !isUnavailable && setSelectedTime(time)}
                                disabled={isUnavailable || loadingSlots}
                                className={`p-3 rounded-xl border-2 transition-all ${
                                  isBlocked
                                    ? 'border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : isBooked
                                    ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed'
                                    : selectedTime === time
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-slate-200 hover:border-primary active:scale-95'
                                }`}
                                title={isBlocked ? 'Teacher unavailable' : isBooked ? 'Already booked by another student' : undefined}
                              >
                                {time}
                                {isBooked && <div className="text-[10px] mt-0.5">Booked</div>}
                                {isBlocked && <div className="text-[10px] mt-0.5">Unavailable</div>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleDateTimeConfirm}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* Payment Selection */}
            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => setStep('datetime')}
                  className="mb-4 text-sm text-primary hover:underline flex items-center gap-1 mt-12 md:mt-0"
                >
                  ← Back
                </button>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Payment</h2>
                <p className="text-slate-600 mb-6">Total: ${getPrice()} for {selectedDuration} mins</p>

                {/* User Details */}
                <div className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Your Name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full p-3 md:p-3 rounded-xl border-2 border-slate-200 focus:border-primary outline-none text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Your Email</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full p-3 md:p-3 rounded-xl border-2 border-slate-200 focus:border-primary outline-none text-base"
                    />
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="text-sm font-semibold mb-3">Select Payment Method</div>
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => handlePaymentMethodSelect('paypal')}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 active:scale-95 ${
                      paymentMethod === 'paypal'
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 hover:border-primary'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">PayPal</div>
                      <div className="text-xs text-slate-600">International payments</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handlePaymentMethodSelect('upi')}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 active:scale-95 ${
                      paymentMethod === 'upi'
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 hover:border-primary'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">UPI Payment</div>
                      <div className="text-xs text-slate-600">PhonePe, GPay, Paytm</div>
                    </div>
                  </button>


                </div>

                {/* Payment Instructions */}
                {paymentMethod && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-blue-50 border border-blue-200 mb-6"
                  >
                    <div className="flex items-start gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-sm font-semibold text-blue-900">Payment Instructions</div>
                    </div>
                    
                    {paymentMethod === 'paypal' && (
                      <div className="text-sm text-slate-700 space-y-2">
                        <p>1. Click the button below to open PayPal</p>
                        <p>2. Send <strong>${getPrice()} USD</strong> to:</p>
                        <div className="p-2 bg-white rounded border border-blue-200 font-mono text-xs break-all">
                          {PAYMENT_CONFIG.paypal.email}
                        </div>
                        <a
                          href={PAYMENT_CONFIG.paypal.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all mt-2"
                        >
                          Pay with PayPal <ExternalLink className="w-4 h-4" />
                        </a>
                        <p className="mt-2">3. After payment, take a screenshot and upload it on the next screen</p>
                      </div>
                    )}
                    
                    {paymentMethod === 'upi' && (
                      <div className="text-sm text-slate-700 space-y-2">
                        <p>1. Open any UPI app (PhonePe, GPay, Paytm)</p>
                        <p>2. Send <strong>₹{getPrice() * 83}</strong> to UPI ID:</p>
                        <div className="p-2 bg-white rounded border border-blue-200 font-mono text-xs break-all">
                          {PAYMENT_CONFIG.upi.id}
                        </div>
                        <p className="text-xs text-slate-600">Or scan QR code (displayed on next screen)</p>
                        <p className="mt-2">3. After payment, upload screenshot as proof</p>
                      </div>
                    )}
                    

                  </motion.div>
                )}

                <button
                  onClick={handleProceedToUpload}
                  disabled={!paymentMethod || !userEmail || !userName}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all"
                >
                  Continue to Upload Proof
                </button>
              </motion.div>
            )}

            {/* Upload Payment Proof */}
            {step === 'upload-proof' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => setStep('payment')}
                  className="mb-4 text-sm text-primary hover:underline flex items-center gap-1 mt-12 md:mt-0"
                >
                  ← Back
                </button>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Upload Payment Proof</h2>
                <p className="text-slate-600 mb-6">Upload a screenshot or photo of your payment confirmation</p>

                {/* Show UPI QR Code if UPI selected */}
                {paymentMethod === 'upi' && (
                  <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
                    <div className="text-center">
                      <div className="text-sm font-semibold mb-3">Scan to Pay</div>
                      <div className="w-40 h-40 md:w-48 md:h-48 mx-auto bg-white p-4 rounded-xl border-2 border-slate-300">
                        <img 
                          src={PAYMENT_CONFIG.upi.qrCode} 
                          alt="UPI QR Code" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">QR Code</text></svg>';
                          }}
                        />
                      </div>
                      <div className="mt-3 p-2 bg-white rounded border border-slate-200 font-mono text-xs md:text-sm break-all">
                        {PAYMENT_CONFIG.upi.id}
                      </div>
                      <div className="mt-2 text-sm text-slate-600">
                        Amount: ₹{getPrice() * 83}
                      </div>
                    </div>
                  </div>
                )}

                {/* File Upload */}
                <div className="mb-6">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="payment-proof-upload"
                    />
                    <div
                      className="border-2 border-dashed border-slate-300 rounded-xl p-6 md:p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 active:scale-95 transition-all"
                      onClick={() => document.getElementById('payment-proof-upload')?.click()}
                    >
                      <Upload className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-slate-400" />
                      <div className="font-semibold mb-1">Click to upload</div>
                      <div className="text-sm text-slate-600">PNG, JPG up to 5MB</div>
                    </div>
                  </label>
                </div>

                {/* Preview */}
                {paymentProofPreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6"
                  >
                    <div className="text-sm font-semibold mb-2">Preview</div>
                    <div className="relative rounded-xl overflow-hidden border-2 border-green-500">
                      <img 
                        src={paymentProofPreview} 
                        alt="Payment proof preview" 
                        className="w-full h-48 md:h-64 object-contain bg-slate-100"
                      />
                      <button
                        onClick={() => {
                          setPaymentProof(null);
                          setPaymentProofPreview(null);
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 active:scale-95 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-slate-600 break-all">
                      File: {paymentProof?.name} ({((paymentProof?.size || 0) / 1024).toFixed(2)} KB)
                    </div>
                  </motion.div>
                )}

                {/* Security Notice */}
                <div className="p-4 rounded-xl bg-green-50 border border-green-200 mb-6">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-green-900">
                      <div className="font-semibold mb-1">Secure Verification</div>
                      <div>Your payment will be verified within 24 hours. You'll receive email confirmation once approved.</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmitBooking}
                  disabled={!paymentProof}
                  className="w-full py-4 rounded-2xl bg-green-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all"
                >
                  Submit Booking
                </button>
              </motion.div>
            )}

            {/* Confirmation */}
            {step === 'confirmed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Booking Submitted!</h2>
                <p className="text-slate-600 mb-2">
                  Your {selectedDuration}-minute session request for
                </p>
                <p className="text-lg md:text-xl font-semibold text-primary mb-4">
                  {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
                </p>
                
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 mb-6 text-left">
                  <div className="text-sm font-semibold text-blue-900 mb-2">What happens next?</div>
                  <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
                    <li>Your payment will be verified within 24 hours</li>
                    <li>You'll receive email confirmation at <strong className="break-all">{userEmail}</strong></li>
                    <li>Zoom or Meet link will be sent 1 hour before the class</li>
                    <li>Teacher will contact you if any questions</li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl bg-green-50 border border-green-200 mb-6">
                  <div className="text-sm text-green-900">
                    <strong>Booking Reference:</strong> #{Date.now().toString().slice(-6)}
                    <div className="text-xs mt-1">Save this for your records</div>
                  </div>
                </div>

                <button
                  onClick={resetAndClose}
                  className="px-8 py-3 rounded-2xl bg-primary text-white font-semibold hover:opacity-90 active:scale-95 transition-all"
                >
                  Done
                </button>
              </motion.div>
            )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
