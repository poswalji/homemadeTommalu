'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEarningsStatement, useMyPayouts, useRequestEarlyPayout, useDownloadStatement } from '@/hooks/api';
import { useMyStores } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  DollarSign, TrendingUp, Download, Calendar, CreditCard,
  Plus, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function EarningsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    storeId: '',
    notes: '',
  });

  const { data: storesData } = useMyStores();
  const { data: earningsData, isLoading: earningsLoading } = useEarningsStatement({
    storeId: selectedStore || undefined,
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined,
    limit: 100,
  });
  const { data: payoutsData, isLoading: payoutsLoading } = useMyPayouts();
  const requestMutation = useRequestEarlyPayout();
  const downloadMutation = useDownloadStatement();

  const stores = storesData?.data || [];
  const earnings = earningsData?.data || [];
  const summary = earningsData?.summary;
  const payouts = payoutsData?.data || [];

  const handleRequestEarlyPayout = async () => {
    try {
      await requestMutation.mutateAsync(requestForm);
      toast.success('Early payout request submitted');
      setRequestDialogOpen(false);
      setRequestForm({ storeId: '', notes: '' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error((error as any)?.response?.data?.message || 'Failed to request early payout');
    }
  };

  const handleDownload = async () => {
    try {
      await downloadMutation.mutateAsync({
        storeId: selectedStore || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      });
      toast.success('Statement ready for download');
      // TODO: Implement PDF download
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error((error as any)?.response?.data?.message || 'Failed to download statement');
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Earnings & Statements</h1>
          <p className="text-gray-600 mt-2 text-sm">View your earnings and download statements</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={downloadMutation.isPending}>
            <Download className="w-4 h-4 mr-2" />
            {downloadMutation.isPending ? 'Downloading...' : 'Download Statement'}
          </Button>
          <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Request Early Payout
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Request Early Payout</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="storeIdPayout">Select Store</Label>
                  <select
                    id="storeIdPayout"
                    value={requestForm.storeId}
                    onChange={(e) => setRequestForm({ ...requestForm, storeId: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select store</option>
                    {stores.map((store: any) => (
                      <option key={store.id} value={store.id}>
                        {store.storeName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="notesPayout">Notes (Optional)</Label>
                  <Textarea
                    id="notesPayout"
                    value={requestForm.notes}
                    onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                    placeholder="Reason for early payout request..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRequestEarlyPayout}
                    disabled={requestMutation.isPending || !requestForm.storeId}
                  >
                    {requestMutation.isPending ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="store">Store</Label>
              <select
                id="store"
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Stores</option>
                {stores.map((store: any) => (
                  <option key={store.id} value={store.id}>
                    {store.storeName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="startDateEarnings">Start Date</Label>
              <Input
                id="startDateEarnings"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDateEarnings">End Date</Label>
              <Input
                id="endDateEarnings"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDateRange({ startDate: '', endDate: '' });
                  setSelectedStore('');
                }}
                className="w-full"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                {earningsLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    ₹{(summary?.totalRevenue || 0).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Commission</p>
                {earningsLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    ₹{(summary?.totalCommission || 0).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-red-100 text-red-600">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Net Payout</p>
                {earningsLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    ₹{(summary?.totalPayout || 0).toLocaleString('en-IN')}
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
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                {earningsLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : (
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
                    {summary?.orderCount || 0}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Earnings Statement</CardTitle>
        </CardHeader>
        <CardContent>
          {earningsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : earnings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Order ID</TableHead>
                    <TableHead className="text-xs sm:text-sm">Date</TableHead>
                    <TableHead className="text-xs sm:text-sm">Customer</TableHead>
                    <TableHead className="text-xs sm:text-sm">Store</TableHead>
                    <TableHead className="text-xs sm:text-sm text-right">Amount</TableHead>
                    <TableHead className="text-xs sm:text-sm text-right">Commission</TableHead>
                    <TableHead className="text-xs sm:text-sm text-right">Payout</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {earnings.slice(0, 50).map((payment: any, index: number) => (
                    <TableRow key={payment.orderId || index}>
                      <TableCell className="text-xs sm:text-sm font-mono">
                        #{payment.orderId?.slice(-8) || 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {new Date(payment.orderDate || payment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{payment.customerName || 'N/A'}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{payment.storeName || 'N/A'}</TableCell>
                      <TableCell className="text-xs sm:text-sm text-right font-semibold">
                        ₹{payment.amount?.toLocaleString('en-IN') || '0'}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-right text-red-600">
                        ₹{payment.commission?.toLocaleString('en-IN') || '0'}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-right text-green-600 font-semibold">
                        ₹{payment.payout?.toLocaleString('en-IN') || '0'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.payoutStatus === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {payment.payoutStatus || payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No earnings data found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payouts Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Payouts Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {payoutsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : payouts.length > 0 ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {payouts.slice(0, 5).map((payout: any) => (
                <div
                  key={payout.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base sm:text-lg">
                          {payout.storeId?.storeName || 'Store'}
                        </h3>
                        <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                          {payout.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Amount: </span>
                          <span className="font-semibold">₹{payout.netPayoutAmount?.toLocaleString('en-IN') || '0'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Orders: </span>
                          <span className="font-semibold">{payout.orderCount || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Period: </span>
                          <span className="font-semibold text-xs">
                            {new Date(payout.periodStart).toLocaleDateString()} - {new Date(payout.periodEnd).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Date: </span>
                          <span className="font-semibold text-xs">
                            {new Date(payout.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No payouts yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

