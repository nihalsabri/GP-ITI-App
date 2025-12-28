import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout, setLoading } from '../store/appSlice';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../services/firebaseConfig';
import { ref, get } from 'firebase/database';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      
      if (firebaseUser) {
        
        try {
          let userRole = 'client';
          let userProfile = null;
          
          // Try to get stored data from AsyncStorage first
          try {
            const storedUser = await AsyncStorage.getItem('user');
            const storedRole = await AsyncStorage.getItem('role');
            
            if (storedUser) {
              userProfile = JSON.parse(storedUser);
            }
            if (storedRole) {
              userRole = storedRole;
            }
          } catch (storageError) {
          }
          
          // If no stored data, fetch from Firebase
          if (!userProfile) {
            console.log('🔍 جلب بيانات المستخدم من Firebase...');
            
            // Check in users collection first
            const userRef = ref(database, `users/${firebaseUser.uid}`);
            const userSnap = await get(userRef);
            
            if (userSnap.exists()) {
              const userData = userSnap.val();
              userRole = userData.role || 'client';
              
              // Get full profile based on role
              if (userRole === 'client') {
                const clientSnap = await get(ref(database, `clients/${firebaseUser.uid}`));
                if (clientSnap.exists()) {
                  userProfile = clientSnap.val();
                }
              } else if (userRole === 'tradesperson') {
                const tradesSnap = await get(ref(database, `Tradespeople/${firebaseUser.uid}`));
                if (tradesSnap.exists()) {
                  userProfile = tradesSnap.val();
                }
              }
            } else {
              // Fallback to direct collection check
              const clientSnap = await get(ref(database, `clients/${firebaseUser.uid}`));
              if (clientSnap.exists()) {
                userProfile = clientSnap.val();
                userRole = 'client';
              } else {
                const tradesSnap = await get(ref(database, `Tradespeople/${firebaseUser.uid}`));
                if (tradesSnap.exists()) {
                  userProfile = tradesSnap.val();
                  userRole = 'tradesperson';
                }
              }
            }
          }
          
          // If still no profile, create basic one
          if (!userProfile) {
            console.log('⚠️ Creating default user profile');
            userProfile = {
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'مستخدم',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'مستخدم',
              role: userRole,
              profilePic: '',
              createdAt: new Date().toISOString(),
            };
          }
          
          // Ensure profile has all required fields
          const completeProfile = {
            uid: userProfile.uid || firebaseUser.uid,
            id: userProfile.id || firebaseUser.uid,
            email: userProfile.email || firebaseUser.email || '',
            name: userProfile.name || userProfile.displayName || firebaseUser.email?.split('@')[0] || 'مستخدم',
            displayName: userProfile.displayName || userProfile.name || firebaseUser.email?.split('@')[0] || 'مستخدم',
            phone: userProfile.phone || '',
            address: userProfile.address || '',
            profilePic: userProfile.profilePic || '',
            role: userProfile.role || userRole,
            ...(userRole === 'tradesperson' && {
              trade: userProfile.trade || '',
              areas: userProfile.areas || [],
              rating: userProfile.rating || 0,
              totalJobs: userProfile.totalJobs || 0,
              completedJobs: userProfile.completedJobs || 0,
              available: userProfile.available !== undefined ? userProfile.available : true,
            }),
          };
          
          // Save to AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(completeProfile));
          await AsyncStorage.setItem('role', userRole);
          
          // Update Redux state
          dispatch(loginSuccess({
            user: completeProfile,
            role: userRole
          }));
          
          
        } catch (error) {
          console.error(' Error in auth process:', error);
          dispatch(logout());
        }
        
      } else {
        dispatch(logout());
      }
      
      setIsInitializing(false);
      dispatch(setLoading(false));
    });

    return unsubscribe;
  }, [dispatch]);

  const logoutUser = useCallback(async () => {
    try {
      
      await signOut(auth);
      await AsyncStorage.multiRemove(['user', 'role', 'token']);
      dispatch(logout());
      
      return { success: true };
    } catch (error) {
      console.error(' خطأ في تسجيل الخروج:', error);
      throw new Error('حدث خطأ أثناء تسجيل الخروج');
    }
  }, [dispatch]);

  const loginUser = useCallback(async (userData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('role', userData.role);
      
      dispatch(loginSuccess({
        user: userData,
        role: userData.role
      }));
      
      return { success: true };
    } catch (error) {
      console.error(' خطأ في تسجيل الدخول:', error);
      throw new Error('حدث خطأ أثناء تسجيل الدخول');
    }
  }, [dispatch]);

  const registerUser = useCallback(async (userData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('role', userData.role);
      
      dispatch(loginSuccess({
        user: userData,
        role: userData.role
      }));
      
      return { success: true };
    } catch (error) {
      console.error(' خطأ في التسجيل:', error);
      throw new Error('حدث خطأ أثناء التسجيل');
    }
  }, [dispatch]);

  const value = {
    logout: logoutUser,
    login: loginUser,
    register: registerUser,
    isInitializing,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};