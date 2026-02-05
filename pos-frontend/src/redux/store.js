// import { configureStore } from "@reduxjs/toolkit";
// import customerSlice from "./slices/customerSlice";
// import cartSlice from "./slices/cartSlice";
// import userSlice from "./slices/userSlice";

// const store = configureStore({
//   reducer: {
//     customer: customerSlice,
//     cart: cartSlice,
//     user: userSlice,
//   },
//   devTools: import.meta.env.NODE_ENV !== "production",
// });

// export default store;




import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import customerSlice from "./slices/customerSlice";
import cartSlice from "./slices/cartSlice";
import userSlice from "./slices/userSlice";

const persistConfig = {
  key: "bfriend-pos",
  storage,
  whitelist: ["user", "cart"], // persist user login and cart
};

const rootReducer = combineReducers({
  customer: customerSlice,
  cart: cartSlice,
  user: userSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  devTools: import.meta.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
export default store;