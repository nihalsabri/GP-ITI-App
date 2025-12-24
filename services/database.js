// context/database.js
import { db } from './firebaseConfig';
import { ref, get, push, update, remove } from 'firebase/database';

/* ================= CREATE ORDER ================= */
export const createOrder = async (orderData) => {
  const orderRef = ref(db, 'orders');
  const newOrder = await push(orderRef, {
    ...orderData,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  return newOrder.key;
};

/* ================= GET ALL ORDERS ================= */
export const getAllOrders = async () => {
  const snap = await get(ref(db, 'orders'));
  if (!snap.exists()) return [];

  return Object.entries(snap.val()).map(([id, order]) => ({
    id,
    ...order,
  }));
};

/* ================= GET ORDERS BY USER ================= */
export const getOrdersByClient = async (clientId) => {
  const snap = await get(ref(db, 'orders'));
  if (!snap.exists()) return [];

  return Object.entries(snap.val())
    .map(([id, order]) => ({ id, ...order }))
    .filter((order) => order.clientId === clientId);
};

/* ================= GET ORDERS BY TRADESPERSON ================= */
export const getOrdersByTradesperson = async (tradespersonId) => {
  const snap = await get(ref(db, 'orders'));
  if (!snap.exists()) return [];

  return Object.entries(snap.val())
    .map(([id, order]) => ({ id, ...order }))
    .filter((order) => order.tradespersonId === tradespersonId);
};

/* ================= UPDATE ORDER ================= */
export const updateOrder = async (orderId, data) => {
  await update(ref(db, `orders/${orderId}`), data);
};

/* ================= CANCEL ORDER ================= */
export const cancelOrder = async (orderId) => {
  await update(ref(db, `orders/${orderId}`), {
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
  });
};

/* ================= DELETE ORDER ================= */
export const deleteOrder = async (orderId) => {
  await remove(ref(db, `orders/${orderId}`));
};

/* ================= COMPLETE ORDER ================= */
export const completeOrder = async (orderId) => {
  await update(ref(db, `orders/${orderId}`), {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
};
