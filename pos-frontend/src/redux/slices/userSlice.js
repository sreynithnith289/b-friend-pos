import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  name: "",
  email: "",
  phone: "",
  role: "", // Admin, Staff, etc.
  isAuth: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const {
        _id = "",
        name = "",
        email = "",
        phone = "",
        role = "",
      } = action.payload;
      state._id = _id;
      state.name = name;
      state.email = email;
      state.phone = phone;
      state.role = role;
      state.isAuth = true;
    },
    removeUser: () => initialState, // Reset to initial state
  },
});

// Export actions
export const { setUser, removeUser } = userSlice.actions;

// Export reducer
export default userSlice.reducer;
