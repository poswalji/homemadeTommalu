"use client";

import { useEffect, useState } from "react";
import { subscriptionApi } from "@/services/api/subscription.api";
import { EditSubscriptionPeriodModal } from "@/components/admin/subscription/EditSubscriptionPeriodModal";
import { EditSubscriptionPriceModal } from "@/components/admin/subscription/EditSubscriptionPriceModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, Calendar, DollarSign, RefreshCw, AlertCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { toast } from "sonner";

interface Subscription {
    _id: string;
    customerName: string;
    mobileNumber: string;
    planName: string;
    planType: string;
    startDate: string;
    endDate: string;
    price: number;
    status: string;
    duration: number;
}

export function ActiveSubscriptions() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modals
    const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const res = await subscriptionApi.getAllActiveSubscriptions();
            setSubscriptions(res.data);
            setError(null);
        } catch (err: any) {
            console.error("Fetch error:", err);
            // Enhanced error logging
            const errorMessage = err.response?.data?.message || err.message || JSON.stringify(err);
            setError(`Failed to fetch subscriptions: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const handleEditPeriod = (sub: Subscription) => {
        setSelectedSubscription(sub);
        setIsPeriodModalOpen(true);
    };

    const handleEditPrice = (sub: Subscription) => {
        setSelectedSubscription(sub);
        setIsPriceModalOpen(true);
    };

    const savePeriod = async (startDate: string, endDate: string) => {
        if (!selectedSubscription) return;
        try {
            await subscriptionApi.updatePeriod(selectedSubscription._id, startDate, endDate);
            toast.success("Success", {
                description: "Subscription validity updated successfully.",
            });
            fetchSubscriptions();
        } catch (err: any) {
            console.error("Update Period Error:", err);
            toast.error("Error", {
                description: err.response?.data?.message || err.message || "Failed to update period"
            });
        }
    };

    const savePrice = async (newPrice: number) => {
        if (!selectedSubscription) return;
        try {
            await subscriptionApi.updatePrice(selectedSubscription._id, newPrice);
            toast.success("Success", {
                description: "Subscription price updated successfully.",
            });
            fetchSubscriptions();
        } catch (err: any) {
            console.error("Update Price Error:", err);
            toast.error("Error", {
                description: err.response?.data?.message || err.message || "Failed to update price"
            });
        }
    };

    if (loading && subscriptions.length === 0) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <h2 className="text-xl font-semibold">Active Subscriptions List</h2>
                <Button variant="outline" onClick={fetchSubscriptions} disabled={loading} size="sm">
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <Alert variant="error" title="Error">
                    {error}
                </Alert>
            )}

            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Validity</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subscriptions.map((sub) => (
                                    <TableRow key={sub._id}>
                                        <TableCell className="font-medium">{sub.customerName}</TableCell>
                                        <TableCell>{sub.mobileNumber}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{sub.planName}</span>
                                                <span className="text-xs text-muted-foreground capitalize">{sub.planType}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{sub.duration} days</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span className="text-green-600">Start: {format(new Date(sub.startDate), "dd MMM yyyy")}</span>
                                                <span className="text-red-600">End: {format(new Date(sub.endDate), "dd MMM yyyy")}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>₹{sub.price}</TableCell>
                                        <TableCell>
                                            <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                                                {sub.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleEditPeriod(sub)}>
                                                    <Calendar className="h-4 w-4 mr-1" /> Period
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleEditPrice(sub)}>
                                                    <DollarSign className="h-4 w-4 mr-1" /> Price
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {subscriptions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            No active subscriptions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {selectedSubscription && (
                <>
                    <EditSubscriptionPeriodModal
                        isOpen={isPeriodModalOpen}
                        onClose={() => setIsPeriodModalOpen(false)}
                        onSave={savePeriod}
                        currentStartDate={selectedSubscription.startDate}
                        currentEndDate={selectedSubscription.endDate}
                    />
                    <EditSubscriptionPriceModal
                        isOpen={isPriceModalOpen}
                        onClose={() => setIsPriceModalOpen(false)}
                        onSave={savePrice}
                        currentPrice={selectedSubscription.price}
                    />
                </>
            )}
        </div>
    );
}
