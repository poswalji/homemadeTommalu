"use client";

import { useAdminCampaign, useUpdateCampaign, useAdminConversions } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Settings, Users, Gift, Loader2 } from 'lucide-react';

export default function AdminReferralsPage() {
    const { data: campaign, isLoading: loadingCampaign } = useAdminCampaign();
    const { data: conversions, isLoading: loadingConversions } = useAdminConversions();
    const updateCampaign = useUpdateCampaign();

    const [form, setForm] = useState({
        isActive: true,
        referrerReward: 100,
        newSubscriberDiscount: 50,
        minSubscriptionDuration: 30
    });

    useEffect(() => {
        if (campaign) {
            setForm({
                isActive: campaign.isActive,
                referrerReward: campaign.referrerReward,
                newSubscriberDiscount: campaign.newSubscriberDiscount,
                minSubscriptionDuration: campaign.minSubscriptionDuration || 30
            });
        }
    }, [campaign]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateCampaign.mutate(form, {
            onSuccess: () => toast.success('Campaign updated successfully'),
            onError: () => toast.error('Failed to update campaign')
        });
    };

    if (loadingCampaign || loadingConversions) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" /></div>;

    return (
        <div className="container mx-auto py-8 space-y-8 max-w-6xl">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Referrals & Rewards</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Configuration */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-500" />
                            Campaign Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Campaign Active</Label>
                                <Switch 
                                    checked={form.isActive} 
                                    onCheckedChange={(c) => setForm({...form, isActive: c})} 
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Referrer Reward (₹)</Label>
                                <Input 
                                    type="number" 
                                    value={form.referrerReward} 
                                    onChange={(e) => setForm({...form, referrerReward: Number(e.target.value)})} 
                                />
                                <p className="text-xs text-gray-500">Amount credited to referrer's wallet.</p>
                            </div>

                            <div className="space-y-2">
                                <Label>New Subscriber Discount (₹)</Label>
                                <Input 
                                    type="number" 
                                    value={form.newSubscriberDiscount} 
                                    onChange={(e) => setForm({...form, newSubscriberDiscount: Number(e.target.value)})} 
                                />
                                <p className="text-xs text-gray-500">Immediate discount for new subscriber.</p>
                            </div>

                            <Button type="submit" disabled={updateCampaign.isPending} className="w-full">
                                {updateCampaign.isPending ? "Saving..." : "Save Config"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Conversions Table */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-500" />
                            Recent Conversions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {conversions?.data && conversions.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="px-4 py-3 rounded-tl">Referrer</th>
                                            <th className="px-4 py-3">Subscriber</th>
                                            <th className="px-4 py-3">Code Used</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 rounded-tr">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {conversions.data.map((conv: any) => (
                                            <tr key={conv._id}>
                                                <td className="px-4 py-3 font-medium">{conv.referrerId?.name}</td>
                                                <td className="px-4 py-3">{conv.referredUserId?.name}</td>
                                                <td className="px-4 py-3 text-orange-600 font-mono">{conv.referralCodeUsed}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        conv.status === 'rewarded' ? 'bg-green-100 text-green-800' : 
                                                        conv.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {conv.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">
                                                    {new Date(conv.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No referral conversions yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
