'use client';

import { useState, useEffect } from 'react';
import { useCart, useAuthMe } from '@/hooks/api';
import { useCreateOrderFromCart } from '@/hooks/api/use-orders';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/axios';
import { MapPin, CreditCard, Check, Plus, MessageCircle } from 'lucide-react';
import { LocationPicker } from '@/components/maps/location-picker';
import { cn } from '@/lib/utils';
import { appConfig } from '@/config/app.config';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cartData, isLoading: cartLoading } = useCart();
  const { data: authData } = useAuthMe();
  const createOrder = useCreateOrderFromCart();

  const savedAddresses = authData?.user?.addresses || [];
  const defaultAddress = savedAddresses.find((addr) => addr.isDefault) || savedAddresses[0];

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useSavedAddress, setUseSavedAddress] = useState(savedAddresses.length > 0);
  const [formData, setFormData] = useState({
    label: 'Home' as 'Home' | 'Work' | 'Other',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    coordinates: null as { lat: number; lng: number } | null,
  });

  // ✅ Payment method is always Cash on Delivery
  const paymentMethod = 'cash_on_delivery';

  // Initialize with default address if available
  useEffect(() => {
    if (defaultAddress && useSavedAddress && selectedAddressId === null && savedAddresses.length > 0) {
      const defaultIndex = savedAddresses.findIndex((a) => a === defaultAddress);
      const indexToSet = defaultIndex >= 0 ? defaultIndex.toString() : '0';
      setSelectedAddressId(indexToSet);
      const address = savedAddresses[defaultIndex >= 0 ? defaultIndex : 0];
      if (address) {
        setFormData({
          label: address.label || 'Home',
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          pincode: address.pincode || '',
          country: address.country || 'India',
          coordinates: (address as any).coordinates || null,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultAddress, useSavedAddress, savedAddresses.length]);

  // Update form when address is selected
  useEffect(() => {
    if (selectedAddressId !== null && useSavedAddress && savedAddresses.length > 0) {
      const index = parseInt(selectedAddressId);
      if (index >= 0 && index < savedAddresses.length) {
        const selectedAddress = savedAddresses[index];
        if (selectedAddress) {
          setFormData({
            label: selectedAddress.label || 'Home',
            street: selectedAddress.street || '',
            city: selectedAddress.city || '',
            state: selectedAddress.state || '',
            pincode: selectedAddress.pincode || '',
            country: selectedAddress.country || 'India',
            coordinates: (selectedAddress as any).coordinates || null,
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddressId, useSavedAddress]);

  const cart = cartData?.data;
  const hasItems = cart?.items && cart.items.length > 0;

  // Calculate values - prioritize API values, fallback to calculations
  const items = cart?.items || [];
  const computedItemsTotal = items.reduce(
    (sum: number, i: any) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
    0
  );
  
  // Use deliveryCharge from API if exists, otherwise calculate
  const deliveryCharge = cart?.deliveryCharge !== undefined && cart?.deliveryCharge !== null
    ? cart.deliveryCharge
    : (computedItemsTotal >= 100 ? 0 : 30);
  
  // Use finalAmount from API if exists, otherwise calculate
  const discountAmount = cart?.discount?.discountAmount || 0;
  const finalAmount = cart?.finalAmount !== undefined && cart?.finalAmount !== null
    ? cart.finalAmount
    : Math.max(0, computedItemsTotal + deliveryCharge - discountAmount);
  
  // Use totalAmount from API if exists, otherwise use computed
  const totalAmount = cart?.totalAmount !== undefined && cart?.totalAmount !== null
    ? cart.totalAmount
    : computedItemsTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasItems) {
      toast.error('Your cart is empty');
      return;
    }

    // Validate form
    if (!formData.street || !formData.city || !formData.pincode) {
      toast.error('Please fill in all required address fields');
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        deliveryAddress: {
          label: formData.label,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
        // Payment method is always cash_on_delivery (handled by backend)
      });

      if (order.success && (order.data?.id || order.data?._id)) {
        const orderId = order.data.id || order.data._id;
        toast.success('Order placed successfully!');
        router.push(`/orders/${orderId}`);
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleWhatsAppOrder = () => {
    if (!hasItems) {
      toast.error('Your cart is empty');
      return;
    }

    // Validate form
    if (!formData.street || !formData.city || !formData.pincode) {
      toast.error('Please fill in all required address fields');
      return;
    }

    // Format order items
    const itemsText = items
      .map((item: any) => {
        const itemName = item.itemName || item.name || 'Item';
        const quantity = item.quantity || 1;
        const price = Number(item.price) || 0;
        const itemTotal = price * quantity;
        return `• ${itemName} x${quantity} = ₹${itemTotal.toFixed(2)}`;
      })
      .join('\n');

    // Format delivery address
    const addressText = `${formData.label}\n${formData.street}\n${formData.city}${formData.state ? `, ${formData.state}` : ''}\n${formData.pincode}${formData.country ? `, ${formData.country}` : ''}`;

    // Build WhatsApp message
    let message = `🍽️ *New Order Request*\n\n`;
    
    if (cart?.storeName) {
      message += `🏪 *Store:* ${cart.storeName}\n\n`;
    }
    
    message += `📦 *Order Items:*\n${itemsText}\n\n`;
    message += `📍 *Delivery Address:*\n${addressText}\n\n`;
    message += `💰 *Order Summary:*\n`;
    message += `Items Total: ₹${totalAmount.toFixed(2)}\n`;
    message += `Delivery Charge: ₹${deliveryCharge.toFixed(2)}\n`;
    
    if (cart?.discount) {
      message += `Discount (${cart.discount.code}): -₹${discountAmount.toFixed(2)}\n`;
    }
    
    message += `\n*Total Amount: ₹${finalAmount.toFixed(2)}*\n\n`;
    message += `💳 Payment Method: Cash on Delivery\n\n`;
    message += `Please confirm this order. Thank you! 🙏`;

    const phoneNumber = appConfig.contact.whatsapp;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some items before checkout!</p>
            <Button onClick={() => router.push('/browse')}>
              Browse Products
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Information Section */}
            {cart?.storeName && (
              <Card className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{cart.storeName}</h2>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Ordering from a single store
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {cart?.totalItems || 0} {cart?.totalItems === 1 ? 'item' : 'items'}
                  </Badge>
                </div>
              </Card>
            )}

            {/* Delivery Address */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Delivery Address</h2>
                </div>
                {savedAddresses.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUseSavedAddress(!useSavedAddress);
                      if (!useSavedAddress && defaultAddress) {
                        const defaultIndex = savedAddresses.findIndex((a) => a === defaultAddress);
                        setSelectedAddressId(defaultIndex >= 0 ? defaultIndex.toString() : '0');
                      }
                    }}
                  >
                    {useSavedAddress ? 'Enter New Address' : 'Use Saved Address'}
                  </Button>
                )}
              </div>

              {useSavedAddress && savedAddresses.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <Label>Select Saved Address</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {savedAddresses.map((address, index: number) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedAddressId(index.toString())}
                          className={cn(
                            'p-4 border-2 rounded-lg text-left transition-all hover:border-[lab(66%_50.34_52.19)]',
                            selectedAddressId === index.toString()
                              ? 'border-[lab(66%_50.34_52.19)] bg-[lab(66%_50.34_52.19)]/5'
                              : 'border-gray-200'
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="font-semibold capitalize">{address.label}</span>
                            </div>
                            {address.isDefault && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                            {selectedAddressId === index.toString() && (
                              <Check className="w-5 h-5 text-[lab(66%_50.34_52.19)]" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {address.street}
                            <br />
                            {address.city}
                            {address.state && `, ${address.state}`}
                            <br />
                            {address.pincode}
                            {address.country && `, ${address.country}`}
                          </p>
                        </button>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => router.push('/customer/addresses')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Manage Addresses
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                <div>
                  <Label htmlFor="label">Address Label</Label>
                  <select
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value as 'Home' | 'Work' | 'Other' })}
                    className="w-full border rounded px-3 py-2 mt-1"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <Label>Location on Map</Label>
                  <LocationPicker
                    onLocationSelect={(location) => {
                      setFormData({
                        ...formData,
                        street: location.address.split(',')[0] || location.address,
                        city: location.city || '',
                        state: location.state || '',
                        pincode: location.pincode || '',
                        coordinates: { lat: location.lat, lng: location.lng },
                      });
                    }}
                    initialLocation={formData.coordinates || undefined}
                    height="300px"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select location on map above or enter manually
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      required
                      pattern="[0-9]{6}"
                      maxLength={6}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                </div>
              )}
            </Card>

            {/* Payment Method - Cash on Delivery Only */}
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 border-2 border-green-300 rounded-lg bg-white">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-green-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic">
                  Currently, only Cash on Delivery payment method is available
                </p>
              </div>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              {cart?.storeName && (
                <div className="mb-4 pb-4 border-b">
                  <p className="text-sm text-gray-600">Store</p>
                  <p className="font-medium">{cart.storeName}</p>
                </div>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Items ({cart?.totalItems || 0})</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span>₹{deliveryCharge.toFixed(2)}</span>
                </div>
                {cart?.discount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({cart.discount.code})</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between font-bold text-lg mb-6 pt-4 border-t">
                <span>Total</span>
                <span>₹{finalAmount.toFixed(2)}</span>
              </div>

              {/* WhatsApp Order Button */}
              <Button
                type="button"
                onClick={handleWhatsAppOrder}
                className="w-full mb-3 bg-[#25D366] hover:bg-[#20BA5A] text-white"
                size="lg"
                disabled={!hasItems}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Order via WhatsApp
              </Button>

              {/* Backend Order Button - Disabled */}
              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={true}
                  variant="outline"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Place Order (Backend)
                </Button>
                <p className="text-xs text-center text-amber-600 font-medium">
                  ⚠️ Currently getting technical error
                </p>
              </div>
            </Card>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

