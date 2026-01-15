import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, Loader2 } from 'lucide-react';
import { useAdminSubscriptions, useUpdateSubscriptionStatus } from '@/hooks/api/use-homemade-food';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function SubscriberRequests() {
    const { data: ordersData, isLoading, refetch } = useAdminSubscriptions({
        status: 'pending',
        page: 1,
        limit: 50
    });

    const updateStatus = useUpdateSubscriptionStatus();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleAction = async (id: string, status: 'confirmed' | 'cancelled') => {
        try {
            setProcessingId(id);
            // Map 'confirmed' to 'active' for subscriptions
            const backendStatus = status === 'confirmed' ? 'active' : 'cancelled';
            await updateStatus.mutateAsync({ id, data: { status: backendStatus } });
            toast.success(`Request ${status === 'confirmed' ? 'Accepted' : 'Rejected'}`);
            refetch();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setProcessingId(null);
        }
    };

    const pendingRequests = ordersData?.data || [];

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Pending Subscription Requests
                    {pendingRequests.length > 0 && (
                        <Badge className="bg-orange-100 text-orange-700">{pendingRequests.length}</Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => <div key={i} className="h-24 bg-gray-50 rounded-lg animate-pulse" />)}
                    </div>
                ) : pendingRequests.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed text-gray-400">
                        No pending subscription requests
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingRequests.map((req: any) => (
                            <div key={req._id} className="bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center shadow-sm">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-800">{req.planName || req.foodName || 'Subscription Plan'}</h3>
                                        <Badge variant="outline" className="text-xs">SUB-{req._id.slice(-6).toUpperCase()}</Badge>
                                    </div>
                                    <div className="text-sm text-gray-500 space-y-1">
                                        <p><span className="font-medium">Customer:</span> {req.customerName} ({req.mobileNumber})</p>
                                        <p><span className="font-medium">Address:</span> {req.deliveryAddress?.street}</p>
                                        <p><span className="font-medium">Date:</span> {format(new Date(req.createdAt), 'PPp')}</p>
                                        <p><span className="font-medium text-green-600">Amount:</span> ₹{req.price || req.finalAmount}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button
                                        onClick={() => handleAction(req._id, 'confirmed')}
                                        className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white"
                                        disabled={processingId === req._id}
                                    >
                                        {processingId === req._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                        Accept
                                    </Button>
                                    <Button
                                        onClick={() => handleAction(req._id, 'cancelled')}
                                        variant="outline"
                                        className="flex-1 md:flex-none text-red-600 hover:bg-red-50 border-red-200"
                                        disabled={processingId === req._id}
                                    >
                                        {processingId === req._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
