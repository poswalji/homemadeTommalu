'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Star } from 'lucide-react';
import { useCreateReview } from '@/hooks/api';
import { toast } from 'sonner';
import type { CreateReviewData } from '@/services/api/reviews.api';

interface OrderReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  storeId: string;
  storeName?: string;
  items?: Array<{
    id: string;
    name: string;
  }>;
  onReviewSubmitted?: () => void;
}

export function OrderReviewModal({
  open,
  onOpenChange,
  orderId,
  storeId,
  storeName,
  items = [],
  onReviewSubmitted,
}: OrderReviewModalProps) {
  const [storeRating, setStoreRating] = useState(5);
  const [storeComment, setStoreComment] = useState('');
  const [itemRatings, setItemRatings] = useState<Record<string, number>>({});
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [deliveryComment, setDeliveryComment] = useState('');

  const createReview = useCreateReview();

  // Initialize item ratings
  useEffect(() => {
    if (items.length > 0) {
      const initialRatings: Record<string, number> = {};
      items.forEach((item) => {
        initialRatings[item.id] = 5;
      });
      setItemRatings(initialRatings);
    }
  }, [items]);

  const handleSubmit = async () => {
    try {
      const reviewData: CreateReviewData = {
        orderId,
        storeRating,
        storeComment: storeComment.trim() || undefined,
        itemRatings: items.length > 0
          ? items.map((item) => ({
              menuItemId: item.id,
              itemName: item.name,
              rating: itemRatings[item.id] || 5,
            }))
          : undefined,
        deliveryRating: deliveryRating > 0 ? deliveryRating : undefined,
        deliveryComment: deliveryComment.trim() || undefined,
      };

      await createReview.mutateAsync(reviewData);
      toast.success('Thank you for your review!');
      
      // Reset form
      setStoreRating(5);
      setStoreComment('');
      setDeliveryRating(5);
      setDeliveryComment('');
      const resetItemRatings: Record<string, number> = {};
      items.forEach((item) => {
        resetItemRatings[item.id] = 5;
      });
      setItemRatings(resetItemRatings);

      onOpenChange(false);
      onReviewSubmitted?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rate Your Order</DialogTitle>
          <DialogDescription>
            Share your experience with {storeName || 'this store'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Store Rating */}
          <div>
            <Label className="text-base font-semibold">Store Rating *</Label>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStoreRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= storeRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {storeRating} / 5
              </span>
            </div>
          </div>

          {/* Store Comment */}
          <div>
            <Label htmlFor="storeComment">Store Review (Optional)</Label>
            <Textarea
              id="storeComment"
              value={storeComment}
              onChange={(e) => setStoreComment(e.target.value)}
              placeholder="Share your experience with the store..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Item Ratings */}
          {items.length > 0 && (
            <div>
              <Label className="text-base font-semibold">Item Ratings (Optional)</Label>
              <div className="space-y-4 mt-2">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{item.name}</span>
                      <span className="text-xs text-gray-600">
                        {itemRatings[item.id] || 5} / 5
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setItemRatings({ ...itemRatings, [item.id]: star })
                          }
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= (itemRatings[item.id] || 5)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Rating */}
          <div>
            <Label className="text-base font-semibold">Delivery Rating (Optional)</Label>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setDeliveryRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= deliveryRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {deliveryRating} / 5
              </span>
            </div>
          </div>

          {/* Delivery Comment */}
          <div>
            <Label htmlFor="deliveryComment">Delivery Review (Optional)</Label>
            <Textarea
              id="deliveryComment"
              value={deliveryComment}
              onChange={(e) => setDeliveryComment(e.target.value)}
              placeholder="Share your experience with the delivery..."
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createReview.isPending}
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createReview.isPending || storeRating === 0}
            >
              {createReview.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

