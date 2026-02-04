import React, { useRef } from "react";
import { IoPrint } from "react-icons/io5";
import logo from "../../assets/images/logo.jpg";

const PrintInvoiceButton = ({ order }) => {
  const printRef = useRef(null);

  const formatUSD = (khr) => ((khr || 0) / 4100).toFixed(2);
  const roundRiel = (amount) => Math.round((amount || 0) / 100) * 100;

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Get table number
  const tableNo = order.table?.tableNo || order.tableNo || null;

  const handlePrint = () => {
    if (!printRef.current || !order) return;

    const printContent = printRef.current.innerHTML;
    const WinPrint = window.open("", "", "width=400,height=600");

    WinPrint.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - B-Friend Restaurant</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              padding: 10px;
              max-width: 280px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              padding-bottom: 10px;
              border-bottom: 2px dashed #000;
              margin-bottom: 10px;
            }
            .logo {
              width: 60px;
              height: 60px;
              object-fit: contain;
              margin: 0 auto 8px;
              display: block;
              border-radius: 50%;
            }
            .restaurant-name { font-size: 18px; font-weight: bold; }
            .restaurant-info { font-size: 10px; color: #555; }
            .section {
              padding: 8px 0;
              border-bottom: 1px dashed #ccc;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              font-size: 11px;
            }
            .row-highlight {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
              font-size: 11px;
              font-weight: bold;
              background: #f5f5f5;
              padding: 4px 6px;
              border-radius: 4px;
            }
            .items-section {
              padding: 8px 0;
              border-bottom: 1px dashed #ccc;
            }
            .section-title {
              font-weight: bold;
              font-size: 11px;
              margin-bottom: 6px;
              text-transform: uppercase;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
              font-size: 11px;
            }
            .totals-section {
              padding: 10px 0;
              border-bottom: 2px dashed #000;
            }
            .grand-total {
              display: flex;
              justify-content: space-between;
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px solid #000;
              font-size: 14px;
              font-weight: bold;
            }
            .payment-badge {
              text-align: center;
              margin: 10px 0;
              padding: 6px;
              background: #f0f0f0;
              font-size: 11px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              padding-top: 12px;
              font-size: 10px;
            }
            .footer-thanks {
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .barcode {
              text-align: center;
              font-size: 32px;
              letter-spacing: -2px;
              margin: 8px 0;
            }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);

    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 500);
  };

  const orderId = order._id.slice(-8).toUpperCase();

  return (
    <>
      {/* Print Button */}
      <button
        onClick={handlePrint}
        className="w-full mt-3 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all"
      >
        <IoPrint size={18} />
        Print Invoice
      </button>

      {/* Hidden Print Template */}
      <div className="hidden">
        <div ref={printRef}>
          {/* Header with Logo */}
          <div className="header">
            <img src={logo} alt="Logo" className="logo" />
            <div className="restaurant-name">B-FRIEND</div>
            <div className="restaurant-info">RESTAURANT</div>
            <div className="restaurant-info">Phnom Penh, Cambodia</div>
            <div className="restaurant-info">Tel: 012 345 678</div>
          </div>

          {/* Order Info */}
          <div className="section">
            <div className="row">
              <span>Date:</span>
              <span>{currentDate}</span>
            </div>
            <div className="row">
              <span>Time:</span>
              <span>{currentTime}</span>
            </div>
            <div className="row">
              <span>Order #:</span>
              <span>{orderId}</span>
            </div>
            {tableNo && (
              <div className="row-highlight">
                <span>🪑 Table:</span>
                <span>T-{tableNo}</span>
              </div>
            )}
            <div className="row">
              <span>Customer:</span>
              <span>{order.customerDetails?.name || "Walk-in"}</span>
            </div>
            {order.customerDetails?.phone && (
              <div className="row">
                <span>Phone:</span>
                <span>{order.customerDetails.phone}</span>
              </div>
            )}
            <div className="row">
              <span>Guests:</span>
              <span>{order.customerDetails?.guests || 1}</span>
            </div>
          </div>

          {/* Items */}
          <div className="items-section">
            <div className="section-title">Order Items</div>
            {order.items?.map((item, i) => (
              <div key={i} className="item-row">
                <span>
                  x{item.quantity} {item.name}
                </span>
                <span>${formatUSD(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="totals-section">
            <div className="row">
              <span>Subtotal:</span>
              <span>${formatUSD(order.bills?.total)}</span>
            </div>
            {order.bills?.discount > 0 && (
              <div className="row" style={{ color: "#c00" }}>
                <span>Discount:</span>
                <span>-${formatUSD(order.bills?.discount)}</span>
              </div>
            )}
            <div className="grand-total">
              <span>TOTAL:</span>
              <span>
                $
                {formatUSD(
                  order.bills?.totalWithDiscount || order.bills?.total
                )}
              </span>
            </div>
            <div
              className="row"
              style={{
                justifyContent: "flex-end",
                fontSize: "10px",
                color: "#666",
              }}
            >
              ៛{" "}
              {roundRiel(
                order.bills?.totalWithDiscount || order.bills?.total
              ).toLocaleString()}
            </div>
          </div>

          {/* Payment Badge */}
          <div className="payment-badge">
            ✓ PAID BY {(order.paymentType || "CASH").toUpperCase()}
          </div>

          {/* Footer */}
          <div className="footer">
            <div className="footer-thanks">Thank You!</div>
            <div style={{ color: "#666", marginBottom: "4px" }}>
              Please come again 🙏
            </div>
            <div className="barcode">*{orderId}*</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintInvoiceButton;
