import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ref, get, update } from 'firebase/database';
import { database } from '../services/firebaseConfig';

// =============================================
//  ASYNC THUNK - جلب طلبات الفني
export const fetchTechnicianOrders = createAsyncThunk(
  'ordersList/fetchTechnicianOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      
      // جلب userId من app slice
      const tradespersonId = state.app.user?.uid || state.app.user?.id;

      if (!tradespersonId) {
        return [];
      }


      // جلب كل الطلبات من Firebase
      const ordersRef = ref(database, 'orders');
      const snapshot = await get(ordersRef);

      if (!snapshot.exists()) {
        return [];
      }

      const allOrders = snapshot.val();

      // تحويل البيانات لـ Array وفلترة طلبات الفني فقط
      const technicianOrders = Object.entries(allOrders)
        .map(([firebaseKey, order]) => {
          //  استخدام Firebase key كـ orderId رئيسي
          const processedOrder = {
            //  orderId هو المفتاح الأساسي من Firebase (نص فريد)
            orderId: firebaseKey,
            internalId: order.id ? String(order.id) : firebaseKey,
            ...order,
            tradespersonid: order.tradespersonid || order.tradespersonId || '',
            status: order.status || '',
            serviceType: order.serviceType || '',
            date: order.date || '',
            createdAt: order.createdAt || '',
          };

          //  إذا كان clientId موجوداً، تأكده من أنه نص
          if (order.clientId) {
            processedOrder.clientId = String(order.clientId);
          }

          return processedOrder;
        })
     .filter((order) => {
  const isMatch = (order.tradespersonid === tradespersonId) || 
                  (order.technicianId === tradespersonId); 
  return isMatch;
});

      return technicianOrders;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// =============================================
//  تحديث حالة طلب في Firebase

export const updateOrderStatus = createAsyncThunk(
  'ordersList/updateOrderStatus',
  async ({ orderId, newStatus }, { rejectWithValue }) => {
    try {
      const updateData = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      if (newStatus === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }

      // تحديث مباشر في Firebase
      const orderRef = ref(database, `orders/${orderId}`);
      await update(orderRef, updateData);

      return { orderId, newStatus };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// =============================================
//  SLICE

const ordersListSlice = createSlice({
  name: 'ordersList',
  initialState: {
    orders: [],
    filteredOrders: [],
    loading: false,
    error: null,
    lastFetch: null,
    statusUpdateLoading: {},
  },
  reducers: {

    // =====================
    // فلترة الطلبات حسب الحالة
    filterByStatus: (state, action) => {
      const status = action.payload;
      
      if (status === 'all') {
        state.filteredOrders = state.orders;
      } else {
        state.filteredOrders = state.orders.filter((order) => {
          const orderStatus = order.status?.toLowerCase();
          
          // Map different status formats
          if (status === 'pending') {
            return orderStatus === 'pending' || orderStatus === 'جديد';
          } else if (status === 'in-progress') {
            return orderStatus === 'in-progress' || 
                   orderStatus === 'قيد التنفيذ' || 
                   orderStatus === 'started' ||
                   orderStatus === 'بدأ';
          } else if (status === 'completed') {
            return orderStatus === 'completed' || 
                   orderStatus === 'مكتمل' || 
                   orderStatus === 'finished' ||
                   orderStatus === 'أنتهى';
          }
          
          return orderStatus === status;
        });
      }
    },


    // =====================
    // بحث في الطلبات - مُحدث باستخدام orderId
    searchOrders: (state, action) => {
      const searchTerm = action.payload.toLowerCase();
      
      if (!searchTerm) {
        state.filteredOrders = state.orders;
        return;
      }

      state.filteredOrders = state.orders.filter((order) => {
        const clientName = order.clientName?.toLowerCase() || '';
        
        //  استخدام orderId بدلاً من id (مضمون أنه نص)
        const orderId = (order.orderId || '').toLowerCase();
        
        //  استخراج internalId كنص احتياطي
        const internalId = order.internalId ? String(order.internalId).toLowerCase() : '';
        
        const address = order.address?.toLowerCase() || '';
        const phone = order.phone?.toLowerCase() || order.clientPhone?.toLowerCase() || '';
        const serviceType = order.serviceType?.toLowerCase() || '';
        
        return (
          clientName.includes(searchTerm) ||
          orderId.includes(searchTerm) || // ✅ orderId مضمون كـ string
          internalId.includes(searchTerm) || // ✅ internalId كمُعرف احتياطي
          address.includes(searchTerm) ||
          phone.includes(searchTerm) ||
          serviceType.includes(searchTerm)
        );
      });
    },

    // =====================
    // مسح الطلبات
    // =====================
    clearOrders: (state) => {
      state.orders = [];
      state.filteredOrders = [];
      state.error = null;
      state.lastFetch = null;
    },

    // =====================
    // إعادة تحميل الطلبات المحلية
    // =====================
    refreshLocalOrders: (state) => {
      state.filteredOrders = [...state.orders];
    },
  },
  extraReducers: (builder) => {
    builder
      // =====================
      // FETCH ORDERS - PENDING
      // =====================
      .addCase(fetchTechnicianOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      // =====================
      // FETCH ORDERS - FULFILLED
      // =====================
      .addCase(fetchTechnicianOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.filteredOrders = action.payload;
        state.lastFetch = new Date().toISOString();
        state.error = null;
      })
      
      // =====================
      // FETCH ORDERS - REJECTED
      // =====================
      .addCase(fetchTechnicianOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch orders';
      })

      // =====================
      // UPDATE STATUS - PENDING
      
      .addCase(updateOrderStatus.pending, (state, action) => {
        const orderId = action.meta.arg.orderId;
        state.statusUpdateLoading[orderId] = true;
      })

      // =====================
      // UPDATE STATUS - FULFILLED
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { orderId, newStatus } = action.payload;
        
        // تحديث في orders
        const order = state.orders.find((o) => o.orderId === orderId);
        if (order) {
          order.status = newStatus;
          order.updatedAt = new Date().toISOString();
          
          if (newStatus === 'completed') {
            order.completedAt = new Date().toISOString();
          }
        }

        // تحديث في filteredOrders
        const filteredOrder = state.filteredOrders.find((o) => o.orderId === orderId);
        if (filteredOrder) {
          filteredOrder.status = newStatus;
          filteredOrder.updatedAt = new Date().toISOString();
          
          if (newStatus === 'completed') {
            filteredOrder.completedAt = new Date().toISOString();
          }
        }

        state.statusUpdateLoading[orderId] = false;
      })

      // =====================
      // UPDATE STATUS - REJECTED
      
      .addCase(updateOrderStatus.rejected, (state, action) => {
        const orderId = action.meta.arg.orderId;
        state.statusUpdateLoading[orderId] = false;
        state.error = action.payload || 'Failed to update order status';
      });
  },
});

export const {
  filterByStatus,
  searchOrders,
  clearOrders,
  refreshLocalOrders,
} = ordersListSlice.actions;

export default ordersListSlice.reducer;



//  SELECTORS
export const selectAllOrders = (state) => state.ordersList.orders;
export const selectFilteredOrders = (state) => state.ordersList.filteredOrders;
export const selectOrdersLoading = (state) => state.ordersList.loading;
export const selectOrdersError = (state) => state.ordersList.error;
export const selectOrdersCount = (state) => state.ordersList.orders.length;
export const selectStatusUpdateLoading = (state) => state.ordersList.statusUpdateLoading;

// إحصائيات الطلبات
export const selectOrdersStats = (state) => {
  const orders = state.ordersList.orders;
  
  const stats = {
    total: orders.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
  };

  orders.forEach((order) => {
    const status = order.status?.toLowerCase();
    
    if (status === 'pending' || status === 'جديد') {
      stats.pending++;
    } else if (status === 'in-progress' || status === 'قيد التنفيذ' || status === 'started' || status === 'بدأ') {
      stats.inProgress++;
    } else if (status === 'completed' || status === 'مكتمل' || status === 'finished' || status === 'أنتهى') {
      stats.completed++;
    }
  });

  return stats;
};



//  الحصول على معرف الطلب بأمان (orderId أولاً، ثم internalId)
export const getSafeOrderId = (order) => {
  if (!order) return '';
  
  // orderId هو المفتاح الأساسي من Firebase (مضمون كنص)
  if (order.orderId && typeof order.orderId === 'string') {
    return order.orderId;
  }
  
  // استخدام internalId كاحتياطي (مُحوّل لنص)
  if (order.internalId) {
    return String(order.internalId);
  }
  
  // استخدام id الداخلي كملاذ أخير
  if (order.id) {
    return String(order.id);
  }
  
  return '';
};

//  الحصول على معرّف قصير للعرض
export const getShortOrderId = (order, length = 8) => {
  const safeId = getSafeOrderId(order);
  return safeId.substring(0, Math.min(length, safeId.length));
};

//  التحقق من وجود طلب
export const isValidOrder = (order) => {
  return order && order.orderId && typeof order.orderId === 'string';
};

//  تصنيف الطلبات حسب الحالة
export const groupOrdersByStatus = (orders) => {
  const grouped = {
    pending: [],
    inProgress: [],
    completed: [],
    all: orders,
  };

  orders.forEach((order) => {
    const status = order.status?.toLowerCase();
    
    if (status === 'pending' || status === 'جديد') {
      grouped.pending.push(order);
    } else if (status === 'in-progress' || status === 'قيد التنفيذ' || status === 'started' || status === 'بدأ') {
      grouped.inProgress.push(order);
    } else if (status === 'completed' || status === 'مكتمل' || status === 'finished' || status === 'أنتهى') {
      grouped.completed.push(order);
    }
  });

  return grouped;
};