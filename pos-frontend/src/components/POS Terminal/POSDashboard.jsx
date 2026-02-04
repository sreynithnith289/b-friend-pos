import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RiDeleteBin2Fill } from "react-icons/ri";
import {
  FaPlus,
  FaMinus,
  FaReceipt,
  FaCheck,
  FaMoneyBillWave,
  FaQrcode,
  FaSave,
} from "react-icons/fa";
import { IoClose, IoCheckmarkCircle } from "react-icons/io5";
import { HiShoppingCart, HiBanknotes } from "react-icons/hi2";
import { MdTableBar, MdEdit } from "react-icons/md";
import { BsQrCodeScan } from "react-icons/bs";
import {
  addItem,
  removeItem,
  clearCart,
  getTotalKHR,
  getTotalUSD,
} from "../../redux/slices/cartSlice";
import {
  removeCustomer,
  clearEditingState,
} from "../../redux/slices/customerSlice";
import { decreaseStock } from "../../redux/slices/inventorySlice";
import { updateTableStatus } from "../../https";
import QRImage from "../../assets/images/Qrcode.jpg";
import Invoice from "../Invoice/Invoice";
import { formatDate } from "../../utils";
import { enqueueSnackbar } from "notistack";

const EXCHANGE_RATE = 4100;
const khmerFontStyle = {
  fontFamily: "'Kantumruy Pro', 'Noto Sans Khmer', sans-serif",
};
const containsKhmer = (text) => /[\u1780-\u17FF]/.test(text);
const getTextStyle = (text) => (containsKhmer(text) ? khmerFontStyle : {});

