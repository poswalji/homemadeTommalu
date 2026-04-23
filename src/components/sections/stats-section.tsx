"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Flame, IndianRupee, Clock } from "lucide-react";
import { usePublicStats } from "@/hooks/api/use-public";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsSection() {
  const { data: statsData, isLoading } = usePublicStats();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Time logic
  let mealContext = "Lunch";
  let platesLeft = 20;

  if (mounted) {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes >= 10 * 60 && totalMinutes < 15 * 60) {
      mealContext = "Lunch";
      platesLeft = Math.max(3, 25 - Math.floor((totalMinutes - 10 * 60) / 15));
    } else if (totalMinutes >= 17 * 60 && totalMinutes < 22 * 60) {
      mealContext = "Dinner";
      platesLeft = Math.max(3, 25 - Math.floor((totalMinutes - 17 * 60) / 15));
    } else if (totalMinutes >= 15 * 60 && totalMinutes < 17 * 60) {
      mealContext = "Dinner"; // upcoming
      platesLeft = 25;
    } else {
      mealContext = "Lunch"; // upcoming
      platesLeft = 25;
    }
  }

  // Use API data if available, otherwise use defaults
  // We use type assertion to safely access potentially unmapped fields
  const todayOrders = (statsData?.data as any)?.todayOrders || "40+";

  const stats = [
    {
      icon: <ShoppingBag className="h-8 w-8" />,
      value: todayOrders,
      label: mounted ? `${mealContext} Orders Today` : "Orders Today",
      highlight: false,
    },
    {
      icon: <Flame className="h-8 w-8" />,
      value: mounted ? platesLeft : 20,
      label: "Plates Left",
      highlight: true,
    },
    {
      icon: <IndianRupee className="h-8 w-8" />,
      value: "₹99",
      label: "Today's Meal",
      highlight: false,
    },
    {
      icon: <Clock className="h-8 w-8" />,
      value: "2",
      label: "Slots (Lunch/Dinner)",
      highlight: false,
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-white to-orange-50/50">
      <div className="container px-4 md:px-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-orange-600 uppercase bg-orange-100 rounded-full">
            Live Status
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
            Today on <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Tommalu</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Fresh homemade meals prepared daily. Limited plates available for each slot.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border ${
                stat.highlight ? "border-red-200 bg-red-50/30" : "border-gray-100"
              } group relative overflow-hidden`}
            >
              {stat.highlight && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150" />
              )}
              
              <div className="flex justify-center mb-6 relative z-10">
                <div
                  className={`${
                    stat.highlight
                      ? "bg-red-100 group-hover:bg-red-200"
                      : "bg-orange-50 group-hover:bg-orange-100"
                  } rounded-2xl p-4 transition-colors duration-300`}
                >
                  <div className={stat.highlight ? "text-red-500" : "text-orange-600"}>
                    {stat.icon}
                  </div>
                </div>
              </div>
              
              {isLoading && !stat.highlight ? (
                <div className="relative z-10">
                  <Skeleton className="h-10 w-24 mx-auto mb-2" />
                  <Skeleton className="h-5 w-32 mx-auto" />
                </div>
              ) : (
                <div className="relative z-10">
                  <h3
                    className={`text-4xl lg:text-5xl font-bold mb-3 tracking-tight ${
                      stat.highlight ? "text-red-600" : "text-gray-900"
                    }`}
                  >
                    {stat.value}
                  </h3>
                  <p
                    className={`font-semibold ${
                      stat.highlight ? "text-red-500" : "text-gray-600"
                    }`}
                  >
                    {stat.label}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

