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
import { subscriptionApi } from '@/services/api/subscription.api';
import { toast } from 'sonner';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Utensils,
  Sun,
  Moon,
  Plus,
  Loader2,
  CheckCircle2,
  MessageCircle,
  FileText,
  CreditCard,
  Navigation,
} from 'lucide-react';
import { apiClient } from '@/lib/axios';

interface AddManualSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddManualSubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
}: AddManualSubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Jaipur');
  const [pincode, setPincode] = useState('302001');

  const [planType, setPlanType] = useState<'lunch' | 'dinner' | 'both'>('lunch');
  const [duration, setDuration] = useState<number>(30);
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [quantity, setQuantity] = useState<number>(1);
  const [rotiPreference, setRotiPreference] = useState('4 Roti (Standard)');
  const [deliverySequence, setDeliverySequence] = useState<number | string>(0);
  const [price, setPrice] = useState<number | string>(2400);

  const [paymentMethod, setPaymentMethod] = useState('whatsapp_upi');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch available plan models if needed
  useEffect(() => {
    if (isOpen) {
      apiClient
        .get('/homemade/plans')
        .then((res) => {
          if (res.data?.data) {
            setPlans(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Auto-calculate suggested price when planType or duration changes
  useEffect(() => {
    const baseDailyRate = planType === 'both' ? 150 : 80;
    const mealsPerDay = planType === 'both' ? 2 : 1;
    // Standard rates: 30 days: Lunch ₹2,400 (₹80/meal), Both ₹4,500 (₹75/meal)
    let autoPrice = 2400;
    if (planType === 'both') {
      autoPrice = duration === 30 ? 4500 : duration * 150;
    } else {
      autoPrice = duration === 30 ? 2400 : duration * 80;
    }
    setPrice(autoPrice * quantity);
  }, [planType, duration, quantity]);

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
      toast.error('Delivery street / address is required (डिलीवरी पता लिखें)');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customerName: customerName.trim(),
        mobileNumber: cleanPhone,
        deliveryAddress: {
          street: street.trim(),
          landmark: landmark.trim(),
          city: city.trim() || 'Jaipur',
          pincode: pincode.trim() || '302001',
        },
        planType,
        planName: `${planType === 'both' ? 'Lunch + Dinner' : planType.toUpperCase()} ${duration}-Days Tiffin Plan`,
        duration: Number(duration),
        startDate: startDate,
        quantity: Number(quantity) || 1,
        rotiPreference,
        price: Number(price) || (planType === 'both' ? 4500 : 2400),
        paymentMethod,
        paymentStatus,
        deliverySequence: Number(deliverySequence) || 0,
        adminNotes: adminNotes.trim(),
      };

      await subscriptionApi.createManualSubscription(payload);

      toast.success('Subscriber Added Successfully!', {
        description: `Active ${duration}-day subscription created for ${customerName}. Today's delivery scheduled.`,
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Manual subscription error:', err);
      toast.error(
        err?.response?.data?.message || 'Failed to create subscription. Please check fields.'
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
    setAdminNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[620px] max-h-[92vh] overflow-y-auto p-0 rounded-3xl border-0 shadow-2xl">
        {/* Header with WhatsApp & Offline Badge */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-t-3xl relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-bold flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp & Offline Customers</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80 text-[11px] font-medium">
              Direct Activation
            </span>
          </div>

          <DialogTitle className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>मैनुअल सब्सक्रिप्शन जोड़ें (Add Subscriber)</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-emerald-100/80 mt-1">
            व्हाट्सएप, कॉल या नकद वाले ग्राहकों का टिफिन तुरंत सक्रिय करें। आज की डिलीवरी स्वतः शेड्यूल हो जाएगी।
          </DialogDescription>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
          {/* Section 1: Customer Info */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              1. ग्राहक का विवरण (Customer Details)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="custName" className="text-xs font-semibold text-gray-700">
                  Customer Name *
                </Label>
                <div className="relative mt-1">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="custName"
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="pl-9 text-sm rounded-xl border-gray-200 focus-visible:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="custMobile" className="text-xs font-semibold text-gray-700">
                  WhatsApp / Phone Number *
                </Label>
                <div className="relative mt-1">
                  <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="custMobile"
                    placeholder="10-digit number (e.g. 9829012345)"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    maxLength={14}
                    className="pl-9 text-sm rounded-xl border-gray-200 focus-visible:ring-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              2. डिलीवरी पता (Delivery Address)
            </span>

            <div>
              <Label htmlFor="street" className="text-xs font-semibold text-gray-700">
                House / Flat No, Street, Building, Area *
              </Label>
              <div className="relative mt-1">
                <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
                <textarea
                  id="street"
                  rows={2}
                  placeholder="e.g. Flat 302, Royal Residency, Near Durgapura Railway Station"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="landmark" className="text-xs font-semibold text-gray-700">
                  Landmark
                </Label>
                <Input
                  id="landmark"
                  placeholder="Near Park / Mandir"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="mt-1 text-sm rounded-xl border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="city" className="text-xs font-semibold text-gray-700">
                  City
                </Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 text-sm rounded-xl border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="pincode" className="text-xs font-semibold text-gray-700">
                  Pincode
                </Label>
                <Input
                  id="pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="mt-1 text-sm rounded-xl border-gray-200"
                />
              </div>
            </div>

            {/* Route Sequence Setting */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="delSeq" className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5 text-amber-600" />
                  Delivery Route Priority (रूट स्टॉप प्राथमिकता)
                </Label>
                <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                  {Number(deliverySequence) > 0 ? `Stop #${deliverySequence}` : 'Auto On-The-Way'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 items-center">
                <Input
                  id="delSeq"
                  type="number"
                  min={0}
                  max={999}
                  value={deliverySequence}
                  onChange={(e) => setDeliverySequence(e.target.value)}
                  placeholder="0 (Auto Highway → Gate → Hostels)"
                  className="text-xs font-mono bg-white"
                />
                <p className="text-[10px] text-stone-500 leading-tight">
                  0 = ऑटो डिटेक्ट (हाईवे से गेट व हॉस्टल क्रम)। 1, 2, 3 = राइडर के लिए पहला/दूसरा स्टॉप।
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Meal Plan & Slot Selection */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              3. टिफिन स्लॉट व अवधि (Plan & Meals)
            </span>

            {/* Meal Slot Selection (Lunch, Dinner, Both) */}
            <div>
              <Label className="text-xs font-semibold text-gray-700 block mb-1.5">
                समय / स्लॉट (Meal Slot)
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPlanType('lunch')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                    planType === 'lunch'
                      ? 'border-orange-500 bg-orange-50/80 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900">
                    <Sun className="w-4 h-4 text-orange-500" />
                    <span>दोपहर (Lunch)</span>
                  </div>
                  <span className="text-[11px] text-gray-500">1 Meal / Day (12-2 PM)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanType('dinner')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                    planType === 'dinner'
                      ? 'border-indigo-500 bg-indigo-50/80 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Moon className="w-4 h-4 text-indigo-500" />
                    <span>रात (Dinner)</span>
                  </div>
                  <span className="text-[11px] text-gray-500">1 Meal / Day (7-9 PM)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanType('both')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                    planType === 'both'
                      ? 'border-emerald-500 bg-emerald-50/80 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <Utensils className="w-4 h-4 text-emerald-500" />
                    <span>दोनों (Both)</span>
                  </div>
                  <span className="text-[11px] text-gray-500">2 Meals / Day (L + D)</span>
                </button>
              </div>
            </div>

            {/* Duration & Start Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="duration" className="text-xs font-semibold text-gray-700">
                  अवधि (Duration)
                </Label>
                <div className="flex items-center gap-1 mt-1">
                  {[7, 15, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                        duration === d
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(1, Number(e.target.value) || 1))}
                    className="w-14 text-xs font-bold rounded-xl border-gray-200 text-center"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="startDate" className="text-xs font-semibold text-gray-700">
                  Start Date (शुरुआत)
                </Label>
                <div className="relative mt-1">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-9 text-xs rounded-xl border-gray-200"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="quantity" className="text-xs font-semibold text-gray-700">
                  Quantity (टिफिन)
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-1 text-sm font-bold text-center rounded-xl border-gray-200"
                />
              </div>
            </div>

            {/* Roti Preference & Agreed Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rotiPref" className="text-xs font-semibold text-gray-700">
                  Roti Preference (रोटी)
                </Label>
                <select
                  id="rotiPref"
                  value={rotiPreference}
                  onChange={(e) => setRotiPreference(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="4 Roti (Standard)">4 Roti (Standard Regular)</option>
                  <option value="5 Roti (Extra)">5 Roti (Heavy Meal)</option>
                  <option value="6 Roti">6 Roti</option>
                  <option value="Ghee Roti (4 Pcs)">Ghee Roti (Desi Ghee)</option>
                  <option value="Plain / No Roti (Rice Extra)">No Roti (Only Rice Extra)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="totalPrice" className="text-xs font-semibold text-gray-700">
                  Agreed Total Package Price (कुल राशि) *
                </Label>
                <div className="relative mt-1">
                  <span className="text-xs text-gray-500 font-bold absolute left-3 top-1/2 -translate-y-1/2">
                    ₹
                  </span>
                  <Input
                    id="totalPrice"
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value) || 0)}
                    className="pl-7 text-sm font-black text-gray-900 rounded-xl border-gray-200 focus-visible:ring-emerald-500"
                    required
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Effective ~₹
                  {(
                    Number(price) /
                    Math.max(1, duration * (planType === 'both' ? 2 : 1) * quantity)
                  ).toFixed(1)}{' '}
                  / meal
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Payment & Delivery Note */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              4. भुगतान व विशेष निर्देश (Payment & Notes)
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="paymentMethod" className="text-xs font-semibold text-gray-700">
                  Payment Method
                </Label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="whatsapp_upi">WhatsApp UPI / QR Scan</option>
                  <option value="cash">Cash on 1st Delivery</option>
                  <option value="gpay_phonepe">GPay / PhonePe Direct</option>
                  <option value="bank_transfer">Bank Transfer / NEFT</option>
                </select>
              </div>

              <div>
                <Label htmlFor="paymentStatus" className="text-xs font-semibold text-gray-700">
                  Payment Status
                </Label>
                <select
                  id="paymentStatus"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="paid">✅ Paid (Advance Received)</option>
                  <option value="pending">⏳ Pending (To Collect)</option>
                  <option value="partial">🌗 Partial Advance</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-xs font-semibold text-gray-700">
                Delivery Boy / Kitchen Note (Optional)
              </Label>
              <div className="relative mt-1">
                <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <textarea
                  id="notes"
                  rows={2}
                  placeholder="e.g. Deliver on 2nd floor, less spicy food, call on arrival"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="rounded-xl text-gray-600"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md px-5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Activate Subscription Now</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
