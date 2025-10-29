"use client";

import { motion } from "framer-motion";
import { Users, Truck, Star, ShoppingBag } from "lucide-react";

const stats = [
  {
    icon: <Users className="h-8 w-8" />,
    value: "50,000+",
    label: "Happy Customers",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: <Truck className="h-8 w-8" />,
    value: "200K+",
    label: "Deliveries Completed",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: <Star className="h-8 w-8" />,
    value: "4.8/5",
    label: "Average Rating",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    icon: <ShoppingBag className="h-8 w-8" />,
    value: "1000+",
    label: "Products Available",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

export function StatsSection() {
  return (
    <section className="py-16 md:py-24 bg-[lab(66%_50.34_52.19)] text-white">
      <div className="container px-4 md:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Numbers That Speak
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto">
            Trusted by thousands of satisfied customers in Jaipur
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 rounded-full p-3">
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-4xl font-bold mb-2">{stat.value}</h3>
              <p className="text-white/90">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

