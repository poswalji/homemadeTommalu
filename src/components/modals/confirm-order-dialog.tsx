
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersKeys } from "@/config/query.config";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthMe } from "@/hooks/api";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, Phone, Loader2, User, Navigation, CheckCircle2 } from "lucide-react";
import { placeHomemadeOrder, purchaseSubscriptionPlan, submitSubscription } from "@/services/homemadeService";
import { promotionsApi } from "@/services/api/promotions.api";
import { useRouter } from "next/navigation";

interface ConfirmOrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    orderDetails: {
        date: string;
        slot: string;
        quantity: number;
        totalPrice: number;
        items: string[];
        isSubscription?: boolean;
        planName?: string;
        planId?: string;
    };
}

const AREAS = ["Nims", "Achrol", "Talamod"];

export function ConfirmOrderDialog({ isOpen, onClose, orderDetails }: ConfirmOrderDialogProps) {
    const router = useRouter();
    const { data: authData } = useAuthMe();
    const user = authData?.user;

    const queryClient = useQueryClient();

    const placeOrderMutation = useMutation({
        mutationFn: placeHomemadeOrder,
        onSuccess: (res: any) => {
            if (res?.success) {
                toast.success("Order placed successfully!");
                queryClient.invalidateQueries({ queryKey: ordersKeys.my() });
                onClose();
                router.push("/customer/orders");
            } else {
                toast.error(res?.message || "Failed to place order");
            }
        },
        onError: (error: any) => {
            console.error("Order failed", error);
            const msg = error.response?.data?.message || "Failed to place order";
            toast.error(msg);
        }
    });

    const submitSubscriptionMutation = useMutation({
        mutationFn: submitSubscription,
        onSuccess: (res: any) => {
            if (res?.success) {
                toast.success("Subscription request sent successfully!");
                queryClient.invalidateQueries({ queryKey: ['homemade-food', 'subscriptions', 'my'] });
                onClose();
                router.push("/customer/orders");
            } else {
                toast.error(res?.message || "Failed to submit subscription");
            }
        },
        onError: (error: any) => {
            console.error("Subscription failed", error);
            const msg = error.response?.data?.message || "Failed to place order";
            toast.error(msg);
        }
    });

    const isSubmitting = placeOrderMutation.isPending || submitSubscriptionMutation.isPending;
    const [name, setName] = useState(user?.name || "");
    const [address, setAddress] = useState(user?.addresses?.[0]?.street || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [area, setArea] = useState("");
    const [locationLink, setLocationLink] = useState("");
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    // Coupon Code State
    const [couponCode, setCouponCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsApplyingCoupon(true);
        try {
            const res = await promotionsApi.validatePromotion({
                code: couponCode,
                orderAmount: orderDetails.totalPrice
            });
            if (res.valid && res.data) {
                setAppliedDiscount(res.data.discount);
                toast.success(`Coupon applied! You saved ₹${res.data.discount}`);
            } else {
                setAppliedDiscount(0);
                toast.error(res.reason || "Invalid coupon code");
            }
        } catch (err: any) {
            setAppliedDiscount(0);
            const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || "Failed to validate coupon";
            toast.error(errorMsg);
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }
        
        setIsDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;
                setLocationLink(mapLink);
                setIsDetectingLocation(false);
                toast.success("Location detected successfully!");
            },
            (error) => {
                setIsDetectingLocation(false);
                toast.error("Failed to detect location. Please enable location services.");
                console.error("Location error:", error);
            },
            { enableHighAccuracy: true }
        );
    };

    const handleConfirm = async () => {
        if (!name || !address || !phone || !area) {
            toast.error("Please fill in all delivery details");
            return;
        }

        if (orderDetails.isSubscription) {
            const payload = {
                planId: orderDetails.planId,
                customerName: name,
                mobileNumber: phone,
                deliveryAddress: {
                    street: address,
                    city: 'Jaipur',
                    pincode: '303002'
                },
                startDate: new Date().toISOString(), // Default to today/tomorrow
                quantity: orderDetails.quantity,
            };
            submitSubscriptionMutation.mutate(payload);
        } else {
            const payload = {
                customerName: name,
                mobileNumber: phone,
                area: area,
                customAddress: address,
                quantity: orderDetails.quantity,
                slot: orderDetails.slot, // "Lunch" or "Dinner"
                items: orderDetails.items, // Array of strings e.g. ["Dal Bati", "Extra Roti x2"]
                totalPrice: orderDetails.totalPrice, // Full calculated price including extras
                locationLink: locationLink,
                promoCode: appliedDiscount > 0 ? couponCode : undefined
            };
            
            // Log payload for debugging
            console.log("Submitting order with payload:", payload);
            
            // Get token from cookieService to ensure it's passed if we were making a manual fetch
            // But placeOrderMutation uses apiClient which handles this automatically!
            placeOrderMutation.mutate(payload);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Confirm Your {orderDetails.isSubscription ? "Subscription" : "Order"}</DialogTitle>
                    <DialogDescription>
                        Please review your details before confirming.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    {/* Order Summary */}
                    <div className="bg-stone-50 p-4 rounded-lg space-y-2 text-sm border border-stone-100">
                        <div className="flex justify-between font-bold text-stone-800 text-base">
                            <span>{orderDetails.isSubscription ? orderDetails.planName : "Homemade Thali"} x {orderDetails.quantity}</span>
                            <span>₹{orderDetails.totalPrice}</span>
                        </div>
                        {!orderDetails.isSubscription && (
                            <div className="flex flex-wrap gap-4 pt-1">
                                <div className="flex items-center gap-1.5 text-stone-600 bg-white px-2 py-1 rounded border border-stone-200">
                                    <Calendar className="w-3.5 h-3.5" /> {orderDetails.date}
                                </div>
                                <div className="flex items-center gap-1.5 text-stone-600 bg-white px-2 py-1 rounded border border-stone-200">
                                    <Clock className="w-3.5 h-3.5" /> 
                                    <span>
                                        {orderDetails.slot} 
                                        <span className="text-xs text-stone-400 font-normal ml-1">
                                            ({orderDetails.slot === 'Lunch' ? '12:30-2:00 PM' : '8:00-9:00 PM'})
                                        </span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Coupon Code Section */}
                    {!orderDetails.isSubscription && (
                        <div className="flex gap-2">
                            <Input 
                                placeholder="Have a Coupon Code?" 
                                value={couponCode} 
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                disabled={appliedDiscount > 0}
                                className="uppercase font-semibold tracking-wide"
                            />
                            {appliedDiscount > 0 ? (
                                <Button variant="destructive" onClick={() => { setCouponCode(""); setAppliedDiscount(0); }}>
                                    Remove
                                </Button>
                            ) : (
                                <Button 
                                    variant="outline" 
                                    className="border-orange-200 text-orange-700 hover:bg-orange-50 shrink-0"
                                    onClick={handleApplyCoupon}
                                    disabled={!couponCode || isApplyingCoupon}
                                >
                                    {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                                </Button>
                            )}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-9"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="pl-9"
                                        placeholder="Enter phone"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="area">Area / Campus</Label>
                            <Select value={area} onValueChange={setArea}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Area" />
                                </SelectTrigger>
                                <SelectContent>
                                    {AREAS.map((a) => (
                                        <SelectItem key={a} value={a}>{a}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Full Address / Hostel Room</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <Textarea
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="pl-9 min-h-[80px]"
                                    placeholder="Room No, Hostel Name, or Street Address"
                                />
                            </div>
                            
                            <div className="pt-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    className={`w-full flex items-center justify-center gap-2 ${locationLink ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100' : 'border-orange-200 text-orange-700 hover:bg-orange-50'}`}
                                    onClick={handleDetectLocation}
                                    disabled={isDetectingLocation}
                                >
                                    {isDetectingLocation ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Detecting...</>
                                    ) : locationLink ? (
                                        <><CheckCircle2 className="w-4 h-4" /> Location Shared Successfully</>
                                    ) : (
                                        <><Navigation className="w-4 h-4" /> Detect My Current Location</>
                                    )}
                                </Button>
                                {!locationLink && (
                                    <p className="text-xs text-stone-500 mt-1.5 text-center">
                                        Please share your location to help the delivery boy reach you faster.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Final Price Breakdown */}
                    {!orderDetails.isSubscription && appliedDiscount > 0 && (
                        <div className="bg-green-50/50 p-3 rounded-lg border border-green-100 flex justify-between items-center text-sm mt-2">
                            <span className="font-medium text-green-800">Coupon Discount</span>
                            <span className="font-bold text-green-600">-₹{appliedDiscount}</span>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleConfirm} className="bg-orange-600 hover:bg-orange-700 text-white" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                            </>
                        ) : (
                            orderDetails.isSubscription ? "Subscribe Now" : `Place Order (₹${orderDetails.totalPrice - appliedDiscount})`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
