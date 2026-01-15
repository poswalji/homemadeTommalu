"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Info, ShieldCheck, Leaf, Flame, Minus, Plus, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHomemade } from "@/context/homemade-context";
import { useAuthMe } from "@/hooks/api";
import { useRouter } from "next/navigation";
import { ConfirmOrderDialog } from "@/components/modals/confirm-order-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useSubscriptionPlans } from "@/hooks/api/use-homemade-food";

export default function HomemadePage() {
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

    const handleOrderClick = (plan?: any) => {
        if (!authData?.user) {
            router.push(`/login?redirect=/homemade`);
            return;
        }
        if (plan) {
            setSelectedPlan(plan);
        } else {
            setSelectedPlan(null);
        }
        setIsDialogOpen(true);
    };

    const totalPrice = (state.price * quantity) + ((state.extraRotiPrice || 10) * extraRotiCount);

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
            <Header />

            <main className="flex-grow pt-24 pb-12 px-4 md:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* ... Top Warning Banner ... */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-100 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg shadow-sm flex items-start gap-3"
                    >
                        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-amber-800 text-sm md:text-base">
                                Today's Fresh Menu
                            </p>
                            <p className="text-amber-700 text-xs md:text-sm mt-1">
                                Ordering Open: <strong>9:00 AM - 12:00 PM (Lunch)</strong> & <strong>9:00 AM - 7:00 PM (Dinner)</strong>.
                            </p>
                        </div>
                    </motion.div>

                    {/* Main Tabs */}
                    <Tabs defaultValue="one-time" className="mb-8" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-stone-200/50 rounded-2xl">
                            <TabsTrigger value="one-time" className="rounded-xl text-base font-semibold data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all">
                                One-Time Order
                            </TabsTrigger>
                            <TabsTrigger value="subscription" className="rounded-xl text-base font-semibold data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all">
                                Monthly Subscription
                            </TabsTrigger>
                        </TabsList>

                        <AnimatePresence mode="wait">
                            <TabsContent value="one-time">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h1 className="text-2xl md:text-3xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                                        <Leaf className="w-8 h-8 text-green-600" />
                                        Today's Special Thali
                                    </h1>

                                    {/* Slot Selection */}
                                    <div className="mb-8">
                                        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Select Time Slot
                                        </h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setSelectedSlot("Lunch")}
                                                disabled={!state.lunchSlotAvailable}
                                                className={`py-3 px-4 rounded-xl border-2 text-center transition-all font-semibold relative overflow-hidden ${selectedSlot === "Lunch"
                                                    ? "border-orange-600 bg-orange-50 text-orange-700"
                                                    : "border-stone-200 bg-white text-stone-500 hover:border-orange-200"
                                                    } ${!state.lunchSlotAvailable ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                                            >
                                                Lunch
                                                {!state.lunchSlotAvailable && <span className="absolute inset-0 flex items-center justify-center bg-stone-100/80 text-xs font-bold text-red-500">SOLD OUT</span>}
                                            </button>

                                            <button
                                                onClick={() => setSelectedSlot("Dinner")}
                                                disabled={!state.dinnerSlotAvailable}
                                                className={`py-3 px-4 rounded-xl border-2 text-center transition-all font-semibold relative overflow-hidden ${selectedSlot === "Dinner"
                                                    ? "border-orange-600 bg-orange-50 text-orange-700"
                                                    : "border-stone-200 bg-white text-stone-500 hover:border-orange-200"
                                                    } ${!state.dinnerSlotAvailable ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                                            >
                                                Dinner
                                                {!state.dinnerSlotAvailable && <span className="absolute inset-0 flex items-center justify-center bg-stone-100/80 text-xs font-bold text-red-500">SOLD OUT</span>}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Thali Card - Matching Admin Editor Style */}
                                    <Card className="shadow-lg border-orange-100 overflow-hidden">
                                        <div className="relative h-48 bg-stone-200">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center"
                                                style={{ backgroundImage: "url('/thali-special.jpeg')" }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
                                                <div>
                                                    <Badge className="bg-orange-500 hover:bg-orange-600 mb-2 border-0">Today's Special</Badge>
                                                    <h3 className="text-white text-2xl font-bold">Standard Homemade Thali</h3>
                                                </div>
                                            </div>
                                        </div>

                                        <CardContent className="pt-6 space-y-6">
                                            {/* Dynamic Sabji & Roti Display */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-bold text-orange-600 uppercase tracking-wider">
                                                        {state.isSunday ? "Sunday Special" : `${selectedSlot} Special`}
                                                    </label>
                                                    <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                                                        {state.isSunday ? "Special" : selectedSlot}
                                                    </Badge>
                                                </div>

                                                <div>
                                                    <div className="text-3xl font-extrabold text-stone-800 leading-tight mb-2">
                                                        {state.isSunday
                                                            ? (state.sundayItem || "Loading...")
                                                            : (selectedSlot === 'Lunch' ? (state.lunchSabji || "Loading...") : (state.dinnerSabji || "Loading..."))
                                                        }
                                                    </div>

                                                    {/* Roti Display (Weekday Only generally) */}
                                                    {!state.isSunday && state.items?.find(i => i.toLowerCase().includes('roti')) && (
                                                        <div className="flex items-center gap-2 text-stone-600 font-medium text-lg">
                                                            <span className="text-orange-500 font-bold">+</span>
                                                            {state.items.find(i => i.toLowerCase().includes('roti'))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Extra Roti Selector */}
                                            {!state.isSunday && (
                                                <div className="bg-orange-50 rounded-xl p-3 border border-orange-100 flex items-center justify-between">
                                                    <div>
                                                        <span className="text-sm font-bold text-orange-800 block">Extra Roti?</span>
                                                        <span className="text-xs text-orange-600">₹{state.extraRotiPrice || 10} / pc</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-white rounded-lg p-1 border border-orange-200">
                                                        <button
                                                            onClick={() => setExtraRotiCount(Math.max(0, extraRotiCount - 1))}
                                                            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${extraRotiCount > 0 ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'text-gray-300'}`}
                                                            disabled={extraRotiCount === 0}
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="font-bold text-stone-800 w-4 text-center text-sm">{extraRotiCount}</span>
                                                        <button
                                                            onClick={() => setExtraRotiCount(extraRotiCount + 1)}
                                                            className="w-7 h-7 flex items-center justify-center bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Side Dishes (Everything except Roti) */}
                                            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-3">Accompaniments</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {state.items && state.items.length > 0 ? (
                                                        state.items
                                                            .filter(i => state.isSunday || !i.toLowerCase().includes('roti')) // Filter roti only on weekdays
                                                            .map((item, i) => (
                                                                <div key={i} className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-stone-200 shadow-sm text-stone-600 text-sm font-medium">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                                    {item}
                                                                </div>
                                                            ))
                                                    ) : (
                                                        <span className="text-stone-400 text-sm italic">Comes with Salad & Sides</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                                                <div>
                                                    <span className="text-xs text-stone-500 uppercase font-bold">Price per Plate</span>
                                                    <div className="text-3xl font-bold text-stone-800">₹{state.price}</div>
                                                </div>

                                                {/* Quantity Selector */}
                                                <div className="flex items-center gap-3 bg-stone-100 rounded-xl p-1.5 border border-stone-200">
                                                    <button
                                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-stone-600 hover:text-orange-600 transition-colors"
                                                    >
                                                        <Minus className="w-5 h-5" />
                                                    </button>
                                                    <span className="font-bold text-stone-800 w-6 text-center text-lg">{quantity}</span>
                                                    <button
                                                        onClick={() => setQuantity(quantity + 1)}
                                                        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-stone-600 hover:text-orange-600 transition-colors"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="p-6 pt-0 bg-stone-50/50">
                                            <Button
                                                onClick={() => handleOrderClick()}
                                                disabled={!state.isAvailable}
                                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-7 text-lg rounded-xl shadow-lg shadow-orange-200 mt-4"
                                            >
                                                {state.isAvailable ? `Pre-Order Now • ₹${totalPrice}` : "Currently Unavailable"}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="subscription">
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
                                            {plans.map((plan: any) => (
                                                <div key={plan._id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all relative overflow-hidden group flex flex-col">
                                                    {plan.discount > 0 && (
                                                        <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-bl-xl">{plan.discount}% OFF</div>
                                                    )}
                                                    <h3 className="text-xl font-bold text-stone-800 mb-2">{plan.title}</h3>
                                                    <p className="text-stone-500 text-sm mb-6 capitalize">{plan.planType} Plan</p>
                                                    <div className="mb-6">
                                                        <span className="text-4xl font-bold text-stone-800">₹{plan.price}</span>
                                                    </div>
                                                    <ul className="space-y-3 mb-8 flex-grow">
                                                        {plan.features?.map((feature: string, idx: number) => (
                                                            <li key={idx} className="flex items-center gap-2 text-stone-600 text-sm">
                                                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                                <span>{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <Button
                                                        onClick={() => handleOrderClick(plan)}
                                                        className="w-full bg-stone-800 hover:bg-orange-600 text-white rounded-xl py-6 font-bold transition-all"
                                                    >
                                                        Subscribe Now
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </TabsContent>
                        </AnimatePresence>
                    </Tabs>

                    {/* Trust Elements */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        {[
                            { icon: Flame, label: "Freshly Prepared", color: "text-orange-500" },
                            { icon: ShieldCheck, label: "100% Hygienic", color: "text-green-500" },
                            { icon: Leaf, label: "Pure Homemade", color: "text-green-600" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-stone-100 shadow-sm">
                                <item.icon className={`w-6 h-6 mb-2 ${item.color}`} />
                                <span className="text-xs font-semibold text-stone-600 leading-tight">{item.label}</span>
                            </div>
                        ))}
                    </div>

                </div>
            </main>
            <Footer />

            <ConfirmOrderDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                orderDetails={{
                    date: new Date().toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }),
                    slot: selectedSlot,
                    quantity: quantity,
                    totalPrice: activeTab === 'one-time' ? totalPrice : (selectedPlan?.price || 0),
                    items: activeTab === 'one-time' ? [
                        state.dailySabji,
                        "Roti, Salad, Chhach",
                        extraRotiCount > 0 ? `Extra Roti x${extraRotiCount}` : null
                    ].filter(Boolean) as string[] : [selectedPlan?.title],
                    isSubscription: activeTab === 'subscription',
                    planName: activeTab === 'subscription' ? selectedPlan?.title : undefined,
                    planId: activeTab === 'subscription' ? selectedPlan?._id : undefined
                }}
            />
        </div>
    );
}
