import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ref, get } from 'firebase/database';
import { database } from '../services/firebaseConfig';

const TRADES = [
  { label: 'All Trades', value: '' },
  { label: 'Electrician', value: 'electric technician' },
  { label: 'Plumber', value: 'plumber' },
  { label: 'Carpenter', value: 'carpenter' },
];

const Tradespeople = () => {
  const navigation = useNavigation();

  const [tradespeople, setTradespeople] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState('');
  const [loading, setLoading] = useState(true);

  /* ================= FETCH TRADESPEOPLE ================= */
  useEffect(() => {
    const fetchTradespeople = async () => {
      try {
        const snapshot = await get(ref(database, 'Tradespeople'));

        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.values(data);
          setTradespeople(list);
        } else {
          setTradespeople([]);
        }
      } catch (err) {
        console.error('Failed to fetch tradespeople', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTradespeople();
  }, []);

  /* ================= FILTER ================= */
  const filteredTradespeople = selectedTrade
    ? tradespeople.filter((p) => p.trade && p.trade.toLowerCase() === selectedTrade.toLowerCase())
    : tradespeople;

  /* ================= RENDER CARD ================= */
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('HomeTab', {
          screen: 'Tradesperson',
          params: { id: item.id },
        })
      }
      className="mb-4 rounded-2xl bg-white p-4 shadow">
      <View className="flex-row items-center gap-4">
        {/* Image */}
        <View className="h-20 w-20 overflow-hidden rounded-xl bg-gray-200">
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} className="h-full w-full" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-xl font-bold text-indigo-600">{item.name?.[0]}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-lg font-semibold">{item.name}</Text>
          <Text className="text-sm text-indigo-600">{item.trade}</Text>

          <Text className="mt-1 text-sm">⭐ Rating: {item.rating ?? 0}</Text>

          {item.experience !== undefined && (
            <Text className="text-sm opacity-70">🛠 {item.experience} years experience</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  /* ================= UI ================= */
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-6">
      {/* FILTER */}
      <View className="mb-4 flex-row gap-2">
        {TRADES.map((t) => (
          <TouchableOpacity
            key={t.value}
            onPress={() => setSelectedTrade(t.value)}
            className={`rounded-full border px-4 py-2 ${
              selectedTrade === t.value
                ? 'border-indigo-600 bg-indigo-600'
                : 'border-gray-300 bg-white'
            }`}>
            <Text
              className={`text-sm font-medium ${
                selectedTrade === t.value ? 'text-white' : 'text-gray-700'
              }`}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      {filteredTradespeople.length === 0 ? (
        <Text className="mt-10 text-center text-gray-500">No tradespeople found.</Text>
      ) : (
        <FlatList
          data={filteredTradespeople}
          keyExtractor={(item, index) => item.id ?? index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default Tradespeople;
