import './global.css';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './hooks/AuthProvider';
import { CartProvider } from './context/CartContext';
import MainNavigator from './navigation/MainNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AuthProvider>
          <CartProvider>
            <NavigationContainer>
              <MainNavigator />
            </NavigationContainer>
          </CartProvider>
        </AuthProvider>
      </Provider>
    </SafeAreaProvider>
  );
}