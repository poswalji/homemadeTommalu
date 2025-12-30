"use client";

import { useParams } from "next/navigation";
import { useStoreMenu } from "@/hooks/api/use-public";
import { ProductCard } from "@/components/products/product-card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Star, Clock, MapPin, Search, Store as StoreIcon } from "lucide-react";
import Link from "next/link";
import { MENU_CATEGORIES } from "@/config/categories.config";
import { useState } from "react";
import { motion } from "framer-motion";

export default function StorePage() {
    const params = useParams();
    const storeId = params?.id as string;
    const [searchQuery, setSearchQuery] = useState("");

    const { data: storeData, isLoading, isError } = useStoreMenu(storeId);

    const store = storeData?.store;
    const menu = storeData?.data || [];

    // Filter menu based on search query
    const filteredMenuItems = menu.filter((item: any) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group filtered items by category
    const groupedMenu = filteredMenuItems.reduce((acc: any, item: any) => {
        const category = item.category || "Other";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});

    // Sort categories based on MENU_CATEGORIES order
    const sortedCategories = Object.keys(groupedMenu).sort((a, b) => {
        const indexA = MENU_CATEGORIES.indexOf(a);
        const indexB = MENU_CATEGORIES.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <main className="flex-1 flex justify-center items-center">
                    <div className="flex flex-col items-center gap-4">
                        <Spinner size="lg" />
                        <p className="text-stone-500 animate-pulse">Loading menu...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (isError || !store) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-20 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <StoreIcon className="w-10 h-10 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Store not found</h1>
                        <p className="text-gray-500 mb-8">We couldn't find the store you're looking for. It might have been removed or is temporarily unavailable.</p>
                        <Link href="/">
                            <Button size="lg" className="w-full sm:w-auto">Return Home</Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const isOpen = store.isOpen !== false;

    return (
        <div className="min-h-screen flex flex-col bg-stone-50 selection:bg-orange-100 selection:text-orange-900">
            <Header />

            <main className="flex-1 pb-20">
                {/* Hero Header */}
                <div className="bg-white relative border-b border-stone-100">
                    <div className="h-48 md:h-64 relative overflow-hidden bg-stone-900">
                        {store.image ? (
                            <>
                                <img
                                    src={store.image}
                                    alt={store.storeName}
                                    className="w-full h-full object-cover opacity-60"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500">
                                <StoreIcon className="w-20 h-20 text-white/50" />
                            </div>
                        )}

                        <div className="absolute top-4 left-4 z-10">
                            <Link href={`/category/${encodeURIComponent(store.category)}`}>
                                <Button variant="secondary" size="sm" className="bg-white/90 backdrop-blur hover:bg-white text-stone-900 shadow-lg border-0">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 max-w-7xl -mt-12 relative z-10 mb-8">
                        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 uppercase tracking-wider text-xs font-bold px-2 py-0.5">
                                        {store.category}
                                    </Badge>
                                    <Badge
                                        className={`${isOpen ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-stone-500 text-white'} shadow-md border-0 uppercase tracking-wider text-xs font-bold px-2 py-0.5`}
                                    >
                                        {isOpen ? "Open Now" : "Closed"}
                                    </Badge>
                                </div>

                                <h1 className="text-3xl md:text-5xl font-extrabold text-stone-900 mb-3 tracking-tight leading-tight">
                                    {store.storeName}
                                </h1>

                                <p className="text-stone-500 text-lg leading-relaxed max-w-2xl mb-6">
                                    {store.description}
                                </p>

                                <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm font-medium text-stone-600">
                                    {store.rating && (
                                        <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="font-bold">{store.rating.toFixed(1)}</span>
                                            <span className="text-green-600/60 font-medium">({store.totalReviews || 0}+)</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100">
                                        <Clock className="w-4 h-4 text-orange-500" />
                                        <span>{store.deliveryTime || "30-45 min"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100">
                                        <MapPin className="w-4 h-4 text-orange-500" />
                                        <span className="truncate max-w-[200px]">{store.address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Search & Nav */}
                <div className="sticky top-[72px] z-30 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 py-4 shadow-sm">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="relative max-w-lg mx-auto md:mx-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <Input
                                placeholder="Search menu items..."
                                className="pl-10 bg-white border-stone-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl h-11 shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 max-w-7xl mt-8 space-y-12">
                    {filteredMenuItems.length === 0 ? (
                        <div className="text-center py-24">
                            <div className="bg-stone-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-10 h-10 text-stone-400 opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900">No items found</h3>
                            <p className="text-stone-500">Try searching for something else</p>
                            {searchQuery && (
                                <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2 text-orange-600">
                                    Clear search
                                </Button>
                            )}
                        </div>
                    ) : (
                        sortedCategories.map((category) => (
                            <section key={category} id={category} className="scroll-mt-32">
                                <div className="flex items-end gap-3 mb-6 border-b border-stone-200 pb-2">
                                    <h2 className="text-2xl font-bold text-stone-800">
                                        {category}
                                    </h2>
                                    <span className="text-sm font-medium text-stone-400 mb-1">
                                        {groupedMenu[category].length} items
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {groupedMenu[category].map((item: any) => (
                                        <motion.div
                                            key={item.id || item._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ProductCard
                                                product={{
                                                    ...item,
                                                    id: item.id || item._id,
                                                    storeName: store.storeName,
                                                }}
                                                isStoreOpen={isOpen}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        ))
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
