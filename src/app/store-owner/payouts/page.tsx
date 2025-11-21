'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMyPayouts } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CreditCard, Eye, Filter, Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function PayoutsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data: payoutsData, isLoading } = useMyPayouts({
    status: statusFilter || undefined,
    page: 1,
    limit: 50,
  });

  const payouts = payoutsData?.data || [];

  const getStatusBadge = (status: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variants: Record<string, any> = {
      pending: { color: 'text-yellow-600', bg: 'bg-yellow-100' },
      approved: { color: 'text-blue-600', bg: 'bg-blue-100' },
      processing: { color: 'text-purple-600', bg: 'bg-purple-100' },
      completed: { color: 'text-green-600', bg: 'bg-green-100' },
      failed: { color: 'text-red-600', bg: 'bg-red-100' },
      cancelled: { color: 'text-gray-600', bg: 'bg-gray-100' },
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge className={`${config.color} ${config.bg}`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalPending = payouts.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + (p.netPayoutAmount || 0), 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalCompleted = payouts.filter((p: any) => p.status === 'completed').reduce((sum: number, p: any) => sum + (p.netPayoutAmount || 0), 0);

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payouts</h1>
          <p className="text-gray-600 mt-2 text-sm">View your payout history and status</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Payouts</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    {payouts.length}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Amount</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    ₹{totalPending.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Completed Amount</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    ₹{totalCompleted.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setStatusFilter('')}
                className="w-full sm:w-auto"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payouts List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Payout History ({payouts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : payouts.length > 0 ? (
            <div className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {payouts.map((payout: any) => (
                <div
                  key={payout.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-semibold text-base sm:text-lg">
                              {payout.storeId?.storeName || 'Store'}
                            </h3>
                            {getStatusBadge(payout.status)}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 text-sm">
                            <div>
                              <span className="text-gray-500">Amount: </span>
                              <span className="font-semibold">₹{payout.netPayoutAmount?.toLocaleString('en-IN') || '0'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Commission: </span>
                              <span className="font-semibold">₹{payout.commissionDeducted?.toLocaleString('en-IN') || '0'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Orders: </span>
                              <span className="font-semibold">{payout.orderCount || 0}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span>
                              Period: {new Date(payout.periodStart).toLocaleDateString()} - {new Date(payout.periodEnd).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>{new Date(payout.createdAt).toLocaleDateString()}</span>
                            {payout.transferId && (
                              <>
                                <span>•</span>
                                <span className="font-mono">Transfer ID: {payout.transferId}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link href={`/store-owner/payouts/${payout.id || payout._id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No payouts found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

