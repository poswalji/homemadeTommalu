"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Minus, 
    Plus, 
    ShoppingCart, 
    ArrowRight, 
    CheckCircle2, 
    Utensils, 
    Sun, 
    Moon, 
    Flame,
    Sparkles
} from "lucide-react";

export interface CustomizerThali {
    id: "regular" | "desiSpecial" | "paneerSpecial";
    name: string;
    price: number;
    badge: string;
    badgeColor: string;
    tagline: string;
    image?: string;
    ingredients: string[];
    isAvailable: boolean;
}

interface ThaliCustomizerModalProps {
    isOpen: boolean;
    onClose: () => void;
    thali: CustomizerThali | null;
    selectedSlot: "Lunch" | "Dinner";
    isSunday: boolean;
    extraRotiPrice?: number;
    initialQuantity?: number;
    initialExtraRoti?: number;
    isSlotLate?: boolean;
    onAddToCart: (thali: CustomizerThali, quantity: number, extraRoti: number) => void;
    onOrderNow: (thali: CustomizerThali, quantity: number, extraRoti: number) => void;
}

export function ThaliCustomizerModal({
    isOpen,
    onClose,
    thali,
    selectedSlot,
    isSunday,
    extraRotiPrice = 10,
    initialQuantity = 1,
    initialExtraRoti = 0,
    isSlotLate = false,
    onAddToCart,
    onOrderNow,
}: ThaliCustomizerModalProps) {
    const [quantity, setQuantity] = useState(initialQuantity);
    const [extraRoti, setExtraRoti] = useState(initialExtraRoti);

    // Sync when modal opens with new initial values
    useEffect(() => {
        if (isOpen) {
            setQuantity(Math.max(1, initialQuantity));
            setExtraRoti(Math.max(0, initialExtraRoti));
        }
    }, [isOpen, initialQuantity, initialExtraRoti]);

    if (!thali) return null;

    const isSundayDinner = isSunday && selectedSlot === "Dinner";
    const effectiveExtraRoti = isSundayDinner ? 0 : extraRoti;
    const platesTotal = thali.price * quantity;
    const rotiTotal = effectiveExtraRoti * extraRotiPrice;
    const subtotal = platesTotal + rotiTotal;
    const deliveryFee = isSlotLate ? 30 : 0;
    const grandTotal = subtotal + deliveryFee;

    const handleIncrementQty = () => setQuantity((q) => q + 1);
    const handleDecrementQty = () => setQuantity((q) => Math.max(1, q - 1));

    const handleIncrementRoti = () => setExtraRoti((r) => r + 1);
    const handleDecrementRoti = () => setExtraRoti((r) => Math.max(0, r - 1));

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg w-full p-0 overflow-hidden rounded-3xl border border-stone-200 shadow-2xl bg-white max-h-[92vh] flex flex-col">
                {/* 1. Header Banner */}
                <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/50 p-5 sm:p-6 border-b border-orange-100/80 relative">
                    <div className="flex items-start justify-between gap-3 pr-8">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${thali.badgeColor}`}>
                                    {thali.badge}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-700 bg-white/90 px-2 py-0.5 rounded-full border border-stone-200 shadow-2xs">
                                    {selectedSlot === "Lunch" ? (
                                        <Sun className="w-3 h-3 text-orange-500" />
                                    ) : (
                                        <Moon className="w-3 h-3 text-indigo-500" />
                                    )}
                                    {selectedSlot} Slot
                                </span>
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                                Customize {thali.name}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-stone-500 mt-1">
                                {thali.tagline} • Freshly prepared in pure desi ghee
                            </DialogDescription>
                        </div>
                        {thali.image && (
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-md bg-stone-100">
                                <Image
                                    src={thali.image}
                                    alt={thali.name}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                                <span className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-xs text-[9px] font-black text-white px-1.5 py-0.2 rounded">
                                    Real
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Price tag */}
                    <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-orange-600">
                            ₹{thali.price}
                        </span>
                        <span className="text-xs font-semibold text-stone-400">/ plate</span>
                    </div>
                </div>

                {/* 2. Scrollable Body Content */}
                <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
                    {/* What's in your plate */}
                    <div className="space-y-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 block">
                            Included in this plate:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {thali.ingredients.map((item, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 text-xs font-semibold bg-stone-100 text-stone-800 px-2.5 py-1 rounded-lg border border-stone-200/60"
                                >
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Quantity Section (Plates) */}
                    <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200/70">
                        <div>
                            <span className="text-sm font-black text-stone-900 block">
                                Number of Plates
                            </span>
                            <span className="text-xs text-stone-500 font-medium">
                                ₹{thali.price} per plate
                            </span>
                        </div>

                        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-stone-200 shadow-2xs">
                            <button
                                type="button"
                                onClick={handleDecrementQty}
                                disabled={quantity <= 1}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-7 text-center font-black text-stone-900 text-sm">
                                {quantity}
                            </span>
                            <button
                                type="button"
                                onClick={handleIncrementQty}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* 🫓 Extra Roti Section (Highlighted Swiggy/Zomato style) */}
                    {!isSundayDinner ? (
                        <div className="p-4 rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-50/90 space-y-3 relative shadow-xs">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                    <span className="text-2xl shrink-0 select-none">🫓</span>
                                    <div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-sm font-black text-stone-900">
                                                Add Extra Desi Ghee Roti
                                            </span>
                                            <Badge className="bg-amber-600 text-white text-[10px] font-extrabold px-1.5 py-0 h-4">
                                                HOT ADD-ON
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-stone-600 font-medium mt-0.5">
                                            Fresh, hot tawa roti with pure desi ghee (+₹{extraRotiPrice} each)
                                        </p>
                                    </div>
                                </div>

                                {/* Stepper */}
                                <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-amber-300 shadow-2xs shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleDecrementRoti}
                                        disabled={extraRoti <= 0}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                        aria-label="Decrease extra roti"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-7 text-center font-black text-amber-900 text-sm">
                                        {extraRoti}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleIncrementRoti}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                        aria-label="Increase extra roti"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Roti subtotal tag if selected */}
                            {extraRoti > 0 && (
                                <div className="pt-2 border-t border-amber-200/70 flex items-center justify-between text-xs font-bold text-amber-900">
                                    <span>{extraRoti} Extra Roti added</span>
                                    <span>+₹{rotiTotal}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-3 bg-stone-100 rounded-xl text-xs text-stone-500 text-center font-medium">
                            Sunday Dinner special menu does not require extra rotis.
                        </div>
                    )}

                    {/* Live Bill Breakdown */}
                    <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/70 space-y-1.5 text-xs">
                        <div className="flex justify-between text-stone-600">
                            <span>
                                {quantity} × {thali.name} (₹{thali.price})
                            </span>
                            <span className="font-bold text-stone-900">₹{platesTotal}</span>
                        </div>
                        {effectiveExtraRoti > 0 && (
                            <div className="flex justify-between text-amber-800">
                                <span>{effectiveExtraRoti} × Extra Roti (₹{extraRotiPrice})</span>
                                <span className="font-bold">+₹{rotiTotal}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-stone-600">
                            <span>Delivery</span>
                            <span className={deliveryFee > 0 ? "font-bold text-orange-600" : "font-bold text-emerald-700"}>
                                {deliveryFee > 0 ? `+₹${deliveryFee} (Late)` : "FREE"}
                            </span>
                        </div>
                        <div className="border-t border-stone-200 pt-2 flex justify-between items-baseline text-sm">
                            <span className="font-black text-stone-900">Total Price</span>
                            <span className="text-lg font-black text-orange-600">₹{grandTotal}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Sticky Action Buttons Footer */}
                <div className="p-4 sm:p-5 border-t border-stone-200 bg-white grid grid-cols-2 gap-3 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => {
                            onAddToCart(thali, quantity, effectiveExtraRoti);
                            onClose();
                        }}
                        className="w-full py-6 rounded-2xl border-stone-300 hover:bg-stone-50 text-stone-800 font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                        <ShoppingCart className="w-4 h-4 text-orange-600" />
                        Add to Cart
                    </Button>

                    <Button
                        type="button"
                        size="lg"
                        onClick={() => {
                            onOrderNow(thali, quantity, effectiveExtraRoti);
                            onClose();
                        }}
                        className="w-full py-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-orange-600/25"
                    >
                        <span>Order • ₹{grandTotal}</span>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
