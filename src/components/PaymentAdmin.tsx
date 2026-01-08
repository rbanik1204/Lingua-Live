import { useState, useEffect } from 'react';
import { Check, X, Eye, Calendar, DollarSign, User, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribePendingPayments, approvePayment, rejectPayment, type PaymentRecord } from '../lib/payments';

export function PaymentAdmin() {
  const { user } = useAuth();
  const [pendingPayments, setPendingPayments] = useState<PaymentRecord[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribePendingPayments(setPendingPayments);
    return () => unsubscribe();
  }, []);

  const handleApprove = async (paymentId: string) => {
    if (!user) return;
    setProcessing(true);
    try {
      await approvePayment(paymentId, user.uid, notes);
      setSelectedPayment(null);
      setNotes('');
      alert('Payment approved! User access has been granted.');
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Failed to approve payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (paymentId: string) => {
    if (!user || !notes) {
      alert('Please provide a reason for rejection');
      return;
    }
    setProcessing(true);
    try {
      await rejectPayment(paymentId, user.uid, notes);
      setSelectedPayment(null);
      setNotes('');
      alert('Payment rejected.');
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Failed to reject payment');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Payment Verification</h2>

      {pendingPayments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-slate-600">No pending payments to review</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">
                    {payment.type === 'aibot' ? 'AI Bot Access' : 
                     payment.lessonId ? `Lesson ${payment.lessonId}` : 'Bulk Premium'}
                  </h3>
                  {payment.lessonTitle && (
                    <p className="text-sm text-slate-600">{payment.lessonTitle}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    ${payment.amount}
                  </div>
                  <div className="text-xs text-slate-500">{payment.currency}</div>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-4 h-4" />
                  {payment.userName}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4" />
                  {payment.userEmail}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <DollarSign className="w-4 h-4" />
                  {payment.paymentMethod.toUpperCase()}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  {payment.submittedAt?.toDate().toLocaleString()}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedPayment(payment);
                    setNotes('');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Payment Proof Review
              </h3>

              <div className="mb-4">
                <img
                  src={selectedPayment.proofUrl}
                  alt="Payment proof"
                  className="w-full rounded-lg border border-slate-200"
                />
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Notes (optional for approval, required for rejection)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    rows={3}
                    placeholder="Add any notes about this payment..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedPayment.id)}
                  disabled={processing || !notes}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedPayment.id)}
                  disabled={processing}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
