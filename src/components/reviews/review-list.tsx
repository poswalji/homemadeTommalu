"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Utensils } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewListProps {
    reviews: any[];
}

export function ReviewList({ reviews }: ReviewListProps) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <h3 className="text-gray-900 font-medium">No reviews yet</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Reviews you write will appear here
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <Card key={review._id} className="overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">
                                    {review.storeName || 'Store Review'}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${star <= review.rating
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        • {format(new Date(review.createdAt), 'MMM d, yyyy')}
                                    </span>
                                </div>
                            </div>
                            <Badge variant="outline" className={
                                review.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }>
                                {review.status || 'Published'}
                            </Badge>
                        </div>

                        {review.type === 'food' && (
                            <div className="flex items-center gap-2 mb-3 bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs w-fit">
                                <Utensils className="w-3 h-3" />
                                <span>Food Item Review</span>
                            </div>
                        )}

                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            {review.comment}
                        </p>

                        {review.reply && (
                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-sm mt-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900">Store Response</span>
                                    <span className="text-xs text-gray-500">
                                        • {format(new Date(review.replyAt || Date.now()), 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <p className="text-gray-600">{review.reply}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
