import { configureStore } from '@reduxjs/toolkit';
import orderReducer from './orderSlice';
import appReducer from './appSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    order: orderReducer,
  },
});
