"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ShieldCheck, Leaf, Flame, Minus, Plus, CheckCircle2, Share2, Sun, Moon, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHomemade } from "@/context/homemade-context";
import { useAuthMe } from "@/hooks/api";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useSubscriptionPlans } from "@/hooks/api/use-homemade-food";
import { format } from "date-fns";
import { generateMenuShareText } from "@/utils/menuShare";
import { toast } from "sonner";

export function HomemadeSection() {
    const router = useRouter();
    const { state } = useHomemade();
    const { data: authData } = useAuthMe();

    // Fetch Active Plans
    const { data: plansData, isLoading: plansLoading } = useSubscriptionPlans();
    const plans = plansData?.data || [];

    const [selectedSlot, setSelectedSlot] = useState<"Lunch" | "Dinner">("Lunch");
    const [quantity, setQuantity] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("one-time");
    const [extraRotiCount, setExtraRotiCount] = useState(0);

    // State for selected subscription plan
    const [selectedPlan, setSelectedPlan] = useState<any>(null);

    const handleOrderClick = (plan?: any, slotOverride?: "Lunch" | "Dinner") => {
        if (!authData?.user) {
            router.push(`/login?redirect=/homemade`);
            return;
        }

        const finalSlot = slotOverride || selectedSlot;
        const currentPrice = state.isSunday ? (finalSlot === 'Lunch' ? 99 : 120) : state.price;
        const finalTotalPrice = (currentPrice * quantity) + ((state.extraRotiPrice || 10) * extraRotiCount);

        const orderDetails = {
            date: new Date().toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }),
            slot: finalSlot,
            quantity: quantity,
            totalPrice: activeTab === 'one-time' ? finalTotalPrice : (plan?.price || 0),
            items: activeTab === 'one-time' ? [
                finalSlot === 'Lunch' ? state.lunchSabji : state.dinnerSabji,
                ...(finalSlot === 'Lunch' ? state.lunchItems : state.dinnerItems),
                extraRotiCount > 0 ? `Extra Roti x${extraRotiCount}` : null
            ].filter(Boolean) as string[] : [plan?.title],
            isSubscription: activeTab === 'subscription',
            planName: activeTab === 'subscription' ? plan?.title : undefined,
            planId: activeTab === 'subscription' ? plan?._id : undefined
        };

        sessionStorage.setItem("checkoutOrderDetails", JSON.stringify(orderDetails));
        router.push("/checkout");
    };

    const currentPrice = state.isSunday ? (selectedSlot === 'Lunch' ? 99 : 120) : state.price;
    const totalPrice = (currentPrice * quantity) + ((state.extraRotiPrice || 10) * extraRotiCount);

    const formattedDate = state.menuDate ? format(new Date(state.menuDate), 'EEEE, MMM do') : "Today's Menu";

    return (
        <>
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <Badge variant="outline" className="mb-2 border-orange-200 text-orange-700 bg-orange-50 px-4 py-1 text-sm font-medium tracking-wide">
                        Jaipur's Finest Homemade Food
                    </Badge>
                    <h1 className="text-3xl md:text-5xl font-black text-stone-800 tracking-tight mb-2">
                        Tommalu <span className="text-orange-600">Home Kitchen</span>
                    </h1>
                    <p className="text-stone-500 font-medium">Authentic • Hygienic • Ghar Jaisa Swaad</p>

                    {/* Share Button Mobile/Desktop */}
                    <div className="mt-4 flex justify-center">
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 gap-2"
                            onClick={async () => {
                                const shareText = generateMenuShareText({
                                    date: state.menuDate || new Date(),
                                    lunchSabji: state.lunchSabji || "Lunch Special",
                                    lunchItems: state.lunchItems,
                                    dinnerSabji: state.dinnerSabji || "Dinner Special",
                                    dinnerItems: state.dinnerItems,
                                    lunchPrice: 99,
                                    dinnerPrice: state.isSunday ? 120 : 99,
                                    isSunday: state.isSunday,
                                    sundayItem: state.sundayItem
                                });

                                try {
                                    if (navigator.share) {
                                        await navigator.share({
                                            title: 'Tommalu Daily Menu',
                                            text: shareText
                                        });
                                    } else {
                                        await navigator.clipboard.writeText(shareText);
                                        toast.success("Menu copied to clipboard!");
                                    }
                                } catch (err) {
                                    console.error("Share failed:", err);
                                }
                            }}
                        >
                            <Share2 className="w-4 h-4" /> Share Menu
                        </Button>
                    </div>
                </div>

                {/* Main Tabs */}
                <Tabs defaultValue="one-time" className="mb-8" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12 p-1 bg-stone-200/50 rounded-full mb-8">
                        <TabsTrigger value="one-time" className="rounded-full text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all">
                            Daily Menu
                        </TabsTrigger>
                        <TabsTrigger value="subscription" className="rounded-full text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all">
                            Subscription Plans
                        </TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                        <TabsContent value="one-time" key="one-time">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* MENU CARD DESIGN */}
                                <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 overflow-hidden border border-stone-100 max-w-3xl mx-auto relative">

                                        {/* Decorative Header Bar */}
                                        <div className="h-3 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400" />

                                        {/* Menu Header */}
                                        <div className="p-6 md:p-8 border-b border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-stone-50/30">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600">
                                                    <Calendar className="w-6 h-6" />
                                                </div>
                                                <div className="text-left">
                                                    <h2 className="text-xl font-bold text-stone-800 leading-none">{formattedDate}</h2>
                                                    <p className="text-stone-500 text-sm mt-1">Freshly prepared for you</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Pure Veg</Badge>
                                                <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">Desi Ghee</Badge>
                                            </div>
                                        </div>

                                        {/* Menu Content - Split View */}
                                        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100">

                                            {/* LUNCH SECTION */}
                                            <div className="p-6 md:p-8 bg-orange-50/10 hover:bg-orange-50/30 transition-colors relative group">
                                                <div className="absolute top-4 right-4">
                                                    {state.lunchSlotAvailable ? (
                                                        <Badge className="bg-green-500 hover:bg-green-600 border-0">Open</Badge>
                                                    ) : (
                                                        <Badge variant="destructive">Closed</Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 mb-4">
                                                    <Sun className="w-5 h-5 text-orange-500" />
                                                    <h3 className="text-lg font-bold text-stone-800 uppercase tracking-wide">Lunch Menu</h3>
                                                </div>

                                                <div className="min-h-[120px]">
                                                    <h4 className="text-xl font-black text-orange-700 mb-3 leading-tight">
                                                        {state.lunchSabji || "Today's Special Sabji"}
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {state.lunchItems.map((item, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm font-medium text-stone-600">
                                                                <CheckCircle2 className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="mt-6 pt-4 border-t border-dashed border-stone-200 flex items-end justify-between">
                                                    <div>
                                                        <p className="text-xs text-stone-400 font-bold uppercase">Price</p>
                                                        <p className="text-2xl font-bold text-stone-800">₹{state.isSunday ? 99 : state.price}</p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOrderClick(undefined, 'Lunch')}
                                                        className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold px-6"
                                                        disabled={!state.lunchSlotAvailable}
                                                    >
                                                        Order Lunch
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* DINNER SECTION */}
                                            <div className="p-6 md:p-8 bg-indigo-50/10 hover:bg-indigo-50/30 transition-colors relative group">
                                                <div className="absolute top-4 right-4">
                                                    {state.dinnerSlotAvailable ? (
                                                        <Badge className="bg-green-500 hover:bg-green-600 border-0">Open</Badge>
                                                    ) : (
                                                        <Badge variant="destructive">Closed</Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 mb-4">
                                                    <Moon className="w-5 h-5 text-indigo-500" />
                                                    <h3 className="text-lg font-bold text-stone-800 uppercase tracking-wide">Dinner Menu</h3>
                                                </div>

                                                <div className="min-h-[120px]">
                                                    <h4 className="text-xl font-black text-indigo-800 mb-3 leading-tight">
                                                        {state.dinnerSabji || "Evening Special"}
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {state.dinnerItems.map((item, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm font-medium text-stone-600">
                                                                <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="mt-6 pt-4 border-t border-dashed border-stone-200 flex items-end justify-between">
                                                    <div>
                                                        <p className="text-xs text-stone-400 font-bold uppercase">Price</p>
                                                        <p className="text-2xl font-bold text-stone-800">
                                                            ₹{state.isSunday ? 120 : state.price}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOrderClick(undefined, 'Dinner')}
                                                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6"
                                                        disabled={!state.dinnerSlotAvailable}
                                                    >
                                                        Order Dinner
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ordering Footer (Sticky Context) */}
                                        {state.isServiceOff ? (
                                            <div className="bg-orange-50 p-6 sm:p-8 border-t border-orange-200 text-center">
                                                <div className="inline-flex bg-white p-3 rounded-full mb-4 shadow-sm border border-orange-100">
                                                    <Utensils className="w-6 h-6 text-orange-600" />
                                                </div>
                                                <h2 className="text-xl md:text-2xl font-black text-stone-800 mb-2">Hum abhi next batch prepare kar rahe hain</h2>
                                                <p className="text-stone-600 font-medium">
                                                    Best quality maintain karne ke liye thoda break lete hain 🙏
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-stone-50 p-6 border-t border-stone-200">
                                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                                                    {/* Left: Quantity & Extras */}
                                                    <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-4 md:gap-8">

                                                        {/* Qty */}
                                                        <div>
                                                            <label className="text-xs font-bold text-stone-400 uppercase block mb-1">Quantity</label>
                                                            <div className="flex items-center gap-3 bg-white rounded-lg p-1 border border-stone-200 shadow-sm">
                                                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 rounded transition-colors"><Minus className="w-4 h-4 text-stone-600" /></button>
                                                                <span className="font-bold text-stone-800 w-6 text-center">{quantity}</span>
                                                                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 rounded transition-colors"><Plus className="w-4 h-4 text-stone-600" /></button>
                                                            </div>
                                                        </div>

                                                        {/* Extra Roti */}
                                                        {(!state.isSunday || selectedSlot === 'Lunch') && (
                                                            <div>
                                                                <label className="text-xs font-bold text-stone-400 uppercase block mb-1">Extra Roti (+₹10)</label>
                                                                <div className="flex items-center gap-3 bg-white rounded-lg p-1 border border-stone-200 shadow-sm">
                                                                    <button onClick={() => setExtraRotiCount(Math.max(0, extraRotiCount - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 rounded transition-colors"><Minus className="w-4 h-4 text-stone-600" /></button>
                                                                    <span className="font-bold text-stone-800 w-6 text-center">{extraRotiCount}</span>
                                                                    <button onClick={() => setExtraRotiCount(extraRotiCount + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 rounded transition-colors"><Plus className="w-4 h-4 text-stone-600" /></button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Right: Checkout Button */}
                                                    <Button
                                                        onClick={() => handleOrderClick()}
                                                        disabled={selectedSlot === 'Lunch' ? !state.lunchSlotAvailable : !state.dinnerSlotAvailable}
                                                        className="w-full md:w-auto px-8 py-6 text-lg font-bold bg-stone-900 hover:bg-black text-white rounded-2xl shadow-lg transition-all"
                                                    >
                                                        Order {selectedSlot} • ₹{totalPrice}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                {/* Trust Badges */}
                                <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto mt-8 opacity-80">
                                    {[
                                        { icon: Flame, label: "Freshly Made", text: "Every Meal" },
                                        { icon: ShieldCheck, label: "Top Hygiene", text: "Guaranteed" },
                                        { icon: Leaf, label: "Pure Veg", text: "Home Kitchen" },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex flex-col items-center text-center p-3">
                                            <item.icon className="w-6 h-6 text-stone-400 mb-1" />
                                            <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="subscription" key="subscription">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="text-center mb-10">
                                    <h2 className="text-2xl font-bold text-stone-800 mb-2">Subscribe & Save</h2>
                                    <p className="text-stone-600">Get healthy homemade meals delivered daily. Skip or pause anytime.</p>
                                </div>

                                {plansLoading ? (
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-96 bg-stone-100 rounded-3xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : plans.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-3xl border border-stone-200">
                                        <p className="text-stone-500">No subscription plans available right now.</p>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {plans.map((plan: any) => {
                                            const isDinner = plan.planType === 'dinner';
                                            const isBoth = plan.planType === 'both';
                                            let theme = {
                                                bg: "from-white to-orange-50",
                                                border: "border-orange-100",
                                                text: "text-stone-800",
                                                badge: "bg-orange-100 text-orange-800",
                                                btn: "bg-orange-600 hover:bg-orange-700",
                                                icon: "text-orange-500 bg-orange-50"
                                            };

                                            if (isDinner) {
                                                theme = {
                                                    bg: "from-white to-stone-100",
                                                    border: "border-stone-200",
                                                    text: "text-stone-800",
                                                    badge: "bg-stone-100 text-stone-700",
                                                    btn: "bg-stone-800 hover:bg-stone-900",
                                                    icon: "text-stone-600 bg-stone-100"
                                                };
                                            } else if (isBoth) {
                                                theme = {
                                                    bg: "from-amber-50 to-orange-50",
                                                    border: "border-amber-200",
                                                    text: "text-amber-950",
                                                    badge: "bg-amber-100 text-amber-800",
                                                    btn: "bg-gradient-to-r from-orange-600 to-amber-600 hover:to-amber-700 hover:from-orange-700",
                                                    icon: "text-amber-600 bg-amber-50"
                                                };
                                            }

                                            return (
                                                <motion.div
                                                    key={plan._id}
                                                    whileHover={{ y: -8 }}
                                                    className={`relative rounded-3xl p-1 bg-gradient-to-br ${theme.border} shadow-sm hover:shadow-xl transition-all duration-300`}
                                                >
                                                    <div className={`h-full bg-gradient-to-br ${theme.bg} rounded-[22px] p-6 flex flex-col relative overflow-hidden`}>
                                                        <div className="absolute top-4 right-4 animate-pulse">
                                                            {plan.discount > 0 && (
                                                                <Badge className="bg-red-500 text-white border-0 px-3 py-1 text-xs font-bold shadow-lg">
                                                                    {plan.discount}% SAVE
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="relative z-10 mb-6">
                                                            <Badge variant="outline" className={`mb-3 border-0 px-3 py-1 capitalize font-bold tracking-wide ${theme.badge}`}>
                                                                {plan.planType} Plan
                                                            </Badge>
                                                            <h3 className={`text-xl font-black ${theme.text} mb-2 leading-tight`}>{plan.title}</h3>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-3xl font-extrabold text-stone-900">₹{plan.price}</span>
                                                                <span className="text-stone-500 font-medium text-sm">/ month</span>
                                                            </div>
                                                        </div>

                                                        <div className="relative z-10 space-y-4 mb-8 flex-grow">
                                                            {plan.features?.map((feature: string, idx: number) => (
                                                                <div key={idx} className="flex items-start gap-3">
                                                                    <div className={`mt-0.5 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center shadow-sm ${theme.icon}`}>
                                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    </div>
                                                                    <span className="text-stone-700 font-medium text-sm leading-relaxed">{feature}</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <Button
                                                            onClick={() => handleOrderClick(plan)}
                                                            className={`w-full py-6 text-base font-bold text-white shadow-lg shadow-black/5 rounded-xl transition-all ${theme.btn}`}
                                                        >
                                                            Choose Plan
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        </TabsContent>
                    </AnimatePresence>
                </Tabs>
            </div>
        </>
    );
}
