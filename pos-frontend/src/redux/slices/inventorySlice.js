import { createSlice } from "@reduxjs/toolkit";

// Helper to get initial inventory from localStorage or generate default
const getInitialInventory = () => {
  const saved = localStorage.getItem("inventoryData");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }
  return [];
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState: {
    items: getInitialInventory(),
    lastUpdated: Date.now(),
  },
  reducers: {
    // Set all inventory items
    setInventory: (state, action) => {
      state.items = action.payload;
      state.lastUpdated = Date.now();
      localStorage.setItem("inventoryData", JSON.stringify(action.payload));
    },

    // Update single item quantity
    updateItemQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(
        (i) =>
          i._id === itemId ||
          i.id === itemId ||
          i.id?.toString() === itemId?.toString()
      );
      if (item) {
        item.quantity = Math.max(0, quantity);
        // Update stock status
        if (item.quantity === 0) {
          item.stockStatus = "Out of Stock";
        } else if (item.quantity < 15) {
          item.stockStatus = "Low Stock";
        } else {
          item.stockStatus = "In Stock";
        }
        state.lastUpdated = Date.now();
        localStorage.setItem("inventoryData", JSON.stringify(state.items));
      }
    },

    // Decrease stock when order is placed
    decreaseStock: (state, action) => {
      const { items } = action.payload; // Array of { name, quantity } or { id, quantity }

      items.forEach((orderItem) => {
        // Find by name or id
        const inventoryItem = state.items.find(
          (i) =>
            i.name === orderItem.name ||
            i._id === orderItem.id ||
            i.id === orderItem.id ||
            i.id?.toString() === orderItem.id?.toString()
        );

        if (inventoryItem) {
          inventoryItem.quantity = Math.max(
            0,
            inventoryItem.quantity - orderItem.quantity
          );
          // Update stock status
          if (inventoryItem.quantity === 0) {
            inventoryItem.stockStatus = "Out of Stock";
          } else if (inventoryItem.quantity < 15) {
            inventoryItem.stockStatus = "Low Stock";
          } else {
            inventoryItem.stockStatus = "In Stock";
          }
        }
      });

      state.lastUpdated = Date.now();
      localStorage.setItem("inventoryData", JSON.stringify(state.items));

      // Dispatch storage event for other components
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "inventoryData",
          newValue: JSON.stringify(state.items),
        })
      );
    },

    // Increase stock (for restocking or order cancellation)
    increaseStock: (state, action) => {
      const { items } = action.payload;

      items.forEach((orderItem) => {
        const inventoryItem = state.items.find(
          (i) =>
            i.name === orderItem.name ||
            i._id === orderItem.id ||
            i.id === orderItem.id
        );

        if (inventoryItem) {
          inventoryItem.quantity += orderItem.quantity;
          // Update stock status
          if (inventoryItem.quantity === 0) {
            inventoryItem.stockStatus = "Out of Stock";
          } else if (inventoryItem.quantity < 15) {
            inventoryItem.stockStatus = "Low Stock";
          } else {
            inventoryItem.stockStatus = "In Stock";
          }
        }
      });

      state.lastUpdated = Date.now();
      localStorage.setItem("inventoryData", JSON.stringify(state.items));
    },

    // Reload from localStorage
    reloadInventory: (state) => {
      const saved = localStorage.getItem("inventoryData");
      if (saved) {
        try {
          state.items = JSON.parse(saved);
          state.lastUpdated = Date.now();
        } catch (e) {
          console.error("Error reloading inventory:", e);
        }
      }
    },
  },
});

export const {
  setInventory,
  updateItemQuantity,
  decreaseStock,
  increaseStock,
  reloadInventory,
} = inventorySlice.actions;

// Selectors
export const selectInventory = (state) => state.inventory.items;
export const selectInventoryLastUpdated = (state) =>
  state.inventory.lastUpdated;
export const selectItemStock = (itemId) => (state) => {
  const item = state.inventory.items.find(
    (i) =>
      i._id === itemId ||
      i.id === itemId ||
      i.id?.toString() === itemId?.toString()
  );
  return item ? item.quantity : 0;
};
export const selectItemByName = (name) => (state) => {
  return state.inventory.items.find((i) => i.name === name);
};

export default inventorySlice.reducer;
