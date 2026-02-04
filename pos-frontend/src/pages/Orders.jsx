import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, updateOrderStatus, deleteOrder } from "../https/index";
import { enqueueSnackbar } from "notistack";
import OrdersHeader from "../components/orders/OrdersHeader";
import OrdersTable from "../components/orders/OrdersTable";
import OrderDetailPanel from "../components/orders/OrderDetailPanel";

const Orders = () => {
  const queryClient = useQueryClient();

  const [status, setStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    document.title = "POS | Orders";
  }, []);

  /* ================= FETCH ORDERS ================= */
  const {
    data: orders = [],
    isError,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchInterval: 10000,
  });

  /* ================= UPDATE STATUS ================= */
  const orderStatusMutation = useMutation({
    mutationFn: ({ orderId, orderStatus }) =>
      updateOrderStatus({ orderId, orderStatus }),
    onSuccess: () => {
      enqueueSnackbar("Order status updated!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () =>
      enqueueSnackbar("Failed to update status", { variant: "error" }),
  });

  /* ================= DELETE ORDER ================= */
  const deleteOrderMutation = useMutation({
    mutationFn: (orderId) => deleteOrder(orderId),
    onSuccess: () => {
      enqueueSnackbar("Order deleted successfully!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setSelectedOrder(null);
    },
    onError: () =>
      enqueueSnackbar("Failed to delete order", { variant: "error" }),
  });

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Failed to fetch orders", { variant: "error" });
    }
  }, [isError]);

  /* ================= FILTER ORDERS ================= */
  // ✅ REMOVED .reverse() - Backend already sends newest first
  const filteredOrders = orders
    .filter((order) => status === "all" || order.orderStatus === status)
    .filter((order) => {
      const query = searchQuery.toLowerCase();
      return (
        order.customerDetails?.name?.toLowerCase().includes(query) ||
        order._id?.toLowerCase().includes(query)
      );
    });

  /* ================= STATUS COUNTS ================= */
  const statusCounts = {
    all: orders.length,
    "In Progress": orders.filter(
      (o) => o.orderStatus === "In Progress" || o.orderStatus === "Preparing"
    ).length,
    Ready: orders.filter((o) => o.orderStatus === "Ready").length,
    Paid: orders.filter((o) => o.orderStatus === "Paid").length,
  };

  /* ================= HANDLERS ================= */
  const handleRowClick = (order) => {
    setSelectedOrder(selectedOrder?._id === order._id ? null : order);
  };

  const handleStatusChange = (orderId, orderStatus) => {
    orderStatusMutation.mutate({ orderId, orderStatus });
  };

  const handleDelete = (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  /* ================= UI ================= */
  return (
    <section className="bg-gradient-to-br from-stone-100 to-slate-100 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <OrdersHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        status={status}
        setStatus={setStatus}
        statusCounts={statusCounts}
        refetch={refetch}
        isFetching={isFetching}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <OrdersTable
            orders={filteredOrders}
            isLoading={isLoading}
            selectedOrder={selectedOrder}
            onRowClick={handleRowClick}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />

          {selectedOrder && (
            <OrderDetailPanel
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Orders;
