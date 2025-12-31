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
      value: "50+",
      label: "Happy Customers",
    },
    {
      icon: statIcons[1],
      value: "65+",
      label: "Deliveries Completed",
    },
    {
      icon: statIcons[2],
      value: "4.8/5",
      label: "Average Rating",
    },
    {
      icon: statIcons[3],
      value: "10+",
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
            Our Impact
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
            Numbers That <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Speak</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Building trust through transparency. We are proud of the community we have built in Jaipur.
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
              className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-orange-50 group-hover:bg-orange-100 rounded-2xl p-4 transition-colors duration-300">
                  <div className="text-orange-600">
                    {stat.icon}
                  </div>
                </div>
              </div>
              {isLoading ? (
                <>
                  <Skeleton className="h-10 w-32 mx-auto mb-2" />
                  <Skeleton className="h-5 w-24 mx-auto" />
                </>
              ) : (
                <>
                  <h3 className="text-4xl lg:text-5xl font-bold mb-3 text-gray-900 tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-gray-500 font-medium">{stat.label}</p>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

