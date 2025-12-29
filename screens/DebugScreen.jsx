import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../store/appSlice';
import { auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function DebugScreen() {
  const dispatch = useDispatch();
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const appState = useSelector((state) => state.app);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      Alert.alert('تم تسجيل الخروج', 'تم تسجيل الخروج بنجاح');
    } catch (error) {
      Alert.alert('خطأ', 'فشل تسجيل الخروج: ' + error.message);
    }
  };

  const checkFirebaseAuth = () => {
    console.log('Firebase Auth Current User:', auth.currentUser);
    Alert.alert(
      'Firebase Auth',
      `Current user: ${auth.currentUser?.email || 'None'}\nUID: ${auth.currentUser?.uid || 'None'}`
    );
  };

  const checkReduxState = () => {
    console.log('Redux App State:', appState);
    Alert.alert(
      'Redux State',
      `User: ${appState.user?.email || 'None'}\nRole: ${appState.role}\nAuthenticated: ${appState.isAuthenticated}`
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb', padding: 16 }}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Ionicons name="bug" size={60} color="#372b70" />
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginTop: 16 }}>
          شاشة التصحيح
        </Text>
      </View>

      {/* Firebase Auth Info */}
      <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 }}>Firebase Auth</Text>
        <Text style={{ color: '#6b7280', marginBottom: 4 }}>Email: {auth.currentUser?.email || 'لا يوجد'}</Text>
        <Text style={{ color: '#6b7280', marginBottom: 4 }}>UID: {auth.currentUser?.uid ? `${auth.currentUser.uid.substring(0, 20)}...` : 'لا يوجد'}</Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, marginTop: 8 }}
          onPress={checkFirebaseAuth}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>عرض بيانات Firebase</Text>
        </TouchableOpacity>
      </View>

      {/* Redux State Info */}
      <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 }}>Redux State</Text>
        <Text style={{ color: '#6b7280', marginBottom: 4 }}>Email: {user?.email || 'لا يوجد'}</Text>
        <Text style={{ color: '#6b7280', marginBottom: 4 }}>Role: <Text style={{ color: role === 'tradesperson' ? '#7c3aed' : '#3b82f6', fontWeight: 'bold' }}>{role || 'لا يوجد'}</Text></Text>
        <Text style={{ color: '#6b7280', marginBottom: 4 }}>Authenticated: <Text style={{ color: isAuthenticated ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{isAuthenticated ? 'نعم' : 'لا'}</Text></Text>
        <Text style={{ color: '#6b7280', marginBottom: 4 }}>Loading: {isLoading ? 'نعم' : 'لا'}</Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#8b5cf6', padding: 12, borderRadius: 8, marginTop: 8 }}
          onPress={checkReduxState}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>عرض بيانات Redux</Text>
        </TouchableOpacity>
      </View>

      {/* Database Check */}
      <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 }}>فحص قاعدة البيانات</Text>
        <Text style={{ color: '#6b7280', marginBottom: 8 }}>المسارات المحتملة:</Text>
        <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 2 }}>/Tradespeople/{user?.uid || 'YOUR_UID'}</Text>
        <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 2 }}>/clients/{user?.uid || 'YOUR_UID'}</Text>
        
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: '#6b7280', marginBottom: 4 }}>هل أنت مسجل كـ:</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: role === 'tradesperson' ? '#7c3aed' : '#e5e7eb', padding: 12, borderRadius: 8 }}>
              <Text style={{ color: role === 'tradesperson' ? 'white' : '#6b7280', textAlign: 'center', fontWeight: '600' }}>فني</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: role === 'client' ? '#3b82f6' : '#e5e7eb', padding: 12, borderRadius: 8 }}>
              <Text style={{ color: role === 'client' ? 'white' : '#6b7280', textAlign: 'center', fontWeight: '600' }}>عميل</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 }}>الإجراءات</Text>
        
        <TouchableOpacity 
          style={{ backgroundColor: '#10b981', padding: 16, borderRadius: 8, marginBottom: 8 }}
          onPress={() => {
            // إعادة تحميل حالة المصادقة
            dispatch({ type: 'app/setLoading', payload: true });
            setTimeout(() => {
              dispatch({ type: 'app/setLoading', payload: false });
            }, 1000);
            Alert.alert('تم', 'جاري إعادة تحميل حالة المصادقة');
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>🔄 إعادة تحميل الحالة</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{ backgroundColor: '#f59e0b', padding: 16, borderRadius: 8, marginBottom: 8 }}
          onPress={() => {
            // تغيير الدور يدوياً (للاختبار فقط)
            const newRole = role === 'tradesperson' ? 'client' : 'tradesperson';
            dispatch({ type: 'app/setRole', payload: newRole });
            Alert.alert('تم تغيير الدور', `الدور الجديد: ${newRole === 'tradesperson' ? 'فني' : 'عميل'}`);
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>🔄 تغيير الدور يدوياً</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{ backgroundColor: '#ef4444', padding: 16, borderRadius: 8 }}
          onPress={handleLogout}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>🚪 تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={{ backgroundColor: '#fef3c7', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#fbbf24' }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#92400e', marginBottom: 8 }}>تعليمات لحل المشكلة:</Text>
        <Text style={{ color: '#92400e', marginBottom: 4 }}>1. تحقق من Firebase Console → Realtime Database</Text>
        <Text style={{ color: '#92400e', marginBottom: 4 }}>2. ابحث عن UID الخاص بك في جدول Tradespeople</Text>
        <Text style={{ color: '#92400e', marginBottom: 4 }}>3. تأكد من وجود البيانات بشكل صحيح</Text>
        <Text style={{ color: '#92400e', marginBottom: 4 }}>4. إذا لم تجد، أضف بياناتك يدوياً</Text>
        <Text style={{ color: '#92400e' }}>5. أعد تحميل التطبيق</Text>
      </View>

      {/* Current UID */}
      <View style={{ marginTop: 24, padding: 16, backgroundColor: '#e0e7ff', borderRadius: 12 }}>
        <Text style={{ color: '#3730a3', fontWeight: 'bold', textAlign: 'center' }}>
          UID الحالي: {user?.uid || 'لا يوجد'}
        </Text>
        <Text style={{ color: '#4f46e5', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
          انسخ هذا الرقم للبحث في Firebase
        </Text>
      </View>
    </ScrollView>
  );
}