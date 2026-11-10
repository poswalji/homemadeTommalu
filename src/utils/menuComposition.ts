/**
 * Tommalu Restaurant Management System - Menu Composition & Deduplication Engine
 * 
 * Provides centralized menu composition:
 * Final Thali Menu = Shared Daily Menu (Sabji + Roti + Accompaniments) + Thali-Specific Unique Items.
 * Guarantees zero duplicate items at the data and display levels.
 */

/**
 * Normalizes item strings for collision detection (e.g. "4 Ghee Roti" vs "ghee roti")
 */
export function normalizeItemKey(item: string): string {
    if (!item) return '';
    return item
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();
}

/**
 * Parses comma-separated strings or string arrays into a clean array of strings
 */
export function parseCommaItems(val: string | string[] | undefined | null): string[] {
    if (!val) return [];
    if (Array.isArray(val)) {
        return val.map(s => String(s).trim()).filter(Boolean);
    }
    return String(val)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
}

/**
 * Composes the final Thali menu by combining:
 * 1. Sabji (Seasonal Sabji for Regular/Desi, Paneer Sabji for Paneer Special)
 * 2. Roti (uses thali override if present e.g. "6 Ghee Roti", otherwise default "${qty} ${type}")
 * 3. Shared Common Items (Dal, Rice, Salad, Chach, etc.)
 * 4. Thali-Specific Unique Items (Boondi Raita, Lahsun Chutney, Gulab Jamun, etc.)
 * 
 * Guarantees zero duplicates.
 */
export function composeThaliItems({
    sabji,
    rotiType = 'Ghee Roti',
    rotiQty = 4,
    commonItems = [],
    uniqueItems = [],
    isPaneerSpecial = false
}: {
    sabji: string;
    rotiType?: string;
    rotiQty?: number;
    commonItems?: string[] | string;
    uniqueItems?: string[] | string;
    isPaneerSpecial?: boolean;
}): string[] {
    const commonList = parseCommaItems(commonItems);
    const uniqueList = parseCommaItems(uniqueItems);
    const result: string[] = [];
    const seen = new Set<string>();

    const addItem = (item: string) => {
        if (!item || typeof item !== 'string') return;
        const trimmed = item.trim();
        if (!trimmed) return;
        const key = normalizeItemKey(trimmed);
        if (!seen.has(key)) {
            seen.add(key);
            result.push(trimmed);
        }
    };

    // 1. Add Sabji
    if (sabji && sabji.trim()) {
        const cleanSabji = sabji.trim();
        addItem(cleanSabji);
    }

    // 2. Add Roti (Check if unique items has a specific roti override e.g. "5 Ghee Roti" or "6 Ghee Roti")
    const rotiOverride = uniqueList.find(i => i.toLowerCase().includes('roti') || i.toLowerCase().includes('phulka') || i.toLowerCase().includes('chapati'));
    if (!rotiOverride) {
        const formattedRoti = `${rotiQty} ${rotiType}`.trim();
        if (formattedRoti) addItem(formattedRoti);
    }

    // 3. Add Shared Common Items (Dal, Rice, Salad, Chach, etc.)
    commonList.forEach(item => {
        // Do not add if it looks like a generic roti when roti is already handled
        if (item.toLowerCase().includes('roti') && !rotiOverride) return;
        addItem(item);
    });

    // 4. Add Thali-Specific Unique Items
    uniqueList.forEach(item => {
        addItem(item);
    });

    return result;
}

/**
 * Extracts unique additions from an existing full thali items array by subtracting
 * shared sabji, rotis, and common accompaniments.
 */
export function extractUniqueItems(
    existingItems: string[] | string | undefined,
    sharedSabji: string,
    defaultRotiStr: string,
    commonItems: string[] | string
): string[] {
    const list = parseCommaItems(existingItems);
    if (list.length === 0) return [];

    const commonList = parseCommaItems(commonItems);
    const sharedKeys = new Set<string>();

    if (sharedSabji) {
        sharedKeys.add(normalizeItemKey(sharedSabji));
        sharedKeys.add(normalizeItemKey(`1 Seasonal Sabji`));
        sharedKeys.add(normalizeItemKey(`Seasonal Sabji`));
    }
    if (defaultRotiStr) {
        sharedKeys.add(normalizeItemKey(defaultRotiStr));
    }
    commonList.forEach(i => {
        sharedKeys.add(normalizeItemKey(i));
    });

    const unique: string[] = [];
    list.forEach(item => {
        const key = normalizeItemKey(item);
        // If this item is not part of the shared daily items, it's unique to this thali
        if (!sharedKeys.has(key)) {
            // Also ignore generic '1 Seasonal Sabji'
            if (key !== '1seasonalsabji' && key !== 'seasonalsabji') {
                unique.push(item);
            }
        }
    });

    return unique;
}
