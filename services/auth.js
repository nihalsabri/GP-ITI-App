import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

import { ref, set, get } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, database } from './firebaseConfig';

/* ======================================================
   REGISTER (ROLE IS REQUIRED HERE)
====================================================== */

export const registerUser = async ({
  email,
  password,
  role, // "client" | "tradesperson"
  profileData = {},
}) => {
  try {
    if (!email || !password || !role) {
      throw new Error('Missing required register data');
    }

    const collection = role === 'client' ? 'clients' : 'Tradespeople';

    const res = await createUserWithEmailAndPassword(auth, String(email), String(password));

    const uid = res.user.uid;

    const profile = {
      id: uid,
      email,
      role,
      createdAt: new Date().toISOString(),
      ...profileData,
    };

    await set(ref(database, `${collection}/${uid}`), profile);

    return profile;
  } catch (err) {
    console.error('registerUser error:', err.message);
    throw err;
  }
};

/* ======================================================
   LOGIN (ROLE IS AUTO-DETECTED)
====================================================== */

export const loginUser = async ({ email, password }) => {
  try {
    if (!email || !password) {
      throw new Error('Missing login data');
    }

    // 1️⃣ Firebase Auth
    const res = await signInWithEmailAndPassword(auth, String(email), String(password));

    const uid = res.user.uid;

    // 2️⃣ Check CLIENT
    const clientSnap = await get(ref(database, `clients/${uid}`));

    if (clientSnap.exists()) {
      const token = await res.user.getIdToken();
      const profile = clientSnap.val();

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', 'client');
      await AsyncStorage.setItem('user', JSON.stringify(profile));

      return { profile, role: 'client', token };
    }

    // 3️⃣ Check TRADESPERSON
    const tradesSnap = await get(ref(database, `Tradespeople/${uid}`));

    if (tradesSnap.exists()) {
      const token = await res.user.getIdToken();
      const profile = tradesSnap.val();

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', 'tradesperson');
      await AsyncStorage.setItem('user', JSON.stringify(profile));

      return { profile, role: 'tradesperson', token };
    }

    // 4️⃣ No profile found
    throw new Error('User profile not found');
  } catch (err) {
    console.error('loginUser error:', err.message);
    throw err;
  }
};

/* ======================================================
   LOGOUT
====================================================== */

export const logoutUser = async () => {
  try {
    await AsyncStorage.multiRemove(['token', 'role', 'user']);
    await signOut(auth);
  } catch (err) {
    console.error('logoutUser error:', err.message);
    throw err;
  }
};
