import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CartProvider } from './context/CartContext';
import { Provider, useSelector } from 'react-redux';
import { store } from './store/store';

import './global.css';

// Screens
import Home from './screens/Home';
import About from './screens/ِAbout';
import Contact from './screens/Contact';
import Tradespeople from './screens/Tradespeople';
import Tradesperson from './screens/Tradesperson';
import Login from './screens/Login';
import Register from './screens/Register';
import Profile from './screens/Profile';
import Dashboard from './screens/Dashboard';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ================= HOME STACK ================= */
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="About" component={About} />
      <Stack.Screen name="Tradespeople" component={Tradespeople} />
      <Stack.Screen name="Tradesperson" component={Tradesperson} />
    </Stack.Navigator>
  );
}

/* ================= DASHBOARD STACK ================= */
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={Dashboard} />
    </Stack.Navigator>
  );
}

/* ================= PROFILE STACK ================= */
const ProfileStackNav = createNativeStackNavigator();

function ProfileStack() {
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNav.Screen name="Login" component={Login} />
      <ProfileStackNav.Screen name="Register" component={Register} />
      <ProfileStackNav.Screen name="Profile" component={Profile} />
    </ProfileStackNav.Navigator>
  );
}

/* ================= TABS ================= */
function TabNavigator() {
  const role = useSelector((state) => state.app.role);
  const isAuthenticated = useSelector((state) => state.app.isAuthenticated);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let icon = 'home-outline';

          if (route.name === 'HomeTab') icon = 'home-outline';
          if (route.name === 'TradespeopleTab') icon = 'people-outline';
          if (route.name === 'DashboardTab') icon = 'speedometer-outline';
          if (route.name === 'ProfileTab') icon = 'person-outline';
          if (route.name === 'ContactTab') icon = 'call-outline';

          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}>
      {/* HOME */}
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Home' }} />

      {/* CLIENT ONLY */}
      {isAuthenticated && role === 'client' && (
        <Tab.Screen
          name="TradespeopleTab"
          component={Tradespeople}
          options={{ tabBarLabel: 'Tradespeople' }}
        />
      )}

      {/* TRADESPERSON ONLY */}
      {isAuthenticated && role === 'tradesperson' && (
        <Tab.Screen
          name="DashboardTab"
          component={DashboardStack}
          options={{ tabBarLabel: 'Dashboard' }}
        />
      )}

      {/* PROFILE */}
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: 'Profile' }} />

      {/* CONTACT */}
      <Tab.Screen name="ContactTab" component={Contact} options={{ tabBarLabel: 'Contact' }} />
    </Tab.Navigator>
  );
}

/* ================= APP ================= */
export default function App() {
  return (
    <Provider store={store}>
      <CartProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </CartProvider>
    </Provider>
  );
}
