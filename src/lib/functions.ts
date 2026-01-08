import { getFunctions } from 'firebase/functions';
import { getFirebaseApp } from './firebase';

// Callable functions live in us-central1 unless configured otherwise.
export const functions = getFunctions(getFirebaseApp(), 'us-central1');
