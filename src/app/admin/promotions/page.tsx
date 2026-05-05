"use client";

import { PromotionsManager } from "@/components/admin/promotions/PromotionsManager";

export default function AdminPromotionsPage() {
    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <PromotionsManager />
        </div>
    );
}
