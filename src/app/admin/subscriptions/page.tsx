'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionManager } from '@/components/admin/homemade/SubscriptionManager';
import { SubscriberRequests } from '@/components/admin/homemade/SubscriberRequests';
import { ActiveSubscriptions } from '@/components/admin/homemade/ActiveSubscriptions';
import { CreditCard } from 'lucide-react';

export default function SubscriptionsAdminPage() {
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
            </div>

            {/* Subscriptions Tab content copied from homemade-food */}
            <div className="space-y-6">
                <Tabs defaultValue="requests" className="w-full">
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
                        <ActiveSubscriptions />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