const POSDashboard = () => {
  const dispatch = useDispatch();
  const cartData = useSelector((state) => state.cart);
  const totalKHR = useSelector(getTotalKHR);
  const totalUSD = useSelector(getTotalUSD);
  const customer = useSelector((state) => state.customer);
  const isEditMode = !!customer.editingOrderId;

  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [showCashConfirm, setShowCashConfirm] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inProgressLoading, setInProgressLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [cashReceivedKHR, setCashReceivedKHR] = useState(0);
  const [cashReceivedUSD, setCashReceivedUSD] = useState(0);
  const [cashBackKHR, setCashBackKHR] = useState(0);
  const [cashBackUSD, setCashBackUSD] = useState(0);

  const roundRiel = (amount) => Math.round(amount / 100) * 100;
  const scrollRef = useRef();
  const [dateTime] = useState(new Date());
  const quickCashAmounts = [1, 5, 10, 20, 50, 100];

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [cartData]);

  const handleDiscountChange = (value) => {
    if (value === "") {
      setDiscountPercent("");
      return;
    }
    const num = Number(value);
    if (num >= 0 && num <= 100) setDiscountPercent(num);
  };

  const discountKHR = roundRiel((totalKHR * (discountPercent || 0)) / 100);
  const totalWithDiscountKHR = roundRiel(totalKHR - discountKHR);
  const totalWithDiscountUSD = Number(
    (totalWithDiscountKHR / EXCHANGE_RATE).toFixed(2)
  );

  const handleCashReceivedKHRChange = (value) => {
    if (value === "") {
      setCashReceivedKHR("");
      setCashReceivedUSD("");
      setCashBackKHR("");
      setCashBackUSD("");
      return;
    }
    const paidKHR = Number(value) || 0;
    const paidUSD = Number((paidKHR / EXCHANGE_RATE).toFixed(2));
    setCashReceivedKHR(paidKHR);
    setCashReceivedUSD(paidUSD);
    setCashBackKHR(Math.max(paidKHR - totalWithDiscountKHR, 0));
    setCashBackUSD(Math.max(paidUSD - totalWithDiscountUSD, 0));
  };

  const handleCashReceivedUSDChange = (value) => {
    if (value === "") {
      setCashReceivedKHR("");
      setCashReceivedUSD("");
      setCashBackKHR("");
      setCashBackUSD("");
      return;
    }
    const paidUSD = Number(value) || 0;
    const paidKHR = roundRiel(paidUSD * EXCHANGE_RATE);
    setCashReceivedUSD(paidUSD);
    setCashReceivedKHR(paidKHR);
    setCashBackKHR(Math.max(paidKHR - totalWithDiscountKHR, 0));
    setCashBackUSD(Math.max(paidUSD - totalWithDiscountUSD, 0));
  };

  const handleQuickCash = (usd) => {
    const khr = roundRiel(usd * EXCHANGE_RATE);
    setCashReceivedUSD(usd);
    setCashReceivedKHR(khr);
    setCashBackKHR(Math.max(khr - totalWithDiscountKHR, 0));
    setCashBackUSD(Math.max(usd - totalWithDiscountUSD, 0));
  };

  const handleExactAmount = () => {
    setCashReceivedUSD(totalWithDiscountUSD);
    setCashReceivedKHR(totalWithDiscountKHR);
    setCashBackKHR(0);
    setCashBackUSD(0);
  };

  const handleIncrease = (item) => {
    if (!customer?.customerName || customer.customerName.trim() === "") {
      enqueueSnackbar("Please input customer information.", {
        variant: "warning",
      });
      return;
    }
    dispatch(addItem({ ...item, quantity: 1 }));
  };

  const handleDecrease = (item) => {
    if (item.quantity > 1) dispatch(addItem({ ...item, quantity: -1 }));
    else dispatch(removeItem(item.id));
  };

  const resetAllStates = () => {
    setDiscountPercent(0);
    setCashReceivedKHR(0);
    setCashReceivedUSD(0);
    setCashBackKHR(0);
    setCashBackUSD(0);
    setPaymentMethod("");
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    resetAllStates();
  };

  const handleCancelEdit = () => {
    dispatch(clearCart());
    dispatch(removeCustomer());
    resetAllStates();
    enqueueSnackbar("Edit cancelled", { variant: "info" });
  };

  // Function to deduct stock from inventory
  const deductStockFromInventory = (items) => {
    const stockItems = items.map((item) => ({
      name: item.name,
      id: item.id,
      quantity: item.quantity,
    }));

    // Dispatch to Redux store
    dispatch(decreaseStock({ items: stockItems }));

    // Also update localStorage directly for immediate sync
    const savedInventory = localStorage.getItem("inventoryData");
    if (savedInventory) {
      try {
        const inventory = JSON.parse(savedInventory);
        stockItems.forEach((orderItem) => {
          const invItem = inventory.find(
            (i) =>
              i.name === orderItem.name ||
              i._id === orderItem.id ||
              i.id === orderItem.id
          );
          if (invItem) {
            invItem.quantity = Math.max(
              0,
              invItem.quantity - orderItem.quantity
            );
            if (invItem.quantity === 0) {
              invItem.stockStatus = "Out of Stock";
            } else if (invItem.quantity < 15) {
              invItem.stockStatus = "Low Stock";
            } else {
              invItem.stockStatus = "In Stock";
            }
          }
        });
        localStorage.setItem("inventoryData", JSON.stringify(inventory));

        // Trigger storage event for other components
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "inventoryData",
            newValue: JSON.stringify(inventory),
          })
        );
      } catch (e) {
        console.error("Error updating inventory:", e);
      }
    }
  };

  const handleUpdateOrder = async () => {
    if (cartData.length === 0) {
      enqueueSnackbar("Cart is empty!", { variant: "warning" });
      return;
    }
    const updateData = {
      items: cartData.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.priceKHR,
      })),
      bills: {
        total: totalKHR,
        discount: discountKHR,
        totalWithDiscount: totalWithDiscountKHR,
      },
    };
    try {
      setUpdateLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${customer.editingOrderId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updateData),
        }
      );
      if (!res.ok) throw new Error("Failed!");
      enqueueSnackbar("Order updated!", { variant: "success" });
      dispatch(clearCart());
      dispatch(removeCustomer());
      resetAllStates();
    } catch (err) {
      enqueueSnackbar("Failed to update!", { variant: "error" });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSaveInProgress = async () => {
    if (isEditMode) {
      await handleUpdateOrder();
      return;
    }
    if (cartData.length === 0) {
      enqueueSnackbar("Cart is empty!", { variant: "warning" });
      return;
    }
    if (!customer?.customerName) {
      enqueueSnackbar("Please fill customer info!", { variant: "warning" });
      return;
    }
    const orderData = {
      customerDetails: {
        name: customer.customerName,
        phone: customer.customerPhone || "N/A",
        guests: customer.guests || 1,
      },
      table: customer.tableId || null,
      items: cartData.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.priceKHR,
        total: item.totalKHR,
      })),
      bills: {
        total: totalKHR,
        discount: discountKHR,
        totalWithDiscount: totalWithDiscountKHR,
        discountPercent: discountPercent || 0,
      },
      paymentType: paymentMethod || "Cash",
      orderStatus: "In Progress",
    };
    try {
      setInProgressLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderData),
      });
      if (!res.ok) throw new Error("Failed!");
      if (customer.tableId) {
        try {
          await updateTableStatus({
            tableId: customer.tableId,
            status: "In Progress",
            customerName: customer.customerName,
          });
        } catch (e) {}
      }

      // Deduct stock from inventory when order is saved
      deductStockFromInventory(cartData);

      enqueueSnackbar(`Order saved for ${customer.customerName}`, {
        variant: "success",
      });
      dispatch(clearCart());
      dispatch(removeCustomer());
      resetAllStates();
    } catch (err) {
      enqueueSnackbar("Failed!", { variant: "error" });
    } finally {
      setInProgressLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      enqueueSnackbar("Please select payment method!", { variant: "warning" });
      return;
    }
    if (cartData.length === 0) {
      enqueueSnackbar("Cart is empty!", { variant: "warning" });
      return;
    }
    if (isEditMode) {
      const updateData = {
        items: cartData.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.priceKHR,
        })),
        bills: {
          total: totalKHR,
          discount: discountKHR,
          totalWithDiscount: totalWithDiscountKHR,
        },
        paymentType: paymentMethod,
        orderStatus: "Preparing",
      };
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders/${
            customer.editingOrderId
          }`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(updateData),
          }
        );
        if (!res.ok) throw new Error("Failed!");
        const data = await res.json();
        setOrderInfo({
          ...data.data,
          bills: { ...data.data.bills, discountPercent: discountPercent || 0 },
        });
        paymentMethod === "Online" ? setShowQR(true) : setShowCashConfirm(true);
      } catch (err) {
        enqueueSnackbar("Failed to place order!", { variant: "error" });
      } finally {
        setLoading(false);
      }
      return;
    }
    const orderData = {
      customerDetails: {
        name: customer.customerName,
        phone: customer.customerPhone || "N/A",
        guests: customer.guests || 1,
      },
      table: customer.tableId || null,
      items: cartData.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.priceKHR,
        total: item.totalKHR,
      })),
      bills: {
        total: totalKHR,
        discount: discountKHR,
        totalWithDiscount: totalWithDiscountKHR,
        discountPercent: discountPercent || 0,
      },
      paymentType: paymentMethod,
      orderStatus: "Preparing",
    };
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderData),
      });
      if (!res.ok) throw new Error("Failed!");
      const data = await res.json();
      if (customer.tableId) {
        try {
          await updateTableStatus({
            tableId: customer.tableId,
            status: "In Progress",
            customerName: customer.customerName,
          });
        } catch (e) {}
      }
      setOrderInfo({
        ...data.data,
        bills: { ...data.data.bills, discountPercent: discountPercent || 0 },
      });
      paymentMethod === "Online" ? setShowQR(true) : setShowCashConfirm(true);
    } catch (err) {
      enqueueSnackbar("Failed to place order!", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handlePaid = async () => {
    if (!orderInfo?._id) {
      enqueueSnackbar("Order not found!", { variant: "error" });
      return;
    }
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/create-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            orderId: orderInfo._id,
            amount: totalWithDiscountKHR,
            method: paymentMethod,
            contact: customer.customerPhone || "",
          }),
        }
      );
      if (!res.ok) throw new Error("Payment failed!");

      // Show success notification (no blocking alert)
      enqueueSnackbar("Payment successful!", { variant: "success" });

      if (paymentMethod === "Cash")
        setOrderInfo((prev) => ({
          ...prev,
          cashReceivedKHR,
          cashReceivedUSD,
          cashBackKHR,
          cashBackUSD,
        }));
      if (customer.tableId) {
        try {
          await updateTableStatus({
            tableId: customer.tableId,
            status: "Available",
            customerName: "",
          });
        } catch (e) {}
      }

      // Deduct stock from inventory when payment is confirmed
      deductStockFromInventory(cartData);

      setShowQR(false);
      setShowCashConfirm(false);
      setShowInvoice(true);
      dispatch(clearCart());
      dispatch(removeCustomer());
      resetAllStates();
    } catch (err) {
      enqueueSnackbar("Payment error. Please try again.", { variant: "error" });
    }
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setOrderInfo(null);
  };

  return (
    <div className="flex flex-col h-full bg-white text-sm">
      {/* Header */}
      <div
        className={`px-4 py-2.5 flex-shrink-0 ${
          isEditMode
            ? "bg-gradient-to-r from-blue-700 to-indigo-800"
            : "bg-gradient-to-r from-slate-800 to-slate-900"
        }`}
      >
        <div className="flex items-center gap-3">
          {isEditMode && (
            <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <MdEdit className="text-white" size={18} />
            </div>
          )}
          {!isEditMode && customer?.customerName && (
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-bold text-white shadow-md flex-shrink-0">
              {getInitials(customer.customerName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-white truncate">
                {customer?.customerName || "No Customer"}
              </h1>
              {isEditMode && (
                <span className="px-2 py-0.5 bg-white/20 rounded text-xs text-white font-medium">
                  Editing
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs mt-0.5">
              {customer?.tableNo && (
                <>
                  <span className="flex items-center gap-1 text-blue-200">
                    <MdTableBar size={12} />
                    Table {customer.tableNo}
                  </span>
                  <span>•</span>
                </>
              )}
              <span className={isEditMode ? "text-blue-200" : ""}>
                {formatDate(dateTime)}
              </span>
            </div>
          </div>
          {isEditMode && (
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Order Items Header */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-stone-200 bg-stone-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <HiShoppingCart className="text-amber-500" size={14} />
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
            {isEditMode ? "Edit Items" : "Order Items"}
          </span>
          <span
            className={`text-white text-xs font-bold w-5 h-5 rounded flex items-center justify-center ${
              isEditMode ? "bg-blue-500" : "bg-amber-500"
            }`}
          >
            {cartData.length}
          </span>
        </div>
        <button
          onClick={handleClearCart}
          className="text-[11px] font-medium text-red-500 hover:text-red-600 hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-2 bg-stone-50 max-h-[260px]">
        {cartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-stone-400">
            <div className="w-14 h-14 rounded-full bg-stone-200 flex items-center justify-center mb-2">
              <HiShoppingCart size={24} className="opacity-50" />
            </div>
            <p className="font-medium text-slate-500">Cart is empty</p>
            <p className="text-xs text-stone-400">Add items from menu</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {cartData.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-2 border border-stone-200 hover:border-amber-300 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span
                      className={`text-[10px] font-bold text-white px-1 py-0.5 rounded flex-shrink-0 ${
                        isEditMode ? "bg-blue-500" : "bg-amber-500"
                      }`}
                    >
                      ×{item.quantity}
                    </span>
                    <h3
                      className="text-xs font-medium text-slate-700 truncate"
                      style={getTextStyle(item.name)}
                    >
                      {item.name}
                    </h3>
                  </div>
                  <p className="font-bold text-amber-600 text-xs flex-shrink-0">
                    ${item.totalUSD.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-1 pt-1.5 mt-1.5 border-t border-stone-100">
                  <button
                    onClick={() => dispatch(removeItem(item.id))}
                    className="p-1 rounded text-stone-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <RiDeleteBin2Fill size={12} />
                  </button>
                  <div className="flex items-center bg-stone-100 rounded overflow-hidden ml-auto">
                    <button
                      onClick={() => handleDecrease(item)}
                      className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-stone-200"
                    >
                      <FaMinus size={8} />
                    </button>
                    <span className="w-6 h-6 flex items-center justify-center font-semibold text-slate-700 bg-white border-x border-stone-200 text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleIncrease(item)}
                      className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-stone-200"
                    >
                      <FaPlus size={8} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bill & Payment */}
      <div className="border-t border-stone-200 bg-white px-3 py-1.5 flex-shrink-0 space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Subtotal</span>
          <span className="font-medium text-slate-700">
            ${totalUSD.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Discount</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-stone-100 border border-stone-200 rounded-lg overflow-hidden">
              <input
                type="number"
                min={0}
                max={100}
                value={discountPercent === "" ? "" : discountPercent}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="w-14 px-2 py-1.5 text-xs text-center bg-transparent focus:outline-none focus:bg-white transition-colors"
                placeholder="0"
              />
              <span className="px-2 py-1.5 bg-stone-200 text-slate-500 text-xs font-medium">
                %
              </span>
            </div>
            <span className="text-red-500 font-semibold">
              -${(discountKHR / EXCHANGE_RATE).toFixed(2)}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-dashed border-stone-200">
          <span className="font-bold text-slate-700 text-sm">Total</span>
          <div className="text-right">
            <span className="text-lg font-bold text-amber-600">
              ${totalWithDiscountUSD.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">
              ({totalWithDiscountKHR.toLocaleString()}
              <span style={khmerFontStyle}>៛</span>)
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            onClick={() => setPaymentMethod("Cash")}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              paymentMethod === "Cash"
                ? "bg-emerald-500 text-white"
                : "bg-stone-100 text-slate-600 hover:bg-stone-200"
            }`}
          >
            <FaMoneyBillWave size={12} />
            Cash
          </button>
          <button
            onClick={() => setPaymentMethod("Online")}
            className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              paymentMethod === "Online"
                ? "bg-blue-500 text-white"
                : "bg-stone-100 text-slate-600 hover:bg-stone-200"
            }`}
          >
            <FaQrcode size={12} />
            QR
          </button>
          <button
            onClick={handleSaveInProgress}
            disabled={
              inProgressLoading || updateLoading || cartData.length === 0
            }
            className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditMode ? <FaSave size={10} /> : <FaReceipt size={10} />}
            {inProgressLoading || updateLoading
              ? "..."
              : isEditMode
              ? "Update"
              : "In Progress"}
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={loading || cartData.length === 0}
            className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold disabled:opacity-50 hover:bg-amber-600"
          >
            <FaCheck size={10} />
            {loading ? "..." : isEditMode ? "Pay" : "Order"}
          </button>
        </div>
      </div>

      {/* COMPACT QR MODAL - Larger QR Image */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-slideUp">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BsQrCodeScan size={18} className="text-white" />
                <div>
                  <h3 className="font-bold text-white text-sm">Scan to Pay</h3>
                  <p className="text-blue-100 text-xs">
                    ${totalWithDiscountUSD.toFixed(2)} /{" "}
                    {totalWithDiscountKHR.toLocaleString()}
                    <span style={khmerFontStyle}>៛</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQR(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <IoClose size={18} />
              </button>
            </div>
            <div className="p-4 flex justify-center bg-slate-50">
              <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200">
                <img
                  src={QRImage}
                  alt="QR Code"
                  className="w-56 h-56 object-contain"
                />
              </div>
            </div>
            <div className="flex gap-2 p-3 bg-white border-t border-slate-100">
              <button
                onClick={() => setShowQR(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handlePaid}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-1.5"
              >
                <IoCheckmarkCircle size={16} />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPACT CASH MODAL */}
      {showCashConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiBanknotes size={18} className="text-white" />
                <div>
                  <h3 className="font-bold text-white text-sm">Cash Payment</h3>
                  <p className="text-emerald-100 text-xs">
                    ${totalWithDiscountUSD.toFixed(2)} /{" "}
                    {totalWithDiscountKHR.toLocaleString()}
                    <span style={khmerFontStyle}>៛</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCashConfirm(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <IoClose size={18} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={handleExactAmount}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold hover:bg-emerald-200"
                >
                  Exact
                </button>
                {quickCashAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleQuickCash(amt)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                      cashReceivedUSD === amt
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">
                    RECEIVED (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      $
                    </span>
                    <input
                      type="text"
                      value={cashReceivedUSD === 0 ? "" : cashReceivedUSD}
                      onChange={(e) =>
                        handleCashReceivedUSDChange(
                          e.target.value.replace(/[^0-9.]/g, "")
                        )
                      }
                      className="w-full pl-6 pr-2 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:border-emerald-400"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">
                    RECEIVED (KHR)
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
                      style={khmerFontStyle}
                    >
                      ៛
                    </span>
                    <input
                      type="text"
                      value={
                        cashReceivedKHR === 0
                          ? ""
                          : cashReceivedKHR.toLocaleString()
                      }
                      onChange={(e) =>
                        handleCashReceivedKHRChange(
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      className="w-full pl-6 pr-2 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:border-emerald-400"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                <p className="text-[10px] font-semibold text-emerald-600 uppercase mb-2">
                  Change
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-emerald-600">
                      ${cashBackUSD ? Number(cashBackUSD).toFixed(2) : "0.00"}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-emerald-600">
                      {cashBackKHR ? Number(cashBackKHR).toLocaleString() : "0"}
                      <span style={khmerFontStyle}>៛</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-3 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setShowCashConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handlePaid}
                disabled={
                  !cashReceivedUSD || cashReceivedUSD < totalWithDiscountUSD
                }
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IoCheckmarkCircle size={16} />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvoice && orderInfo && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.25s ease-out; }
      `}</style>
    </div>
  );
};

export default POSDashboard;
