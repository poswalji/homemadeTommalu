"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getTodayMenu } from "@/services/homemadeService";

export interface ThaliOption {
    id: "regular" | "desiSpecial" | "paneerSpecial";
    name: string;
    price: number;
    isAvailable: boolean;
    badge?: string;
    image?: string;
    items: string[];
}

interface HomemadeState {
    dailySabji: string;
    price: number;
    isAvailable: boolean;
    lunchSlotAvailable: boolean;
    dinnerSlotAvailable: boolean;
    lunchDeliveryCharge?: number;
    dinnerDeliveryCharge?: number;
    menuDate?: string;
    isSunday?: boolean;
    isServiceOff?: boolean;
    sundayItem?: string;
    items: string[]; // Legacy/General items
    lunchItems: string[]; // Explicit Lunch Items
    dinnerItems: string[]; // Explicit Dinner Items
    lunchSabji?: string;
    dinnerSabji?: string;
    availableRotis?: Array<{ type: string; priceExtra: number; isDefault: boolean }>;
    extraRotiPrice?: number;
    paneerSabji?: string;
    thalis: {
        regular: ThaliOption;
        desiSpecial: ThaliOption;
        paneerSpecial: ThaliOption;
    };
}

interface HomemadeContextType {
    state: HomemadeState;
    refreshMenu: () => void;
    loading: boolean;
}

const HomemadeContext = createContext<HomemadeContextType | undefined>(undefined);

const defaultThalis: {
    regular: ThaliOption;
    desiSpecial: ThaliOption;
    paneerSpecial: ThaliOption;
} = {
    regular: {
        id: "regular",
        name: "Regular Thali",
        price: 99,
        isAvailable: true,
        badge: "Everyday Value",
        image: "/thali-regular.jpg",
        items: ["1 Seasonal Sabji", "4 Roti, Dal", "Rice", "Salad"]
    },
    desiSpecial: {
        id: "desiSpecial",
        name: "Desi Special Thali",
        price: 119,
        isAvailable: true,
        badge: "Desi Ghee & Raita",
        image: "/thali-desi.jpg",
        items: ["1 Seasonal Sabji", "Dal", "6 Ghee Roti / Chawal", "Boondi Raita", "Lahsun Chutney", "Salad"]
    },
    paneerSpecial: {
        id: "paneerSpecial",
        name: "Paneer Special Thali",
        price: 199,
        isAvailable: true,
        badge: "Royal Paneer Feast",
        image: "/thali-paneer.jpg",
        items: ["1 Paneer Sabji", "Dal", "4 Ghee Roti", "Jeera Rice", "Boondi Raita", "Salad", "1 Gulab Jamun"]
    }
};

const defaultState: HomemadeState = {
    dailySabji: "Loading...",
    price: 0,
    isAvailable: false,
    lunchSlotAvailable: false,
    dinnerSlotAvailable: false,
    lunchDeliveryCharge: 0,
    dinnerDeliveryCharge: 0,
    items: [],
    lunchItems: [],
    dinnerItems: [],
    lunchSabji: "",
    dinnerSabji: "",
    availableRotis: [],
    extraRotiPrice: 10,
    isServiceOff: false,
    paneerSabji: "Paneer Butter Masala",
    thalis: defaultThalis
};

