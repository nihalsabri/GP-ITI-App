import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { registerUser } from '../services/auth';

export default function Register({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [loading, setLoading] = useState(false);

  /* ---------- Client fields ---------- */
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  /* ---------- Tradesperson fields ---------- */
  const [trade, setTrade] = useState('');
  const [area1, setArea1] = useState('');
  const [area2, setArea2] = useState('');
  const [area3, setArea3] = useState('');

  const [specialName, setSpecialName] = useState('');
  const [specialDesc, setSpecialDesc] = useState('');
  const [specialPrice, setSpecialPrice] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (role === 'client' && (!phone || !address)) {
      Alert.alert('Error', 'Phone and address are required');
      return;
    }

    if (role === 'tradesperson' && (!trade || !area1)) {
      Alert.alert('Error', 'Trade and at least one area are required');
      return;
    }

    try {
      setLoading(true);

      const profileData =
        role === 'client'
          ? {
              name,
              phone,
              address,
            }
          : {
              name,
              trade,
              areas: [area1, area2, area3].filter(Boolean),
              ...(specialName && specialPrice
                ? {
                    specialService: {
                      id: `special-${Date.now()}`,
                      name: specialName,
                      description: specialDesc,
                      price: Number(specialPrice),
                    },
                  }
                : {}),
            };

      await registerUser({
        email,
        password,
        role,
        profileData,
      });

      Alert.alert('Success', 'Account created successfully');
      navigation.replace('Login');
    } catch (err) {
      Alert.alert('Error', err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 24, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 }}>
        Register
      </Text>

      {/* ---------- Common ---------- */}
      <TextInput placeholder="Full name" value={name} onChangeText={setName} style={inputStyle} />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={inputStyle}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={inputStyle}
      />

      {/* ---------- Role selector ---------- */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
        {['client', 'tradesperson'].map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRole(r)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 20,
              marginHorizontal: 6,
              backgroundColor: role === r ? '#4f46e5' : '#e5e7eb',
            }}>
            <Text style={{ color: role === r ? '#fff' : '#000', fontWeight: '600' }}>
              {r === 'client' ? 'Client' : 'Tradesperson'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ---------- Client fields ---------- */}
      {role === 'client' && (
        <>
          <TextInput
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={inputStyle}
          />
          <TextInput
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
            style={inputStyle}
          />
        </>
      )}

      {/* ---------- Tradesperson fields ---------- */}
      {role === 'tradesperson' && (
        <>
          <Text style={labelStyle}>Trade</Text>
          <View style={pickerWrapper}>
            <Picker selectedValue={trade} onValueChange={setTrade}>
              <Picker.Item label="Select trade" value="" />
              <Picker.Item label="Plumber" value="plumber" />
              <Picker.Item label="Electric Technician" value="electric technician" />
              <Picker.Item label="Carpenter" value="carpenter" />
            </Picker>
          </View>

          <Text style={labelStyle}>Areas</Text>
          <TextInput
            placeholder="Area 1 (required)"
            value={area1}
            onChangeText={setArea1}
            style={inputStyle}
          />
          <TextInput
            placeholder="Area 2 (optional)"
            value={area2}
            onChangeText={setArea2}
            style={inputStyle}
          />
          <TextInput
            placeholder="Area 3 (optional)"
            value={area3}
            onChangeText={setArea3}
            style={inputStyle}
          />

          <Text style={labelStyle}>Special Service (optional)</Text>
          <TextInput
            placeholder="Service name"
            value={specialName}
            onChangeText={setSpecialName}
            style={inputStyle}
          />
          <TextInput
            placeholder="Description"
            value={specialDesc}
            onChangeText={setSpecialDesc}
            style={inputStyle}
          />
          <TextInput
            placeholder="Price"
            value={specialPrice}
            onChangeText={setSpecialPrice}
            keyboardType="numeric"
            style={inputStyle}
          />
        </>
      )}

      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading}
        style={{
          backgroundColor: '#4f46e5',
          padding: 16,
          borderRadius: 14,
          marginTop: 10,
          opacity: loading ? 0.6 : 1,
        }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
          {loading ? 'Creating...' : 'Create Account'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }}>
        <Text style={{ textAlign: 'center', color: '#4f46e5' }}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------- styles ---------- */
const inputStyle = {
  borderWidth: 1,
  borderColor: '#d1d5db',
  borderRadius: 12,
  padding: 14,
  marginBottom: 12,
};

const labelStyle = {
  fontWeight: '600',
  marginBottom: 6,
  marginTop: 10,
};

const pickerWrapper = {
  borderWidth: 1,
  borderColor: '#d1d5db',
  borderRadius: 12,
  marginBottom: 12,
  overflow: 'hidden',
};
