"use client";

import { useParams } from "next/navigation";
import { useStores } from "@/hooks/api/use-public";
import { StoreCategory } from "@/services/api/public.api";
import { StoreCard } from "@/components/stores/store-card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Spinner } from "@/components/ui/spinner";
import { STORE_CATEGORY_DETAILS } from "@/config/categories.config";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CategoryPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const categoryName = decodeURIComponent(slug);

    const { data: storesData, isLoading, isError } = useStores({
        category: categoryName as StoreCategory,
    });

    const stores = storesData?.data || [];
    const details = STORE_CATEGORY_DETAILS[categoryName] || {
        emoji: "🏪",
        description: `Explore our ${categoryName} stores`,
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link href="/">
                        <Button variant="ghost" className="mb-4 pl-0 hover:pl-2 transition-all">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>

                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-4xl md:text-5xl">{details.emoji}</span>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                {categoryName}
                            </h1>
                            <p className="text-gray-600 text-lg mt-1">
                                {details.description}
                            </p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Spinner size="lg" />
                    </div>
                ) : isError ? (
                    <div className="text-center py-20">
                        <p className="text-red-500 text-lg">
                            Error loading stores. Please try again later.
                        </p>
                    </div>
                ) : stores.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                        <div className="text-6xl mb-4">🏪</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            No stores found
                        </h3>
                        <p className="text-gray-500">
                            We couldn't find any {categoryName} stores in your area right now.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {stores.map((store: any) => (
                            <StoreCard key={store._id} store={store} />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
