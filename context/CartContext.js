import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);



  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem('@cart');
        if (storedCart !== null) {
          setCart(JSON.parse(storedCart));
        }
      } catch (error) {
        console.log('Error:', error);
      }
    };
    loadCart();
  }, []);


//   useEffect(() => {
//     const saveCart = async () => {
//       try {
//         await AsyncStorage.setItem('@cart', JSON.stringify(cart));
//       } catch (error) {
//         console.log('Error saving cart to storage:', error);
//       }
//     };
//     saveCart();
//   }, [cart]);

  const addToCart = (meal) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.idMeal === meal.idMeal);
      if (existingItem) {
        return prevCart.map((item) =>
          item.idMeal === meal.idMeal ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...meal, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (idMeal) => {
    setCart((prevCart) => prevCart.filter((item) => item.idMeal !== idMeal));
  };

  const updateQuantity = (idMeal, change) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.idMeal === idMeal
            ? { ...item, quantity: Math.max(1, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };


  
  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.quantity * parseFloat(item.price), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartItemsCount,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
