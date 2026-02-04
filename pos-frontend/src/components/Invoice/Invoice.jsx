import React, { useRef } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaPrint } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { removeCustomer } from "../../redux/slices/customerSlice";
import { clearCart } from "../../redux/slices/cartSlice";
import logo from "../../assets/images/logo.jpg";

const EXCHANGE_RATE = 4100;

const Invoice = ({ orderInfo, setShowInvoice }) => {
  const printRef = useRef(null);
  const dispatch = useDispatch();

  // ✅ Get staff info from Redux
  const user = useSelector((state) => state.user);
  const staffName = user?.name || "Staff";
  const staffPhone = user?.phone || "";

  const formatUSD = (khr) => (khr / EXCHANGE_RATE).toFixed(2);
  const roundRiel = (amount) => Math.round(amount / 100) * 100;

  const cashReceivedKHR = orderInfo?.cashReceivedKHR || 0;
  const cashBackKHR = orderInfo?.cashBackKHR || 0;
  const cashReceivedUSD = (cashReceivedKHR / EXCHANGE_RATE).toFixed(2);
  const cashBackUSD = (cashBackKHR / EXCHANGE_RATE).toFixed(2);
  const discountPercent = orderInfo?.bills?.discountPercent || 0;

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const orderId = (orderInfo?._id || orderInfo?.orderId || "")
    .slice(-8)
    .toUpperCase();

  const handlePrint = () => {
    // Convert logo to base64 for print
    const logoUrl = logo;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: 80mm auto;
              margin: 0mm;
            }
            @media print {
              html, body {
                width: 80mm;
                margin: 0;
                padding: 0;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              line-height: 1.3;
              width: 72mm;
              padding: 2mm;
              background: #fff;
              color: #000;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider {
              border-top: 1px dashed #000;
              margin: 4px 0;
            }
            .divider-double {
              border-top: 2px solid #000;
              margin: 6px 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            .item-name {
              flex: 1;
              padding-right: 5px;
            }
            .item-qty {
              min-width: 25px;
            }
            .item-price {
              min-width: 50px;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              font-weight: bold;
              margin: 4px 0;
            }
            .header {
              text-align: center;
              margin-bottom: 8px;
            }
            .logo {
              width: 50px;
              height: 50px;
              border-radius: 50%;
              margin: 0 auto 4px;
            }
            .restaurant-name {
              font-size: 16px;
              font-weight: bold;
            }
            .info {
              font-size: 10px;
              color: #333;
            }
            .footer {
              text-align: center;
              margin-top: 10px;
              font-size: 11px;
            }
            .payment-badge {
              text-align: center;
              padding: 4px;
              margin: 6px 0;
              border: 1px solid #000;
              font-weight: bold;
            }
            .section-title {
              font-weight: bold;
              font-size: 11px;
              margin: 4px 0 2px;
              text-align: center;
              background: #eee;
              padding: 2px;
            }
            .staff-section {
              background: #f5f5f5;
              padding: 4px;
              margin: 4px 0;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="header">
            <img src="${logoUrl}" alt="Logo" class="logo" />
            <div class="restaurant-name">B-FRIEND RESTAURANT</div>
            <div class="info">Authentic Cambodian Cuisine</div>
            <div class="info">Svay Rieng, Cambodia</div>
            <div class="info">Tel: +855 12 345 678</div>
          </div>

          <div class="divider"></div>

          <!-- Order Info -->
          <div class="row">
            <span>Date:</span>
            <span>${currentDate}</span>
          </div>
          <div class="row">
            <span>Time:</span>
            <span>${currentTime}</span>
          </div>
          <div class="row">
            <span>Order #:</span>
            <span class="bold">${orderId}</span>
          </div>
          <div class="row">
            <span>Customer:</span>
            <span>${orderInfo?.customerDetails?.name || "Walk-in"}</span>
          </div>
          ${
            orderInfo?.customerDetails?.phone &&
            orderInfo.customerDetails.phone !== "N/A"
              ? `<div class="row"><span>Phone:</span><span>${orderInfo.customerDetails.phone}</span></div>`
              : ""
          }
          <div class="row">
            <span>Guests:</span>
            <span>${orderInfo?.customerDetails?.guests || 1}</span>
          </div>
          ${
            orderInfo?.table
              ? `<div class="row"><span>Table:</span><span>${orderInfo.table}</span></div>`
              : ""
          }

          <!-- ✅ Staff Info -->
          <div class="staff-section">
            <div class="row">
              <span>Staff:</span>
              <span>${staffName}</span>
            </div>
            ${
              staffPhone
                ? `<div class="row"><span>Staff Tel:</span><span>${staffPhone}</span></div>`
                : ""
            }
          </div>

          <div class="divider"></div>

          <!-- Items -->
          <div class="section-title">ORDER ITEMS</div>
          ${
            orderInfo?.items
              ?.map(
                (item) => `
            <div class="item-row">
              <span class="item-qty">x${item.quantity}</span>
              <span class="item-name">${item.name}</span>
              <span class="item-price">$${formatUSD(
                item.price * item.quantity
              )}</span>
            </div>
          `
              )
              .join("") || ""
          }

          <div class="divider"></div>

          <!-- Totals -->
          <div class="row">
            <span>Subtotal:</span>
            <span>$${formatUSD(orderInfo?.bills?.total)}</span>
          </div>
          ${
            discountPercent > 0
              ? `
          <div class="row">
            <span>Discount (${discountPercent}%):</span>
            <span>-$${formatUSD(orderInfo?.bills?.discount || 0)}</span>
          </div>
          `
              : ""
          }

          <div class="divider-double"></div>

          <div class="total-row">
            <span>TOTAL:</span>
            <span>$${formatUSD(orderInfo?.bills?.totalWithDiscount)}</span>
          </div>
          <div class="row">
            <span></span>
            <span>៛ ${roundRiel(
              orderInfo?.bills?.totalWithDiscount
            ).toLocaleString()}</span>
          </div>

          ${
            orderInfo?.paymentType === "Cash" && cashReceivedKHR > 0
              ? `
          <div class="divider"></div>
          <div class="row">
            <span>Cash Received:</span>
            <span>$${cashReceivedUSD}</span>
          </div>
          <div class="row">
            <span>Change:</span>
            <span class="bold">$${cashBackUSD}</span>
          </div>
          `
              : ""
          }

          <div class="payment-badge">✓ PAID BY ${(
            orderInfo?.paymentType || "CASH"
          ).toUpperCase()}</div>

          <!-- Footer -->
          <div class="footer">
            <div class="bold">Thank You!</div>
            <div>Please come again 🙏</div>
            <div class="divider" style="margin-top:8px;"></div>
            <div style="font-size:10px;margin-top:4px;">${orderId}</div>
          </div>

          <div style="height:20px;"></div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");

    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();

      printWindow.onload = function () {
        setTimeout(() => {
          printWindow.print();
        }, 100);
      };

      printWindow.onafterprint = function () {
        printWindow.close();
        dispatch(removeCustomer());
        dispatch(clearCart());
        setShowInvoice(false);
      };
    }
  };

  const handleClose = () => {
    dispatch(removeCustomer());
    dispatch(clearCart());
    setShowInvoice(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-[320px] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-3 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden"
            >
              <FaCheck className="text-emerald-500 text-lg" />
            </motion.div>
            <div>
              <h2 className="text-base font-bold">Payment Successful!</h2>
              <p className="text-emerald-100 text-xs">Order #{orderId}</p>
            </div>
          </div>
        </div>

        {/* Display Content */}
        <div className="p-3 max-h-[420px] overflow-y-auto text-xs">
          {/* Restaurant Info */}
          <div className="text-center pb-2 border-b border-dashed border-stone-200">
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12 rounded-full mx-auto mb-1 object-cover"
            />
            <h3 className="text-sm font-bold text-amber-600">
              B-Friend Restaurant
            </h3>
            <p className="text-[10px] text-slate-400">
              {currentDate} • {currentTime}
            </p>
          </div>

          {/* Order Info */}
          <div className="py-2 border-b border-dashed border-stone-200 grid grid-cols-2 gap-1">
            <span className="text-slate-400">Customer</span>
            <span className="text-right font-medium text-slate-700 truncate">
              {orderInfo?.customerDetails?.name || "Walk-in"}
            </span>
            <span className="text-slate-400">Guests</span>
            <span className="text-right text-slate-700">
              {orderInfo?.customerDetails?.guests || 1}
            </span>
          </div>

          {/* ✅ Staff Info */}
          <div className="py-2 border-b border-dashed border-stone-200 grid grid-cols-2 gap-1 bg-amber-50 -mx-3 px-3">
            <span className="text-slate-400">Staff</span>
            <span className="text-right font-medium text-slate-700">
              {staffName}
            </span>
            {staffPhone && (
              <>
                <span className="text-slate-400">Staff Tel</span>
                <span className="text-right text-slate-700">{staffPhone}</span>
              </>
            )}
          </div>

          {/* Items */}
          <div className="py-2 border-b border-dashed border-stone-200">
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-1">
              Items
            </h4>
            <div className="space-y-1">
              {orderInfo?.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1 rounded font-medium">
                      x{item.quantity}
                    </span>
                    <span className="text-slate-700 truncate max-w-[140px]">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-medium text-slate-700">
                    ${formatUSD(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Billing */}
          <div className="py-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-slate-700">
                ${formatUSD(orderInfo?.bills?.total)}
              </span>
            </div>

            {discountPercent > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">
                  Discount ({discountPercent}%)
                </span>
                <span className="text-red-500">
                  -${formatUSD(orderInfo?.bills?.discount || 0)}
                </span>
              </div>
            )}

            {orderInfo?.paymentType === "Cash" && cashReceivedKHR > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Received</span>
                  <span className="text-slate-700">${cashReceivedUSD}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Change</span>
                  <span className="text-emerald-600 font-medium">
                    ${cashBackUSD}
                  </span>
                </div>
              </>
            )}

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t border-stone-200">
              <span className="font-semibold text-slate-700">Total</span>
              <div className="text-right">
                <p className="text-lg font-bold text-amber-600">
                  ${formatUSD(orderInfo?.bills?.totalWithDiscount)}
                </p>
                <p className="text-[10px] text-slate-400">
                  ៛{" "}
                  {roundRiel(
                    orderInfo?.bills?.totalWithDiscount
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Payment Badge */}
            <div className="flex justify-center pt-1">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  orderInfo?.paymentType === "Cash"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                ✓ {orderInfo?.paymentType || "Cash"}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-2 border-t border-dashed border-stone-200">
            <p className="text-[10px] text-slate-400">
              Thank you! Please come again 🙏
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-3 pb-3 grid grid-cols-2 gap-2 border-t border-stone-100 pt-3">
          <button
            onClick={handleClose}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-stone-100 text-slate-600 text-xs font-semibold hover:bg-stone-200 transition-colors"
          >
            <IoClose size={14} />
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold hover:shadow-lg transition-all"
          >
            <FaPrint size={12} />
            Print
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Invoice;
