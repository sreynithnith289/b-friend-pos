import React, { useState, useEffect } from "react";
import { IoRefresh, IoSearch, IoPersonAdd, IoClose } from "react-icons/io5";
import { HiUsers, HiUserCircle } from "react-icons/hi2";
import {
  FaUserCog,
  FaUserShield,
  FaConciergeBell,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdAdminPanelSettings, MdVerified } from "react-icons/md";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import {
  getAllUsers,
  deleteUser,
  registerUser,
  updateUser,
} from "../../https/index";
import { formatDateAndTime } from "../../utils";
import { HiPencil, HiTrash } from "react-icons/hi";

const StaffInformation = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Waiter",
  });

  // Fetch all users/staff
  const {
    data: staffData,
    isError,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const response = await getAllUsers();
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.data?.data)) return response.data.data;
      if (Array.isArray(response)) return response;
      console.log("Staff response:", response);
      return [];
    },
    refetchInterval: 30000,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["staff"]);
      enqueueSnackbar("Staff member deleted successfully!", {
        variant: "success",
      });
      setShowDeleteModal(false);
      setSelectedStaff(null);
    },
    onError: () => {
      enqueueSnackbar("Failed to delete staff member!", { variant: "error" });
    },
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (data) => registerUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["staff"]);
      enqueueSnackbar("Staff member added successfully!", {
        variant: "success",
      });
      setShowAddModal(false);
      resetForm();
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to add staff member!",
        { variant: "error" }
      );
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["staff"]);
      enqueueSnackbar("Staff member updated successfully!", {
        variant: "success",
      });
      setShowEditModal(false);
      setSelectedStaff(null);
      resetForm();
    },
    onError: () => {
      enqueueSnackbar("Failed to update staff member!", { variant: "error" });
    },
  });

  useEffect(() => {
    if (isError)
      enqueueSnackbar("Failed to load staff data!", { variant: "error" });
  }, [isError]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "Waiter",
    });
  };

  const handleOpenEdit = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name || "",
      email: staff.email || "",
      phone: staff.phone || "",
      password: "",
      role: staff.role || "Waiter",
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (staff) => {
    setSelectedStaff(staff);
    setShowDeleteModal(true);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      enqueueSnackbar("Please fill all required fields!", {
        variant: "warning",
      });
      return;
    }
    addMutation.mutate(formData);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      enqueueSnackbar("Please fill all required fields!", {
        variant: "warning",
      });
      return;
    }
    const updateData = { ...formData };
    if (!updateData.password) delete updateData.password;
    updateMutation.mutate({ id: selectedStaff._id, data: updateData });
  };

  const handleDelete = () => {
    if (selectedStaff) {
      deleteMutation.mutate(selectedStaff._id);
    }
  };

  // Calculate statistics
  const allStaff = staffData || [];
  const stats = {
    totalStaff: allStaff.length,
    admins: allStaff.filter((s) => s.role === "Admin").length,
    cashiers: allStaff.filter((s) => s.role === "Cashier").length,
    waiters: allStaff.filter((s) => s.role === "Waiter").length,
    activeStaff: allStaff.filter((s) => s.isActive !== false).length,
  };

  // Filter staff
  const filteredStaff = allStaff.filter((staff) => {
    // Filter by role
    if (filterRole !== "all" && staff.role !== filterRole) return false;

    // Filter by status
    if (filterStatus === "active" && staff.isActive === false) return false;
    if (filterStatus === "inactive" && staff.isActive !== false) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        staff.name?.toLowerCase().includes(query) ||
        staff.email?.toLowerCase().includes(query) ||
        staff.phone?.toLowerCase().includes(query) ||
        staff.role?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Role icon helper
  const getRoleIcon = (role) => {
    switch (role) {
      case "Admin":
        return <MdAdminPanelSettings size={12} />;
      case "Cashier":
        return <FaUserCog size={12} />;
      case "Waiter":
        return <FaConciergeBell size={12} />;
      default:
        return <HiUserCircle size={12} />;
    }
  };

  // Role color helper
  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-red-50 text-red-600";
      case "Cashier":
        return "bg-blue-50 text-blue-600";
      case "Waiter":
        return "bg-amber-50 text-amber-600";
      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <IoRefresh className="animate-spin" size={20} />
          <span>Loading staff data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Statistics Cards - Compact */}
      <div className="grid grid-cols-4 gap-3 flex-shrink-0 pb-3">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-2.5 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.totalStaff}</p>
              <p className="text-blue-100 text-[10px]">Total Staff</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <HiUsers size={14} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-2.5 text-white shadow-lg shadow-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.admins}</p>
              <p className="text-red-100 text-[10px]">Admins</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FaUserShield size={14} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-2.5 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.cashiers}</p>
              <p className="text-emerald-100 text-[10px]">Cashiers</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FaUserCog size={14} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-2.5 text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{stats.waiters}</p>
              <p className="text-amber-100 text-[10px]">Waiters</p>
            </div>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FaConciergeBell size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table - Scrollable */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 flex flex-col flex-1 overflow-hidden min-h-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <HiUsers className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-slate-800 font-semibold">Staff Directory</h2>
              <p className="text-slate-400 text-xs">
                {filteredStaff.length} staff members found
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <IoSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 w-40 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Filter by Role */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:border-blue-400"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Cashier">Cashier</option>
              <option value="Waiter">Waiter</option>
            </select>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:border-blue-400"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Refresh */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <IoRefresh
                className={isFetching ? "animate-spin" : ""}
                size={14}
              />
              Refresh
            </button>

            {/* Add Staff */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <IoPersonAdd size={14} />
              Add Staff
            </button>
          </div>
        </div>

        {/* Table - Scrollable rows */}
        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-slate-500 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-medium w-[5%]">No</th>
                <th className="px-4 py-3 font-medium">Staff Member</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium text-center">Role</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium">Joined Date</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff, index) => (
                  <tr
                    key={staff._id}
                    className="hover:bg-stone-50 transition-colors"
                  >
                    {/* No */}
                    <td className="px-4 py-3">
                      <span className="text-slate-500 font-medium">
                        {index + 1}
                      </span>
                    </td>

                    {/* Staff Member */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          {staff.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || "??"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {staff.name || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-400">
                            ID: {staff._id?.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-xs text-slate-600">
                          <FaEnvelope size={10} className="text-slate-400" />
                          {staff.email || "—"}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-slate-600">
                          <FaPhone size={10} className="text-slate-400" />
                          {staff.phone || "—"}
                        </p>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${getRoleColor(
                          staff.role
                        )}`}
                      >
                        {getRoleIcon(staff.role)}
                        {staff.role || "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                          staff.isActive !== false
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <MdVerified size={12} />
                        {staff.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <FaCalendarAlt size={10} className="text-slate-400" />
                        {staff.createdAt
                          ? formatDateAndTime(staff.createdAt)
                          : "—"}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(staff)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <HiPencil size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(staff)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <HiTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <HiUsers
                      size={48}
                      className="mx-auto text-slate-300 mb-3"
                    />
                    <p className="text-slate-500 font-medium">
                      No staff members found
                    </p>
                    <p className="text-slate-400 text-sm">
                      Add staff members to see them here
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        {filteredStaff.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 bg-stone-50 flex-shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">
                Showing {filteredStaff.length} of {allStaff.length} staff
                members
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {stats.activeStaff} Active
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                {stats.totalStaff - stats.activeStaff} Inactive
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <IoPersonAdd className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Add New Staff</h3>
                  <p className="text-blue-100 text-xs">
                    Fill in the details below
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-white/70 hover:text-white p-1"
              >
                <IoClose size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Admin">Admin</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Waiter">Waiter</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-stone-100 text-slate-600 font-semibold hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition-colors disabled:opacity-50"
                >
                  {addMutation.isPending ? "Adding..." : "Add Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <HiPencil className="text-white" size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Edit Staff</h3>
                  <p className="text-amber-100 text-xs">
                    Update staff information
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStaff(null);
                  resetForm();
                }}
                className="text-white/70 hover:text-white p-1"
              >
                <IoClose size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  New Password{" "}
                  <span className="text-slate-400 text-[10px]">
                    (Leave blank to keep current)
                  </span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                >
                  <option value="Admin">Admin</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Waiter">Waiter</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedStaff(null);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-stone-100 text-slate-600 font-semibold hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:from-amber-600 hover:to-orange-700 transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Updating..." : "Update Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <HiTrash className="text-white" size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Delete Staff</h3>
                  <p className="text-red-100 text-xs">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedStaff(null);
                }}
                className="text-white/70 hover:text-white p-1"
              >
                <IoClose size={22} />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {selectedStaff.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "??"}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {selectedStaff.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedStaff.role} • {selectedStaff.email}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-4">
                Are you sure you want to delete this staff member? This will
                remove all their data permanently.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedStaff(null);
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-stone-100 text-slate-600 font-semibold hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold hover:from-red-600 hover:to-rose-700 transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffInformation;
