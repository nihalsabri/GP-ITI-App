import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  client: null, // المستخدم اللي عمل الطلب
  tradesperson: null, // الصنايعي
  services: [], // الخدمات المختارة
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // =====================
    // CLIENT

    setClient: (state, action) => {
      state.client = action.payload;
    },

    // =====================
    // TRADESPERSON

    setTradesperson: (state, action) => {
      const incoming = action.payload;

      // لو المستخدم اختار صنايعي مختلف → نمسح الخدمات
      if (state.tradesperson && state.tradesperson.id !== incoming.id) {
        state.services = [];
      }

      state.tradesperson = incoming;
    },

    // =====================
    // SERVICES

    addService: (state, action) => {
      const exists = state.services.find((s) => s.id === action.payload.id);

      if (!exists) {
        state.services.push({
          ...action.payload,
          addedAt: new Date().toISOString(),
        });
      }
    },

    removeService: (state, action) => {
      state.services = state.services.filter((s) => s.id !== action.payload);
    },

    // =====================
    // CLEAR ORDER

    clearOrder: () => initialState,
  },
});

export const { setClient, setTradesperson, addService, removeService, clearOrder } =
  orderSlice.actions;

export default orderSlice.reducer;
