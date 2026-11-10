'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { homemadeFoodAdminApi } from '@/services/api/homemade-food.api';
import { toast } from 'sonner';
import {
  MessageCircle,
  Plus,
  Minus,
  Utensils,
  MapPin,
  Phone,
  User,
  DollarSign,
  Sun,
  Moon,
  Clock,
  Loader2,
  CheckCircle2,
  Trash2,
  ChefHat,
  Bike
} from 'lucide-react';

interface AddManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface OrderItem {
  itemName: string;
  quantity: number;
  itemPrice: number;
}

export function AddManualOrderModal({
  isOpen,
  onClose,
  onSuccess,
}: AddManualOrderModalProps) {
  const [loading, setLoading] = useState(false);

  // Customer Details
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Jaipur');
  const [pincode, setPincode] = useState('302001');
  const [area, setArea] = useState('Central Jaipur');

  // Meal Slot (auto-detect current hour: before 4 PM -> lunch, else dinner)
  const [mealType, setMealType] = useState<'lunch' | 'dinner'>(() => {
    const currentHour = new Date().getHours();
    return currentHour < 16 ? 'lunch' : 'dinner';
  });

  // Standard Thali Quantities
  const [regularQty, setRegularQty] = useState(1);
  const [desiQty, setDesiQty] = useState(0);
  const [paneerQty, setPaneerQty] = useState(0);

  // Extra / Custom items
  const [customItems, setCustomItems] = useState<OrderItem[]>([]);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomPrice, setNewCustomPrice] = useState<number | string>(10);
  const [newCustomQty, setNewCustomQty] = useState<number | string>(1);
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Charges & Payment
  const [deliveryCharge, setDeliveryCharge] = useState<number | string>(0);
  const [discount, setDiscount] = useState<number | string>(0);
  const [paymentMethod, setPaymentMethod] = useState<'whatsapp_upi' | 'cash_on_delivery'>('whatsapp_upi');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid');
  const [notes, setNotes] = useState('');

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      const currentHour = new Date().getHours();
      setMealType(currentHour < 16 ? 'lunch' : 'dinner');
    }
  }, [isOpen]);

  // Calculate Subtotal and Grand Total
  const regularSubtotal = regularQty * 99;
  const desiSubtotal = desiQty * 119;
  const paneerSubtotal = paneerQty * 199;
  const customSubtotal = customItems.reduce((acc, it) => acc + (it.itemPrice * it.quantity), 0);
  const itemsSubtotal = regularSubtotal + desiSubtotal + paneerSubtotal + customSubtotal;

  const grandTotal = Math.max(
    0,
    itemsSubtotal + (Number(deliveryCharge) || 0) - (Number(discount) || 0)
  );

  const handleAddCustomItem = () => {
    if (!newCustomName.trim()) {
      toast.error('Item name required (जैसे: Extra Roti)');
      return;
    }
    const price = Math.max(0, Number(newCustomPrice) || 0);
    const qty = Math.max(1, Number(newCustomQty) || 1);

    setCustomItems(prev => [...prev, { itemName: newCustomName.trim(), itemPrice: price, quantity: qty }]);
    setNewCustomName('');
    setNewCustomPrice(10);
    setNewCustomQty(1);
    setShowAddCustom(false);
  };

  const handleRemoveCustomItem = (index: number) => {
    setCustomItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error('Customer name is required (ग्राहक का नाम लिखें)');
      return;
    }

    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!street.trim()) {
      toast.error('Delivery street / address is required (पता लिखें)');
      return;
    }

    // Build items list
    const finalItems: OrderItem[] = [];
    if (regularQty > 0) finalItems.push({ itemName: 'Regular Thali', quantity: regularQty, itemPrice: 99 });
    if (desiQty > 0) finalItems.push({ itemName: 'Desi Special Thali', quantity: desiQty, itemPrice: 119 });
    if (paneerQty > 0) finalItems.push({ itemName: 'Paneer Special Thali', quantity: paneerQty, itemPrice: 199 });
    finalItems.push(...customItems);

    if (finalItems.length === 0) {
      toast.error('Please select at least 1 thali or item');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        mobileNumber: cleanPhone,
        deliveryAddress: {
          street: street.trim(),
          landmark: landmark.trim(),
          city: city.trim() || 'Jaipur',
          pincode: pincode.trim() || '302001',
          area: area.trim() || 'Central Jaipur',
        },
        items: finalItems,
        mealType,
        deliveryCharge: Number(deliveryCharge) || 0,
        discount: Number(discount) || 0,
        paymentMethod,
        paymentStatus,
        status: 'Confirmed',
        notes: notes.trim(),
      };

      await homemadeFoodAdminApi.createManualOrder(payload);

      toast.success('WhatsApp Order Created & Dispatched!', {
        description: `Order successfully punched for ${customerName} (₹${grandTotal}). Sent to kitchen & riders.`,
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Manual order create error:', err);
      toast.error(
        err?.response?.data?.message || 'Failed to create order. Please check inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCustomerName('');
    setMobileNumber('');
    setStreet('');
    setLandmark('');
    setRegularQty(1);
    setDesiQty(0);
    setPaneerQty(0);
    setCustomItems([]);
    setDeliveryCharge(0);
    setDiscount(0);
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 border-stone-200">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
                    Create WhatsApp / Offline Order
                    <Badge className="bg-emerald-400 text-emerald-950 font-bold border-0 text-[10px] px-2 py-0.5">
                      Quick POS
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-emerald-100 text-xs mt-0.5">
                    WhatsApp या कॉल पर आए सिंगल थाली ऑर्डर को सीधे किचन और डिलीवरी बॉय को भेजें।
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 1. Customer Contact & Location */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-emerald-600" />
                1. Customer & Delivery Address (ग्राहक विवरण)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <Label className="text-xs font-bold text-stone-700">Customer Name *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <Input
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="pl-9 text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold text-stone-700">WhatsApp Mobile *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                    <Input
                      type="tel"
                      placeholder="10-digit Mobile"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="pl-9 text-sm font-medium font-mono"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-stone-700">Street / House / Colony Address *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <Input
                    placeholder="e.g. Flat 302, Royal Residency, Ward 12"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="pl-9 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-bold text-stone-700">Landmark</Label>
                  <Input
                    placeholder="Near SBI Bank"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-stone-700">Area</Label>
                  <Input
                    placeholder="e.g. Mansarovar"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-stone-700">Pincode</Label>
                  <Input
                    placeholder="302001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="text-xs mt-1 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. Meal Slot & Thali Selection */}
            <div className="space-y-4 pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <ChefHat className="h-3.5 w-3.5 text-orange-600" />
                  2. Select Meals & Quantities (थाली चुनें)
                </h3>

                {/* Slot Selector */}
                <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-100">
                  <button
                    type="button"
                    onClick={() => setMealType('lunch')}
                    className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                      mealType === 'lunch'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5" /> Lunch (दोपहर)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMealType('dinner')}
                    className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                      mealType === 'dinner'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5" /> Dinner (रात)
                  </button>
                </div>
              </div>

              {/* Standard 3 Thalis with Quick +/- Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Regular Thali */}
                <div className={`p-3.5 rounded-xl border transition-all ${
                  regularQty > 0 ? 'border-orange-500 bg-orange-50/40 shadow-xs' : 'border-stone-200 bg-white'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-stone-900 text-sm">Regular Thali</p>
                      <p className="text-xs text-orange-600 font-extrabold mt-0.5">₹99</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">4 Roti, Sabji, Dal, Rice</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-200/60">
                    <span className="text-xs text-stone-500">Qty:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => setRegularQty(Math.max(0, regularQty - 1))}
                        disabled={regularQty === 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-bold text-sm w-5 text-center">{regularQty}</span>
                      <Button
                        type="button"
                        size="icon"
                        className="h-7 w-7 rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => setRegularQty(regularQty + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Desi Special Thali */}
                <div className={`p-3.5 rounded-xl border transition-all ${
                  desiQty > 0 ? 'border-amber-500 bg-amber-50/40 shadow-xs' : 'border-stone-200 bg-white'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-stone-900 text-sm">Desi Special</p>
                      <p className="text-xs text-amber-600 font-extrabold mt-0.5">₹119</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">6 Ghee Roti, Raita, Chutney</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-200/60">
                    <span className="text-xs text-stone-500">Qty:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => setDesiQty(Math.max(0, desiQty - 1))}
                        disabled={desiQty === 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-bold text-sm w-5 text-center">{desiQty}</span>
                      <Button
                        type="button"
                        size="icon"
                        className="h-7 w-7 rounded-lg bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={() => setDesiQty(desiQty + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Paneer Special Thali */}
                <div className={`p-3.5 rounded-xl border transition-all ${
                  paneerQty > 0 ? 'border-purple-500 bg-purple-50/40 shadow-xs' : 'border-stone-200 bg-white'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-stone-900 text-sm">Paneer Special</p>
                      <p className="text-xs text-purple-600 font-extrabold mt-0.5">₹199</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">Paneer Sabji, Gulab Jamun</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-200/60">
                    <span className="text-xs text-stone-500">Qty:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 rounded-lg"
                        onClick={() => setPaneerQty(Math.max(0, paneerQty - 1))}
                        disabled={paneerQty === 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-bold text-sm w-5 text-center">{paneerQty}</span>
                      <Button
                        type="button"
                        size="icon"
                        className="h-7 w-7 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => setPaneerQty(paneerQty + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Addons List */}
              {customItems.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-stone-600">Extra Items Added:</span>
                  {customItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                      <span className="font-medium text-stone-800">
                        {item.quantity}x {item.itemName} (@ ₹{item.itemPrice})
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-stone-900">₹{item.quantity * item.itemPrice}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveCustomItem(idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Custom Addon Toggle */}
              {!showAddCustom ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCustom(true)}
                  className="text-xs border-dashed border-stone-300 text-stone-600 hover:bg-stone-50 w-full"
                >
                  <Plus className="h-3 w-3 mr-1" /> + Add Extra Item (Roti, Chhach, Sweet, Salad)
                </Button>
              ) : (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700">Add Extra Item</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddCustom(false)}
                      className="h-6 px-2 text-xs text-stone-400"
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="grid grid-cols-12 gap-2">
                    <Input
                      placeholder="Item name (e.g. 2 Extra Roti)"
                      value={newCustomName}
                      onChange={(e) => setNewCustomName(e.target.value)}
                      className="col-span-6 text-xs bg-white"
                    />
                    <Input
                      type="number"
                      placeholder="Price (₹)"
                      value={newCustomPrice}
                      onChange={(e) => setNewCustomPrice(e.target.value)}
                      className="col-span-3 text-xs bg-white font-mono"
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={newCustomQty}
                      onChange={(e) => setNewCustomQty(e.target.value)}
                      className="col-span-3 text-xs bg-white font-mono"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCustomItem}
                    className="w-full bg-stone-800 hover:bg-black text-white text-xs font-bold"
                  >
                    Add to Bill
                  </Button>
                </div>
              )}
            </div>

            {/* 3. Bill & Payment Details */}
            <div className="space-y-4 pt-2 border-t border-stone-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                3. Billing & Payment (बिल और भुगतान)
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-stone-700">Delivery Charge (₹)</Label>
                  <Input
                    type="number"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    className="text-xs mt-1 font-mono"
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-stone-700">Discount (₹)</Label>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="text-xs mt-1 font-mono text-emerald-700 font-bold"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="grid grid-cols-2 gap-2.5">
                <div
                  onClick={() => {
                    setPaymentMethod('whatsapp_upi');
                    setPaymentStatus('paid');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'whatsapp_upi'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-500'
                      : 'border-stone-200 bg-stone-50/40 hover:bg-stone-50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${paymentMethod === 'whatsapp_upi' ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">WhatsApp / UPI (Paid)</p>
                    <p className="text-[10px] text-stone-500">PhonePe / GPay / QR</p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setPaymentMethod('cash_on_delivery');
                    setPaymentStatus('pending');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-orange-600 bg-orange-50/60 ring-1 ring-orange-500'
                      : 'border-stone-200 bg-stone-50/40 hover:bg-stone-50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${paymentMethod === 'cash_on_delivery' ? 'bg-orange-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                    <Bike className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">Cash on Delivery</p>
                    <p className="text-[10px] text-stone-500">डिलीवरी पर कैश लेगा</p>
                  </div>
                </div>
              </div>

              {/* Special Cooking & Delivery Instructions */}
              <div>
                <Label className="text-xs font-bold text-stone-700">Special Notes (किचन या डिलीवरी निर्देश)</Label>
                <Textarea
                  placeholder="e.g. कम मिर्च रखें, गरमा-गरम 1:30 PM तक पहुँचाएं"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-xs mt-1 h-14"
                />
              </div>

              {/* Grand Total Summary Box */}
              <div className="p-4 bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400 uppercase tracking-wider font-bold">Total Payable Amount</span>
                  <p className="text-2xl font-black text-white mt-0.5">
                    ₹{grandTotal}
                  </p>
                </div>
                <div className="text-right text-xs space-y-0.5 text-stone-300">
                  <p>Meals Subtotal: <strong className="text-white">₹{itemsSubtotal}</strong></p>
                  {Number(deliveryCharge) > 0 && <p>Delivery: <strong className="text-white">+₹{deliveryCharge}</strong></p>}
                  {Number(discount) > 0 && <p className="text-emerald-400">Discount: <strong>-₹{discount}</strong></p>}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className="p-4 bg-stone-50 border-t border-stone-200 sticky bottom-0 z-10 flex flex-row items-center justify-between sm:justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="text-xs border-stone-300 text-stone-700"
            >
              Cancel (रद्द करें)
            </Button>

            <Button
              type="submit"
              disabled={loading || itemsSubtotal === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-5 shadow-sm flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Punching Order...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Punch & Dispatch Order (₹{grandTotal})
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
