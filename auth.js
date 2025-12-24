// context/auth.js
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';

/* ================= LOGIN ================= */
export const loginUser = async (email, password) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};

/* ================= REGISTER ================= */
export const registerUser = async (email, password) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  return res.user;
};

/* ================= LOGOUT ================= */
export const logoutUser = async () => {
  await signOut(auth);
};
