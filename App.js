import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CartProvider } from './context/CartContext';
import './global.css';

// Screens
import Home from './screens/Home';
import About from './screens/ِAbout';
import Contact from './screens/Contact';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* -------- Home Stack -------- */
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="About" component={About} />
      <Stack.Screen name="Contact" component={Contact} />
    </Stack.Navigator>
  );
}

/* -------- Profile Stack -------- */

/* -------- Bottom Tabs -------- */
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: 'orange',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => {
          let icon;
          if (route.name === 'HomeTab') icon = 'home-outline';
          if (route.name === 'AboutTab') icon = 'information-circle-outline';
          if (route.name === 'ContactTab') icon = 'call-outline';
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="AboutTab" component={About} options={{ tabBarLabel: 'About' }} />
      <Tab.Screen name="ContactTab" component={Contact} options={{ tabBarLabel: 'Contact' }} />
    </Tab.Navigator>
  );
}

/* -------- App -------- */
export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </CartProvider>
  );
}
