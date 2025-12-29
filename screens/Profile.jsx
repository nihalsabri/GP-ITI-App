import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../store/appSlice';
import { database } from '../services/firebaseConfig';
import { ref, update } from 'firebase/database';
import { useAuth } from '../hooks/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile({ navigation }) {
  const dispatch = useDispatch();
  const { logout } = useAuth();

  const user = useSelector((state) => state.app.user);
  const role = useSelector((state) => state.app.role);
  const isAuthenticated = useSelector((state) => state.app.isAuthenticated);
  const isLoading = useSelector((state) => state.app.isLoading);

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // حقول قابلة للتعديل - مع قيم افتراضية
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // تحميل البيانات عند تغيير المستخدم
  useEffect(() => {
    
    if (user) {
      // استخدام البيانات من Redux مع قيم افتراضية
      setName(user?.name || user?.displayName || user?.email?.split('@')[0] || 'مستخدم');
      setPhone(user?.phone || '');
      setAddress(user?.address || '');
      setImageUrl(user?.profilePic || user?.imageUrl || '');
      setProfileLoading(false);
    } else {
      // إذا لم يكن هناك مستخدم، إظهار حالة التحميل
      setProfileLoading(false);
    }
  }, [user]);

  /* ================= تسجيل الخروج ================= */
  const handleLogout = async () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'تسجيل الخروج',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('نجاح', 'تم تسجيل الخروج بنجاح');
            } catch (error) {
              console.error(' خطأ في تسجيل الخروج:', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الخروج');
            }
          },
        },
      ]
    );
  };

  /* ================= حفظ الملف الشخصي ================= */
  const handleSaveProfile = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('خطأ', 'الاسم مطلوب');
      return;
    }

    if (!user?.uid) {
      Alert.alert('خطأ', 'لا يوجد مستخدم مسجل');
      return;
    }

    try {
      setSaving(true);

      const path = role === 'client' ? `clients/${user.uid}` : `Tradespeople/${user.uid}`;

      const updatedData = {
        name: trimmedName,
        displayName: trimmedName,
        profilePic: imageUrl.trim() || null,
        updatedAt: new Date().toISOString(),
        ...(role === 'client' && {
          phone: phone.trim() || null,
          address: address.trim() || null,
        }),
      };

      await update(ref(database, path), updatedData);

      // تحديث Redux
      dispatch(updateUser(updatedData));

      setEditOpen(false);
      Alert.alert('نجاح', 'تم تحديث الملف الشخصي بنجاح');
    } catch (err) {
      console.error(' خطأ في تحديث الملف الشخصي:', err);
      Alert.alert('خطأ', 'فشل تحديث الملف الشخصي');
    } finally {
      setSaving(false);
    }
  };

  /* ================= إذا كان التحميل جارياً ================= */
  if (isLoading || profileLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="mt-4 text-gray-600 text-lg">جاري تحميل البيانات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ================= إذا لم يكن هناك مستخدم أو لم يتم المصادقة ================= */
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-gray-100 w-24 h-24 rounded-full items-center justify-center mb-6">
            <Text className="text-4xl text-gray-400">👤</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">
            لم يتم تسجيل الدخول
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            يرجى تسجيل الدخول للوصول إلى الملف الشخصي
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            className="bg-primary px-8 py-4 rounded-xl"
          >
            <Text className="text-white font-bold text-lg">تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ================= الواجهة الرئيسية ================= */
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* العنوان */}
          <Text className="text-3xl font-bold text-gray-800 mb-8 text-center">
            الملف الشخصي
          </Text>

          {/* صورة الملف الشخصي */}
          <View className="items-center mb-8">
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                className="w-32 h-32 rounded-full border-4 border-primary"
                onError={() => setImageUrl('')}
              />
            ) : (
              <View className="w-32 h-32 rounded-full bg-gray-200 border-4 border-gray-300 items-center justify-center">
                <Text className="text-5xl text-gray-400">👤</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => setEditOpen(true)}
              className="mt-4 bg-primary px-6 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">تغيير الصورة</Text>
            </TouchableOpacity>
          </View>

          {/* معلومات الملف الشخصي */}
          <View className="bg-gray-50 rounded-2xl p-6 mb-6">
            <View className="mb-4">
              <Text className="text-gray-500 text-sm mb-1">الاسم</Text>
              <Text className="text-xl font-bold text-gray-800">
                {name || 'غير محدد'}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-gray-500 text-sm mb-1">البريد الإلكتروني</Text>
              <Text className="text-lg text-gray-800">
                {user?.email || 'غير محدد'}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-gray-500 text-sm mb-1">الدور</Text>
              <Text className="text-lg font-semibold text-primary">
                {role === 'client' ? 'عميل' : 'فني'}
              </Text>
            </View>

            {role === 'client' && (
              <>
                <View className="mb-4">
                  <Text className="text-gray-500 text-sm mb-1">رقم الهاتف</Text>
                  <Text className="text-lg text-gray-800">
                    {phone || 'غير محدد'}
                  </Text>
                </View>

                <View>
                  <Text className="text-gray-500 text-sm mb-1">العنوان</Text>
                  <Text className="text-lg text-gray-800">
                    {address || 'غير محدد'}
                  </Text>
                </View>
              </>
            )}

            {role === 'tradesperson' && user?.trade && (
              <View className="mb-4">
                <Text className="text-gray-500 text-sm mb-1">التخصص</Text>
                <Text className="text-lg font-semibold text-gray-800">
                  {user.trade}
                </Text>
              </View>
            )}

            {role === 'tradesperson' && user?.areas?.length > 0 && (
              <View>
                <Text className="text-gray-500 text-sm mb-1">المناطق</Text>
                {user.areas.map((area, index) => (
                  <Text key={index} className="text-lg text-gray-800">
                    • {area}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* أزرار التحكم */}
          <View className="space-y-4">
            <TouchableOpacity
              onPress={() => setEditOpen(true)}
              className="bg-primary py-4 rounded-xl"
            >
              <Text className="text-white text-center font-bold text-lg">
                تعديل الملف الشخصي
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-500 py-4 rounded-xl"
            >
              <Text className="text-white text-center font-bold text-lg">
                تسجيل الخروج
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ================= نافذة التعديل ================= */}
      <Modal visible={editOpen} animationType="slide">
        <SafeAreaView className="flex-1 bg-white">
          <ScrollView className="p-6">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-bold text-gray-800">تعديل الملف الشخصي</Text>
              <TouchableOpacity onPress={() => setEditOpen(false)}>
                <Text className="text-2xl text-gray-500">✕</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 font-semibold mb-2">الاسم الكامل *</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="أدخل اسمك الكامل"
                  className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-300 text-right"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-semibold mb-2">رابط صورة الملف الشخصي</Text>
                <TextInput
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  placeholder="https://example.com/photo.jpg"
                  className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-300 text-right"
                />
              </View>

              {role === 'client' && (
                <>
                  <View>
                    <Text className="text-gray-700 font-semibold mb-2">رقم الهاتف</Text>
                    <TextInput
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="012XXXXXXXX"
                      className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-300 text-right"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 font-semibold mb-2">العنوان</Text>
                    <TextInput
                      value={address}
                      onChangeText={setAddress}
                      placeholder="أدخل عنوانك"
                      className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-300 text-right h-24"
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                </>
              )}
            </View>

            <View className="mt-8 space-y-4">
              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={saving}
                className={`bg-primary py-4 rounded-xl ${saving ? 'opacity-70' : ''}`}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-bold text-lg">
                    حفظ التغييرات
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setEditOpen(false)}
                className="bg-gray-200 py-4 rounded-xl"
              >
                <Text className="text-gray-700 text-center font-bold text-lg">
                  إلغاء
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}