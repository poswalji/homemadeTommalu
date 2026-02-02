import { format } from "date-fns";

interface MenuShareData {
    date: string | Date; // Date string or object
    lunchSabji: string;
    lunchItems: string[];
    dinnerSabji: string;
    dinnerItems: string[];
    lunchPrice: number;
    dinnerPrice: number;
    isSunday?: boolean;
    sundayItem?: string;
}

export const generateMenuShareText = (data: MenuShareData): string => {
    const dateObj = typeof data.date === 'string' ? new Date(data.date) : data.date;
    const dateStr = format(dateObj, 'EEE, MMM do');

    // Helper to format items list
    const formatItems = (items: string[]) => {
        if (!items || items.length === 0) return "";
        return `+ ${items.join(", ")}`;
    };

    let text = `🍽️ *Tommalu Daily Menu* - ${dateStr}\n\n`;

    // Lunch Section
    text += `☀️ *Lunch Special* (₹${data.lunchPrice})\n`;
    text += `${data.lunchSabji || "Tasty Sabji"}\n`;
    const lunchExtras = formatItems(data.lunchItems);
    if (lunchExtras) text += `${lunchExtras}\n`;
    text += `\n`;

    // Dinner Section
    const dinnerTitle = data.isSunday ? `🌙 *Sunday Special Dinner*` : `🌙 *Dinner Special*`;
    const dinnerPriceStr = data.isSunday ? "" : `(₹${data.dinnerPrice})`; // Sunday usually special price logic, or same? assuming same for now or hidden if distinct

    text += `${dinnerTitle} ${dinnerPriceStr}\n`;
    text += `${data.dinnerSabji || "Special Dinner"}\n`;
    const dinnerExtras = formatItems(data.dinnerItems);
    if (dinnerExtras) text += `${dinnerExtras}\n`;

    text += `\n`;
    text += `Order Now: https://tommalu.com/homemade\n`;
    text += `Or Call/WhatsApp: 7742892352`;

    return text;
};
