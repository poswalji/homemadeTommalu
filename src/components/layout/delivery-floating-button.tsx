"use client";

import Link from "next/link";
import { Truck } from "lucide-react";
import { usePathname } from "next/navigation";

export function DeliveryFloatingButton() {
  const pathname = usePathname();

  // Hide the button if we are already in the delivery module
  if (pathname?.startsWith("/delivery")) {
    return null;
  }

  // Also hide on admin module
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 md:hidden">
      <Link
        href="/delivery/login"
        className="flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors border border-gray-700"
      >
        <Truck className="w-4 h-4" />
        <span className="text-xs font-semibold tracking-wide">Delivery</span>
      </Link>
    </div>
  );
}
