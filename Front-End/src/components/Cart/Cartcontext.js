import React, { createContext, useState, useContext } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (item) => {
        setCartItems((prevItems) => {
            // Check if the item already exists in the cart
            const existingItem = prevItems.find((cartItem) => cartItem.id === item.id);
            if (existingItem) {
                // If it exists, just increase the quantity
                return prevItems.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            // If it doesn't exist, add it to the cart with a quantity of 1
            return [...prevItems, { ...item, quantity: 1 }];
        });
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart,setCartItems  }}>
            {children}
        </CartContext.Provider>
    );
};
