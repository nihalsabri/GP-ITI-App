import { configureStore } from '@reduxjs/toolkit';
import orderReducer from './orderSlice';
import appReducer from './appSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    order: orderReducer,
    auth: authReducer,
  },
});
