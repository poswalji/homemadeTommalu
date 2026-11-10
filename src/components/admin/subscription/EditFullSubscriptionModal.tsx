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
  Loader2,
  CheckCircle2,
  Clock,
  Layers,
  Edit,
  Navigation
} from 'lucide-react';

interface EditFullSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: any;
  onSuccess: () => void;
}

export function EditFullSubscriptionModal({
  isOpen,
  onClose,
  subscription,
  onSuccess,
}: EditFullSubscriptionModalProps) {
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Jaipur');
  const [pincode, setPincode] = useState('302001');

  const [planType, setPlanType] = useState<'lunch' | 'dinner' | 'both'>('lunch');
  const [planName, setPlanName] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [price, setPrice] = useState<number | string>(2400);
  const [quantity, setQuantity] = useState<number>(1);
  const [rotiPreference, setRotiPreference] = useState('4 Roti (Standard)');
  const [deliverySequence, setDeliverySequence] = useState<number | string>(0);
  const [status, setStatus] = useState('active');
  const [adminNotes, setAdminNotes] = useState('');

  // Populate fields when subscription changes
  useEffect(() => {
    if (subscription && isOpen) {
      setCustomerName(subscription.customerName || '');
      setMobileNumber(subscription.mobileNumber || '');
      setStreet(subscription.deliveryAddress?.street || '');
      setLandmark(subscription.deliveryAddress?.landmark || '');
      setCity(subscription.deliveryAddress?.city || 'Jaipur');
      setPincode(subscription.deliveryAddress?.pincode || '302001');

      setPlanType(subscription.planType || 'lunch');
      setPlanName(subscription.planName || '');
      setDuration(subscription.duration || 30);

      const sDate = subscription.startDate ? new Date(subscription.startDate).toISOString().split('T')[0] : '';
      const eDate = subscription.endDate ? new Date(subscription.endDate).toISOString().split('T')[0] : '';
      setStartDate(sDate);
      setEndDate(eDate);

      setPrice(subscription.price || (subscription.planType === 'both' ? 4500 : 2400));
      setQuantity(subscription.quantity || 1);
      setRotiPreference(subscription.rotiPreference || '4 Roti (Standard)');
      setDeliverySequence(subscription.deliverySequence || 0);
      setStatus(subscription.status || 'active');
      setAdminNotes(subscription.adminNotes || '');
    }
  }, [subscription, isOpen]);

  // Handle changing start date or duration auto-updating end date
  const handleDurationChange = (newDur: number) => {
    setDuration(newDur);
    if (startDate) {
      const s = new Date(startDate);
      s.setDate(s.getDate() + newDur - 1);
      setEndDate(s.toISOString().split('T')[0]);
    }
  };

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    if (newStart && duration) {
      const s = new Date(newStart);
      s.setDate(s.getDate() + duration - 1);
      setEndDate(s.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Valid 10-digit phone number is required');
      return;
    }

    if (!street.trim()) {
      toast.error('Delivery street address is required');
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
        planName: planName.trim() || `${planType === 'both' ? 'Lunch + Dinner' : planType.toUpperCase()} ${duration}-Days Plan`,
        duration: Number(duration) || 30,
        startDate,
        endDate,
        price: Number(price) || 2400,
        quantity: Number(quantity) || 1,
        rotiPreference,
        deliverySequence: Number(deliverySequence) || 0,
        status,
        adminNotes: adminNotes.trim(),
      };

      await subscriptionApi.updateSubscriptionDetails(subscription._id, payload);

      toast.success('Subscription Updated Successfully!', {
        description: `Changes saved for ${customerName}. Schedules and inventory synchronized.`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Update subscription error:', err);
      toast.error(
        err?.response?.data?.message || 'Failed to update subscription. Please check fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 border-stone-200">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white p-5 sticky top-0 z-10 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl">
                <Edit className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-white">
                  Edit Subscription Details
                </DialogTitle>
                <DialogDescription className="text-stone-400 text-xs mt-0.5">
                  ग्राहक का नाम, पता, स्लॉट, दिन, स्थिति और रोटियों की पसंद बदलें।
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 1. Customer Information */}
            <div className="space-y-3.5">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-orange-600" />
                1. Customer Details (ग्राहक की जानकारी)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <Label className="text-xs font-bold text-stone-700">Customer Name *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <Input
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
                <Label className="text-xs font-bold text-stone-700">Street / Flat / Colony *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <Input
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
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-stone-700">City</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-stone-700">Pincode</Label>
                  <Input
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="text-xs mt-1 font-mono"
                  />
                </div>
              </div>

              {/* Route Stop Priority Setting */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Navigation className="h-3.5 w-3.5 text-amber-600" />
                    Delivery Route Stop Priority (रूट स्टॉप क्रम)
                  </Label>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                    {Number(deliverySequence) > 0 ? `Stop #${deliverySequence}` : 'Auto On-The-Way'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <Input
                    type="number"
                    min={0}
                    max={999}
                    value={deliverySequence}
                    onChange={(e) => setDeliverySequence(e.target.value)}
                    placeholder="0 (Auto Highway → Gate → Hostels)"
                    className="text-xs font-mono bg-white"
                  />
                  <p className="text-[10px] text-stone-500 leading-tight">
                    0 = ऑटोमैटिक हाईवे/गेट वेपॉइंट क्रम। 1, 2, 3 = राइडर के लिए मैन्युअल ड्रॉप प्राथमिकता।
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Plan Type, Duration, and Dates */}
            <div className="space-y-3.5 pt-3 border-t border-stone-200">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="h-3.5 w-3.5 text-orange-600" />
                2. Meal Slot & Validity (स्लॉट और अवधि)
              </span>

              {/* Slot Selector */}
              <div>
                <Label className="text-xs font-bold text-stone-700 mb-1.5 block">Meal Slot</Label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPlanType('lunch')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      planType === 'lunch'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                        : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Sun className="h-4 w-4 text-amber-500" /> Lunch Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanType('dinner')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      planType === 'dinner'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-500'
                        : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Moon className="h-4 w-4 text-indigo-600" /> Dinner Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanType('both')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      planType === 'both'
                        ? 'border-purple-500 bg-purple-50 text-purple-900 ring-1 ring-purple-500'
                        : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Layers className="h-4 w-4 text-purple-600" /> Lunch + Dinner
                  </button>
                </div>
              </div>

              {/* Duration Presets */}
              <div>
                <Label className="text-xs font-bold text-stone-700 mb-1.5 block">Duration (Days)</Label>
                <div className="flex items-center gap-2">
                  {[7, 15, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleDurationChange(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        duration === d
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => handleDurationChange(Number(e.target.value) || 1)}
                    className="w-20 text-xs font-bold font-mono h-8"
                    min={1}
                  />
                  <span className="text-xs text-stone-500">days total</span>
                </div>
              </div>

              {/* Start Date and End Date Pickers */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <Label className="text-xs font-bold text-stone-700">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="text-xs mt-1 font-mono"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-stone-700">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-xs mt-1 font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 3. Tiffin Quantity, Roti Preference, and Price */}
            <div className="space-y-3.5 pt-3 border-t border-stone-200">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                3. Quantity, Food Preference & Price
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-bold text-stone-700">Tiffin Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="text-xs mt-1 font-mono"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-stone-700">Roti Preference</Label>
                  <select
                    value={rotiPreference}
                    onChange={(e) => setRotiPreference(e.target.value)}
                    className="w-full text-xs mt-1 h-9 rounded-md border border-stone-200 bg-white px-2.5 font-medium text-stone-800"
                  >
                    <option value="4 Roti (Standard)">4 Roti (Standard)</option>
                    <option value="5 Roti">5 Roti</option>
                    <option value="6 Roti (Heavy Diet)">6 Roti (Heavy Diet)</option>
                    <option value="Desi Ghee Roti">Desi Ghee Roti</option>
                    <option value="Plain / No Ghee">Plain / No Ghee</option>
                    <option value="Rice Only (No Roti)">Rice Only (No Roti)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-stone-700">Total Agreed Price (₹)</Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="text-xs mt-1 font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              {/* Status Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <Label className="text-xs font-bold text-stone-700">Subscription Status</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-xs mt-1 h-9 rounded-md border border-stone-200 bg-white px-2.5 font-bold text-stone-800"
                  >
                    <option value="active">Active (चालू)</option>
                    <option value="paused">Paused (पॉज़ / रुका हुआ)</option>
                    <option value="completed">Completed (समाप्त)</option>
                    <option value="cancelled">Cancelled (रद्द)</option>
                    <option value="expired">Expired (एक्सपायर)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-stone-700">Admin Notes / Kitchen Info</Label>
                  <Input
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. कम मिर्च, 1st फ्लोर पर देना है"
                    className="text-xs mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className="p-4 bg-stone-50 border-t border-stone-200 sticky bottom-0 z-10 flex flex-row items-center justify-between sm:justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="text-xs border-stone-300 text-stone-700"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-5 shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save Changes (बदलाव सेव करें)
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
