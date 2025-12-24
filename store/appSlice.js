import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // بيانات المستخدم أو الصنايعي
  role: null, // "client" | "tradesperson"
  isAuthenticated: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.role = action.payload.role; // client | tradesperson
      state.isAuthenticated = true;
    },

    logout: () => initialState,

    setRole: (state, action) => {
      state.role = action.payload; // client | tradesperson
    },
  },
});

export const { loginSuccess, logout, setRole } = appSlice.actions;

export default appSlice.reducer;
