import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { get, ref, update } from 'firebase/database';
import { database } from '../services/firebaseConfig';
import { setTradesperson, addService } from '../store/orderSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import store from 'store/store';

/* ================= MAPS ================= */

const tradeServiceMap = {
  'electric technician': 'Electrical',
  plumber: 'Plumbing',
  carpenter: 'Carpentry',
};

const Tradesperson = () => {
  const route = useRoute();
  const { id } = route.params;

  const dispatch = useDispatch();
//  const navigation = useNavigation();
  const [person, setPerson] = useState(null);
  const [services, setServices] = useState([]);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH PERSON ================= */
  useEffect(() => {
    const fetchPerson = async () => {
      try {
        const snap = await get(ref(database, `Tradespeople/${id}`));
        if (snap.exists()) {
          const data = snap.val();
          setPerson({ id, ...data });
          setRating(data.rating || 0);

          // save in redux order slice
          dispatch(
            setTradesperson({
              id,
              name: data.name,
              trade: data.trade,
            })
          );
        }
      } catch (err) {
        console.log('Error fetching tradesperson', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [id]);

  /* ================= FETCH SERVICES ================= */
  useEffect(() => {
    if (!person?.trade) return;

    const category = tradeServiceMap[person.trade.toLowerCase()];
    if (!category) return;

    const fetchServices = async () => {
      const snap = await get(ref(database, 'services'));
      if (snap.exists()) {
        const list = Object.values(snap.val());
        setServices(list.filter((s) => s.category === category));
      }
    };

    fetchServices();
  }, [person]);

  /* ================= RATE ================= */
  const submitRating = async (value) => {
    setRating(value);
    await update(ref(database, `Tradespeople/${id}`), {
      rating: Number(value),
    });
  };

  /* ================= ADD SERVICE ================= */
  // const handleAddService = (service) => {
  //   dispatch(
  //     addService({
  //       id: service.id || `special-${id}`,
  //       name: service.name,
  //       price: service.price,
  //       category: service.category,
  //     })
  //   );
  // };
  const handleAddService = (service) => {
  dispatch(
    addService({
      id: service.id || `special-${id}`,
      name: service.name,
      price: service.price,
      category: service.category,
    })
  )

  setTimeout(async () => {
    const currentState = store.getState().order;
    await AsyncStorage.setItem('currentOrder', JSON.stringify(currentState));
  }, 100);
};

  /* ================= GUARDS ================= */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!person) {
    return (
      <View style={styles.center}>
        <Text>Tradesperson not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* ================= PROFILE ================= */}
      <View style={styles.profileCard}>
        <Image source={{ uri: person.imageUrl }} style={styles.avatar} />

        <Text style={styles.name}>{person.name}</Text>
        <Text style={styles.trade}>{person.trade}</Text>

        <Text style={styles.info}>📞 {person.phone || '—'}</Text>
        <Text style={styles.info}>✉️ {person.email || '—'}</Text>

        <Text style={styles.info}>⭐ Rating: {rating}</Text>

        {/* RATE */}
        <View style={styles.rateRow}>
          {[1, 2, 3, 4, 5].map((r) => (
            <TouchableOpacity key={r} onPress={() => submitRating(r)}>
              <Text style={[styles.star, r <= rating && styles.starActive]}>⭐</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ================= SERVICES ================= */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services</Text>

        {/* Special Service */}
        {person.specialService && (
          <View style={styles.serviceCardSpecial}>
            <Text style={styles.specialBadge}>SPECIAL</Text>
            <Text style={styles.serviceName}>{person.specialService.name}</Text>
            <Text style={styles.serviceDesc}>{person.specialService.description}</Text>
            <Text style={styles.servicePrice}>{person.specialService.price} EGP</Text>

            <TouchableOpacity
              style={styles.addBtn}
              onPress={() =>
                handleAddService({
                  ...person.specialService,
                  category: 'Special',
                })
              }>
              <Text style={styles.addBtnText}>Add to Order</Text>
            </TouchableOpacity>

            
          </View>
        )}

        {/* Regular Services */}
        {services.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDesc}>{service.description}</Text>
            <Text style={styles.servicePrice}>{service.price} EGP</Text>

            <TouchableOpacity style={styles.addBtn} onPress={() => handleAddService(service)}>
              <Text style={styles.addBtnText}>Add to Order</Text>
            </TouchableOpacity>
          </View>
        ))}
        {/* <TouchableOpacity onPress={() => navigation.navigate('Checkout')}>
  <Text>View Cart ({services.length})</Text>
</TouchableOpacity> */}
      </View>
    </ScrollView>
  );
};

export default Tradesperson;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileCard: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    backgroundColor: '#e5e7eb',
  },

  name: {
    fontSize: 20,
    fontWeight: '700',
  },

  trade: {
    color: '#4f46e5',
    marginBottom: 8,
  },

  info: {
    fontSize: 14,
    color: '#374151',
    marginTop: 2,
  },

  rateRow: {
    flexDirection: 'row',
    marginTop: 8,
  },

  star: {
    fontSize: 22,
    opacity: 0.4,
  },

  starActive: {
    opacity: 1,
  },

  section: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 10,
  },

  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },

  serviceCardSpecial: {
    backgroundColor: '#eef2ff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#4f46e5',
  },

  specialBadge: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    color: '#4f46e5',
    marginBottom: 4,
  },

  serviceName: {
    fontSize: 16,
    fontWeight: '600',
  },

  serviceDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginVertical: 4,
  },

  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },

  addBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
