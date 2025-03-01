import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Cart items
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += 1; // Increment quantity if item exists
      } else {
        state.items.push({ ...item, quantity: 1 }); // Add new item with quantity 1
      }
    },
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter((i) => i.id !== itemId); // Remove item
    },
    clearCart: (state) => {
      state.items = []; // Clear the cart
    },
    incrementQuantity: (state,action) =>{
        const itemId = action.payload;
        const existingItem = state.items.find((i) => i.id === itemId);
        if(existingItem){
            existingItem.quantity += 1;
        }
    },
    decrementQuantity: (state,action) => {
        const itemId = action.payload;
        const existingItem = state.items.find((i) => i.id === itemId);
        if(existingItem && existingItem.quantity > 1)
        {
            existingItem.quantity -= 1;
        }else if (existingItem){
            state.items = state.items.filter((i) => i.id !== itemId);
        }
    },
  },
});

export const { addToCart, removeFromCart, clearCart, incrementQuantity,decrementQuantity} = cartSlice.actions;
export default cartSlice.reducer;
