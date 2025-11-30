"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useCategories } from "@/hooks/api";
import { useRouter } from "next/navigation";

export function CategoriesSection() {
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data || [];
  const router = useRouter();
  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[lab(66%_50.34_52.19)] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[lab(70%_50.34_52.19)] rounded-full blur-3xl"></div>
      </div>

      <div className="container px-4 md:px-20 mx-auto relative z-10">
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

        <div className="flex overflow-x-auto pb-6 gap-4 snap-x md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 scrollbar-hide">
          {categories.map((category: any, index: number) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer min-w-[200px] md:min-w-0 snap-center"
              onClick={() => router.push(`/browse?category=${encodeURIComponent(category.name)}`)}
            >
              <Card className={`h-full transition-all duration-300 bg-gray-50 hover:bg-gray-100 border-none shadow-md hover:shadow-xl transform hover:-translate-y-2 rounded-2xl`}>
                <CardContent className="p-6">
                  <div className="text-6xl mb-4 text-center">{category.emoji || '🛒'}</div>
                  <h3 className="text-xl font-bold mb-2 text-center">{category.name}</h3>
                  {category.description && (
                    <p className="text-gray-600 text-center mb-3">{category.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">Explore</span>
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
          <button className="text-[lab(66%_50.34_52.19)] font-semibold hover:text-[lab(60%_50.34_52.19)] transition-colors flex items-center gap-2 mx-auto" onClick={() => router.push('/browse')}>
            View All Categories
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

