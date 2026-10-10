"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Sun, Moon, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthMe } from "@/hooks/api";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useSubscriptionPlans } from "@/hooks/api/use-homemade-food";
import { toast } from "sonner";

export function SubscriptionPlansSection() {
    const router = useRouter();
    const { data: authData } = useAuthMe();
    const { data: plansData, isLoading: plansLoading } = useSubscriptionPlans();
    const plans = plansData?.data || [];

    const handleOrderClick = (plan: any) => {
        if (!authData?.user) {
            router.push(`/login?redirect=/#subscription-plans`);
            return;
        }

        const orderDetails = {
            date: new Date().toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }),
            slot: plan.planType === 'dinner' ? 'Dinner' : 'Lunch', // Default based on plan type
            quantity: 1,
            totalPrice: plan.price || 0,
            items: [plan.title],
            isSubscription: true,
            planName: plan.title,
            planId: plan._id
        };

        sessionStorage.setItem("checkoutOrderDetails", JSON.stringify(orderDetails));
        router.push("/checkout");
    };

    if (plansLoading) {
        return (
            <div className="py-20 bg-stone-50" id="subscription-plans">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-stone-900 mb-6">Subscription Plans</h2>
                        <p className="text-stone-500 font-medium text-lg">Loading plans...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (plans.length === 0) {
        return null; // Don't show section if no plans
    }

    return (
        <section id="subscription-plans" className="py-24 bg-white relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-stone-100 rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/2" />

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <Badge variant="outline" className="mb-4 text-orange-600 border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-bold uppercase tracking-widest shadow-sm">
                        Flexible Plans
                    </Badge>
                    <h2 className="text-4xl md:text-6xl font-black text-stone-900 mb-6 tracking-tight">
                        Choose Your <span className="text-orange-500 relative">Subscription
                            <svg className="absolute -bottom-2 left-0 w-full h-3 text-orange-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                        </span>
                    </h2>
                    <p className="text-lg md:text-xl text-stone-600 font-medium leading-relaxed">
                        Enjoy homemade meals delivered daily. Save time and money with our monthly meal plans.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
                    {plans.map((plan: any, index: number) => {
                        const isDinner = plan.planType === 'dinner';
                        const isBoth = plan.planType === 'both';
                        
                        let theme = {
                            border: "from-orange-200 to-orange-100",
                            bg: "from-white to-orange-50/50",
                            badge: "bg-orange-100 text-orange-700",
                            btn: "bg-orange-500 hover:bg-orange-600",
                            text: "text-orange-900",
                            icon: "text-orange-600 bg-orange-50"
                        };

                        if (isDinner) {
                            theme = {
                                border: "from-indigo-200 to-indigo-100",
                                bg: "from-white to-indigo-50/50",
                                badge: "bg-indigo-100 text-indigo-700",
                                btn: "bg-indigo-500 hover:bg-indigo-600",
                                text: "text-indigo-900",
                                icon: "text-indigo-600 bg-indigo-50"
                            };
                        } else if (isBoth) {
                            theme = {
                                border: "from-amber-200 to-amber-100",
                                bg: "from-white to-amber-50/50",
                                badge: "bg-amber-100 text-amber-700",
                                btn: "bg-amber-500 hover:bg-amber-600",
                                text: "text-amber-900",
                                icon: "text-amber-600 bg-amber-50"
                            };
                        }

                        return (
                            <motion.div
                                key={plan._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -8 }}
                                className={`relative rounded-[32px] p-1.5 bg-gradient-to-br ${theme.border} shadow-sm hover:shadow-2xl transition-all duration-300`}
                            >
                                <div className={`h-full bg-gradient-to-br ${theme.bg} rounded-[26px] p-8 flex flex-col relative overflow-hidden`}>
                                    <div className="absolute top-6 right-6 animate-pulse">
                                        {plan.discount > 0 && (
                                            <Badge className="bg-red-500 text-white border-0 px-3 py-1 text-xs font-black tracking-wide shadow-lg uppercase">
                                                {plan.discount}% Off
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="relative z-10 mb-8">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${theme.badge}`}>
                                            {isBoth ? <Flame className="w-6 h-6" /> : isDinner ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                                        </div>
                                        <Badge variant="outline" className={`mb-4 border-0 px-3 py-1 capitalize font-bold tracking-wide ${theme.badge}`}>
                                            {plan.planType} Plan
                                        </Badge>
                                        <h3 className={`text-2xl font-black ${theme.text} mb-3 leading-tight`}>{plan.title}</h3>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-4xl font-extrabold text-stone-900">₹{plan.price}</span>
                                            <span className="text-stone-500 font-semibold text-sm uppercase tracking-wider">/ month</span>
                                        </div>
                                    </div>

                                    <div className="relative z-10 space-y-4 mb-10 flex-grow">
                                        {plan.features?.map((feature: string, idx: number) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <div className={`mt-0.5 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center shadow-sm shrink-0 ${theme.icon}`}>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                                <span className="text-stone-700 font-medium text-base leading-relaxed">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={() => handleOrderClick(plan)}
                                        className={`w-full py-6 text-lg font-bold text-white shadow-lg shadow-black/5 rounded-xl transition-all ${theme.btn}`}
                                    >
                                        Choose Plan
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
