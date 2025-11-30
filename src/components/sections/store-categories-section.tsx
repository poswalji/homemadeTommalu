"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    STORE_CATEGORY_MAPPING,
    STORE_CATEGORY_DETAILS,
} from "@/config/categories.config";

const TARGET_STORE_CATEGORIES = ["Restaurant", "Grocery Store", "Bakery"];

export function StoreCategoriesSection() {
    console.log("StoreCategoriesSection rendering");
    const router = useRouter();
    const [selectedStore, setSelectedStore] = useState<string | null>(null);

    const handleStoreClick = (storeName: string) => {
        setSelectedStore(storeName);
    };

    const handleCategoryClick = (categoryName: string) => {
        router.push(`/browse?category=${encodeURIComponent(categoryName)}`);
        setSelectedStore(null);
    };

    return (
        <section className="py-16 md:py-24 bg-red-500 relative overflow-hidden">
            <div className="container px-4 md:px-20 mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <Badge className="mb-6 text-sm px-6 py-2">Popular Stores</Badge>
                    <h2 className="text-4xl md:text-5xl p-2 font-bold mb-6 text-gray-900">
                        Explore by Store Type
                    </h2>
                    <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                        Find exactly what you need from our wide range of partner stores.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TARGET_STORE_CATEGORIES.map((storeName, index) => {
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
                                className="group cursor-pointer"
                                onClick={() => handleStoreClick(storeName)}
                            >
                                <Card className="h-full transition-all duration-300 bg-white hover:bg-white border-none shadow-md hover:shadow-xl transform hover:-translate-y-2 rounded-2xl overflow-hidden">
                                    <CardContent className="p-8 flex flex-col items-center text-center h-full">
                                        <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                            {details.emoji}
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3 text-gray-900">
                                            {storeName}
                                        </h3>
                                        <p className="text-gray-600 mb-6 flex-grow">
                                            {details.description}
                                        </p>
                                        <div className="flex items-center justify-center gap-2 text-[lab(66%_50.34_52.19)] font-semibold group-hover:gap-3 transition-all">
                                            <span>View Menu</span>
                                            <ArrowRight className="h-5 w-5" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <Dialog open={!!selectedStore} onOpenChange={() => setSelectedStore(null)}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            {selectedStore && (
                                <>
                                    <span className="text-3xl">
                                        {STORE_CATEGORY_DETAILS[selectedStore]?.emoji}
                                    </span>
                                    {selectedStore} Menu
                                </>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        {selectedStore &&
                            STORE_CATEGORY_MAPPING[selectedStore]?.map((category) => (
                                <div
                                    key={category}
                                    className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors border border-transparent hover:border-gray-200 flex items-center justify-between group"
                                    onClick={() => handleCategoryClick(category)}
                                >
                                    <span className="font-medium text-gray-700 group-hover:text-gray-900">
                                        {category}
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                </div>
                            ))}
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}
