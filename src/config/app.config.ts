export const appConfig = {
  name: "Tommalu",
  description:
    "Hyperlocal delivery in Achrol & NIMS — Homemade food, daily essentials delivered fast.",

  url: process.env.NEXT_PUBLIC_APP_URL || "https://tommalu.com",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",

  keywords: [
    "homemade food delivery Achrol",
    "home cooked meals NIMS Jaipur",
    "Achrol food delivery service",
    "Jaipur hyperlocal delivery",
    "grocery delivery Achrol",
    "tiffin service NIMS",
    "order homemade lunch Achrol",
    "order dinner NIMS hostel",
  ],

  ogImage: "/og/og-image.png",
  favicon: "/favicon.ico",
  author: "Tommalu",
  themeColor: "#ffffff",

  social: {
    facebook: "https://facebook.com/tommalu",
    instagram: "https://instagram.com/tommalu",
    twitter: "https://twitter.com/tommalu",
  },

  contact: {
    phone: "+91 7742892352",
    whatsapp: "7742892352",
    email: "support@tommalu.com",
    address: "Achrol & NIMS Area, Jaipur",
  },

  features: [
    {
      icon: "🍱",
      title: "Homemade Food",
      description: "Fresh home-cooked meals on pre-order",
    },
    {
      icon: "🥬",
      title: "Local Groceries",
      description: "Fast delivery of essentials from trusted stores",
    },
    {
      icon: "🚚",
      title: "Hyperfast Delivery",
      description: "Average 25–40 min within Achrol/NIMS",
    },
    {
      icon: "💳",
      title: "Easy Payment",
      description: "Cash, UPI, and wallet payments supported",
    },
  ],
};
