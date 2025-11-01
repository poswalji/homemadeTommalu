"use client";

import { motion } from "framer-motion";
import { Users, Truck, Star, ShoppingBag } from "lucide-react";
import { usePublicStats } from "@/hooks/api/use-public";
import { Skeleton } from "@/components/ui/skeleton";

const statIcons = [
  <Users key="users" className="h-8 w-8" />,
  <Truck key="truck" className="h-8 w-8" />,
  <Star key="star" className="h-8 w-8" />,
  <ShoppingBag key="bag" className="h-8 w-8" />,
];

export function StatsSection() {
  const { data: statsData, isLoading } = usePublicStats();

  // Fallback stats if API fails
  const defaultStats = [
    {
      icon: statIcons[0],
      value: "50,000+",
      label: "Happy Customers",
    },
    {
      icon: statIcons[1],
      value: "200K+",
      label: "Deliveries Completed",
    },
    {
      icon: statIcons[2],
      value: "4.8/5",
      label: "Average Rating",
    },
    {
      icon: statIcons[3],
      value: "1000+",
      label: "Active Stores",
    },
  ];

  // Use API data if available, otherwise use defaults
  const stats = statsData?.data
    ? [
        {
          icon: statIcons[0],
          value: `${(statsData.data.totalCustomers || 0).toLocaleString()}+`,
          label: "Happy Customers",
        },
        {
          icon: statIcons[1],
          value: `${(statsData.data.totalOrders || 0).toLocaleString()}+`,
          label: "Deliveries Completed",
        },
        {
          icon: statIcons[2],
          value: statsData.data.averageRating ? `${statsData.data.averageRating.toFixed(1)}/5` : "4.8/5",
          label: "Average Rating",
        },
        {
          icon: statIcons[3],
          value: `${(statsData.data.totalStores || 0).toLocaleString()}+`,
          label: "Active Stores",
        },
      ]
    : defaultStats;
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
              {isLoading ? (
                <>
                  <Skeleton className="h-10 w-32 mx-auto mb-2 bg-white/20" />
                  <Skeleton className="h-5 w-24 mx-auto bg-white/20" />
                </>
              ) : (
                <>
                  <h3 className="text-4xl font-bold mb-2">{stat.value}</h3>
                  <p className="text-white/90">{stat.label}</p>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

