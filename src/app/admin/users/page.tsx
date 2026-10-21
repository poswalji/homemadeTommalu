'use client';

import React, { useState, useMemo } from 'react';
import {
  useUsers,
  useSuspendUser,
  useReactivateUser,
  useResetUserPassword,
  useUserOrderHistory,
  useCreateUser,
  useUpdateUser,
} from '@/hooks/api';
import type { User, UserRole, UserStatus } from '@/services/api/admin.api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Phone,
  Mail,
  Shield,
  Bike,
  Utensils,
  Store,
  RefreshCw,
  Coins,
  MapPin,
  Calendar,
  KeyRound,
  Edit3,
  Eye,
  Check,
  Copy,
  X,
  AlertTriangle,
  MessageCircle,
  ExternalLink,
  ShoppingBag,
  Filter,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';

// Color gradients for user initials avatar
const AVATAR_GRADIENTS = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-sky-600',
];

function getAvatarGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

function getInitials(name: string) {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateString?: string) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

export default function AdminUsersPage() {
  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modals State
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);
  const [detailsTab, setDetailsTab] = useState<'profile' | 'orders'>('profile');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [confirmStatusUser, setConfirmStatusUser] = useState<User | null>(null);

  // Form State for Adding User
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer' as UserRole,
    tokens: 200,
  });
  const [addError, setAddError] = useState('');

  // Form State for Editing User
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    role: 'customer' as UserRole,
    status: 'active' as UserStatus,
    tokens: 0,
  });
  const [editError, setEditError] = useState('');

  // Form State for Password Reset
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // API Queries & Mutations
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useUsers({
    page,
    limit,
    role: roleFilter === 'all' ? undefined : roleFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const suspendMutation = useSuspendUser();
  const reactivateMutation = useReactivateUser();
  const resetPasswordMutation = useResetUserPassword();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  // Selected User's Order History Query
  const selectedUserId = selectedUserForDetails?.id || selectedUserForDetails?._id || '';
  const {
    data: userOrdersData,
    isLoading: isOrdersLoading,
  } = useUserOrderHistory(selectedUserId, !!selectedUserId && detailsTab === 'orders');

  const usersList: User[] = data?.data || [];
  const totalUsersCount = data?.total ?? usersList.length;

  // Filter clientside by search query across name, email, phone, id
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return usersList;
    const q = searchTerm.toLowerCase().trim();
    return usersList.filter((u) => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      const id = (u.id || u._id || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q) || id.includes(q);
    });
  }, [usersList, searchTerm]);

  // Aggregate KPI stats from users on current view / response
  const stats = useMemo(() => {
    const customers = usersList.filter((u) => u.role === 'customer').length;
    const delivery = usersList.filter((u) => u.role === 'delivery').length;
    const admins = usersList.filter((u) => u.role === 'admin').length;
    const storeOwners = usersList.filter((u) => u.role === 'storeOwner').length;
    const suspended = usersList.filter((u) => u.status === 'suspended').length;
    return { customers, delivery, admins, storeOwners, suspended };
  }, [usersList]);

  // Handle Copy text to clipboard
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate a random strong password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      phone: user.phone || '',
      role: user.role || 'customer',
      status: user.status || 'active',
      tokens: user.tokens || 0,
    });
    setEditError('');
  };

  // Save Edit User
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError('');
    try {
      const id = editingUser.id || editingUser._id || '';
      await updateUserMutation.mutateAsync({
        id,
        data: {
          name: editForm.name,
          phone: editForm.phone,
          role: editForm.role,
          status: editForm.status,
          tokens: Number(editForm.tokens),
        },
      });
      showToast(`User ${editForm.name} updated successfully!`);
      setEditingUser(null);
      refetch();
    } catch (err: any) {
      setEditError(err?.response?.data?.message || err?.message || 'Failed to update user');
    }
  };

  // Submit Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!addForm.name || !addForm.email || !addForm.password) {
      setAddError('Please fill in Name, Email, and Password.');
      return;
    }
    try {
      await createUserMutation.mutateAsync({
        name: addForm.name,
        email: addForm.email,
        phone: addForm.phone || undefined,
        password: addForm.password,
        role: addForm.role,
        tokens: Number(addForm.tokens) || 0,
      });
      showToast(`New user ${addForm.name} created successfully!`);
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'customer',
        tokens: 200,
      });
      refetch();
    } catch (err: any) {
      setAddError(err?.response?.data?.message || err?.message || 'Failed to create user');
    }
  };

  // Submit Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    if (!newPassword || newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }
    setResetError('');
    try {
      const id = resettingUser.id || resettingUser._id || '';
      await resetPasswordMutation.mutateAsync({
        id,
        data: { newPassword },
      });
      showToast(`Password updated for ${resettingUser.name}!`);
      setResettingUser(null);
      setNewPassword('');
    } catch (err: any) {
      setResetError(err?.response?.data?.message || err?.message || 'Failed to reset password');
    }
  };

  // Execute Suspend / Reactivate
  const handleConfirmStatusChange = async () => {
    if (!confirmStatusUser) return;
    const id = confirmStatusUser.id || confirmStatusUser._id || '';
    const isCurrentlyActive = confirmStatusUser.status === 'active';

    try {
      if (isCurrentlyActive) {
        await suspendMutation.mutateAsync(id);
        showToast(`Account for ${confirmStatusUser.name} suspended.`);
      } else {
        await reactivateMutation.mutateAsync(id);
        showToast(`Account for ${confirmStatusUser.name} reactivated!`);
      }
      setConfirmStatusUser(null);
      refetch();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update account status');
    }
  };

  // Format WhatsApp Link
  const getWhatsAppLink = (phone?: string, name?: string) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(
      `Hello ${name || 'Customer'}, this is Tommalu Customer Support. We are reaching out regarding your account. How may we assist you?`
    );
    return `https://wa.me/${fullPhone}?text=${text}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-stone-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              User Management
            </h1>
            <Badge variant="outline" className="text-xs font-bold text-stone-600 bg-white">
              {totalUsersCount} Total Users
            </Badge>
          </div>
          <p className="text-sm text-stone-500 font-medium mt-1">
            Real-time management for customers, delivery fleet riders, and staff accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-xl border-stone-200 hover:bg-stone-50 font-bold text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            + Add New User
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Users */}
        <Card className="border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Total Users
              </span>
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">
              {isLoading ? '...' : totalUsersCount}
            </div>
            <p className="text-xs text-stone-500 font-medium mt-1">
              Registered in Tommalu
            </p>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card className="border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Customers
              </span>
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Utensils className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">
              {isLoading ? '...' : stats.customers}
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              Food & Thali Diners
            </p>
          </CardContent>
        </Card>

        {/* Delivery Riders */}
        <Card className="border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Riders / Fleet
              </span>
              <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Bike className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">
              {isLoading ? '...' : stats.delivery}
            </div>
            <p className="text-xs text-amber-700 font-medium mt-1">
              Delivery personnel
            </p>
          </CardContent>
        </Card>

        {/* Admins & Stores */}
        <Card className="border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Admins & Staff
              </span>
              <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Shield className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-600">
              {isLoading ? '...' : stats.admins + stats.storeOwners}
            </div>
            <p className="text-xs text-purple-700 font-medium mt-1">
              {stats.admins} Admins, {stats.storeOwners} Stores
            </p>
          </CardContent>
        </Card>

        {/* Suspended Accounts */}
        <Card
          className={`border-stone-200/80 shadow-xs hover:shadow-md transition-shadow cursor-pointer ${
            stats.suspended > 0 ? 'bg-red-50/40 border-red-200' : ''
          }`}
          onClick={() => setStatusFilter(statusFilter === 'suspended' ? 'all' : 'suspended')}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Suspended
              </span>
              <span className="p-2 bg-red-100 text-red-600 rounded-xl">
                <UserX className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-600">
              {isLoading ? '...' : stats.suspended}
            </div>
            <p className="text-xs text-red-700 font-medium mt-1">
              {stats.suspended > 0 ? 'Click to filter suspended' : 'No suspended users'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-stone-200/80 shadow-sm overflow-hidden rounded-2xl">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/50 space-y-3.5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by name, email, phone, or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-10 rounded-xl bg-white border-stone-200 text-sm focus:ring-2 focus:ring-orange-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700">
                <Filter className="w-3.5 h-3.5 text-stone-400" />
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setPage(1);
                  }}
                  className="bg-transparent font-bold text-stone-900 border-none outline-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>
              </div>

              {(roleFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRoleFilter('all');
                    setStatusFilter('all');
                    setSearchTerm('');
                    setPage(1);
                  }}
                  className="text-xs text-orange-600 hover:text-orange-700 font-bold rounded-xl"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>

          {/* Role Segment Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Users', icon: Users, count: totalUsersCount },
              { id: 'customer', label: 'Customers', icon: Utensils, count: stats.customers },
              { id: 'delivery', label: 'Delivery Riders', icon: Bike, count: stats.delivery },
              { id: 'admin', label: 'Admins', icon: Shield, count: stats.admins },
              { id: 'storeOwner', label: 'Store Owners', icon: Store, count: stats.storeOwners },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = roleFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setRoleFilter(tab.id as any);
                    setPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-stone-400'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" className="text-orange-600 mb-3" />
            <p className="text-sm font-semibold text-stone-500">Loading users directory...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 px-4">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-base font-bold text-stone-900">Failed to load users</p>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {(error as any)?.message || 'An error occurred while fetching users from backend.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-4 rounded-xl"
            >
              Try Again
            </Button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-stone-400">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-stone-900">No users found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
              No users matched your search or filter criteria. Try adjusting your query or filters.
            </p>
            {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
                className="mt-4 rounded-xl text-xs font-bold"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-stone-50/80">
                <TableRow>
                  <TableHead className="w-[300px] text-xs font-bold text-stone-500 uppercase">
                    User Details
                  </TableHead>
                  <TableHead className="text-xs font-bold text-stone-500 uppercase">
                    Contact & WhatsApp
                  </TableHead>
                  <TableHead className="text-xs font-bold text-stone-500 uppercase">
                    Role & Tokens
                  </TableHead>
                  <TableHead className="text-xs font-bold text-stone-500 uppercase">
                    Account Status
                  </TableHead>
                  <TableHead className="text-xs font-bold text-stone-500 uppercase">
                    Registered On
                  </TableHead>
                  <TableHead className="text-right text-xs font-bold text-stone-500 uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const userId = user.id || user._id || '';
                  const isActive = user.status === 'active';
                  const initials = getInitials(user.name);
                  const gradient = getAvatarGradient(user.name);

                  return (
                    <TableRow key={userId} className="hover:bg-stone-50/70 transition-colors">
                      {/* User Avatar, Name & Email */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center text-white font-black text-xs shadow-xs shrink-0`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                onClick={() => {
                                  setSelectedUserForDetails(user);
                                  setDetailsTab('profile');
                                }}
                                className="font-bold text-stone-900 text-sm truncate hover:text-orange-600 cursor-pointer"
                              >
                                {user.name}
                              </span>
                              {user.emailVerified && (
                                <span title="Email Verified">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-stone-500 truncate">
                              <Mail className="w-3 h-3 shrink-0 text-stone-400" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-stone-400 font-mono mt-0.5">
                              <span>ID: {userId.slice(-6)}</span>
                              <button
                                onClick={() => handleCopy(userId, `id-${userId}`)}
                                title="Copy full ID"
                                className="hover:text-stone-700"
                              >
                                {copiedKey === `id-${userId}` ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact & WhatsApp */}
                      <TableCell>
                        {user.phone ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                              <Phone className="w-3 h-3 text-stone-400" />
                              <span>{user.phone}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/* Direct Call Button */}
                              <a
                                href={`tel:${user.phone}`}
                                className="inline-flex items-center gap-1 px-2 py-0.8 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold transition-colors"
                              >
                                📞 Call
                              </a>
                              {/* WhatsApp Direct Chat */}
                              <a
                                href={getWhatsAppLink(user.phone, user.name)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.8 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold transition-colors"
                              >
                                <MessageCircle className="w-2.5 h-2.5" />
                                WhatsApp
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400 italic">No phone added</span>
                        )}
                      </TableCell>

                      {/* Role & Tokens */}
                      <TableCell>
                        <div className="space-y-1">
                          {/* Role Badge */}
                          <div>
                            {user.role === 'admin' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                <Shield className="w-3 h-3" />
                                Admin
                              </span>
                            ) : user.role === 'delivery' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <Bike className="w-3 h-3" />
                                Delivery Rider
                              </span>
                            ) : user.role === 'storeOwner' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                <Store className="w-3 h-3" />
                                Store Owner
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <Utensils className="w-3 h-3" />
                                Customer
                              </span>
                            )}
                          </div>

                          {/* Coins / Tokens */}
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-600">
                            <Coins className="w-3 h-3 text-amber-500" />
                            <span>{user.tokens ?? 0} Coins</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                            <UserX className="w-3 h-3" />
                            Suspended
                          </span>
                        )}
                      </TableCell>

                      {/* Joined Date */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-stone-600">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </TableCell>

                      {/* Action Suite */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Profile & Orders */}
                          <Button
                            variant="outline"
                            size="sm"
                            title="View Full Profile & Orders"
                            onClick={() => {
                              setSelectedUserForDetails(user);
                              setDetailsTab('profile');
                            }}
                            className="h-8 w-8 p-0 rounded-xl hover:bg-stone-100 border-stone-200 text-stone-600"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          {/* Edit User */}
                          <Button
                            variant="outline"
                            size="sm"
                            title="Edit User Profile"
                            onClick={() => handleOpenEdit(user)}
                            className="h-8 w-8 p-0 rounded-xl hover:bg-stone-100 border-stone-200 text-stone-600"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>

                          {/* Reset Password */}
                          <Button
                            variant="outline"
                            size="sm"
                            title="Reset Password"
                            onClick={() => {
                              setResettingUser(user);
                              setNewPassword('');
                              setResetError('');
                            }}
                            className="h-8 w-8 p-0 rounded-xl hover:bg-amber-50 hover:text-amber-700 border-stone-200 text-stone-600"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </Button>

                          {/* Suspend / Reactivate Toggle */}
                          {user.role !== 'admin' && (
                            <Button
                              variant={isActive ? 'destructive' : 'outline'}
                              size="sm"
                              title={isActive ? 'Suspend User' : 'Reactivate User'}
                              onClick={() => setConfirmStatusUser(user)}
                              className={`h-8 px-2.5 rounded-xl text-xs font-bold ${
                                !isActive ? 'border-emerald-500 text-emerald-700 hover:bg-emerald-50' : ''
                              }`}
                            >
                              {isActive ? 'Suspend' : 'Reactivate'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Bar */}
        {data?.pagination && (data.pagination.totalPages || 1) > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-stone-200 gap-3 bg-stone-50/40">
            <p className="text-xs font-medium text-stone-500">
              Showing <span className="font-bold text-stone-800">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-bold text-stone-800">
                {Math.min(page * limit, totalUsersCount)}
              </span>{' '}
              of <span className="font-bold text-stone-800">{totalUsersCount}</span> users
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-xl h-8 text-xs font-bold"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>
              <span className="text-xs font-bold text-stone-700 px-2">
                Page {page} of {data.pagination.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.pagination?.totalPages || 1, p + 1))}
                disabled={page >= (data.pagination?.totalPages || 1)}
                className="rounded-xl h-8 text-xs font-bold"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* MODAL 1: USER DETAILS & ORDER HISTORY                                     */}
      {/* ========================================================================= */}
      {selectedUserForDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl bg-linear-to-br ${getAvatarGradient(
                    selectedUserForDetails.name
                  )} flex items-center justify-center text-white font-black text-sm shadow-md`}
                >
                  {getInitials(selectedUserForDetails.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-stone-900">
                      {selectedUserForDetails.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        selectedUserForDetails.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {selectedUserForDetails.status || 'active'}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-500 font-medium">
                    {selectedUserForDetails.email} • Joined {formatDate(selectedUserForDetails.createdAt)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserForDetails(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tab Controls */}
            <div className="flex items-center border-b border-stone-200 bg-white px-6">
              <button
                onClick={() => setDetailsTab('profile')}
                className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
                  detailsTab === 'profile'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Profile & Addresses
              </button>
              <button
                onClick={() => setDetailsTab('orders')}
                className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
                  detailsTab === 'orders'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Order History
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {detailsTab === 'profile' ? (
                <>
                  {/* Quick Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                      <span className="text-[10px] uppercase font-bold text-stone-400">
                        Loyalty Tokens
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span className="text-lg font-black text-stone-900">
                          {selectedUserForDetails.tokens ?? 0}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                      <span className="text-[10px] uppercase font-bold text-stone-400">
                        System Role
                      </span>
                      <div className="mt-1 font-black text-sm text-stone-900 capitalize">
                        {selectedUserForDetails.role}
                      </div>
                    </div>

                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400">
                        Referral Code
                      </span>
                      <div className="flex items-center justify-between mt-1 font-mono font-bold text-xs text-stone-800">
                        <span>{selectedUserForDetails.referralCode || 'NONE'}</span>
                        {selectedUserForDetails.referralCode && (
                          <button
                            onClick={() =>
                              handleCopy(
                                selectedUserForDetails.referralCode!,
                                'ref-code'
                              )
                            }
                            className="text-stone-400 hover:text-stone-700"
                          >
                            {copiedKey === 'ref-code' ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Shortcuts */}
                  <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-stone-900">Direct Contact:</span>
                      <p className="text-xs text-stone-600 mt-0.5">
                        {selectedUserForDetails.phone || 'No phone number linked'}
                      </p>
                    </div>
                    {selectedUserForDetails.phone && (
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${selectedUserForDetails.phone}`}
                          className="px-3 py-1.5 bg-white border border-stone-200 text-stone-800 rounded-xl text-xs font-bold hover:bg-stone-50 transition-colors"
                        >
                          📞 Call Now
                        </a>
                        <a
                          href={getWhatsAppLink(
                            selectedUserForDetails.phone,
                            selectedUserForDetails.name
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Saved Addresses */}
                  <div>
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      Saved Delivery Addresses (
                      {selectedUserForDetails.addresses?.length || 0})
                    </h4>
                    {(!selectedUserForDetails.addresses ||
                      selectedUserForDetails.addresses.length === 0) ? (
                      <div className="p-4 rounded-2xl border border-dashed border-stone-200 text-center text-xs text-stone-400 font-medium">
                        No saved delivery addresses found for this account.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedUserForDetails.addresses.map((addr, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-start justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-stone-900">
                                  {addr.label || `Address #${idx + 1}`}
                                </span>
                                {addr.isDefault && (
                                  <Badge className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0 border-emerald-200">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-stone-600 mt-1">
                                {addr.street}, {addr.city} {addr.pincode}
                              </p>
                              {addr.state && (
                                <p className="text-stone-400 text-[11px] mt-0.5">
                                  State: {addr.state}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Order History Tab */
                <div className="space-y-3">
                  {isOrdersLoading ? (
                    <div className="py-12 text-center">
                      <Spinner size="md" className="text-orange-600 mb-2" />
                      <p className="text-xs text-stone-500">Loading order history...</p>
                    </div>
                  ) : !userOrdersData?.data || userOrdersData.data.length === 0 ? (
                    <div className="py-12 text-center text-stone-400">
                      <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-semibold">No orders found for this user.</p>
                    </div>
                  ) : (
                    userOrdersData.data.map((order: any, idx: number) => {
                      const orderId = order.orderId || order._id || `ORD-${idx}`;
                      const amount =
                        order.finalPrice ??
                        order.totalPrice ??
                        order.totalAmount ??
                        order.price ??
                        0;
                      const food =
                        order.foodName ||
                        order.foodItem?.foodName ||
                        (order.items && order.items.length > 0
                          ? order.items.map((i: any) => i.name || i.foodName).join(', ')
                          : 'Food Order');

                      return (
                        <div
                          key={orderId}
                          className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900">{food}</span>
                              {order.mealSlot && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-stone-200 text-stone-700 capitalize">
                                  {order.mealSlot}
                                </span>
                              )}
                            </div>
                            <p className="text-stone-500 text-[11px] mt-0.5">
                              Order ID: <span className="font-mono">{orderId}</span> •{' '}
                              {formatDate(order.createdAt)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            <span className="font-black text-stone-900 text-sm">
                              ₹{amount}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold uppercase ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {order.status || 'placed'}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserForDetails(null)}
                className="rounded-xl font-bold text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW USER                                                     */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-orange-600" />
                <h3 className="font-black text-stone-900 text-base">Add New User</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              {addError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email Address *
                </label>
                <Input
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mobile Number (Optional)
                </label>
                <Input
                  placeholder="e.g. 9876543210"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
                      let pwd = '';
                      for (let i = 0; i < 8; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
                      setAddForm({ ...addForm, password: pwd });
                    }}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700"
                  >
                    Generate Random
                  </button>
                </div>
                <Input
                  required
                  type="text"
                  placeholder="Set initial account password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="rounded-xl font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    System Role
                  </label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
                  >
                    <option value="customer">Customer</option>
                    <option value="delivery">Delivery Rider</option>
                    <option value="storeOwner">Store Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Starting Coins
                  </label>
                  <Input
                    type="number"
                    value={addForm.tokens}
                    onChange={(e) => setAddForm({ ...addForm, tokens: Number(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createUserMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl"
                >
                  {createUserMutation.isPending ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT USER PROFILE & TOKENS                                       */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-orange-600" />
                <h3 className="font-black text-stone-900 text-base">Edit User Profile</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="w-7 h-7 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Name
                </label>
                <Input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email (Cannot be modified)
                </label>
                <Input
                  disabled
                  value={editingUser.email}
                  className="rounded-xl bg-stone-100 text-stone-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Phone Number
                </label>
                <Input
                  placeholder="e.g. 9876543210"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
                  >
                    <option value="customer">Customer</option>
                    <option value="delivery">Delivery Rider</option>
                    <option value="storeOwner">Store Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as UserStatus })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Loyalty Tokens / Coins Balance
                </label>
                <Input
                  type="number"
                  value={editForm.tokens}
                  onChange={(e) => setEditForm({ ...editForm, tokens: Number(e.target.value) })}
                  className="rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateUserMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl"
                >
                  {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: RESET PASSWORD                                                   */}
      {/* ========================================================================= */}
      {resettingUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-stone-900 text-base">Reset Password</h3>
              </div>
              <button
                onClick={() => setResettingUser(null)}
                className="w-7 h-7 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-5 space-y-4">
              <p className="text-xs text-stone-600 font-medium">
                Set a new password for{' '}
                <span className="font-bold text-stone-900">{resettingUser.name}</span> (
                {resettingUser.email}).
              </p>

              {resetError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700"
                  >
                    Generate Strong Password
                  </button>
                </div>
                <div className="relative">
                  <Input
                    required
                    type="text"
                    placeholder="Enter new password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-xl font-mono text-sm pr-10"
                  />
                  {newPassword && (
                    <button
                      type="button"
                      onClick={() => handleCopy(newPassword, 'new-pwd')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                      title="Copy Password"
                    >
                      {copiedKey === 'new-pwd' ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setResettingUser(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={resetPasswordMutation.isPending}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
                >
                  {resetPasswordMutation.isPending ? 'Updating...' : 'Set Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CONFIRM SUSPEND / REACTIVATE                                     */}
      {/* ========================================================================= */}
      {confirmStatusUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 p-6 text-center">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                confirmStatusUser.status === 'active'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {confirmStatusUser.status === 'active' ? (
                <UserX className="w-7 h-7" />
              ) : (
                <UserCheck className="w-7 h-7" />
              )}
            </div>

            <h3 className="text-base font-black text-stone-900">
              {confirmStatusUser.status === 'active'
                ? `Suspend ${confirmStatusUser.name}?`
                : `Reactivate ${confirmStatusUser.name}?`}
            </h3>

            <p className="text-xs text-stone-500 font-medium mt-2 leading-relaxed">
              {confirmStatusUser.status === 'active'
                ? 'Suspending this account will immediately block the user from logging in and placing new orders until reactivated.'
                : 'Reactivating this account will restore full access, allowing the user to log in and order food again.'}
            </p>

            <div className="mt-6 flex items-center justify-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmStatusUser(null)}
                className="rounded-xl font-bold text-xs"
              >
                Cancel
              </Button>

              <Button
                size="sm"
                variant={confirmStatusUser.status === 'active' ? 'destructive' : 'default'}
                disabled={suspendMutation.isPending || reactivateMutation.isPending}
                onClick={handleConfirmStatusChange}
                className={`rounded-xl font-bold text-xs ${
                  confirmStatusUser.status !== 'active'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : ''
                }`}
              >
                {suspendMutation.isPending || reactivateMutation.isPending
                  ? 'Processing...'
                  : confirmStatusUser.status === 'active'
                  ? 'Yes, Suspend Account'
                  : 'Yes, Reactivate Account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
