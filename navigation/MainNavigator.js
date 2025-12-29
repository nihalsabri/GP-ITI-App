import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

// Screens
import Home from '../screens/Home';
import Contact from '../screens/Contact';
import Tradespeople from '../screens/Tradespeople';
import Tradesperson from '../screens/Tradesperson';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Profile from '../screens/Profile';
import TechnicianDashboard from '../screens/Dashboard';
import LoadingScreen from '../components/LoadingScreen';
import CheckoutScreen from '../screens/Checkout';
import { SafeAreaView } from 'react-native-safe-area-context';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ==========================================
// 🏠 HOME STACK (للعملاء)
// ==========================================
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={Home} />
      <Stack.Screen name="Tradespeople" component={Tradespeople} />
      <Stack.Screen name="Tradesperson" component={Tradesperson} />
 <Stack.Screen name="Checkout" component={CheckoutScreen} /> 
    </Stack.Navigator>
  );
}

// ==========================================
// 📊 DASHBOARD STACK (للفنيين)
// ==========================================
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={TechnicianDashboard} />
    </Stack.Navigator>
  );
}

// ==========================================
// 👤 PROFILE STACK
// ==========================================
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={Profile} />
    </Stack.Navigator>
  );
}

// ==========================================
// 🔐 AUTH STACK (تسجيل الدخول والتسجيل)
// ==========================================
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
}

// ==========================================
// 📱 CLIENT TABS (للعملاء)
// ==========================================
function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'TradespeopleTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'ContactTab') {
            iconName = focused ? 'call' : 'call-outline';
          } else if (route.name === 'CheckoutTab') {
            iconName = focused ? 'cart' : 'cart-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#ffffff',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{ tabBarLabel: 'الرئيسية' }} 
      />
      
      <Tab.Screen
        name="TradespeopleTab"
        component={Tradespeople}
        options={{ tabBarLabel: 'الفنيين' }}
      />
      
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack} 
        options={{ tabBarLabel: 'حسابي' }} 
      />
      <Tab.Screen
      name="CheckoutTab"
      component={CheckoutScreen}
      options={{ tabBarLabel: 'الدفع' }}
      />
      <Tab.Screen 
        name="ContactTab" 
        component={Contact} 
        options={{ tabBarLabel: 'اتصل بنا' }} 
      />
    </Tab.Navigator>
  );
}

// ==========================================
// 🔧 TECHNICIAN TABS (للفنيين)
// ==========================================
function TechnicianTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'DashboardTab') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'ContactTab') {
            iconName = focused ? 'call' : 'call-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#ffffff',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardStack} 
        options={{ tabBarLabel: 'لوحة التحكم' }} 
      />
      
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack} 
        options={{ tabBarLabel: 'حسابي' }} 
      />
      
      <Tab.Screen 
        name="ContactTab" 
        component={Contact} 
        options={{ tabBarLabel: 'اتصل بنا' }} 
      />
    </Tab.Navigator>
  );
}

// ==========================================
// 🎯 MAIN NAVIGATOR
// ==========================================
export default function MainNavigator() {
  const { isAuthenticated, isLoading, role } = useSelector((state) => state.app);

  // عرض شاشة التحميل أثناء التحقق من المصادقة
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : role === 'tradesperson' ? (
        <Stack.Screen name="MainApp" component={TechnicianTabs} />
      ) : (
        <Stack.Screen name="MainApp" component={ClientTabs} />
      )}
    </Stack.Navigator>
</SafeAreaView>
  );
}