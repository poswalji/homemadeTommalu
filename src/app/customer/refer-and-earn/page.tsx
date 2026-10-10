"use client";

import { useMyReferralStats } from '@/hooks/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Users, Wallet, Gift, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ReferAndEarnPage() {
    const { data: stats, isLoading } = useMyReferralStats();
    const [copied, setCopied] = useState(false);

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!stats) return <div className="p-8 text-center text-red-500">Failed to load referral stats.</div>;

    const referralLink = `${window.location.origin}/homemade?ref=${stats.referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        toast.success("Referral link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl space-y-6">
            <h1 className="text-2xl font-bold">Refer & Earn</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Gift className="w-5 h-5 text-orange-500" />
                            Invite Friends & Earn ₹{stats.campaign?.referrerReward || 100}
                        </CardTitle>
                        <CardDescription>
                            Share your link. When your friend subscribes, they get ₹{stats.campaign?.newSubscriberDiscount || 50} off their first subscription, and you get ₹{stats.campaign?.referrerReward || 100} in your wallet!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <div className="flex-1 bg-gray-100 p-3 rounded-md font-mono text-sm break-all">
                                {referralLink}
                            </div>
                            <Button onClick={handleCopy} className="flex-shrink-0">
                                {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                {copied ? "Copied!" : "Copy"}
                            </Button>
                        </div>
                        <div className="text-sm text-gray-500">
                            Your Referral Code: <span className="font-bold text-black">{stats.referralCode}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-green-600" />
                            Tommalu Tokens
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            {stats.walletBalance || 0} <span className="text-lg text-green-600/80">(₹{((stats.walletBalance || 0) / 10).toFixed(2)})</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Available to redeem on your next subscription renewal.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{stats.stats?.totalReferrals || 0}</div>
                        <div className="text-sm text-gray-500">Total Invites</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{stats.stats?.qualifiedReferrals || 0}</div>
                        <div className="text-sm text-gray-500">Successful Referrals</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Wallet className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold">₹{stats.stats?.totalEarned || 0}</div>
                        <div className="text-sm text-gray-500">Total Earned</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.referrals && stats.referrals.length > 0 ? (
                        <div className="space-y-4">
                            {stats.referrals.map((ref: any) => (
                                <div key={ref.id} className="flex justify-between items-center p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{ref.friendName}</p>
                                        <p className="text-xs text-gray-500">{new Date(ref.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            ref.status === 'rewarded' ? 'bg-green-100 text-green-800' :
                                            ref.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {ref.status.toUpperCase()}
                                        </span>
                                        <p className="text-sm font-medium mt-1">₹{ref.reward}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            You haven't referred anyone yet. Start sharing your link!
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
