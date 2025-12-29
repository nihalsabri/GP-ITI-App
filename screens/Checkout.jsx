import React, { useState,useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { clearOrder ,setTradesperson, addService } from '../store/orderSlice';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStripe, StripeProvider } from '@stripe/stripe-react-native';
import { ref, set } from 'firebase/database';
import { database } from '../services/firebaseConfig';

const CheckoutForm = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);

  const { services } = useSelector((state) => state.order);
  const total = services.reduce((sum, s) => sum + (s.price || 0), 0);
  const totalInCents = Math.round(total * 100); 

   const user = useSelector((state) => state.app.user);
  const tradesperson = useSelector((state) => state.order.tradesperson);

  const handlePayment = async () => {
    setLoading(true);

    try {

      const response = await fetch('https://gp-iti-website.vercel.app/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalInCents, 
          orderId: 'order-' + Date.now(),
        }),
      });

      const { clientSecret } = await response.json();
      if (!response.ok) throw new Error('Failed to create payment');

      
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'GP-ITI-App',
        allowsDelayedPaymentMethods: true,
      });

      if (initError) {
        Alert.alert('Error', initError.message);
        setLoading(false);
        return;
      }

    
      const { error } = await presentPaymentSheet();
const orderData = {
   id: orderId, 
    clientId: user.uid || user.id,
    clientName: user.name || user.displayName,
    clientPhone: user.phone,
    clientAddress: user.address,
    technicianId: tradesperson.id,
      tradespersonid: tradesperson.id, 
    technicianName: tradesperson.name,
     services: services,
  serviceType: services.map(s => s.name).join(', '), 

    total: total,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  const orderId = Date.now();

      if (error) {
        Alert.alert('Payment Failed', error.message);
      } else {
      
        await set(ref(database, `orders/${orderId}`), orderData);
        await set(ref(database, `Tradespeople/${tradesperson.id}/orders/${orderId}`), orderData);

        Alert.alert('Success', 'Payment successful!');
        dispatch(clearOrder());
        await AsyncStorage.removeItem('currentOrder');
        navigation.navigate('Home');
      }
       
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
     

      <TouchableOpacity
        onPress={handlePayment}
        disabled={loading}
        style={[styles.button, loading && styles.buttonDisabled]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Pay {total} EGP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const CheckoutScreen = () => {
const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

const order = useSelector((state) => state.order);
const services = order?.services || [];
const tradesperson = order?.tradesperson || { name: 'Loading...' };


  useEffect(() => {
    const loadSavedOrder = async () => {
      try {
        const saved = await AsyncStorage.getItem('currentOrder');
        if (saved) {
          const order = JSON.parse(saved);
          if (order.tradesperson) {
            dispatch(setTradesperson(order.tradesperson));
          }
          if (order.services && order.services.length > 0) {
            order.services.forEach((service) => dispatch(addService(service)));
          }
        }
      } catch (error) {
        console.log('Failed to load saved order', error);
      }
    };

    loadSavedOrder();
  }, [dispatch]);
   if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#372B70" />
      </View>
    );
  }
  if (services.length === 0) {
  return (
    <View style={styles.center}>
      <Text>No services selected</Text>
    </View>
  );
}
  
  const total = services.reduce((sum, s) => sum + (s.price || 0), 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.orderSummary}>
        <Text style={styles.title}>Order Summary</Text>
        <Text style={styles.tradespersonName}>{tradesperson.name}</Text>

        {services.map((s) => (
          <View key={s.id} style={styles.serviceRow}>
            <Text>{s.name}</Text>
            <Text>{s.price} EGP</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{total} EGP</Text>
        </View>
      </View>

      {/* Stripe Provider */}
      <StripeProvider publishableKey="pk_test_51ShLlXQ8ZGyN4bjshA3QIVvPVm9OdjZesEoWn3LCi4oNsHZrumC7nX8yrMpqB5ivPRtf90wOJVOBR6dkjG9fQGQ1003rZ0iLG4">
        <CheckoutForm />
      </StripeProvider>
    </ScrollView>
  );
};

export default CheckoutScreen;

// =================== STYLES ===================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderSummary: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  tradespersonName: {
    fontWeight: '600',
    marginBottom: 12,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontWeight: '700',
  },
  totalAmount: {
    fontWeight: '700',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardField: {
    height: 50,
    marginBottom: 12,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#372B70',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});