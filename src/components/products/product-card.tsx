'use client';

import { useState } from 'react';
import { useAddToCart } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/axios';
import Image from 'next/image';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category?: string;
  description?: string;
  isAvailable?: boolean;
  stockQuantity?: number;
  image?: string;
  foodType?: string;
  preparationTime?: number;
  discount?: number;
  storeName?: string;
  isPopular?: boolean;
  isBestSeller?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useAddToCart();

  const discountPrice = product.discount
    ? product.price - (product.price * product.discount / 100)
    : product.price;

  const handleAddToCart = async () => {
    if (!product.isAvailable) {
      toast.error('Product is currently unavailable');
      return;
    }

    try {
      await addToCart.mutateAsync({
        menuItemId: product.id,
        quantity,
      });
      toast.success(`${product.name} added to cart!`);
      setQuantity(1);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {!!product.discount && product.discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            {product.discount}% OFF
          </div>
        )}
        {product.isBestSeller && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
            Best Seller
          </div>
        )}
        {product.isPopular && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
            Popular
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
          {product.storeName && (
            <p className="text-sm text-gray-500">{product.storeName}</p>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {product.discount && product.discount > 0 ? (
              <>
                <span className="text-lg font-bold text-red-600">
                  ₹{discountPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold">₹{product.price.toFixed(2)}</span>
            )}
          </div>
          {product.foodType && (
            <span className={`px-2 py-1 rounded text-xs ${
              product.foodType === 'veg' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.foodType.toUpperCase()}
            </span>
          )}
        </div>

        {/* Quantity Selector and Add to Cart */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-10 text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={!product.isAvailable || addToCart.isPending}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {addToCart.isPending ? (
              <>
                <Spinner size="sm" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </>
            )}
          </Button>
        </div>

        {!product.isAvailable && (
          <p className="text-xs text-red-500 mt-2">Currently unavailable</p>
        )}
      </div>
    </Card>
  );
}

