import { configureStore } from '@reduxjs/toolkit';
import appReducer from './appSlice';
import ordersListReducer from './ordersListSlice';
import orderReducer from './orderSlice';
export const store = configureStore({
  reducer: {
    app: appReducer,
    ordersList: ordersListReducer,
       order: orderReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Important for Firebase timestamps
    }),
});

export default store;