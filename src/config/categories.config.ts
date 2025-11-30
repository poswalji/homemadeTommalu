export const MENU_CATEGORIES = [
    'Veg Main Course',
    'Non-Veg Main Course',
    'Starters & Snacks',
    'Breads & Rice',
    'Drinks & Beverages',
    'Dairy & Eggs',
    'Groceries & Essentials',
    'Fruits & Vegetables',
    'Sweets & Desserts',
    'Fast Food',
    'Bakery Items',
    'Grains & Pulses',
    'Meat & Seafood',
    'Combo',
    'Other',
];

export const STORE_CATEGORIES = [
    'Restaurant',
    'Grocery Store',
    'Bakery',
    'Pharmacy',
    'Homemade Food',
    'Dairy',
    'Other',
];

export const STORE_CATEGORY_MAPPING: Record<string, string[]> = {
    Restaurant: [
        'Veg Main Course',
        'Non-Veg Main Course',
        'Starters & Snacks',
        'Breads & Rice',
        'Drinks & Beverages',
        'Sweets & Desserts',
        'Fast Food',
        'Other',
    ],
    'Homemade Food': [
        'Veg Main Course',
        'Non-Veg Main Course',
        'Starters & Snacks',
        'Breads & Rice',
        'Drinks & Beverages',
        'Sweets & Desserts',
        'Fast Food',
        'Other',
    ],
    'Grocery Store': [
        'Groceries & Essentials',
        'Dairy & Eggs',
        'Fruits & Vegetables',
        'Grains & Pulses',
        'Bakery Items',
        'Other',
    ],
    Bakery: ['Bakery Items', 'Sweets & Desserts', 'Drinks & Beverages', 'Other'],
    Pharmacy: ['Other'],
    Dairy: ['Dairy & Eggs', 'Sweets & Desserts', 'Other'],
    Other: MENU_CATEGORIES,
};

export const STORE_CATEGORY_DETAILS: Record<string, { emoji: string; description: string }> = {
    'Restaurant': { emoji: '🍽️', description: 'Delicious meals from top restaurants' },
    'Grocery Store': { emoji: '🛒', description: 'Fresh groceries delivered to you' },
    'Bakery': { emoji: '🥐', description: 'Freshly baked goods and treats' },
    'Pharmacy': { emoji: '💊', description: 'Medicines and health essentials' },
    'Homemade Food': { emoji: '🍱', description: 'Authentic homemade meals' },
    'Dairy': { emoji: '🥛', description: 'Fresh milk and dairy products' },
    'Other': { emoji: '🏪', description: 'Everything else you need' },
};
