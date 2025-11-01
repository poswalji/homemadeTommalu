export const appConfig = {
  name: "Tommalu",
  description: "Your trusted partner for fresh groceries and delicious food delivery in Jaipur",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://tommalu.com",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  keywords: [
    "food delivery nims",
    "food delivery Achrol",
    "fresh groceries Achrol",
    "online grocery shopping",
    "restaurant food delivery",
    "Tommalu food delivery",
    "fast delivery Jaipur",
    "best grocery delivery",
  ],
  social: {
    facebook: "https://facebook.com/tommalu",
    instagram: "https://instagram.com/tommalu",
    twitter: "https://twitter.com/tommalu",
  },
  contact: {
    phone: "+91 7742892352",
    whatsapp: "7742892352", // WhatsApp number without country code prefix
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

