import { createSlice } from "@reduxjs/toolkit";

const EXCHANGE_RATE = 4100;

const initialState = [];

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Add or update an item in the cart
    addItem: (state, action) => {
      const { id, name, quantity, priceKHR, priceUSD } = action.payload;

      // Check if the item already exists by name
      const existingIndex = state.findIndex((item) => item.name === name);

      if (existingIndex >= 0) {
        // Merge quantities and recalculate totals
        state[existingIndex].quantity += quantity;
        state[existingIndex].totalKHR =
          state[existingIndex].quantity * state[existingIndex].priceKHR;
        state[existingIndex].totalUSD = parseFloat(
          (
            state[existingIndex].quantity * state[existingIndex].priceUSD
          ).toFixed(2)
        );
      } else {
        // Add new item
        state.push({
          id,
          name,
          quantity,
          priceKHR, // unit price
          priceUSD, // unit price
          totalKHR: quantity * priceKHR,
          totalUSD: parseFloat((quantity * priceUSD).toFixed(2)),
        });
      }
    },

    // Remove item by ID
    removeItem: (state, action) =>
      state.filter((item) => item.id !== action.payload),

    // Update quantity of an item directly
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.find((item) => item.id === id);
      if (item) {
        item.quantity = quantity;
        item.totalKHR = quantity * item.priceKHR;
        item.totalUSD = parseFloat((quantity * item.priceUSD).toFixed(2));
      }
    },

    // Clear the entire cart
    clearCart: () => [],

    // ✅ NEW: LOAD CART ITEMS FROM EXISTING ORDER
    loadCartItems: (state, action) => {
      const { items } = action.payload;

      // Clear existing cart first
      state.length = 0;

      // Add items from the order
      items.forEach((item, index) => {
        const priceKHR = item.price || 0;
        const priceUSD = parseFloat((priceKHR / EXCHANGE_RATE).toFixed(2));
        const quantity = item.quantity || 1;

        state.push({
          id: item._id || `edit-item-${index}-${Date.now()}`, // Generate ID if not present
          name: item.name,
          quantity: quantity,
          priceKHR: priceKHR,
          priceUSD: priceUSD,
          totalKHR: quantity * priceKHR,
          totalUSD: parseFloat((quantity * priceUSD).toFixed(2)),
        });
      });
    },
  },
});

// Selectors for totals
export const getTotalKHR = (state) =>
  state.cart.reduce((sum, item) => sum + item.totalKHR, 0);
export const getTotalUSD = (state) =>
  state.cart.reduce((sum, item) => sum + item.totalUSD, 0);

// Export actions and reducer
export const { addItem, removeItem, updateQuantity, clearCart, loadCartItems } =
  cartSlice.actions;
export default cartSlice.reducer;
