import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  role: null, // "client" | "tradesperson"
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.token = action.payload.token;
    },
    logout: () => initialState,
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
