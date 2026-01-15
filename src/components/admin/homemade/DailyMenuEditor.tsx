import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Loader2, Save, Utensils, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useDailyMenu, useUpdateDailyMenu } from '@/hooks/api/use-homemade-food';

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
        weekdayPrice: 89,
        rotiName: "Chulhe ki Roti",
        rotiQty: 4,
        extraRotiPrice: 10,
        sundayItemName: "",
        sundayPrice: 120,
        sundayDinnerOpen: false
    });

    const [dayType, setDayType] = useState<string>('Weekday');

    useEffect(() => {
        if (menuData?.data) {
            const m = menuData.data;
            const isSunday = format(date, 'EEEE') === 'Sunday';
            setDayType(isSunday ? 'Sunday' : 'Weekday');

            // Parse Roti from existing items if possible
            let loadedRotiName = "Chulhe ki Roti";
            let loadedRotiQty = 4;

            if (m.weekdayMenu?.fixedItems) {
                const items = Array.isArray(m.weekdayMenu.fixedItems)
                    ? m.weekdayMenu.fixedItems
                    : m.weekdayMenu.fixedItems.split(',').map((i: string) => i.trim());

                // Find item that looks like roti (e.g. "4 Chulhe ki Roti")
                const rotiItem = items.find((i: string) => i.toLowerCase().includes('roti'));
                if (rotiItem) {
                    const match = rotiItem.match(/(\d+)\s+(.+)/);
                    if (match) {
                        loadedRotiQty = parseInt(match[1]);
                        loadedRotiName = match[2];
                    } else {
                        loadedRotiName = rotiItem;
                    }
                }
            }

            setMenuForm({
                lunchSabji: m.weekdayMenu?.lunchSabji || "",
                dinnerSabji: m.weekdayMenu?.dinnerSabji || "",
                weekdayPrice: m.weekdayMenu?.fixedPrice || 89,
                rotiName: loadedRotiName,
                rotiQty: loadedRotiQty,
                extraRotiPrice: m.weekdayMenu?.extraRotiPrice || 10,
                sundayItemName: m.sundayMenu?.specialItemName || "",
                sundayPrice: m.sundayMenu?.price || 120,
                sundayDinnerOpen: m.sundayMenu?.isDinnerSlotOpen || false
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
            } else {
                payload.lunchSabji = menuForm.lunchSabji;
                payload.dinnerSabji = menuForm.dinnerSabji;
                payload.weekdayPrice = Number(menuForm.weekdayPrice);
                payload.extraRotiPrice = Number(menuForm.extraRotiPrice);
                // STRICT RULE: Fixed items + Roti
                payload.weekdayItems = [
                    'Lahsun Chutney',
                    'Salad',
                    'Chach',
                    `${menuForm.rotiQty} ${menuForm.rotiName}`
                ];
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
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-center text-gray-600 font-medium">
                            Editing Menu for {format(date, 'EEEE, MMMM do')} ({dayType})
                        </div>

                        {dayType === 'Sunday' ? (
                            <div className="space-y-4">
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
                                        <label className="text-sm font-medium">Price (₹)</label>
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
                                    <label htmlFor="dinnerOpen" className="text-sm font-medium text-gray-700">Open Dinner Slot (Usually Lunch Only)</label>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Lunch Sabji (Name Only)</label>
                                        <Input
                                            value={menuForm.lunchSabji}
                                            onChange={(e) => setMenuForm({ ...menuForm, lunchSabji: e.target.value })}
                                            placeholder="Lunch Special"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Dinner Sabji (Name Only)</label>
                                        <Input
                                            value={menuForm.dinnerSabji}
                                            onChange={(e) => setMenuForm({ ...menuForm, dinnerSabji: e.target.value })}
                                            placeholder="Dinner Special"
                                        />
                                    </div>

                                    {/* Roti Editor */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Roti Type</label>
                                        <Input
                                            value={menuForm.rotiName}
                                            onChange={(e) => setMenuForm({ ...menuForm, rotiName: e.target.value })}
                                            placeholder="e.g. Chulhe ki Roti"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Roti Quantity</label>
                                        <Input
                                            type="number"
                                            value={menuForm.rotiQty}
                                            onChange={(e) => setMenuForm({ ...menuForm, rotiQty: Number(e.target.value) })}
                                            min={1}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Extra Roti Price (₹)</label>
                                        <Input
                                            type="number"
                                            value={menuForm.extraRotiPrice}
                                            onChange={(e) => setMenuForm({ ...menuForm, extraRotiPrice: Number(e.target.value) })}
                                            min={0}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Price (₹)</label>
                                        <Input
                                            type="number"
                                            value={menuForm.weekdayPrice}
                                            onChange={(e) => setMenuForm({ ...menuForm, weekdayPrice: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                {/* Fixed Items Display */}
                                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lock className="w-4 h-4 text-orange-600" />
                                        <h4 className="font-semibold text-orange-900">Fixed Menu Items</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['Lahsun Chutney', 'Salad', 'Chach'].map(item => (
                                            <span key={item} className="px-3 py-1 bg-white border border-orange-200 rounded-full text-sm font-medium text-orange-800">
                                                {item}
                                            </span>
                                        ))}
                                        <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600">
                                            + {menuForm.rotiQty} {menuForm.rotiName}
                                        </span>
                                    </div>
                                    <p className="text-xs text-orange-700 mt-2">
                                        * Fixed items cannot be changed. Roti type and quantity are editable above.
                                    </p>
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
