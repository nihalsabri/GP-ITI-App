// services/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// ❌ متستخدمش analytics في Expo
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: 'AIzaSyB7PSnQphwZ73NhvKl460VW7AfDP70J4Jk',
  authDomain: 'gp-iti-1c920.firebaseapp.com',
  databaseURL: 'https://gp-iti-1c920-default-rtdb.firebaseio.com',
  projectId: 'gp-iti-1c920',
  storageBucket: 'gp-iti-1c920.appspot.com',
  messagingSenderId: '752793572883',
  appId: '1:752793572883:web:1fa9b3ec35cc8919f0d1e6',
};

const app = initializeApp(firebaseConfig);

// ✅ Expo-compatible
export const auth = getAuth(app);
export const database = getDatabase(app);
