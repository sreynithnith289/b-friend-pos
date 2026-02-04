import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orderId: "",
  editingOrderId: null, // ✅ Track if we're editing an existing order
  customerName: "",
  customerPhone: "",
  guests: 0,
  tableNo: "",
  tableId: null,
  serviceType: "Dine-in",
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    // ✅ SET CUSTOMER WHEN CREATING ORDER
    setCustomer: (state, action) => {
      const { name, phone, guests, serviceType } = action.payload;

      state.orderId = `${Date.now()}`;
      state.customerName = name;
      state.customerPhone = phone;
      state.guests = guests;
      state.serviceType = serviceType || "Dine-in";
    },

    // ✅ CLEAR CUSTOMER AFTER PRINTING INVOICE
    removeCustomer: (state) => {
      state.orderId = "";
      state.editingOrderId = null; // ✅ Clear editing state
      state.customerName = "";
      state.customerPhone = "";
      state.guests = 0;
      state.tableNo = "";
      state.tableId = null;
      state.serviceType = "Dine-in";
    },

    // ✅ UPDATE TABLE AFTER TABLE SELECTION
    updateTable: (state, action) => {
      state.tableNo = action.payload.tableNo;
      state.tableId = action.payload.tableId || null;
    },

    // ✅ NEW: LOAD ORDER FOR EDITING
    loadOrderForEdit: (state, action) => {
      const { order } = action.payload;

      state.editingOrderId = order._id; // ✅ Store the order ID we're editing
      state.orderId = order._id;
      state.customerName = order.customerDetails?.name || "";
      state.customerPhone = order.customerDetails?.phone || "";
      state.guests = order.customerDetails?.guests || 1;
      state.tableNo = order.table?.tableNo || "";
      state.tableId = order.table?._id || order.table || null;
      state.serviceType = "Dine-in";
    },

    // ✅ NEW: CLEAR EDITING STATE (when canceling edit)
    clearEditingState: (state) => {
      state.editingOrderId = null;
    },
  },
});

export const {
  setCustomer,
  removeCustomer,
  updateTable,
  loadOrderForEdit,
  clearEditingState,
} = customerSlice.actions;

export default customerSlice.reducer;
