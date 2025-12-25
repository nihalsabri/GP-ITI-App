import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setUser } from '../store/appSlice';
import { clearOrder } from '../store/orderSlice';
import { setAuth } from '../store/authSlice';
import { signOut } from 'firebase/auth';
import { auth, database } from '../services/firebaseConfig';
import { ref, update } from 'firebase/database';

export default function Profile({ navigation }) {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.app.user);
  const role = useSelector((state) => state.app.role);

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ---------- editable fields ---------- */
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [imageUrl, setImageUrl] = useState(user?.imageUrl || user?.profilePic || '');

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

  /* ================= SAVE PROFILE ================= */
  const handleSaveProfile = async () => {
    if (!name) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      setSaving(true);

      const path = role === 'client' ? `clients/${user.id}` : `Tradespeople/${user.id}`;

      const updatedData =
        role === 'client'
          ? {
              name,
              phone,
              address,
              profilePic: imageUrl,
            }
          : {
              name,
              profilePic: imageUrl,
            };

      await update(ref(database, path), updatedData);

      // update redux
      dispatch(
        setUser({
          ...user,
          ...updatedData,
        })
      );

      setEditOpen(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>Profile</Text>

        {/* IMAGE */}
        {user.profilePic || user.imageUrl ? (
          <Image
            source={{ uri: user.profilePic || user.imageUrl }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              marginBottom: 16,
              alignSelf: 'center',
            }}
          />
        ) : null}

        <Text>Name: {user.name || '—'}</Text>
        <Text>Email: {user.email}</Text>
        <Text>Role: {role}</Text>

        {role === 'client' && (
          <>
            <Text>Phone: {user.phone || '—'}</Text>
            <Text>Address: {user.address || '—'}</Text>
          </>
        )}

        {role === 'tradesperson' && (
          <>
            <Text>Trade: {user.trade || '—'}</Text>
            {Array.isArray(user.areas) && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontWeight: '600' }}>Areas:</Text>
                {user.areas.map((a, i) => (
                  <Text key={i}>• {a}</Text>
                ))}
              </View>
            )}
          </>
        )}

        {/* EDIT BUTTON */}
        <TouchableOpacity
          onPress={() => setEditOpen(true)}
          style={{
            marginTop: 20,
            backgroundColor: '#4f46e5',
            padding: 14,
            borderRadius: 12,
          }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>Edit Profile</Text>
        </TouchableOpacity>

        {/* LOGOUT */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            marginTop: 20,
            backgroundColor: '#ef4444',
            padding: 16,
            borderRadius: 12,
          }}>
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ================= EDIT MODAL ================= */}
      <Modal visible={editOpen} animationType="slide">
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 20 }}>Edit Profile</Text>

          <TextInput value={name} onChangeText={setName} placeholder="Name" style={inputStyle} />

          <TextInput
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="Profile image URL"
            style={inputStyle}
          />

          {role === 'client' && (
            <>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone"
                style={inputStyle}
              />
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Address"
                style={inputStyle}
              />
            </>
          )}

          <TouchableOpacity
            onPress={handleSaveProfile}
            disabled={saving}
            style={{
              backgroundColor: '#4f46e5',
              padding: 16,
              borderRadius: 12,
              marginTop: 10,
              opacity: saving ? 0.6 : 1,
            }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setEditOpen(false)} style={{ marginTop: 16 }}>
            <Text style={{ textAlign: 'center', color: '#ef4444' }}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </>
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
