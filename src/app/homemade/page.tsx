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

export default function HomemadePage() {
    const router = useRouter();
    const { state } = useHomemade();
    const { data: authData } = useAuthMe();

    const [selectedSlot, setSelectedSlot] = useState<"Lunch" | "Dinner">("Lunch");
    const [quantity, setQuantity] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("one-time");

    const handleOrderClick = () => {
        if (!authData?.user) {
            router.push(`/login?redirect=/homemade`);
            return;
        }
        setIsDialogOpen(true);
    };

    const totalPrice = state.price * quantity;

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
            <Header />

            <main className="flex-grow pt-24 pb-12 px-4 md:px-8">
                <div className="max-w-3xl mx-auto">

                    {/* Top Warning Banner */}
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

                                    {/* Thali Card */}
                                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100">
                                        <div className="relative h-48 bg-stone-200">
                                            <div
                                                className="absolute inset-0 bg-cover bg-center"
                                                style={{ backgroundImage: "url('/thali-placeholder.jpg')" }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
                                                <div>
                                                    <Badge className="bg-orange-500 hover:bg-orange-600 mb-2 border-0">Best Seller</Badge>
                                                    <h3 className="text-white text-2xl font-bold">Standard Homemade Thali</h3>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="mb-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-1">Sabji of the Day</p>
                                                        <p className="text-lg font-medium text-stone-800 leading-snug">
                                                            {state.isSunday
                                                                ? (state.sundayItem || state.dailySabji)
                                                                : (selectedSlot === "Lunch" ? (state.lunchSabji || "Loading...") : (state.dinnerSabji || "Loading..."))
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-bold text-stone-800">₹{state.price}</p>
                                                        <p className="text-xs text-stone-500">per plate</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-100">
                                                    <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-2">Fixed Items</p>
                                                    <ul className="grid grid-cols-2 gap-2">
                                                        {state.items && state.items.length > 0 ? (
                                                            state.items.map((item, i) => (
                                                                <li key={i} className="flex items-center gap-2 text-stone-700 text-sm">
                                                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                                    <span>{item}</span>
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <div className="text-sm text-stone-400 italic">No items listed.</div>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-stone-100">
                                                <div className="flex items-center gap-3 bg-stone-100 rounded-xl p-1.5">
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

                                                <Button
                                                    onClick={handleOrderClick}
                                                    disabled={!state.isAvailable}
                                                    className="flex-1 ml-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-7 text-lg rounded-xl shadow-lg shadow-orange-200"
                                                >
                                                    {state.isAvailable ? `Pre-Order • ₹${totalPrice}` : "Currently Unavailable"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
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

                                    <div className="grid md:grid-cols-3 gap-6">
                                        {/* Lunch Plan */}
                                        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-bl-xl">10% OFF</div>
                                            <h3 className="text-xl font-bold text-stone-800 mb-2">Lunch Plan</h3>
                                            <p className="text-stone-500 text-sm mb-6">30 Lunches • Mon-Sun</p>
                                            <div className="mb-6">
                                                <span className="text-4xl font-bold text-stone-800">₹{state.price * 30 * 0.9}</span>
                                                <span className="text-stone-400 line-through text-sm ml-2">₹{state.price * 30}</span>
                                            </div>
                                            <ul className="space-y-3 mb-8">
                                                <li className="flex items-center gap-2 text-stone-600 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Free Delivery
                                                </li>
                                                <li className="flex items-center gap-2 text-stone-600 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Daily Menu Change
                                                </li>
                                                <li className="flex items-center gap-2 text-stone-600 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Pause Anytime
                                                </li>
                                            </ul>
                                            <Button onClick={handleOrderClick} className="w-full bg-stone-800 hover:bg-orange-600 text-white rounded-xl py-6 font-bold transition-all">
                                                Subscribe Lunch
                                            </Button>
                                        </div>

                                        {/* Dinner Plan */}
                                        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-bl-xl">10% OFF</div>
                                            <h3 className="text-xl font-bold text-stone-800 mb-2">Dinner Plan</h3>
                                            <p className="text-stone-500 text-sm mb-6">30 Dinners • Mon-Sun</p>
                                            <div className="mb-6">
                                                <span className="text-4xl font-bold text-stone-800">₹{state.price * 30 * 0.9}</span>
                                                <span className="text-stone-400 line-through text-sm ml-2">₹{state.price * 30}</span>
                                            </div>
                                            <ul className="space-y-3 mb-8">
                                                <li className="flex items-center gap-2 text-stone-600 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Free Delivery
                                                </li>
                                                <li className="flex items-center gap-2 text-stone-600 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Daily Menu Change
                                                </li>
                                                <li className="flex items-center gap-2 text-stone-600 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Pause Anytime
                                                </li>
                                            </ul>
                                            <Button onClick={handleOrderClick} className="w-full bg-stone-800 hover:bg-orange-600 text-white rounded-xl py-6 font-bold transition-all">
                                                Subscribe Dinner
                                            </Button>
                                        </div>

                                        {/* Combo Plan */}
                                        <div className="bg-orange-600 rounded-3xl p-6 shadow-xl relative overflow-hidden text-white transform md:-translate-y-4">
                                            <div className="absolute top-0 right-0 bg-white text-orange-600 text-xs font-bold px-3 py-1 rounded-bl-xl">BEST VALUE</div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                                <h3 className="text-xl font-bold">Complete Plan</h3>
                                            </div>
                                            <p className="text-orange-100 text-sm mb-6">30 Lunches + 30 Dinners</p>
                                            <div className="mb-6">
                                                <span className="text-4xl font-bold">₹{state.price * 60 * 0.85}</span>
                                                <span className="text-orange-200 line-through text-sm ml-2">₹{state.price * 60}</span>
                                            </div>
                                            <ul className="space-y-3 mb-8">
                                                <li className="flex items-center gap-2 text-orange-50 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-white" /> 15% Flat Discount
                                                </li>
                                                <li className="flex items-center gap-2 text-orange-50 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-white" /> Priority Delivery
                                                </li>
                                                <li className="flex items-center gap-2 text-orange-50 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-white" /> Free Weekend Special
                                                </li>
                                            </ul>
                                            <Button onClick={handleOrderClick} className="w-full bg-white text-orange-600 hover:bg-orange-50 rounded-xl py-6 font-bold transition-all shadow-lg">
                                                Subscribe All Meals
                                            </Button>
                                        </div>

                                    </div>
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
                    totalPrice: activeTab === 'one-time' ? totalPrice : 0,
                    items: [state.dailySabji, "Roti, Salad, Chhach"],
                    isSubscription: activeTab === 'subscription',
                    planName: activeTab === 'subscription' ? "Monthly Plan" : undefined
                }}
            />
        </div>
    );
}
