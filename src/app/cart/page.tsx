'use client';

import { useCart, useUpdateCartQuantity, useRemoveFromCart, useClearCart } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Plus, Minus, Trash2, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/axios';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const { data: cartData, isLoading } = useCart();
  const updateQuantity = useUpdateCartQuantity();
  const removeItem = useRemoveFromCart();
  const clearCart = useClearCart();

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const items = cart?.items || [];
  const hasItems = items.length > 0;

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

              {items.map((item) => (
                <Card key={item.menuItemId} className="p-4">
                  <div className="flex gap-4">
                    {/* Item Image */}
                    <div className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
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
                            onClick={() => handleUpdateQuantity(item.menuItemId, (item.quantity || 1) - 1)}
                            disabled={updateQuantity.isPending}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center">{item.quantity || 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.menuItemId, (item.quantity || 1) + 1)}
                            disabled={updateQuantity.isPending}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.menuItemId)}
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
              ))}
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

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
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