export function HomemadeProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<HomemadeState>(defaultState);
    const [loading, setLoading] = useState(true);

    const fetchMenu = async () => {
        try {
            setLoading(true);
            const res = await getTodayMenu();
            if (res.success) {
                const data = res.data;
                const isSunday = data.isSunday;

                // Construct display string for Sabji (fallback)
                let sabjiDisplay = "";
                let price = 0;
                let lunchSabji = "";
                let dinnerSabji = "";
                let lunchItems: string[] = [];
                let dinnerItems: string[] = [];

                if (isSunday) {
                    sabjiDisplay = data.product.itemName || "Sunday Special";
                    price = data.product.price;

                    // Hybrid Sunday Logic handling
                    if (data.product.lunchProduct) {
                        lunchSabji = data.product.lunchProduct.sabji || "Standard Lunch";
                        lunchItems = data.product.lunchProduct.includes || [];
                    } else {
                        lunchSabji = sabjiDisplay;
                        lunchItems = data.product.includes || [];
                    }

                    if (data.product.dinnerProduct) {
                        dinnerSabji = data.product.dinnerProduct.name || sabjiDisplay; // Name often used as item name
                        dinnerItems = data.product.dinnerProduct.includes || ["Special Preparation"];
                    } else {
                        dinnerSabji = sabjiDisplay;
                        dinnerItems = data.product.includes || [];
                    }
                } else {
                    lunchSabji = data.product.lunchSabji || "Sabji 1";
                    dinnerSabji = data.product.dinnerSabji || "Sabji 2";
                    sabjiDisplay = `Lunch: ${lunchSabji} | Dinner: ${dinnerSabji}`;
                    price = data.product.price;

                    lunchItems = data.product.lunchItems || data.product.includes || [];
                    dinnerItems = data.product.dinnerItems || data.product.includes || [];
                }

                setState({
                    dailySabji: sabjiDisplay,
                    price: price,
                    isAvailable: true, // If API returns, store is open
                    lunchSlotAvailable: data.slots.lunch.isOpen,
                    dinnerSlotAvailable: data.slots.dinner.isOpen,
                    lunchDeliveryCharge: data.slots?.lunch?.deliveryCharge ?? 0,
                    dinnerDeliveryCharge: data.slots?.dinner?.deliveryCharge ?? 0,
                    menuDate: data.date,
                    isSunday: isSunday,
                    sundayItem: isSunday ? data.product.itemName : undefined,
                    items: data.product.includes || [],
                    lunchItems: lunchItems,
                    dinnerItems: dinnerItems,
                    lunchSabji,
                    dinnerSabji,
                    availableRotis: data.weekdayMenu?.availableRotis || [],
                    extraRotiPrice: data.product.extraRotiPrice || 10,
                    isServiceOff: data.isServiceOff || false,
                    paneerSabji: data.paneerSabji || "Paneer Butter Masala",
                    thalis: data.thalis ? {
                        regular: {
                            id: "regular",
                            name: data.thalis.regular?.name || "Regular Thali",
                            price: data.thalis.regular?.price ?? price ?? 99,
                            isAvailable: data.thalis.regular?.isAvailable !== false,
                            badge: data.thalis.regular?.badge || "Everyday Value",
                            image: data.thalis.regular?.image || "/thali-regular.jpg",
                            items: data.thalis.regular?.items || ["1 Seasonal Sabji", "4 Roti, Dal", "Rice", "Salad"]
                        },
                        desiSpecial: {
                            id: "desiSpecial",
                            name: data.thalis.desiSpecial?.name || "Desi Special Thali",
                            price: data.thalis.desiSpecial?.price ?? 119,
                            isAvailable: data.thalis.desiSpecial?.isAvailable !== false,
                            badge: data.thalis.desiSpecial?.badge || "Desi Ghee & Raita",
                            image: data.thalis.desiSpecial?.image || "/thali-desi.jpg",
                            items: data.thalis.desiSpecial?.items || ["1 Seasonal Sabji", "Dal", "6 Ghee Roti / Chawal", "Boondi Raita", "Lahsun Chutney", "Salad"]
                        },
                        paneerSpecial: {
                            id: "paneerSpecial",
                            name: data.thalis.paneerSpecial?.name || "Paneer Special Thali",
                            price: data.thalis.paneerSpecial?.price ?? 199,
                            isAvailable: data.thalis.paneerSpecial?.isAvailable !== false,
                            badge: data.thalis.paneerSpecial?.badge || "Royal Paneer Feast",
                            image: data.thalis.paneerSpecial?.image || "/thali-paneer.jpg",
                            items: data.thalis.paneerSpecial?.items || ["1 Paneer Sabji", "Dal", "4 Ghee Roti", "Jeera Rice", "Boondi Raita", "Salad", "1 Gulab Jamun"]
                        }
                    } : defaultThalis
                });
            }
        } catch (error) {
            console.error("Failed to fetch homemade menu", error);
            // Fallback or keep loading state?
            setState(prev => ({ ...prev, dailySabji: "Unavailable", isAvailable: false }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    return (
        <HomemadeContext.Provider
            value={{
                state,
                refreshMenu: fetchMenu,
                loading
            }}
        >
            {children}
        </HomemadeContext.Provider>
    );
}

export function useHomemade() {
    const context = useContext(HomemadeContext);
    if (context === undefined) {
        throw new Error("useHomemade must be used within a HomemadeProvider");
    }
    return context;
}
