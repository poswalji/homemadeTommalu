"use client";

import React, { useEffect, useState } from "react";
import { subscriptionApi } from "@/services/api/subscription.api";
import { EditSubscriptionPeriodModal } from "@/components/admin/subscription/EditSubscriptionPeriodModal";
import { EditSubscriptionPriceModal } from "@/components/admin/subscription/EditSubscriptionPriceModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, Calendar, DollarSign, RefreshCw, AlertCircle, Search, Filter, MoreVertical, Phone, CheckCircle, XCircle, MapPin } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Subscription {
    _id: string;
    customerName: string;
    mobileNumber: string;
    deliveryAddress?: {
        street: string;
        landmark?: string;
        city: string;
        pincode: string;
    };
    planName: string;
    planType: string;
    startDate: string;
    endDate: string;
    price: number;
    status: string;
    duration: number;
    pausedDaysUsed?: number;
    pauseRequests?: Array<{ _id: string; date: string; status: string; reason: string }>;
}

export function ActiveSubscriptions() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

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

    const handleApprovePause = async (subId: string, reqId: string) => {
        try {
            await subscriptionApi.approvePauseRequest(subId, reqId);
            toast.success("Pause request approved. Plan extended by 1 day.");
            fetchSubscriptions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to approve pause request");
        }
    };

    const handleRejectPause = async (subId: string, reqId: string) => {
        try {
            await subscriptionApi.rejectPauseRequest(subId, reqId);
            toast.success("Pause request rejected");
            fetchSubscriptions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reject pause request");
        }
    };

    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch = sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              sub.mobileNumber.includes(searchTerm);
        const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading && subscriptions.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
                <p>Loading active subscriptions...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Active Subscriptions</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage and monitor all ongoing customer subscriptions.</p>
                </div>
                <Button onClick={fetchSubscriptions} disabled={loading} className="bg-orange-50 text-orange-600 hover:bg-orange-100 border-0">
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh List
                </Button>
            </div>

            {error && (
                <Alert variant="error" title="Error">
                    {error}
                </Alert>
            )}

            <Card className="border-0 shadow-sm overflow-hidden bg-white">
                <CardContent className="p-0">
                    {/* Filters & Search */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Search by customer name or phone..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 w-full bg-white border-gray-200 focus-visible:ring-orange-500 rounded-lg"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700"
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="paused">Paused</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Table View (Desktop) */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="hover:bg-transparent border-gray-100">
                                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider h-11">Customer</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider h-11">Plan Details</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider h-11">Duration & Validity</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider h-11">Status</TableHead>
                                    <TableHead className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider h-11">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubscriptions.map((sub) => (
                                    <React.Fragment key={sub._id}>
                                        <TableRow className="group hover:bg-gray-50/50 transition-colors border-gray-100">
                                            <TableCell className="py-4 align-top">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-orange-100 flex flex-shrink-0 items-center justify-center text-orange-600 font-bold">
                                                        {sub.customerName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-gray-900 truncate">{sub.customerName}</div>
                                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                                            <Phone className="w-3 h-3 mr-1 flex-shrink-0" /> {sub.mobileNumber}
                                                        </div>
                                                        {sub.deliveryAddress && (
                                                            <div className="flex items-start text-xs text-gray-500 mt-1 max-w-[200px]">
                                                                <MapPin className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" /> 
                                                                <span className="line-clamp-2" title={`${sub.deliveryAddress.street}, ${sub.deliveryAddress.landmark ? sub.deliveryAddress.landmark + ', ' : ''}${sub.deliveryAddress.city}`}>
                                                                    {sub.deliveryAddress.street}, {sub.deliveryAddress.landmark && `${sub.deliveryAddress.landmark}, `}{sub.deliveryAddress.city} - {sub.deliveryAddress.pincode}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 align-top">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{sub.planName}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-[10px] uppercase bg-gray-50 text-gray-600 border-gray-200">
                                                            {sub.planType}
                                                        </Badge>
                                                        <span className="text-xs text-gray-700 font-semibold bg-green-50 px-1.5 py-0.5 rounded text-green-700">₹{sub.price}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 align-top">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="text-sm font-semibold text-gray-900">{sub.duration} Days</div>
                                                    <div className="text-xs text-gray-500 flex flex-col gap-0.5">
                                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{format(new Date(sub.startDate), "dd MMM yyyy")}</span>
                                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>{format(new Date(sub.endDate), "dd MMM yyyy")}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 align-top">
                                                <div className="flex flex-col items-start gap-2">
                                                    <Badge className={
                                                        sub.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0' : 
                                                        sub.status === 'paused' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-0' :
                                                        sub.status === 'expired' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-0' :
                                                        'bg-gray-100 text-gray-700 hover:bg-gray-200 border-0'
                                                    }>
                                                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                                                    </Badge>
                                                    {sub.pauseRequests && sub.pauseRequests.some(pr => pr.status === 'pending') && (
                                                        <div className="flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 shadow-sm animate-pulse whitespace-nowrap">
                                                            <AlertCircle className="w-3 h-3 mr-1"/> Action Req.
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 align-top text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full border border-transparent hover:border-gray-200 transition-colors">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreVertical className="h-4 w-4 text-gray-500" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuLabel className="text-xs text-gray-500 uppercase">Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleEditPeriod(sub)} className="cursor-pointer text-gray-700 font-medium">
                                                            <Calendar className="mr-2 h-4 w-4 text-orange-500" /> Extend Plan
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditPrice(sub)} className="cursor-pointer text-gray-700 font-medium">
                                                            <DollarSign className="mr-2 h-4 w-4 text-emerald-500" /> Update Price
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                        
                                        {/* Pause Requests Expandable Section */}
                                        {sub.pauseRequests && sub.pauseRequests.some(pr => pr.status === 'pending') && (
                                            <TableRow className="bg-amber-50/40 hover:bg-amber-50/60 border-t-0">
                                                <TableCell colSpan={5} className="pt-0 pb-4 px-4 sm:px-6">
                                                    <div className="flex flex-col gap-3 p-4 bg-white border border-amber-100 rounded-xl shadow-sm mt-1">
                                                        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-amber-100 pb-2">
                                                            <AlertCircle className="w-4 h-4" /> Pending Pause Requests
                                                        </span>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {sub.pauseRequests.filter(pr => pr.status === 'pending').map(pr => (
                                                                <div key={pr._id} className="bg-amber-50/30 border border-amber-200/60 p-3 rounded-lg flex flex-col gap-3 hover:border-amber-300 transition-colors">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <div className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                                                                                <Calendar className="w-3.5 h-3.5 text-amber-600" /> {format(new Date(pr.date), "dd MMM yyyy")}
                                                                            </div>
                                                                            <div className="text-xs text-gray-600 mt-1" title={pr.reason}>
                                                                                <span className="font-medium text-gray-700">Reason:</span> {pr.reason || "Not provided"}
                                                                            </div>
                                                                        </div>
                                                                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-0 text-[10px] px-1.5 py-0.5">
                                                                            {sub.pausedDaysUsed || 0}/2 Used
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <Button size="sm" onClick={() => handleApprovePause(sub._id, pr._id)} className="h-8 flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-sm">
                                                                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                                                                        </Button>
                                                                        <Button size="sm" variant="outline" onClick={() => handleRejectPause(sub._id, pr._id)} className="h-8 flex-1 border-gray-200 text-gray-700 hover:bg-gray-100 font-medium text-xs">
                                                                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))}
                                {filteredSubscriptions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <Search className="h-8 w-8 mb-2 text-gray-300" />
                                                <p className="text-base font-medium text-gray-900">No subscriptions found</p>
                                                <p className="text-sm">Try adjusting your filters or search term</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Card View (Mobile) */}
                    <div className="md:hidden flex flex-col gap-4 p-4 bg-gray-50/30">
                        {filteredSubscriptions.map((sub) => (
                            <div key={sub._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                {/* Mobile Card Header */}
                                <div className="p-4 border-b border-gray-50 flex justify-between items-start gap-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex-shrink-0 flex items-center justify-center text-orange-600 font-bold">
                                            {sub.customerName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-semibold text-gray-900 truncate">{sub.customerName}</div>
                                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                <Phone className="w-3 h-3 mr-1 flex-shrink-0" /> {sub.mobileNumber}
                                            </div>
                                            {sub.deliveryAddress && (
                                                <div className="flex items-start text-xs text-gray-500 mt-1">
                                                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" /> 
                                                    <span className="line-clamp-2" title={`${sub.deliveryAddress.street}, ${sub.deliveryAddress.landmark ? sub.deliveryAddress.landmark + ', ' : ''}${sub.deliveryAddress.city}`}>
                                                        {sub.deliveryAddress.street}, {sub.deliveryAddress.landmark && `${sub.deliveryAddress.landmark}, `}{sub.deliveryAddress.city} - {sub.deliveryAddress.pincode}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <Badge className={
                                            sub.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0' : 
                                            sub.status === 'paused' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-0' :
                                            sub.status === 'expired' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-0' :
                                            'bg-gray-100 text-gray-700 hover:bg-gray-200 border-0'
                                        }>
                                            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditPeriod(sub)} className="cursor-pointer text-gray-700">
                                                    <Calendar className="mr-2 h-4 w-4 text-orange-500" /> Extend Plan
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEditPrice(sub)} className="cursor-pointer text-gray-700">
                                                    <DollarSign className="mr-2 h-4 w-4 text-emerald-500" /> Update Price
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                
                                {/* Mobile Card Body */}
                                <div className="p-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Plan</div>
                                        <div className="font-medium text-gray-900 text-sm">{sub.planName}</div>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                            <Badge variant="outline" className="text-[10px] uppercase bg-gray-50 text-gray-600 border-gray-200">{sub.planType}</Badge>
                                            <span className="text-xs text-gray-700 font-semibold bg-green-50 px-1.5 py-0.5 rounded text-green-700">₹{sub.price}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Validity ({sub.duration}d)</div>
                                        <div className="text-xs text-gray-700 flex flex-col gap-1.5 mt-1">
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{format(new Date(sub.startDate), "dd MMM")}</span>
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span>{format(new Date(sub.endDate), "dd MMM")}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Card Pause Requests */}
                                {sub.pauseRequests && sub.pauseRequests.some(pr => pr.status === 'pending') && (
                                    <div className="bg-amber-50/50 p-4 border-t border-amber-100 flex flex-col gap-3">
                                        <span className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1.5">
                                            <AlertCircle className="w-4 h-4" /> Pending Action (Pause)
                                        </span>
                                        {sub.pauseRequests.filter(pr => pr.status === 'pending').map(pr => (
                                            <div key={pr._id} className="bg-white border border-amber-200 p-3 rounded-lg flex flex-col gap-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-amber-600" /> {format(new Date(pr.date), "dd MMM yyyy")}
                                                        </div>
                                                        <div className="text-xs text-gray-600 mt-1">Reason: {pr.reason || "Not provided"}</div>
                                                    </div>
                                                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-0 text-[10px] px-1.5 py-0.5">
                                                        {sub.pausedDaysUsed || 0}/2 Used
                                                    </Badge>
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <Button size="sm" onClick={() => handleApprovePause(sub._id, pr._id)} className="h-8 flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs">
                                                        Approve
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => handleRejectPause(sub._id, pr._id)} className="h-8 flex-1 text-xs border-gray-200 font-medium">
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {filteredSubscriptions.length === 0 && (
                            <div className="p-8 text-center bg-white rounded-xl border border-gray-100">
                                <Search className="h-8 w-8 mb-2 text-gray-300 mx-auto" />
                                <p className="text-base font-medium text-gray-900">No subscriptions found</p>
                                <p className="text-sm text-gray-500">Try adjusting your filters</p>
                            </div>
                        )}
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
