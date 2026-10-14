"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersKeys } from "@/config/query.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthMe } from "@/hooks/api";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, Phone, Loader2, User, Navigation, CheckCircle2, Coins, ArrowLeft, Truck, CreditCard, Banknote, ShieldCheck } from "lucide-react";
import { placeHomemadeOrder, submitSubscription } from "@/services/homemadeService";
import { referralApi } from "@/services/api/referral.api";
import { promotionsApi } from "@/services/api/promotions.api";
import { paymentApi } from "@/services/api/payments.api";
import { loadRazorpayScript } from "@/utils/razorpay";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AREAS = ["Nims", "Achrol", "Talamod"];

export default function CheckoutPage() {
    const router = useRouter();
    const idempotencyKeyRef = useRef<string>("");

    useEffect(() => {
        idempotencyKeyRef.current = `order-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }, []);
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

    const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const isSubmitting = placeOrderMutation.isPending || submitSubscriptionMutation.isPending || isProcessingPayment;

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
    
    // Auto-fill referral code from local storage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedRefCode = localStorage.getItem('referralCode');
            if (savedRefCode && orderDetails?.isSubscription) {
                setCouponCode(savedRefCode);
            }
        }
    }, [orderDetails]);
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const isSubscription = Boolean(orderDetails?.isSubscription);
    // Base items total
    const itemsTotal = isSubscription
        ? Number(orderDetails?.totalPrice || 0)
        : Number(orderDetails?.itemsTotal || (orderDetails?.totalPrice && orderDetails?.deliveryCharge ? orderDetails.totalPrice - orderDetails.deliveryCharge : orderDetails?.totalPrice) || 0);

    // Dynamic Delivery Fee in IST:
    // Lunch after 1:00 PM (13:00) -> ₹30
    // Dinner after 9:00 PM (21:00) -> ₹30
    const deliveryCharge = useMemo(() => {
        if (isSubscription) return 0;
        if (orderDetails?.deliveryCharge !== undefined) return Number(orderDetails.deliveryCharge);
        const istDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const totalMinutes = istDate.getHours() * 60 + istDate.getMinutes();
        if (orderDetails?.slot === 'Lunch') {
            return totalMinutes >= 13 * 60 ? 30 : 0;
        } else if (orderDetails?.slot === 'Dinner') {
            return totalMinutes >= 21 * 60 ? 30 : 0;
        }
        return 0;
    }, [isSubscription, orderDetails]);

    const orderSubtotalWithDelivery = itemsTotal + deliveryCharge;
    const maxTokenDiscount = Math.max(0, orderSubtotalWithDelivery - appliedDiscount);
    const tokenDiscount = useTokens ? Math.min(availableTokens / 10, maxTokenDiscount) : 0;
    const finalAmountToPay = Math.max(0, orderSubtotalWithDelivery - appliedDiscount - tokenDiscount);

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
                orderAmount: itemsTotal
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

    const handleValidateReferral = async () => {
        if (!couponCode) return;
        setIsApplyingCoupon(true);
        try {
            const res = await referralApi.validateCode(couponCode);
            if (res.success && res.data) {
                setAppliedDiscount(res.data.discountAmount);
                toast.success(`Referral applied! ₹${res.data.discountAmount} off.`);
            } else {
                setAppliedDiscount(0);
                toast.error(res.message || "Invalid referral code");
            }
        } catch (err: any) {
            setAppliedDiscount(0);
            const errorMsg = err.response?.data?.message || err.response?.data?.error?.message || "Failed to validate referral code";
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

        // STEP 2: Online Payment via Razorpay Standard Checkout
        if (paymentMethod === "online" && finalAmountToPay > 0) {
            const amountInPaise = Math.round(finalAmountToPay * 100);
            if (amountInPaise < 100) {
                toast.error("Online payment amount must be at least ₹1.00");
                return;
            }

            const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
            if (!razorpayKey) {
                toast.error("Razorpay Key is not configured. Please check environment variables.");
                return;
            }

            setIsProcessingPayment(true);

            try {
                // Ensure Razorpay SDK is loaded
                const isLoaded = await loadRazorpayScript();
                if (!isLoaded || typeof (window as any).Razorpay === "undefined") {
                    toast.error("Failed to load Razorpay payment gateway. Please check your connection.");
                    setIsProcessingPayment(false);
                    return;
                }

                // STEP 1: Call Backend to Create Order (POST /api/create-order)
                const rzpOrder = await paymentApi.createRazorpayOrder({
                    amount: amountInPaise,
                    currency: "INR",
                    receipt: `rcpt_${Date.now()}`,
                });

                if (!rzpOrder || !rzpOrder.order_id) {
                    throw new Error(rzpOrder?.message || "Failed to create payment order");
                }

                // STEP 2: Open Razorpay modal with order_id
                const options = {
                    key: razorpayKey,
                    amount: rzpOrder.amount,
                    currency: rzpOrder.currency || "INR",
                    name: "Tommalu Homemade Food",
                    description: orderDetails.isSubscription
                        ? "Subscription Plan Payment"
                        : `${orderDetails.slot || "Meal"} Order - Tommalu`,
                    image: "/logo.png",
                    order_id: rzpOrder.order_id,
                    prefill: {
                        name: name || user?.name || "",
                        email: user?.email || "",
                        contact: phone || user?.phone || "",
                    },
                    theme: {
                        color: "#ea580c",
                    },
                    config: {
                        display: {
                            blocks: {
                                upi: {
                                    name: "Pay via UPI (GPay / PhonePe / Paytm / QR)",
                                    instruments: [
                                        {
                                            method: "upi",
                                        },
                                    ],
                                },
                                other: {
                                    name: "Cards, NetBanking & Wallets",
                                    instruments: [
                                        {
                                            method: "card",
                                        },
                                        {
                                            method: "netbanking",
                                        },
                                        {
                                            method: "wallet",
                                        },
                                    ],
                                },
                            },
                            sequence: ["block.upi", "block.other"],
                            preferences: {
                                show_default_blocks: true,
                            },
                        },
                    },
                    handler: async function (response: any) {
                        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
                        toast.loading("Verifying payment...", { id: "razorpay-verification" });

                        try {
                            // STEP 3: Backend - Verify Signature (POST /api/verify-payment)
                            const verifyResult = await paymentApi.verifyRazorpayPayment({
                                razorpay_order_id,
                                razorpay_payment_id,
                                razorpay_signature,
                            });

                            if (verifyResult.success) {
                                toast.success("Payment verified successfully!", { id: "razorpay-verification" });

                                // Finalize order with online payment details
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
                                        startDate: new Date().toISOString(),
                                        quantity: orderDetails.quantity,
                                        referralCode: appliedDiscount > 0 ? couponCode : undefined,
                                        redeemTokens: useTokens,
                                        paymentMethod: 'online',
                                        razorpayPaymentId: razorpay_payment_id,
                                        razorpayOrderId: razorpay_order_id,
                                    };
                                    submitSubscriptionMutation.mutate(payload);
                                } else {
                                    const payload = {
                                        customerName: name,
                                        mobileNumber: phone,
                                        customerEmail: user?.email || '',
                                        area: selectedAddressIndex !== "new" ? "Home" : area,
                                        customAddress: address,
                                        quantity: orderDetails.quantity,
                                        slot: orderDetails.slot,
                                        items: orderDetails.items,
                                        itemsTotal: itemsTotal,
                                        deliveryCharge: deliveryCharge,
                                        totalPrice: itemsTotal,
                                        locationLink: locationLink,
                                        promoCode: appliedDiscount > 0 ? couponCode : undefined,
                                        useTokens: useTokens,
                                        idempotencyKey: idempotencyKeyRef.current,
                                        paymentMethod: 'online',
                                        razorpayPaymentId: razorpay_payment_id,
                                        razorpayOrderId: razorpay_order_id,
                                    };
                                    placeOrderMutation.mutate(payload);
                                }
                            } else {
                                toast.error(verifyResult.message || "Payment verification failed", { id: "razorpay-verification" });
                                setIsProcessingPayment(false);
                            }
                        } catch (err: any) {
                            console.error("Signature verification error:", err);
                            const errMsg = err.response?.data?.message || "Payment verification failed. Please contact support.";
                            toast.error(errMsg, { id: "razorpay-verification" });
                            setIsProcessingPayment(false);
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            toast.info("Payment cancelled. You can retry or choose Cash on Delivery.");
                            setIsProcessingPayment(false);
                        }
                    }
                };

                const razorpayInstance = new (window as any).Razorpay(options);

                razorpayInstance.on("payment.failed", function (response: any) {
                    console.error("Payment failed:", response.error);
                    const errMsg =
                        response.error?.description ||
                        response.error?.reason ||
                        "Payment processing failed";
                    toast.error(`Payment failed: ${errMsg}`);
                    setIsProcessingPayment(false);
                });

                razorpayInstance.open();
            } catch (err: any) {
                console.error("Failed to start payment:", err);
                const errMsg = err.response?.data?.message || err.message || "Failed to start payment";
                toast.error(errMsg);
                setIsProcessingPayment(false);
            }
            return;
        }

        // Cash on delivery path
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
                startDate: new Date().toISOString(),
                quantity: orderDetails.quantity,
                referralCode: appliedDiscount > 0 ? couponCode : undefined,
                redeemTokens: useTokens,
                paymentMethod: 'cash_on_delivery',
            };
            submitSubscriptionMutation.mutate(payload);
        } else {
            const payload = {
                customerName: name,
                mobileNumber: phone,
                customerEmail: user?.email || '',
                area: selectedAddressIndex !== "new" ? "Home" : area,
                customAddress: address,
                quantity: orderDetails.quantity,
                slot: orderDetails.slot,
                items: orderDetails.items,
                itemsTotal: itemsTotal,
                deliveryCharge: deliveryCharge,
                totalPrice: itemsTotal,
                locationLink: locationLink,
                promoCode: appliedDiscount > 0 ? couponCode : undefined,
                useTokens: useTokens,
                idempotencyKey: idempotencyKeyRef.current,
                paymentMethod: 'cash_on_delivery',
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
                                    <span>₹{itemsTotal}</span>
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
                                        <div className="flex items-center justify-between text-stone-600 border-t border-stone-100 pt-3 mt-1">
                                            <div className="flex items-center gap-2">
                                                <Truck className="w-4 h-4 text-orange-500" /> 
                                                <span>Delivery Fee</span>
                                            </div>
                                            <div className="text-right">
                                                {deliveryCharge > 0 ? (
                                                    <div>
                                                        <span className="font-bold text-orange-600">₹{deliveryCharge}</span>
                                                        <span className="block text-[10px] text-stone-400">
                                                            {orderDetails.slot === 'Lunch' ? 'Order after 1:00 PM' : 'Order after 9:00 PM'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span className="font-bold text-green-600">FREE</span>
                                                        <span className="block text-[10px] text-stone-400">
                                                            {orderDetails.slot === 'Lunch' ? 'Pre-order before 1:00 PM' : 'Pre-order before 9:00 PM'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Coupon Code Section */}
                            {!orderDetails.isSubscription ? (
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
                            ) : (
                                <div className="flex flex-col gap-2 pt-2">
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="Referral Code" 
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
                                                onClick={handleValidateReferral}
                                                disabled={!couponCode || isApplyingCoupon}
                                            >
                                                {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 pl-1">New customers only. Get an instant discount!</p>
                                </div>
                            )}
                            
                            {useTokens && (
                                <p className="text-[10px] text-orange-600 font-medium px-1 mt-1 flex items-center gap-1">
                                    Offers cannot be used with tokens.
                                </p>
                            )}
                            
                            {/* Final Price Breakdown */}
                            <div className="space-y-3 pt-2">
                                {deliveryCharge > 0 && (
                                    <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200 flex justify-between items-center text-sm">
                                        <span className="font-medium text-amber-900 flex items-center gap-1.5">
                                            <Truck className="w-4 h-4 text-amber-600" />
                                            Late Delivery Fee
                                        </span>
                                        <span className="font-bold text-amber-700">+₹{deliveryCharge}</span>
                                    </div>
                                )}

                                {appliedDiscount > 0 && (
                                    <div className="bg-green-50/50 p-3 rounded-lg border border-green-100 flex justify-between items-center text-sm">
                                        <span className="font-medium text-green-800">
                                            {orderDetails.isSubscription ? "Referral Discount" : "Coupon Discount"}
                                        </span>
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
                                                    -₹{tokenDiscount.toFixed(2)}
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
                            
                            {!orderDetails.isSubscription && appliedDiscount > 0 && (
                                <p className="text-[10px] text-orange-600 font-medium px-1 mt-1 flex items-center gap-1">
                                    Tokens cannot be used with coupons.
                                </p>
                            )}

                            {/* Payment Method Selection */}
                            <div className="border-t border-stone-100 pt-4 mt-2 space-y-2">
                                <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block">
                                    Select Payment Method
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("online")}
                                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                            paymentMethod === "online"
                                                ? "border-orange-500 bg-orange-50/70 shadow-sm ring-1 ring-orange-500"
                                                : "border-stone-200 hover:border-stone-300 bg-white"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <CreditCard className={`w-4 h-4 ${paymentMethod === "online" ? "text-orange-600" : "text-stone-500"}`} />
                                            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">UPI / Cards</span>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-xs font-bold text-stone-900">Pay Online</p>
                                            <p className="text-[10px] text-stone-500">Razorpay Secure</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("cod")}
                                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                            paymentMethod === "cod"
                                                ? "border-orange-500 bg-orange-50/70 shadow-sm ring-1 ring-orange-500"
                                                : "border-stone-200 hover:border-stone-300 bg-white"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <Banknote className={`w-4 h-4 ${paymentMethod === "cod" ? "text-orange-600" : "text-stone-500"}`} />
                                            <span className="text-[10px] bg-stone-100 text-stone-600 font-medium px-1.5 py-0.5 rounded">Cash</span>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-xs font-bold text-stone-900">Cash on Delivery</p>
                                            <p className="text-[10px] text-stone-500">Pay upon arrival</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-stone-100 pt-4 mt-2">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-stone-600 font-medium">To Pay</span>
                                    <span className="text-2xl font-black text-stone-900">
                                        ₹{finalAmountToPay.toFixed(2)}
                                    </span>
                                </div>

                                <Button 
                                    onClick={handleConfirm} 
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 py-6 text-lg font-bold" 
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                                    ) : paymentMethod === "online" ? (
                                        <><CreditCard className="mr-2 h-5 w-5" /> Pay ₹{finalAmountToPay.toFixed(2)} with Razorpay</>
                                    ) : (
                                        orderDetails.isSubscription ? "Subscribe Now (COD)" : "Confirm Order (COD)"
                                    )}
                                </Button>
                                <div className="flex items-center justify-center gap-1.5 text-center text-xs text-stone-500 mt-3 font-medium">
                                    <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                                    <span>
                                        {paymentMethod === "online"
                                            ? "Secured by Razorpay • UPI, Cards, NetBanking"
                                            : "Cash on Delivery • You will earn 10 Tokens on this order!"}
                                    </span>
                                </div>
                                <p className="text-[11px] text-center text-stone-400 mt-2 font-medium">
                                    Tommalu Kitchen • FSSAI Lic. No. 22226043000221
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
