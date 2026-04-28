import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Loader2, Save, Utensils, Lock, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDailyMenu, useUpdateDailyMenu } from '@/hooks/api/use-homemade-food';
import { generateMenuShareText } from '@/utils/menuShare';

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
        rotiName: "Ghee Roti",
        rotiQty: 5,
        extraRotiPrice: 10,
        lunchItemsList: "Salad, Dal OR Lahsun Chutney, Desi Chhach", // Editable string
        dinnerItemsList: "Salad, Dal OR Lahsun Chutney, Desi Chhach", // Editable string
        sundayItemName: "",
        sundayPrice: 120,
        sundayDinnerOpen: false,
        isServiceOff: false
    });

    const [dayType, setDayType] = useState<string>('Weekday');

    useEffect(() => {
        if (menuData?.data) {
            const m = menuData.data;
            const isSunday = format(date, 'EEEE') === 'Sunday';
            setDayType(isSunday ? 'Sunday' : 'Weekday');

            // Parse Roti
            let loadedRotiName = "Ghee Roti";
            let loadedRotiQty = 5;

            // Helper to get items excluding basic roti (logic can be improved)
            const parseItems = (items: string[]) => {
                if (!items) return "";
                // Remove the item that looks like "4 Chulhe ki Roti" or "Roti"
                return items.filter(i => !i.toLowerCase().includes('roti')).join(', ');
            };

            const lunchItems = m.product?.lunchItems || m.weekdayMenu?.lunchItems || [];
            const dinnerItems = m.product?.dinnerItems || m.weekdayMenu?.dinnerItems || [];

            // Try to find Roti info from lunch items (or fixed items fallback)
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

            setMenuForm({
                lunchSabji: m.weekdayMenu?.lunchSabji || m.product?.lunchSabji || "",
                dinnerSabji: m.weekdayMenu?.dinnerSabji || m.product?.dinnerSabji || "",
                weekdayPrice: m.weekdayMenu?.fixedPrice || m.product?.price || 99,
                rotiName: loadedRotiName,
                rotiQty: loadedRotiQty,
                extraRotiPrice: m.weekdayMenu?.extraRotiPrice || m.product?.extraRotiPrice || 10,
                // Items without Roti for editable text area
                lunchItemsList: parseItems(lunchItems),
                dinnerItemsList: parseItems(dinnerItems),
                sundayItemName: m.sundayMenu?.specialItemName || m.product?.itemName || "",
                sundayPrice: m.sundayMenu?.price || m.product?.price || 120,
                sundayDinnerOpen: m.sundayMenu?.isDinnerSlotOpen || false,
                isServiceOff: m.isServiceOff || false
            });
        }
    }, [menuData, date]);

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

                // Also save standard weekday props which now apply to Sunday Lunch
                payload.lunchSabji = menuForm.lunchSabji;
                payload.weekdayPrice = Number(menuForm.weekdayPrice);
                payload.extraRotiPrice = Number(menuForm.extraRotiPrice);
                payload.isServiceOff = menuForm.isServiceOff;
                const rotiStr = `${menuForm.rotiQty} ${menuForm.rotiName}`;

                const lunchArr = menuForm.lunchItemsList.split(',').map(s => s.trim()).filter(s => s);
                if (!lunchArr.some(i => i.includes(menuForm.rotiName))) lunchArr.unshift(rotiStr);
                payload.lunchItems = lunchArr;
                // We don't necessarily update dinnerItems for Sunday if it's special, but backend keeps them safe
            } else {
                payload.lunchSabji = menuForm.lunchSabji;
                payload.dinnerSabji = menuForm.dinnerSabji;
                payload.weekdayPrice = Number(menuForm.weekdayPrice);
                payload.extraRotiPrice = Number(menuForm.extraRotiPrice);
                payload.isServiceOff = menuForm.isServiceOff;

                // Construct Items Arrays
                const rotiStr = `${menuForm.rotiQty} ${menuForm.rotiName}`;

                const lunchArr = menuForm.lunchItemsList.split(',').map(s => s.trim()).filter(s => s);
                if (!lunchArr.some(i => i.includes(menuForm.rotiName))) lunchArr.unshift(rotiStr); // Ensure Roti is there

                const dinnerArr = menuForm.dinnerItemsList.split(',').map(s => s.trim()).filter(s => s);
                if (!dinnerArr.some(i => i.includes(menuForm.rotiName))) dinnerArr.unshift(rotiStr);

                payload.lunchItems = lunchArr;
                payload.dinnerItems = dinnerArr;
                // Deprecated but sent for safety
                payload.weekdayItems = lunchArr;
            }

            await updateMenu.mutateAsync(payload);
            toast.success(`Menu updated for ${format(date, 'MMM dd, yyyy')}`);
        } catch (error) {
            toast.error("Failed to save menu");
        }
    };

    return (
        <Card className="max-w-4xl mx-auto shadow-md border-orange-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <CardTitle className="flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-orange-600" />
                    Daily Menu Editor
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-stone-500 hover:text-orange-600"
                        title="Share Menu"
                        onClick={async () => {
                            // Construct data from Form State for preview accuracy
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

                                {/* Sunday Dinner - Special */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-indigo-700 flex items-center">🌙 Sunday Dinner (Special Menu)</h4>
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
                                    <div className="flex items-center space-x-2 pt-2">
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

                        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={updateMenu.isPending}>
                            {updateMenu.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Menu for {format(date, 'MMM dd')}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
