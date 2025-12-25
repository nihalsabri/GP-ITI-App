import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/appSlice';
import { clearOrder } from '../store/orderSlice';
import { setAuth } from '../store/authSlice';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

export default function Profile({ navigation }) {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.app.user);
  const role = useSelector((state) => state.app.role);

  /* ================= SAFE GUARD ================= */
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    await signOut(auth);

    dispatch(logout());
    dispatch(clearOrder());
    dispatch(setAuth({ token: null, role: null }));

    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  /* ================= UI ================= */
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>Profile</Text>

      {/* PROFILE IMAGE */}
      {user.imageUrl || user.profilePic ? (
        <Image
          source={{ uri: user.imageUrl || user.profilePic }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 16,
            alignSelf: 'center',
          }}
        />
      ) : null}

      {/* COMMON INFO */}
      <Text style={{ fontSize: 16, marginBottom: 6 }}>Name: {user.name || '—'}</Text>

      <Text style={{ fontSize: 16, marginBottom: 6 }}>Email: {user.email || '—'}</Text>

      <Text style={{ fontSize: 16, marginBottom: 6 }}>Role: {role}</Text>

      {/* ================= CLIENT ================= */}
      {role === 'client' && (
        <>
          <Text style={{ fontSize: 16, marginBottom: 6 }}>Phone: {user.phone || '—'}</Text>

          <Text style={{ fontSize: 16, marginBottom: 6 }}>Address: {user.address || '—'}</Text>
        </>
      )}

      {/* ================= TRADESPERSON ================= */}
      {role === 'tradesperson' && (
        <>
          <Text style={{ fontSize: 16, marginBottom: 6 }}>Trade: {user.trade || '—'}</Text>

          <Text style={{ fontSize: 16, marginBottom: 6 }}>
            Experience: {user.experience ? `${user.experience} years` : '—'}
          </Text>

          <Text style={{ fontSize: 16, marginBottom: 6 }}>Rating: {user.rating ?? '—'}</Text>

          {/* AREAS */}
          {Array.isArray(user.areas) && user.areas.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                Areas served:
              </Text>
              {user.areas.map((area, index) => (
                <Text key={index} style={{ fontSize: 14 }}>
                  • {area}
                </Text>
              ))}
            </View>
          )}

          {/* SPECIAL SERVICE */}
          {user.specialService && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                Special Service:
              </Text>
              <Text>Name: {user.specialService.name}</Text>
              <Text>Description: {user.specialService.description}</Text>
              <Text>Price: {user.specialService.price} EGP</Text>
            </View>
          )}
        </>
      )}

      {/* LOGOUT */}
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          marginTop: 30,
          backgroundColor: '#ef4444',
          padding: 16,
          borderRadius: 12,
        }}>
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
