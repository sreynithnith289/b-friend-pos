import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTables, deleteTable, updateTableStatus } from "../https";
import { enqueueSnackbar } from "notistack";
import TablesHeader from "../components/tables/TablesHeader";
import TablesTable from "../components/tables/TablesTable";
import TableDetailPanel from "../components/tables/TableDetailPanel";

const Tables = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    document.title = "POS | Tables";
  }, []);

  // Fetch tables
  const {
    data: resData,
    isError,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => await getTables(),
  });

  const tables = resData?.data?.data || resData?.data || [];

  // ✅ SYNC selectedTable with latest data from tables array
  useEffect(() => {
    if (selectedTable && tables.length > 0) {
      const updatedTable = tables.find((t) => t._id === selectedTable._id);
      if (updatedTable) {
        setSelectedTable(updatedTable);
      }
    }
  }, [tables]);

  // Update table status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ tableId, status, customerName }) =>
      updateTableStatus({ tableId, status, customerName }),
    onSuccess: (response, variables) => {
      enqueueSnackbar("Table status updated!", { variant: "success" });

      // ✅ IMMEDIATELY update the selectedTable if it's the one being updated
      if (selectedTable && selectedTable._id === variables.tableId) {
        setSelectedTable((prev) => ({
          ...prev,
          status: variables.status,
          customerName: variables.customerName,
        }));
      }

      queryClient.invalidateQueries(["tables"]);
    },
    onError: () =>
      enqueueSnackbar("Failed to update status", { variant: "error" }),
  });

  // Delete table mutation
  const deleteTableMutation = useMutation({
    mutationFn: (tableId) => deleteTable(tableId),
    onSuccess: () => {
      enqueueSnackbar("Table deleted successfully!", { variant: "success" });
      queryClient.invalidateQueries(["tables"]);
      setSelectedTable(null);
    },
    onError: () =>
      enqueueSnackbar("Failed to delete table", { variant: "error" }),
  });

  useEffect(() => {
    if (isError)
      enqueueSnackbar("Failed to fetch tables", { variant: "error" });
  }, [isError]);

  // Filter tables
  const filteredTables = tables
    .filter(
      (table) =>
        status === "all" || table.status?.toLowerCase() === status.toLowerCase()
    )
    .filter(
      (table) =>
        table.tableNo?.toString().includes(searchQuery) ||
        table.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Status counts
  const statusCounts = {
    all: tables.length,
    available: tables.filter((t) => t.status?.toLowerCase() === "available")
      .length,
    booked: tables.filter((t) => t.status?.toLowerCase() === "booked").length,
    "in progress": tables.filter(
      (t) => t.status?.toLowerCase() === "in progress"
    ).length,
  };

  // Handle row click
  const handleRowClick = (table) => {
    setSelectedTable(selectedTable?._id === table._id ? null : table);
  };

  // Handle status change (with customerName)
  const handleStatusChange = (tableId, newStatus, customerName) => {
    updateStatusMutation.mutate({ tableId, status: newStatus, customerName });
  };

  // Handle delete
  const handleDelete = (tableId) => {
    if (window.confirm("Are you sure you want to delete this table?")) {
      deleteTableMutation.mutate(tableId);
    }
  };

  return (
    <section className="bg-gradient-to-br from-stone-100 to-slate-100 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <TablesHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        status={status}
        setStatus={setStatus}
        statusCounts={statusCounts}
        refetch={refetch}
        isFetching={isFetching}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Tables Table */}
          <TablesTable
            tables={filteredTables}
            isLoading={isLoading}
            selectedTable={selectedTable}
            onRowClick={handleRowClick}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />

          {/* Table Detail Panel */}
          {selectedTable && (
            <TableDetailPanel
              table={selectedTable}
              onClose={() => setSelectedTable(null)}
              refetchTables={refetch}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Tables;
