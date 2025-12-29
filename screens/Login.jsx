import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { loginUser } from '../services/auth';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/appSlice';

export default function Login({ navigation }) {
  const dispatch = useDispatch();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // التحقق من البيانات
    if (!email.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال البريد الإلكتروني');
      return;
    }

    if (!password) {
      Alert.alert('خطأ', 'الرجاء إدخال كلمة المرور');
      return;
    }

    // تحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('خطأ', 'البريد الإلكتروني غير صالح');
      return;
    }

    try {
      setLoading(true);

      // استدعاء خدمة تسجيل الدخول
      const result = await loginUser({ email, password });

      if (result.success) {
        
        // حفظ بيانات المستخدم في Redux مباشرة
        dispatch(loginSuccess({
          user: result.profile,
          role: result.role
        }));
        
        // عرض رسالة نجاح
        Alert.alert('نجاح', 'تم تسجيل الدخول بنجاح');
        
      
      } else {
        Alert.alert('خطأ', result.message || 'فشل تسجيل الدخول');
      }
    } catch (error) {
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-12">
          {/* Header */}
          <View className="items-center mb-12">
            <View className="bg-primary/10 p-4 rounded-2xl mb-6">
              <Ionicons name="construct" size={60} color="#4f46e5" />
            </View>
            <Text className="text-3xl font-bold text-gray-800">تسجيل الدخول</Text>
            <Text className="text-gray-500 mt-2 text-center">
              سجل دخولك لإدارة طلباتك وخدماتك
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-6">
            {/* Email Input */}
            <View>
              <Text className="text-gray-700 font-semibold mb-2">البريد الإلكتروني</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="mail-outline" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 mr-2 text-gray-700 text-right"
                  placeholder="example@email.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-gray-700 font-semibold mb-2">كلمة المرور</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 mr-2 text-gray-700 text-right"
                  placeholder="******"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="self-start">
              <Text className="text-primary font-semibold">نسيت كلمة المرور؟</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`bg-primary rounded-xl py-4 mt-4 ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? (
                <View className="flex-row justify-center items-center">
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="text-white font-bold text-lg mr-2">جاري الدخول...</Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-lg text-center">
                  تسجيل الدخول
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500">أو</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-600">ليس لديك حساب؟</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                disabled={loading}
                className="mr-2"
              >
                <Text className="text-primary font-bold">إنشاء حساب جديد</Text>
              </TouchableOpacity>
            </View>

            {/* Role Info */}
            <View className="bg-blue-50 rounded-xl p-4 mt-8">
              <Text className="text-blue-800 font-bold mb-2">معلومات:</Text>
              <Text className="text-blue-700 text-sm">
                • الفنيون: بعد تسجيل الدخول ستتم توجيهكم تلقائياً إلى لوحة التحكم
              </Text>
              <Text className="text-blue-700 text-sm mt-1">
                • العملاء: ستتم توجيهكم إلى الصفحة الرئيسية
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}