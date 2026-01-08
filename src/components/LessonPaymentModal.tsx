import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Check, Upload, AlertCircle, ExternalLink, Lock, CheckCircle2 } from 'lucide-react';

interface LessonPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  lessonId: number;
  lessonTitle: string;
}

export function LessonPaymentModal({ isOpen, onClose, onPaymentSuccess, lessonId, lessonTitle }: LessonPaymentModalProps) {
  const [step, setStep] = useState<'info' | 'payment' | 'upload-proof' | 'confirmed'>('info');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'phonepe' | 'gpay' | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // Payment configuration
  const PAYMENT_CONFIG = {
    paypal: {
      email: 'nandini.nandini01@gmail.com',
      link: 'https://paypal.me/nandini787'
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

  const LESSON_PRICE = 2; // $2 per lesson

  const handlePaymentMethodSelect = (method: 'paypal' | 'phonepe' | 'gpay') => {
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
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setPaymentProof(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!paymentProof) {
      alert('Please upload payment proof');
      return;
    }
    
    setUploading(true);
    
    try {
      // Simulate upload and verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, you would:
      // 1. Upload payment proof to Firebase Storage
      // 2. Create a Firestore document with payment details
      // 3. Send email notification to admin
      // 4. Wait for manual verification
      
      setStep('confirmed');
      
      // After 2 seconds, unlock lesson and close modal
      setTimeout(() => {
        onPaymentSuccess();
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error('Payment submission error:', error);
      alert('Failed to submit payment. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setStep('info');
    setPaymentMethod(null);
    setPaymentProof(null);
    setPaymentProofPreview(null);
    setUserEmail('');
    setUserName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Unlock Lesson {lessonId}</h2>
              <p className="text-lg text-slate-700 mb-2">{lessonTitle}</p>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent mb-2">
                ${LESSON_PRICE}
              </div>
              <p className="text-slate-600">One-time payment for lifetime access</p>
            </div>

            {/* Step: Info */}
            {step === 'info' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="font-semibold text-slate-900 mb-3">What You'll Get:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <span>Complete lesson content with vocabulary and sentences</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <span>Grammar notes and cultural insights</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <span>Interactive pronunciation practice</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <span>Lifetime access with no recurring fees</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setStep('payment')}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-600 transition-all"
                >
                  Proceed to Payment
                </button>
              </div>
            )}

            {/* Step: Payment Method */}
            {step === 'payment' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Select Payment Method
                  </h3>

                  <div className="space-y-3">
                    {/* PayPal */}
                    <button
                      onClick={() => handlePaymentMethodSelect('paypal')}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === 'paypal'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">PayPal</div>
                          <div className="text-sm text-slate-600">{PAYMENT_CONFIG.paypal.email}</div>
                        </div>
                        {paymentMethod === 'paypal' && <Check className="w-5 h-5 text-blue-600" />}
                      </div>
                    </button>

                    {/* PhonePe */}
                    <button
                      onClick={() => handlePaymentMethodSelect('phonepe')}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === 'phonepe'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">PhonePe</div>
                          <div className="text-sm text-slate-600">{PAYMENT_CONFIG.phonepe.name}</div>
                        </div>
                        {paymentMethod === 'phonepe' && <Check className="w-5 h-5 text-blue-600" />}
                      </div>
                    </button>

                    {/* Google Pay */}
                    <button
                      onClick={() => handlePaymentMethodSelect('gpay')}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === 'gpay'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">Google Pay</div>
                          <div className="text-sm text-slate-600">{PAYMENT_CONFIG.gpay.upiId}</div>
                        </div>
                        {paymentMethod === 'gpay' && <Check className="w-5 h-5 text-blue-600" />}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Payment Instructions */}
                {paymentMethod && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900 w-full">
                        {paymentMethod === 'paypal' && (
                          <div className="space-y-2">
                            <p className="font-semibold">PayPal Payment Instructions:</p>
                            <p>1. Send <strong>${LESSON_PRICE} USD</strong> to:</p>
                            <div className="p-2 bg-white rounded border border-blue-200 font-mono text-xs break-all">
                              {PAYMENT_CONFIG.paypal.email}
                            </div>
                            <a
                              href={PAYMENT_CONFIG.paypal.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
                            >
                              Pay with PayPal <ExternalLink className="w-4 h-4" />
                            </a>
                            <p className="mt-2">2. Add note: "Lesson {lessonId}"</p>
                            <p>3. Take a screenshot of the payment confirmation</p>
                          </div>
                        )}
                        {paymentMethod === 'phonepe' && (
                          <div className="space-y-2">
                            <p className="font-semibold">PhonePe Payment Instructions:</p>
                            <p>1. Open PhonePe app</p>
                            <p>2. Scan the QR code below or use UPI ID</p>
                            <p>3. Send <strong>₹166</strong> (approx. ${LESSON_PRICE})</p>
                            <p>4. Take a screenshot of the payment confirmation</p>
                          </div>
                        )}
                        {paymentMethod === 'gpay' && (
                          <div className="space-y-2">
                            <p className="font-semibold">Google Pay Payment Instructions:</p>
                            <p>1. Open Google Pay app</p>
                            <p>2. Scan the QR code below or use UPI ID:</p>
                            <div className="p-2 bg-white rounded border border-blue-200 font-mono text-xs break-all">
                              {PAYMENT_CONFIG.gpay.upiId}
                            </div>
                            <p>3. Send <strong>₹166</strong> (approx. ${LESSON_PRICE})</p>
                            <p>4. Take a screenshot of the payment confirmation</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* QR Code Display */}
                {(paymentMethod === 'phonepe' || paymentMethod === 'gpay') && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
                    <p className="text-sm text-slate-600 mb-3">Scan to Pay</p>
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <img
                        src={paymentMethod === 'phonepe' ? PAYMENT_CONFIG.phonepe.qrCode : PAYMENT_CONFIG.gpay.qrCode}
                        alt="QR Code"
                        className="w-48 h-48 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EQR Code%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                      UPI ID: {paymentMethod === 'phonepe' ? PAYMENT_CONFIG.phonepe.name : PAYMENT_CONFIG.gpay.upiId}
                    </p>
                  </div>
                )}

                {/* User Details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('info')}
                    className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleProceedToUpload}
                    disabled={!paymentMethod || !userEmail || !userName}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step: Upload Proof */}
            {step === 'upload-proof' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Payment Proof
                  </h3>

                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                    {!paymentProofPreview ? (
                      <div>
                        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm text-slate-600 mb-3">
                          Upload a screenshot of your payment confirmation
                        </p>
                        <label className="inline-block px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 cursor-pointer transition-all">
                          Choose File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-slate-500 mt-2">PNG, JPG up to 5MB</p>
                      </div>
                    ) : (
                      <div>
                        <img
                          src={paymentProofPreview}
                          alt="Payment proof"
                          className="max-h-64 mx-auto rounded-lg mb-3"
                        />
                        <label className="inline-block px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 cursor-pointer transition-all">
                          Change File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('payment')}
                    className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitPayment}
                    disabled={!paymentProof || uploading}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Submitting...' : 'Submit & Unlock'}
                  </button>
                </div>
              </div>
            )}

            {/* Step: Confirmed */}
            {step === 'confirmed' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Submitted!</h3>
                <p className="text-slate-600 mb-6">
                  Your payment proof has been submitted successfully.<br />
                  Lesson {lessonId} is now being unlocked...
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm">
                  <Check className="w-4 h-4" />
                  Lesson Access Activated
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
