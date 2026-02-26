import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyBKDmK76F6iN0a-UJrq0CS5Xhvd3BS9Tx4',
  authDomain: 'neest-8369d.firebaseapp.com',
  projectId: 'neest-8369d',
  storageBucket: 'neest-8369d.firebasestorage.app',
  messagingSenderId: '547167839083',
  appId: '1:547167839083:web:d48b442caa180a554d622e',
  measurementId: 'G-QJVYT0PQS1',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, googleProvider, analytics };
