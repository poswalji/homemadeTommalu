"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
    Calendar, ShieldCheck, Leaf, Flame, Minus, Plus, 
    CheckCircle2, Share2, Sun, Moon, Utensils, Sparkles, 
    ShoppingCart, ArrowRight, Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHomemade, ThaliOption } from "@/context/homemade-context";
import { useApp } from "@/context/app-context";
import { useAuthMe } from "@/hooks/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { generateMenuShareText } from "@/utils/menuShare";
import { toast } from "sonner";
import { ThaliCustomizerModal, CustomizerThali } from "@/components/modals/thali-customizer-modal";

export function HomemadeSection() {
    const router = useRouter();
    const { state } = useHomemade();
    const { addToCart } = useApp();
    const { data: authData } = useAuthMe();

    // Time & Delivery Fee status in IST
    const istDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const totalMinutes = istDate.getHours() * 60 + istDate.getMinutes();
    const isLunchLate = totalMinutes >= 13 * 60; // After 1:00 PM
    const isDinnerLate = totalMinutes >= 21 * 60; // After 9:00 PM
    const lunchDeliveryFee = isLunchLate ? 30 : 0;
    const dinnerDeliveryFee = isDinnerLate ? 30 : 0;

    // Auto-detect initial slot: After 3:00 PM (15:00) default to Dinner
    const [selectedSlot, setSelectedSlot] = useState<"Lunch" | "Dinner">(() => {
        if (typeof window !== 'undefined') {
            const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const mins = now.getHours() * 60 + now.getMinutes();
            if (mins >= 15 * 60) return "Dinner";
        }
        return "Lunch";
    });

    // Auto-sync slot when availability or time updates
    useEffect(() => {
        if (!state.lunchSlotAvailable && state.dinnerSlotAvailable) {
            setSelectedSlot("Dinner");
        } else if (state.lunchSlotAvailable && !state.dinnerSlotAvailable) {
            setSelectedSlot("Lunch");
        } else if (totalMinutes >= 15 * 60) {
            setSelectedSlot("Dinner");
        }
    }, [state.lunchSlotAvailable, state.dinnerSlotAvailable, totalMinutes]);

    // Active Thali selection
    const [selectedThaliId, setSelectedThaliId] = useState<"regular" | "desiSpecial" | "paneerSpecial">("regular");

    // Per-card configuration (Quantity & Extra Roti)
    const [thaliConfig, setThaliConfig] = useState<Record<string, { quantity: number; extraRoti: number }>>({
        regular: { quantity: 1, extraRoti: 0 },
        desiSpecial: { quantity: 1, extraRoti: 0 },
        paneerSpecial: { quantity: 1, extraRoti: 0 },
    });

    // Swiggy/Zomato style instant customizer modal state
    const [customizerOpen, setCustomizerOpen] = useState(false);
    const [customizingThali, setCustomizingThali] = useState<CustomizerThali | null>(null);

    const openCustomizer = (thali: CustomizerThali) => {
        setSelectedThaliId(thali.id);
        setCustomizingThali(thali);
        setCustomizerOpen(true);
    };

    const updateThaliQty = (thaliId: string, delta: number) => {
        setThaliConfig(prev => {
            const curr = prev[thaliId] || { quantity: 1, extraRoti: 0 };
            const newQty = Math.max(1, curr.quantity + delta);
            return { ...prev, [thaliId]: { ...curr, quantity: newQty } };
        });
    };

    const updateThaliExtraRoti = (thaliId: string, delta: number) => {
        setThaliConfig(prev => {
            const curr = prev[thaliId] || { quantity: 1, extraRoti: 0 };
            const newRoti = Math.max(0, curr.extraRoti + delta);
            return { ...prev, [thaliId]: { ...curr, extraRoti: newRoti } };
        });
    };

    const searchParams = useSearchParams();
    const refCode = searchParams ? searchParams.get('ref') : null;
    if (typeof window !== 'undefined' && refCode) {
        localStorage.setItem('referralCode', refCode);
    }

    const selectedSlotDeliveryFee = selectedSlot === 'Lunch' ? lunchDeliveryFee : dinnerDeliveryFee;
    const isSlotOpen = selectedSlot === 'Lunch' ? state.lunchSlotAvailable : state.dinnerSlotAvailable;
    const isSlotLate = selectedSlot === 'Lunch' ? isLunchLate : isDinnerLate;

    const activeSabji = selectedSlot === 'Lunch' 
        ? (state.lunchSabji || "Seasonal Sabji") 
        : (state.dinnerSabji || "Seasonal Sabji");
    const activePaneerSabji = state.paneerSabji || "Paneer Butter Masala";

    // Build the 3 thali definitions with real-time ingredients & pricing
    const regularThaliPrice = (state.isSunday && selectedSlot === 'Dinner') 
        ? (state.price || 120) 
        : (state.thalis?.regular?.price || 99);
    const desiThaliPrice = state.thalis?.desiSpecial?.price || 119;
    const paneerThaliPrice = state.thalis?.paneerSpecial?.price || 199;

    // Format Accompaniments from State / Admin
    const getThaliItems = (thaliType: 'regular' | 'desiSpecial' | 'paneerSpecial', defaultItems: string[]) => {
        const savedItems = state.thalis?.[thaliType]?.items;
        if (Array.isArray(savedItems) && savedItems.length > 0) {
            return savedItems;
        }
        return defaultItems;
    };

    const regularSavedItems = getThaliItems('regular', ["4 Roti, Dal", "Rice", "Salad"]);
    const regularIngredients = regularSavedItems.some(i => i.toLowerCase().includes('sabji'))
        ? regularSavedItems.map(i => i.toLowerCase().includes('sabji') && !i.includes('(') ? `${i} (${activeSabji})` : i)
        : [`1 Seasonal Sabji (${activeSabji})`, ...regularSavedItems];

    const desiSavedItems = getThaliItems('desiSpecial', ["Dal", "6 Ghee Roti / Chawal", "Boondi Raita", "Lahsun Chutney", "Salad"]);
    const desiIngredients = desiSavedItems.some(i => i.toLowerCase().includes('sabji'))
        ? desiSavedItems.map(i => i.toLowerCase().includes('sabji') && !i.includes('(') ? `${i} (${activeSabji})` : i)
        : [`1 Seasonal Sabji (${activeSabji})`, ...desiSavedItems];

    const paneerSavedItems = getThaliItems('paneerSpecial', ["Dal", "4 Ghee Roti", "Jeera Rice", "Boondi Raita", "Salad", "1 Gulab Jamun"]);
    const paneerIngredients = paneerSavedItems.some(i => i.toLowerCase().includes('paneer') || i.toLowerCase().includes('sabji'))
        ? paneerSavedItems.map(i => (i.toLowerCase().includes('paneer') || i.toLowerCase().includes('sabji')) && !i.includes('(') ? `${i} (${activePaneerSabji})` : i)
        : [`1 Paneer Sabji (${activePaneerSabji})`, ...paneerSavedItems];

    const thaliOptions = [
        {
            id: "regular" as const,
            name: "Regular Thali",
            price: regularThaliPrice,
            isAvailable: state.thalis?.regular?.isAvailable !== false,
            badge: "Everyday Value",
            badgeColor: "bg-stone-100 text-stone-700 border-stone-200",
            themeBorder: "border-stone-200 hover:border-orange-300",
            activeBorder: "border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/20",
            tagline: "Homely, balanced daily meal",
            image: state.thalis?.regular?.image || "/thali-regular.jpg",
            ingredients: regularIngredients
        },
        {
            id: "desiSpecial" as const,
            name: "Desi Special Thali",
            price: desiThaliPrice,
            isAvailable: state.thalis?.desiSpecial?.isAvailable !== false,
            badge: "Desi Ghee & Raita",
            badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
            themeBorder: "border-amber-200 hover:border-amber-400",
            activeBorder: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/30",
            tagline: "Rich aroma with Desi Ghee Roti & Chutney",
            image: state.thalis?.desiSpecial?.image || "/thali-desi.jpg",
            ingredients: desiIngredients
        },
        {
            id: "paneerSpecial" as const,
            name: "Paneer Special Thali",
            price: paneerThaliPrice,
            isAvailable: state.thalis?.paneerSpecial?.isAvailable !== false,
            badge: "Royal Paneer Feast",
            badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
            themeBorder: "border-purple-200 hover:border-purple-400",
            activeBorder: "border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/30",
            tagline: "Premium paneer feast with Gulab Jamun",
            image: state.thalis?.paneerSpecial?.image || "/thali-paneer.jpg",
            ingredients: paneerIngredients
        }
    ];

    const currentThali = thaliOptions.find(t => t.id === selectedThaliId) || thaliOptions[0];
    const currentCfg = thaliConfig[currentThali.id] || { quantity: 1, extraRoti: 0 };
    const currentEffectiveExtraRoti = (state.isSunday && selectedSlot === 'Dinner') ? 0 : currentCfg.extraRoti;
    const currentItemsTotal = (currentThali.price * currentCfg.quantity) + ((state.extraRotiPrice || 10) * currentEffectiveExtraRoti);
    const currentTotalWithDelivery = currentItemsTotal + selectedSlotDeliveryFee;

    // Handle Direct Order Checkout from Customizer Modal
    const handleCustomizedOrderNow = (thali: CustomizerThali, qty: number, extraRoti: number) => {
        if (!authData?.user) {
            router.push(`/login?redirect=/homemade`);
            return;
        }

        if (!isSlotOpen) {
            toast.error(`${selectedSlot} slot is currently closed`);
            return;
        }

        if (!thali.isAvailable) {
            toast.error(`${thali.name} is currently out of stock`);
            return;
        }

        const totalItemsAmount = (thali.price * qty) + ((state.extraRotiPrice || 10) * extraRoti);
        const finalTotalPrice = totalItemsAmount + selectedSlotDeliveryFee;

        // Keep local state in sync
        setThaliConfig(prev => ({
            ...prev,
            [thali.id]: { quantity: qty, extraRoti }
        }));

        const orderDetails = {
            date: new Date().toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }),
            slot: selectedSlot,
            thaliType: thali.id,
            thaliName: thali.name,
            unitPrice: thali.price,
            quantity: qty,
            extraRotiCount: extraRoti,
            itemsTotal: totalItemsAmount,
            deliveryCharge: selectedSlotDeliveryFee,
            totalPrice: finalTotalPrice,
            items: [
                ...thali.ingredients,
                extraRoti > 0 ? `Extra Roti x${extraRoti}` : null
            ].filter(Boolean) as string[],
            isSubscription: false,
        };

        sessionStorage.setItem("checkoutOrderDetails", JSON.stringify(orderDetails));
        router.push("/checkout");
    };

    // Handle Add to Cart from Direct Card / Bottom bar
    const handleCustomizedAddToCart = (thali: CustomizerThali, qty: number, extraRoti: number) => {
        const extraRotiPriceUnit = state.extraRotiPrice || 10;
        const unitItemPrice = thali.price + (extraRoti * extraRotiPriceUnit);
        const rotiLabel = extraRoti > 0 ? ` (+${extraRoti} Extra Roti)` : "";

        // Keep local state in sync
        setThaliConfig(prev => ({
            ...prev,
            [thali.id]: { quantity: qty, extraRoti }
        }));

        for (let i = 0; i < qty; i++) {
            addToCart({
                id: `thali-${thali.id}-${selectedSlot.toLowerCase()}${extraRoti > 0 ? `-r${extraRoti}` : ""}`,
                name: `${thali.name}${rotiLabel} (${selectedSlot})`,
                price: unitItemPrice,
                image: thali.image || "/thali-regular.jpg"
            });
        }

        toast.success(`Added ${qty > 1 ? `${qty}x ` : ""}${thali.name}${rotiLabel} to cart!`);
    };

    // Direct Action Trigger: Directly checkout or add to cart without opening modal
    const handleOrderNow = (thali = currentThali) => {
        const cfg = thaliConfig[thali.id] || { quantity: 1, extraRoti: 0 };
        const effectiveExtraRoti = (state.isSunday && selectedSlot === 'Dinner') ? 0 : cfg.extraRoti;
        handleCustomizedOrderNow(thali as CustomizerThali, cfg.quantity, effectiveExtraRoti);
    };

    const handleAddToCart = (thali: typeof currentThali) => {
        const cfg = thaliConfig[thali.id] || { quantity: 1, extraRoti: 0 };
        const effectiveExtraRoti = (state.isSunday && selectedSlot === 'Dinner') ? 0 : cfg.extraRoti;
        handleCustomizedAddToCart(thali as CustomizerThali, cfg.quantity, effectiveExtraRoti);
    };

    const formattedDate = state.menuDate ? format(new Date(state.menuDate), 'EEEE, MMM do') : "Today's Menu";

    return (
        <div className="w-full max-w-5xl mx-auto px-2.5 sm:px-4 overflow-hidden box-border">
            {/* Header: Compact, clean, top badge row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50 px-2.5 py-0.5 text-xs font-semibold">
                            Authentic Home Kitchen
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs font-semibold">Pure Veg</Badge>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs font-semibold">Desi Ghee</Badge>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
                        Tommalu <span className="text-orange-600">Homemade Thali Menu</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium">
                        Freshly cooked in authentic desi ghee. Add extra rotis directly on your favorite thali!
                    </p>
                </div>

                {/* Right side: Date badge & Share Button */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs font-bold text-stone-600 bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-stone-200 shadow-2xs">
                        <Calendar className="w-3.5 h-3.5 text-orange-600" />
                        {formattedDate}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-stone-600 hover:text-orange-600 hover:bg-orange-50 h-8 px-2.5 text-xs gap-1 cursor-pointer"
                        onClick={async () => {
                            const shareText = generateMenuShareText({
                                date: state.menuDate || new Date(),
                                lunchSabji: state.lunchSabji || "Seasonal Sabji",
                                lunchItems: state.lunchItems,
                                dinnerSabji: state.dinnerSabji || "Seasonal Sabji",
                                dinnerItems: state.dinnerItems,
                                lunchPrice: regularThaliPrice,
                                dinnerPrice: state.isSunday ? 120 : regularThaliPrice,
                                isSunday: state.isSunday,
                                sundayItem: state.sundayItem
                            });
                            try {
                                if (navigator.share) {
                                    await navigator.share({ title: 'Tommalu Daily Menu', text: shareText });
                                } else {
                                    await navigator.clipboard.writeText(shareText);
                                    toast.success("Menu copied to clipboard!");
                                }
                            } catch (err) {
                                console.error("Share failed:", err);
                            }
                        }}
                    >
                        <Share2 className="w-3.5 h-3.5" /> Share
                    </Button>
                </div>
            </div>

            {/* Service Off Notice */}
            {state.isServiceOff ? (
                <div className="bg-orange-50 p-6 sm:p-8 rounded-3xl border border-orange-200 text-center shadow-sm">
                    <div className="inline-flex bg-white p-3 rounded-full mb-3 shadow-xs border border-orange-100">
                        <Utensils className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-black text-stone-800 mb-1">Hum abhi next batch prepare kar rahe hain</h3>
                    <p className="text-stone-600 text-sm font-medium">
                        Best quality maintain karne ke liye thoda break lete hain 🙏
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/60 border border-stone-200/80 overflow-hidden">
                    
                    {/* 1. Meal Switcher Tabs: Large, intuitive, 1-tap switch */}
                    <div className="p-2 sm:p-3 bg-stone-100/80 border-b border-stone-200 grid grid-cols-2 gap-2">
                        {/* Lunch Tab */}
                        <button
                            type="button"
                            onClick={() => setSelectedSlot("Lunch")}
                            className={`p-3 sm:p-3.5 rounded-2xl flex items-center text-left transition-all cursor-pointer relative ${
                                selectedSlot === "Lunch"
                                    ? "bg-white text-orange-950 shadow-md ring-2 ring-orange-500 font-bold"
                                    : "bg-white/50 hover:bg-white text-stone-600 font-medium"
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-xl shrink-0 ${selectedSlot === "Lunch" ? "bg-orange-500 text-white shadow-sm" : "bg-stone-200 text-stone-500"}`}>
                                    <Sun className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-sm sm:text-base font-black">Lunch</span>
                                        {state.lunchSlotAvailable ? (
                                            <span className="text-[10px] bg-green-100 text-green-700 font-extrabold px-1.5 py-0.2 rounded">Open</span>
                                        ) : (
                                            <span className="text-[10px] bg-red-100 text-red-600 font-semibold px-1.5 py-0.2 rounded">Closed</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-stone-500 font-medium">11:30 AM–2:00 PM</p>
                                </div>
                            </div>
                        </button>

                        {/* Dinner Tab */}
                        <button
                            type="button"
                            onClick={() => setSelectedSlot("Dinner")}
                            className={`p-3 sm:p-3.5 rounded-2xl flex items-center text-left transition-all cursor-pointer relative ${
                                selectedSlot === "Dinner"
                                    ? "bg-white text-indigo-950 shadow-md ring-2 ring-indigo-500 font-bold"
                                    : "bg-white/50 hover:bg-white text-stone-600 font-medium"
                            }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-xl shrink-0 ${selectedSlot === "Dinner" ? "bg-indigo-600 text-white shadow-sm" : "bg-stone-200 text-stone-500"}`}>
                                    <Moon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-sm sm:text-base font-black">Dinner</span>
                                        {state.dinnerSlotAvailable ? (
                                            <span className="text-[10px] bg-green-100 text-green-700 font-extrabold px-1.5 py-0.2 rounded">Open</span>
                                        ) : (
                                            <span className="text-[10px] bg-red-100 text-red-600 font-semibold px-1.5 py-0.2 rounded">Closed</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-stone-500 font-medium">7:30–10:00 PM</p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Today's Special Sabji Banner */}
                    <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-xs sm:text-sm">
                            <span className="font-bold text-stone-500 uppercase tracking-wide text-[11px]">
                                {selectedSlot} Sabji:
                            </span>
                            <span className="font-extrabold text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded-md">
                                🍲 {activeSabji}
                            </span>
                            <span className="font-extrabold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                                🧀 {activePaneerSabji}
                            </span>
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${isSlotLate ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                            {isSlotLate ? "+₹30 Late Delivery" : "✓ Free Delivery"}
                        </span>
                    </div>

                    {/* 2. THREE THALI OPTIONS DISPLAY */}
                    <div className="p-4 sm:p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
                                <Utensils className="w-4 h-4 text-orange-600" />
                                Select Your Thali
                            </h3>
                            <p className="text-xs text-stone-500">
                                Select plates and extra rotis right inside each card, or order directly with 1 tap.
                            </p>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
                            {thaliOptions.map((thali) => {
                                const isSelected = selectedThaliId === thali.id;
                                const cfg = thaliConfig[thali.id] || { quantity: 1, extraRoti: 0 };
                                const isSundayDinner = state.isSunday && selectedSlot === 'Dinner';
                                const effectiveExtraRoti = isSundayDinner ? 0 : cfg.extraRoti;
                                const cardItemTotal = (thali.price * cfg.quantity) + ((state.extraRotiPrice || 10) * effectiveExtraRoti);

                                return (
                                    <div
                                        key={thali.id}
                                        onClick={() => setSelectedThaliId(thali.id)}
                                        className={`rounded-2xl border-2 p-4 sm:p-5 flex flex-col justify-between transition-all cursor-pointer relative shadow-sm hover:shadow-md ${
                                            isSelected 
                                                ? thali.activeBorder 
                                                : `${thali.themeBorder} bg-white`
                                        } ${!thali.isAvailable ? "opacity-60 grayscale cursor-not-allowed" : ""}`}
                                    >
                                        <div>
                                            {/* Top Row: Badge + Radio Checkmark */}
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${thali.badgeColor}`}>
                                                    {thali.badge}
                                                </span>
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                                    isSelected 
                                                        ? "bg-orange-600 border-orange-600 text-white" 
                                                        : "border-stone-300 bg-white"
                                                }`}>
                                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                            </div>

                                            {/* Real Thali Plate Dish Photo in empty space */}
                                            <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden mb-3.5 bg-stone-100 group/img shadow-inner border border-stone-200/80">
                                                <Image
                                                    src={thali.image}
                                                    alt={thali.name}
                                                    fill
                                                    unoptimized
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                    className="object-cover group-hover/img:scale-105 transition-transform duration-500"
                                                    priority={thali.id === 'regular'}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                                                
                                                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px] font-bold">
                                                    <span className="bg-black/65 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/20 truncate max-w-[70%]">
                                                        {thali.id === 'paneerSpecial' ? `🧀 ${activePaneerSabji}` : `🍲 ${activeSabji}`}
                                                    </span>
                                                    <span className="bg-orange-600/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                                                        Real Plate
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Thali Title & Price */}
                                            <div className="mb-3">
                                                <h4 className="text-lg sm:text-xl font-black text-stone-900">
                                                    {thali.name}
                                                </h4>
                                                <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-2xl sm:text-3xl font-black text-orange-600">
                                                            ₹{thali.price}
                                                        </span>
                                                        <span className="text-xs text-stone-400 font-medium">/plate</span>
                                                    </div>

                                                    {/* Extra Thali / Plates Counter (99/plate ke side me) */}
                                                    <div 
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex items-center gap-1.5 bg-stone-100/90 rounded-xl p-1 border border-stone-200/90 shadow-2xs"
                                                    >
                                                        <button
                                                            type="button"
                                                            disabled={cfg.quantity <= 1}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedThaliId(thali.id);
                                                                updateThaliQty(thali.id, -1);
                                                            }}
                                                            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                                                                cfg.quantity > 1
                                                                    ? "bg-white hover:bg-stone-200 text-stone-800 shadow-2xs cursor-pointer active:scale-95"
                                                                    : "text-stone-300 cursor-not-allowed"
                                                            }`}
                                                            aria-label="Decrease thali plates"
                                                        >
                                                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                                                        </button>
                                                        <span className="font-black text-stone-900 min-w-10 text-center text-xs px-1">
                                                            {cfg.quantity} {cfg.quantity === 1 ? 'Plate' : 'Plates'}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedThaliId(thali.id);
                                                                updateThaliQty(thali.id, 1);
                                                            }}
                                                            className="w-7 h-7 flex items-center justify-center bg-stone-900 hover:bg-black text-white rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95"
                                                            aria-label="Increase thali plates"
                                                        >
                                                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-stone-500 mt-1 leading-tight">
                                                    {thali.tagline}
                                                </p>
                                            </div>

                                            {/* Divider */}
                                            <div className="border-t border-stone-100 my-3" />

                                            {/* Ingredients List */}
                                            <div className="space-y-1.5 mb-3">
                                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                                                    Items in Plate:
                                                </p>
                                                {thali.ingredients.map((item, idx) => (
                                                    <div key={idx} className="flex items-start gap-1.5 text-xs text-stone-700">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                                        <span className="font-medium leading-snug">{item}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* 🫓 Direct Extra Roti Controls (Inline, no popup modal) */}
                                            {!isSundayDinner && (
                                                <div 
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="my-3 p-2.5 sm:p-3 bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 rounded-2xl border border-amber-300/80 flex items-center justify-between gap-2 shadow-2xs"
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-xl sm:text-2xl select-none shrink-0">🫓</span>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className="text-xs font-black text-amber-950">
                                                                    Extra Desi Ghee Roti
                                                                </span>
                                                                <span className="text-[10px] font-bold text-amber-800 bg-amber-200/90 px-1.5 py-0.5 rounded-md shrink-0">
                                                                    +₹{state.extraRotiPrice || 10}/ea
                                                                </span>
                                                            </div>
                                                            {cfg.extraRoti > 0 ? (
                                                                <p className="text-[11px] text-amber-900 font-bold mt-0.5 truncate">
                                                                    ✓ {cfg.extraRoti} Extra Roti added (+₹{cfg.extraRoti * (state.extraRotiPrice || 10)})
                                                                </p>
                                                            ) : (
                                                                <p className="text-[10px] text-stone-500 font-medium mt-0.5 truncate">
                                                                    Tawa fresh in pure desi ghee
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Inline Direct Roti Counter [-] [count] [+] */}
                                                    <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 border border-amber-300 shadow-2xs shrink-0">
                                                        <button
                                                            type="button"
                                                            disabled={cfg.extraRoti <= 0}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedThaliId(thali.id);
                                                                updateThaliExtraRoti(thali.id, -1);
                                                            }}
                                                            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                                                                cfg.extraRoti > 0
                                                                    ? "bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer active:scale-95"
                                                                    : "text-stone-300 cursor-not-allowed"
                                                            }`}
                                                            aria-label="Decrease extra roti"
                                                        >
                                                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                                                        </button>
                                                        <span className="font-extrabold text-stone-900 w-5 text-center text-xs">
                                                            {cfg.extraRoti}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedThaliId(thali.id);
                                                                updateThaliExtraRoti(thali.id, 1);
                                                            }}
                                                            className="w-7 h-7 flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95"
                                                            aria-label="Increase extra roti"
                                                        >
                                                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Actions: Direct Add to Cart & Direct Order */}
                                        <div className="pt-2 border-t border-stone-100/80 flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={!thali.isAvailable || !isSlotOpen}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedThaliId(thali.id);
                                                    handleAddToCart(thali);
                                                }}
                                                className="w-1/2 text-xs font-bold text-stone-700 border-stone-200 hover:bg-stone-50 cursor-pointer"
                                            >
                                                <ShoppingCart className="w-3.5 h-3.5 mr-1 text-orange-600" />
                                                Add to Cart
                                            </Button>

                                            <Button
                                                type="button"
                                                size="sm"
                                                disabled={!thali.isAvailable || !isSlotOpen}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedThaliId(thali.id);
                                                    handleOrderNow(thali);
                                                }}
                                                className={`w-1/2 text-xs font-bold text-white cursor-pointer ${
                                                    isSelected ? "bg-orange-600 hover:bg-orange-700 shadow-sm" : "bg-stone-800 hover:bg-stone-900"
                                                }`}
                                            >
                                                Order • ₹{cardItemTotal}
                                            </Button>
                                        </div>

                                        {!thali.isAvailable && (
                                            <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs rounded-2xl flex items-center justify-center">
                                                <Badge variant="destructive" className="text-xs font-bold px-3 py-1">
                                                    Currently Unavailable
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* 3. STICKY FLOATING QUICK ORDER BAR */}
                        <div className="sticky bottom-3 z-30 mt-6 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-stone-300 shadow-xl shadow-stone-900/10 transition-all">
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                                
                                {/* Selected Thali Info */}
                                <div className="w-full lg:w-auto">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                                        Selected: {currentThali.name}
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-base sm:text-lg font-black text-stone-900">
                                            ₹{currentItemsTotal}
                                        </span>
                                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 font-bold text-xs">
                                            {currentCfg.quantity} Plate{currentCfg.quantity > 1 ? "s" : ""}
                                            {currentEffectiveExtraRoti > 0 ? ` + ${currentEffectiveExtraRoti} Extra Roti` : ""}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                                        Slot: <strong>{selectedSlot}</strong> (Delivery: {selectedSlot === "Lunch" ? "11:30 AM–2:00 PM" : "7:30–10:00 PM"})
                                    </p>
                                </div>

                                {/* Controls: Quantity & Extra Roti for currently selected thali */}
                                <div className="w-full lg:w-auto flex items-center justify-between sm:justify-start gap-4">
                                    {/* Quantity */}
                                    <div>
                                        <label className="text-[11px] font-bold text-stone-400 uppercase block mb-1">
                                            Quantity
                                        </label>
                                        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-stone-200 shadow-2xs">
                                            <button
                                                type="button"
                                                onClick={() => updateThaliQty(currentThali.id, -1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Minus className="w-4 h-4 text-stone-600" />
                                            </button>
                                            <span className="font-extrabold text-stone-900 w-6 text-center text-sm">
                                                {currentCfg.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateThaliQty(currentThali.id, 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Plus className="w-4 h-4 text-stone-600" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Extra Roti */}
                                    {(!state.isSunday || selectedSlot === "Lunch") && (
                                        <div>
                                            <label className="text-[11px] font-bold text-stone-400 uppercase block mb-1">
                                                Extra Roti (+₹10)
                                            </label>
                                            <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-stone-200 shadow-2xs">
                                                <button
                                                    type="button"
                                                    onClick={() => updateThaliExtraRoti(currentThali.id, -1)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Minus className="w-4 h-4 text-stone-600" />
                                                </button>
                                                <span className="font-extrabold text-stone-900 w-6 text-center text-sm">
                                                    {currentCfg.extraRoti}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateThaliExtraRoti(currentThali.id, 1)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Plus className="w-4 h-4 text-stone-600" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Order & Add to Cart Action Buttons */}
                                <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        disabled={!isSlotOpen || !currentThali.isAvailable}
                                        onClick={() => handleAddToCart(currentThali)}
                                        className="w-full sm:w-auto px-5 py-6 text-sm font-bold border-stone-300 hover:bg-white text-stone-700 rounded-xl cursor-pointer shadow-2xs"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-1.5" />
                                        Add to Cart
                                    </Button>

                                    <Button
                                        size="lg"
                                        onClick={() => handleOrderNow(currentThali)}
                                        disabled={!isSlotOpen || !currentThali.isAvailable}
                                        className={`w-full sm:w-auto px-8 py-6 text-base font-bold text-white rounded-xl shadow-lg transition-all cursor-pointer ${
                                            !isSlotOpen || !currentThali.isAvailable
                                                ? "bg-stone-300 text-stone-500 cursor-not-allowed shadow-none"
                                                : selectedSlot === "Lunch"
                                                    ? "bg-orange-600 hover:bg-orange-700 shadow-orange-600/30"
                                                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30"
                                        }`}
                                    >
                                        {!isSlotOpen
                                            ? `${selectedSlot} Closed for Today`
                                            : `Order Now • ₹${currentTotalWithDelivery}`}
                                    </Button>
                                </div>
                            </div>

                            {selectedSlotDeliveryFee > 0 && isSlotOpen && (
                                <p className="text-[11px] text-amber-600 font-semibold text-center lg:text-right mt-2">
                                    * Includes ₹30 late delivery fee for {selectedSlot}
                                </p>
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* Compact Trust Badges below */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-6">
                {[
                    { icon: Flame, label: "Freshly Made", text: "Every Meal" },
                    { icon: ShieldCheck, label: "FSSAI Registered", text: "Lic #22226043000221" },
                    { icon: Leaf, label: "Pure Veg", text: "Home Kitchen" },
                    { icon: Utensils, label: "Desi Ghee", text: "Pure Ingredients" },
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-white/70 rounded-xl border border-stone-200/60 shadow-2xs">
                        <item.icon className="w-4 h-4 text-orange-600 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-stone-800 truncate">{item.label}</p>
                            <p className="text-[10px] text-stone-500 truncate">{item.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Zomato/Swiggy Style Customizer Modal */}
            <ThaliCustomizerModal
                isOpen={customizerOpen}
                onClose={() => setCustomizerOpen(false)}
                thali={customizingThali}
                selectedSlot={selectedSlot}
                isSunday={!!state.isSunday}
                extraRotiPrice={state.extraRotiPrice || 10}
                initialQuantity={customizingThali ? (thaliConfig[customizingThali.id]?.quantity || 1) : 1}
                initialExtraRoti={customizingThali ? (thaliConfig[customizingThali.id]?.extraRoti || 0) : 0}
                isSlotLate={isSlotLate}
                onAddToCart={handleCustomizedAddToCart}
                onOrderNow={handleCustomizedOrderNow}
            />
        </div>
    );
}
