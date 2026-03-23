"use client";

import { motion } from "framer-motion";
import { Search, ShoppingCart, MapPin, Package, Calendar, User, Check } from "lucide-react";

const steps = [
  {
    step: "1",
    title: "Browse Daily Menus",
    description: "Explore fresh, home-cooked food prepared love and safety focused standard daily menus.",
    icon: <Search className="h-6 w-6" />,
    color: "from-orange-500 to-orange-600",
  },
  {
    step: "2",
    title: "Pre-order Your Meal",
    description: "Select your menu item and pre-order by 11AM (Lunch) or 7PM (Dinner).",
    icon: <Calendar className="h-6 w-6" />,
    color: "from-blue-500 to-blue-600",
  },
  {
    step: "3",
    title: "Enter Details",
    description: "Provide your name and delivery address to get started.",
    icon: <MapPin className="h-6 w-6" />,
    color: "from-green-500 to-green-600",
  },
  {
    step: "4",
    title: "Book & Enjoy",
    description: "Confirm your order and enjoy fresh, homemade food delivered to you.",
    icon: <Check className="h-6 w-6" />,
    color: "from-purple-500 to-purple-600",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-20 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get your order delivered in just 4 simple steps
          </p>
        </motion.div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group"
              >
                {/* Connecting Line (Only visible on lg screens for single-row effect) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-[56px] left-1/2 w-full h-[2px] border-t-2 border-dashed border-gray-200 z-0" />
                )}

                <div className="bg-white p-7 rounded-2xl shadow-md border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 text-center flex flex-col items-center h-full relative z-10">
                  <div className="relative mb-6">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br ${item.color} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-900 border-2 border-white text-white text-xs font-bold flex items-center justify-center shadow-md">
                      {item.step}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-slate-800">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

