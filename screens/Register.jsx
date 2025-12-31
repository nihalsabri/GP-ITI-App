import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { registerUser } from '../services/auth';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/appSlice';
import { ref, update } from 'firebase/database';
import { database } from '../services/firebaseConfig';
export default function Register({ navigation }) {
  const dispatch = useDispatch();

  // ==========================================
  // 📝 STATE
  // ==========================================
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('client');
const [specialName, setSpecialName] = useState('');
const [specialDesc, setSpecialDesc] = useState('');
const [specialPrice, setSpecialPrice] = useState('');
  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Client fields
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Tradesperson fields
  const [trade, setTrade] = useState('');
  const [area1, setArea1] = useState('');
  const [area2, setArea2] = useState('');
  const [area3, setArea3] = useState('');

  // ==========================================
  // ✅ VALIDATION
  // ==========================================
  const validateForm = () => {
    // Common validation
    if (!name.trim()) {
      Alert.alert('خطأ', 'الاسم مطلوب');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('خطأ', 'البريد الإلكتروني مطلوب');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('خطأ', 'البريد الإلكتروني غير صالح');
      return false;
    }

    if (!password) {
      Alert.alert('خطأ', 'كلمة المرور مطلوبة');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمات المرور غير متطابقة');
      return false;
    }

    // Role-specific validation
    if (role === 'client') {
      if (!phone.trim()) {
        Alert.alert('خطأ', 'رقم الهاتف مطلوب');
        return false;
      }
      if (!address.trim()) {
        Alert.alert('خطأ', 'العنوان مطلوب');
        return false;
      }
    }

    if (role === 'tradesperson') {
      if (!trade) {
        Alert.alert('خطأ', 'التخصص مطلوب');
        return false;
      }
      if (!area1.trim()) {
        Alert.alert('خطأ', 'المنطقة الأولى مطلوبة');
        return false;
      }
    }

    return true;
  };

  // ==========================================
  // 📤 REGISTER HANDLER
  // ==========================================
  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Prepare user data
      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      };

//       // Add role-specific data
//       if (role === 'client') {
//         userData.phone = phone.trim();
//         userData.address = address.trim();
//       } else if (role === 'tradesperson') {
//         userData.trade = trade;
//         userData.areas = [area1.trim(), area2.trim(), area3.trim()].filter(Boolean);
//         userData.phone = phone.trim() || '';
//         userData.address = address.trim() || '';

//     //      if (specialName.trim() && specialPrice) {
//     // userData.specialService = {
//     //   id: `special-${Date.now()}`,
//     //   name: specialName.trim(),
//     //   description: specialDesc.trim(),
//     //   price: Number(specialPrice),
//     // };
    

// if (specialName.trim() && specialPrice) {
//     userData.specialService = {
//       id: `special-${Date.now()}`,
//       name: specialName.trim(),
//       description: specialDesc.trim(),
//       price: Number(specialPrice),
//     };
  


//       }
//     }

//       console.log('📤 Registering user:', userData.email);

//       // Register user
//       const result = await registerUser(userData);

