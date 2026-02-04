import React, { useState, useEffect } from "react";
import { IoRefresh, IoSearch } from "react-icons/io5";
import { HiUsers, HiPencil, HiTrash } from "react-icons/hi2";
import {
  FaPhone,
  FaCalendarAlt,
  FaReceipt,
  FaMoneyBillWave,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { MdStar, MdPerson, MdNewReleases } from "react-icons/md";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import {
  getCustomers,
  updateCustomer,
  deleteCustomer,
  syncCustomerStats,
} from "../../https/index";

const EXCHANGE_RATE = 4100;
const VIP_THRESHOLD = 5;

const CustomerInformation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const queryClient = useQueryClient();

  // Fetch customers from Customer collection
  const {
    data: customersData,
    isError,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await getCustomers();
      if (Array.isArray(response?.data?.data)) return response.data.data;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response)) return response;
      return [];
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (isError)
      enqueueSnackbar("Failed to load customer data!", { variant: "error" });
  }, [isError]);

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ customerId, data }) => {
      const response = await updateCustomer(customerId, data);
      return response;
    },
    onSuccess: () => {
      enqueueSnackbar("Customer updated successfully!", { variant: "success" });
      setEditingCustomer(null);
      setEditForm({ name: "", phone: "" });
      queryClient.invalidateQueries(["customers"]);
      queryClient.invalidateQueries(["orders"]);
      window.dispatchEvent(new CustomEvent("customerUpdated"));
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to update customer",
        { variant: "error" }
      );
    },
  });

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId) => {
      const response = await deleteCustomer(customerId);
      return response;
    },
    onSuccess: () => {
      enqueueSnackbar("Customer deleted successfully!", { variant: "success" });
      setDeleteConfirm(null);
      queryClient.invalidateQueries(["customers"]);
      queryClient.invalidateQueries(["orders"]);
      window.dispatchEvent(new CustomEvent("customerUpdated"));
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to delete customer",
        { variant: "error" }
      );
    },
  });

  // Sync customer stats mutation
  const syncStatsMutation = useMutation({
    mutationFn: async () => {
      const response = await syncCustomerStats();
      return response;
    },
    onSuccess: (response) => {
      const data = response?.data?.data || response?.data || {};
      enqueueSnackbar(
        `Synced! ${data.updated || 0} updated, ${data.created || 0} created`,
        { variant: "success" }
      );
      queryClient.invalidateQueries(["customers"]);
      window.dispatchEvent(new CustomEvent("customerUpdated"));
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to sync customer stats",
        { variant: "error" }
      );
    },
  });

  const allCustomers = customersData || [];

  // Calculate statistics
  const stats = {
    totalCustomers: allCustomers.length,
    vipCustomers: allCustomers.filter((c) => c.totalOrders >= VIP_THRESHOLD)
      .length,
    newCustomers: allCustomers.filter((c) => {
      const now = new Date();
      const diffDays = Math.floor(
        (now - new Date(c.createdAt)) / (1000 * 60 * 60 * 24)
      );
      return diffDays <= 30;
    }).length,
    totalOrders: allCustomers.reduce((sum, c) => sum + (c.totalOrders || 0), 0),
    totalRevenue: allCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
  };

  // Get customer status
  const getCustomerStatus = (customer) => {
    if (customer.totalOrders >= VIP_THRESHOLD) {
      return {
        label: "VIP",
        color: "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
        icon: MdStar,
        gradient: "from-amber-500 to-orange-600",
      };
    }

    const now = new Date();
    const diffDays = Math.floor(
      (now - new Date(customer.createdAt)) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 30) {
      return {
        label: "New",
        color: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
        icon: MdNewReleases,
        gradient: "from-emerald-500 to-green-600",
      };
    }

    return {
      label: "Regular",
      color: "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
      icon: MdPerson,
      gradient: "from-blue-500 to-indigo-600",
    };
  };

  // Filter customers
  const filteredCustomers = allCustomers.filter((customer) => {
    const status = getCustomerStatus(customer);

    if (filterStatus === "vip" && status.label !== "VIP") return false;
    if (filterStatus === "new" && status.label !== "New") return false;
    if (filterStatus === "regular" && status.label !== "Regular") return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        customer.name?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Sort by totalOrders descending
  const sortedCustomers = [...filteredCustomers].sort(
    (a, b) => (b.totalOrders || 0) - (a.totalOrders || 0)
  );

  // Format date
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle edit click
  const handleEditClick = (customer) => {
    setEditingCustomer(customer._id);
    setEditForm({
      name: customer.name || "",
      phone: customer.phone || "",
    });
  };

  // Handle edit save
  const handleEditSave = (customer) => {
    if (!editForm.name.trim()) {
      enqueueSnackbar("Customer name is required", { variant: "warning" });
      return;
    }

    updateCustomerMutation.mutate({
      customerId: customer._id,
      data: {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        oldName: customer.name,
      },
    });
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingCustomer(null);
    setEditForm({ name: "", phone: "" });
  };

  // Handle delete click
  const handleDeleteClick = (customer) => {
    setDeleteConfirm(customer);
  };

  // Handle delete confirm
  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      deleteCustomerMutation.mutate(deleteConfirm._id);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <IoRefresh className="animate-spin" size={20} />
          <span>Loading customer data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-3 flex-shrink-0 pb-3">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-2.5 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.totalCustomers}</p>
              <p className="text-blue-100 text-[10px]">Total Customers</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <HiUsers size={14} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-2.5 text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.vipCustomers}</p>
              <p className="text-amber-100 text-[10px]">VIP Customers</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <MdStar size={14} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-2.5 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.totalOrders}</p>
              <p className="text-emerald-100 text-[10px]">Total Orders</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FaReceipt size={14} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-2.5 text-white shadow-lg shadow-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">
                ${(stats.totalRevenue / EXCHANGE_RATE).toFixed(0)}
              </p>
              <p className="text-purple-100 text-[10px]">Total Revenue</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FaMoneyBillWave size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 flex flex-col flex-1 overflow-hidden min-h-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <HiUsers className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-slate-800 font-semibold">
                Customer Directory
              </h2>
              <p className="text-slate-400 text-xs">
                {sortedCustomers.length} customers • VIP at {VIP_THRESHOLD}+
                orders
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <IoSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 w-52 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:border-blue-400"
            >
              <option value="all">All Customers</option>
              <option value="vip">⭐ VIP ({VIP_THRESHOLD}+ orders)</option>
              <option value="new">🆕 New (30 days)</option>
              <option value="regular">👤 Regular</option>
            </select>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <IoRefresh
                className={isFetching ? "animate-spin" : ""}
                size={14}
              />
              Refresh
            </button>

            {/* Sync Stats Button */}
            <button
              onClick={() => syncStatsMutation.mutate()}
              disabled={syncStatsMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-colors shadow-sm disabled:opacity-50"
              title="Recalculate all customer stats from orders"
            >
              <IoRefresh
                className={syncStatsMutation.isPending ? "animate-spin" : ""}
                size={14}
              />
              {syncStatsMutation.isPending ? "Syncing..." : "Sync Stats"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-slate-500 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-medium w-[5%]">Rank</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-center">Orders</th>
                <th className="px-4 py-3 font-medium text-right">
                  Total Spent
                </th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {sortedCustomers.length > 0 ? (
                sortedCustomers.map((customer, index) => {
                  const status = getCustomerStatus(customer);
                  const StatusIcon = status.icon;
                  const isTopCustomer = index < 3 && filterStatus === "all";
                  const isEditing = editingCustomer === customer._id;

                  return (
                    <tr
                      key={customer._id}
                      className={`hover:bg-stone-50 transition-colors ${
                        isEditing ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        {isTopCustomer ? (
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white ${
                              index === 0
                                ? "bg-amber-500"
                                : index === 1
                                ? "bg-slate-400"
                                : "bg-amber-700"
                            }`}
                          >
                            {index + 1}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium pl-2">
                            {index + 1}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder="Customer name"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm bg-gradient-to-br ${status.gradient}`}
                            >
                              {customer.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2) || "??"}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                                {customer.name}
                                {status.label === "VIP" && (
                                  <MdStar
                                    className="text-amber-500"
                                    size={14}
                                  />
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.phone}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder="Phone number"
                          />
                        ) : customer.phone ? (
                          <p className="flex items-center gap-1.5 text-xs text-slate-600">
                            <FaPhone size={10} className="text-slate-400" />
                            {customer.phone}
                          </p>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${status.color}`}
                        >
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                              (customer.totalOrders || 0) >= VIP_THRESHOLD
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <FaReceipt size={10} />
                            {customer.totalOrders || 0}
                          </span>
                          {(customer.totalOrders || 0) < VIP_THRESHOLD && (
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {VIP_THRESHOLD - (customer.totalOrders || 0)} to
                              VIP
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div>
                          <p className="font-bold text-emerald-600">
                            $
                            {(
                              (customer.totalSpent || 0) / EXCHANGE_RATE
                            ).toFixed(2)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            ៛ {(customer.totalSpent || 0).toLocaleString()}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <FaCalendarAlt size={10} className="text-slate-400" />
                          {formatDate(customer.createdAt)}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleEditSave(customer)}
                                disabled={updateCustomerMutation.isPending}
                                className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50"
                                title="Save"
                              >
                                <FaSave size={12} />
                              </button>
                              <button
                                onClick={handleEditCancel}
                                className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                                title="Cancel"
                              >
                                <FaTimes size={12} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditClick(customer)}
                                className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Edit Customer"
                              >
                                <HiPencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(customer)}
                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Delete Customer"
                              >
                                <HiTrash size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <HiUsers
                      size={48}
                      className="mx-auto text-slate-300 mb-3"
                    />
                    <p className="text-slate-500 font-medium">
                      No customers found
                    </p>
                    <p className="text-slate-400 text-sm">
                      {searchQuery || filterStatus !== "all"
                        ? "Try different search or filter"
                        : "Add customers to see them here"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {sortedCustomers.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 bg-stone-50 flex-shrink-0">
            <span className="text-xs text-slate-500">
              Showing {sortedCustomers.length} of {allCustomers.length}{" "}
              customers
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MdStar className="text-amber-500" size={12} />
                {stats.vipCustomers} VIP
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MdNewReleases className="text-emerald-500" size={12} />
                {stats.newCustomers} New
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MdPerson className="text-blue-500" size={12} />
                {stats.totalCustomers -
                  stats.vipCustomers -
                  stats.newCustomers}{" "}
                Regular
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <HiTrash className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Delete Customer
                </h3>
                <p className="text-sm text-slate-500">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-slate-700">
                Are you sure you want to delete{" "}
                <strong>{deleteConfirm.name}</strong>?
              </p>
              <p className="text-xs text-slate-500 mt-1">
                This will also remove customer info from related orders.
              </p>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteCustomerMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleteCustomerMutation.isPending ? (
                  <>
                    <IoRefresh className="animate-spin" size={14} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <HiTrash size={14} />
                    Delete Customer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInformation;
