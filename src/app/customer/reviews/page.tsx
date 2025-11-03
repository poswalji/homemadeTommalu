'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMyReviews, useCreateReview, useUpdateReview } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Star, StarOff, MessageSquare, Edit, Plus,
  Store, Package
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export default function CustomerReviewsPage() {
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({
    orderId: '',
    storeId: '',
    storeRating: 5,
    itemRatings: [] as Array<{ itemId: string; rating: number; comment?: string }>,
    comment: '',
  });
  const [editForm, setEditForm] = useState({
    storeRating: 5,
    itemRatings: [] as Array<{ itemId: string; rating: number; comment?: string }>,
    comment: '',
  });

  const { data: reviewsData, isLoading } = useMyReviews();
  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();

  const reviews = reviewsData?.data || [];

  const handleCreateReview = async () => {
    try {
      await createMutation.mutateAsync({
        orderId: reviewForm.orderId,
        storeRating: reviewForm.storeRating,
        storeComment: reviewForm.comment,
        itemRatings: reviewForm.itemRatings.map(item => ({
          menuItemId: item.itemId,
          itemName: '', // Will be populated by backend
          rating: item.rating,
          comment: item.comment,
        })),
      });
      toast.success('Review submitted successfully');
      setReviewDialogOpen(false);
      setReviewForm({
        orderId: '',
        storeId: '',
        storeRating: 5,
        itemRatings: [],
        comment: '',
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleUpdateReview = async () => {
    if (!selectedReview) return;
    
    try {
      await updateMutation.mutateAsync({
        id: selectedReview.id,
        data: {
          storeRating: editForm.storeRating,
          storeComment: editForm.comment,
          itemRatings: editForm.itemRatings.map(item => ({
            menuItemId: item.itemId,
            itemName: '', // Will be populated by backend
            rating: item.rating,
            comment: item.comment,
          })),
        },
      });
      toast.success('Review updated successfully');
      setEditDialogOpen(false);
      setSelectedReview(null);
      setEditForm({ storeRating: 5, itemRatings: [], comment: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update review');
    }
  };


  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600 mt-2 text-sm">View and manage your reviews</p>
        </div>
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Write Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  value={reviewForm.orderId}
                  onChange={(e) => setReviewForm({ ...reviewForm, orderId: e.target.value })}
                  placeholder="Enter order ID"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="storeId">Store ID</Label>
                <Input
                  id="storeId"
                  value={reviewForm.storeId}
                  onChange={(e) => setReviewForm({ ...reviewForm, storeId: e.target.value })}
                  placeholder="Enter store ID"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Store Rating</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, storeRating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewForm.storeRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {reviewForm.storeRating} / 5
                  </span>
                </div>
              </div>
              <div>
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateReview}
                  disabled={createMutation.isPending || !reviewForm.orderId || !reviewForm.storeId}
                >
                  {createMutation.isPending ? (
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
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Your Reviews ({reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-semibold text-base sm:text-lg">
                              {review.storeId?.storeName || 'Store'}
                            </h3>
                            <Badge variant={review.status === 'active' ? 'default' : 'secondary'}>
                              {review.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            {renderStars(review.storeRating)}
                            <span className="text-sm text-gray-600">
                              {review.storeRating} / 5
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span>
                              Order: #{review.orderId?.slice(-8) || 'N/A'}
                            </span>
                            <span>•</span>
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            {review.storeResponse && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600">Store responded</span>
                              </>
                            )}
                          </div>
                          {review.storeResponse && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs font-medium text-blue-800 mb-1">Store Response:</p>
                              <p className="text-sm text-blue-700">{review.storeResponse}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Dialog open={editDialogOpen && selectedReview?.id === review.id} onOpenChange={(open) => {
                        setEditDialogOpen(open);
                        if (open) {
                          setSelectedReview(review);
                          setEditForm({
                            storeRating: review.storeRating,
                            itemRatings: review.itemRatings || [],
                            comment: review.comment || '',
                          });
                        } else {
                          setSelectedReview(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedReview(review)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Review</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div>
                              <Label>Store Rating</Label>
                              <div className="flex items-center gap-2 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setEditForm({ ...editForm, storeRating: star })}
                                    className="focus:outline-none"
                                  >
                                    <Star
                                      className={`w-6 h-6 ${
                                        star <= editForm.storeRating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                                <span className="ml-2 text-sm text-gray-600">
                                  {editForm.storeRating} / 5
                                </span>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="editComment">Comment</Label>
                              <Textarea
                                id="editComment"
                                value={editForm.comment}
                                onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                                placeholder="Update your review..."
                                className="mt-1"
                                rows={4}
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={handleUpdateReview}
                                disabled={updateMutation.isPending}
                              >
                                {updateMutation.isPending ? (
                                  <>
                                    <Spinner size="sm" className="mr-2" />
                                    Updating...
                                  </>
                                ) : (
                                  'Update Review'
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No reviews yet</p>
              <p className="text-xs text-gray-400 mt-1">Write your first review after placing an order</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

