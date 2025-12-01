"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCategories } from "@/hooks/api/use-public";
import { STORE_CATEGORY_DETAILS } from "@/config/categories.config";
import { Spinner } from "@/components/ui/spinner";

export function StoreCategoriesSection() {
    const router = useRouter();
    const { data: categoriesData, isLoading } = useCategories();
    const categories = categoriesData?.data || [];

    const handleCategoryClick = (categoryName: string) => {
        router.push(`/category/${encodeURIComponent(categoryName)}`);
    };

    if (isLoading) {
        return (
            <section className="py-16 md:py-24 bg-red-500 relative overflow-hidden flex justify-center items-center h-[400px]">
                <Spinner className="text-white" size="lg" />
            </section>
        );
    }

    if (!categories.length) return null;

    return (
        <section className="py-16 md:py-24 bg-red-500 relative overflow-hidden">
            <div className="container px-4 md:px-20 mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <Badge className="mb-6 text-sm px-6 py-2">Popular Stores</Badge>
                    <h2 className="text-4xl md:text-5xl p-2 font-bold mb-6 text-gray-900">
                        Explore by Store Type
                    </h2>
                    <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                        Find exactly what you need from our wide range of partner stores.
                    </p>
                </motion.div>

                <div className="relative">
                    <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        {categories.map((category: any, index: number) => {
                            const storeName = category.name;
                            const details = STORE_CATEGORY_DETAILS[storeName] || {
                                emoji: "🏪",
                                description: "Store",
                            };
                            return (
                                <motion.div
                                    key={storeName}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="flex-shrink-0 w-[280px] md:w-[320px] snap-center cursor-pointer group"
                                    onClick={() => handleCategoryClick(storeName)}
                                >
                                    <Card className="h-full transition-all duration-300 bg-white hover:bg-white border-none shadow-md hover:shadow-xl transform hover:-translate-y-2 rounded-2xl overflow-hidden">
                                        <CardContent className="p-8 flex flex-col items-center text-center h-full">
                                            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                                {details.emoji}
                                            </div>
                                            <h3 className="text-2xl font-bold mb-3 text-gray-900">
                                                {storeName}
                                            </h3>
                                            <p className="text-gray-600 mb-6 flex-grow">
                                                {details.description}
                                            </p>
                                            <div className="flex items-center justify-center gap-2 text-[lab(66%_50.34_52.19)] font-semibold group-hover:gap-3 transition-all">
                                                <span>View Stores</span>
                                                <ArrowRight className="h-5 w-5" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
