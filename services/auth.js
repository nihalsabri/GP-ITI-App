import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

import { ref, set, get } from 'firebase/database';
import { auth, database } from './firebaseConfig';

/* ======================================================
   HELPERS
====================================================== */

const getCollectionByRole = (role) => {
  if (role === 'client') return 'clients';
  if (role === 'tradesperson') return 'Tradespeople';
  throw new Error('Invalid role');
};

/* ======================================================
   REGISTER (CLIENT OR TRADESPERSON)
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

    const collection = getCollectionByRole(role);

    // 1️⃣ Create Auth user
    const res = await createUserWithEmailAndPassword(auth, String(email), String(password));

    const uid = res.user.uid;

    // 2️⃣ Save profile in Realtime DB
    await set(ref(database, `${collection}/${uid}`), {
      id: uid,
      email,
      role,
      createdAt: new Date().toISOString(),
      ...profileData,
    });

    return {
      uid,
      email,
      role,
    };
  } catch (err) {
    console.error('registerUser error:', err.code, err.message);
    throw err;
  }
};

/* ======================================================
   LOGIN (CLIENT OR TRADESPERSON)
====================================================== */

export const loginUser = async ({
  email,
  password,
  role, // "client" | "tradesperson"
}) => {
  try {
    if (!email || !password || !role) {
      throw new Error('Missing login data');
    }

    const collection = getCollectionByRole(role);

    // 1️⃣ Firebase Auth login
    const res = await signInWithEmailAndPassword(auth, String(email), String(password));

    const uid = res.user.uid;

    // 2️⃣ Get profile from correct collection
    const snap = await get(ref(database, `${collection}/${uid}`));

    if (!snap.exists()) {
      throw new Error('Profile not found for this role');
    }

    const profile = snap.val();

    // 3️⃣ Get token (useful later for APIs)
    const token = await res.user.getIdToken();

    return {
      authResult: res,
      profile,
      token,
      role,
    };
  } catch (err) {
    console.error('loginUser error:', err.code, err.message);
    throw err;
  }
};

/* ======================================================
   LOGOUT
====================================================== */

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('logoutUser error:', err.code, err.message);
    throw err;
  }
};
