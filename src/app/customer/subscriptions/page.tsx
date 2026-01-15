"use client";

import React from 'react';
import { useMySubscriptions } from '@/hooks/api/use-homemade-food';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Utensils, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function MySubscriptionsPage() {
    const { data: subscriptionsData, isLoading } = useMySubscriptions();
    const router = useRouter();
    const subscriptions = subscriptionsData?.data || [];

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 max-w-4xl space-y-4">
                <h1 className="text-2xl font-bold mb-6">My Subscriptions</h1>
                {[1, 2].map((i) => (
                    <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl min-h-screen pb-20">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Subscriptions</h1>
                <Button onClick={() => router.push('/homemade')} variant="outline">
                    Browse Plans
                </Button>
            </div>

            {subscriptions.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">No Active Subscriptions</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Enjoy daily homemade meals delivered to your doorstep. Subscribe to a plan today!
                    </p>
                    <Button
                        onClick={() => router.push('/homemade')}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                        View Plans
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {subscriptions.map((sub: any) => (
                        <Card key={sub._id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div className={`h-2 w-full ${sub.status === 'active' ? 'bg-green-500' :
                                sub.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'
                                }`} />
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold text-gray-800">
                                                {sub.planName || 'Homemade Meal Subscription'}
                                            </h3>
                                            <Badge variant={sub.status === 'active' ? 'default' : 'secondary'} className={`
                                                ${sub.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                                                ${sub.status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''}
                                                capitalize
                                            `}>
                                                {sub.status}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-500 text-sm">ID: {sub._id.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-orange-600">₹{sub.price}</p>
                                        <p className="text-sm text-gray-500">for {sub.duration} days</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <Utensils className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Details</p>
                                            <p className="font-medium text-gray-700 capitalize">
                                                {sub.planType} Plan • {sub.quantity} Tiffin(s)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <CalendarDays className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Duration</p>
                                            <p className="font-medium text-gray-700">
                                                {format(new Date(sub.startDate), 'MMM dd')} - {format(new Date(sub.endDate), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 text-sm text-gray-600 bg-white border border-gray-100 p-3 rounded-lg">
                                    <div className="mt-0.5 min-w-[16px]">
                                        {sub.status === 'active' ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                                        )}
                                    </div>
                                    <p>
                                        {sub.status === 'active'
                                            ? "Your subscription is active. Meals will be delivered according to your plan timing."
                                            : "Your subscription request is currently pending approval from the kitchen."}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
