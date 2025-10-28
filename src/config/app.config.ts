export const appConfig = {
  name: "TomMalu",
  description: "Your trusted partner for fresh groceries and delicious food delivery in Jaipur",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://tommalu.com",
  keywords: [
    "food delivery Jaipur",
    "fresh groceries Jaipur",
    "online grocery shopping",
    "restaurant food delivery",
    "TomMalu food delivery",
    "fast delivery Jaipur",
    "best grocery delivery",
  ],
  social: {
    facebook: "https://facebook.com/tommalu",
    instagram: "https://instagram.com/tommalu",
    twitter: "https://twitter.com/tommalu",
  },
  contact: {
    phone: "+91 1234567890",
    whatsapp: "1234567890", // WhatsApp number without country code prefix
    email: "support@tommalu.com",
    address: "Jaipur, Rajasthan, India",
  },
  features: [
    { icon: "🚚", title: "Fast Delivery", description: "Quick 20-30 min delivery" },
    { icon: "🌿", title: "Fresh Groceries", description: "Farm-fresh produce daily" },
    { icon: "🔒", title: "Secure Payment", description: "100% secure transactions" },
    { icon: "⭐", title: "Quality Assured", description: "Verified restaurants & stores" },
  ],
};

