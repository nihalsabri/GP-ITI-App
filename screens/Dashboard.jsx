import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTechnicianOrders,
  filterByStatus,
  searchOrders,
  updateOrderStatus,
  selectFilteredOrders,
  selectOrdersLoading,
  selectOrdersError,
  selectOrdersStats,
} from '../store/ordersListSlice';
import { Search, Clock, CheckCircle, AlertCircle, Phone, MapPin } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TechnicianDashboard() {
  const dispatch = useDispatch();

  // =============================================
  //  Redux State
  
  const { user, role } = useSelector((state) => state.app);
  const orders = useSelector(selectFilteredOrders);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const stats = useSelector(selectOrdersStats);

  // =============================================
  //  Local State

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // =============================================
  //  Effects

  useEffect(() => {
    if (user && role === 'tradesperson') {
      dispatch(fetchTechnicianOrders());
    }
  }, [dispatch, user, role]);

  // =============================================
  //  Pull to Refresh

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTechnicianOrders());
    setRefreshing(false);
  };

  // =============================================
  //  Search Handler

  const handleSearch = (text) => {
    setSearchQuery(text);
    dispatch(searchOrders(text));
  };

  // =============================================
  //  Filter Handler

  const handleFilterChange = (status) => {
    setActiveFilter(status);
    dispatch(filterByStatus(status));
  };

  // =============================================
  //  Change Order Status

  const handleStatusChange = (orderId, currentStatus) => {
    const statusFlow = {
      pending: 'in-progress',
      'in-progress': 'completed',
      started: 'in-progress',
    };

    const nextStatus = statusFlow[currentStatus];

    if (!nextStatus) {
      Alert.alert('تنبيه', 'لا يمكن تغيير حالة هذا الطلب');
      return;
    }

    const statusText = {
      'in-progress': 'قيد التنفيذ',
      completed: 'مكتمل',
    };

    Alert.alert('تأكيد', `هل تريد تغيير حالة الطلب إلى "${statusText[nextStatus]}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تأكيد',
        onPress: () => {
          dispatch(updateOrderStatus({ orderId, newStatus: nextStatus }));
        },
      },
    ]);
  };

  // =============================================
  //  Status Badge

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();

    let config = {
      text: 'قيد الانتظار',
      bg: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      icon: Clock,
    };

    if (
      statusLower === 'in-progress' ||
      statusLower === 'started' ||
      statusLower === 'قيد التنفيذ'
    ) {
      config = {
        text: 'قيد التنفيذ',
        bg: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: AlertCircle,
      };
    } else if (
      statusLower === 'completed' ||
      statusLower === 'مكتمل' ||
      statusLower === 'finished'
    ) {
      config = {
        text: 'مكتمل',
        bg: 'bg-green-100',
        textColor: 'text-green-800',
        icon: CheckCircle,
      };
    }

    const Icon = config.icon;

    return (
      <View className={`flex-row items-center rounded-full px-3 py-1.5 ${config.bg}`}>
        <Icon
          size={14}
          color={
            config.textColor.includes('yellow')
              ? '#854d0e'
              : config.textColor.includes('blue')
                ? '#1e40af'
                : '#166534'
          }
        />
        <Text className={`${config.textColor} mr-1 text-xs font-semibold`}>{config.text}</Text>
      </View>
    );
  };

  // =============================================
  // 🎨 Order Card

  const renderOrderCard = (order) => {
    //  استخدام orderId (Firebase key) كـ unique ID
    const uniqueId = order.orderId || order.id;
    const displayId = String(order.id || 'N/A');

    return (
      <View
        key={uniqueId}
        className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-md">
        {/* Header */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-800">
            {order.clientName || 'عميل غير معروف'}
          </Text>
          {getStatusBadge(order.status)}
        </View>

        {/* Order ID */}
        <View className="mb-2">
          <Text className="text-xs text-gray-500">رقم الطلب: {displayId}</Text>
        </View>

        {/* Service Type */}
        <View className="mb-3">
          <Text className="mb-1 text-sm font-semibold text-gray-600">نوع الخدمة:</Text>
          <Text className="text-sm text-gray-700">{order.serviceType || 'خدمة غير محددة'}</Text>
        </View>

        {/* Date */}
        {order.date && (
          <View className="mb-3">
            <Text className="mb-1 text-sm font-semibold text-gray-600">التاريخ:</Text>
            <Text className="text-sm text-gray-700">{order.date}</Text>
          </View>
        )}

        {/* Contact Info */}
        <View className="mb-3 rounded-lg bg-gray-50 p-3">
          <View className="mb-2 flex-row items-center">
            <Phone size={16} color="#6b7280" />
            <Text className="mr-2 text-sm text-gray-700">
              {order.phone || order.clientPhone || 'غير متوفر'}
            </Text>
          </View>
          <View className="flex-row items-center">
            <MapPin size={16} color="#6b7280" />
            <Text className="mr-2 text-sm text-gray-700">{order.address || 'غير متوفر'}</Text>
          </View>
        </View>

        {/* Description */}
        {order.description && (
          <View className="mb-3 rounded-lg bg-blue-50 p-3">
            <Text className="mb-1 text-xs font-semibold text-gray-600">الوصف:</Text>
            <Text className="text-sm text-gray-700">{order.description}</Text>
          </View>
        )}

        {/* Notes */}
        {order.notes && (
          <View className="mb-3 rounded-lg bg-blue-50 p-3">
            <Text className="mb-1 text-xs font-semibold text-gray-600">ملاحظات:</Text>
            <Text className="text-sm text-gray-700">{order.notes}</Text>
          </View>
        )}

        {/* Action Button */}
        {order.status !== 'completed' &&
          order.status !== 'مكتمل' &&
          order.status !== 'finished' && (
            <TouchableOpacity
              className="mt-2 rounded-lg bg-[#372b70] py-3"
              onPress={() => handleStatusChange(uniqueId, order.status)}>
              <Text className="text-center font-semibold text-white">
                {order.status === 'pending' || order.status === 'جديد'
                  ? 'بدء التنفيذ'
                  : 'إكمال الطلب'}
              </Text>
            </TouchableOpacity>
          )}

        {/* Completed Badge */}
        {(order.status === 'completed' ||
          order.status === 'مكتمل' ||
          order.status === 'finished') && (
          <View className="mt-2 rounded-lg bg-green-50 p-3">
            <Text className="text-center font-semibold text-green-700">✓ تم إكمال هذا الطلب</Text>
          </View>
        )}

        {/* Created Date */}
        <Text className="mt-2 text-left text-xs text-gray-400">
          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG') : 'غير محدد'}
        </Text>
      </View>
    );
  };

  // =============================================
  //  Empty State
  
  if (!loading && orders.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-[#372b70] px-4 pb-6 pt-12">
          <Text className="text-2xl font-bold text-white">لوحة التحكم</Text>
          <Text className="mt-1 text-sm text-purple-200">
            مرحباً، {user?.name || user?.displayName || 'الفني'}
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={64} color="#9ca3af" />
          <Text className="mt-4 text-center text-lg font-semibold text-gray-600">
            لا توجد طلبات حالياً
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-400">
            سيظهر هنا الطلبات المخصصة لك
          </Text>
          <TouchableOpacity className="mt-6 rounded-lg bg-[#372b70] px-6 py-3" onPress={onRefresh}>
            <Text className="font-semibold text-white">تحديث</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-[#372b70] px-4 pb-6 pt-12">
        <Text className="text-2xl font-bold text-white">لوحة التحكم</Text>
        <Text className="mt-1 text-sm text-purple-200">
          مرحباً، {user?.name || user?.displayName || 'الفني'}
        </Text>

        {/* Stats Cards */}
        <View className="mt-6 flex-row justify-between gap-2">
          <View className="flex-1 rounded-lg bg-white/10 p-3">
            <Text className="text-xs text-white/70">الكل</Text>
            <Text className="text-2xl font-bold text-white">{stats.total}</Text>
          </View>
          <View className="flex-1 rounded-lg bg-yellow-500/20 p-3">
            <Text className="text-xs text-yellow-100">قيد الانتظار</Text>
            <Text className="text-2xl font-bold text-yellow-50">{stats.pending}</Text>
          </View>
          <View className="flex-1 rounded-lg bg-blue-500/20 p-3">
            <Text className="text-xs text-blue-100">قيد التنفيذ</Text>
            <Text className="text-2xl font-bold text-blue-50">{stats.inProgress}</Text>
          </View>
          <View className="flex-1 rounded-lg bg-green-500/20 p-3">
            <Text className="text-xs text-green-100">مكتمل</Text>
            <Text className="text-2xl font-bold text-green-50">{stats.completed}</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View className="border-b border-gray-200 bg-white px-4 py-4">
        <View className="flex-row items-center rounded-lg bg-gray-100 px-3 py-2">
          <Search size={20} color="#6b7280" />
          <TextInput
            className="mr-2 flex-1 text-gray-700"
            placeholder="ابحث عن طلب، عميل، أو عنوان..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white pt-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-2 "
          contentContainerStyle={{ paddingBottom: 8 }}>
          {[
            {
              key: 'all',
              label: 'الكل',
              color: '#6B7280',
              activeColor: '#372b70',
            },
            {
              key: 'pending',
              label: 'قيد الانتظار',
              color: '#F59E0B',
              activeColor: '#D97706',
            },
            {
              key: 'in-progress',
              label: 'قيد التنفيذ',
              color: '#3B82F6',
              activeColor: '#2563EB',
            },
            {
              key: 'completed',
              label: 'مكتمل',
              color: '#10B981',
              activeColor: '#059669',
            },
          ].map((filter) => {
            const isActive = activeFilter === filter.key;

            return (
              <TouchableOpacity
                key={filter.key}
                className={`mx-1 items-center px-5 py-3 ${isActive ? 'border-b-2' : ''}`}
                onPress={() => handleFilterChange(filter.key)}
                style={{
                  borderBottomColor: isActive ? filter.activeColor : 'transparent',
                }}>
                <View className="flex-row items-center">
                  {/* Indicator Dot */}
                  <View
                    className="mr-2 h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: isActive ? filter.activeColor : filter.color,
                      opacity: isActive ? 1 : 0.6,
                    }}
                  />

                  <Text
                    className={`text-sm font-semibold ${isActive ? 'font-bold' : 'font-medium'}`}
                    style={{
                      color: isActive ? filter.activeColor : filter.color,
                      fontSize: isActive ? 15 : 14,
                    }}>
                    {filter.label}
                  </Text>

                  {/* Animated underline for active tab */}
                  {isActive && (
                    <View
                      className="absolute -bottom-1 h-0.5 w-full rounded-full"
                      style={{ backgroundColor: filter.activeColor }}
                    />
                  )}
                </View>

                {/* Subtle count badge */}
                <View
                  className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isActive ? filter.activeColor : '#F3F4F6',
                  }}>
                  <Text className="text-xs font-bold text-white">
                    {filter.key === 'all'
                      ? orders.length
                      : filter.key === 'pending'
                        ? stats.pending
                        : filter.key === 'in-progress'
                          ? stats.inProgress
                          : stats.completed}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        className="flex-1 px-4 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#372b70" />
            <Text className="mt-4 text-gray-500">جاري تحميل الطلبات...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center py-20">
            <AlertCircle size={48} color="#ef4444" />
            <Text className="mt-4 text-center text-red-500">{error}</Text>
            <TouchableOpacity
              className="mt-4 rounded-lg bg-[#372b70] px-6 py-3"
              onPress={onRefresh}>
              <Text className="font-semibold text-white">إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map(renderOrderCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
