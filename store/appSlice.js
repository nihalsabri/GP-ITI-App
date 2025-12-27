import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // بيانات المستخدم (client أو tradesperson)
  role: null, // "client" | "tradesperson"
  isAuthenticated: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // يستخدم عند تسجيل الدخول
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    },

    // 👈 مهم جدًا (عشان Login.jsx)
    setUser: (state, action) => {
      state.user = action.payload;
    },

    setRole: (state, action) => {
      state.role = action.payload;
    },

    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },

    logout: () => initialState,
  },
});

export const { loginSuccess, setUser, setRole, setAuthenticated, logout } = appSlice.actions;

export default appSlice.reducer;
