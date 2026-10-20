"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, X, Minus, Plus, Trash2, ArrowRight, Utensils, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/app-context";
import { toast } from "sonner";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const router = useRouter();
    const { state, updateCartQuantity, removeFromCart, clearCart, cartTotal, cartCount } = useApp();

    // Prevent background scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCheckout = () => {
        if (state.cart.length === 0) return;

        const firstItem = state.cart[0];
        const isDinner = state.cart.some((i) => i.name.toLowerCase().includes("dinner"));
        const slot = isDinner ? "Dinner" : "Lunch";

        let thaliType: "regular" | "desiSpecial" | "paneerSpecial" = "regular";
        let thaliName = "Regular Thali";

        if (firstItem?.name.includes("Paneer")) {
            thaliType = "paneerSpecial";
            thaliName = "Paneer Special Thali";
        } else if (firstItem?.name.includes("Desi")) {
            thaliType = "desiSpecial";
            thaliName = "Desi Special Thali";
        }

        const orderDetails = {
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            slot: slot,
            thaliType: thaliType,
            thaliName: state.cart.length === 1 ? firstItem.name : `Thali Order (${cartCount} items)`,
            unitPrice: state.cart.length === 1 ? firstItem.price : Math.round(cartTotal / cartCount),
            quantity: cartCount,
            extraRotiCount: 0,
            itemsTotal: cartTotal,
            deliveryCharge: 0,
            totalPrice: cartTotal,
            items: state.cart.map((i) => `${i.name} x${i.quantity}`),
            isSubscription: false,
        };

        sessionStorage.setItem("checkoutOrderDetails", JSON.stringify(orderDetails));
        onClose();
        router.push("/checkout");
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Slide-over panel */}
            <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-2xs">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                                Your Food Cart
                            </h3>
                            <p className="text-xs text-stone-500 font-medium">
                                {cartCount} {cartCount === 1 ? "item" : "items"} selected
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
                        aria-label="Close cart"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                    {state.cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                            <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-400 mb-4 shadow-sm">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-black text-stone-900 mb-1">Your cart is empty</h4>
                            <p className="text-xs sm:text-sm text-stone-500 max-w-xs mb-6">
                                Explore our delicious, freshly prepared homemade thalis and add your favorite plate to cart!
                            </p>
                            <Button
                                onClick={() => {
                                    onClose();
                                    router.push("/homemade");
                                }}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
                            >
                                <Utensils className="w-4 h-4 mr-2" />
                                Browse Thali Menu
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between pb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                                    Cart Items
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        clearCart();
                                        toast.info("Cart cleared");
                                    }}
                                    className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                                >
                                    Clear All
                                </button>
                            </div>

                            {state.cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between gap-3 hover:border-orange-200 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-stone-100 shadow-2xs">
                                            <Image
                                                src={item.image || "/thali-enhanced.jpg"}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <h5 className="text-sm font-bold text-stone-900 truncate">
                                                {item.name}
                                            </h5>
                                            <p className="text-xs font-extrabold text-orange-600">
                                                ₹{item.price} <span className="text-[10px] text-stone-400 font-normal">/plate</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quantity Controls & Delete */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="flex items-center gap-1.5 bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (item.quantity > 1) {
                                                        updateCartQuantity(item.id, item.quantity - 1);
                                                    } else {
                                                        removeFromCart(item.id);
                                                    }
                                                }}
                                                className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors text-stone-600 cursor-pointer"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-xs font-extrabold text-stone-900 w-5 text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                                className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors text-stone-600 cursor-pointer"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                removeFromCart(item.id);
                                                toast.info(`Removed ${item.name} from cart`);
                                            }}
                                            className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Bill Details & Checkout */}
                {state.cart.length > 0 && (
                    <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/90 space-y-3">
                        <div className="space-y-1.5 text-xs text-stone-600">
                            <div className="flex justify-between">
                                <span>Items Subtotal</span>
                                <span className="font-bold text-stone-900">₹{cartTotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span className="font-bold text-green-700">FREE on Pre-orders</span>
                            </div>
                            <div className="border-t border-stone-200 pt-2 flex justify-between items-baseline text-sm">
                                <span className="font-bold text-stone-900">Total Amount</span>
                                <span className="text-xl font-black text-orange-600">₹{cartTotal}</span>
                            </div>
                        </div>

                        <Button
                            onClick={handleCheckout}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 text-base rounded-xl shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <span>Proceed to Checkout</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>

                        <p className="text-[11px] text-center text-stone-400 font-medium">
                            Fresh homemade food • Desi ghee preparation
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
