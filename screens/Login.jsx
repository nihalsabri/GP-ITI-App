import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, database } from '../services/firebaseConfig';

import { setAuth } from '../store/authSlice';
import { setUser, setRole, setAuthenticated } from '../store/appSlice';
import { setClient, setTradesperson } from '../store/orderSlice';

export default function Login({ navigation }) {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Missing login data');
      return;
    }

    try {
      setLoading(true);

      const res = await signInWithEmailAndPassword(auth, email.trim(), password);

      const uid = res.user.uid;
      const token = await res.user.getIdToken();

      // 1️⃣ CLIENT
      const clientSnap = await get(ref(database, `clients/${uid}`));
      if (clientSnap.exists()) {
        const profile = clientSnap.val();

        dispatch(setAuth({ token, role: 'client' }));
        dispatch(setUser(profile));
        dispatch(setRole('client'));
        dispatch(setAuthenticated(true));
        dispatch(setClient(profile));

        navigation.reset({
          index: 0,
          routes: [{ name: 'Profile' }],
        });
        return;
      }

      // 2️⃣ TRADESPERSON
      const tradeSnap = await get(ref(database, `Tradespeople/${uid}`));
      if (tradeSnap.exists()) {
        const profile = tradeSnap.val();

        dispatch(setAuth({ token, role: 'tradesperson' }));
        dispatch(setUser(profile));
        dispatch(setRole('tradesperson'));
        dispatch(setAuthenticated(true));
        dispatch(
          setTradesperson({
            id: profile.id,
            name: profile.name,
            trade: profile.trade,
          })
        );

        navigation.reset({
          index: 0,
          routes: [{ name: 'Profile' }],
        });
        return;
      }

      Alert.alert('Error', 'User profile not found');
    } catch (err) {
      console.error('Login error:', err.message);
      Alert.alert('Login failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 14,
          marginBottom: 12,
        }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 14,
          marginBottom: 20,
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: '#4f46e5',
          padding: 16,
          borderRadius: 12,
          opacity: loading ? 0.6 : 1,
        }}>
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 20 }}>
        <Text style={{ textAlign: 'center', color: '#4f46e5' }}>
          Don’t have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}
