"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersKeys } from "@/config/query.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useAuthMe, useMyOrders } from "@/hooks/api";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, Phone, Loader2, User, Navigation, CheckCircle2, Coins, ArrowLeft, Truck, CreditCard, Banknote, ShieldCheck, Zap, Smartphone, Check, Plus, Edit2, MessageSquare, Tag, ChevronRight, Percent, Sparkles, X, ChevronDown, Trash2 } from "lucide-react";

interface SavedAddressItem {
    id: string;
    label: string;
    street: string;
    area: string;
    locationLink?: string;
}

const STORAGE_PROFILE_KEY = "tommalu_saved_delivery_profile";
const STORAGE_ADDRESSES_KEY = "tommalu_saved_addresses_list";

function detectAreaFromText(text: string): string {
    if (!text) return "";
    const lower = text.toLowerCase();
    if (lower.includes("nims")) return "Nims";
    if (lower.includes("achrol")) return "Achrol";
    if (lower.includes("talamod") || lower.includes("tala mod") || lower.includes("tala")) return "Talamod";
    return "";
}
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
    const { data: myOrdersData } = useMyOrders({ refetchInterval: 0 });
    const hasPriorOrders = useMemo(() => {
        if (myOrdersData?.data && myOrdersData.data.length > 0) return true;
        if (user && (user as any).totalOrders > 0) return true;
        return false;
    }, [myOrdersData, user]);

    const queryClient = useQueryClient();

    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [specialInstructions, setSpecialInstructions] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedOrder = sessionStorage.getItem("checkoutOrderDetails");
        if (storedOrder) {
            try {
                const parsed = JSON.parse(storedOrder);
                setOrderDetails(parsed);
                if (parsed.specialInstructions) {
                    setSpecialInstructions(parsed.specialInstructions);
                }
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
    const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [isCustomAddressMode, setIsCustomAddressMode] = useState<boolean>(false);
    const [hasLoadedProfile, setHasLoadedProfile] = useState<boolean>(false);
    const [showAllSavedAddresses, setShowAllSavedAddresses] = useState<boolean>(false);

    // Delete single saved address from list & localStorage
    const handleDeleteSavedAddress = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSavedAddresses(prev => {
            const updated = prev.filter(a => a.id !== id);
            if (typeof window !== "undefined") {
                try {
                    localStorage.setItem(STORAGE_ADDRESSES_KEY, JSON.stringify(updated));
                } catch (err) { }
            }
            return updated;
        });

        if (selectedAddressId === id) {
            setSelectedAddressId("");
        }
        toast.info("Saved address removed");
    };

    // Memoize displayed addresses to prevent tall vertical stacking & long scrolling
    const displayedAddresses = useMemo(() => {
        if (showAllSavedAddresses || savedAddresses.length <= 2) {
            return savedAddresses;
        }
        // Prioritize currently selected address into top 2 if present
        const selIdx = savedAddresses.findIndex(
            a => a.id === selectedAddressId || (address && a.street.trim().toLowerCase() === address.trim().toLowerCase())
        );
        if (selIdx > 1) {
            const listCopy = [...savedAddresses];
            const [selItem] = listCopy.splice(selIdx, 1);
            return [selItem, listCopy[0]];
        }
        return savedAddresses.slice(0, 2);
    }, [savedAddresses, showAllSavedAddresses, selectedAddressId, address]);

    // Helper to auto-save current delivery details into localStorage
    const updateAndSaveProfile = (updates: Partial<{
        name: string;
        phone: string;
        area: string;
        address: string;
        locationLink: string;
        paymentMethod: "online" | "cod";
    }>) => {
        if (typeof window === "undefined") return;
        try {
            const current = {
                name: updates.name !== undefined ? updates.name : name,
                phone: updates.phone !== undefined ? updates.phone : phone,
                area: updates.area !== undefined ? updates.area : area,
                address: updates.address !== undefined ? updates.address : address,
                locationLink: updates.locationLink !== undefined ? updates.locationLink : locationLink,
                paymentMethod: updates.paymentMethod !== undefined ? updates.paymentMethod : paymentMethod,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(current));
        } catch (e) { }
    };

    // Helper to switch active saved address
    const handleSelectSavedAddress = (item: SavedAddressItem) => {
        setSelectedAddressId(item.id);
        setAddress(item.street);
        const resolvedArea = item.area || detectAreaFromText(item.street) || "Nims";
        setArea(resolvedArea);
        if (item.locationLink) setLocationLink(item.locationLink);
        setIsCustomAddressMode(false);
        updateAndSaveProfile({
            address: item.street,
            area: resolvedArea,
            locationLink: item.locationLink || ""
        });
        toast.success(`Delivery address set to ${item.label}`);
    };

    // Helper to persist used address to recent addresses list on order
    const persistAddressOnOrder = (orderedAddress: string, orderedArea: string, orderedLocation: string) => {
        if (typeof window === "undefined" || !orderedAddress) return;
        try {
            const cleanAddr = orderedAddress.trim();
            const cleanArea = orderedArea || detectAreaFromText(cleanAddr) || "Nims";
            const newId = `addr-${Date.now()}`;
            const label = cleanAddr.toLowerCase().includes("hostel") ? "Hostel" : "Home";

            setSavedAddresses(prev => {
                const filtered = prev.filter(a => a.street.trim().toLowerCase() !== cleanAddr.toLowerCase());
                const updatedList: SavedAddressItem[] = [
                    { id: newId, label, street: cleanAddr, area: cleanArea, locationLink: orderedLocation },
                    ...filtered
                ].slice(0, 4);
                localStorage.setItem(STORAGE_ADDRESSES_KEY, JSON.stringify(updatedList));
                return updatedList;
            });

            updateAndSaveProfile({
                name,
                phone,
                area: cleanArea,
                address: cleanAddr,
                locationLink: orderedLocation,
                paymentMethod
            });
        } catch (e) { }
    };

    // 1. Initial Load from LocalStorage
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const rawProfile = localStorage.getItem(STORAGE_PROFILE_KEY);
            const rawAddresses = localStorage.getItem(STORAGE_ADDRESSES_KEY);
            let profileData: any = null;
            let localList: SavedAddressItem[] = [];

            if (rawProfile) {
                profileData = JSON.parse(rawProfile);
                if (profileData.name) setName(profileData.name);
                if (profileData.phone) setPhone(profileData.phone);
                if (profileData.area) setArea(profileData.area);
                if (profileData.address) setAddress(profileData.address);
                if (profileData.locationLink) setLocationLink(profileData.locationLink);
                if (profileData.paymentMethod === "online" || profileData.paymentMethod === "cod") {
                    setPaymentMethod(profileData.paymentMethod);
                }
                setHasLoadedProfile(true);
            }

            if (rawAddresses) {
                const parsed = JSON.parse(rawAddresses);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const unique: SavedAddressItem[] = [];
                    parsed.forEach((item: any) => {
                        if (item && item.street && typeof item.street === "string") {
                            const trimmed = item.street.trim().toLowerCase();
                            if (!unique.some(u => u.street.trim().toLowerCase() === trimmed)) {
                                unique.push(item);
                            }
                        }
                    });
                    localList = unique;
                    setSavedAddresses(unique);
                }
            }

            // Sync selected ID
            if (profileData?.address) {
                const cleanProf = profileData.address.trim().toLowerCase();
                const match = localList.find(a => a.street.trim().toLowerCase() === cleanProf);
                if (match) {
                    setSelectedAddressId(match.id);
                } else if (localList.length === 0) {
                    const fallbackEntry: SavedAddressItem = {
                        id: "last-used",
                        label: profileData.address.toLowerCase().includes("hostel") ? "Hostel" : "Home",
                        street: profileData.address,
                        area: profileData.area || detectAreaFromText(profileData.address) || "Nims",
                        locationLink: profileData.locationLink || ""
                    };
                    setSavedAddresses([fallbackEntry]);
                    setSelectedAddressId("last-used");
                }
            }
        } catch (e) {
            console.warn("Could not read saved checkout profile:", e);
        }
    }, []);

    // 2. Merge Authenticated User Profile & Addresses
    useEffect(() => {
        if (!user) return;

        setName(prev => prev || user.name || "");
        setPhone(prev => prev || user.phone || "");

        if (user.addresses && user.addresses.length > 0) {
            setSavedAddresses(prev => {
                const combined: SavedAddressItem[] = [...prev];
                user.addresses!.forEach((uAddr, idx) => {
                    const alreadyExists = combined.some(
                        a => a.street.trim().toLowerCase() === uAddr.street.trim().toLowerCase()
                    );
                    if (!alreadyExists) {
                        const detectedArea = detectAreaFromText(uAddr.street) || "Nims";
                        combined.unshift({
                            id: `server-${idx}`,
                            label: uAddr.label || "Home",
                            street: uAddr.street,
                            area: detectedArea,
                            locationLink: (uAddr as any).locationLink || ""
                        });
                    }
                });
                return combined.slice(0, 5);
            });

            // If no address selected yet, auto-select the first user address
            setAddress(prev => {
                if (!prev && user.addresses![0]?.street) {
                    const first = user.addresses![0];
                    setSelectedAddressId(`server-0`);
                    const detected = detectAreaFromText(first.street) || "Nims";
                    setArea(a => a || detected);
                    setHasLoadedProfile(true);
                    return first.street;
                }
                return prev;
            });
        }
    }, [user]);

    // Token State
    const [useTokens, setUseTokens] = useState(false);
    const availableTokens = user?.tokens ?? 0;

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
    const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
    const [manualCouponInput, setManualCouponInput] = useState("");

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

    const handleApplySpecificCoupon = async (codeToApply: string) => {
        if (!codeToApply) return;
        const normalized = codeToApply.trim().toUpperCase();

        if (normalized === "FIRST20" && hasPriorOrders) {
            toast.error("FIRST20 coupon is valid only on your first order");
            return;
        }

        if (normalized === "THALI30" && Number(orderDetails?.quantity || 1) < 3) {
            toast.error("THALI30 requires at least 3 thalis in order");
            return;
        }

        setIsApplyingCoupon(true);
        try {
            if (orderDetails?.isSubscription) {
                const res = await referralApi.validateCode(normalized);
                if (res.success && res.data) {
                    setCouponCode(normalized);
                    setAppliedDiscount(res.data.discountAmount);
                    setUseTokens(false);
                    setIsOffersModalOpen(false);
                    toast.success(`Referral applied! You saved ₹${res.data.discountAmount}`);
                } else {
                    toast.error(res.message || "Invalid referral code");
                }
            } else {
                const res = await promotionsApi.validatePromotion({
                    code: normalized,
                    orderAmount: itemsTotal,
                    phone: phone.trim()
                });
                if (res.valid && res.data) {
                    setCouponCode(normalized);
                    setAppliedDiscount(res.data.discount);
                    setUseTokens(false);
                    setIsOffersModalOpen(false);
                    toast.success(`Coupon ${normalized} applied! You saved ₹${res.data.discount}`);
                } else {
                    toast.error(res.reason || "Invalid coupon code");
                }
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || "Failed to validate coupon";
            toast.error(errorMsg);
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveDiscount = () => {
        setCouponCode("");
        setAppliedDiscount(0);
        toast.info("Coupon removed");
    };

    const availableOffersList = [
        {
            code: "FIRST20",
            title: "First Order Special - Flat ₹20 OFF",
            desc: "Welcome to Tommalu! Flat ₹20 OFF on your first delicious homemade order.",
            badge: "Flat ₹20 OFF",
            isEligible: itemsTotal >= 90 && !hasPriorOrders,
            ineligibleHint: hasPriorOrders
                ? "Valid only for new customers on their first order"
                : `Add items worth ₹${Math.max(0, 90 - itemsTotal)} more to unlock`,
        },
        {
            code: "THALI30",
            title: "Save ₹30 on 3 or more Thalis",
            desc: "Order 3 or more thalis and get flat ₹30 discount instantly!",
            badge: "Flat ₹30 OFF",
            isEligible: (orderDetails?.quantity || 1) >= 3,
            ineligibleHint: `Add ${Math.max(1, 3 - (orderDetails?.quantity || 1))} more thali to unlock`,
        },
        {
            code: "TOMMALU20",
            title: "Flat ₹20 OFF",
            desc: "Save ₹20 on all orders above ₹200.",
            badge: "Flat ₹20 OFF",
            isEligible: itemsTotal >= 200,
            ineligibleHint: `Add items worth ₹${Math.max(0, 200 - itemsTotal)} more to unlock`,
        },
        {
            code: "FEAST50",
            title: "Family Feast ₹50 OFF",
            desc: "Flat ₹50 OFF on orders with 4+ thalis or above ₹390.",
            badge: "Flat ₹50 OFF",
            isEligible: (orderDetails?.quantity || 1) >= 4 || itemsTotal >= 390,
            ineligibleHint: `Add items worth ₹${Math.max(0, 390 - itemsTotal)} more to unlock`,
        },
    ];

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
                updateAndSaveProfile({ locationLink: mapLink });
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
        const effectiveArea = area || detectAreaFromText(address) || "Nims";
        const cleanName = (name || "").trim();
        const cleanPhone = (phone || "").trim();
        const cleanAddress = (address || "").trim();

        if (!cleanName || !cleanAddress || !cleanPhone) {
            toast.error("Please fill in all delivery details (Name, Phone & Address)");
            // Smoothly scroll to delivery details card on mobile if missing
            const deliveryCard = document.getElementById("delivery-details-card");
            if (deliveryCard) {
                deliveryCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        if (cleanPhone.length < 10) {
            toast.error("Please enter a valid 10-digit mobile number");
            return;
        }

        // Persist used details in localStorage immediately for future 1-click checkout
        persistAddressOnOrder(cleanAddress, effectiveArea, locationLink);

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
                    name: "Tommalu Kitchen",
                    description: orderDetails.isSubscription
                        ? "Subscription Plan Payment - Tommalu"
                        : `${orderDetails.thaliName || "Homemade Thali"} (${orderDetails.slot || "Meal"}) x${orderDetails.quantity}`,
                    image: "/favicon.ico",
                    order_id: rzpOrder.order_id,
                    prefill: {
                        name: cleanName || user?.name || "",
                        email: user?.email || "",
                        contact: cleanPhone || user?.phone || "",
                        method: "upi",
                    },
                    notes: {
                        slot: orderDetails.slot || "Meal",
                        quantity: orderDetails.quantity,
                        customerName: cleanName,
                        customerPhone: cleanPhone,
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
                                        customerName: cleanName,
                                        mobileNumber: cleanPhone,
                                        deliveryAddress: {
                                            street: cleanAddress,
                                            city: effectiveArea || 'Jaipur',
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
                                        customerName: cleanName,
                                        mobileNumber: cleanPhone,
                                        customerEmail: user?.email || '',
                                        area: effectiveArea,
                                        customAddress: cleanAddress,
                                        quantity: orderDetails.quantity,
                                        thaliType: orderDetails.thaliType || 'regular',
                                        thaliName: orderDetails.thaliName || 'Regular Thali',
                                        extraRotiCount: orderDetails.extraRotiCount || 0,
                                        specialInstructions: specialInstructions || orderDetails.specialInstructions || '',
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
                customerName: cleanName,
                mobileNumber: cleanPhone,
                deliveryAddress: {
                    street: cleanAddress,
                    city: effectiveArea || 'Jaipur',
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
                customerName: cleanName,
                mobileNumber: cleanPhone,
                customerEmail: user?.email || '',
                area: effectiveArea,
                customAddress: cleanAddress,
                quantity: orderDetails.quantity,
                thaliType: orderDetails.thaliType || 'regular',
                thaliName: orderDetails.thaliName || 'Regular Thali',
                extraRotiCount: orderDetails.extraRotiCount || 0,
                specialInstructions: specialInstructions || orderDetails.specialInstructions || '',
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
        <div className="min-h-screen bg-stone-50/40 pb-28 sm:pb-12 w-full max-w-full overflow-x-hidden box-border">
            <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 box-border min-w-0">
                {/* Back button and trust header */}
                <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center text-xs sm:text-sm font-bold text-stone-700 hover:text-stone-900 transition-colors bg-white hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-full shadow-2xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-stone-500" /> Back to Menu
                    </Link>
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>100% Hygienic</span>
                    </div>
                </div>

                {/* Page Title */}
                <div className="mb-4 sm:mb-6 flex items-center justify-between flex-wrap gap-2">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-stone-900 tracking-tight truncate">
                            Checkout {orderDetails.isSubscription ? "Subscription" : "Order"}
                        </h1>
                        <p className="text-xs text-stone-500 font-medium mt-0.5 truncate">
                            Verify your delivery address & meal details
                        </p>
                    </div>
                    <span className="text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 shrink-0">
                        {orderDetails.isSubscription ? "Subscription Plan" : `${orderDetails.slot || 'Daily'} Meal`}
                    </span>
                </div>

                {/* Mobile Quick Glance Banner */}
                <div className="md:hidden mb-4 p-3 bg-white rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between gap-2.5 w-full min-w-0 max-w-full overflow-hidden">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-base shrink-0 shadow-2xs">
                            🍛
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-stone-900 truncate">
                                {orderDetails.isSubscription ? orderDetails.planName : (orderDetails.thaliName || "Regular Thali")}
                            </p>
                            <p className="text-[11px] text-stone-500 font-medium truncate">
                                Qty: {orderDetails.quantity} {orderDetails.extraRotiCount > 0 ? `+ ${orderDetails.extraRotiCount} Roti` : ""} • ₹{itemsTotal}
                            </p>
                        </div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wide">
                        {orderDetails.slot || "Daily"}
                    </span>
                </div>

                <div className="grid gap-5 md:gap-6 md:grid-cols-[1fr_370px] w-full min-w-0 max-w-full">
                    {/* Left Column - Delivery Details */}
                    <div className="space-y-5 md:space-y-6 w-full min-w-0 max-w-full">
                        <Card id="delivery-details-card" className="border-stone-200 shadow-xs sm:shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden bg-white w-full min-w-0 max-w-full">
                            <CardHeader className="bg-stone-50/80 border-b border-stone-100 p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base sm:text-lg font-black flex items-center gap-2 text-stone-900">
                                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                                        Delivery Details
                                    </CardTitle>
                                    {hasLoadedProfile && (
                                        <span className="text-[10px] sm:text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                            <Zap className="w-3 h-3 text-emerald-600 fill-current" />
                                            Auto-Filled
                                        </span>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-3.5 sm:p-6 space-y-4 sm:space-y-5 w-full min-w-0 max-w-full box-border">
                                {/* Saved Addresses Quick Selection */}
                                {savedAddresses.length > 0 && (
                                    <div className="space-y-2 w-full min-w-0 max-w-full">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                                                Saved Delivery Addresses
                                                <span className="text-[10px] font-semibold text-stone-400 bg-stone-100 px-1.5 py-0.2 rounded-full">
                                                    {savedAddresses.length}
                                                </span>
                                            </Label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCustomAddressMode(true);
                                                    setSelectedAddressId("");
                                                    setAddress("");
                                                    toast.info("Enter your new address below");
                                                }}
                                                className="text-xs text-orange-600 hover:text-orange-700 font-bold cursor-pointer transition-colors flex items-center gap-1"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> New Address
                                            </button>
                                        </div>

                                        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 w-full min-w-0 max-w-full">
                                            {displayedAddresses.map((saved) => {
                                                const isSelected = selectedAddressId === saved.id || (!isCustomAddressMode && address.trim().toLowerCase() === saved.street.trim().toLowerCase());
                                                const isHostel = saved.street.toLowerCase().includes("hostel");
                                                return (
                                                    <div
                                                        key={saved.id}
                                                        onClick={() => handleSelectSavedAddress(saved)}
                                                        className={`p-2.5 sm:p-3 rounded-xl border text-left cursor-pointer transition-all relative select-none active:scale-[0.99] w-full min-w-0 max-w-full overflow-hidden group ${isSelected
                                                            ? "border-orange-500 bg-orange-50/80 shadow-xs ring-2 ring-orange-500/80"
                                                            : "border-stone-200 hover:border-stone-300 bg-white"
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-1 gap-1">
                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                <span className="text-xs">{isHostel ? "🏢" : "🏠"}</span>
                                                                <span className="text-xs font-black text-stone-900 truncate">
                                                                    {saved.label || (isHostel ? "Hostel" : "Home")}
                                                                </span>
                                                                <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded shrink-0">
                                                                    {saved.area || "Nims"}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                {isSelected && (
                                                                    <span className="text-[10px] font-extrabold text-orange-700 bg-orange-100/90 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                                                        <CheckCircle2 className="w-3 h-3 fill-orange-500 text-white" />
                                                                        Selected
                                                                    </span>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    title="Remove saved address"
                                                                    onClick={(e) => handleDeleteSavedAddress(e, saved.id)}
                                                                    className="p-1 rounded-md text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed break-all">
                                                            {saved.street}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {savedAddresses.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowAllSavedAddresses(prev => !prev)}
                                                className="w-full py-1.5 px-3 text-xs font-bold text-stone-600 hover:text-orange-600 bg-stone-100/70 hover:bg-orange-50/60 border border-stone-200/80 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                            >
                                                <span>
                                                    {showAllSavedAddresses
                                                        ? "Show fewer addresses"
                                                        : `View all ${savedAddresses.length} saved addresses`}
                                                </span>
                                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAllSavedAddresses ? "rotate-180" : ""}`} />
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full min-w-0 max-w-full">
                                    <div className="space-y-1.5 w-full min-w-0">
                                        <Label htmlFor="name" className="text-xs font-bold text-stone-700">Name <span className="text-orange-500">*</span></Label>
                                        <div className="relative w-full min-w-0">
                                            <User className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) => {
                                                    setName(e.target.value);
                                                    updateAndSaveProfile({ name: e.target.value });
                                                }}
                                                className="pl-9 h-11 sm:h-10 text-sm bg-stone-50/50 border-stone-200 focus:bg-white rounded-xl w-full"
                                                placeholder="Your Full Name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 w-full min-w-0">
                                        <Label htmlFor="phone" className="text-xs font-bold text-stone-700">Phone Number <span className="text-orange-500">*</span></Label>
                                        <div className="relative w-full min-w-0">
                                            <Phone className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                            <Input
                                                id="phone"
                                                value={phone}
                                                onChange={(e) => {
                                                    setPhone(e.target.value);
                                                    updateAndSaveProfile({ phone: e.target.value });
                                                }}
                                                className="pl-9 h-11 sm:h-10 text-sm bg-stone-50/50 border-stone-200 focus:bg-white rounded-xl w-full"
                                                placeholder="10-digit mobile number"
                                                maxLength={10}
                                                type="tel"
                                                inputMode="numeric"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 w-full min-w-0 max-w-full">
                                    <div className="space-y-1.5 p-3 sm:p-3.5 bg-orange-50/60 rounded-xl sm:rounded-2xl border border-orange-100 w-full min-w-0 max-w-full box-border">
                                        <div className="flex items-center justify-between flex-wrap gap-1">
                                            <Label htmlFor="area" className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                                                Area / Campus <span className="text-orange-500">*</span>
                                            </Label>
                                            <span className="text-[10px] text-stone-500 font-medium shrink-0">Auto-detected</span>
                                        </div>
                                        <Select
                                            value={area || "Nims"}
                                            onValueChange={(val) => {
                                                setArea(val);
                                                updateAndSaveProfile({ area: val });
                                            }}
                                        >
                                            <SelectTrigger className="bg-white h-11 sm:h-10 rounded-xl border-stone-200 text-sm font-medium w-full">
                                                <SelectValue placeholder="Select Area / Campus" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {AREAS.map((a) => (
                                                    <SelectItem key={a} value={a} className="text-sm font-medium">{a}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="w-full min-w-0 max-w-full">
                                        <div className="flex items-center justify-between mb-1.5 gap-2">
                                            <Label htmlFor="address" className="text-xs font-bold text-stone-700 truncate">Full Address / Hostel Room <span className="text-orange-500">*</span></Label>
                                            {address && (
                                                <span className="text-[10px] sm:text-[11px] text-emerald-600 font-bold flex items-center gap-1 shrink-0">
                                                    ✓ Auto-Saved
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative w-full min-w-0 max-w-full">
                                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                            <Textarea
                                                id="address"
                                                value={address}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setAddress(val);
                                                    const detected = detectAreaFromText(val);
                                                    const finalArea = detected || area || "Nims";
                                                    if (detected && detected !== area) {
                                                        setArea(detected);
                                                    }
                                                    updateAndSaveProfile({ address: val, area: finalArea });
                                                }}
                                                className="pl-9 min-h-[72px] sm:min-h-[80px] text-sm bg-stone-50/50 border-stone-200 focus:bg-white rounded-xl resize-none w-full max-w-full box-border break-all"
                                                placeholder="e.g. Nims University, Girls Hostel-3, Room 402, Jaipur"
                                            />
                                        </div>
                                    </div>

                                    <div className="w-full min-w-0 max-w-full">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className={`w-full h-auto min-h-10 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-normal text-center leading-tight ${locationLink ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100' : 'border-orange-200 text-orange-700 hover:bg-orange-50'}`}
                                            onClick={handleDetectLocation}
                                            disabled={isDetectingLocation}
                                        >
                                            {isDetectingLocation ? (
                                                <><Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> Detecting Location...</>
                                            ) : locationLink ? (
                                                <><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> GPS Location Shared</>
                                            ) : (
                                                <><Navigation className="w-3.5 h-3.5 shrink-0" /> <span className="break-words">Share GPS Location (Optional)</span></>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                {/* Right Column - Order Summary & Payment */}
                <div className="space-y-5 md:space-y-6 w-full min-w-0 max-w-full">
                    <Card className="border-stone-200 shadow-xs sm:shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden bg-white md:sticky md:top-20 w-full min-w-0 max-w-full box-border">
                        <CardHeader className="bg-stone-50/80 border-b border-stone-100 p-3.5 sm:p-5">
                            <CardTitle className="text-base sm:text-lg font-black text-stone-900">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 sm:p-6 space-y-4 w-full min-w-0 max-w-full box-border">
                            <div className="bg-white p-3 sm:p-4 rounded-xl space-y-3 text-sm border border-stone-100 shadow-xs w-full min-w-0 max-w-full box-border">
                                <div className="flex justify-between items-start font-bold text-stone-800 text-base border-b border-stone-100 pb-3 gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-base font-black text-stone-900 break-words">
                                            {orderDetails.isSubscription
                                                ? orderDetails.planName
                                                : (orderDetails.thaliName || "Regular Thali")}
                                        </p>
                                        <p className="text-xs font-normal text-stone-500">
                                            Qty: {orderDetails.quantity} {orderDetails.unitPrice ? `(@ ₹${orderDetails.unitPrice}/plate)` : ""}
                                            {orderDetails.extraRotiCount > 0 ? ` + ${orderDetails.extraRotiCount} Extra Roti` : ""}
                                        </p>
                                    </div>
                                    <span className="text-lg font-black text-stone-900 shrink-0">₹{itemsTotal}</span>
                                </div>

                                {!orderDetails.isSubscription && orderDetails.items && orderDetails.items.length > 0 && (
                                    <div className="py-2 border-b border-stone-100 space-y-1">
                                        <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wide">Included Items:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {orderDetails.items.map((it: string, idx: number) => (
                                                <span key={idx} className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium">
                                                    {it}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!orderDetails.isSubscription && (
                                    <div className="py-2.5 border-b border-stone-100 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide flex items-center gap-1">
                                                <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                                                Kitchen Instructions:
                                            </p>
                                            {specialInstructions && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSpecialInstructions("")}
                                                    className="text-[10px] text-stone-400 hover:text-stone-600 cursor-pointer"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none w-full max-w-full">
                                            {["Extra Chawal", "Kam Teekha", "Bina Pyaj-Lahsun", "Extra Salad", "Roti par Ghee"].map((tag) => {
                                                const isSelected = specialInstructions.includes(tag);
                                                return (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setSpecialInstructions(prev => prev.split(',').map(s => s.trim()).filter(s => s !== tag).join(', '));
                                                            } else {
                                                                setSpecialInstructions(prev => prev ? `${prev}, ${tag}` : tag);
                                                            }
                                                        }}
                                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border shrink-0 transition-colors cursor-pointer ${isSelected
                                                            ? "bg-orange-100 text-orange-800 border-orange-300"
                                                            : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                                                            }`}
                                                    >
                                                        {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <Input
                                            value={specialInstructions}
                                            onChange={(e) => setSpecialInstructions(e.target.value)}
                                            placeholder="e.g. Extra chawal pack kar dena..."
                                            className="h-8 text-xs bg-stone-50 border-stone-200"
                                        />
                                    </div>
                                )}

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

                            {/* Zomato-style Offers & Coupon Selector Card */}
                            {appliedDiscount > 0 ? (
                                <div className="mt-3 p-3 sm:p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200/90 flex items-center justify-between shadow-2xs w-full min-w-0 max-w-full box-border gap-2">
                                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-xs font-black text-emerald-950 uppercase tracking-wide truncate max-w-[140px] sm:max-w-none">
                                                    '{couponCode}' Applied
                                                </span>
                                                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-1.5 py-0.2 rounded whitespace-nowrap">
                                                    -₹{appliedDiscount}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-emerald-700 font-medium truncate">
                                                You saved ₹{appliedDiscount} on this order!
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveDiscount}
                                        className="text-xs font-extrabold text-red-600 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 cursor-pointer transition-colors shrink-0"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : useTokens && tokenDiscount > 0 ? (
                                <div className="mt-3 p-3 sm:p-3.5 bg-amber-50/90 rounded-2xl border border-amber-200/90 flex items-center justify-between shadow-2xs w-full min-w-0 max-w-full box-border gap-2">
                                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                                        <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                                            <Coins className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-xs font-black text-amber-950">
                                                    Tokens Applied
                                                </span>
                                                <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.2 rounded whitespace-nowrap">
                                                    -₹{tokenDiscount.toFixed(2)}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-amber-800 font-medium truncate">
                                                Redeemed from {availableTokens} balance
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setUseTokens(false)}
                                        className="text-xs font-extrabold text-red-600 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 cursor-pointer transition-colors shrink-0"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setManualCouponInput("");
                                        setIsOffersModalOpen(true);
                                    }}
                                    className="w-full mt-3 p-3 sm:p-3.5 bg-gradient-to-r from-orange-50/90 via-amber-50/50 to-orange-50/90 hover:from-orange-100 hover:to-amber-100/70 rounded-2xl border border-orange-200/90 transition-all flex items-center justify-between group shadow-2xs cursor-pointer box-border min-w-0 max-w-full gap-2"
                                >
                                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                                        <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                                            <Percent className="w-4 h-4 stroke-[2.5]" />
                                        </div>
                                        <div className="text-left min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-xs font-black text-stone-900 group-hover:text-orange-600 transition-colors">
                                                    Offers & Coupons
                                                </span>
                                                <span className="text-[10px] font-extrabold bg-orange-600 text-white px-1.5 py-0.2 rounded-full whitespace-nowrap">
                                                    Save ₹20+
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-stone-500 font-medium truncate">
                                                FIRST20, THALI30 & tokens
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5 text-orange-600 font-bold text-xs shrink-0">
                                        <span>View</span>
                                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                </button>
                            )}

                            {/* Final Price Breakdown */}
                            <div className="space-y-2 pt-3">
                                {deliveryCharge > 0 && (
                                    <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/80 flex justify-between items-center text-xs">
                                        <span className="font-medium text-amber-900 flex items-center gap-1.5">
                                            <Truck className="w-3.5 h-3.5 text-amber-600" />
                                            Late Delivery Fee
                                        </span>
                                        <span className="font-bold text-amber-700">+₹{deliveryCharge}</span>
                                    </div>
                                )}

                                {appliedDiscount > 0 && (
                                    <div className="bg-green-50/70 p-2.5 rounded-xl border border-green-200/80 flex justify-between items-center text-xs">
                                        <span className="font-bold text-green-900 flex items-center gap-1.5">
                                            <Tag className="w-3.5 h-3.5 text-green-600" />
                                            {orderDetails.isSubscription ? "Referral Discount" : `Coupon Discount (${couponCode})`}
                                        </span>
                                        <span className="font-black text-green-700">-₹{appliedDiscount}</span>
                                    </div>
                                )}

                                {useTokens && tokenDiscount > 0 && (
                                    <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80 flex justify-between items-center text-xs">
                                        <span className="font-bold text-amber-900 flex items-center gap-1.5">
                                            <Coins className="w-3.5 h-3.5 text-amber-600" />
                                            Tommalu Tokens Discount
                                        </span>
                                        <span className="font-black text-amber-700">-₹{tokenDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Payment Method Selection */}
                            <div className="border-t border-stone-100 pt-4 mt-2 space-y-2 w-full min-w-0 max-w-full box-border">
                                <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block">
                                    Select Payment Method
                                </label>
                                <div className="grid grid-cols-2 gap-2 w-full min-w-0 max-w-full">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPaymentMethod("online");
                                            updateAndSaveProfile({ paymentMethod: "online" });
                                        }}
                                        className={`p-2 sm:p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer select-none active:scale-[0.98] relative min-w-0 max-w-full overflow-hidden ${paymentMethod === "online"
                                            ? "border-orange-500 bg-orange-50/80 shadow-xs ring-2 ring-orange-500/80"
                                            : "border-stone-200 hover:border-stone-300 bg-white"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-1 w-full">
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${paymentMethod === "online" ? "text-orange-600 fill-orange-500" : "text-stone-500"}`} />
                                                <Smartphone className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${paymentMethod === "online" ? "text-orange-600" : "text-stone-400"}`} />
                                            </div>
                                            <span className="text-[9px] bg-green-100 text-green-700 font-extrabold px-1 py-0.5 rounded shadow-2xs truncate">
                                                ⚡ Instant
                                            </span>
                                        </div>
                                        <div className="mt-2 min-w-0 w-full">
                                            <p className="text-xs font-bold text-stone-900 truncate">
                                                Pay Online (UPI)
                                            </p>
                                            <p className="text-[10px] text-stone-500 font-medium truncate">
                                                GPay, PhonePe, Paytm
                                            </p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPaymentMethod("cod");
                                            updateAndSaveProfile({ paymentMethod: "cod" });
                                        }}
                                        className={`p-2 sm:p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer select-none active:scale-[0.98] relative min-w-0 max-w-full overflow-hidden ${paymentMethod === "cod"
                                            ? "border-orange-500 bg-orange-50/80 shadow-xs ring-2 ring-orange-500/80"
                                            : "border-stone-200 hover:border-stone-300 bg-white"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-1 w-full">
                                            <Banknote className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${paymentMethod === "cod" ? "text-orange-600" : "text-stone-500"}`} />
                                            <span className="text-[9px] bg-stone-100 text-stone-600 font-medium px-1 py-0.5 rounded">Cash</span>
                                        </div>
                                        <div className="mt-2 min-w-0 w-full">
                                            <p className="text-xs font-bold text-stone-900 truncate">Cash on Delivery</p>
                                            <p className="text-[10px] text-stone-500 font-medium truncate">Pay upon arrival</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Desktop Checkout Action Card */}
                            <div className="border-t border-stone-100 pt-3">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-stone-600 font-bold text-sm">To Pay</span>
                                    <div className="text-right">
                                        <span className="text-xl sm:text-2xl font-black text-stone-900">
                                            ₹{finalAmountToPay.toFixed(2)}
                                        </span>
                                        {(appliedDiscount > 0 || (useTokens && tokenDiscount > 0)) && (
                                            <span className="block text-xs text-stone-400 line-through font-medium">
                                                ₹{orderSubtotalWithDelivery.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleConfirm}
                                    className="w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white shadow-lg shadow-orange-600/20 py-5 sm:py-6 text-base sm:text-lg font-black rounded-xl sm:rounded-2xl cursor-pointer transition-all"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                                    ) : paymentMethod === "online" ? (
                                        <><Zap className="mr-2 h-5 w-5 fill-current" /> Pay ₹{finalAmountToPay.toFixed(2)} Online</>
                                    ) : (
                                        orderDetails.isSubscription ? "Subscribe Now (COD)" : "Confirm Order (COD)"
                                    )}
                                </Button>

                                <div className="flex items-center justify-center gap-1.5 text-center text-xs text-stone-500 mt-3 font-medium">
                                    <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                                    <span>
                                        {paymentMethod === "online"
                                            ? "Secured by Razorpay • Earn 50 Tokens (₹5 Cashback) upon delivery!"
                                            : "Cash on Delivery • Earn 50 Tokens (₹5 Cashback) upon delivery!"}
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

        {/* Mobile Floating Bottom Bar for 1-Tap Checkout */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 sm:px-4 py-2.5 sm:py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] sm:hidden pb-[max(0.6rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom-5 duration-300 w-full max-w-full box-border">
            <div className="flex items-center justify-between gap-2.5 max-w-lg mx-auto w-full min-w-0">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                            To Pay
                        </span>
                        {(appliedDiscount > 0 || (useTokens && tokenDiscount > 0)) && (
                            <span className="text-[10px] font-black bg-green-100 text-green-700 px-1.5 py-0.2 rounded-full whitespace-nowrap">
                                Save ₹{(appliedDiscount + tokenDiscount).toFixed(0)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-lg sm:text-xl font-black text-stone-900 leading-tight">
                            ₹{finalAmountToPay.toFixed(2)}
                        </span>
                        {(appliedDiscount > 0 || (useTokens && tokenDiscount > 0)) && (
                            <span className="text-xs text-stone-400 line-through font-medium">
                                ₹{orderSubtotalWithDelivery.toFixed(0)}
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] text-stone-500 font-medium truncate">
                        {paymentMethod === "online" ? "⚡ UPI Instant" : "💵 Cash on Delivery"}
                    </p>
                </div>

                <Button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black px-4 sm:px-5 py-4 sm:py-5 rounded-xl sm:rounded-2xl shadow-lg shadow-orange-600/25 shrink-0 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all"
                >
                    {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Wait...</>
                    ) : paymentMethod === "online" ? (
                        <><Zap className="w-4 h-4 fill-current shrink-0" /> Pay ₹{finalAmountToPay.toFixed(0)}</>
                    ) : (
                        orderDetails.isSubscription ? "Subscribe" : "Place Order"
                    )}
                </Button>
            </div>
        </div>

        {/* Zomato-style Offers & Coupons Modal */}
        <Dialog open={isOffersModalOpen} onOpenChange={setIsOffersModalOpen}>
            <DialogContent className="w-[94vw] sm:max-w-md mx-auto p-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-200 shadow-2xl bg-white max-h-[85vh] flex flex-col box-border max-w-full">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-3.5 sm:p-5 border-b border-orange-100/80 w-full max-w-full box-border">
                        <DialogTitle className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                            <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 shrink-0" />
                            <span>Coupons & Offers</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-500 mt-0.5">
                            Select an offer below or enter a custom coupon code
                        </DialogDescription>
                    </div>

                    {/* Scrollable Body */}
                    <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1 w-full max-w-full box-border">
                        {/* Manual Coupon Input Box */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                                Enter Coupon Code
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="e.g. FIRST20, THALI30"
                                    value={manualCouponInput}
                                    onChange={(e) => setManualCouponInput(e.target.value.toUpperCase())}
                                    disabled={isApplyingCoupon}
                                    className="uppercase font-extrabold tracking-wide text-xs sm:text-sm bg-stone-50 border-stone-200 focus:bg-white h-10 sm:h-11 rounded-xl"
                                />
                                <Button
                                    type="button"
                                    onClick={() => handleApplySpecificCoupon(manualCouponInput)}
                                    disabled={!manualCouponInput.trim() || isApplyingCoupon}
                                    className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold px-4 sm:px-5 h-10 sm:h-11 rounded-xl shrink-0 cursor-pointer shadow-2xs text-xs sm:text-sm"
                                >
                                    {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                                </Button>
                            </div>
                        </div>

                        {/* Tommalu Tokens Option */}
                        <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/70 flex items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                                    <Coins className="w-5 h-5 text-amber-700" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className="text-xs font-black text-amber-950">Tommalu Tokens</p>
                                        <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.2 rounded">
                                            10 Tokens = ₹1
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-amber-800 font-medium">
                                        Balance: {availableTokens} tokens (Save up to ₹{(availableTokens / 10).toFixed(2)})
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant={useTokens ? "destructive" : "outline"}
                                disabled={availableTokens <= 0 || appliedDiscount > 0}
                                onClick={() => {
                                    if (useTokens) {
                                        setUseTokens(false);
                                        toast.info("Tokens removed");
                                    } else {
                                        setUseTokens(true);
                                        setCouponCode("");
                                        setAppliedDiscount(0);
                                        setIsOffersModalOpen(false);
                                        toast.success("Tokens applied to your order!");
                                    }
                                }}
                                className={`text-xs font-bold shrink-0 h-8 px-3 cursor-pointer ${!useTokens ? "border-amber-400 text-amber-900 hover:bg-amber-100" : ""
                                    }`}
                            >
                                {useTokens ? "Remove" : "Redeem"}
                            </Button>
                        </div>
                        {appliedDiscount > 0 && (
                            <p className="text-[10px] text-stone-500 italic px-1">
                                * Tokens cannot be used simultaneously with coupons.
                            </p>
                        )}

                        {/* Curated Offers List */}
                        <div className="space-y-3 pt-2">
                            <Label className="text-xs font-extrabold text-stone-400 uppercase tracking-wider block">
                                Available Offers
                            </Label>

                            {availableOffersList.map((offer) => {
                                const isCurrent = couponCode === offer.code && appliedDiscount > 0;
                                return (
                                    <div
                                        key={offer.code}
                                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 shadow-2xs ${isCurrent
                                            ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300"
                                            : offer.isEligible
                                                ? "bg-white border-stone-200 hover:border-orange-300"
                                                : "bg-stone-50/70 border-stone-200 opacity-75"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-orange-100 text-orange-900 border border-orange-200 uppercase tracking-wide">
                                                        {offer.code}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-emerald-700">
                                                        {offer.badge}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-stone-900 mt-1">
                                                    {offer.title}
                                                </p>
                                                <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                                                    {offer.desc}
                                                </p>
                                            </div>

                                            <div className="shrink-0 pt-0.5">
                                                {isCurrent ? (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={handleRemoveDiscount}
                                                        className="text-xs font-bold h-7 px-3 cursor-pointer"
                                                    >
                                                        Remove
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        disabled={!offer.isEligible || isApplyingCoupon}
                                                        onClick={() => handleApplySpecificCoupon(offer.code)}
                                                        className={`text-xs font-black h-7 px-3.5 cursor-pointer ${offer.isEligible
                                                            ? "bg-orange-600 hover:bg-orange-700 text-white shadow-2xs"
                                                            : "bg-stone-200 text-stone-400 cursor-not-allowed"
                                                            }`}
                                                    >
                                                        APPLY
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {!offer.isEligible && (
                                            <div className="pt-2 border-t border-stone-200/60 flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold">
                                                <span>⚠️</span>
                                                <span>{offer.ineligibleHint}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
