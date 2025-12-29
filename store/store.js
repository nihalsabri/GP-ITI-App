import { configureStore } from '@reduxjs/toolkit';
import appReducer from './appSlice';
import ordersListReducer from './ordersListSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    ordersList: ordersListReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Important for Firebase timestamps
    }),
});

export default store;