"use client";

import { useParams } from "next/navigation";
import { useStoreMenu } from "@/hooks/api/use-public";
import { ProductCard } from "@/components/products/product-card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { MENU_CATEGORIES } from "@/config/categories.config";

export default function StorePage() {
    const params = useParams();
    const storeId = params?.id as string;

    const { data: storeData, isLoading, isError } = useStoreMenu(storeId);

    const store = storeData?.store;
    const menu = storeData?.data || [];

    // Group menu items by category
    const groupedMenu = menu.reduce((acc: any, item: any) => {
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
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex justify-center items-center">
                    <Spinner size="lg" />
                </main>
                <Footer />
            </div>
        );
    }

    if (isError || !store) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">
                        Store not found
                    </h1>
                    <Link href="/">
                        <Button>Go Home</Button>
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const isOpen = store.isOpen !== false;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Link href={`/category/${encodeURIComponent(store.category)}`}>
                    <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to {store.category}
                    </Button>
                </Link>

                {/* Store Header */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
                    <div className="relative h-48 md:h-64 bg-gray-200">
                        {store.image ? (
                            <img
                                src={store.image}
                                alt={store.storeName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl">
                                🏪
                            </div>
                        )}
                        <div className="absolute top-4 right-4">
                            <Badge
                                variant={isOpen ? "default" : "destructive"}
                                className={`text-lg px-4 py-1 ${isOpen ? "bg-green-500 hover:bg-green-600" : ""
                                    }`}
                            >
                                {isOpen ? "Open" : "Closed"}
                            </Badge>
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    {store.storeName}
                                </h1>
                                <p className="text-gray-600 text-lg">{store.description}</p>
                            </div>
                            {store.rating && (
                                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl">
                                    <Star className="w-6 h-6 text-green-600 fill-green-600" />
                                    <span className="text-2xl font-bold text-green-700">
                                        {store.rating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-6 text-gray-600">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>{store.deliveryTime || "30-45 min"} delivery</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                <span>{store.address}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Sections */}
                <div className="space-y-12">
                    {sortedCategories.map((category) => (
                        <section key={category} id={category} className="scroll-mt-24">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                {category}
                                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    {groupedMenu[category].length} items
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {groupedMenu[category].map((item: any) => (
                                    <ProductCard
                                        key={item._id || item.id}
                                        product={{
                                            ...item,
                                            id: item._id || item.id,
                                            storeName: store.storeName,
                                        }}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {menu.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                        <div className="text-6xl mb-4">🍽️</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Menu not available
                        </h3>
                        <p className="text-gray-500">
                            This store hasn't added any items to their menu yet.
                        </p>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
