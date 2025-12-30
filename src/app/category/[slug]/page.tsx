"use client";

import { useParams } from "next/navigation";
import { useStores } from "@/hooks/api/use-public";
import { StoreCategory } from "@/services/api/public.api";
import { StoreCard } from "@/components/stores/store-card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { STORE_CATEGORY_DETAILS } from "@/config/categories.config";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState } from "react";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function CategoryPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const categoryName = decodeURIComponent(slug);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: storesData, isLoading, isError } = useStores({
        category: categoryName as StoreCategory,
    });

    const stores = storesData?.data || [];

    // Simple client-side search
    const filteredStores = stores.filter((store: any) =>
        store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const details = STORE_CATEGORY_DETAILS[categoryName] || {
        emoji: "🏪",
        description: `Explore our ${categoryName} options`
    };

    return (
        <div className="min-h-screen flex flex-col bg-stone-50 selection:bg-orange-100 selection:text-orange-900">
            <Header />

            <main className="flex-1 pb-20">
                {/* Hero Section */}
                <div className="bg-white border-b border-stone-100 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-orange-50/50" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50" />

                    <div className="container mx-auto px-4 max-w-7xl pt-24 pb-12 relative z-10">
                        <Link href="/">
                            <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 hover:bg-transparent text-stone-500 hover:text-orange-600 transition-all">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shadow-lg shadow-orange-100 flex items-center justify-center text-5xl md:text-6xl border border-stone-100">
                                    {details.emoji}
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight">
                                        {categoryName}
                                    </h1>
                                    <p className="text-stone-500 text-lg mt-2 max-w-lg leading-relaxed">
                                        {details.description || `Discover the best ${categoryName} near you.`}
                                    </p>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                <Input
                                    className="pl-10 h-12 bg-white border-stone-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                                    placeholder={`Search ${categoryName}...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 max-w-7xl mt-8">
                    {/* Loading State */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="space-y-4">
                                    <Skeleton className="h-52 w-full rounded-2xl" />
                                    <div className="space-y-2 px-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900">Oops! Something went wrong</h3>
                            <p className="text-stone-500 mt-2">Failed to load {categoryName} stores.</p>
                            <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
                                Try Again
                            </Button>
                        </div>
                    ) : filteredStores.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-stone-100 shadow-sm mx-auto max-w-2xl">
                            <div className="text-6xl mb-6 opacity-80">🏪</div>
                            <h3 className="text-2xl font-bold text-stone-900 mb-2">
                                No stores found
                            </h3>
                            <p className="text-stone-500">
                                {searchQuery
                                    ? `We couldn't find any stores matching "${searchQuery}"`
                                    : `We're working on adding more ${categoryName} partners in your area.`}
                            </p>
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
                        >
                            {filteredStores.map((store: any) => (
                                <motion.div key={store.id || store._id} variants={itemVariants}>
                                    <StoreCard store={store} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
