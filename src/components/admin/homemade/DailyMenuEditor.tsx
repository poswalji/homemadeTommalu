"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format, addDays, subDays } from 'date-fns';
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
    Coffee,
    Eye,
    Check,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    X,
    Info,
    ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import { useDailyMenu, useUpdateDailyMenu } from '@/hooks/api/use-homemade-food';
import { generateMenuShareText } from '@/utils/menuShare';
import { AiThaliImageModal, matchAiImageForMenu } from './AiThaliImageModal';
import { composeThaliItems, parseCommaItems, extractUniqueItems } from '@/utils/menuComposition';

// Popular Indian dish chips for 1-click quick setup
const POPULAR_LUNCH_SABJIS = [
    "Aloo Palak",
    "Bhindi Masala",
    "Mix Veg",
    "Gatta Masala Curry",
    "Aloo Gobhi Matar",
    "Lauki Chana Dal",
    "Rajma Masala"
];

const POPULAR_DINNER_SABJIS = [
    "Sev Tamatar",
    "Dal Tadka",
    "Aloo Shimla Mirch",
    "Dum Aloo",
    "Baingan Bharta",
    "Kadhi Pakoda",
    "Chole Masala"
];

const POPULAR_PANEER_SABJIS = [
    "Paneer Butter Masala",
    "Shahi Paneer",
    "Kadhai Paneer",
    "Matar Paneer",
    "Palak Paneer",
    "Paneer Do Pyaza"
];

