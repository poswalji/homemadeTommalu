"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
    Loader2, 
    Save, 
    Utensils, 
    Share2, 
    Sparkles, 
    Edit3, 
    RotateCcw, 
    Calendar as CalendarIcon, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Sun, 
    Moon, 
    ChefHat, 
    Flame,
    Coffee
} from 'lucide-react';
import { toast } from 'sonner';
import { useDailyMenu, useUpdateDailyMenu } from '@/hooks/api/use-homemade-food';
import { generateMenuShareText } from '@/utils/menuShare';
import { AiThaliImageModal, matchAiImageForMenu } from './AiThaliImageModal';

// Helper to determine if a date is Sunday in Asia/Kolkata timezone
function isSundayInKolkata(d: Date): boolean {
    try {
        const dayName = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            weekday: 'long'
        }).format(d);
        return dayName === 'Sunday';
    } catch {
        return d.getDay() === 0;
    }
}

// Get today's date normalized in Asia/Kolkata timezone
function getTodayInKolkata(): Date {
    try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const parts = formatter.formatToParts(now);
        const y = Number(parts.find(p => p.type === 'year')?.value || now.getFullYear());
        const m = Number(parts.find(p => p.type === 'month')?.value || (now.getMonth() + 1));
        const d = Number(parts.find(p => p.type === 'day')?.value || now.getDate());
        return new Date(y, m - 1, d, 12, 0, 0);
    } catch {
        const n = new Date();
        return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 12, 0, 0);
    }
}

function parseSafeDate(str: string): Date {
    const parts = str.split('-');
    if (parts.length === 3) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
    }
    return new Date(str);
}

