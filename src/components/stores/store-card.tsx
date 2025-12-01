"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin } from "lucide-react";

interface Store {
    _id: string;
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

    return (
        <Link href={`/store/${store._id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden group">
                <div className="relative h-48 bg-gray-100">
                    {store.image ? (
                        <img
                            src={store.image}
                            alt={store.storeName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-50">
                            🏪
                        </div>
                    )}
                    <div className="absolute top-4 right-4">
                        <Badge
                            variant={isOpen ? "default" : "destructive"}
                            className={isOpen ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                            {isOpen ? "Open" : "Closed"}
                        </Badge>
                    </div>
                </div>
                <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                            {store.storeName}
                        </h3>
                        {store.rating && (
                            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md">
                                <Star className="w-4 h-4 text-green-600 fill-green-600" />
                                <span className="font-bold text-sm text-green-700">
                                    {store.rating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-500 text-sm mb-4">{store.category}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{store.deliveryTime || "30-45 min"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{store.address || "Local"}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
