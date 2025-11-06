'use client';

import { useCart, useUpdateCartQuantity, useRemoveFromCart, useClearCart, useApplyDiscount, useRemoveDiscount } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Plus, Minus, Trash2, ShoppingBag, ShoppingCart, Ticket, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/axios';
import Image from 'next/image';
import { useState } from 'react';

export default function CartPage() {
  const router = useRouter();
  const { data: cartData, isLoading } = useCart();
  const updateQuantity = useUpdateCartQuantity();
  const removeItem = useRemoveFromCart();
  const clearCart = useClearCart();
  const applyDiscount = useApplyDiscount();
  const removeDiscount = useRemoveDiscount();
  const [couponCode, setCouponCode] = useState('');

  const cart = cartData?.data;

  const handleUpdateQuantity = async (menuItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(menuItemId);
      return;
    }

    try {
      await updateQuantity.mutateAsync({
        menuItemId,
        quantity: newQuantity,
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleRemoveItem = async (menuItemId: string) => {
    try {
      await removeItem.mutateAsync({ menuItemId });
      toast.success('Item removed from cart');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
      await clearCart.mutateAsync();
      toast.success('Cart cleared');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      await applyDiscount.mutateAsync(couponCode.trim().toUpperCase());
      toast.success('Coupon applied successfully!');
      setCouponCode('');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeDiscount.mutateAsync();
      toast.success('Coupon removed');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const items = cart?.items || [];
  const hasItems = items.length > 0;

  // Calculate values - prioritize API values, fallback to calculations
  const computedItemsTotal = items.reduce(
    (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

        {!hasItems ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some items to get started!</p>
            <Button onClick={() => router.push('/browse')}>
              Browse Products
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </h2>
                {hasItems && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCart}
                    disabled={clearCart.isPending}
                  >
                    {clearCart.isPending ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Cart
                      </>
                    )}
                  </Button>
                )}
              </div>

              {items.map((item) => {
                // ✅ Extract menuItemId - handle both populated object and string ID
                const menuItemId = (() => {
                  const id = item.menuItemId as any;
                  if (id && typeof id === 'object' && '_id' in id && id._id) {
                    return String(id._id);
                  }
                  return String(id || '');
                })();
                
                return (
                <Card key={menuItemId} className="p-4">
                  <div className="flex gap-4">
                    {/* Item Image */}
                    <div className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.itemName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.itemName}</h3>
                      {item.storeName && (
                        <p className="text-sm text-gray-500 mb-2">{item.storeName}</p>
                      )}
                      <p className="text-lg font-bold text-red-600 mb-3">
                        ₹{item.price.toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateQuantity(menuItemId, (item.quantity || 1) - 1)}
                            disabled={updateQuantity.isPending}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center">{item.quantity || 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateQuantity(menuItemId, (item.quantity || 1) + 1)}
                            disabled={updateQuantity.isPending}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(menuItemId)}
                          disabled={removeItem.isPending}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                {cart?.storeName && (
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-sm text-gray-600">Store</p>
                    <p className="font-medium">{cart.storeName}</p>
                  </div>
                )}

                {/* Coupon Code Section */}
                <div className="mb-4 pb-4 border-b">
                  <h3 className="text-sm font-semibold mb-2">Coupon Code</h3>
                  {cart?.discount ? (
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {cart.discount.code}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        disabled={removeDiscount.isPending}
                        className="h-6 px-2 text-red-600 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleApplyCoupon();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={applyDiscount.isPending || !couponCode.trim()}
                        size="sm"
                        variant="outline"
                      >
                        {applyDiscount.isPending ? (
                          <Spinner size="sm" />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
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

                <Button
                  onClick={() => router.push('/checkout')}
                  className="w-full"
                  size="lg"
                  disabled={!hasItems}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </Button>
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

