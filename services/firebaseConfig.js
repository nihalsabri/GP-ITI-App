import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyB7PSnQphwZ73NhvKl460VW7AfDP70J4Jk",
  authDomain: "gp-iti-1c920.firebaseapp.com",
  databaseURL: "https://gp-iti-1c920-default-rtdb.firebaseio.com",
  projectId: "gp-iti-1c920",
  storageBucket: "gp-iti-1c920.appspot.com",
  messagingSenderId: "752793572883",
  appId: "1:752793572883:web:1fa9b3ec35cc8919f0d1e6"
};

let app;
let auth;
let database;

try {
  if (getApps().length > 0) {
    app = getApp();
  } else {
    app = initializeApp(firebaseConfig);
  }

  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });

  database = getDatabase(app);
  
  
} catch (error) {
  console.error(' Firebase initialization error:', error);
  throw error;
}

export { app, auth, database };