// Add role-specific data
    if (role === 'client') {
      userData.phone = phone.trim();
      userData.address = address.trim();
    } else if (role === 'tradesperson') {
      userData.trade = trade;
      userData.areas = [area1.trim(), area2.trim(), area3.trim()].filter(Boolean);
      userData.phone = phone.trim() || '';
      userData.address = address.trim() || '';

      
    }

    console.log('📤 Registering user:', userData.email);

    // Register user
    const result = await registerUser(userData);

  
    if (result.success && role === 'tradesperson' && specialName.trim() && specialPrice) {
      const specialServiceData = {
        id: `special-${result.profile.id}`,  
        name: specialName.trim(),
        description: specialDesc.trim(),
        price: Number(specialPrice),
      };

      // حفظ الخدمة المميزة في Firebase تحت الفني
      await update(ref(database, `Tradespeople/${result.profile.id}`), {
        specialService: specialServiceData,
      });
    }

      if (result.success) {
        // Save to Redux
        dispatch(
          loginSuccess({
            user: result.profile,
            role: result.role,
          })
        );

        Alert.alert('نجاح', 'تم إنشاء الحساب بنجاح', [
          {
            text: 'موافق',
            onPress: () => {
              // Navigation will be handled automatically by MainNavigator
              // based on the role in Redux
            },
          },
        ]);
      } else {
        Alert.alert('خطأ', result.message || 'فشل في التسجيل');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);

      let errorMessage = 'حدث خطأ أثناء التسجيل';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'البريد الإلكتروني مسجل مسبقاً';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صالح';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'كلمة المرور ضعيفة';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('خطأ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🎨 UI
  // ==========================================
  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View className="px-6 py-8">
        {/* Header */}
        <View className="items-center mb-8">
          <Ionicons name="person-add" size={60} color="#4f46e5" />
          <Text className="text-3xl font-bold text-gray-800 mt-4">
            إنشاء حساب جديد
          </Text>
          <Text className="text-gray-500 mt-2">انضم إلينا وابدأ رحلتك</Text>
        </View>

        {/* Role Selection */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-3 text-center">
            نوع الحساب *
          </Text>
          <View className="flex-row justify-center gap-3">
            {[
              { key: 'client', label: 'عميل', icon: 'person-outline' },
              { key: 'tradesperson', label: 'فني', icon: 'construct-outline' },
            ].map((r) => (
              <TouchableOpacity
                key={r.key}
                onPress={() => !loading && setRole(r.key)}
                className={`px-6 py-3 rounded-xl flex-row items-center gap-2 flex-1 ${
                  role === r.key
                    ? 'bg-primary border-2 border-primary'
                    : 'bg-gray-100 border-2 border-gray-200'
                }`}
                disabled={loading}
              >
                <Ionicons
                  name={r.icon}
                  size={20}
                  color={role === r.key ? '#ffffff' : '#6b7280'}
                />
                <Text
                  className={`font-semibold ${
                    role === r.key ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Common Fields */}
        <View className="space-y-4">
          {/* Name */}
          <View>
            <Text className="text-gray-700 font-semibold mb-2">
              الاسم الكامل *
            </Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <Ionicons name="person-outline" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 mr-2 text-gray-700 text-right"
                placeholder="أدخل اسمك الكامل"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>
          </View>

          {/* Email */}
          <View>
            <Text className="text-gray-700 font-semibold mb-2">
              البريد الإلكتروني *
            </Text>
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

          {/* Password */}
          <View>
            <Text className="text-gray-700 font-semibold mb-2">
              كلمة المرور *
            </Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 mr-2 text-gray-700 text-right"
                placeholder="******"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
            <Text className="text-gray-400 text-xs mt-1">
              6 أحرف على الأقل
            </Text>
          </View>

          {/* Confirm Password */}
          <View>
            <Text className="text-gray-700 font-semibold mb-2">
              تأكيد كلمة المرور *
            </Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 mr-2 text-gray-700 text-right"
                placeholder="******"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>
        </View>

        {/* Client Fields */}
        {role === 'client' && (
          <View className="border-t border-gray-200 pt-6 mt-6">
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
              معلومات العميل
            </Text>

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                رقم الهاتف *
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="call-outline" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 mr-2 text-gray-700 text-right"
                  placeholder="05XXXXXXXX"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Address */}
            <View>
              <Text className="text-gray-700 font-semibold mb-2">
                العنوان *
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="location-outline" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 mr-2 text-gray-700 text-right"
                  placeholder="أدخل عنوانك"
                  value={address}
                  onChangeText={setAddress}
                  editable={!loading}
                />
              </View>
            </View>
          </View>
        )}

        {/* Tradesperson Fields */}
        {role === 'tradesperson' && (
          <View className="border-t border-gray-200 pt-6 mt-6">
            <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
              معلومات الفني
            </Text>

            {/* Trade */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                التخصص *
              </Text>
              <View className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <Picker
                  selectedValue={trade}
                  onValueChange={setTrade}
                  enabled={!loading}
                  style={{ color: '#374151' }}
                >
                  <Picker.Item label="اختر التخصص" value="" />
                  <Picker.Item label="سباك" value="plumber" />
                  <Picker.Item label="كهربائي" value="electrician" />
                  <Picker.Item label="نجار" value="carpenter" />   
                </Picker>
              </View>
            </View>

            {/* Areas */}
            <View>
              <Text className="text-gray-700 font-semibold mb-2">
                المناطق *
              </Text>
              {/* Area 1 */}
              <View className="mb-3">
                <Text className="text-gray-600 text-sm mb-1">
                  المنطقة الأولى
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <Ionicons name="location-outline" size={20} color="#6b7280" />
                  <TextInput
                    className="flex-1 mr-2 text-gray-700 text-right"
                    placeholder="المنطقة الرئيسية للعمل"
                    value={area1}
                    onChangeText={setArea1}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Area 2 */}
              <View className="mb-3">
                <Text className="text-gray-600 text-sm mb-1">
                  المنطقة الثانية (اختياري)
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <Ionicons name="location-outline" size={20} color="#6b7280" />
                  <TextInput
                    className="flex-1 mr-2 text-gray-700 text-right"
                    placeholder="منطقة إضافية"
                    value={area2}
                    onChangeText={setArea2}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Area 3 */}
              <View>
                <Text className="text-gray-600 text-sm mb-1">
                  المنطقة الثالثة (اختياري)
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <Ionicons name="location-outline" size={20} color="#6b7280" />
                  <TextInput
                    className="flex-1 mr-2 text-gray-700 text-right"
                    placeholder="منطقة إضافية"
                    value={area3}
                    onChangeText={setArea3}
                    editable={!loading}
                  />
                </View>
              </View>
            </View>


  <View className="border-t border-gray-200 pt-6 mt-6">
    <Text className="text-gray-700 font-semibold mb-2">
      خدمة مميزة (اختياري)
    </Text>
    <Text className="text-gray-500 text-sm mb-4">
      أضف خدمة خاصة بك
    </Text>

    {/* Service Name */}
    <View className="mb-3">
      <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
        <Ionicons name="construct-outline" size={20} color="#6b7280" />
        <TextInput
          className="flex-1 mr-2 text-gray-700 text-right"
          placeholder="اسم الخدمة"
          value={specialName}
          onChangeText={setSpecialName}
          editable={!loading}
        />
      </View>
    </View>

    {/* Description */}
    <View className="mb-3">
      <View className="flex-row items-start bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
        <Ionicons name="document-text-outline" size={20} color="#6b7280" />
        <TextInput
          className="flex-1 mr-2 text-gray-700 text-right"
          placeholder="وصف الخدمة"
          value={specialDesc}
          onChangeText={setSpecialDesc}
          multiline
          numberOfLines={3}
          editable={!loading}
        />
      </View>
    </View>

    {/* Price */}
    <View>
      <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
        <Ionicons name="cash-outline" size={20} color="#6b7280" />
        <TextInput
          className="flex-1 mr-2 text-gray-700 text-right"
          placeholder="السعر (بالجنيه)"
          value={specialPrice}
          onChangeText={setSpecialPrice}
          keyboardType="numeric"
          editable={!loading}
        />
      </View>
    </View>
  </View>
            </View>
        )}

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          className={`mt-8 bg-primary rounded-xl py-4 ${
            loading ? 'opacity-70' : ''
          }`}
        >
          {loading ? (
            <View className="flex-row justify-center items-center">
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="text-white font-bold text-lg mr-2">
                جاري الإنشاء...
              </Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-lg text-center">
              إنشاء الحساب
            </Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
          className="mt-6"
        >
          <Text className="text-center text-gray-600">
            لديك حساب بالفعل؟{' '}
            <Text className="text-primary font-bold">تسجيل الدخول</Text>
          </Text>
        </TouchableOpacity>
      </View>
      
    </ScrollView>
  );
}