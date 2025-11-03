'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/api';
import { useCreateOrderFromCart } from '@/hooks/api/use-orders';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/axios';
import { MapPin, CreditCard, Check } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cartData, isLoading: cartLoading } = useCart();
  const createOrder = useCreateOrderFromCart();

  const [formData, setFormData] = useState({
    label: 'Home' as 'Home' | 'Work' | 'Other',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  const cart = cartData?.data;
  const hasItems = cart?.items && cart.items.length > 0;

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
        paymentMethod,
      });

      if (order.success && order.data?.id) {
        toast.success('Order placed successfully!');
        router.push(`/orders/${order.data.id}`);
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
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
            <Button onClick={() => router.push('/food')}>
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
            {/* Delivery Address */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Delivery Address</h2>
              </div>

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

                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    required
                    className="mt-1"
                  />
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
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive your order</p>
                  </div>
                </label>
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
                  <span>₹{((cart?.totalAmount || 0) - (cart?.deliveryCharge || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span>₹{cart?.deliveryCharge?.toFixed(2) || '0.00'}</span>
                </div>
                {cart?.discount && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({cart.discount.code})</span>
                    <span>-₹{cart.discount.discountAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between font-bold text-lg mb-6 pt-4 border-t">
                <span>Total</span>
                <span>₹{cart?.finalAmount?.toFixed(2) || '0.00'}</span>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={createOrder.isPending || !hasItems}
              >
                {createOrder.isPending ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Place Order
                  </>
                )}
              </Button>
            </Card>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

