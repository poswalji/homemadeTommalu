"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersKeys } from "@/config/query.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthMe } from "@/hooks/api";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, Phone, Loader2, User, Navigation, CheckCircle2, Coins, ArrowLeft } from "lucide-react";
import { placeHomemadeOrder, submitSubscription } from "@/services/homemadeService";
import { promotionsApi } from "@/services/api/promotions.api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AREAS = ["Nims", "Achrol", "Talamod"];

export default function CheckoutPage() {
    const router = useRouter();
    const { data: authData } = useAuthMe();
    const user = authData?.user;

    const queryClient = useQueryClient();

    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedOrder = sessionStorage.getItem("checkoutOrderDetails");
        if (storedOrder) {
            try {
                setOrderDetails(JSON.parse(storedOrder));
            } catch (e) {
                console.error("Failed to parse order details from session storage");
                router.push("/");
            }
        } else {
            router.push("/");
        }
        setIsLoading(false);
    }, [router]);

    const placeOrderMutation = useMutation({
        mutationFn: placeHomemadeOrder,
        onSuccess: (res: any) => {
            if (res?.success) {
                toast.success("Order placed successfully!");
                queryClient.invalidateQueries({ queryKey: ordersKeys.my() });
                sessionStorage.removeItem("checkoutOrderDetails");
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
                sessionStorage.removeItem("checkoutOrderDetails");
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

    // Form States
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [area, setArea] = useState("");
    const [locationLink, setLocationLink] = useState("");
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState<string>("new");

    // Initialize state when user data loads
    useEffect(() => {
        if (user) {
            setName(prev => prev || user.name || "");
            setPhone(prev => prev || user.phone || "");
            
            if (user.addresses && user.addresses.length > 0 && selectedAddressIndex === "new" && !address) {
                // Auto-select first address if exists
                setSelectedAddressIndex("0");
                setAddress(user.addresses[0].street);
            }
        }
    }, [user, address, selectedAddressIndex]);

    // Token State
    const [useTokens, setUseTokens] = useState(false);
    const availableTokens = user?.tokens ?? 200;

    // Coupon Code State
    const [couponCode, setCouponCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    if (isLoading || !orderDetails) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

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
        if (!name || !address || !phone || (!area && selectedAddressIndex === "new")) {
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
                area: selectedAddressIndex !== "new" ? "Home" : area, // Fallback for saved addresses without explicit area
                customAddress: address,
                quantity: orderDetails.quantity,
                slot: orderDetails.slot, // "Lunch" or "Dinner"
                items: orderDetails.items, // Array of strings e.g. ["Dal Bati", "Extra Roti x2"]
                totalPrice: orderDetails.totalPrice, // Full calculated price including extras
                locationLink: locationLink,
                promoCode: appliedDiscount > 0 ? couponCode : undefined,
                useTokens: useTokens
            };
            
            placeOrderMutation.mutate(payload);
        }
    };

    return (
        <div className="container max-w-3xl py-8">
            <Link href="/" className="inline-flex items-center text-stone-600 hover:text-stone-900 mb-6 font-medium transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Menu
            </Link>

            <h1 className="text-3xl font-black text-stone-900 mb-6">
                Checkout {orderDetails.isSubscription ? "Subscription" : "Order"}
            </h1>

            <div className="grid gap-6 md:grid-cols-[1fr_350px]">
                {/* Left Column - Delivery Details */}
                <div className="space-y-6">
                    <Card className="border-stone-200 shadow-sm">
                        <CardHeader className="bg-stone-50 border-b border-stone-100 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-orange-600" />
                                Delivery Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
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
                                <Label>Select Address</Label>
                                {user?.addresses && user.addresses.length > 0 && (
                                    <Select 
                                        value={selectedAddressIndex} 
                                        onValueChange={(val) => {
                                            setSelectedAddressIndex(val);
                                            if (val !== "new") {
                                                const addr = user.addresses![parseInt(val)];
                                                setAddress(addr.street);
                                            } else {
                                                setAddress("");
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a saved address..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new" className="text-orange-600 font-medium">+ Enter New Address</SelectItem>
                                            {user.addresses.map((addr, idx) => (
                                                <SelectItem key={idx} value={idx.toString()}>
                                                    {addr.label ? `${addr.label}: ` : ''}{addr.street.substring(0, 30)}...
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {selectedAddressIndex === "new" && (
                                    <div className="space-y-2 mt-4 p-4 bg-orange-50/50 rounded-lg border border-orange-100">
                                        <Label htmlFor="area">Area / Campus <span className="text-orange-500">*</span></Label>
                                        <Select value={area} onValueChange={setArea}>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Select Area" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {AREAS.map((a) => (
                                                    <SelectItem key={a} value={a}>{a}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-stone-500 mt-1">This address will be automatically saved to your profile for future orders.</p>
                                    </div>
                                )}

                                <Label htmlFor="address" className="mt-4 block">Full Address / Hostel Room</Label>
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
                                            <><Navigation className="w-4 h-4" /> Detect My Current Location (Optional)</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Order Summary & Payment */}
                <div className="space-y-6">
                    <Card className="border-stone-200 shadow-sm sticky top-24">
                        <CardHeader className="bg-stone-50 border-b border-stone-100 pb-4">
                            <CardTitle className="text-lg">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="bg-white p-4 rounded-lg space-y-3 text-sm border border-stone-100 shadow-sm">
                                <div className="flex justify-between font-bold text-stone-800 text-base border-b border-stone-100 pb-3">
                                    <span>{orderDetails.isSubscription ? orderDetails.planName : "Homemade Thali"} x {orderDetails.quantity}</span>
                                    <span>₹{orderDetails.totalPrice}</span>
                                </div>
                                
                                {!orderDetails.isSubscription && (
                                    <>
                                        <div className="flex items-center justify-between text-stone-600 pt-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-orange-500" /> 
                                                <span>Date</span>
                                            </div>
                                            <span className="font-medium">{orderDetails.date}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-stone-600">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-orange-500" /> 
                                                <span>Time Slot</span>
                                            </div>
                                            <span className="font-medium bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                                                {orderDetails.slot}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Coupon Code Section */}
                            {!orderDetails.isSubscription && (
                                <div className="flex gap-2 pt-2">
                                    <Input 
                                        placeholder="Coupon Code" 
                                        value={couponCode} 
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        disabled={appliedDiscount > 0 || useTokens}
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
                            
                            {!orderDetails.isSubscription && useTokens && (
                                <p className="text-[10px] text-orange-600 font-medium px-1 mt-1 flex items-center gap-1">
                                    Coupons cannot be used with tokens.
                                </p>
                            )}
                            
                            {/* Final Price Breakdown */}
                            {!orderDetails.isSubscription && (
                                <div className="space-y-3 pt-2">
                                    {appliedDiscount > 0 && (
                                        <div className="bg-green-50/50 p-3 rounded-lg border border-green-100 flex justify-between items-center text-sm">
                                            <span className="font-medium text-green-800">Coupon Discount</span>
                                            <span className="font-bold text-green-600">-₹{appliedDiscount}</span>
                                        </div>
                                    )}

                                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 flex items-center justify-between text-sm shadow-sm transition-all hover:shadow-md">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-white p-1.5 rounded-full shadow-sm text-orange-500">
                                                <Coins className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-orange-900">Tommalu Tokens</p>
                                                <p className="text-xs font-medium text-orange-600/80">Bal: {availableTokens} (₹{(availableTokens / 10).toFixed(2)})</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {useTokens && availableTokens > 0 && (
                                                <span className="font-black text-orange-600 text-base tracking-tight">
                                                    -₹{Math.min(availableTokens / 10, orderDetails.totalPrice - appliedDiscount).toFixed(2)}
                                                </span>
                                            )}
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 text-orange-600 rounded border-orange-300 focus:ring-orange-500 shadow-sm cursor-pointer disabled:opacity-50" 
                                                checked={useTokens} 
                                                onChange={(e) => setUseTokens(e.target.checked)}
                                                disabled={availableTokens <= 0 || appliedDiscount > 0}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {!orderDetails.isSubscription && appliedDiscount > 0 && (
                                <p className="text-[10px] text-orange-600 font-medium px-1 mt-1 flex items-center gap-1">
                                    Tokens cannot be used with coupons.
                                </p>
                            )}

                            <div className="border-t border-stone-100 pt-4 mt-2">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-stone-600 font-medium">To Pay</span>
                                    <span className="text-2xl font-black text-stone-900">
                                        ₹{(orderDetails.totalPrice - appliedDiscount - (useTokens ? Math.min(availableTokens / 10, orderDetails.totalPrice - appliedDiscount) : 0)).toFixed(2)}
                                    </span>
                                </div>

                                <Button 
                                    onClick={handleConfirm} 
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 py-6 text-lg font-bold" 
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                                    ) : (
                                        orderDetails.isSubscription ? "Subscribe Now" : "Confirm Order"
                                    )}
                                </Button>
                                <p className="text-center text-xs text-stone-500 mt-3 font-medium">
                                    Cash on Delivery Only. You will earn 10 Tokens on this order!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
