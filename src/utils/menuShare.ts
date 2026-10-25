import { format } from "date-fns";

interface MenuShareData {
    date: string | Date;
    lunchSabji: string;
    lunchItems?: string[];
    dinnerSabji: string;
    dinnerItems?: string[];
    lunchPrice?: number;
    dinnerPrice?: number;
    isSunday?: boolean;
    sundayItem?: string;
    sundayLunchName?: string;
    sundayDinnerName?: string;
    thalis?: {
        regularPrice?: number;
        desiPrice?: number;
        paneerPrice?: number;
    };
}

export const generateMenuShareText = (data: MenuShareData): string => {
    const dateObj = typeof data.date === 'string' ? new Date(data.date) : data.date;
    const dateStr = format(dateObj, 'EEE, MMM do');

    if (data.isSunday) {
        let text = `🌟 *Tommalu Sunday Special Menu* - ${dateStr}\n\n`;
        text += `☀️ *Sunday Lunch: ${data.sundayLunchName || "Paratha Special Menu"} — ₹${data.lunchPrice || 99}*\n`;
        text += `   • Fresh Stuffed Parathas (Aloo, Paneer, Pyaj, Gobhi)\n`;
        text += `   • Served with Fresh Dahi, Amul Butter, Hari Chutney & Achar\n\n`;

        text += `🌙 *Sunday Dinner: ${data.sundayDinnerName || data.sundayItem || "Sunday Special Feast"} — ₹${data.dinnerPrice || 149}*\n`;
        text += `   • Complete Weekend Royal Feast with Sabzi, Dal, Rice, Roti/Puri, Salad & Sweet\n\n`;

        text += `🕒 *Delivery Timings:*\n`;
        text += `Lunch: 11:30 AM–2:00 PM | Dinner: 7:30–10:00 PM\n\n`;
        text += `Order Now: https://tommalu.com/homemade\n`;
        text += `Or Call/WhatsApp: 7742892352`;
        return text;
    }

    let text = `🍽️ *Tommalu Homemade Food Menu* - ${dateStr}\n\n`;

    // Today's Sabji
    text += `☀️ *Lunch*: ${data.lunchSabji || "Seasonal Sabji"}\n`;
    text += `🌙 *Dinner*: ${data.dinnerSabji || "Seasonal Sabji"}\n\n`;

    // 3 Thali Options
    text += `🍱 *Our 3 Thali Options:*\n`;
    text += `1️⃣ *Regular Thali — ₹${data.thalis?.regularPrice || data.lunchPrice || 99}*\n`;
    text += `   • 1 Seasonal Sabji\n   • 4 Roti, Dal\n   • Rice\n   • Salad\n\n`;

    text += `2️⃣ *Desi Special Thali — ₹${data.thalis?.desiPrice || 119}*\n`;
    text += `   • 1 Seasonal Sabji\n   • Dal\n   • 6 Ghee Roti / Chawal\n   • Boondi Raita\n   • Lahsun Chutney\n   • Salad\n\n`;

    text += `3️⃣ *Paneer Special Thali — ₹${data.thalis?.paneerPrice || 199}*\n`;
    text += `   • 1 Paneer Sabji\n   • Dal\n   • 4 Ghee Roti\n   • Jeera Rice\n   • Boondi Raita\n   • Salad\n   • 1 Gulab Jamun\n\n`;

    text += `🕒 *Delivery Timings:*\n`;
    text += `Lunch: 11:30 AM–2:00 PM | Dinner: 7:30–10:00 PM\n\n`;
    text += `Order Now: https://tommalu.com/homemade\n`;
    text += `Or Call/WhatsApp: 7742892352`;

    return text;
};
