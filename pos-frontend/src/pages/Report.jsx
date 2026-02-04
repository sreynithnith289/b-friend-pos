import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { HiCalendar, HiRefresh, HiDocumentReport } from "react-icons/hi";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { getOrders, getAllUsers } from "../https/index";
import html2canvas from "html2canvas";

// Import sub-components
import ReportKPICards from "../components/reports/ReportKPICards";
import SalesChart from "../components/reports/SalesChart";
import TopSellingItems from "../components/reports/TopSellingItems";
import StaffPerformance from "../components/reports/StaffPerformance";
import PaymentBreakdown from "../components/reports/PaymentBreakdown";
import HourlySalesChart from "../components/reports/HourlySalesChart";
import RecentTransactions from "../components/reports/RecentTransactions";

const EXCHANGE_RATE = 4100;

const Reports = () => {
  const [dateRange, setDateRange] = useState("month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders,
    isFetching,
  } = useQuery({
    queryKey: ["reports-orders"],
    queryFn: async () => {
      const response = await getOrders();
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.data?.data)) return response.data.data;
      return [];
    },
    refetchInterval: 30000,
  });

  // Fetch staff
  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ["reports-staff"],
    queryFn: async () => {
      const response = await getAllUsers();
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.data?.data)) return response.data.data;
      if (Array.isArray(response)) return response;
      return [];
    },
  });

  useEffect(() => {
    if (ordersError)
      enqueueSnackbar("Failed to load report data!", { variant: "error" });
  }, [ordersError]);

  // Date filter helper
  const filterByDate = (date) => {
    const orderDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const yearStart = new Date(today.getFullYear(), 0, 1);

    switch (dateRange) {
      case "today":
        const orderDay = new Date(orderDate);
        orderDay.setHours(0, 0, 0, 0);
        return orderDay.getTime() === today.getTime();
      case "yesterday":
        const orderYesterday = new Date(orderDate);
        orderYesterday.setHours(0, 0, 0, 0);
        return orderYesterday.getTime() === yesterday.getTime();
      case "week":
        return orderDate >= weekStart && orderDate <= new Date();
      case "month":
        return orderDate >= monthStart && orderDate <= new Date();
      case "lastMonth":
        return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
      case "year":
        return orderDate >= yearStart && orderDate <= new Date();
      case "custom":
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return orderDate >= start && orderDate <= end;
        }
        return true;
      case "all":
        return true;
      default:
        return true;
    }
  };

  // Filter orders
  const allOrders = ordersData || [];
  const filteredOrders = allOrders.filter((order) =>
    filterByDate(order.createdAt)
  );
  const paidOrders = filteredOrders.filter(
    (order) => order.orderStatus === "Paid" || order.status === "Paid"
  );

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalRevenue = paidOrders.reduce(
      (sum, order) =>
        sum + (order.bills?.totalWithDiscount || order.bills?.total || 0),
      0
    );
    const totalOrders = paidOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const uniqueCustomers = new Set(
      paidOrders
        .map((o) => o.customerDetails?.name?.toLowerCase())
        .filter(Boolean)
    ).size;

    const cashRevenue = paidOrders
      .filter((o) => o.paymentType === "Cash")
      .reduce(
        (sum, o) => sum + (o.bills?.totalWithDiscount || o.bills?.total || 0),
        0
      );
    const onlineRevenue = totalRevenue - cashRevenue;

    const getPreviousPeriodOrders = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (dateRange) {
        case "today": {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return allOrders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === yesterday.getTime();
          });
        }
        case "week": {
          const lastWeekStart = new Date(today);
          lastWeekStart.setDate(lastWeekStart.getDate() - 14);
          const lastWeekEnd = new Date(today);
          lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
          return allOrders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= lastWeekStart && orderDate < lastWeekEnd;
          });
        }
        case "month": {
          const lastMonthStart = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
          );
          const lastMonthEnd = new Date(
            today.getFullYear(),
            today.getMonth(),
            0
          );
          return allOrders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
          });
        }
        default:
          return [];
      }
    };

    const prevPaidOrders = getPreviousPeriodOrders().filter(
      (order) => order.orderStatus === "Paid" || order.status === "Paid"
    );
    const prevRevenue = prevPaidOrders.reduce(
      (sum, order) =>
        sum + (order.bills?.totalWithDiscount || order.bills?.total || 0),
      0
    );

    const revenueGrowth =
      prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersGrowth =
      prevPaidOrders.length > 0
        ? ((totalOrders - prevPaidOrders.length) / prevPaidOrders.length) * 100
        : 0;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      uniqueCustomers,
      cashRevenue,
      onlineRevenue,
      revenueGrowth,
      ordersGrowth,
    };
  }, [paidOrders, allOrders, dateRange]);

  // Top selling items
  const topSellingItems = useMemo(() => {
    const itemMap = new Map();

    paidOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = item.name?.toLowerCase() || "unknown";
        const existing = itemMap.get(key) || {
          name: item.name,
          nameEn: item.nameEn || item.englishName,
          _id: item._id,
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += item.quantity || 1;
        existing.revenue += (item.price || 0) * (item.quantity || 1);
        itemMap.set(key, existing);
      });
    });

    return Array.from(itemMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [paidOrders]);

  // Staff performance
  const staffPerformance = useMemo(() => {
    const staff = staffData || [];
    return staff
      .map((s) => {
        const staffOrders = paidOrders.filter((order) => {
          const creatorId = order.createdBy?._id || order.createdBy;
          return creatorId?.toString() === s._id?.toString();
        });
        const totalSales = staffOrders.reduce(
          (sum, order) =>
            sum + (order.bills?.totalWithDiscount || order.bills?.total || 0),
          0
        );
        return {
          ...s,
          totalOrders: staffOrders.length,
          totalSales,
          avgOrder:
            staffOrders.length > 0 ? totalSales / staffOrders.length : 0,
        };
      })
      .sort((a, b) => b.totalSales - a.totalSales);
  }, [paidOrders, staffData]);

  // Hourly sales data
  const hourlySalesData = useMemo(() => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i.toString().padStart(2, "0")}:00`,
      orders: 0,
      revenue: 0,
    }));

    paidOrders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      hourlyData[hour].orders += 1;
      hourlyData[hour].revenue +=
        order.bills?.totalWithDiscount || order.bills?.total || 0;
    });

    return hourlyData;
  }, [paidOrders]);

  // Daily sales data for chart
  const dailySalesData = useMemo(() => {
    const dailyMap = new Map();

    paidOrders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const existing = dailyMap.get(date) || { date, orders: 0, revenue: 0 };
      existing.orders += 1;
      existing.revenue +=
        order.bills?.totalWithDiscount || order.bills?.total || 0;
      dailyMap.set(date, existing);
    });

    return Array.from(dailyMap.values()).slice(-14);
  }, [paidOrders]);

  const getDateRangeLabel = () => {
    const labels = {
      today: "Today",
      yesterday: "Yesterday",
      week: "This Week",
      month: "This Month",
      lastMonth: "Last Month",
      year: "This Year",
      all: "All Time",
      custom:
        customStartDate && customEndDate
          ? `${customStartDate} - ${customEndDate}`
          : "Custom",
    };
    return labels[dateRange] || "This Month";
  };

  // Helper functions for export
  const formatUSD = (khr) => ((khr || 0) / EXCHANGE_RATE).toFixed(2);
  const formatKHR = (amount) => (amount || 0).toLocaleString();
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // =====================
  // EXCEL EXPORT - Professional Design
  // =====================
  const handleExportExcel = async () => {
    setIsExporting(true);
    enqueueSnackbar("Generating Excel report...", { variant: "info" });

    try {
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "B-Friend POS";
      workbook.created = new Date();

      // ===== PROFESSIONAL SUMMARY SHEET =====
      const summarySheet = workbook.addWorksheet("Dashboard", {
        properties: { tabColor: { argb: "FF4F46E5" } },
        views: [{ showGridLines: false }],
      });

      // Set column widths
      summarySheet.columns = [
        { width: 3 }, // A - margin
        { width: 22 }, // B
        { width: 18 }, // C
        { width: 3 }, // D - spacer
        { width: 22 }, // E
        { width: 18 }, // F
        { width: 3 }, // G - margin
      ];

      // Colors
      const primaryColor = "FF4F46E5"; // Indigo
      const successColor = "FF10B981"; // Green
      const warningColor = "FFF59E0B"; // Amber
      const dangerColor = "FFEF4444"; // Red
      const darkText = "FF1E293B";
      const lightText = "FF64748B";
      const lightBg = "FFF8FAFC";
      const white = "FFFFFFFF";

      // ===== HEADER SECTION =====
      summarySheet.mergeCells("A1:G3");
      const headerCell = summarySheet.getCell("A1");
      headerCell.value = "B-FRIEND POS";
      headerCell.font = { size: 28, bold: true, color: { argb: white } };
      headerCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: primaryColor },
      };
      headerCell.alignment = { horizontal: "center", vertical: "middle" };

      summarySheet.mergeCells("A4:G4");
      const subHeaderCell = summarySheet.getCell("A4");
      subHeaderCell.value = `Sales Report • ${getDateRangeLabel()} • Generated: ${new Date().toLocaleDateString(
        "en-US",
        { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      )}`;
      subHeaderCell.font = { size: 11, color: { argb: white }, italic: true };
      subHeaderCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: primaryColor },
      };
      subHeaderCell.alignment = { horizontal: "center", vertical: "middle" };

      // Row heights
      summarySheet.getRow(1).height = 25;
      summarySheet.getRow(2).height = 25;
      summarySheet.getRow(3).height = 20;
      summarySheet.getRow(4).height = 25;

      // ===== SPACER ROW =====
      summarySheet.getRow(5).height = 15;

      // ===== KPI CARDS SECTION =====
      // Section Title
      summarySheet.mergeCells("B6:F6");
      const kpiTitle = summarySheet.getCell("B6");
      kpiTitle.value = "📊 KEY PERFORMANCE INDICATORS";
      kpiTitle.font = { size: 14, bold: true, color: { argb: darkText } };
      kpiTitle.alignment = { horizontal: "left", vertical: "middle" };
      summarySheet.getRow(6).height = 30;

      // Helper function to create KPI card
      const createKPICard = (
        startRow,
        col,
        label,
        value,
        subValue,
        color,
        icon
      ) => {
        const colLetter = col === 1 ? "B" : "E";
        const colLetter2 = col === 1 ? "C" : "F";

        // Card background
        for (let r = startRow; r <= startRow + 3; r++) {
          summarySheet.getCell(`${colLetter}${r}`).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: lightBg },
          };
          summarySheet.getCell(`${colLetter2}${r}`).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: lightBg },
          };
        }

        // Color accent bar (left border simulation)
        for (let r = startRow; r <= startRow + 3; r++) {
          summarySheet.getCell(`${colLetter}${r}`).border = {
            left: { style: "thick", color: { argb: color } },
          };
        }

        // Top border
        summarySheet.getCell(`${colLetter}${startRow}`).border = {
          left: { style: "thick", color: { argb: color } },
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
        summarySheet.getCell(`${colLetter2}${startRow}`).border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };

        // Bottom border
        summarySheet.getCell(`${colLetter}${startRow + 3}`).border = {
          left: { style: "thick", color: { argb: color } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
        summarySheet.getCell(`${colLetter2}${startRow + 3}`).border = {
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };

        // Right border for middle rows
        summarySheet.getCell(`${colLetter2}${startRow + 1}`).border = {
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
        summarySheet.getCell(`${colLetter2}${startRow + 2}`).border = {
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };

        // Icon & Label
        summarySheet.getCell(
          `${colLetter}${startRow + 1}`
        ).value = `${icon} ${label}`;
        summarySheet.getCell(`${colLetter}${startRow + 1}`).font = {
          size: 10,
          color: { argb: lightText },
        };

        // Value
        summarySheet.mergeCells(
          `${colLetter}${startRow + 2}:${colLetter2}${startRow + 2}`
        );
        summarySheet.getCell(`${colLetter}${startRow + 2}`).value = value;
        summarySheet.getCell(`${colLetter}${startRow + 2}`).font = {
          size: 22,
          bold: true,
          color: { argb: darkText },
        };
        summarySheet.getCell(`${colLetter}${startRow + 2}`).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: lightBg },
        };

        // Sub value
        summarySheet.getCell(`${colLetter}${startRow + 3}`).value = subValue;
        summarySheet.getCell(`${colLetter}${startRow + 3}`).font = {
          size: 9,
          color: { argb: lightText },
        };
      };

      // Row heights for KPI cards
      for (let i = 7; i <= 22; i++) {
        summarySheet.getRow(i).height = 22;
      }

      // Calculate growth indicators
      const revenueGrowthText =
        kpis.revenueGrowth >= 0
          ? `↑ ${kpis.revenueGrowth.toFixed(1)}% vs last period`
          : `↓ ${Math.abs(kpis.revenueGrowth).toFixed(1)}% vs last period`;
      const ordersGrowthText =
        kpis.ordersGrowth >= 0
          ? `↑ ${kpis.ordersGrowth.toFixed(1)}% vs last period`
          : `↓ ${Math.abs(kpis.ordersGrowth).toFixed(1)}% vs last period`;

      // KPI Cards - Row 1
      createKPICard(
        7,
        1,
        "TOTAL REVENUE",
        `$${formatUSD(kpis.totalRevenue)}`,
        `៛${formatKHR(kpis.totalRevenue)} KHR`,
        successColor,
        "💰"
      );
      createKPICard(
        7,
        2,
        "TOTAL ORDERS",
        kpis.totalOrders.toString(),
        ordersGrowthText,
        primaryColor,
        "📦"
      );

      // KPI Cards - Row 2
      createKPICard(
        12,
        1,
        "AVERAGE ORDER",
        `$${formatUSD(kpis.avgOrderValue)}`,
        `Per transaction`,
        warningColor,
        "📈"
      );
      createKPICard(
        12,
        2,
        "CUSTOMERS",
        kpis.uniqueCustomers.toString(),
        `Unique customers served`,
        "FF8B5CF6",
        "👥"
      );

      // KPI Cards - Row 3
      createKPICard(
        17,
        1,
        "CASH PAYMENTS",
        `$${formatUSD(kpis.cashRevenue)}`,
        `${
          kpis.totalRevenue > 0
            ? ((kpis.cashRevenue / kpis.totalRevenue) * 100).toFixed(1)
            : 0
        }% of total`,
        successColor,
        "💵"
      );
      createKPICard(
        17,
        2,
        "DIGITAL PAYMENTS",
        `$${formatUSD(kpis.onlineRevenue)}`,
        `${
          kpis.totalRevenue > 0
            ? ((kpis.onlineRevenue / kpis.totalRevenue) * 100).toFixed(1)
            : 0
        }% of total`,
        "FF3B82F6",
        "💳"
      );

      // ===== SPACER =====
      summarySheet.getRow(22).height = 20;

      // ===== TOP SELLING ITEMS SECTION =====
      summarySheet.mergeCells("B23:F23");
      const topItemsTitle = summarySheet.getCell("B23");
      topItemsTitle.value = "🏆 TOP 5 BEST SELLERS";
      topItemsTitle.font = { size: 14, bold: true, color: { argb: darkText } };
      summarySheet.getRow(23).height = 30;

      // Table Header
      const topItemsHeader = [
        "#",
        "Item Name",
        "Qty Sold",
        "Revenue (USD)",
        "Revenue (KHR)",
      ];
      const headerCols = ["B", "C", "D", "E", "F"];
      headerCols.forEach((col, idx) => {
        const cell = summarySheet.getCell(`${col}24`);
        cell.value = topItemsHeader[idx];
        cell.font = { size: 10, bold: true, color: { argb: white } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: warningColor },
        };
        cell.alignment = {
          horizontal: idx >= 2 ? "right" : "left",
          vertical: "middle",
        };
        cell.border = {
          top: { style: "thin", color: { argb: warningColor } },
          bottom: { style: "thin", color: { argb: warningColor } },
        };
      });
      summarySheet.getRow(24).height = 25;

      // Table Data
      topSellingItems.slice(0, 5).forEach((item, index) => {
        const rowNum = 25 + index;
        const bgColor = index % 2 === 0 ? white : lightBg;

        const rowData = [
          index + 1,
          item.name || "Unknown",
          item.quantity,
          `$${formatUSD(item.revenue)}`,
          `៛${formatKHR(item.revenue)}`,
        ];

        headerCols.forEach((col, idx) => {
          const cell = summarySheet.getCell(`${col}${rowNum}`);
          cell.value = rowData[idx];
          cell.font = { size: 10, color: { argb: darkText } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: bgColor },
          };
          cell.alignment = {
            horizontal: idx >= 2 ? "right" : "left",
            vertical: "middle",
          };
          cell.border = {
            bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          };
        });
        summarySheet.getRow(rowNum).height = 22;
      });

      // ===== SPACER =====
      summarySheet.getRow(31).height = 20;

      // ===== STAFF PERFORMANCE SECTION =====
      summarySheet.mergeCells("B32:F32");
      const staffTitle = summarySheet.getCell("B32");
      staffTitle.value = "👨‍💼 TOP STAFF PERFORMANCE";
      staffTitle.font = { size: 14, bold: true, color: { argb: darkText } };
      summarySheet.getRow(32).height = 30;

      // Staff Table Header
      const staffHeader = ["#", "Staff Name", "Role", "Orders", "Total Sales"];
      headerCols.forEach((col, idx) => {
        const cell = summarySheet.getCell(`${col}33`);
        cell.value = staffHeader[idx];
        cell.font = { size: 10, bold: true, color: { argb: white } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF3B82F6" },
        };
        cell.alignment = {
          horizontal: idx >= 3 ? "right" : "left",
          vertical: "middle",
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FF3B82F6" } },
          bottom: { style: "thin", color: { argb: "FF3B82F6" } },
        };
      });
      summarySheet.getRow(33).height = 25;

      // Staff Table Data
      staffPerformance.slice(0, 5).forEach((staff, index) => {
        const rowNum = 34 + index;
        const bgColor = index % 2 === 0 ? white : lightBg;

        const rowData = [
          index + 1,
          staff.name || "Unknown",
          staff.role || "Staff",
          staff.totalOrders,
          `$${formatUSD(staff.totalSales)}`,
        ];

        headerCols.forEach((col, idx) => {
          const cell = summarySheet.getCell(`${col}${rowNum}`);
          cell.value = rowData[idx];
          cell.font = { size: 10, color: { argb: darkText } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: bgColor },
          };
          cell.alignment = {
            horizontal: idx >= 3 ? "right" : "left",
            vertical: "middle",
          };
          cell.border = {
            bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          };
        });
        summarySheet.getRow(rowNum).height = 22;
      });

      // ===== FOOTER =====
      summarySheet.getRow(40).height = 30;
      summarySheet.mergeCells("B41:F41");
      const footer = summarySheet.getCell("B41");
      footer.value = "Generated by B-Friend POS System • www.bfriend.com";
      footer.font = { size: 9, italic: true, color: { argb: lightText } };
      footer.alignment = { horizontal: "center" };

      // ===== TRANSACTIONS SHEET =====
      const transSheet = workbook.addWorksheet("Transactions", {
        properties: { tabColor: { argb: "FF10B981" } },
      });

      transSheet.columns = [
        { header: "Order ID", key: "orderId", width: 15 },
        { header: "Date & Time", key: "date", width: 20 },
        { header: "Customer", key: "customer", width: 20 },
        { header: "Table", key: "table", width: 10 },
        { header: "Items", key: "items", width: 8 },
        { header: "Payment", key: "payment", width: 12 },
        { header: "Total (USD)", key: "totalUSD", width: 12 },
        { header: "Total (KHR)", key: "totalKHR", width: 15 },
        { header: "Staff", key: "staff", width: 15 },
      ];

      // Style header row
      transSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      transSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF10B981" },
      };

      paidOrders.forEach((order) => {
        const total = order.bills?.totalWithDiscount || order.bills?.total || 0;
        transSheet.addRow({
          orderId: `#${order._id?.slice(-6).toUpperCase() || "N/A"}`,
          date: formatDate(order.createdAt),
          customer: order.customerDetails?.name || "Guest",
          table: order.table?.tableNo ? `T-${order.table.tableNo}` : "-",
          items: order.items?.length || 0,
          payment: order.paymentType || "Cash",
          totalUSD: `$${formatUSD(total)}`,
          totalKHR: `៛${formatKHR(total)}`,
          staff: order.createdBy?.name || "Unknown",
        });
      });

      // ===== TOP ITEMS SHEET =====
      const itemsSheet = workbook.addWorksheet("Top Items", {
        properties: { tabColor: { argb: "FFF59E0B" } },
      });

      itemsSheet.columns = [
        { header: "Rank", key: "rank", width: 8 },
        { header: "Item Name", key: "name", width: 30 },
        { header: "Qty Sold", key: "quantity", width: 12 },
        { header: "Revenue (USD)", key: "revenueUSD", width: 15 },
        { header: "Revenue (KHR)", key: "revenueKHR", width: 18 },
      ];

      itemsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      itemsSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF59E0B" },
      };

      topSellingItems.forEach((item, index) => {
        itemsSheet.addRow({
          rank: index + 1,
          name: item.name || "Unknown",
          quantity: item.quantity,
          revenueUSD: `$${formatUSD(item.revenue)}`,
          revenueKHR: `៛${formatKHR(item.revenue)}`,
        });
      });

      // ===== STAFF SHEET =====
      const staffSheet = workbook.addWorksheet("Staff Performance", {
        properties: { tabColor: { argb: "FF3B82F6" } },
      });

      staffSheet.columns = [
        { header: "Rank", key: "rank", width: 8 },
        { header: "Staff Name", key: "name", width: 20 },
        { header: "Role", key: "role", width: 12 },
        { header: "Orders", key: "orders", width: 10 },
        { header: "Sales (USD)", key: "salesUSD", width: 15 },
        { header: "Sales (KHR)", key: "salesKHR", width: 18 },
        { header: "Avg Order (USD)", key: "avgOrder", width: 15 },
      ];

      staffSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      staffSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF3B82F6" },
      };

      staffPerformance.forEach((staff, index) => {
        staffSheet.addRow({
          rank: index + 1,
          name: staff.name || "Unknown",
          role: staff.role || "Staff",
          orders: staff.totalOrders,
          salesUSD: `$${formatUSD(staff.totalSales)}`,
          salesKHR: `៛${formatKHR(staff.totalSales)}`,
          avgOrder: `$${formatUSD(staff.avgOrder)}`,
        });
      });

      // ===== DAILY SALES SHEET =====
      const dailySheet = workbook.addWorksheet("Daily Sales", {
        properties: { tabColor: { argb: "FF8B5CF6" } },
      });

      dailySheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Orders", key: "orders", width: 10 },
        { header: "Revenue (USD)", key: "revenueUSD", width: 15 },
        { header: "Revenue (KHR)", key: "revenueKHR", width: 18 },
      ];

      dailySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      dailySheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF8B5CF6" },
      };

      dailySalesData.forEach((day) => {
        dailySheet.addRow({
          date: day.date,
          orders: day.orders,
          revenueUSD: `$${formatUSD(day.revenue)}`,
          revenueKHR: `៛${formatKHR(day.revenue)}`,
        });
      });

      // Generate and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BFriend_Report_${getDateRangeLabel().replace(/\s/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      enqueueSnackbar("Excel report downloaded successfully!", {
        variant: "success",
      });
    } catch (error) {
      console.error("Excel export error:", error);
      enqueueSnackbar("Failed to export Excel. Please try again.", {
        variant: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // =====================
  // PDF EXPORT - Using HTML Canvas for proper Khmer rendering
  // =====================
  const handleExportPDF = async () => {
    setIsExporting(true);
    enqueueSnackbar("Generating PDF report...", { variant: "info" });

    try {
      const { default: jsPDF } = await import("jspdf");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;

      // Colors
      const primaryColor = [79, 70, 229];
      const textDark = [30, 41, 59];
      const textLight = [100, 116, 139];

      // ===== HEADER =====
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("B-Friend POS", 14, 18);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Sales Report", 14, 26);

      doc.setFontSize(10);
      doc.text(
        `${getDateRangeLabel()} | ${new Date().toLocaleDateString()}`,
        pageWidth - 14,
        22,
        { align: "right" }
      );

      // ===== KPI CARDS =====
      let yPos = 45;

      doc.setTextColor(...textDark);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Summary Overview", 14, yPos);

      yPos += 10;

      // KPI boxes
      const kpiBoxes = [
        {
          label: "Total Revenue",
          value: `$${formatUSD(kpis.totalRevenue)}`,
          sub: `KHR ${formatKHR(kpis.totalRevenue)}`,
        },
        {
          label: "Total Orders",
          value: kpis.totalOrders.toString(),
          sub: `Avg: $${formatUSD(kpis.avgOrderValue)}`,
        },
        {
          label: "Cash Sales",
          value: `$${formatUSD(kpis.cashRevenue)}`,
          sub: `${
            kpis.totalRevenue > 0
              ? ((kpis.cashRevenue / kpis.totalRevenue) * 100).toFixed(1)
              : 0
          }%`,
        },
        {
          label: "Online/QR Sales",
          value: `$${formatUSD(kpis.onlineRevenue)}`,
          sub: `${
            kpis.totalRevenue > 0
              ? ((kpis.onlineRevenue / kpis.totalRevenue) * 100).toFixed(1)
              : 0
          }%`,
        },
      ];

      const boxWidth = (pageWidth - 28 - 15) / 4;
      kpiBoxes.forEach((kpi, index) => {
        const x = 14 + index * (boxWidth + 5);

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, yPos, boxWidth, 28, 3, 3, "F");

        doc.setTextColor(...textLight);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(kpi.label, x + 5, yPos + 8);

        doc.setTextColor(...textDark);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(kpi.value, x + 5, yPos + 18);

        doc.setTextColor(...textLight);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(kpi.sub, x + 5, yPos + 24);
      });

      yPos += 38;

      // ===== TOP SELLING ITEMS - Render as image for Khmer support =====
      doc.setTextColor(...textDark);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Top Selling Items", 14, yPos);
      yPos += 5;

      // Create hidden div for rendering
      const topItemsHtml = `
        <div style="font-family: 'Kantumruy Pro', 'Noto Sans Khmer', sans-serif; width: 550px; background: white; padding: 10px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f59e0b; color: white;">
                <th style="padding: 8px; text-align: left; width: 30px;">#</th>
                <th style="padding: 8px; text-align: left;">Item Name</th>
                <th style="padding: 8px; text-align: center; width: 50px;">Qty</th>
                <th style="padding: 8px; text-align: right; width: 80px;">Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${topSellingItems
                .slice(0, 5)
                .map(
                  (item, index) => `
                <tr style="background: ${
                  index % 2 === 0 ? "#fff" : "#f8fafc"
                };">
                  <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${
                    index + 1
                  }</td>
                  <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${
                    item.name || "Unknown"
                  }</td>
                  <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">${
                    item.quantity
                  }</td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e2e8f0;">$${formatUSD(
                    item.revenue
                  )}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;

      // Render HTML to canvas
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = topItemsHtml;
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "-9999px";
      document.body.appendChild(tempDiv);

      const tableElement = tempDiv.querySelector("div");

      try {
        const canvas = await html2canvas(tableElement, {
          scale: 2,
          useCORS: true,
          logging: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        doc.addImage(imgData, "PNG", margin, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 10;
      } catch (canvasError) {
        console.error("html2canvas error:", canvasError);
        // Fallback to simple text if html2canvas fails
        topSellingItems.slice(0, 5).forEach((item, index) => {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(
            `${index + 1}. ${item.name || "Unknown"} - Qty: ${
              item.quantity
            } - $${formatUSD(item.revenue)}`,
            margin,
            yPos + 5
          );
          yPos += 8;
        });
        yPos += 10;
      }

      document.body.removeChild(tempDiv);

      // ===== STAFF PERFORMANCE =====
      doc.setTextColor(...textDark);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Staff Performance", 14, yPos);
      yPos += 5;

      // Create staff table as image
      const staffHtml = `
        <div style="font-family: 'Kantumruy Pro', 'Noto Sans Khmer', sans-serif; width: 550px; background: white; padding: 10px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #3b82f6; color: white;">
                <th style="padding: 8px; text-align: left; width: 30px;">#</th>
                <th style="padding: 8px; text-align: left;">Name</th>
                <th style="padding: 8px; text-align: left; width: 70px;">Role</th>
                <th style="padding: 8px; text-align: center; width: 60px;">Orders</th>
                <th style="padding: 8px; text-align: right; width: 80px;">Sales</th>
              </tr>
            </thead>
            <tbody>
              ${staffPerformance
                .slice(0, 5)
                .map(
                  (staff, index) => `
                <tr style="background: ${
                  index % 2 === 0 ? "#fff" : "#f8fafc"
                };">
                  <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${
                    index + 1
                  }</td>
                  <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${
                    staff.name || "Unknown"
                  }</td>
                  <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${
                    staff.role || "Staff"
                  }</td>
                  <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">${
                    staff.totalOrders
                  }</td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e2e8f0;">$${formatUSD(
                    staff.totalSales
                  )}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;

      const staffDiv = document.createElement("div");
      staffDiv.innerHTML = staffHtml;
      staffDiv.style.position = "absolute";
      staffDiv.style.left = "-9999px";
      staffDiv.style.top = "-9999px";
      document.body.appendChild(staffDiv);

      const staffTableElement = staffDiv.querySelector("div");

      try {
        const staffCanvas = await html2canvas(staffTableElement, {
          scale: 2,
          useCORS: true,
          logging: true,
          backgroundColor: "#ffffff",
        });

        const staffImgData = staffCanvas.toDataURL("image/png");
        const staffImgWidth = pageWidth - margin * 2;
        const staffImgHeight =
          (staffCanvas.height * staffImgWidth) / staffCanvas.width;

        doc.addImage(
          staffImgData,
          "PNG",
          margin,
          yPos,
          staffImgWidth,
          staffImgHeight
        );
        yPos += staffImgHeight + 10;
      } catch (canvasError) {
        console.error("html2canvas staff error:", canvasError);
        staffPerformance.slice(0, 5).forEach((staff, index) => {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(
            `${index + 1}. ${staff.name || "Unknown"} - ${
              staff.role || "Staff"
            } - Orders: ${staff.totalOrders} - $${formatUSD(staff.totalSales)}`,
            margin,
            yPos + 5
          );
          yPos += 8;
        });
        yPos += 10;
      }

      document.body.removeChild(staffDiv);

      // ===== RECENT TRANSACTIONS (New Page) =====
      doc.addPage();

      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 20, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Recent Transactions", 14, 14);

      // Transactions table as image
      const transHtml = `
        <div style="font-family: 'Kantumruy Pro', 'Noto Sans Khmer', sans-serif; width: 550px; background: white; padding: 10px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: #10b981; color: white;">
                <th style="padding: 8px; text-align: left;">Order ID</th>
                <th style="padding: 8px; text-align: left;">Date</th>
                <th style="padding: 8px; text-align: left;">Customer</th>
                <th style="padding: 8px; text-align: left;">Payment</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${paidOrders
                .slice(0, 15)
                .map((order, index) => {
                  const total =
                    order.bills?.totalWithDiscount || order.bills?.total || 0;
                  return `
                  <tr style="background: ${
                    index % 2 === 0 ? "#fff" : "#f8fafc"
                  };">
                    <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0;">#${
                      order._id?.slice(-6).toUpperCase() || "N/A"
                    }</td>
                    <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0;">${new Date(
                      order.createdAt
                    ).toLocaleDateString()}</td>
                    <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0;">${
                      order.customerDetails?.name || "Guest"
                    }</td>
                    <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0;">${
                      order.paymentType || "Cash"
                    }</td>
                    <td style="padding: 6px 8px; text-align: right; border-bottom: 1px solid #e2e8f0;">$${formatUSD(
                      total
                    )}</td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      `;

      const transDiv = document.createElement("div");
      transDiv.innerHTML = transHtml;
      transDiv.style.position = "absolute";
      transDiv.style.left = "-9999px";
      transDiv.style.top = "-9999px";
      document.body.appendChild(transDiv);

      const transTableElement = transDiv.querySelector("div");

      try {
        const transCanvas = await html2canvas(transTableElement, {
          scale: 2,
          useCORS: true,
          logging: true,
          backgroundColor: "#ffffff",
        });

        const transImgData = transCanvas.toDataURL("image/png");
        const transImgWidth = pageWidth - margin * 2;
        const transImgHeight =
          (transCanvas.height * transImgWidth) / transCanvas.width;

        doc.addImage(
          transImgData,
          "PNG",
          margin,
          28,
          transImgWidth,
          transImgHeight
        );
      } catch (canvasError) {
        console.error("html2canvas transactions error:", canvasError);
      }

      document.body.removeChild(transDiv);

      // ===== FOOTER =====
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setTextColor(...textLight);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Page ${i} of ${pageCount} | Generated by B-Friend POS`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      // Save PDF
      doc.save(
        `BFriend_Report_${getDateRangeLabel().replace(/\s/g, "_")}_${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );

      enqueueSnackbar("PDF report downloaded successfully!", {
        variant: "success",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      enqueueSnackbar("Failed to export PDF. Please try again.", {
        variant: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    refetchOrders();
    enqueueSnackbar("Refreshing report data...", { variant: "info" });
  };

  if (ordersLoading || staffLoading) {
    return (
      <div className="flex-1 bg-stone-100 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <HiRefresh className="animate-spin text-amber-500" size={40} />
          <p className="text-slate-500 font-medium">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col h-full bg-stone-100 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-stone-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <HiDocumentReport className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Reports & Analytics
                </h1>
                <p className="text-sm text-slate-500">
                  Business performance insights • {getDateRangeLabel()}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Range Selector */}
              <div className="flex items-center gap-2 bg-stone-100 px-3 py-2 rounded-xl border border-stone-200">
                <HiCalendar className="text-slate-500" size={18} />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Custom Date Range */}
              {dateRange === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 bg-stone-100 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 bg-stone-100 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
              )}

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={isFetching}
                className="flex items-center gap-2 px-4 py-2 bg-stone-100 border border-stone-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-stone-200 transition-colors disabled:opacity-50"
              >
                <HiRefresh
                  className={isFetching ? "animate-spin" : ""}
                  size={16}
                />
                Refresh
              </button>

              {/* Export Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <HiRefresh className="animate-spin" size={14} />
                  ) : (
                    <FaFileExcel size={14} />
                  )}
                  Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <HiRefresh className="animate-spin" size={14} />
                  ) : (
                    <FaFilePdf size={14} />
                  )}
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-[1800px] mx-auto">
          {/* KPI Cards */}
          <ReportKPICards kpis={kpis} dateRange={getDateRangeLabel()} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SalesChart data={dailySalesData} title="Sales Trend" />
            <HourlySalesChart data={hourlySalesData} />
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="min-h-[420px]">
              <TopSellingItems items={topSellingItems} />
            </div>
            <div className="min-h-[420px]">
              <PaymentBreakdown
                cashRevenue={kpis.cashRevenue}
                onlineRevenue={kpis.onlineRevenue}
                totalRevenue={kpis.totalRevenue}
              />
            </div>
            <div className="min-h-[420px]">
              <StaffPerformance staff={staffPerformance} />
            </div>
          </div>

          {/* Recent Transactions */}
          <RecentTransactions orders={paidOrders.slice(0, 10)} />
        </div>
      </div>
    </section>
  );
};

export default Reports;
