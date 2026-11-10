'use client';

import { DailyMenuEditor } from '@/components/admin/homemade/DailyMenuEditor';

export default function HomemadeFoodAdminPage() {
    return (
        <div className="min-h-screen bg-stone-50/50 py-4 sm:py-6 px-3 sm:px-6">
            <DailyMenuEditor />
        </div>
    );
}
