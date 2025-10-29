"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Utensils, ShoppingBasket, Apple, Beef, Wheat } from "lucide-react";

const categories = [
  {
    id: 1,
    title: "Fresh Groceries",
    description: "Get fresh fruits, vegetables, and daily essentials",
    icon: <ShoppingBasket className="h-12 w-12 text-green-600" />,
    color: "bg-green-50 hover:bg-green-100",
    image: "🥬",
    items: "1000+ Products",
  },
  {
    id: 2,
    title: "Restaurant Food",
    description: "Order from top restaurants in your area",
    icon: <Utensils className="h-12 w-12 text-orange-600" />,
    color: "bg-orange-50 hover:bg-orange-100",
    image: "🍕",
    items: "200+ Restaurants",
  },
  {
    id: 3,
    title: "Fruits & Veggies",
    description: "Fresh organic fruits and vegetables",
    icon: <Apple className="h-12 w-12 text-red-600" />,
    color: "bg-red-50 hover:bg-red-100",
    image: "🍎",
    items: "500+ Varieties",
  },
  {
    id: 4,
    title: "Meat & Seafood",
    description: "Premium quality meat and fresh seafood",
    icon: <Beef className="h-12 w-12 text-pink-600" />,
    color: "bg-pink-50 hover:bg-pink-100",
    image: "🥩",
    items: "Fresh Daily",
  },
];

export function CategoriesSection() {
  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[lab(66%_50.34_52.19)] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[lab(70%_50.34_52.19)] rounded-full blur-3xl"></div>
      </div>
      
      <div className="container px-4 md:px-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-6 text-sm px-6 py-2">Shop by Category</Badge>
          <h2 className="text-4xl md:text-5xl p-2 font-bold mb-6 text-gray-900">
            Browse Our Categories
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Everything you need, delivered fresh to your doorstep. Choose from thousands of quality products.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <Card className={`h-full transition-all duration-300 ${category.color} border-none shadow-md hover:shadow-xl transform hover:-translate-y-2`}>
                <CardContent className="p-6">
                  <div className="text-6xl mb-4 text-center">{category.image}</div>
                  <div className="flex justify-center mb-4">{category.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-center">{category.title}</h3>
                  <p className="text-gray-600 text-center mb-3">{category.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">{category.items}</span>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-4">
            Don&apos;t see what you&apos;re looking for?
          </p>
          <button className="text-[lab(66%_50.34_52.19)] font-semibold hover:text-[lab(60%_50.34_52.19)] transition-colors flex items-center gap-2 mx-auto">
            View All Categories
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

