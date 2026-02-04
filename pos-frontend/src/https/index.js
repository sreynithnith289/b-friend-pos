import axios from "axios";

/* ================= AXIOS INSTANCE ================= */
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ================= USER / AUTH ================= */
export const login = (data) => api.post("/api/user/login", data);
export const register = (data) => api.post("/api/user/register", data);
export const getUserData = () => api.get("/api/user");
export const logout = () => api.post("/api/user/logout");

/* ================= STAFF MANAGEMENT ================= */
export const getAllUsers = () => api.get("/api/user/all");
export const getUserById = (id) => api.get(`/api/user/${id}`);
export const updateUser = (id, data) => api.put(`/api/user/${id}`, data);
export const deleteUser = (id) => api.delete(`/api/user/${id}`);
export const registerUser = (data) => api.post("/api/user/register", data);

/* ================= TABLE ================= */
export const addTable = (data) => api.post("/api/table", data);
export const getTables = () => api.get("/api/table");
export const deleteTable = (tableId) => api.delete(`/api/table/${tableId}`);
export const updateTableStatus = ({ tableId, status, customerName }) =>
  api.put(`/api/table/${tableId}`, { status, customerName });

/* ================= CATEGORY ================= */
export const addCategory = (data) => api.post("/api/category", data);
export const getCategories = () => api.get("/api/category");
export const deleteCategory = (id) => api.delete(`/api/category/${id}`);
export const updateCategory = (id, data) =>
  api.put(`/api/category/${id}`, data);

/* ================= DISH ================= */
export const addDish = (data) => api.post("/api/dish", data);
export const getDishes = () => api.get("/api/dish");
export const getDishById = (id) => api.get(`/api/dish/${id}`);
export const updateDish = (id, data) => api.put(`/api/dish/${id}`, data);
export const deleteDish = (id) => api.delete(`/api/dish/${id}`);

/* ================= ORDER ================= */
export const addOrder = (data) => api.post("/api/orders", data);

export const getOrders = async () => {
  try {
    const res = await api.get("/api/orders");

    // Ensure always returns an array
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.orders)) return res.data.orders;
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.data?.data?.orders)) return res.data.data.orders;

    console.error("Unexpected orders response:", res.data);
    return [];
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    return [];
  }
};

export const getOrderById = (id) => api.get(`/api/orders/${id}`);
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  api.put(`/api/orders/${orderId}`, { orderStatus });
export const deleteOrder = (orderId) => api.delete(`/api/orders/${orderId}`);

/* ================= CUSTOMER ================= */
export const getCustomers = () => api.get("/api/customers");
export const getCustomerById = (id) => api.get(`/api/customers/${id}`);
export const addCustomer = (data) => api.post("/api/customers", data);
export const searchCustomers = (query) =>
  api.get(`/api/customers/search?query=${query}`);
export const updateCustomer = (id, data) =>
  api.put(`/api/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/api/customers/${id}`);
export const syncCustomerStats = () => api.post("/api/customers/sync-stats");

/* ================= EXPORT DEFAULT ================= */
export default api;
