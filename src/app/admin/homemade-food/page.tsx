'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyMenuEditor } from '@/components/admin/homemade/DailyMenuEditor';
import { ChefHat } from 'lucide-react';

export default function HomemadeFoodAdminPage() {
    return (
        <div className="space-y-6 container mx-auto p-4 sm:p-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <ChefHat className="w-8 h-8 text-orange-600" />
                        Homemade Food Admin
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your daily homemade food menu.</p>
                </div>
            </div>

            {/* Daily Menu Editor directly rendered */}
            <DailyMenuEditor />
        </div>
    );
}
