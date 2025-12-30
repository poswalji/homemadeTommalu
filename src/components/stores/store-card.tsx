"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin, ChevronRight } from "lucide-react";

interface Store {
    id: string;
    _id?: string;
    storeName: string;
    category: string;
    address: string;
    rating?: number;
    deliveryTime?: string;
    isOpen?: boolean;
    image?: string;
}

interface StoreCardProps {
    store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
    const isOpen = store.isOpen !== false;
    const storeId = store.id || store._id;

    return (
        <Link href={`/store/${storeId}`} className="block h-full">
            <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border-transparent hover:border-orange-100 ring-1 ring-gray-100 hover:ring-orange-200 bg-white">
                <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-100">
                    {store.image ? (
                        <img
                            src={store.image}
                            alt={store.storeName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl bg-orange-50/50">
                            🏪
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />

                    <div className="absolute top-3 right-3 z-10">
                        <Badge
                            variant={isOpen ? "default" : "destructive"}
                            className={`${isOpen
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                                : "bg-stone-500 hover:bg-stone-600 text-white"} 
                                backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wide border-0`}
                        >
                            {isOpen ? "Open Now" : "Closed"}
                        </Badge>
                    </div>

                    {store.rating && (
                        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                            <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                            <span className="font-bold text-sm text-gray-800">
                                {store.rating.toFixed(1)}
                            </span>
                        </div>
                    )}
                </div>

                <CardContent className="p-5">
                    <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                            {store.storeName}
                        </h3>
                    </div>

                    <p className="text-gray-500 text-sm mb-4 line-clamp-1 font-medium">{store.category}</p>

                    <div className="flex flex-col gap-2 pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-orange-400" />
                            <span className="font-medium">{store.deliveryTime || "30-45 min"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="line-clamp-1 text-xs">{store.address || "Local Store"}</span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center text-orange-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                        View Menu <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
