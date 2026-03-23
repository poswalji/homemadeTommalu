"use client";

import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ShoppingBag, Package } from "lucide-react";

export default function CustomerDashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-8 max-w-4xl mx-auto mt-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0] || "Customer"}! 👋
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          What would you like to do today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/homemade" className="block group">
          <Card className="hover:border-[lab(66%_50.34_52.19)] hover:ring-1 hover:ring-[lab(66%_50.34_52.19)] transition-all cursor-pointer h-full border-2">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-20 w-20 bg-orange-100 group-hover:bg-orange-200 rounded-full flex items-center justify-center transition-colors">
                <ShoppingBag className="h-10 w-10 text-[lab(66%_50.34_52.19)]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Place an Order</h3>
                <p className="text-gray-500 mt-2">
                  Browse our selection of delicious homemade food and place a new order.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/customer/orders" className="block group">
          <Card className="hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all cursor-pointer h-full border-2">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-20 w-20 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                <Package className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Track Orders & History</h3>
                <p className="text-gray-500 mt-2">
                  View your past orders, check order status, and track current deliveries.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
