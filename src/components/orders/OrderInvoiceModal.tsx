'use client';

import React, { useState } from 'react';
import {
  Printer,
  Share2,
  Copy,
  Check,
  X,
  FileText,
  UtensilsCrossed,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface OrderInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  businessInfo?: {
    name?: string;
    tagline?: string;
    address?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    fssai?: string;
    gstin?: string;
  };
}

// Convert amount to Indian words (Rupees)
function numberToIndianWords(num: number): string {
  if (!num || isNaN(num)) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero Rupees Only';

  function convertChunk(n: number): string {
    let str = '';
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += a[n] + ' ';
    }
    return str.trim();
  }

  let words = '';
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const remaining = n % 1000;

  if (crore > 0) words += convertChunk(crore) + ' Crore ';
  if (lakh > 0) words += convertChunk(lakh) + ' Lakh ';
  if (thousand > 0) words += convertChunk(thousand) + ' Thousand ';
  if (remaining > 0) words += convertChunk(remaining);

  return 'Rupees ' + words.trim() + ' Only';
}

export function OrderInvoiceModal({
  isOpen,
  onClose,
  order,
  businessInfo = {
    name: 'Tommalu Homemade Foods',
    tagline: 'Ghar Jaisa Swad, Har Din Pure & Fresh',
    address: 'N.H.11 C DELHI ROAD, ACHROL, JAIPUR (RAJ.)',
    phone: '+91 77428 92352',
    whatsapp: '917742892352',
    email: 'contact@tommalu.com',
    fssai: '22226043000221',
    gstin: '08AAAAA0000A1Z5'
  }
}: OrderInvoiceModalProps) {
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4'>('thermal');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  // Normalized order data
  const orderNumber = order.orderNumber || (order.id ? order.id.slice(0, 8).toUpperCase() : (order._id ? order._id.slice(0, 8).toUpperCase() : 'ORD-TEMP'));
  const orderDate = order.createdAt || order.orderTime || new Date().toISOString();
  const formattedDate = new Date(orderDate).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const customerName = order.customer?.name || order.customerName || order.user?.name || 'Valued Customer';
  const customerPhone = order.customer?.phone || order.customerPhone || order.mobileNumber || order.user?.phone || '';
  const street = order.deliveryAddress?.street || (typeof order.deliveryAddress === 'string' ? order.deliveryAddress : '') || 'Delivery Address Provided';
  const city = order.deliveryAddress?.city || order.area || 'Jaipur';
  const pincode = order.deliveryAddress?.pincode ? ` - ${order.deliveryAddress.pincode}` : '';
  const fullAddress = `${street}${city ? `, ${city}` : ''}${pincode}`;

  // Normalized items
  const rawItems = order.items && Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : (order.foodName ? [{ name: order.foodName, quantity: order.quantity || 1, price: order.finalPrice || order.total || 0 }] : []);

  const items = rawItems.map((item: any) => {
    const name = item.name || item.itemName || 'Homemade Meal';
    const quantity = Number(item.quantity) || 1;
    const price = Number(item.price || item.itemPrice || 0);
    return {
      name,
      quantity,
      price,
      total: price * quantity
    };
  });

  const itemsSubtotal = items.reduce((sum: number, it: any) => sum + it.total, 0);
  const deliveryCharge = Number(order.deliveryCharge) || 0;
  const discount = Number(order.discount) || 0;
  const grandTotal = Number(order.total || order.finalAmount || order.finalPrice || (itemsSubtotal + deliveryCharge - discount));
  const subtotal = itemsSubtotal > 0 ? itemsSubtotal : grandTotal - deliveryCharge + discount;

  const paymentMethod = (order.paymentMethod || 'cash_on_delivery').replace(/_/g, ' ').toUpperCase();
  const paymentStatus = (order.paymentStatus || (order.paymentMethod === 'online' || order.paymentMethod === 'wallet' ? 'PAID' : 'PENDING')).toUpperCase();
  const isPaid = paymentStatus === 'PAID';
  const mealType = order.mealType || order.metadata?.mealType || (order.timeSlot ? order.timeSlot : '');
  const specialInstructions = order.specialInstructions || order.notes || '';
  const orderedItemsBreakdown = order.metadata?.orderedItems || '';
  const deliveryBoyName = order.assignedTo?.name || (typeof order.assignedTo === 'string' ? order.assignedTo : '');

  // Trigger print with dedicated isolated iframe for 100% printer compatibility
  const handlePrint = () => {
    try {
      const printableElement = document.getElementById('tommalu-printable-invoice');
      if (!printableElement) {
        window.print();
        return;
      }

      // Remove any existing print iframe
      const oldIframe = document.getElementById('tommalu-receipt-print-iframe');
      if (oldIframe) {
        oldIframe.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'tommalu-receipt-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) {
        window.print();
        return;
      }

      const isThermal = printFormat === 'thermal';

      // Grab all head stylesheets so Tailwind & custom styles apply inside iframe
      const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map(tag => tag.outerHTML)
        .join('\n');

      const printHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Tommalu_Bill_${orderNumber}</title>
            ${styleTags}
            <style>
              @page {
                size: ${isThermal ? '80mm auto' : 'A4 portrait'};
                margin: ${isThermal ? '2mm' : '8mm'};
              }
              *, *::before, *::after {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #000000 !important;
                width: 100% !important;
              }
              body {
                display: flex;
                justify-content: center;
                align-items: flex-start;
                padding: ${isThermal ? '2mm' : '6mm'} !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              }
              .print-container {
                width: ${isThermal ? '76mm' : '100%'};
                max-width: ${isThermal ? '76mm' : '800px'};
                margin: 0 auto;
                background: #ffffff !important;
              }
              img {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${printableElement.innerHTML}
            </div>
          </body>
        </html>
      `;

      iframeDoc.open();
      iframeDoc.write(printHtml);
      iframeDoc.close();

      // Ensure images/fonts render before print dialog
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error('Iframe print error, fallback to window.print', e);
          window.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              iframe.remove();
            }
          }, 3000);
        }
      }, 350);
    } catch (err) {
      console.error('Print trigger error:', err);
      window.print();
    }
  };

  // WhatsApp formatted receipt text
  const generateWhatsAppText = () => {
    const mealBadge = mealType ? ` (${mealType})` : '';
    let text = `🍲 *${businessInfo.name?.toUpperCase()}*\n`;
    text += `_${businessInfo.tagline}_\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🧾 *BILL / ORDER RECEIPT*\n`;
    text += `*Order #:* ${orderNumber}\n`;
    text += `*Date:* ${formattedDate}\n`;
    if (mealType) text += `*Slot:* ${mealType}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👤 *Customer:* ${customerName}\n`;
    if (customerPhone) text += `📱 *Phone:* ${customerPhone}\n`;
    text += `📍 *Address:* ${fullAddress}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `*ITEMS ORDERED:*\n`;
    items.forEach((it: any, idx: number) => {
      text += `${idx + 1}. *${it.name}* x ${it.quantity} = ₹${it.total.toFixed(2)}\n`;
    });
    if (orderedItemsBreakdown) {
      text += `   _(Includes: ${orderedItemsBreakdown})_\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Subtotal: ₹${subtotal.toFixed(2)}\n`;
    text += `Delivery Fee: ${deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : 'FREE'}\n`;
    if (discount > 0) text += `Discount: -₹${discount.toFixed(2)}\n`;
    text += `*GRAND TOTAL: ₹${grandTotal.toFixed(2)}*\n`;
    text += `*Payment:* ${paymentMethod} (${isPaid ? '✅ PAID' : '⏳ COLLECT CASH'})\n`;
    if (specialInstructions) {
      text += `\n📝 *Note:* ${specialInstructions}\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🙏 *Thank you for ordering with us!*\n`;
    text += `📞 Helpline: ${businessInfo.phone}\n`;
    text += `✨ FSSAI Lic: ${businessInfo.fssai}`;
    return text;
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateWhatsAppText());
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    let targetUrl = `https://wa.me/?text=${text}`;
    if (cleanPhone) {
      const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      targetUrl = `https://wa.me/${fullPhone}?text=${text}`;
    }
    window.open(targetUrl, '_blank');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateWhatsAppText());
    setCopied(true);
    toast.success('Bill receipt copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Action Bar (Hidden when printing) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 p-4 bg-stone-900 text-white border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center border border-stone-700 shrink-0">
              <img src="/logo.png" alt="Tommalu" className="h-full w-auto object-contain" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">Order Bill / Invoice</h3>
              <p className="text-xs text-stone-400">Order #{orderNumber}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Format toggle */}
            <div className="bg-stone-800 p-0.5 rounded-lg flex text-xs">
              <button
                type="button"
                onClick={() => setPrintFormat('thermal')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  printFormat === 'thermal'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Thermal (80mm)
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('a4')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  printFormat === 'a4'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Standard (A4)
              </button>
            </div>

            {/* Print button */}
            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5 h-8 font-medium cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </Button>

            {/* WhatsApp share */}
            <Button
              onClick={handleShareWhatsApp}
              size="sm"
              variant="outline"
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 gap-1.5 h-8 font-medium cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </Button>

            {/* Copy button */}
            <Button
              onClick={handleCopyText}
              size="sm"
              variant="ghost"
              className="text-stone-300 hover:text-white h-8 px-2"
              title="Copy receipt text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </Button>

            {/* Close button */}
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
              className="text-stone-400 hover:text-white hover:bg-stone-800 h-8 w-8 p-0 ml-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100 flex justify-center items-start">
          
          {/* ============================================================== */}
          {/* PRINTABLE BILL WRAPPER (Target of @media print)                 */}
          {/* ============================================================== */}
          <div
            id="tommalu-printable-invoice"
            className={`bg-white shadow-sm transition-all duration-200 text-stone-900 ${
              printFormat === 'thermal'
                ? 'w-full max-w-[360px] p-4 font-mono text-xs border border-stone-300 rounded-lg thermal-print-mode'
                : 'w-full max-w-[800px] p-8 sm:p-10 font-sans text-sm border border-stone-200 rounded-xl'
            }`}
          >

            {/* -------------------------------------------------------- */}
            {/* FORMAT 1: THERMAL SLIP (80mm) POS RECEIPT               */}
            {/* -------------------------------------------------------- */}
            {printFormat === 'thermal' && (
              <div className="space-y-3">
                {/* Brand Header with Real Tommalu Logo */}
                <div className="text-center pb-2 border-b-2 border-dashed border-stone-800">
                  <div className="flex justify-center mb-1">
                    <img
                      src="/logo.png"
                      alt="Tommalu"
                      className="h-12 w-auto object-contain mx-auto"
                    />
                  </div>
                  <div className="font-extrabold text-sm tracking-wider uppercase text-stone-900">
                    {businessInfo.name}
                  </div>
                  <p className="text-[10px] text-stone-600 tracking-tight font-medium">{businessInfo.tagline}</p>
                  <p className="text-[10px] text-stone-800 font-bold mt-0.5 uppercase">{businessInfo.address}</p>
                  <p className="text-[10px] text-stone-700 font-semibold mt-0.5">
                    Tel: {businessInfo.phone} | FSSAI: {businessInfo.fssai}
                  </p>
                </div>

                {/* Receipt Title & Meta */}
                <div className="text-center font-bold text-xs uppercase bg-stone-100 py-1 rounded">
                  ORDER BILL / KITCHEN SLIP
                </div>

                <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-stone-400">
                  <div className="flex justify-between">
                    <span className="font-semibold">Order No:</span>
                    <span className="font-bold">#{orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Date & Time:</span>
                    <span>{formattedDate}</span>
                  </div>
                  {mealType && (
                    <div className="flex justify-between">
                      <span className="text-stone-600">Meal Slot:</span>
                      <span className="font-bold uppercase text-orange-700">
                        {mealType === 'Lunch' ? '☀️ Lunch' : '🌙 Dinner'}
                      </span>
                    </div>
                  )}
                  {deliveryBoyName && (
                    <div className="flex justify-between">
                      <span className="text-stone-600">Delivered By:</span>
                      <span className="font-semibold">{deliveryBoyName}</span>
                    </div>
                  )}
                </div>

                {/* Customer Details */}
                <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-stone-400">
                  <div className="font-bold uppercase text-[10px] tracking-wider text-stone-500">
                    Deliver To:
                  </div>
                  <div className="font-bold text-stone-900">{customerName}</div>
                  {customerPhone && (
                    <div className="text-stone-700 font-medium">📞 {customerPhone}</div>
                  )}
                  <div className="text-stone-700 leading-snug">📍 {fullAddress}</div>
                </div>

                {/* Items Table */}
                <div className="pb-2 border-b-2 border-dashed border-stone-800">
                  <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-stone-300 uppercase">
                    <span className="w-1/2">Item</span>
                    <span className="w-1/6 text-center">Qty</span>
                    <span className="w-1/3 text-right">Amt (₹)</span>
                  </div>

                  <div className="divide-y divide-stone-200 divide-dashed">
                    {items.map((item: any, idx: number) => (
                      <div key={idx} className="py-1.5 text-[11px]">
                        <div className="flex justify-between items-start">
                          <span className="w-1/2 font-semibold text-stone-900 pr-1">{item.name}</span>
                          <span className="w-1/6 text-center">{item.quantity}</span>
                          <span className="w-1/3 text-right font-bold">₹{item.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Included Items Details for Homemade Thali */}
                  {orderedItemsBreakdown && (
                    <div className="mt-1.5 p-1.5 bg-orange-50/70 border border-orange-200 rounded text-[10px] text-orange-950">
                      <span className="font-bold uppercase block text-[9px]">Thali Contents:</span>
                      <span className="leading-tight">{orderedItemsBreakdown}</span>
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-stone-400">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Delivery Charge:</span>
                    <span>{deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : 'FREE'}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-stone-400 text-stone-900">
                    <span>TOTAL AMOUNT:</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Badge */}
                <div className="p-2 text-center rounded border border-stone-800 font-bold uppercase text-xs">
                  {isPaid ? (
                    <div className="text-emerald-700">
                      PAID ONLINE / UPI (₹{grandTotal.toFixed(2)})
                    </div>
                  ) : (
                    <div className="text-orange-700">
                      COLLECT CASH: ₹{grandTotal.toFixed(2)}
                    </div>
                  )}
                  <div className="text-[10px] font-normal text-stone-600 mt-0.5">
                    Mode: {paymentMethod}
                  </div>
                </div>

                {/* Special Instructions */}
                {specialInstructions && (
                  <div className="p-1.5 bg-yellow-50 border border-yellow-300 rounded text-[10px] text-yellow-900">
                    <span className="font-bold">NOTE: </span>
                    {specialInstructions}
                  </div>
                )}

                {/* Footer Note */}
                <div className="text-center pt-2 text-[10px] text-stone-600 space-y-0.5">
                  <p className="font-bold text-stone-800">*** Thank You! Visit Again ***</p>
                  <p>Fresh & Pure Home-Cooked Goodness</p>
                  <p className="text-[9px] text-stone-400">Computer Generated Receipt</p>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* FORMAT 2: STANDARD TAX INVOICE (A4 FORMAT)               */}
            {/* -------------------------------------------------------- */}
            {printFormat === 'a4' && (
              <div className="space-y-6">
                {/* Brand & Invoice Top Bar with Real Tommalu Logo */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-orange-500 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-white rounded-xl border border-orange-200/70 shadow-2xs shrink-0">
                      <img
                        src="/logo.png"
                        alt="Tommalu"
                        className="h-16 w-auto object-contain"
                      />
                    </div>
                    <div>
                      <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">
                        {businessInfo.name}
                      </h1>
                      <p className="text-xs text-orange-700 font-semibold tracking-wide">
                        {businessInfo.tagline}
                      </p>
                      <div className="mt-1 text-xs text-gray-600 space-y-0.5 max-w-sm">
                        <p className="font-bold text-gray-800 uppercase">{businessInfo.address}</p>
                        <p>Phone: {businessInfo.phone} | Email: {businessInfo.email}</p>
                        <p className="font-semibold text-gray-700">FSSAI Lic. No: {businessInfo.fssai}</p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right bg-orange-50/70 p-4 rounded-xl border border-orange-100 sm:min-w-[220px]">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-orange-800 bg-orange-100 px-2 py-0.5 rounded mb-2">
                      Official Tax Invoice / Bill
                    </span>
                    <h2 className="text-lg font-bold text-gray-900">#{orderNumber}</h2>
                    <p className="text-xs text-gray-600 mt-1">Date: {formattedDate}</p>
                    {mealType && (
                      <p className="text-xs font-semibold text-orange-700 mt-0.5">
                        Slot: {mealType === 'Lunch' ? '☀️ Lunch (11:30-2:00)' : '🌙 Dinner (7:30-10:00)'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer & Order Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Information */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-600" />
                      Billed & Delivered To:
                    </h3>
                    <p className="font-bold text-base text-gray-900">{customerName}</p>
                    {customerPhone && (
                      <p className="text-xs text-gray-700 mt-0.5 font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" /> +91 {customerPhone}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {fullAddress}
                    </p>
                  </div>

                  {/* Payment & Order Summary */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-orange-600" />
                        Payment Details:
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500 block">Payment Mode:</span>
                          <span className="font-semibold text-gray-800 uppercase">{paymentMethod}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Status:</span>
                          <span className={`font-bold inline-flex items-center px-2 py-0.5 rounded text-[11px] ${
                            isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {isPaid ? 'PAID' : 'PENDING / COD'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {deliveryBoyName && (
                      <div className="mt-2 pt-2 border-t border-stone-200 text-xs">
                        <span className="text-gray-500">Delivery Executive: </span>
                        <span className="font-semibold text-gray-800">{deliveryBoyName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-hidden border border-stone-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-100 text-stone-700 text-xs uppercase font-bold tracking-wider border-b border-stone-200">
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4">Item Description</th>
                        <th className="py-3 px-4 w-24 text-right">Rate</th>
                        <th className="py-3 px-4 w-20 text-center">Qty</th>
                        <th className="py-3 px-4 w-28 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-sm">
                      {items.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-stone-50/50 print-avoid-break">
                          <td className="py-3.5 px-4 text-center text-xs font-medium text-stone-400">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-gray-900 block">{item.name}</span>
                            {orderedItemsBreakdown && (
                              <span className="text-xs text-stone-500 mt-0.5 block">
                                Includes: {orderedItemsBreakdown}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right text-gray-600 font-mono text-xs">
                            ₹{item.price.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-gray-800">
                            {item.quantity}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-gray-900 font-mono text-sm">
                            ₹{item.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Calculation & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    {/* Amount in words */}
                    <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs">
                      <span className="text-stone-500 uppercase font-bold text-[10px] block mb-0.5">Amount In Words:</span>
                      <span className="font-semibold text-stone-800 italic">
                        {numberToIndianWords(grandTotal)}
                      </span>
                    </div>

                    {/* Special Instructions if any */}
                    {specialInstructions && (
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-900">
                        <span className="font-bold uppercase text-[10px] block mb-0.5">Special Instructions:</span>
                        <span>{specialInstructions}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>100% Fresh Homemade Food Guarantee | FSSAI Certified Kitchen</span>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Items Subtotal:</span>
                      <span className="font-mono text-stone-900">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Delivery Fee:</span>
                      <span className="font-mono text-stone-900">
                        {deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : 'FREE'}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount Coupon:</span>
                        <span className="font-mono">-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t-2 border-stone-300 flex justify-between items-center text-stone-900">
                      <span className="text-sm font-bold uppercase tracking-wide">Grand Total:</span>
                      <span className="text-xl font-black text-orange-600 font-mono">
                        ₹{grandTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="pt-1 text-right">
                      <span className="text-[10px] text-stone-400">Inclusive of all applicable food packaging</span>
                    </div>
                  </div>
                </div>

                {/* Formal Invoice Footer */}
                <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-500">
                  <div>
                    <p className="font-semibold text-stone-700">Tommalu Food Technologies</p>
                    <p className="text-[11px]">This is a computer-generated invoice and requires no physical signature.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-600">Thank you for ordering with Tommalu!</p>
                    <p className="text-[11px]">For inquiries or bulk orders, WhatsApp: +91 99285 24399</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderInvoiceModal;
