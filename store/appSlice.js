import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // ==========================================
    // تسجيل دخول ناجح

    loginSuccess: (state, action) => {
      state.user = action.payload.user || null;
      state.role = action.payload.role || 'client';
      state.isAuthenticated = true;
      state.isLoading = false;
      
    },

    // ==========================================
    // تحديث بيانات المستخدم

    setUser: (state, action) => {
      state.user = action.payload || null;
      state.isLoading = false;
    },

    // ==========================================
    // تحديث الدور

    setRole: (state, action) => {
      state.role = action.payload;
    },

    // ==========================================
    // تحديث حالة المصادقة

    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },

    // ==========================================
    // تحديث حالة التحميل

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // ==========================================
    // تسجيل خروج

    logout: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      
    },

    // ==========================================
    // تحديث جزئي لبيانات المستخدم

    updateUser: (state, action) => {
      if (state.user && action.payload) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
  },
});

export const {
  loginSuccess,
  setUser,
  setRole,
  setAuthenticated,
  setLoading,
  logout,
  updateUser,
} = appSlice.actions;

export default appSlice.reducer;