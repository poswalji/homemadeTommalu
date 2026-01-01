
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getTodayMenu } from "@/services/homemadeService";

interface HomemadeState {
    dailySabji: string;
    price: number;
    isAvailable: boolean;
    lunchSlotAvailable: boolean;
    dinnerSlotAvailable: boolean;
    menuDate?: string;
    isSunday?: boolean;
    sundayItem?: string;
    items: string[];
    lunchSabji?: string;
    dinnerSabji?: string;
}

interface HomemadeContextType {
    state: HomemadeState;
    refreshMenu: () => void;
    loading: boolean;
}

const HomemadeContext = createContext<HomemadeContextType | undefined>(undefined);

const defaultState: HomemadeState = {
    dailySabji: "Loading...",
    price: 0,
    isAvailable: false,
    lunchSlotAvailable: false,
    dinnerSlotAvailable: false,
    items: [],
    lunchSabji: "",
    dinnerSabji: ""
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

                if (isSunday) {
                    sabjiDisplay = data.product.itemName || "Sunday Special";
                    price = data.product.price;
                    lunchSabji = sabjiDisplay; // Sunday usually has one special
                    dinnerSabji = sabjiDisplay;
                } else {
                    lunchSabji = data.product.lunchSabji || "Sabji 1";
                    dinnerSabji = data.product.dinnerSabji || "Sabji 2";
                    sabjiDisplay = `Lunch: ${lunchSabji} | Dinner: ${dinnerSabji}`;
                    price = data.product.price;
                }

                setState({
                    dailySabji: sabjiDisplay,
                    price: price,
                    isAvailable: true, // If API returns, store is open
                    lunchSlotAvailable: data.slots.lunch.isOpen,
                    dinnerSlotAvailable: data.slots.dinner.isOpen,
                    menuDate: data.date,
                    isSunday: isSunday,
                    sundayItem: isSunday ? data.product.itemName : undefined,
                    items: data.product.includes || [],
                    lunchSabji,
                    dinnerSabji
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
