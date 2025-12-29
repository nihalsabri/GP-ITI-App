import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, database } from './firebaseConfig';

export const registerUser = async (userData) => {
  try {
    const { email, password, role, name, phone, address, trade, areas } = userData;

    if (!email || !password || !role || !name) {
      throw new Error('بيانات التسجيل غير مكتملة');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('البريد الإلكتروني غير صالح');
    }

    if (password.length < 6) {
      throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    }

    const res = await createUserWithEmailAndPassword(auth, email, password);
    const uid = res.user.uid;

    const profile = {
      uid: uid,
      id: uid,
      email: email,
      name: name,
      displayName: name,
      role: role,
      profilePic: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (role === 'client') {
      if (!phone || !address) {
        throw new Error('رقم الهاتف والعنوان مطلوبان للعميل');
      }
      
      profile.phone = phone;
      profile.address = address;
      profile.ordersCount = 0;
      
      await set(ref(database, `clients/${uid}`), profile);
      
    } else if (role === 'tradesperson') {
      if (!trade) {
        throw new Error('التخصص مطلوب للفني');
      }
      
      profile.trade = trade;
      profile.areas = areas || [];
      profile.rating = 0;
      profile.totalJobs = 0;
      profile.completedJobs = 0;
      profile.available = true;
      profile.phone = phone || '';
      profile.address = address || '';
      
      await set(ref(database, `Tradespeople/${uid}`), profile);
    } else {
      throw new Error('نوع الحساب غير صالح');
    }

    await set(ref(database, `users/${uid}`), {
      uid: uid,
      email: email,
      name: name,
      role: role,
      createdAt: new Date().toISOString(),
    });

    const token = await res.user.getIdToken();
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('role', role);
    await AsyncStorage.setItem('user', JSON.stringify(profile));

    
    return { 
      success: true, 
      profile, 
      role, 
      token,
      userId: uid 
    };

  } catch (err) {
    console.error('❌ خطأ في التسجيل:', err.message);
    
    let errorMessage = 'حدث خطأ أثناء التسجيل';
    
    if (err.code === 'auth/email-already-in-use') {
      errorMessage = 'البريد الإلكتروني مسجل مسبقاً';
    } else if (err.code === 'auth/invalid-email') {
      errorMessage = 'البريد الإلكتروني غير صالح';
    } else if (err.code === 'auth/weak-password') {
      errorMessage = 'كلمة المرور ضعيفة';
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    throw new Error(errorMessage);
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    if (!email || !password) {
      throw new Error('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('صيغة البريد الإلكتروني غير صحيحة');
    }


    const res = await signInWithEmailAndPassword(auth, email, password);
    const uid = res.user.uid;


    const token = await res.user.getIdToken();
    
    const userRef = ref(database, `users/${uid}`);
    const userSnap = await get(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.val();
      const role = userData.role;
      

      let profile = {};
      if (role === 'client') {
        const clientSnap = await get(ref(database, `clients/${uid}`));
        if (clientSnap.exists()) {
          profile = clientSnap.val();
        }
      } else if (role === 'tradesperson') {
        const tradesSnap = await get(ref(database, `Tradespeople/${uid}`));
        if (tradesSnap.exists()) {
          profile = tradesSnap.val();
        }
      }

      const completeProfile = {
        ...profile,
        uid: uid,
        id: uid,
        email: email,
        name: profile.name || userData.name || email.split('@')[0],
        displayName: profile.displayName || userData.name || email.split('@')[0],
        role: role,
      };

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', role);
      await AsyncStorage.setItem('user', JSON.stringify(completeProfile));


      return { 
        success: true, 
        profile: completeProfile, 
        role: role, 
        token 
      };
    }

    
    const clientSnap = await get(ref(database, `clients/${uid}`));
    if (clientSnap.exists()) {
      const profile = clientSnap.val();
      const role = 'client';
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', role);
      await AsyncStorage.setItem('user', JSON.stringify(profile));

      return { success: true, profile, role: 'client', token };
    }

    const tradesSnap = await get(ref(database, `Tradespeople/${uid}`));
    if (tradesSnap.exists()) {
      const profile = tradesSnap.val();
      const role = 'tradesperson';
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', role);
      await AsyncStorage.setItem('user', JSON.stringify(profile));

      console.log(' وجد المستخدم في Tradespeople');
      return { success: true, profile, role: 'tradesperson', token };
    }

    console.log(' لم يتم العثور على ملف المستخدم في أي collection');
    throw new Error('لم يتم العثور على ملف المستخدم. الرجاء التسجيل أولاً.');

  } catch (err) {
    console.error(' خطأ في تسجيل الدخول:', err.message);
    
    let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
    
    if (err.code === 'auth/user-not-found') {
      errorMessage = 'البريد الإلكتروني غير مسجل';
    } else if (err.code === 'auth/wrong-password') {
      errorMessage = 'كلمة المرور غير صحيحة';
    } else if (err.code === 'auth/invalid-email') {
      errorMessage = 'البريد الإلكتروني غير صالح';
    } else if (err.code === 'auth/too-many-requests') {
      errorMessage = 'تم تجاوز عدد المحاولات. الرجاء المحاولة لاحقاً';
    } else if (err.code === 'auth/user-disabled') {
      errorMessage = 'تم تعطيل الحساب. الرجاء التواصل مع الدعم';
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    throw new Error(errorMessage);
  }
};

export const logoutUser = async () => {
  try {
    console.log(' بدء تسجيل الخروج...');
    
    await AsyncStorage.multiRemove(['token', 'role', 'user']);
    await signOut(auth);
    
    
    return { success: true };
  } catch (err) {
    console.error(' خطأ في تسجيل الخروج:', err.message);
    throw new Error('حدث خطأ أثناء تسجيل الخروج');
  }
};

export const getCurrentUser = async () => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return null;
    }

    const token = await AsyncStorage.getItem('token');
    const role = await AsyncStorage.getItem('role');
    const userString = await AsyncStorage.getItem('user');

    if (!token || !role || !userString) {
      return null;
    }

    const user = JSON.parse(userString);
    
    return {
      ...user,
      token,
      role,
    };
  } catch (err) {
    console.error(' خطأ في جلب بيانات المستخدم:', err.message);
    return null;
  }
};