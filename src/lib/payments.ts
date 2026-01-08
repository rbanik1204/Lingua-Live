import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export interface PaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'lesson' | 'aibot' | 'bulk';
  lessonId?: number;
  lessonTitle?: string;
  amount: number;
  currency: 'USD' | 'INR';
  paymentMethod: 'paypal' | 'phonepe' | 'gpay';
  proofUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  notes?: string;
}

export interface UserPurchases {
  userId: string;
  purchasedLessons: number[];
  hasAIBotAccess: boolean;
  hasBulkPremium: boolean;
  lastUpdated: Timestamp;
}

// Submit payment proof
export async function submitPayment(data: {
  userId: string;
  userEmail: string;
  userName: string;
  type: 'lesson' | 'aibot' | 'bulk';
  lessonId?: number;
  lessonTitle?: string;
  amount: number;
  currency: 'USD' | 'INR';
  paymentMethod: 'paypal' | 'phonepe' | 'gpay';
  proofFile: File;
}): Promise<string> {
  try {
    // 1. Upload proof image to Storage
    const timestamp = Date.now();
    const fileName = `payment-proofs/${data.userId}/${timestamp}_${data.proofFile.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, data.proofFile);
    const proofUrl = await getDownloadURL(storageRef);

    // 2. Create payment record in Firestore
    const paymentData = {
      userId: data.userId,
      userEmail: data.userEmail,
      userName: data.userName,
      type: data.type,
      lessonId: data.lessonId,
      lessonTitle: data.lessonTitle,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      proofUrl,
      status: 'pending' as const,
      submittedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'payments'), paymentData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error submitting payment:', error);
    throw error;
  }
}

// Get user's purchases
export async function getUserPurchases(userId: string): Promise<UserPurchases | null> {
  try {
    const docRef = doc(db, 'userPurchases', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as unknown as UserPurchases;
    }
    return null;
  } catch (error) {
    console.error('Error getting user purchases:', error);
    return null;
  }
}

// Subscribe to user's purchases (real-time)
export function subscribeUserPurchases(
  userId: string,
  onPurchases: (purchases: UserPurchases | null) => void
): () => void {
  const docRef = doc(db, 'userPurchases', userId);
  
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      onPurchases({ id: snapshot.id, ...snapshot.data() } as unknown as UserPurchases);
    } else {
      onPurchases(null);
    }
  }, (error) => {
    console.error('Error subscribing to user purchases:', error);
    onPurchases(null);
  });
}

// Admin: Get all pending payments
export function subscribePendingPayments(
  onPayments: (payments: PaymentRecord[]) => void
): () => void {
  const q = query(
    collection(db, 'payments'),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PaymentRecord[];
    
    onPayments(payments);
  });
}

// Admin: Approve payment
export async function approvePayment(
  paymentId: string,
  reviewerId: string,
  notes?: string
): Promise<void> {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    const paymentSnap = await getDoc(paymentRef);
    
    if (!paymentSnap.exists()) {
      throw new Error('Payment not found');
    }

    const payment = paymentSnap.data() as PaymentRecord;

    // Update payment status
    await updateDoc(paymentRef, {
      status: 'approved',
      reviewedAt: serverTimestamp(),
      reviewedBy: reviewerId,
      notes: notes || ''
    });

    // Update user purchases
    const purchasesRef = doc(db, 'userPurchases', payment.userId);
    const purchasesSnap = await getDoc(purchasesRef);

    if (purchasesSnap.exists()) {
      const currentPurchases = purchasesSnap.data() as UserPurchases;
      
      if (payment.type === 'lesson' && payment.lessonId) {
        // Add lesson to purchased lessons
        const updatedLessons = [...currentPurchases.purchasedLessons];
        if (!updatedLessons.includes(payment.lessonId)) {
          updatedLessons.push(payment.lessonId);
        }
        
        await updateDoc(purchasesRef, {
          purchasedLessons: updatedLessons,
          lastUpdated: serverTimestamp()
        });
      } else if (payment.type === 'aibot') {
        // Grant AI bot access
        await updateDoc(purchasesRef, {
          hasAIBotAccess: true,
          lastUpdated: serverTimestamp()
        });
      } else if (payment.type === 'bulk') {
        // Grant bulk premium access
        await updateDoc(purchasesRef, {
          hasBulkPremium: true,
          lastUpdated: serverTimestamp()
        });
      }
    } else {
      // Create new purchases record
      const newPurchases: Partial<UserPurchases> = {
        userId: payment.userId,
        purchasedLessons: payment.type === 'lesson' && payment.lessonId ? [payment.lessonId] : [],
        hasAIBotAccess: payment.type === 'aibot',
        hasBulkPremium: payment.type === 'bulk',
        lastUpdated: serverTimestamp() as Timestamp
      };
      
      await setDoc(purchasesRef, newPurchases);
    }
  } catch (error) {
    console.error('Error approving payment:', error);
    throw error;
  }
}

// Admin: Reject payment
export async function rejectPayment(
  paymentId: string,
  reviewerId: string,
  notes: string
): Promise<void> {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    
    await updateDoc(paymentRef, {
      status: 'rejected',
      reviewedAt: serverTimestamp(),
      reviewedBy: reviewerId,
      notes
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    throw error;
  }
}