export function DailyMenuEditor() {
    // Current date state
    const [date, setDate] = useState<Date>(() => getTodayInKolkata());
    const dateStr = format(date, 'yyyy-MM-dd');

    // Check if the selected date is Sunday in India
    const isSelectedDateSunday = useMemo(() => isSundayInKolkata(date), [date]);

    // Tab state: 'auto' will show Sunday mode when Sunday is selected, and Weekday mode on weekdays
    const [activeTab, setActiveTab] = useState<'weekday' | 'sunday'>(() => 
        isSundayInKolkata(getTodayInKolkata()) ? 'sunday' : 'weekday'
    );

    // Update active tab when date selection switches between Sunday and weekday
    useEffect(() => {
        if (isSelectedDateSunday) {
            setActiveTab('sunday');
        } else {
            setActiveTab('weekday');
        }
    }, [isSelectedDateSunday]);

    // Sunday prompt dismissal state for current session
    const [isPromptDismissed, setIsPromptDismissed] = useState(false);

    // Hooks
    const { data: menuData, isLoading: isMenuLoading } = useDailyMenu(dateStr);
    const updateMenu = useUpdateDailyMenu();

    // Form State
    const [menuForm, setMenuForm] = useState({
        // Weekday Sabji
        lunchSabji: "",
        dinnerSabji: "",

        // Weekday Three Thalis
        regularPrice: 99,
        regularAvailable: true,
        regularImage: "/thali-regular.jpg",
        regularItemsList: "4 Roti, Dal, Rice, Salad",

        desiPrice: 119,
        desiAvailable: true,
        desiImage: "/thali-desi.jpg",
        desiItemsList: "Dal, 6 Ghee Roti, Boondi Raita, Lahsun Chutney, Salad",

        paneerPrice: 199,
        paneerAvailable: true,
        paneerImage: "/thali-paneer.jpg",
        paneerItemsList: "Dal, 4 Ghee Roti, Jeera Rice, Boondi Raita, Salad, 1 Gulab Jamun",
        paneerSabji: "Paneer Butter Masala",

        // Weekday Breads & Accompaniments
        rotiName: "Ghee Roti",
        rotiQty: 5,
        extraRotiPrice: 10,
        lunchItemsList: "Salad, Dal OR Lahsun Chutney, Desi Chhach",
        dinnerItemsList: "Salad, Dal OR Lahsun Chutney, Desi Chhach",

        // Sunday Lunch: Paratha Special Menu
        sundayLunchItemName: "Sunday Special Paratha Menu",
        sundayLunchPrice: 99,
        sundayParathas: "Aloo Paratha, Paneer Paratha, Pyaj Paratha",
        sundayLunchAccompaniments: "Fresh Dahi, Amul Butter, Hari Chutney, Achar",
        sundayLunchImage: "/thali-enhanced.jpg",
        sundayLunchOpen: true,

        // Sunday Dinner: Special Feast
        sundayItemName: "",
        sundayPrice: 149,
        specialSabzi: "",
        dal: "",
        rice: "",
        rotiPuri: "",
        salad: "",
        dessert: "",
        sundayDescription: "",
        sundayImage: "/thali-enhanced.jpg",
        sundayDinnerOpen: true,
        isSundayConfigured: false,

        // System
        isServiceOff: false
    });

    // AI Photo Studio Modal State
    const [activeImageModal, setActiveImageModal] = useState<{
        isOpen: boolean;
        thaliId: "regular" | "desiSpecial" | "paneerSpecial" | "sunday" | "sundayLunch";
        title: string;
        currentImage: string;
        defaultImage: string;
    } | null>(null);

    // Sync session dismissal state whenever date changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const dismissed = sessionStorage.getItem(`dismiss_sunday_prompt_${dateStr}`) === 'true';
            setIsPromptDismissed(dismissed);
        }
    }, [dateStr]);

    // Populate data from API
    useEffect(() => {
        if (menuData?.data) {
            const m = menuData.data;

            // Parse Roti
            let loadedRotiName = "Ghee Roti";
            let loadedRotiQty = 5;

            const parseItems = (items: any) => {
                if (!items) return "";
                if (Array.isArray(items)) {
                    return items.filter(i => !String(i).toLowerCase().includes('roti')).join(', ');
                }
                return String(items);
            };

            const lunchItems = m.product?.lunchItems || m.weekdayMenu?.lunchItems || [];
            const dinnerItems = m.product?.dinnerItems || m.weekdayMenu?.dinnerItems || [];

            const refItems = lunchItems.length > 0 ? lunchItems : (m.weekdayMenu?.fixedItems || []);
            const itemsArr = Array.isArray(refItems) ? refItems : String(refItems).split(',').map(i => i.trim());
            const rotiItem = itemsArr.find((i: string) => String(i).toLowerCase().includes('roti'));

            if (rotiItem) {
                const match = rotiItem.match(/(\d+)\s+(.+)/);
                if (match) {
                    loadedRotiQty = parseInt(match[1]);
                    loadedRotiName = match[2];
                } else {
                    loadedRotiName = rotiItem;
                }
            }

            const formatThaliItems = (arr: any, fallback: string) => {
                if (Array.isArray(arr) && arr.length > 0) return arr.join(', ');
                if (typeof arr === 'string' && arr.trim()) return arr;
                return fallback;
            };

            const thalis = m.thalis || {};
            const sm = m.sundayMenu || {};

            // Determine if Sunday menu is configured
            const configured = Boolean(
                sm.isConfigured || 
                sm.parathaTypes ||
                sm.specialItemName || 
                sm.specialSabzi || 
                sm.dal || 
                (sm.price > 0 && sm.rotiPuri)
            );

            setMenuForm({
                lunchSabji: m.weekdayMenu?.lunchSabji || m.product?.lunchSabji || "",
                dinnerSabji: m.weekdayMenu?.dinnerSabji || m.product?.dinnerSabji || "",
                
                // Regular Thali
                regularPrice: thalis.regular?.price || m.weekdayMenu?.fixedPrice || 99,
                regularAvailable: thalis.regular?.isAvailable !== false,
                regularImage: thalis.regular?.image || "/thali-regular.jpg",
                regularItemsList: formatThaliItems(thalis.regular?.items, "4 Roti, Dal, Rice, Salad"),

                // Desi Special Thali
                desiPrice: thalis.desiSpecial?.price || 119,
                desiAvailable: thalis.desiSpecial?.isAvailable !== false,
                desiImage: thalis.desiSpecial?.image || "/thali-desi.jpg",
                desiItemsList: formatThaliItems(thalis.desiSpecial?.items, "Dal, 6 Ghee Roti, Boondi Raita, Lahsun Chutney, Salad"),

                // Paneer Special Thali
                paneerPrice: thalis.paneerSpecial?.price || 199,
                paneerAvailable: thalis.paneerSpecial?.isAvailable !== false,
                paneerImage: thalis.paneerSpecial?.image || "/thali-paneer.jpg",
                paneerItemsList: formatThaliItems(thalis.paneerSpecial?.items, "Dal, 4 Ghee Roti, Jeera Rice, Boondi Raita, Salad, 1 Gulab Jamun"),
                paneerSabji: m.weekdayMenu?.paneerSabji || m.paneerSabji || "Paneer Butter Masala",

                // Breads & Accompaniments
                rotiName: loadedRotiName,
                rotiQty: loadedRotiQty,
                extraRotiPrice: m.weekdayMenu?.extraRotiPrice || m.product?.extraRotiPrice || 10,
                lunchItemsList: parseItems(lunchItems),
                dinnerItemsList: parseItems(dinnerItems),

                // Sunday Lunch: Paratha Special Menu
                sundayLunchItemName: sm.lunchItemName || m.product?.lunchProduct?.name || "Sunday Special Paratha Menu",
                sundayLunchPrice: sm.lunchPrice || m.product?.lunchProduct?.price || 99,
                sundayParathas: sm.parathaTypes || m.product?.lunchProduct?.parathas || "Aloo Paratha, Paneer Paratha, Pyaj Paratha",
                sundayLunchAccompaniments: sm.lunchAccompaniments || m.product?.lunchProduct?.accompaniments || "Fresh Dahi, Amul Butter, Hari Chutney, Achar",
                sundayLunchImage: sm.lunchImage || m.product?.lunchProduct?.image || "/thali-enhanced.jpg",
                sundayLunchOpen: sm.isLunchSlotOpen !== false,

                // Sunday Dinner: Special Feast
                sundayItemName: sm.specialItemName || m.product?.dinnerProduct?.name || m.product?.itemName || "",
                sundayPrice: sm.price || (m.dayOfWeek === 'Sunday' ? m.product?.price : 149) || 149,
                specialSabzi: sm.specialSabzi || m.product?.specialSabzi || "",
                dal: sm.dal || m.product?.dal || "",
                rice: sm.rice || m.product?.rice || "",
                rotiPuri: sm.rotiPuri || m.product?.rotiPuri || "",
                salad: sm.salad || m.product?.salad || "",
                dessert: sm.dessert || m.product?.dessert || "",
                sundayDescription: sm.description || m.product?.description || "",
                sundayImage: sm.image || m.product?.dinnerProduct?.image || m.product?.image || "/thali-enhanced.jpg",
                sundayDinnerOpen: sm.isDinnerSlotOpen !== false,
                isSundayConfigured: configured,

                isServiceOff: m.isServiceOff || false
            });
        }
    }, [menuData, date]);

    // Quick AI image generation based on current menu form dishes
    const quickGenerateAiPhoto = (thaliId: "regular" | "desiSpecial" | "paneerSpecial" | "sunday" | "sundayLunch") => {
        const dishText = thaliId === "paneerSpecial"
            ? (menuForm.paneerSabji || "Paneer Butter Masala")
            : thaliId === "sundayLunch"
                ? (menuForm.sundayParathas || "Paratha")
                : thaliId === "sunday"
                    ? (menuForm.sundayItemName || menuForm.specialSabzi || "Chole Bhature")
                    : (menuForm.lunchSabji || menuForm.dinnerSabji || "Seasonal Sabji");

        const matched = matchAiImageForMenu(dishText, thaliId);

        if (thaliId === "regular") {
            setMenuForm(prev => ({ ...prev, regularImage: matched.url }));
        } else if (thaliId === "desiSpecial") {
            setMenuForm(prev => ({ ...prev, desiImage: matched.url }));
        } else if (thaliId === "paneerSpecial") {
            setMenuForm(prev => ({ ...prev, paneerImage: matched.url }));
        } else if (thaliId === "sundayLunch") {
            setMenuForm(prev => ({ ...prev, sundayLunchImage: matched.url }));
        } else {
            setMenuForm(prev => ({ ...prev, sundayImage: matched.url }));
        }
        toast.success(`✨ Matched photo: "${matched.title}"! Save to apply.`);
    };

    // Save Menu
    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        try {
            const rotiStr = `${menuForm.rotiQty} ${menuForm.rotiName}`;

            const lunchArr = menuForm.lunchItemsList.split(',').map(s => s.trim()).filter(Boolean);
            if (!lunchArr.some(i => i.toLowerCase().includes(menuForm.rotiName.toLowerCase()))) {
                lunchArr.unshift(rotiStr);
            }

            const dinnerArr = menuForm.dinnerItemsList.split(',').map(s => s.trim()).filter(Boolean);
            if (!dinnerArr.some(i => i.toLowerCase().includes(menuForm.rotiName.toLowerCase()))) {
                dinnerArr.unshift(rotiStr);
            }

            const payload: any = {
                date: dateStr,
                lunchSabji: menuForm.lunchSabji,
                dinnerSabji: menuForm.dinnerSabji,
                weekdayPrice: Number(menuForm.regularPrice),
                extraRotiPrice: Number(menuForm.extraRotiPrice),
                isServiceOff: menuForm.isServiceOff,

                lunchItems: lunchArr,
                dinnerItems: dinnerArr,
                weekdayItems: lunchArr,

                // Three Thalis Configuration (for Weekdays)
                regularPrice: Number(menuForm.regularPrice),
                regularAvailable: Boolean(menuForm.regularAvailable),
                regularImage: menuForm.regularImage,
                regularItems: menuForm.regularItemsList.split(',').map(s => s.trim()).filter(Boolean),

                desiPrice: Number(menuForm.desiPrice),
                desiAvailable: Boolean(menuForm.desiAvailable),
                desiImage: menuForm.desiImage,
                desiItems: menuForm.desiItemsList.split(',').map(s => s.trim()).filter(Boolean),

                paneerPrice: Number(menuForm.paneerPrice),
                paneerAvailable: Boolean(menuForm.paneerAvailable),
                paneerImage: menuForm.paneerImage,
                paneerSabji: menuForm.paneerSabji,
                paneerItems: menuForm.paneerItemsList.split(',').map(s => s.trim()).filter(Boolean),

                // Sunday Lunch: Paratha Special Menu
                lunchItemName: menuForm.sundayLunchItemName,
                sundayLunchItemName: menuForm.sundayLunchItemName,
                lunchPrice: Number(menuForm.sundayLunchPrice),
                sundayLunchPrice: Number(menuForm.sundayLunchPrice),
                parathaTypes: menuForm.sundayParathas,
                sundayParathas: menuForm.sundayParathas,
                lunchAccompaniments: menuForm.sundayLunchAccompaniments,
                sundayLunchAccompaniments: menuForm.sundayLunchAccompaniments,
                sundayLunchImage: menuForm.sundayLunchImage,
                sundayLunchOpen: menuForm.sundayLunchOpen,

                // Sunday Dinner: Special Feast
                sundayItemName: menuForm.sundayItemName,
                sundayPrice: Number(menuForm.sundayPrice),
                specialSabzi: menuForm.specialSabzi,
                dal: menuForm.dal,
                rice: menuForm.rice,
                rotiPuri: menuForm.rotiPuri,
                salad: menuForm.salad,
                dessert: menuForm.dessert,
                sundayDescription: menuForm.sundayDescription,
                sundayImage: menuForm.sundayImage,
                sundayDinnerOpen: menuForm.sundayDinnerOpen,
                isSundayConfigured: Boolean(
                    menuForm.sundayParathas ||
                    menuForm.sundayItemName || 
                    menuForm.specialSabzi || 
                    menuForm.dal || 
                    (menuForm.sundayPrice > 0 && menuForm.rotiPuri)
                )
            };

            await updateMenu.mutateAsync(payload);
            setMenuForm(prev => ({
                ...prev,
                isSundayConfigured: payload.isSundayConfigured
            }));

            toast.success(`Menu updated successfully for ${format(date, 'EEE, MMM dd, yyyy')}`);
        } catch (error) {
            console.error("Save menu error:", error);
            toast.error("Failed to save menu");
        }
    };

    // Sunday Prompt Visibility Logic
    const isSundayConfiguredForCurrentDate = Boolean(
        menuForm.isSundayConfigured || 
        menuForm.sundayItemName || 
        menuForm.specialSabzi || 
        menuForm.sundayParathas
    );

    const shouldShowSundayPrompt = isSelectedDateSunday && !isSundayConfiguredForCurrentDate && !isPromptDismissed;
    const shouldShowPublishedSundayBanner = isSelectedDateSunday && isSundayConfiguredForCurrentDate;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Top Sunday Prompt Banner (Condition 1: Prompt to configure) */}
            {shouldShowSundayPrompt && (
                <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/10 border-2 border-orange-300 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md">
                                <Sparkles className="w-6 h-6 animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-extrabold text-base sm:text-lg text-stone-900">
                                        Today is Sunday. Have you updated the Sunday Special Menu?
                                    </h3>
                                    <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs font-bold">
                                        Sunday Special
                                    </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                                    Sunday has a distinct menu: <strong>Lunch Parathas</strong> & <strong>Dinner Special Feast</strong> (standard 3 thalis are off on Sunday).
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                            <Button
                                type="button"
                                onClick={() => {
                                    setActiveTab('sunday');
                                    const el = document.getElementById('sunday-menu-container');
                                    el?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-sm h-10 px-4"
                            >
                                <Utensils className="w-4 h-4 mr-1.5" />
                                Update Sunday Menu
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        sessionStorage.setItem(`dismiss_sunday_prompt_${dateStr}`, 'true');
                                    }
                                    setIsPromptDismissed(true);
                                    toast.info("Sunday prompt dismissed for this session");
                                }}
                                className="flex-1 sm:flex-none border-stone-300 text-stone-700 hover:bg-stone-100 h-10 px-4"
                            >
                                <Clock className="w-4 h-4 mr-1.5" />
                                Remind Me Later
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Subtle Sunday Published Status Banner (Condition 2: Already configured) */}
            {shouldShowPublishedSundayBanner && (
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                                Sunday Special Menu is configured & published for {format(date, 'MMM dd, yyyy')}
                                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">Live</Badge>
                            </p>
                            <p className="text-xs text-emerald-700 mt-0.5">
                                🥞 <strong>Lunch:</strong> {menuForm.sundayLunchItemName || "Paratha Special"} (₹{menuForm.sundayLunchPrice}) • 🌙 <strong>Dinner:</strong> {menuForm.sundayItemName || menuForm.specialSabzi || "Special Feast"} (₹{menuForm.sundayPrice})
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setActiveTab('sunday');
                            const el = document.getElementById('sunday-menu-container');
                            el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-emerald-800 border-emerald-300 hover:bg-emerald-100 font-semibold text-xs shrink-0 self-end sm:self-auto"
                    >
                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                        Edit Sunday Menu
                    </Button>
                </div>
            )}

            {/* Main Menu Editor Card */}
            <Card className="border border-stone-200/80 shadow-md rounded-2xl overflow-hidden bg-white">
                {/* Header Toolbar */}
                <CardHeader className="bg-stone-50/70 border-b border-stone-200/70 py-4 px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2.5">
                                <ChefHat className="w-6 h-6 text-orange-600" />
                                Homemade Food Menu Manager
                            </CardTitle>
                            <p className="text-xs text-stone-500 font-medium">
                                {isSelectedDateSunday 
                                    ? "Sunday Mode: Manage Sunday Lunch (Parathas) & Sunday Dinner (Special Feast)." 
                                    : "Weekday Mode: Manage Daily Sabji & 3 Thali tiers (Regular, Desi, Paneer)."}
                            </p>
                        </div>

                        {/* Date Picker & Quick Actions */}
                        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                            <div className="flex items-center bg-white border border-stone-300 rounded-lg p-1 shadow-2xs">
                                <CalendarIcon className="w-4 h-4 text-stone-400 ml-2 mr-1 shrink-0" />
                                <Input
                                    type="date"
                                    value={dateStr}
                                    onChange={(e) => setDate(parseSafeDate(e.target.value))}
                                    className="border-0 h-8 text-xs font-semibold focus-visible:ring-0 p-1 w-32 sm:w-36"
                                />
                                {isSelectedDateSunday && (
                                    <Badge className="bg-amber-100 text-amber-900 text-[10px] font-bold mr-1 shrink-0">
                                        Sunday
                                    </Badge>
                                )}
                            </div>

                            {/* Today Shortcut Button */}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setDate(getTodayInKolkata())}
                                className="h-9 text-xs font-bold text-stone-700 border-stone-300 hover:bg-stone-100"
                            >
                                Today
                            </Button>

                            {/* Share Menu WhatsApp */}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                    const shareText = isSelectedDateSunday 
                                        ? `🍽️ *Tommalu Sunday Special Menu* - ${format(date, 'EEE, MMM do')}\n\n` +
                                          `🥞 *Sunday Lunch (11:30 AM–2:00 PM)*: ${menuForm.sundayLunchItemName || "Special Paratha Brunch"} — ₹${menuForm.sundayLunchPrice}\n` +
                                          `   • Parathas: ${menuForm.sundayParathas}\n` +
                                          `   • Includes: ${menuForm.sundayLunchAccompaniments}\n\n` +
                                          `🌙 *Sunday Dinner (7:30–10:00 PM)*: ${menuForm.sundayItemName || menuForm.specialSabzi || "Sunday Special Feast"} — ₹${menuForm.sundayPrice}\n` +
                                          `   • Includes: ${[menuForm.specialSabzi, menuForm.dal, menuForm.rice, menuForm.rotiPuri, menuForm.dessert].filter(Boolean).join(', ')}\n\n` +
                                          `Order Now: https://tommalu.com/homemade\nWhatsApp: 7742892352`
                                        : generateMenuShareText({
                                            date: date,
                                            lunchSabji: menuForm.lunchSabji,
                                            lunchItems: menuForm.lunchItemsList.split(',').map(s => s.trim()).filter(Boolean),
                                            dinnerSabji: menuForm.dinnerSabji,
                                            dinnerItems: menuForm.dinnerItemsList.split(',').map(s => s.trim()).filter(Boolean),
                                            lunchPrice: Number(menuForm.regularPrice),
                                            dinnerPrice: Number(menuForm.regularPrice),
                                            isSunday: false,
                                            thalis: {
                                                regularPrice: Number(menuForm.regularPrice),
                                                desiPrice: Number(menuForm.desiPrice),
                                                paneerPrice: Number(menuForm.paneerPrice)
                                            }
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
                                className="h-9 text-xs font-bold text-orange-700 border-orange-200 hover:bg-orange-50"
                                title="Share menu on WhatsApp"
                            >
                                <Share2 className="w-3.5 h-3.5 mr-1 text-orange-600" />
                                Share
                            </Button>
                        </div>
                    </div>

                    {/* Operational Banner: Date & Service Off Switch */}
                    <div className="mt-4 pt-3 border-t border-stone-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-stone-600 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>
                                Editing for: <strong className="text-stone-900">{format(date, 'EEEE, MMMM do, yyyy')}</strong>
                            </span>
                            <span className="text-stone-300">•</span>
                            <span className="text-stone-500">Asia/Kolkata</span>
                        </div>

                        {/* Service Off Toggle */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                            menuForm.isServiceOff 
                                ? 'bg-red-50 border-red-300 text-red-900' 
                                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}>
                            <span className="font-bold text-xs">
                                {menuForm.isServiceOff ? '🚨 Emergency Service Off' : 'Kitchen Active'}
                            </span>
                            <input
                                type="checkbox"
                                id="serviceOffToggle"
                                className="h-4 w-4 rounded border-stone-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                checked={menuForm.isServiceOff}
                                onChange={(e) => setMenuForm({ ...menuForm, isServiceOff: e.target.checked })}
                            />
                        </div>
                    </div>

                    {/* Switcher Tabs */}
                    <div className="flex items-center gap-2 mt-4 pt-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('weekday')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                activeTab === 'weekday'
                                    ? 'bg-orange-600 text-white shadow-sm'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                            }`}
                        >
                            <Utensils className="w-3.5 h-3.5" />
                            Weekday Thalis (Mon–Sat)
                            {!isSelectedDateSunday && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                    activeTab === 'weekday' ? 'bg-orange-700 text-white' : 'bg-stone-200 text-stone-700'
                                }`}>
                                    Active Today
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('sunday')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                activeTab === 'sunday'
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            Sunday Special Menu (Lunch & Dinner)
                            {isSelectedDateSunday && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                    activeTab === 'sunday' ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
                                }`}>
                                    Sunday Active
                                </span>
                            )}
                        </button>
                    </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6">
                    {isMenuLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                            <p className="text-xs font-semibold text-stone-500">Loading menu configuration...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-6">
                            {/* ======================================================== */}
                            {/* VIEW 1: WEEKDAY MENU & 3 THALIS (Monday to Saturday) */}
                            {/* ======================================================== */}
                            {activeTab === 'weekday' && (
                                <div className="space-y-6 animate-in fade-in-50 duration-200">
                                    {/* Informational Banner */}
                                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-center justify-between">
                                        <span>📅 <strong>Weekday Schedule (Monday to Saturday):</strong> Standard 3 Thalis + Daily Sabji are active.</span>
                                        {isSelectedDateSunday && (
                                            <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                                                Viewing Weekday Thalis for pre-setting
                                            </span>
                                        )}
                                    </div>

                                    {/* Daily Sabji & Accompaniments */}
                                    <div className="bg-stone-50/80 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                                                <Flame className="w-4 h-4 text-orange-600" />
                                                Daily Sabji & Accompaniments
                                            </h4>
                                            <span className="text-[11px] text-stone-500">Applied across standard daily meals</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Lunch Sabji */}
                                            <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold text-orange-800 flex items-center gap-1.5">
                                                        <Sun className="w-3.5 h-3.5 text-orange-500" />
                                                        Lunch Sabji
                                                    </label>
                                                    <span className="text-[11px] text-stone-400">11:30 AM–2:00 PM</span>
                                                </div>
                                                <Input
                                                    value={menuForm.lunchSabji}
                                                    onChange={(e) => setMenuForm({ ...menuForm, lunchSabji: e.target.value })}
                                                    placeholder="e.g. Aloo Pyaj / Bhindi Masala"
                                                    className="font-medium text-sm"
                                                />
                                                <div className="space-y-1 pt-1">
                                                    <label className="text-[11px] font-semibold text-stone-600">Lunch Accompaniments</label>
                                                    <Input
                                                        value={menuForm.lunchItemsList}
                                                        onChange={(e) => setMenuForm({ ...menuForm, lunchItemsList: e.target.value })}
                                                        placeholder="Salad, Dal OR Lahsun Chutney, Desi Chhach"
                                                        className="text-xs"
                                                    />
                                                </div>
                                            </div>

                                            {/* Dinner Sabji */}
                                            <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                                                        <Moon className="w-3.5 h-3.5 text-indigo-500" />
                                                        Dinner Sabji
                                                    </label>
                                                    <span className="text-[11px] text-stone-400">7:00 PM–10:00 PM</span>
                                                </div>
                                                <Input
                                                    value={menuForm.dinnerSabji}
                                                    onChange={(e) => setMenuForm({ ...menuForm, dinnerSabji: e.target.value })}
                                                    placeholder="e.g. Sev Tamatar / Dal Tadka"
                                                    className="font-medium text-sm"
                                                />
                                                <div className="space-y-1 pt-1">
                                                    <label className="text-[11px] font-semibold text-stone-600">Dinner Accompaniments</label>
                                                    <Input
                                                        value={menuForm.dinnerItemsList}
                                                        onChange={(e) => setMenuForm({ ...menuForm, dinnerItemsList: e.target.value })}
                                                        placeholder="Salad, Dal OR Lahsun Chutney, Sweet"
                                                        className="text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Breads / Roti Settings */}
                                        <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-stone-700">Roti Type</label>
                                                <Input
                                                    value={menuForm.rotiName}
                                                    onChange={(e) => setMenuForm({ ...menuForm, rotiName: e.target.value })}
                                                    placeholder="Ghee Roti / Tawa Roti"
                                                    className="text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-stone-700">Roti Quantity (in Thali)</label>
                                                <Input
                                                    type="number"
                                                    value={menuForm.rotiQty}
                                                    onChange={(e) => setMenuForm({ ...menuForm, rotiQty: Math.max(1, Number(e.target.value)) })}
                                                    min={1}
                                                    className="text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-stone-700">Extra Roti Price (₹)</label>
                                                <Input
                                                    type="number"
                                                    value={menuForm.extraRotiPrice}
                                                    onChange={(e) => setMenuForm({ ...menuForm, extraRotiPrice: Number(e.target.value) })}
                                                    min={0}
                                                    className="text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🍱 Three Thali Cards (Weekday Only) */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-black text-stone-900 text-base flex items-center gap-2">
                                                <Utensils className="w-4 h-4 text-orange-600" />
                                                Weekday Three Thali Options (Mon–Sat)
                                            </h4>
                                            <span className="text-xs text-stone-500 font-medium">Configured per thali tier</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* 1. Regular Thali */}
                                            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3.5 flex flex-col justify-between hover:border-orange-300 transition-colors">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="font-black text-sm text-stone-900 block">Regular Thali</span>
                                                            <span className="text-[10px] font-bold text-orange-600">Everyday Value</span>
                                                        </div>
                                                        <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                                                                checked={menuForm.regularAvailable}
                                                                onChange={(e) => setMenuForm({ ...menuForm, regularAvailable: e.target.checked })}
                                                            />
                                                            <span className={menuForm.regularAvailable ? "text-emerald-700" : "text-rose-600"}>
                                                                {menuForm.regularAvailable ? "Active" : "Off"}
                                                            </span>
                                                        </label>
                                                    </div>

                                                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 group">
                                                        <Image
                                                            src={menuForm.regularImage || "/thali-regular.jpg"}
                                                            alt="Regular Thali"
                                                            fill
                                                            unoptimized
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                        <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md truncate max-w-[85%]">
                                                            {menuForm.lunchSabji || "Seasonal Sabji"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => quickGenerateAiPhoto("regular")}
                                                            className="flex-1 h-7 text-[11px] font-bold text-orange-700 border-orange-200 hover:bg-orange-50 px-2"
                                                        >
                                                            <Sparkles className="w-3 h-3 mr-1 text-orange-600" />
                                                            AI Photo
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setActiveImageModal({
                                                                isOpen: true,
                                                                thaliId: "regular",
                                                                title: "Regular Thali",
                                                                currentImage: menuForm.regularImage || "/thali-regular.jpg",
                                                                defaultImage: "/thali-regular.jpg"
                                                            })}
                                                            className="h-7 text-[11px] font-bold text-stone-600 hover:text-stone-900 px-2"
                                                        >
                                                            <Edit3 className="w-3 h-3 mr-1" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setMenuForm(prev => ({ ...prev, regularImage: "/thali-regular.jpg" }))}
                                                            className="h-7 text-[11px] text-stone-400 hover:text-stone-700 px-1.5"
                                                            title="Reset photo"
                                                        >
                                                            <RotateCcw className="w-3 h-3" />
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-xs text-stone-600 font-bold">Thali Price (₹)</label>
                                                        <Input
                                                            type="number"
                                                            value={menuForm.regularPrice}
                                                            onChange={(e) => setMenuForm({ ...menuForm, regularPrice: Number(e.target.value) })}
                                                            className="font-bold text-sm"
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-xs text-stone-600 font-bold">Included Items</label>
                                                        <Input
                                                            value={menuForm.regularItemsList}
                                                            onChange={(e) => setMenuForm({ ...menuForm, regularItemsList: e.target.value })}
                                                            placeholder="4 Roti, Dal, Rice, Salad"
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 2. Desi Special Thali */}
                                            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3.5 flex flex-col justify-between hover:border-amber-300 transition-colors">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="font-black text-sm text-stone-900 block">Desi Special Thali</span>
                                                            <span className="text-[10px] font-bold text-amber-700">Desi Ghee & Raita</span>
                                                        </div>
                                                        <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                                                                checked={menuForm.desiAvailable}
                                                                onChange={(e) => setMenuForm({ ...menuForm, desiAvailable: e.target.checked })}
                                                            />
                                                            <span className={menuForm.desiAvailable ? "text-emerald-700" : "text-rose-600"}>
                                                                {menuForm.desiAvailable ? "Active" : "Off"}
                                                            </span>
                                                        </label>
                                                    </div>

                                                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 group">
                                                        <Image
                                                            src={menuForm.desiImage || "/thali-desi.jpg"}
                                                            alt="Desi Special Thali"
                                                            fill
                                                            unoptimized
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                        <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md truncate max-w-[85%]">
                                                            Desi Ghee & Raita
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => quickGenerateAiPhoto("desiSpecial")}
                                                            className="flex-1 h-7 text-[11px] font-bold text-amber-800 border-amber-200 hover:bg-amber-50 px-2"
                                                        >
                                                            <Sparkles className="w-3 h-3 mr-1 text-amber-600" />
                                                            AI Photo
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setActiveImageModal({
                                                                isOpen: true,
                                                                thaliId: "desiSpecial",
                                                                title: "Desi Special Thali",
                                                                currentImage: menuForm.desiImage || "/thali-desi.jpg",
                                                                defaultImage: "/thali-desi.jpg"
                                                            })}
                                                            className="h-7 text-[11px] font-bold text-stone-600 hover:text-stone-900 px-2"
                                                        >
                                                            <Edit3 className="w-3 h-3 mr-1" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setMenuForm(prev => ({ ...prev, desiImage: "/thali-desi.jpg" }))}
                                                            className="h-7 text-[11px] text-stone-400 hover:text-stone-700 px-1.5"
                                                            title="Reset photo"
                                                        >
                                                            <RotateCcw className="w-3 h-3" />
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-xs text-stone-600 font-bold">Thali Price (₹)</label>
                                                        <Input
                                                            type="number"
                                                            value={menuForm.desiPrice}
                                                            onChange={(e) => setMenuForm({ ...menuForm, desiPrice: Number(e.target.value) })}
                                                            className="font-bold text-sm"
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-xs text-stone-600 font-bold">Included Items</label>
                                                        <Input
                                                            value={menuForm.desiItemsList}
                                                            onChange={(e) => setMenuForm({ ...menuForm, desiItemsList: e.target.value })}
                                                            placeholder="Dal, 6 Ghee Roti, Boondi Raita, Lahsun Chutney, Salad"
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 3. Paneer Special Thali */}
                                            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3.5 flex flex-col justify-between hover:border-purple-300 transition-colors">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="font-black text-sm text-stone-900 block">Paneer Special Thali</span>
                                                            <span className="text-[10px] font-bold text-purple-700">Royal Paneer Feast</span>
                                                        </div>
                                                        <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                                                                checked={menuForm.paneerAvailable}
                                                                onChange={(e) => setMenuForm({ ...menuForm, paneerAvailable: e.target.checked })}
                                                            />
                                                            <span className={menuForm.paneerAvailable ? "text-emerald-700" : "text-rose-600"}>
                                                                {menuForm.paneerAvailable ? "Active" : "Off"}
                                                            </span>
                                                        </label>
                                                    </div>

                                                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 group">
                                                        <Image
                                                            src={menuForm.paneerImage || "/thali-paneer.jpg"}
                                                            alt="Paneer Special Thali"
                                                            fill
                                                            unoptimized
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                        <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md truncate max-w-[85%]">
                                                            {menuForm.paneerSabji || "Paneer"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => quickGenerateAiPhoto("paneerSpecial")}
                                                            className="flex-1 h-7 text-[11px] font-bold text-purple-800 border-purple-200 hover:bg-purple-50 px-2"
                                                        >
                                                            <Sparkles className="w-3 h-3 mr-1 text-purple-600" />
                                                            AI Photo
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setActiveImageModal({
                                                                isOpen: true,
                                                                thaliId: "paneerSpecial",
                                                                title: "Paneer Special Thali",
                                                                currentImage: menuForm.paneerImage || "/thali-paneer.jpg",
                                                                defaultImage: "/thali-paneer.jpg"
                                                            })}
                                                            className="h-7 text-[11px] font-bold text-stone-600 hover:text-stone-900 px-2"
                                                        >
                                                            <Edit3 className="w-3 h-3 mr-1" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setMenuForm(prev => ({ ...prev, paneerImage: "/thali-paneer.jpg" }))}
                                                            className="h-7 text-[11px] text-stone-400 hover:text-stone-700 px-1.5"
                                                            title="Reset photo"
                                                        >
                                                            <RotateCcw className="w-3 h-3" />
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-xs text-stone-600 font-bold">Thali Price (₹)</label>
                                                        <Input
                                                            type="number"
                                                            value={menuForm.paneerPrice}
                                                            onChange={(e) => setMenuForm({ ...menuForm, paneerPrice: Number(e.target.value) })}
                                                            className="font-bold text-sm"
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-xs text-stone-600 font-bold">Paneer Sabji Name</label>
                                                        <Input
                                                            value={menuForm.paneerSabji}
                                                            onChange={(e) => setMenuForm({ ...menuForm, paneerSabji: e.target.value })}
                                                            placeholder="e.g. Paneer Butter Masala / Shahi Paneer"
                                                            className="text-xs"
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-xs text-stone-600 font-bold">Included Items</label>
                                                        <Input
                                                            value={menuForm.paneerItemsList}
                                                            onChange={(e) => setMenuForm({ ...menuForm, paneerItemsList: e.target.value })}
                                                            placeholder="Dal, 4 Ghee Roti, Jeera Rice, Boondi Raita, Salad, 1 Gulab Jamun"
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ======================================================== */}
                            {/* VIEW 2: SUNDAY SPECIAL MENU (Lunch Parathas & Dinner Feast) */}
                            {/* Standard 3 thalis are NOT displayed on Sunday! */}
                            {/* ======================================================== */}
                            {activeTab === 'sunday' && (
                                <div id="sunday-menu-container" className="space-y-6 animate-in fade-in-50 duration-200">
                                    {/* Sunday Policy Notice */}
                                    <div className="p-3.5 bg-amber-500/10 border border-amber-300 rounded-xl text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                                            <span>
                                                <strong>Sunday Special Mode Active:</strong> Weekday 3 thalis are disabled on Sundays. Customer app will exclusively show <strong>Sunday Lunch (Paratha Special)</strong> and <strong>Sunday Dinner (Special Feast)</strong>.
                                            </span>
                                        </div>
                                        <Badge className="bg-amber-600 text-white text-[10px] font-bold shrink-0">
                                            No Standard Thalis
                                        </Badge>
                                    </div>

                                    {/* 1. SUNDAY LUNCH: PARATHA SPECIAL MENU */}
                                    <div className="p-4 sm:p-5 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/60 rounded-2xl border-2 border-orange-200/90 shadow-sm space-y-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-orange-200/80 pb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
                                                    <Sun className="w-5 h-5 text-amber-200" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-base text-stone-900 flex items-center gap-2">
                                                        ☀️ Sunday Lunch — Paratha Special Menu
                                                    </h4>
                                                    <p className="text-xs text-stone-500 font-medium">
                                                        Special weekend brunch (Crispy Stuffed Parathas with Dahi, Butter, Chutney & Achar)
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Lunch Slot Toggle */}
                                            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-orange-200 shadow-2xs">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                                    checked={menuForm.sundayLunchOpen}
                                                    onChange={(e) => setMenuForm({ ...menuForm, sundayLunchOpen: e.target.checked })}
                                                />
                                                <span className={menuForm.sundayLunchOpen ? "text-emerald-700" : "text-rose-600"}>
                                                    {menuForm.sundayLunchOpen ? "Lunch Slot Open" : "Lunch Slot Closed"}
                                                </span>
                                            </label>
                                        </div>

                                        {/* Quick Presets for Sunday Lunch */}
                                        <div className="flex items-center gap-2 flex-wrap bg-white/70 p-2.5 rounded-xl border border-orange-200/60 shadow-2xs">
                                            <span className="text-[11px] font-extrabold text-orange-900 uppercase tracking-wide flex items-center gap-1">
                                                ⚡ 1-Click Lunch Presets:
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMenuForm(prev => ({
                                                        ...prev,
                                                        sundayLunchItemName: "Sunday Special Paratha Menu",
                                                        sundayLunchPrice: 99,
                                                        sundayParathas: "Aloo Paratha, Paneer Paratha, Pyaj Paratha, Gobhi Paratha",
                                                        sundayLunchAccompaniments: "Fresh Dahi, Amul Butter, Hari Chutney, Achar",
                                                        sundayLunchImage: "/thali-enhanced.jpg"
                                                    }));
                                                    toast.success("Loaded 'Mix Paratha Platter' preset!");
                                                }}
                                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-950 border border-orange-300 transition-colors cursor-pointer shadow-2xs active:scale-95"
                                            >
                                                🥞 Mix Parathas (Aloo, Paneer, Pyaj, Gobhi)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMenuForm(prev => ({
                                                        ...prev,
                                                        sundayLunchItemName: "Special Paneer & Aloo Paratha Brunch",
                                                        sundayLunchPrice: 109,
                                                        sundayParathas: "Desi Ghee Paneer Paratha, Spicy Aloo Paratha",
                                                        sundayLunchAccompaniments: "Thick Sweet Lassi / Dahi, Amul Butter, Garlic Dip",
                                                        sundayLunchImage: "/thali-enhanced.jpg"
                                                    }));
                                                    toast.success("Loaded 'Paneer & Aloo Paratha' preset!");
                                                }}
                                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-colors cursor-pointer shadow-2xs active:scale-95"
                                            >
                                                🧀 Royal Paneer & Aloo Paratha
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-stone-800">
                                                    Lunch Menu Title
                                                </label>
                                                <Input
                                                    value={menuForm.sundayLunchItemName}
                                                    onChange={(e) => setMenuForm({ ...menuForm, sundayLunchItemName: e.target.value })}
                                                    placeholder="e.g. Sunday Special Paratha Menu"
                                                    className="font-bold text-sm bg-white"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-stone-800">
                                                    Sunday Lunch Price (₹)
                                                </label>
                                                <Input
                                                    type="number"
                                                    value={menuForm.sundayLunchPrice}
                                                    onChange={(e) => setMenuForm({ ...menuForm, sundayLunchPrice: Number(e.target.value) })}
                                                    placeholder="99"
                                                    className="font-bold text-sm bg-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Paratha Varieties & Accompaniments */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                                                    <span>🥞 Paratha Varieties (Customizable)</span>
                                                </label>
                                                <Input
                                                    value={menuForm.sundayParathas}
                                                    onChange={(e) => setMenuForm({ ...menuForm, sundayParathas: e.target.value })}
                                                    placeholder="e.g. Aloo Paratha, Paneer Paratha, Pyaj Paratha, Gobhi Paratha"
                                                    className="text-xs bg-white"
                                                />
                                                <p className="text-[11px] text-stone-500">List the parathas made fresh for Sunday lunch.</p>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-stone-800">
                                                    Accompaniments (Dahi, Butter, Chutney, etc.)
                                                </label>
                                                <Input
                                                    value={menuForm.sundayLunchAccompaniments}
                                                    onChange={(e) => setMenuForm({ ...menuForm, sundayLunchAccompaniments: e.target.value })}
                                                    placeholder="e.g. Fresh Dahi, Amul Butter, Hari Chutney, Achar"
                                                    className="text-xs bg-white"
                                                />
                                                <p className="text-[11px] text-stone-500">Items served along with the parathas.</p>
                                            </div>
                                        </div>

                                        {/* Photo Row */}
                                        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-orange-100">
                                            <div className="relative w-24 h-18 rounded-lg overflow-hidden bg-stone-100 border shrink-0">
                                                <Image
                                                    src={menuForm.sundayLunchImage || "/thali-enhanced.jpg"}
                                                    alt="Sunday Lunch Parathas"
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-1 text-center sm:text-left">
                                                <span className="text-xs font-bold text-stone-800 block">Sunday Lunch Photo</span>
                                                <p className="text-[11px] text-stone-500">Photo displayed on customer lunch card.</p>
                                                <div className="flex items-center gap-2 pt-0.5 justify-center sm:justify-start">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => quickGenerateAiPhoto("sundayLunch")}
                                                        className="h-7 text-xs font-bold text-orange-700 border-orange-200 hover:bg-orange-50"
                                                    >
                                                        <Sparkles className="w-3.5 h-3.5 mr-1 text-orange-600" />
                                                        ✨ Match Paratha Photo
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setActiveImageModal({
                                                            isOpen: true,
                                                            thaliId: "sundayLunch",
                                                            title: "Sunday Lunch: Paratha Menu",
                                                            currentImage: menuForm.sundayLunchImage || "/thali-enhanced.jpg",
                                                            defaultImage: "/thali-enhanced.jpg"
                                                        })}
                                                        className="h-7 text-xs font-bold text-stone-600 hover:text-stone-900"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                                                        Edit Photo
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. SUNDAY DINNER: SPECIAL FEAST */}
                                    <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 rounded-2xl border-2 border-indigo-200/90 shadow-sm space-y-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-200/80 pb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                                    <Moon className="w-5 h-5 text-indigo-200" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-base text-stone-900 flex items-center gap-2">
                                                        🌙 Sunday Dinner — Special Feast
                                                    </h4>
                                                    <p className="text-xs text-stone-500 font-medium">
                                                        Full royal dinner feast (Special Sabzi, Dal, Rice, Roti/Puri, Salad, Dessert)
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Dinner Slot Toggle */}
                                            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-indigo-200 shadow-2xs">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                    checked={menuForm.sundayDinnerOpen}
                                                    onChange={(e) => setMenuForm({ ...menuForm, sundayDinnerOpen: e.target.checked })}
                                                />
                                                <span className={menuForm.sundayDinnerOpen ? "text-emerald-700" : "text-rose-600"}>
                                                    {menuForm.sundayDinnerOpen ? "Dinner Slot Open" : "Dinner Slot Closed"}
                                                </span>
                                            </label>
                                        </div>

                                        {/* Quick Presets for Sunday Dinner (Dal Baati Churma, Chole Bhature, Shahi Paneer) */}
                                        <div className="flex items-center gap-2 flex-wrap bg-white/70 p-2.5 rounded-xl border border-indigo-200/60 shadow-2xs">
                                            <span className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-wide flex items-center gap-1">
                                                ⚡ 1-Click Dinner Presets:
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMenuForm(prev => ({
                                                        ...prev,
                                                        sundayItemName: "Rajasthani Dal Baati Churma Special",
                                                        sundayPrice: 149,
                                                        specialSabzi: "Gatta Masala Curry",
                                                        dal: "Panchmel Dal Tadka in Desi Ghee",
                                                        rice: "Jeera Rice",
                                                        rotiPuri: "4 Desi Ghee Baati",
                                                        salad: "Lahsun Chutney & Pyaj Salad",
                                                        dessert: "Desi Ghee Churma Ladoo",
                                                        sundayDescription: "Authentic Rajasthani Dal Baati Churma cooked in pure desi ghee.",
                                                        sundayImage: "/thali-dal-baati.jpg"
                                                    }));
                                                    toast.success("Loaded 'Dal Baati Churma' preset! Click Save to publish.");
                                                }}
                                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-950 border border-indigo-300 transition-colors cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                                            >
                                                🍲 Dal Baati Churma (₹149)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMenuForm(prev => ({
                                                        ...prev,
                                                        sundayItemName: "Sunday Special Chole Bhature Feast",
                                                        sundayPrice: 129,
                                                        specialSabzi: "Amritsari Pindi Chole",
                                                        dal: "Boondi Raita",
                                                        rice: "Jeera Rice",
                                                        rotiPuri: "2 Fluffy Paneer Bhature",
                                                        salad: "Sirka Pyaz, Green Chilli & Achar",
                                                        dessert: "1 Hot Gulab Jamun",
                                                        sundayDescription: "Authentic Sunday Chole Bhature with spicy chole, fresh bhature & sweet.",
                                                        sundayImage: "/thali-chole-bhature.jpg"
                                                    }));
                                                    toast.success("Loaded 'Chole Bhature' preset! Click Save to publish.");
                                                }}
                                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-colors cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                                            >
                                                🥘 Chole Bhature Feast (₹129)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMenuForm(prev => ({
                                                        ...prev,
                                                        sundayItemName: "Shahi Paneer Royal Sunday Feast",
                                                        sundayPrice: 149,
                                                        specialSabzi: "Shahi Paneer Butter Masala",
                                                        dal: "Dal Makhani Tadka",
                                                        rice: "Matar Pulao",
                                                        rotiPuri: "4 Butter Tawa Roti / Poori",
                                                        salad: "Green Salad & Mint Chutney",
                                                        dessert: "1 Gulab Jamun",
                                                        sundayDescription: "Royal Sunday dinner feast with rich paneer and sweet.",
                                                        sundayImage: "/thali-paneer.jpg"
                                                    }));
                                                    toast.success("Loaded 'Shahi Paneer Feast' preset! Click Save to publish.");
                                                }}
                                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-300 transition-colors cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                                            >
                                                🧀 Shahi Paneer Feast (₹149)
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-stone-800">
                                                    Feast Title / Special Item <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    value={menuForm.sundayItemName}
                                                    onChange={(e) => setMenuForm({ ...menuForm, sundayItemName: e.target.value })}
                                                    placeholder="e.g. Rajasthani Royal Feast / Dal Baati Churma"
                                                    className="font-bold text-sm bg-white"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-stone-800">
                                                    Sunday Dinner Special Price (₹) <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    type="number"
                                                    value={menuForm.sundayPrice}
                                                    onChange={(e) => setMenuForm({ ...menuForm, sundayPrice: Number(e.target.value) })}
                                                    placeholder="149"
                                                    className="font-bold text-sm bg-white"
                                                />
                                            </div>
                                        </div>

                                        {/* 6 Structured Dishes */}
                                        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs space-y-3">
                                            <div className="border-b border-stone-100 pb-2">
                                                <h5 className="font-extrabold text-xs text-stone-900 uppercase tracking-wide">
                                                    🍱 Sunday Dinner Dishes (Configurable)
                                                </h5>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-indigo-900">1. Sabzi / Special Dish</label>
                                                    <Input
                                                        value={menuForm.specialSabzi}
                                                        onChange={(e) => setMenuForm({ ...menuForm, specialSabzi: e.target.value })}
                                                        placeholder="e.g. Gatta Masala Curry / Shahi Paneer"
                                                        className="text-xs"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-indigo-900">2. Dal</label>
                                                    <Input
                                                        value={menuForm.dal}
                                                        onChange={(e) => setMenuForm({ ...menuForm, dal: e.target.value })}
                                                        placeholder="e.g. Panchmel Dal / Dal Tadka"
                                                        className="text-xs"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-indigo-900">3. Rice</label>
                                                    <Input
                                                        value={menuForm.rice}
                                                        onChange={(e) => setMenuForm({ ...menuForm, rice: e.target.value })}
                                                        placeholder="e.g. Jeera Rice / Veg Pulao"
                                                        className="text-xs"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-indigo-900">4. Breads / Baati / Puri</label>
                                                    <Input
                                                        value={menuForm.rotiPuri}
                                                        onChange={(e) => setMenuForm({ ...menuForm, rotiPuri: e.target.value })}
                                                        placeholder="e.g. 4 Desi Ghee Baati / 5 Ajwain Puri"
                                                        className="text-xs"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-indigo-900">5. Salad</label>
                                                    <Input
                                                        value={menuForm.salad}
                                                        onChange={(e) => setMenuForm({ ...menuForm, salad: e.target.value })}
                                                        placeholder="e.g. Green Salad / Kachumber"
                                                        className="text-xs"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-indigo-900">6. Dessert</label>
                                                    <Input
                                                        value={menuForm.dessert}
                                                        onChange={(e) => setMenuForm({ ...menuForm, dessert: e.target.value })}
                                                        placeholder="e.g. Gulab Jamun / Moong Halwa"
                                                        className="text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1 pt-1">
                                                <label className="text-[11px] font-bold text-stone-600">Special Notes</label>
                                                <Input
                                                    value={menuForm.sundayDescription}
                                                    onChange={(e) => setMenuForm({ ...menuForm, sundayDescription: e.target.value })}
                                                    placeholder="e.g. Authentic Sunday dinner feast cooked in pure desi ghee."
                                                    className="text-xs"
                                                />
                                            </div>
                                        </div>

                                        {/* Dinner Photo Row */}
                                        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-indigo-100">
                                            <div className="relative w-24 h-18 rounded-lg overflow-hidden bg-stone-100 border shrink-0">
                                                <Image
                                                    src={menuForm.sundayImage || "/thali-enhanced.jpg"}
                                                    alt="Sunday Dinner Feast"
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-1 text-center sm:text-left">
                                                <span className="text-xs font-bold text-stone-800 block">Sunday Dinner Photo</span>
                                                <p className="text-[11px] text-stone-500">Photo displayed on customer dinner feast card.</p>
                                                <div className="flex items-center gap-2 pt-0.5 justify-center sm:justify-start">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => quickGenerateAiPhoto("sunday")}
                                                        className="h-7 text-xs font-bold text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                                                    >
                                                        <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                                                        ✨ Match Feast Photo
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setActiveImageModal({
                                                            isOpen: true,
                                                            thaliId: "sunday",
                                                            title: "Sunday Dinner: Special Feast",
                                                            currentImage: menuForm.sundayImage || "/thali-enhanced.jpg",
                                                            defaultImage: "/thali-enhanced.jpg"
                                                        })}
                                                        className="h-7 text-xs font-bold text-stone-600 hover:text-stone-900"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                                                        Edit Photo
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold h-12 text-sm shadow-md rounded-xl transition-all"
                                    disabled={updateMenu.isPending}
                                >
                                    {updateMenu.isPending ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Saving & Publishing Menu...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5 mr-2" />
                                            Save & Publish Menu for {format(date, 'EEEE, MMM dd')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>

            {/* AI Photo Studio & Prompt Editor Modal */}
            {activeImageModal && (
                <AiThaliImageModal
                    isOpen={activeImageModal.isOpen}
                    onClose={() => setActiveImageModal(null)}
                    thaliId={activeImageModal.thaliId}
                    thaliTitle={activeImageModal.title}
                    currentImage={activeImageModal.currentImage}
                    defaultImage={activeImageModal.defaultImage}
                    menuDetails={{
                        sabji: menuForm.lunchSabji || menuForm.dinnerSabji,
                        paneerSabji: menuForm.paneerSabji,
                        rotiName: menuForm.rotiName,
                        rotiQty: menuForm.rotiQty,
                        items: menuForm.lunchItemsList,
                        isSunday: isSelectedDateSunday,
                        sundayItem: activeImageModal.thaliId === "sundayLunch" 
                            ? menuForm.sundayParathas 
                            : (menuForm.sundayItemName || menuForm.specialSabzi)
                    }}
                    onApplyImage={(newUrl) => {
                        if (activeImageModal.thaliId === "regular") {
                            setMenuForm(prev => ({ ...prev, regularImage: newUrl }));
                        } else if (activeImageModal.thaliId === "desiSpecial") {
                            setMenuForm(prev => ({ ...prev, desiImage: newUrl }));
                        } else if (activeImageModal.thaliId === "paneerSpecial") {
                            setMenuForm(prev => ({ ...prev, paneerImage: newUrl }));
                        } else if (activeImageModal.thaliId === "sundayLunch") {
                            setMenuForm(prev => ({ ...prev, sundayLunchImage: newUrl }));
                        } else {
                            setMenuForm(prev => ({ ...prev, sundayImage: newUrl }));
                        }
                    }}
                />
            )}
        </div>
    );
}