const COMMON_ACCOMPANIMENT_TAGS = [
    "Dal Tadka",
    "Steamed Rice",
    "Green Salad",
    "Desi Chach",
    "Boondi Raita",
    "Papad",
    "Achar",
    "Gulab Jamun"
];

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

    // Tab state: 'weekday' | 'sunday'
    const [activeTab, setActiveTab] = useState<'weekday' | 'sunday'>(() => 
        isSundayInKolkata(getTodayInKolkata()) ? 'sunday' : 'weekday'
    );

    // Live Preview slot toggle: 'lunch' | 'dinner'
    const [previewSlot, setPreviewSlot] = useState<'lunch' | 'dinner'>('lunch');

    // Update active tab when date selection switches between Sunday and weekday
    useEffect(() => {
        if (isSelectedDateSunday) {
            setActiveTab('sunday');
        } else {
            setActiveTab('weekday');
        }
    }, [isSelectedDateSunday]);

    // Hooks
    const { data: menuData, isLoading: isMenuLoading } = useDailyMenu(dateStr);
    const updateMenu = useUpdateDailyMenu();

    // Default Form State
    const defaultForm = {
        // Section 1: Shared Daily Menu
        lunchSabji: "Aloo Palak",
        dinnerSabji: "Sev Tamatar",
        lunchItemsList: "Dal Tadka, Steamed Rice, Green Salad, Desi Chach",
        dinnerItemsList: "Dal Tadka, Steamed Rice, Green Salad",
        rotiName: "Ghee Roti",
        rotiType: "Ghee Roti",
        rotiQty: 4,
        extraRotiPrice: 10,

        // Section 2: Weekday Three Thalis
        regularPrice: 99,
        regularAvailable: true,
        regularImage: "/thali-regular.jpg",
        regularDescription: "Daily comfort meal with home-style goodness",
        regularUniqueItems: "", // Empty: inherits shared menu completely!

        desiPrice: 119,
        desiAvailable: true,
        desiImage: "/thali-desi.jpg",
        desiDescription: "Rich meal with extra roti, raita & garlic chutney",
        desiUniqueItems: "Boondi Raita, Lahsun Chutney, 5 Ghee Roti",

        paneerPrice: 199,
        paneerAvailable: true,
        paneerImage: "/thali-paneer.jpg",
        paneerSabji: "Paneer Butter Masala",
        paneerDescription: "Premium royal feast with rich paneer delicacy & sweet",
        paneerUniqueItems: "Boondi Raita, 1 Gulab Jamun",

        // Section 3: Sunday Special Menu
        // Sunday Lunch (Paratha Special Menu)
        sundayLunchItemName: "Sunday Special Paratha Menu",
        sundayLunchPrice: 99,
        sundayParathas: "Aloo Paratha, Paneer Paratha, Pyaj Paratha, Gobhi Paratha",
        sundayLunchAccompaniments: "Fresh Dahi, Amul Butter, Hari Chutney, Achar",
        sundayLunchImage: "/thali-enhanced.jpg",
        sundayLunchOpen: true,

        // Sunday Dinner (Special Feast)
        sundayItemName: "Rajasthani Dal Baati Churma Special",
        sundayPrice: 149,
        specialSabzi: "Gatta Masala Curry",
        dal: "Panchmel Dal Tadka in Desi Ghee",
        rice: "Jeera Rice",
        rotiPuri: "4 Desi Ghee Baati",
        salad: "Lahsun Chutney & Pyaj Salad",
        dessert: "Desi Ghee Churma Ladoo",
        sundayDescription: "Authentic Rajasthani Dal Baati Churma cooked in pure desi ghee.",
        sundayImage: "/thali-dal-baati.jpg",
        sundayDinnerOpen: true,
        isSundayConfigured: false,

        // Emergency / Operational Switch
        isServiceOff: false
    };

    const [menuForm, setMenuForm] = useState(defaultForm);
    const initialFormRef = useRef<string>(JSON.stringify(defaultForm));

    // Detect unsaved changes (isDirty)
    const isDirty = useMemo(() => {
        return JSON.stringify(menuForm) !== initialFormRef.current;
    }, [menuForm]);

    // AI Photo Studio Modal State
    const [activeImageModal, setActiveImageModal] = useState<{
        isOpen: boolean;
        thaliId: "regular" | "desiSpecial" | "paneerSpecial" | "sunday" | "sundayLunch";
        title: string;
        currentImage: string;
        defaultImage: string;
    } | null>(null);

    // Populate data from API
    useEffect(() => {
        if (menuData?.data) {
            const m = menuData.data;
            const thalis = m.thalis || {};
            const sm = m.sundayMenu || {};
            const wm = m.weekdayMenu || {};
            const prod = m.product || {};

            // Roti settings
            let loadedRotiName = wm.rotiType || prod.rotiType || "Ghee Roti";
            let loadedRotiQty = Number(wm.defaultRotiQty || prod.defaultRotiQty || 4);

            // Extract shared accompaniments
            const parseAccList = (items: any, fallback: string) => {
                if (!items) return fallback;
                if (Array.isArray(items)) {
                    // Filter out roti strings so roti stays cleanly in its dedicated settings
                    const filtered = items.filter(i => !String(i).toLowerCase().includes('roti'));
                    if (filtered.length > 0) return filtered.join(', ');
                }
                return String(items);
            };

            const lunchAcc = parseAccList(prod.lunchItems || wm.lunchItems, "Dal Tadka, Steamed Rice, Green Salad, Desi Chach");
            const dinnerAcc = parseAccList(prod.dinnerItems || wm.dinnerItems, "Dal Tadka, Steamed Rice, Green Salad");

            // Extract unique thali items
            const defaultRotiStr = `${loadedRotiQty} ${loadedRotiName}`;
            const lunchSabjiStr = wm.lunchSabji || prod.lunchSabji || "";

            const getUniqueItemsString = (thaliKey: 'regular' | 'desiSpecial' | 'paneerSpecial', defaultFallback: string) => {
                const thaliObj = thalis[thaliKey];
                if (thaliObj?.uniqueItems && Array.isArray(thaliObj.uniqueItems) && thaliObj.uniqueItems.length > 0) {
                    return thaliObj.uniqueItems.join(', ');
                }
                if (thaliObj?.items && Array.isArray(thaliObj.items) && thaliObj.items.length > 0) {
                    // Automatically deduce unique additions by removing shared items
                    const extracted = extractUniqueItems(thaliObj.items, lunchSabjiStr, defaultRotiStr, lunchAcc);
                    if (extracted.length > 0) return extracted.join(', ');
                }
                return defaultFallback;
            };

            const regularUnique = getUniqueItemsString('regular', "");
            const desiUnique = getUniqueItemsString('desiSpecial', "Boondi Raita, Lahsun Chutney, 5 Ghee Roti");
            const paneerUnique = getUniqueItemsString('paneerSpecial', "Boondi Raita, 1 Gulab Jamun");

            const configured = Boolean(
                sm.isConfigured || 
                sm.parathaTypes ||
                sm.specialItemName || 
                sm.specialSabzi || 
                sm.dal || 
                (sm.price > 0 && sm.rotiPuri)
            );

            const loadedState = {
                // Section 1: Shared Daily Menu
                lunchSabji: wm.lunchSabji || prod.lunchSabji || "",
                dinnerSabji: wm.dinnerSabji || prod.dinnerSabji || "",
                lunchItemsList: lunchAcc,
                dinnerItemsList: dinnerAcc,
                rotiName: loadedRotiName,
                rotiType: loadedRotiName,
                rotiQty: loadedRotiQty,
                extraRotiPrice: wm.extraRotiPrice || prod.extraRotiPrice || 10,

                // Section 2: Weekday Three Thalis
                regularPrice: thalis.regular?.price ?? wm.fixedPrice ?? 99,
                regularAvailable: thalis.regular?.isAvailable !== false,
                regularImage: thalis.regular?.image || "/thali-regular.jpg",
                regularDescription: thalis.regular?.description || "Daily comfort meal with home-style goodness",
                regularUniqueItems: regularUnique,

                desiPrice: thalis.desiSpecial?.price ?? 119,
                desiAvailable: thalis.desiSpecial?.isAvailable !== false,
                desiImage: thalis.desiSpecial?.image || "/thali-desi.jpg",
                desiDescription: thalis.desiSpecial?.description || "Rich meal with extra roti, raita & garlic chutney",
                desiUniqueItems: desiUnique,

                paneerPrice: thalis.paneerSpecial?.price ?? 199,
                paneerAvailable: thalis.paneerSpecial?.isAvailable !== false,
                paneerImage: thalis.paneerSpecial?.image || "/thali-paneer.jpg",
                paneerSabji: wm.paneerSabji || m.paneerSabji || "Paneer Butter Masala",
                paneerDescription: thalis.paneerSpecial?.description || "Premium royal feast with rich paneer delicacy & sweet",
                paneerUniqueItems: paneerUnique,

                // Section 3: Sunday Special Menu
                sundayLunchItemName: sm.lunchItemName || prod.lunchProduct?.name || "Sunday Special Paratha Menu",
                sundayLunchPrice: sm.lunchPrice || prod.lunchProduct?.price || 99,
                sundayParathas: sm.parathaTypes || prod.lunchProduct?.parathas || "Aloo Paratha, Paneer Paratha, Pyaj Paratha, Gobhi Paratha",
                sundayLunchAccompaniments: sm.lunchAccompaniments || prod.lunchProduct?.accompaniments || "Fresh Dahi, Amul Butter, Hari Chutney, Achar",
                sundayLunchImage: sm.lunchImage || prod.lunchProduct?.image || "/thali-enhanced.jpg",
                sundayLunchOpen: sm.isLunchSlotOpen !== false,

                sundayItemName: sm.specialItemName || prod.dinnerProduct?.name || prod.itemName || "",
                sundayPrice: sm.price || (m.dayOfWeek === 'Sunday' ? prod.price : 149) || 149,
                specialSabzi: sm.specialSabzi || prod.specialSabzi || "",
                dal: sm.dal || prod.dal || "",
                rice: sm.rice || prod.rice || "",
                rotiPuri: sm.rotiPuri || prod.rotiPuri || "",
                salad: sm.salad || prod.salad || "",
                dessert: sm.dessert || prod.dessert || "",
                sundayDescription: sm.description || prod.description || "",
                sundayImage: sm.image || prod.dinnerProduct?.image || prod.image || "/thali-enhanced.jpg",
                sundayDinnerOpen: sm.isDinnerSlotOpen !== false,
                isSundayConfigured: configured,

                isServiceOff: m.isServiceOff || false
            };

            setMenuForm(loadedState);
            initialFormRef.current = JSON.stringify(loadedState);
        }
    }, [menuData, date]);

    // Automatic Menu Composition Engine (Live Reactive Calculations)
    const activePreviewSabji = previewSlot === 'lunch' ? (menuForm.lunchSabji || "Seasonal Sabji") : (menuForm.dinnerSabji || "Seasonal Sabji");
    const activePreviewAccompaniments = previewSlot === 'lunch' ? menuForm.lunchItemsList : menuForm.dinnerItemsList;

    const composedRegular = useMemo(() => {
        return composeThaliItems({
            sabji: activePreviewSabji,
            rotiType: menuForm.rotiType,
            rotiQty: menuForm.rotiQty,
            commonItems: activePreviewAccompaniments,
            uniqueItems: menuForm.regularUniqueItems
        });
    }, [activePreviewSabji, menuForm.rotiType, menuForm.rotiQty, activePreviewAccompaniments, menuForm.regularUniqueItems]);

    const composedDesi = useMemo(() => {
        return composeThaliItems({
            sabji: activePreviewSabji,
            rotiType: menuForm.rotiType,
            rotiQty: menuForm.rotiQty + 1, // Desi thali gets extra roti by default
            commonItems: activePreviewAccompaniments,
            uniqueItems: menuForm.desiUniqueItems
        });
    }, [activePreviewSabji, menuForm.rotiType, menuForm.rotiQty, activePreviewAccompaniments, menuForm.desiUniqueItems]);

    const composedPaneer = useMemo(() => {
        return composeThaliItems({
            sabji: menuForm.paneerSabji || "Paneer Butter Masala",
            rotiType: menuForm.rotiType,
            rotiQty: menuForm.rotiQty,
            commonItems: activePreviewAccompaniments,
            uniqueItems: menuForm.paneerUniqueItems,
            isPaneerSpecial: true
        });
    }, [menuForm.paneerSabji, menuForm.rotiType, menuForm.rotiQty, activePreviewAccompaniments, menuForm.paneerUniqueItems]);

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

    // Save Menu with Centralized Composition
    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        try {
            // Pre-compose thalis using the deduplication engine
            const regularComposed = composeThaliItems({
                sabji: menuForm.lunchSabji || '1 Seasonal Sabji',
                rotiType: menuForm.rotiType,
                rotiQty: menuForm.rotiQty,
                commonItems: menuForm.lunchItemsList,
                uniqueItems: menuForm.regularUniqueItems
            });

            const desiComposed = composeThaliItems({
                sabji: menuForm.lunchSabji || '1 Seasonal Sabji',
                rotiType: menuForm.rotiType,
                rotiQty: menuForm.rotiQty + 1,
                commonItems: menuForm.lunchItemsList,
                uniqueItems: menuForm.desiUniqueItems
            });

            const paneerComposed = composeThaliItems({
                sabji: menuForm.paneerSabji || 'Paneer Butter Masala',
                rotiType: menuForm.rotiType,
                rotiQty: menuForm.rotiQty,
                commonItems: menuForm.lunchItemsList,
                uniqueItems: menuForm.paneerUniqueItems,
                isPaneerSpecial: true
            });

            const lunchArr = parseCommaItems(menuForm.lunchItemsList);
            const defaultRotiStr = `${menuForm.rotiQty} ${menuForm.rotiName}`;
            if (!lunchArr.some(i => i.toLowerCase().includes('roti'))) {
                lunchArr.unshift(defaultRotiStr);
            }

            const dinnerArr = parseCommaItems(menuForm.dinnerItemsList);
            if (!dinnerArr.some(i => i.toLowerCase().includes('roti'))) {
                dinnerArr.unshift(defaultRotiStr);
            }

            const payload: any = {
                date: dateStr,

                // Section 1: Shared Daily Menu
                lunchSabji: menuForm.lunchSabji.trim(),
                dinnerSabji: menuForm.dinnerSabji.trim(),
                lunchItems: lunchArr,
                dinnerItems: dinnerArr,
                weekdayItems: lunchArr,
                rotiType: menuForm.rotiType.trim(),
                defaultRotiQty: Number(menuForm.rotiQty),
                extraRotiPrice: Number(menuForm.extraRotiPrice),
                weekdayPrice: Number(menuForm.regularPrice),
                isServiceOff: menuForm.isServiceOff,

                // Section 2: Weekday Three Thalis (Unique items + Pre-composed deduplicated items)
                regularPrice: Number(menuForm.regularPrice),
                regularAvailable: Boolean(menuForm.regularAvailable),
                regularImage: menuForm.regularImage,
                regularDescription: menuForm.regularDescription.trim(),
                regularUniqueItems: parseCommaItems(menuForm.regularUniqueItems),
                regularItems: regularComposed,

                desiPrice: Number(menuForm.desiPrice),
                desiAvailable: Boolean(menuForm.desiAvailable),
                desiImage: menuForm.desiImage,
                desiDescription: menuForm.desiDescription.trim(),
                desiUniqueItems: parseCommaItems(menuForm.desiUniqueItems),
                desiItems: desiComposed,

                paneerPrice: Number(menuForm.paneerPrice),
                paneerAvailable: Boolean(menuForm.paneerAvailable),
                paneerImage: menuForm.paneerImage,
                paneerSabji: menuForm.paneerSabji.trim(),
                paneerDescription: menuForm.paneerDescription.trim(),
                paneerUniqueItems: parseCommaItems(menuForm.paneerUniqueItems),
                paneerItems: paneerComposed,

                // Section 3: Sunday Special Menu
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
            initialFormRef.current = JSON.stringify(menuForm);

            toast.success(`Menu successfully updated & published for ${format(date, 'EEE, MMM dd, yyyy')}`);
        } catch (error) {
            console.error("Save menu error:", error);
            toast.error("Failed to save menu");
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-24">
            {/* ============================================================== */}
            {/* TOP HEADER & DATE CONTROLS BAR                                  */}
            {/* ============================================================== */}
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                            <ChefHat className="w-6 h-6" />
                        </span>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                                Homemade Food Menu Manager
                                {isDirty && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                        ● Unsaved Changes
                                    </span>
                                )}
                            </h2>
                            <p className="text-xs text-stone-500 font-medium">
                                Centralized menu architecture: Enter shared items once — all thalis compose automatically without duplicates.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Date Controls & Quick Navigation */}
                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
                    {/* Previous Day */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDate(prev => subDays(prev, 1))}
                        className="h-9 px-2 text-stone-600 border-stone-300 hover:bg-stone-100"
                        title="Previous day"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    {/* Date Picker Input */}
                    <div className="flex items-center bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1 shadow-2xs">
                        <CalendarIcon className="w-4 h-4 text-orange-600 mr-2 shrink-0" />
                        <Input
                            type="date"
                            value={dateStr}
                            onChange={(e) => setDate(parseSafeDate(e.target.value))}
                            className="border-0 h-7 text-xs font-bold focus-visible:ring-0 p-0 w-32 bg-transparent text-stone-800"
                        />
                        {isSelectedDateSunday ? (
                            <Badge className="bg-amber-100 text-amber-900 text-[10px] font-extrabold ml-1 shrink-0">
                                Sunday
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-stone-200 text-stone-700 text-[10px] font-bold ml-1 shrink-0">
                                Weekday
                            </Badge>
                        )}
                    </div>

                    {/* Next Day */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDate(prev => addDays(prev, 1))}
                        className="h-9 px-2 text-stone-600 border-stone-300 hover:bg-stone-100"
                        title="Next day"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>

                    {/* Today Shortcut */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDate(getTodayInKolkata())}
                        className="h-9 text-xs font-bold text-stone-700 border-stone-300 hover:bg-stone-100"
                    >
                        Today
                    </Button>

                    {/* Kitchen Service Active/Emergency Off Toggle */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                        menuForm.isServiceOff 
                            ? 'bg-rose-50 border-rose-300 text-rose-900' 
                            : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    }`}>
                        <span className="text-[11px] font-black">
                            {menuForm.isServiceOff ? '🚨 Kitchen Off' : 'Active'}
                        </span>
                        <input
                            type="checkbox"
                            checked={menuForm.isServiceOff}
                            onChange={(e) => setMenuForm({ ...menuForm, isServiceOff: e.target.checked })}
                            className="h-4 w-4 rounded border-stone-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                            title="Emergency Service Off"
                        />
                    </div>

                    {/* WhatsApp Share Button */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                            const shareText = generateMenuShareText({
                                date: date,
                                lunchSabji: menuForm.lunchSabji,
                                lunchItems: parseCommaItems(menuForm.lunchItemsList),
                                dinnerSabji: menuForm.dinnerSabji,
                                dinnerItems: parseCommaItems(menuForm.dinnerItemsList),
                                lunchPrice: Number(menuForm.regularPrice),
                                dinnerPrice: Number(menuForm.regularPrice),
                                isSunday: isSelectedDateSunday,
                                thalis: {
                                    regularPrice: Number(menuForm.regularPrice),
                                    desiPrice: Number(menuForm.desiPrice),
                                    paneerPrice: Number(menuForm.paneerPrice)
                                }
                            });

                            try {
                                if (navigator.share) {
                                    await navigator.share({ title: 'Tommalu Daily Menu', text: shareText });
                                } else {
                                    await navigator.clipboard.writeText(shareText);
                                    toast.success("Menu copied to clipboard for WhatsApp!");
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

                    {/* Save Button */}
                    <Button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={updateMenu.isPending}
                        className="h-9 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs px-4 shadow-sm"
                    >
                        {updateMenu.isPending ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Menu
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Navigation Switcher Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-200/80">
                <button
                    type="button"
                    onClick={() => setActiveTab('weekday')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        activeTab === 'weekday'
                            ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                    }`}
                >
                    <Utensils className="w-3.5 h-3.5 text-orange-600" />
                    <span>Weekday Management (Mon–Sat)</span>
                    {!isSelectedDateSunday && (
                        <span className="text-[10px] bg-orange-100 text-orange-800 font-extrabold px-1.5 py-0.2 rounded">
                            Today Active
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('sunday')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        activeTab === 'sunday'
                            ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                    }`}
                >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sunday Special Menu</span>
                    {isSelectedDateSunday && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.2 rounded">
                            Sunday Active
                        </span>
                    )}
                </button>
            </div>

            {/* Loading Skeleton */}
            {isMenuLoading ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
                    <p className="text-xs font-bold text-stone-600">Loading menu configuration for {dateStr}...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* ============================================================== */}
                    {/* VIEW 1: WEEKDAY MANAGEMENT (SECTIONS 1, 2 & LIVE PREVIEW)        */}
                    {/* ============================================================== */}
                    {activeTab === 'weekday' && (
                        <div className="space-y-6 animate-in fade-in-50 duration-200">
                            {/* ========================================================== */}
                            {/* SECTION 1: DAILY MENU SETUP (SHARED DAILY MENU)           */}
                            {/* ========================================================== */}
                            <Card className="border border-stone-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
                                <CardHeader className="bg-stone-50/70 border-b border-stone-200/70 py-4 px-4 sm:px-6">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                                                <Flame className="w-4 h-4" />
                                            </span>
                                            <div>
                                                <CardTitle className="text-base sm:text-lg font-black text-stone-900">
                                                    Section 1: Daily Shared Menu Setup
                                                </CardTitle>
                                                <p className="text-xs text-stone-500 font-medium">
                                                    Configure today's common sabji, accompaniments, and bread settings. These automatically flow into all thalis.
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-[11px] font-bold border-orange-200 text-orange-800 bg-orange-50">
                                            Centralized Master Menu
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-6 space-y-5">
                                    {/* 2 Independent Columns: Lunch vs Dinner */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* 1. LUNCH SHARED MENU */}
                                        <div className="bg-orange-50/30 rounded-2xl p-4 border border-orange-200/70 space-y-3.5">
                                            <div className="flex items-center justify-between border-b border-orange-100 pb-2">
                                                <label className="text-xs font-black text-orange-950 uppercase tracking-wide flex items-center gap-1.5">
                                                    <Sun className="w-4 h-4 text-orange-600" />
                                                    ☀️ Lunch Sabji & Items (11:30 AM–2:00 PM)
                                                </label>
                                                <span className="text-[10px] font-bold text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded">
                                                    Pre-orders & Daily
                                                </span>
                                            </div>

                                            {/* Lunch Sabji Input */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-stone-700">Lunch Seasonal Sabji</label>
                                                <Input
                                                    value={menuForm.lunchSabji}
                                                    onChange={(e) => setMenuForm({ ...menuForm, lunchSabji: e.target.value })}
                                                    placeholder="e.g. Aloo Palak / Bhindi Masala"
                                                    className="font-bold text-sm bg-white"
                                                />
                                                {/* 1-Click Sabji Chips */}
                                                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                                    <span className="text-[10px] font-bold text-stone-400">Quick:</span>
                                                    {POPULAR_LUNCH_SABJIS.map(dish => (
                                                        <button
                                                            key={dish}
                                                            type="button"
                                                            onClick={() => setMenuForm(prev => ({ ...prev, lunchSabji: dish }))}
                                                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white hover:bg-orange-100 text-stone-700 hover:text-orange-900 border border-stone-200 transition-colors cursor-pointer"
                                                        >
                                                            {dish}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Lunch Accompaniments Input */}
                                            <div className="space-y-1.5 pt-1">
                                                <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                                                    <span>Lunch Accompaniments (Common Items)</span>
                                                    <span className="text-[10px] text-stone-400 font-normal">Comma-separated</span>
                                                </label>
                                                <Input
                                                    value={menuForm.lunchItemsList}
                                                    onChange={(e) => setMenuForm({ ...menuForm, lunchItemsList: e.target.value })}
                                                    placeholder="Dal Tadka, Steamed Rice, Green Salad, Desi Chach"
                                                    className="text-xs bg-white font-medium"
                                                />
                                                <p className="text-[11px] text-stone-500">
                                                    💡 e.g. <em>Dal Tadka, Steamed Rice, Green Salad, Desi Chach</em>. These are inherited by all lunch thalis.
                                                </p>
                                            </div>
                                        </div>

                                        {/* 2. DINNER SHARED MENU */}
                                        <div className="bg-indigo-50/30 rounded-2xl p-4 border border-indigo-200/70 space-y-3.5">
                                            <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                                                <label className="text-xs font-black text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
                                                    <Moon className="w-4 h-4 text-indigo-600" />
                                                    🌙 Dinner Sabji & Items (7:00 PM–10:00 PM)
                                                </label>
                                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded">
                                                    Evening Slot
                                                </span>
                                            </div>

                                            {/* Dinner Sabji Input */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-stone-700">Dinner Seasonal Sabji</label>
                                                <Input
                                                    value={menuForm.dinnerSabji}
                                                    onChange={(e) => setMenuForm({ ...menuForm, dinnerSabji: e.target.value })}
                                                    placeholder="e.g. Sev Tamatar / Dal Tadka"
                                                    className="font-bold text-sm bg-white"
                                                />
                                                {/* 1-Click Sabji Chips */}
                                                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                                    <span className="text-[10px] font-bold text-stone-400">Quick:</span>
                                                    {POPULAR_DINNER_SABJIS.map(dish => (
                                                        <button
                                                            key={dish}
                                                            type="button"
                                                            onClick={() => setMenuForm(prev => ({ ...prev, dinnerSabji: dish }))}
                                                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white hover:bg-indigo-100 text-stone-700 hover:text-indigo-900 border border-stone-200 transition-colors cursor-pointer"
                                                        >
                                                            {dish}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Dinner Accompaniments Input */}
                                            <div className="space-y-1.5 pt-1">
                                                <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                                                    <span>Dinner Accompaniments (Common Items)</span>
                                                    <span className="text-[10px] text-stone-400 font-normal">Comma-separated</span>
                                                </label>
                                                <Input
                                                    value={menuForm.dinnerItemsList}
                                                    onChange={(e) => setMenuForm({ ...menuForm, dinnerItemsList: e.target.value })}
                                                    placeholder="Dal Tadka, Steamed Rice, Green Salad"
                                                    className="text-xs bg-white font-medium"
                                                />
                                                <p className="text-[11px] text-stone-500">
                                                    💡 e.g. <em>Dal Tadka, Steamed Rice, Green Salad</em>. (Chach is excluded for dinner).
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. ROTI CONFIGURATION STRIP */}
                                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-black text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
                                                🥖 Roti & Bread Configuration
                                            </span>
                                            <span className="text-[11px] text-stone-500">
                                                Automatically configured into all thalis
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-stone-700">Roti Type</label>
                                                <Input
                                                    value={menuForm.rotiType}
                                                    onChange={(e) => setMenuForm({ ...menuForm, rotiType: e.target.value, rotiName: e.target.value })}
                                                    placeholder="Ghee Roti / Tawa Roti"
                                                    className="text-xs bg-white font-medium"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-stone-700">Default Roti Quantity</label>
                                                <Input
                                                    type="number"
                                                    value={menuForm.rotiQty}
                                                    onChange={(e) => setMenuForm({ ...menuForm, rotiQty: Math.max(1, Number(e.target.value)) })}
                                                    min={1}
                                                    className="text-xs bg-white font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-stone-700">Extra Roti Price (₹)</label>
                                                <Input
                                                    type="number"
                                                    value={menuForm.extraRotiPrice}
                                                    onChange={(e) => setMenuForm({ ...menuForm, extraRotiPrice: Number(e.target.value) })}
                                                    min={0}
                                                    className="text-xs bg-white font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ========================================================== */}
                            {/* SECTION 2: WEEKDAY THALI MANAGEMENT (3 CARDS)              */}
                            {/* ========================================================== */}
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                                            <Utensils className="w-5 h-5 text-orange-600" />
                                            Section 2: Weekday Thali Management (Monday–Saturday)
                                        </h3>
                                        <p className="text-xs text-stone-500 font-medium">
                                            Configure prices, photos, and <strong>unique additional items only</strong>. Shared sabji and accompaniments are inherited automatically without duplicate typing!
                                        </p>
                                    </div>
                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-bold shrink-0">
                                        No Duplicate Items
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {/* ---------------------------------------------------- */}
                                    {/* 1. REGULAR THALI CARD                                */}
                                    {/* ---------------------------------------------------- */}
                                    <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-orange-300 transition-all p-4 sm:p-5 flex flex-col justify-between space-y-4">
                                        <div className="space-y-3.5">
                                            {/* Header */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-black text-base text-stone-900 block">Regular Thali</span>
                                                    <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wide">
                                                        Everyday Value
                                                    </span>
                                                </div>
                                                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={menuForm.regularAvailable}
                                                        onChange={(e) => setMenuForm({ ...menuForm, regularAvailable: e.target.checked })}
                                                        className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                                                    />
                                                    <span className={menuForm.regularAvailable ? "text-emerald-700" : "text-rose-600"}>
                                                        {menuForm.regularAvailable ? "Active" : "Inactive"}
                                                    </span>
                                                </label>
                                            </div>

                                            {/* Description */}
                                            <Input
                                                value={menuForm.regularDescription}
                                                onChange={(e) => setMenuForm({ ...menuForm, regularDescription: e.target.value })}
                                                placeholder="Short description"
                                                className="text-xs text-stone-600 h-8"
                                            />

                                            {/* Photo Preview & AI Studio Buttons */}
                                            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 group">
                                                <Image
                                                    src={menuForm.regularImage || "/thali-regular.jpg"}
                                                    alt="Regular Thali"
                                                    fill
                                                    unoptimized
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <span className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white px-2 py-0.5 rounded-md truncate max-w-[85%]">
                                                    {menuForm.lunchSabji || "Seasonal Sabji"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => quickGenerateAiPhoto("regular")}
                                                    className="flex-1 h-8 text-xs font-bold text-orange-700 border-orange-200 hover:bg-orange-50"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5 mr-1 text-orange-600" />
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
                                                    className="h-8 text-xs font-bold text-stone-600 hover:text-stone-900"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setMenuForm(prev => ({ ...prev, regularImage: "/thali-regular.jpg" }))}
                                                    className="h-8 text-xs text-stone-400 hover:text-stone-700 px-2"
                                                    title="Reset to default photo"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>

                                            {/* Price Input */}
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-stone-700">Price (₹)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-xs font-black text-stone-400">₹</span>
                                                    <Input
                                                        type="number"
                                                        value={menuForm.regularPrice}
                                                        onChange={(e) => setMenuForm({ ...menuForm, regularPrice: Number(e.target.value) })}
                                                        className="font-black text-base pl-7"
                                                    />
                                                </div>
                                            </div>

                                            {/* Unique Additional Items Only */}
                                            <div className="space-y-1 pt-1">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold text-stone-800">
                                                        Unique Additional Items Only
                                                    </label>
                                                    <span className="text-[10px] text-stone-400 font-semibold">Optional</span>
                                                </div>
                                                <Input
                                                    value={menuForm.regularUniqueItems}
                                                    onChange={(e) => setMenuForm({ ...menuForm, regularUniqueItems: e.target.value })}
                                                    placeholder="Leave empty or add e.g. Papad, Achar"
                                                    className="text-xs bg-stone-50/50"
                                                />
                                                <div className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded-lg border border-stone-200/60 leading-relaxed">
                                                    ✨ <strong>Inherited automatically:</strong> Seasonal Sabji + {menuForm.rotiQty} {menuForm.rotiName} + Dal, Rice, Salad.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ---------------------------------------------------- */}
                                    {/* 2. DESI SPECIAL THALI CARD                           */}
                                    {/* ---------------------------------------------------- */}
                                    <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-amber-300 transition-all p-4 sm:p-5 flex flex-col justify-between space-y-4">
                                        <div className="space-y-3.5">
                                            {/* Header */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-black text-base text-stone-900 block">Desi Special Thali</span>
                                                    <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wide">
                                                        Desi Ghee & Raita
                                                    </span>
                                                </div>
                                                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={menuForm.desiAvailable}
                                                        onChange={(e) => setMenuForm({ ...menuForm, desiAvailable: e.target.checked })}
                                                        className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                                                    />
                                                    <span className={menuForm.desiAvailable ? "text-emerald-700" : "text-rose-600"}>
                                                        {menuForm.desiAvailable ? "Active" : "Inactive"}
                                                    </span>
                                                </label>
                                            </div>

                                            {/* Description */}
                                            <Input
                                                value={menuForm.desiDescription}
                                                onChange={(e) => setMenuForm({ ...menuForm, desiDescription: e.target.value })}
                                                placeholder="Short description"
                                                className="text-xs text-stone-600 h-8"
                                            />

                                            {/* Photo Preview & AI Studio Buttons */}
                                            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 group">
                                                <Image
                                                    src={menuForm.desiImage || "/thali-desi.jpg"}
                                                    alt="Desi Special Thali"
                                                    fill
                                                    unoptimized
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <span className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white px-2 py-0.5 rounded-md truncate max-w-[85%]">
                                                    Desi Ghee & Raita
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => quickGenerateAiPhoto("desiSpecial")}
                                                    className="flex-1 h-8 text-xs font-bold text-amber-800 border-amber-200 hover:bg-amber-50"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
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
                                                    className="h-8 text-xs font-bold text-stone-600 hover:text-stone-900"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setMenuForm(prev => ({ ...prev, desiImage: "/thali-desi.jpg" }))}
                                                    className="h-8 text-xs text-stone-400 hover:text-stone-700 px-2"
                                                    title="Reset to default photo"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>

                                            {/* Price Input */}
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-stone-700">Price (₹)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-xs font-black text-stone-400">₹</span>
                                                    <Input
                                                        type="number"
                                                        value={menuForm.desiPrice}
                                                        onChange={(e) => setMenuForm({ ...menuForm, desiPrice: Number(e.target.value) })}
                                                        className="font-black text-base pl-7"
                                                    />
                                                </div>
                                            </div>

                                            {/* Unique Additional Items Only */}
                                            <div className="space-y-1 pt-1">
                                                <label className="text-xs font-bold text-stone-800">
                                                    Unique Additional Items Only
                                                </label>
                                                <Input
                                                    value={menuForm.desiUniqueItems}
                                                    onChange={(e) => setMenuForm({ ...menuForm, desiUniqueItems: e.target.value })}
                                                    placeholder="Boondi Raita, Lahsun Chutney, 5 Ghee Roti"
                                                    className="text-xs bg-amber-50/40 font-medium"
                                                />
                                                <div className="text-[11px] text-stone-500 bg-amber-50/40 p-2 rounded-lg border border-amber-200/60 leading-relaxed">
                                                    ✨ <strong>Special additions:</strong> Raita, Lahsun Chutney, and 5 Ghee Roti (supersedes 4 Roti).
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ---------------------------------------------------- */}
                                    {/* 3. PANEER SPECIAL THALI CARD                         */}
                                    {/* ---------------------------------------------------- */}
                                    <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-purple-300 transition-all p-4 sm:p-5 flex flex-col justify-between space-y-4">
                                        <div className="space-y-3.5">
                                            {/* Header */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-black text-base text-stone-900 block">Paneer Special Thali</span>
                                                    <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wide">
                                                        Royal Paneer Feast
                                                    </span>
                                                </div>
                                                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={menuForm.paneerAvailable}
                                                        onChange={(e) => setMenuForm({ ...menuForm, paneerAvailable: e.target.checked })}
                                                        className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                                                    />
                                                    <span className={menuForm.paneerAvailable ? "text-emerald-700" : "text-rose-600"}>
                                                        {menuForm.paneerAvailable ? "Active" : "Inactive"}
                                                    </span>
                                                </label>
                                            </div>

                                            {/* Description */}
                                            <Input
                                                value={menuForm.paneerDescription}
                                                onChange={(e) => setMenuForm({ ...menuForm, paneerDescription: e.target.value })}
                                                placeholder="Short description"
                                                className="text-xs text-stone-600 h-8"
                                            />

                                            {/* Paneer Sabji Name Input */}
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-purple-900">Paneer Sabji Name</label>
                                                <Input
                                                    value={menuForm.paneerSabji}
                                                    onChange={(e) => setMenuForm({ ...menuForm, paneerSabji: e.target.value })}
                                                    placeholder="Paneer Butter Masala"
                                                    className="font-bold text-xs bg-purple-50/40 text-purple-950"
                                                />
                                                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                                    {POPULAR_PANEER_SABJIS.slice(0, 4).map(dish => (
                                                        <button
                                                            key={dish}
                                                            type="button"
                                                            onClick={() => setMenuForm(prev => ({ ...prev, paneerSabji: dish }))}
                                                            className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 hover:bg-purple-200 text-purple-900 transition-colors cursor-pointer"
                                                        >
                                                            {dish}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Photo Preview & AI Studio Buttons */}
                                            <div className="relative w-full h-32 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 group">
                                                <Image
                                                    src={menuForm.paneerImage || "/thali-paneer.jpg"}
                                                    alt="Paneer Special Thali"
                                                    fill
                                                    unoptimized
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <span className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white px-2 py-0.5 rounded-md truncate max-w-[85%]">
                                                    {menuForm.paneerSabji || "Paneer"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => quickGenerateAiPhoto("paneerSpecial")}
                                                    className="flex-1 h-8 text-xs font-bold text-purple-800 border-purple-200 hover:bg-purple-50"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
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
                                                    className="h-8 text-xs font-bold text-stone-600 hover:text-stone-900"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setMenuForm(prev => ({ ...prev, paneerImage: "/thali-paneer.jpg" }))}
                                                    className="h-8 text-xs text-stone-400 hover:text-stone-700 px-2"
                                                    title="Reset to default photo"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>

                                            {/* Price Input */}
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-stone-700">Price (₹)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-xs font-black text-stone-400">₹</span>
                                                    <Input
                                                        type="number"
                                                        value={menuForm.paneerPrice}
                                                        onChange={(e) => setMenuForm({ ...menuForm, paneerPrice: Number(e.target.value) })}
                                                        className="font-black text-base pl-7"
                                                    />
                                                </div>
                                            </div>

                                            {/* Unique Additional Items Only */}
                                            <div className="space-y-1 pt-1">
                                                <label className="text-xs font-bold text-stone-800">
                                                    Unique Additional Items Only
                                                </label>
                                                <Input
                                                    value={menuForm.paneerUniqueItems}
                                                    onChange={(e) => setMenuForm({ ...menuForm, paneerUniqueItems: e.target.value })}
                                                    placeholder="Boondi Raita, 1 Gulab Jamun"
                                                    className="text-xs bg-purple-50/40 font-medium"
                                                />
                                                <div className="text-[11px] text-stone-500 bg-purple-50/40 p-2 rounded-lg border border-purple-200/60 leading-relaxed">
                                                    ✨ <strong>Special additions:</strong> Royal Paneer Sabji + Boondi Raita & Gulab Jamun dessert.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ========================================================== */}
                            {/* SECTION 4: LIVE CUSTOMER MENU PREVIEW (REAL-TIME REACTIVE) */}
                            {/* ========================================================== */}
                            <Card className="border-2 border-stone-800 shadow-md rounded-2xl overflow-hidden bg-stone-900 text-white">
                                <CardHeader className="bg-stone-950/80 border-b border-stone-800 py-4 px-4 sm:px-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="p-2 bg-orange-600 text-white rounded-xl">
                                                <Eye className="w-5 h-5" />
                                            </span>
                                            <div>
                                                <CardTitle className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                                    Live Customer Menu Preview
                                                    <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                                        Real-Time Generated
                                                    </span>
                                                </CardTitle>
                                                <p className="text-xs text-stone-400">
                                                    This preview shows the exact composed items customers will see on Tommalu. As you type above, this updates instantly.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Slot Toggle for Preview */}
                                        <div className="flex items-center bg-stone-800 p-1 rounded-xl border border-stone-700">
                                            <button
                                                type="button"
                                                onClick={() => setPreviewSlot('lunch')}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                                    previewSlot === 'lunch'
                                                        ? 'bg-orange-600 text-white shadow-sm'
                                                        : 'text-stone-400 hover:text-white'
                                                }`}
                                            >
                                                <Sun className="w-3.5 h-3.5" />
                                                ☀️ Lunch Preview
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPreviewSlot('dinner')}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                                    previewSlot === 'dinner'
                                                        ? 'bg-indigo-600 text-white shadow-sm'
                                                        : 'text-stone-400 hover:text-white'
                                                }`}
                                            >
                                                <Moon className="w-3.5 h-3.5" />
                                                🌙 Dinner Preview
                                            </button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-6 space-y-4">
                                    <div className="text-xs text-stone-400 flex items-center justify-between pb-2 border-b border-stone-800">
                                        <span>
                                            Showing composed menu for: <strong className="text-orange-400 uppercase">{previewSlot}</strong> ({previewSlot === 'lunch' ? '11:30 AM–2:00 PM' : '7:00 PM–10:00 PM'})
                                        </span>
                                        <span className="text-stone-500 text-[11px]">
                                            Active Sabji: <strong>{activePreviewSabji}</strong>
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Preview Card 1: Regular Thali */}
                                        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-extrabold text-orange-400 uppercase tracking-wide block">
                                                        Everyday Value
                                                    </span>
                                                    <h4 className="font-black text-sm text-white">Regular Thali</h4>
                                                </div>
                                                <span className="text-base font-black text-white bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700">
                                                    ₹{menuForm.regularPrice}
                                                </span>
                                            </div>

                                            <div className="space-y-1.5 pt-1">
                                                <span className="text-[11px] font-bold text-stone-400 uppercase block">
                                                    Composed Menu ({composedRegular.length} items):
                                                </span>
                                                <div className="space-y-1">
                                                    {composedRegular.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-xs text-stone-300 font-medium">
                                                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                            <span>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Preview Card 2: Desi Special Thali */}
                                        <div className="bg-stone-950/70 border border-amber-900/50 rounded-xl p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wide block">
                                                        Desi Ghee & Raita
                                                    </span>
                                                    <h4 className="font-black text-sm text-white">Desi Special Thali</h4>
                                                </div>
                                                <span className="text-base font-black text-white bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800/80">
                                                    ₹{menuForm.desiPrice}
                                                </span>
                                            </div>

                                            <div className="space-y-1.5 pt-1">
                                                <span className="text-[11px] font-bold text-stone-400 uppercase block">
                                                    Composed Menu ({composedDesi.length} items):
                                                </span>
                                                <div className="space-y-1">
                                                    {composedDesi.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-xs text-stone-300 font-medium">
                                                            <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                            <span>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Preview Card 3: Paneer Special Thali */}
                                        <div className="bg-stone-950/70 border border-purple-900/50 rounded-xl p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wide block">
                                                        Royal Paneer Feast
                                                    </span>
                                                    <h4 className="font-black text-sm text-white">Paneer Special Thali</h4>
                                                </div>
                                                <span className="text-base font-black text-white bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-800/80">
                                                    ₹{menuForm.paneerPrice}
                                                </span>
                                            </div>

                                            <div className="space-y-1.5 pt-1">
                                                <span className="text-[11px] font-bold text-stone-400 uppercase block">
                                                    Composed Menu ({composedPaneer.length} items):
                                                </span>
                                                <div className="space-y-1">
                                                    {composedPaneer.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-xs text-stone-300 font-medium">
                                                            <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                                            <span>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* ============================================================== */}
                    {/* VIEW 2: SUNDAY SPECIAL MENU (SECTION 3)                         */}
                    {/* ============================================================== */}
                    {activeTab === 'sunday' && (
                        <div className="space-y-6 animate-in fade-in-50 duration-200">
                            {/* Sunday Policy Banner */}
                            <div className="p-4 bg-amber-500/10 border-2 border-amber-300 rounded-2xl text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                                <div className="flex items-center gap-2.5">
                                    <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                                    <div>
                                        <strong className="text-sm font-black block">Sunday Special Menu Mode Active</strong>
                                        <span className="text-stone-600">
                                            Standard weekday 3 thalis are disabled on Sundays. Customer app exclusively displays <strong>Sunday Lunch (Paratha Special)</strong> and <strong>Sunday Dinner (Special Feast)</strong>.
                                        </span>
                                    </div>
                                </div>
                                <Badge className="bg-amber-600 text-white font-extrabold text-xs px-2.5 py-1 shrink-0">
                                    Independent Weekend Menu
                                </Badge>
                            </div>

                            {/* 1. SUNDAY LUNCH: PARATHA SPECIAL MENU */}
                            <Card className="border border-orange-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
                                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50/50 border-b border-orange-200/80 py-4 px-4 sm:px-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="p-2 bg-orange-600 text-white rounded-xl">
                                                <Sun className="w-5 h-5" />
                                            </span>
                                            <div>
                                                <CardTitle className="text-base sm:text-lg font-black text-stone-900">
                                                    ☀️ Sunday Lunch — Paratha Special Menu
                                                </CardTitle>
                                                <p className="text-xs text-stone-500 font-medium">
                                                    Crispy stuffed parathas with fresh dahi, butter, chutney & achar.
                                                </p>
                                            </div>
                                        </div>

                                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
                                            <input
                                                type="checkbox"
                                                checked={menuForm.sundayLunchOpen}
                                                onChange={(e) => setMenuForm({ ...menuForm, sundayLunchOpen: e.target.checked })}
                                                className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                            />
                                            <span className={menuForm.sundayLunchOpen ? "text-emerald-700" : "text-rose-600"}>
                                                {menuForm.sundayLunchOpen ? "Lunch Slot Open" : "Lunch Slot Closed"}
                                            </span>
                                        </label>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-6 space-y-4">
                                    {/* Quick Presets */}
                                    <div className="flex items-center gap-2 flex-wrap bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                                        <span className="text-[11px] font-black text-stone-600 uppercase">⚡ 1-Click Lunch Presets:</span>
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
                                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-950 border border-orange-300 transition-colors cursor-pointer"
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
                                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-colors cursor-pointer"
                                        >
                                            🧀 Royal Paneer & Aloo Paratha
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-stone-800">Lunch Menu Title</label>
                                            <Input
                                                value={menuForm.sundayLunchItemName}
                                                onChange={(e) => setMenuForm({ ...menuForm, sundayLunchItemName: e.target.value })}
                                                placeholder="e.g. Sunday Special Paratha Menu"
                                                className="font-bold text-sm bg-white"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-stone-800">Sunday Lunch Price (₹)</label>
                                            <Input
                                                type="number"
                                                value={menuForm.sundayLunchPrice}
                                                onChange={(e) => setMenuForm({ ...menuForm, sundayLunchPrice: Number(e.target.value) })}
                                                placeholder="99"
                                                className="font-bold text-sm bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-stone-800">🥞 Paratha Varieties (Customizable)</label>
                                            <Input
                                                value={menuForm.sundayParathas}
                                                onChange={(e) => setMenuForm({ ...menuForm, sundayParathas: e.target.value })}
                                                placeholder="Aloo Paratha, Paneer Paratha, Pyaj Paratha, Gobhi Paratha"
                                                className="text-xs bg-white"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-stone-800">Accompaniments (Dahi, Butter, Chutney)</label>
                                            <Input
                                                value={menuForm.sundayLunchAccompaniments}
                                                onChange={(e) => setMenuForm({ ...menuForm, sundayLunchAccompaniments: e.target.value })}
                                                placeholder="Fresh Dahi, Amul Butter, Hari Chutney, Achar"
                                                className="text-xs bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Photo Row */}
                                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                                        <div className="relative w-24 h-18 rounded-lg overflow-hidden bg-stone-200 border shrink-0">
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
                                            <p className="text-[11px] text-stone-500">Displayed on customer lunch card.</p>
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
                                </CardContent>
                            </Card>

                            {/* 2. SUNDAY DINNER: SPECIAL FEAST */}
                            <Card className="border border-indigo-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
                                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50/50 border-b border-indigo-200/80 py-4 px-4 sm:px-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="p-2 bg-indigo-600 text-white rounded-xl">
                                                <Moon className="w-5 h-5" />
                                            </span>
                                            <div>
                                                <CardTitle className="text-base sm:text-lg font-black text-stone-900">
                                                    🌙 Sunday Dinner — Special Feast
                                                </CardTitle>
                                                <p className="text-xs text-stone-500 font-medium">
                                                    Royal weekend dinner feast with special dishes, dessert & traditional breads.
                                                </p>
                                            </div>
                                        </div>

                                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
                                            <input
                                                type="checkbox"
                                                checked={menuForm.sundayDinnerOpen}
                                                onChange={(e) => setMenuForm({ ...menuForm, sundayDinnerOpen: e.target.checked })}
                                                className="h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                            <span className={menuForm.sundayDinnerOpen ? "text-emerald-700" : "text-rose-600"}>
                                                {menuForm.sundayDinnerOpen ? "Dinner Slot Open" : "Dinner Slot Closed"}
                                            </span>
                                        </label>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-6 space-y-4">
                                    {/* Quick Presets */}
                                    <div className="flex items-center gap-2 flex-wrap bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                                        <span className="text-[11px] font-black text-stone-600 uppercase">⚡ 1-Click Dinner Presets:</span>
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
                                                toast.success("Loaded 'Dal Baati Churma' preset!");
                                            }}
                                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-950 border border-indigo-300 transition-colors cursor-pointer"
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
                                                toast.success("Loaded 'Chole Bhature' preset!");
                                            }}
                                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-colors cursor-pointer"
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
                                                toast.success("Loaded 'Shahi Paneer Feast' preset!");
                                            }}
                                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-300 transition-colors cursor-pointer"
                                        >
                                            🧀 Shahi Paneer Feast (₹149)
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-stone-800">Feast Title / Special Item</label>
                                            <Input
                                                value={menuForm.sundayItemName}
                                                onChange={(e) => setMenuForm({ ...menuForm, sundayItemName: e.target.value })}
                                                placeholder="e.g. Rajasthani Royal Feast / Dal Baati Churma"
                                                className="font-bold text-sm bg-white"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-stone-800">Sunday Dinner Special Price (₹)</label>
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
                                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                                        <h5 className="font-extrabold text-xs text-stone-900 uppercase tracking-wide">
                                            🍱 Sunday Dinner Dishes (Configurable)
                                        </h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-stone-700">1. Sabzi / Special Dish</label>
                                                <Input
                                                    value={menuForm.specialSabzi}
                                                    onChange={(e) => setMenuForm({ ...menuForm, specialSabzi: e.target.value })}
                                                    placeholder="Gatta Masala Curry"
                                                    className="text-xs bg-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-stone-700">2. Dal</label>
                                                <Input
                                                    value={menuForm.dal}
                                                    onChange={(e) => setMenuForm({ ...menuForm, dal: e.target.value })}
                                                    placeholder="Panchmel Dal Tadka"
                                                    className="text-xs bg-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-stone-700">3. Rice</label>
                                                <Input
                                                    value={menuForm.rice}
                                                    onChange={(e) => setMenuForm({ ...menuForm, rice: e.target.value })}
                                                    placeholder="Jeera Rice"
                                                    className="text-xs bg-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-stone-700">4. Breads / Baati / Puri</label>
                                                <Input
                                                    value={menuForm.rotiPuri}
                                                    onChange={(e) => setMenuForm({ ...menuForm, rotiPuri: e.target.value })}
                                                    placeholder="4 Desi Ghee Baati"
                                                    className="text-xs bg-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-stone-700">5. Salad</label>
                                                <Input
                                                    value={menuForm.salad}
                                                    onChange={(e) => setMenuForm({ ...menuForm, salad: e.target.value })}
                                                    placeholder="Lahsun Chutney & Salad"
                                                    className="text-xs bg-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-bold text-stone-700">6. Dessert</label>
                                                <Input
                                                    value={menuForm.dessert}
                                                    onChange={(e) => setMenuForm({ ...menuForm, dessert: e.target.value })}
                                                    placeholder="Churma Ladoo"
                                                    className="text-xs bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Photo Row */}
                                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                                        <div className="relative w-24 h-18 rounded-lg overflow-hidden bg-stone-200 border shrink-0">
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
                                            <p className="text-[11px] text-stone-500">Displayed on customer dinner feast card.</p>
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
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* ============================================================== */}
            {/* FLOATING STICKY ACTION BAR (VISIBLE WHEN UNSAVED CHANGES EXIST) */}
            {/* ============================================================== */}
            {isDirty && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-xl bg-stone-900 text-white rounded-2xl shadow-2xl border border-stone-800 p-3 sm:p-4 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3">
                    <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse shrink-0" />
                        <div>
                            <span className="font-extrabold text-xs block text-stone-100">
                                Unsaved Menu Changes
                            </span>
                            <span className="text-[11px] text-stone-400">
                                Click Save & Publish to push changes live to customers.
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (confirm("Discard all unsaved edits?")) {
                                    setMenuForm(JSON.parse(initialFormRef.current));
                                }
                            }}
                            className="h-8 text-xs font-bold text-stone-400 hover:text-white"
                        >
                            Discard
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => handleSave()}
                            disabled={updateMenu.isPending}
                            className="h-8 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs px-3 shadow-sm cursor-pointer"
                        >
                            {updateMenu.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5 mr-1" />
                                    Publish Menu
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

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
