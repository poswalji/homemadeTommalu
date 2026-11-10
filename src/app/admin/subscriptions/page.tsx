'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionManager } from '@/components/admin/homemade/SubscriptionManager';
import { SubscriberRequests } from '@/components/admin/homemade/SubscriberRequests';
import { ActiveSubscriptions } from '@/components/admin/homemade/ActiveSubscriptions';
import { AddManualSubscriptionModal } from '@/components/admin/subscription/AddManualSubscriptionModal';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus, MessageCircle } from 'lucide-react';

export default function SubscriptionsAdminPage() {
    const [activeTab, setActiveTab] = useState('requests');
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="space-y-6 container mx-auto p-4 sm:p-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-orange-600" />
                        Subscriptions Management
                    </h1>
                    <p className="text-gray-600 mt-1">Manage subscription models, requests, and active subscribers.</p>
                </div>
                <Button
                    onClick={() => setIsManualModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm flex items-center gap-2 self-start sm:self-auto"
                >
                    <Plus className="h-4 w-4" />
                    <MessageCircle className="h-4 w-4" />
                    + Add WhatsApp / Offline Subscriber
                </Button>
            </div>

            {/* Subscriptions Tab content */}
            <div className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList>
                            <TabsTrigger value="models">Plan Models</TabsTrigger>
                            <TabsTrigger value="requests" className="relative">
                                Requests
                            </TabsTrigger>
                            <TabsTrigger value="active_subs">
                                Active Subscribers
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="models" className="mt-0">
                        <SubscriptionManager />
                    </TabsContent>

                    <TabsContent value="requests" className="mt-0">
                        <SubscriberRequests />
                    </TabsContent>

                    <TabsContent value="active_subs" className="mt-0">
                        <ActiveSubscriptions key={refreshKey} />
                    </TabsContent>
                </Tabs>
            </div>

            <AddManualSubscriptionModal
                isOpen={isManualModalOpen}
                onClose={() => setIsManualModalOpen(false)}
                onSuccess={() => {
                    setActiveTab('active_subs');
                    setRefreshKey((prev) => prev + 1);
                }}
            />
        </div>
    );
}

