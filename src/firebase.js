import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebaseのウェブアプリ設定はAnthropicのAPIキーとは異なり秘匿情報ではない。
// アクセス制御はこの値の秘匿ではなく、Firestore側のセキュリティルールと
// Google Sign-Inによる認証で行う。
const firebaseConfig = {
  apiKey: 'AIzaSyBgmXViGmIC2_J2nlAf5QIVDjl1VD2xC1w',
  authDomain: 'diary-5f800.firebaseapp.com',
  projectId: 'diary-5f800',
  storageBucket: 'diary-5f800.firebasestorage.app',
  messagingSenderId: '266271827348',
  appId: '1:266271827348:web:e93eb85f0018f006db5b81'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
