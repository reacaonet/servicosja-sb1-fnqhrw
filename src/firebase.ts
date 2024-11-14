import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAaWbthUHoPO9uL8QTJAZBZ6POhPN1nxbs",
  projectId: "marketplaceworkana",
  authDomain: "marketplaceworkana.firebaseapp.com",
  storageBucket: "marketplaceworkana.appspot.com"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);