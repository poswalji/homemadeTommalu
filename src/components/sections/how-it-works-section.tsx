"use client";

import { motion } from "framer-motion";
import { Search, ShoppingCart, MapPin, Package } from "lucide-react";

const steps = [
  {
    step: "1",
    title: "Browse & Select",
    description: "Explore our wide range of products and add items to your cart",
    icon: <Search className="h-8 w-8" />,
    color: "from-blue-500 to-blue-600",
  },
  {
    step: "2",
    title: "Add to Cart",
    description: "Review your selections and proceed to checkout",
    icon: <ShoppingCart className="h-8 w-8" />,
    color: "from-green-500 to-green-600",
  },
  {
    step: "3",
    title: "Enter Address",
    description: "Provide your delivery address for fast doorstep delivery",
    icon: <MapPin className="h-8 w-8" />,
    color: "from-orange-500 to-orange-600",
  },
  {
    step: "4",
    title: "Track Delivery",
    description: "Get real-time updates and enjoy your fresh order!",
    icon: <Package className="h-8 w-8" />,
    color: "from-purple-500 to-purple-600",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-20">
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
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-green-500 via-orange-500 to-purple-500 transform -translate-y-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${item.color} text-white mb-4`}>
                    {item.icon}
                  </div>
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br ${item.color} text-white text-sm font-bold mb-3`}>
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

