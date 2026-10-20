"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Loader2, Save, Utensils, Share2, Sparkles, Wand2, Edit3, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useDailyMenu, useUpdateDailyMenu } from '@/hooks/api/use-homemade-food';
import { generateMenuShareText } from '@/utils/menuShare';
import { AiThaliImageModal, matchAiImageForMenu } from './AiThaliImageModal';

export function DailyMenuEditor() {
    const [date, setDate] = useState<Date>(new Date());
    const dateStr = format(date, 'yyyy-MM-dd');

    // Hooks
    const { data: menuData, isLoading: isMenuLoading } = useDailyMenu(dateStr);
    const updateMenu = useUpdateDailyMenu();

    // Form State
    const [menuForm, setMenuForm] = useState({
        lunchSabji: "",
        dinnerSabji: "",
        weekdayPrice: 99,
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
        rotiName: "Ghee Roti",
        rotiQty: 5,
        extraRotiPrice: 10,
        lunchItemsList: "Salad, Dal OR Lahsun Chutney, Desi Chhach",
        dinnerItemsList: "Salad, Dal OR Lahsun Chutney, Desi Chhach",
        sundayItemName: "",
        sundayPrice: 120,
        sundayDinnerOpen: false,
        sundayImage: "",
        isServiceOff: false
    });

    const [dayType, setDayType] = useState<string>('Weekday');

    // AI Photo Studio Modal State
    const [activeImageModal, setActiveImageModal] = useState<{
        isOpen: boolean;
        thaliId: "regular" | "desiSpecial" | "paneerSpecial" | "sunday";
        title: string;
        currentImage: string;
        defaultImage: string;
    } | null>(null);

    useEffect(() => {
        if (menuData?.data) {
            const m = menuData.data;
            const isSunday = format(date, 'EEEE') === 'Sunday';
            setDayType(isSunday ? 'Sunday' : 'Weekday');

            // Parse Roti
            let loadedRotiName = "Ghee Roti";
            let loadedRotiQty = 5;

            const parseItems = (items: string[]) => {
                if (!items) return "";
                return items.filter(i => !i.toLowerCase().includes('roti')).join(', ');
            };

            const lunchItems = m.product?.lunchItems || m.weekdayMenu?.lunchItems || [];
            const dinnerItems = m.product?.dinnerItems || m.weekdayMenu?.dinnerItems || [];

            const refItems = lunchItems.length > 0 ? lunchItems : (m.weekdayMenu?.fixedItems || []);
            const itemsArr = Array.isArray(refItems) ? refItems : refItems.split(',').map((i: any) => i.trim());
            const rotiItem = itemsArr.find((i: string) => i.toLowerCase().includes('roti'));

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
            setMenuForm({
                lunchSabji: m.weekdayMenu?.lunchSabji || m.product?.lunchSabji || "",
                dinnerSabji: m.weekdayMenu?.dinnerSabji || m.product?.dinnerSabji || "",
                weekdayPrice: thalis.regular?.price || m.weekdayMenu?.fixedPrice || m.product?.price || 99,
                regularPrice: thalis.regular?.price || m.weekdayMenu?.fixedPrice || 99,
                regularAvailable: thalis.regular?.isAvailable !== false,
                regularImage: thalis.regular?.image || "/thali-regular.jpg",
                regularItemsList: formatThaliItems(thalis.regular?.items, "4 Roti, Dal, Rice, Salad"),
                desiPrice: thalis.desiSpecial?.price || 119,
                desiAvailable: thalis.desiSpecial?.isAvailable !== false,
                desiImage: thalis.desiSpecial?.image || "/thali-desi.jpg",
                desiItemsList: formatThaliItems(thalis.desiSpecial?.items, "Dal, 6 Ghee Roti, Boondi Raita, Lahsun Chutney, Salad"),
                paneerPrice: thalis.paneerSpecial?.price || 199,
                paneerAvailable: thalis.paneerSpecial?.isAvailable !== false,
                paneerImage: thalis.paneerSpecial?.image || "/thali-paneer.jpg",
                paneerItemsList: formatThaliItems(thalis.paneerSpecial?.items, "Dal, 4 Ghee Roti, Jeera Rice, Boondi Raita, Salad, 1 Gulab Jamun"),
                paneerSabji: m.weekdayMenu?.paneerSabji || m.paneerSabji || "Paneer Butter Masala",
                rotiName: loadedRotiName,
                rotiQty: loadedRotiQty,
                extraRotiPrice: m.weekdayMenu?.extraRotiPrice || m.product?.extraRotiPrice || 10,
                lunchItemsList: parseItems(lunchItems),
                dinnerItemsList: parseItems(dinnerItems),
                sundayItemName: m.sundayMenu?.specialItemName || m.product?.itemName || "",
                sundayPrice: m.sundayMenu?.price || m.product?.price || 120,
                sundayDinnerOpen: m.sundayMenu?.isDinnerSlotOpen || false,
                sundayImage: m.sundayMenu?.image || "",
                isServiceOff: m.isServiceOff || false
            });
        }
    }, [menuData, date]);

    // Quick AI image generation based on current menu form dishes
    const quickGenerateAiPhoto = (thaliId: "regular" | "desiSpecial" | "paneerSpecial" | "sunday") => {
        const dishText = thaliId === "paneerSpecial"
            ? (menuForm.paneerSabji || "Paneer Butter Masala")
            : thaliId === "sunday"
                ? (menuForm.sundayItemName || "Chole Bhature")
                : (menuForm.lunchSabji || menuForm.dinnerSabji || "Seasonal Sabji");

        const matched = matchAiImageForMenu(dishText, thaliId);

        if (thaliId === "regular") {
            setMenuForm(prev => ({ ...prev, regularImage: matched.url }));
        } else if (thaliId === "desiSpecial") {
            setMenuForm(prev => ({ ...prev, desiImage: matched.url }));
        } else if (thaliId === "paneerSpecial") {
            setMenuForm(prev => ({ ...prev, paneerImage: matched.url }));
        } else {
            setMenuForm(prev => ({ ...prev, sundayImage: matched.url }));
        }
        toast.success(`✨ Matched real photo: "${matched.title}"! Click Save to publish.`);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                date: dateStr,
            };

            if (dayType === 'Sunday') {
                payload.sundayItemName = menuForm.sundayItemName;
                payload.sundayPrice = Number(menuForm.sundayPrice);
                payload.sundayDinnerOpen = menuForm.sundayDinnerOpen;
                payload.sundayImage = menuForm.sundayImage;

                payload.lunchSabji = menuForm.lunchSabji;
                payload.weekdayPrice = Number(menuForm.weekdayPrice);
                payload.extraRotiPrice = Number(menuForm.extraRotiPrice);
                payload.isServiceOff = menuForm.isServiceOff;
                const rotiStr = `${menuForm.rotiQty} ${menuForm.rotiName}`;

                const lunchArr = menuForm.lunchItemsList.split(',').map(s => s.trim()).filter(s => s);
                if (!lunchArr.some(i => i.includes(menuForm.rotiName))) lunchArr.unshift(rotiStr);
                payload.lunchItems = lunchArr;
            } else {
                payload.lunchSabji = menuForm.lunchSabji;
                payload.dinnerSabji = menuForm.dinnerSabji;
                payload.weekdayPrice = Number(menuForm.weekdayPrice);
                payload.extraRotiPrice = Number(menuForm.extraRotiPrice);
                payload.isServiceOff = menuForm.isServiceOff;

                const rotiStr = `${menuForm.rotiQty} ${menuForm.rotiName}`;

                const lunchArr = menuForm.lunchItemsList.split(',').map(s => s.trim()).filter(s => s);
                if (!lunchArr.some(i => i.includes(menuForm.rotiName))) lunchArr.unshift(rotiStr);

                const dinnerArr = menuForm.dinnerItemsList.split(',').map(s => s.trim()).filter(s => s);
                if (!dinnerArr.some(i => i.includes(menuForm.rotiName))) dinnerArr.unshift(rotiStr);

                payload.lunchItems = lunchArr;
                payload.dinnerItems = dinnerArr;
                payload.weekdayItems = lunchArr;
            }

            // Save Three Thalis Configuration with Photos & Accompaniments
            payload.regularPrice = Number(menuForm.regularPrice);
            payload.regularAvailable = Boolean(menuForm.regularAvailable);
            payload.regularImage = menuForm.regularImage;
            payload.regularItems = menuForm.regularItemsList.split(',').map(s => s.trim()).filter(Boolean);

            payload.desiPrice = Number(menuForm.desiPrice);
            payload.desiAvailable = Boolean(menuForm.desiAvailable);
            payload.desiImage = menuForm.desiImage;
            payload.desiItems = menuForm.desiItemsList.split(',').map(s => s.trim()).filter(Boolean);

            payload.paneerPrice = Number(menuForm.paneerPrice);
            payload.paneerAvailable = Boolean(menuForm.paneerAvailable);
            payload.paneerImage = menuForm.paneerImage;
            payload.paneerSabji = menuForm.paneerSabji;
            payload.paneerItems = menuForm.paneerItemsList.split(',').map(s => s.trim()).filter(Boolean);
            if (menuForm.sundayImage) {
                payload.sundayImage = menuForm.sundayImage;
            }

            await updateMenu.mutateAsync(payload);
            toast.success(`Menu and Photos updated for ${format(date, 'MMM dd, yyyy')}`);
        } catch (error) {
            toast.error("Failed to save menu");
        }
    };

    return (
        <Card className="max-w-4xl mx-auto shadow-md border-orange-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <CardTitle className="flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-orange-600" />
                    Daily Menu & Thali Photo Editor
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-stone-500 hover:text-orange-600"
                        title="Share Menu"
                        onClick={async () => {
                            const shareText = generateMenuShareText({
                                date: date,
                                lunchSabji: menuForm.lunchSabji,
                                lunchItems: menuForm.lunchItemsList.split(',').map(s => s.trim()).filter(s => s),
                                dinnerSabji: menuForm.dinnerSabji,
                                dinnerItems: menuForm.dinnerItemsList.split(',').map(s => s.trim()).filter(s => s),
                                lunchPrice: Number(menuForm.weekdayPrice),
                                dinnerPrice: dayType === 'Sunday' ? Number(menuForm.sundayPrice) : Number(menuForm.weekdayPrice),
                                isSunday: dayType === 'Sunday',
                                sundayItem: menuForm.sundayItemName
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
                        <Share2 className="w-5 h-5" />
                    </Button>
                    <Input
                        type="date"
                        value={dateStr}
                        onChange={(e) => setDate(new Date(e.target.value))}
                        className="w-40"
                    />
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {isMenuLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between text-sm text-gray-600 font-medium">
                            <span>Editing Menu for {format(date, 'EEEE, MMMM do')} ({dayType})</span>
                            <div className="flex items-center space-x-2">
                                <span className="font-bold text-red-600">Service Off:</span>
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    checked={menuForm.isServiceOff}
                                    onChange={(e) => setMenuForm({ ...menuForm, isServiceOff: e.target.checked })}
                                />
                            </div>
                        </div>

                        {dayType === 'Sunday' ? (
                            <div className="space-y-6">
                                {/* Sunday Lunch - Standard */}
                                <div className="space-y-4 border-b border-orange-100 pb-4">
                                    <h4 className="font-semibold text-orange-700 flex items-center">☀️ Sunday Lunch (Standard Menu)</h4>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Lunch Sabji</label>
                                            <Input
                                                value={menuForm.lunchSabji}
                                                onChange={(e) => setMenuForm({ ...menuForm, lunchSabji: e.target.value })}
                                                placeholder="e.g. Aloo Pyaj"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Thali Price (₹)</label>
                                            <Input
                                                type="number"
                                                value={menuForm.weekdayPrice}
                                                onChange={(e) => setMenuForm({ ...menuForm, weekdayPrice: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Items (comma separated)</label>
                                            <Input
                                                value={menuForm.lunchItemsList}
                                                onChange={(e) => setMenuForm({ ...menuForm, lunchItemsList: e.target.value })}
                                                placeholder="Salad, Chutney, Chach"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Roti Type</label>
                                            <Input
                                                value={menuForm.rotiName}
                                                onChange={(e) => setMenuForm({ ...menuForm, rotiName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Roti Qty</label>
                                            <Input
                                                type="number"
                                                value={menuForm.rotiQty}
                                                onChange={(e) => setMenuForm({ ...menuForm, rotiQty: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sunday Dinner - Special with Photo */}
                                <div className="space-y-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                    <h4 className="font-semibold text-indigo-700 flex items-center gap-2">
                                        🌙 Sunday Dinner (Special Menu & Photo)
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Special Item Name</label>
                                            <Input
                                                value={menuForm.sundayItemName}
                                                onChange={(e) => setMenuForm({ ...menuForm, sundayItemName: e.target.value })}
                                                placeholder="e.g. Chole Bhature"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Special Price (₹)</label>
                                            <Input
                                                type="number"
                                                value={menuForm.sundayPrice}
                                                onChange={(e) => setMenuForm({ ...menuForm, sundayPrice: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    {/* Sunday Photo Management */}
                                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-indigo-200/80">
                                        <div className="relative w-28 h-20 rounded-md overflow-hidden bg-stone-100 border shrink-0">
                                            <Image
                                                src={menuForm.sundayImage || "/thali-chole-bhature.jpg"}
                                                alt="Sunday Special"
                                                fill
                                                unoptimized
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <span className="text-xs font-bold text-stone-800">Sunday Dinner Image</span>
                                            <p className="text-[11px] text-stone-500">Generate real photo matching {menuForm.sundayItemName || 'special dish'}</p>
                                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => quickGenerateAiPhoto("sunday")}
                                                    className="h-7 text-xs font-bold text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                                                >
                                                    <Sparkles className="w-3 h-3 mr-1 text-indigo-600" />
                                                    ✨ Quick AI Photo
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setActiveImageModal({
                                                        isOpen: true,
                                                        thaliId: "sunday",
                                                        title: "Sunday Special Menu",
                                                        currentImage: menuForm.sundayImage || "/thali-enhanced.jpg",
                                                        defaultImage: "/thali-enhanced.jpg"
                                                    })}
                                                    className="h-7 text-xs font-bold text-stone-600 hover:text-stone-900"
                                                >
                                                    <Edit3 className="w-3 h-3 mr-1" />
                                                    Edit Photo
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 pt-1">
                                        <input
                                            type="checkbox"
                                            id="dinnerOpen"
                                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                            checked={menuForm.sundayDinnerOpen}
                                            onChange={(e) => setMenuForm({ ...menuForm, sundayDinnerOpen: e.target.checked })}
                                        />
                                        <label htmlFor="dinnerOpen" className="text-sm font-medium text-gray-700">Open Dinner Slot</label>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Common Settings */}
                                <div className="grid md:grid-cols-3 gap-4 border-b pb-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Roti Type</label>
                                        <Input
                                            value={menuForm.rotiName}
                                            onChange={(e) => setMenuForm({ ...menuForm, rotiName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Qty</label>
                                        <Input
                                            type="number"
                                            value={menuForm.rotiQty}
                                            onChange={(e) => setMenuForm({ ...menuForm, rotiQty: Number(e.target.value) })}
                                            min={1}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Thali Price (₹)</label>
                                        <Input
                                            type="number"
                                            value={menuForm.weekdayPrice}
                                            onChange={(e) => setMenuForm({ ...menuForm, weekdayPrice: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Lunch Section */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-orange-700 flex items-center">☀️ Lunch Configuration</h4>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-600">Lunch Sabji</label>
                                            <Input
                                                value={menuForm.lunchSabji}
                                                onChange={(e) => setMenuForm({ ...menuForm, lunchSabji: e.target.value })}
                                                placeholder="e.g. Aloo Pyaj"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-600">Accompaniments (comma separated)</label>
                                            <Input
                                                value={menuForm.lunchItemsList}
                                                onChange={(e) => setMenuForm({ ...menuForm, lunchItemsList: e.target.value })}
                                                placeholder="Salad, Chutney, Chach"
                                            />
                                            <p className="text-xs text-muted-foreground">Roti is added automatically.</p>
                                        </div>
                                    </div>

                                    {/* Dinner Section */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-indigo-700 flex items-center">🌙 Dinner Configuration</h4>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-600">Dinner Sabji</label>
                                            <Input
                                                value={menuForm.dinnerSabji}
                                                onChange={(e) => setMenuForm({ ...menuForm, dinnerSabji: e.target.value })}
                                                placeholder="e.g. Sev Tamatar"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-600">Accompaniments (comma separated)</label>
                                            <Input
                                                value={menuForm.dinnerItemsList}
                                                onChange={(e) => setMenuForm({ ...menuForm, dinnerItemsList: e.target.value })}
                                                placeholder="Salad, Chutney, Sweet"
                                            />
                                            <p className="text-xs text-muted-foreground">Roti is added automatically.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 🍱 Three Thali Options & AI Real Photo Management */}
                        <div className="p-4 sm:p-5 bg-orange-50/60 rounded-2xl border border-orange-200 space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                                <div>
                                    <h4 className="font-black text-stone-900 flex items-center gap-2 text-base">
                                        <Utensils className="w-4 h-4 text-orange-600" />
                                        Three Thali Options & Real Photos
                                    </h4>
                                    <p className="text-xs text-stone-500 font-medium">
                                        Har thali ki real photo add karein aur menu ke mutabiq AI se realistic dish image generate karein.
                                    </p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                {/* 1. Regular Thali Card */}
                                <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-sm text-stone-900">Regular Thali</span>
                                            <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                    checked={menuForm.regularAvailable}
                                                    onChange={(e) => setMenuForm({ ...menuForm, regularAvailable: e.target.checked })}
                                                />
                                                {menuForm.regularAvailable ? <span className="text-green-700 font-bold">Available</span> : <span className="text-red-600 font-bold">Disabled</span>}
                                            </label>
                                        </div>

                                        {/* Thali Photo Preview Box */}
                                        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 group">
                                            <Image
                                                src={menuForm.regularImage || "/thali-regular.jpg"}
                                                alt="Regular Thali"
                                                fill
                                                unoptimized
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {menuForm.regularImage && (
                                                <span className="absolute top-1 left-1 bg-orange-600/90 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                                                    ✨ Real Plate
                                                </span>
                                            )}
                                            <span className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white px-1.5 py-0.2 rounded">
                                                {menuForm.lunchSabji || "Sabji"}
                                            </span>
                                        </div>

                                        {/* AI & Edit Photo Controls */}
                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => quickGenerateAiPhoto("regular")}
                                                className="flex-1 h-7 text-[11px] font-bold text-orange-700 border-orange-200 hover:bg-orange-50 px-1.5"
                                                title="Generate AI photo matching current Sabji"
                                            >
                                                <Sparkles className="w-3 h-3 mr-1 text-orange-600" />
                                                ✨ AI Photo
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
                                                title="Edit prompt or choose photo"
                                            >
                                                <Edit3 className="w-3 h-3 mr-0.5" />
                                                Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setMenuForm(prev => ({ ...prev, regularImage: "/thali-regular.jpg" }))}
                                                className="h-7 text-[11px] text-stone-400 hover:text-stone-700 px-1.5"
                                                title="Reset to default photo"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                            </Button>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs text-stone-500 font-semibold">Price (₹)</label>
                                            <Input
                                                type="number"
                                                value={menuForm.regularPrice}
                                                onChange={(e) => setMenuForm({ ...menuForm, regularPrice: Number(e.target.value), weekdayPrice: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-stone-600 font-semibold">Accompaniments (comma separated)</label>
                                            <Input
                                                value={menuForm.regularItemsList}
                                                onChange={(e) => setMenuForm({ ...menuForm, regularItemsList: e.target.value })}
                                                placeholder="e.g. 4 Roti, Dal, Rice, Salad"
                                                className="text-xs"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-stone-500 pt-1 border-t line-clamp-1">Items: {menuForm.regularItemsList || "4 Roti, Dal, Rice, Salad"}</p>
                                </div>

                                {/* 2. Desi Special Thali Card */}
                                <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-sm text-amber-900">Desi Special Thali</span>
                                            <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                    checked={menuForm.desiAvailable}
                                                    onChange={(e) => setMenuForm({ ...menuForm, desiAvailable: e.target.checked })}
                                                />
                                                {menuForm.desiAvailable ? <span className="text-green-700 font-bold">Available</span> : <span className="text-red-600 font-bold">Disabled</span>}
                                            </label>
                                        </div>

                                        {/* Thali Photo Preview Box */}
                                        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 group">
                                            <Image
                                                src={menuForm.desiImage || "/thali-desi.jpg"}
                                                alt="Desi Special Thali"
                                                fill
                                                unoptimized
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {menuForm.desiImage && (
                                                <span className="absolute top-1 left-1 bg-amber-600/90 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                                                    ✨ Real Plate
                                                </span>
                                            )}
                                            <span className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white px-1.5 py-0.2 rounded">
                                                Ghee & Raita
                                            </span>
                                        </div>

                                        {/* AI & Edit Photo Controls */}
                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => quickGenerateAiPhoto("desiSpecial")}
                                                className="flex-1 h-7 text-[11px] font-bold text-amber-800 border-amber-200 hover:bg-amber-50 px-1.5"
                                                title="Generate AI photo with Desi Ghee & Raita"
                                            >
                                                <Sparkles className="w-3 h-3 mr-1 text-amber-600" />
                                                ✨ AI Photo
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
                                                title="Edit prompt or choose photo"
                                            >
                                                <Edit3 className="w-3 h-3 mr-0.5" />
                                                Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setMenuForm(prev => ({ ...prev, desiImage: "/thali-desi.jpg" }))}
                                                className="h-7 text-[11px] text-stone-400 hover:text-stone-700 px-1.5"
                                                title="Reset to default photo"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                            </Button>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs text-stone-500 font-semibold">Price (₹)</label>
                                            <Input
                                                type="number"
                                                value={menuForm.desiPrice}
                                                onChange={(e) => setMenuForm({ ...menuForm, desiPrice: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-stone-600 font-semibold">Accompaniments (comma separated)</label>
                                            <Input
                                                value={menuForm.desiItemsList}
                                                onChange={(e) => setMenuForm({ ...menuForm, desiItemsList: e.target.value })}
                                                placeholder="e.g. Dal, 6 Ghee Roti, Boondi Raita, Lahsun Chutney, Salad"
                                                className="text-xs"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-stone-500 pt-1 border-t line-clamp-1">Items: {menuForm.desiItemsList || "Dal, 6 Ghee Roti, Boondi Raita, Salad"}</p>
                                </div>

                                {/* 3. Paneer Special Thali Card */}
                                <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-sm text-purple-900">Paneer Special Thali</span>
                                            <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                    checked={menuForm.paneerAvailable}
                                                    onChange={(e) => setMenuForm({ ...menuForm, paneerAvailable: e.target.checked })}
                                                />
                                                {menuForm.paneerAvailable ? <span className="text-green-700 font-bold">Available</span> : <span className="text-red-600 font-bold">Disabled</span>}
                                            </label>
                                        </div>

                                        {/* Thali Photo Preview Box */}
                                        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 group">
                                            <Image
                                                src={menuForm.paneerImage || "/thali-paneer.jpg"}
                                                alt="Paneer Special Thali"
                                                fill
                                                unoptimized
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {menuForm.paneerImage && (
                                                <span className="absolute top-1 left-1 bg-purple-600/90 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                                                    ✨ Real Plate
                                                </span>
                                            )}
                                            <span className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white px-1.5 py-0.2 rounded truncate max-w-[80%]">
                                                {menuForm.paneerSabji || "Paneer"}
                                            </span>
                                        </div>

                                        {/* AI & Edit Photo Controls */}
                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => quickGenerateAiPhoto("paneerSpecial")}
                                                className="flex-1 h-7 text-[11px] font-bold text-purple-700 border-purple-200 hover:bg-purple-50 px-1.5"
                                                title="Generate AI photo with Paneer & Gulab Jamun"
                                            >
                                                <Sparkles className="w-3 h-3 mr-1 text-purple-600" />
                                                ✨ AI Photo
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
                                                title="Edit prompt or choose photo"
                                            >
                                                <Edit3 className="w-3 h-3 mr-0.5" />
                                                Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setMenuForm(prev => ({ ...prev, paneerImage: "/thali-paneer.jpg" }))}
                                                className="h-7 text-[11px] text-stone-400 hover:text-stone-700 px-1.5"
                                                title="Reset to default photo"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                            </Button>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs text-stone-500 font-semibold">Price (₹)</label>
                                            <Input
                                                type="number"
                                                value={menuForm.paneerPrice}
                                                onChange={(e) => setMenuForm({ ...menuForm, paneerPrice: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-stone-500 font-semibold">Paneer Dish Name</label>
                                            <Input
                                                value={menuForm.paneerSabji}
                                                onChange={(e) => setMenuForm({ ...menuForm, paneerSabji: e.target.value })}
                                                placeholder="e.g. Paneer Butter Masala"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-stone-600 font-semibold">Accompaniments (comma separated)</label>
                                            <Input
                                                value={menuForm.paneerItemsList}
                                                onChange={(e) => setMenuForm({ ...menuForm, paneerItemsList: e.target.value })}
                                                placeholder="e.g. Dal, 4 Ghee Roti, Jeera Rice, Boondi Raita, Salad, 1 Gulab Jamun"
                                                className="text-xs"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-stone-500 pt-1 border-t line-clamp-1">Items: {menuForm.paneerItemsList || "Dal, 4 Ghee Roti, Jeera Rice, Gulab Jamun"}</p>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 font-bold" disabled={updateMenu.isPending}>
                            {updateMenu.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Menu & Photos for {format(date, 'MMM dd')}
                        </Button>
                    </form>
                )}
            </CardContent>

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
                        isSunday: dayType === 'Sunday',
                        sundayItem: menuForm.sundayItemName
                    }}
                    onApplyImage={(newUrl) => {
                        if (activeImageModal.thaliId === "regular") {
                            setMenuForm(prev => ({ ...prev, regularImage: newUrl }));
                        } else if (activeImageModal.thaliId === "desiSpecial") {
                            setMenuForm(prev => ({ ...prev, desiImage: newUrl }));
                        } else if (activeImageModal.thaliId === "paneerSpecial") {
                            setMenuForm(prev => ({ ...prev, paneerImage: newUrl }));
                        } else {
                            setMenuForm(prev => ({ ...prev, sundayImage: newUrl }));
                        }
                    }}
                />
            )}
        </Card>
    );
}
