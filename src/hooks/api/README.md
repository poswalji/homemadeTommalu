# TanStack Query Hooks Documentation

This directory contains all React Query hooks organized by feature domain.

## Structure

```
src/hooks/api/
├── use-auth.ts          # Authentication hooks
├── use-public.ts        # Public data hooks
├── use-orders.ts        # Order management hooks
├── use-store-owner.ts   # Store owner hooks
├── use-admin.ts         # Admin hooks
└── index.ts             # Re-exports all hooks
```

## Usage

### Authentication Hooks

```typescript
import { useAuthMe, useLogin, useLogout, useRegister } from '@/hooks/api';

function LoginPage() {
  const login = useLogin();
  const { data: user } = useAuthMe();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login.mutateAsync({ email, password });
      // Automatically redirects on success
    } catch (error) {
      console.error('Login failed');
    }
  };

  return <div>...</div>;
}
```

### Public Data Hooks

```typescript
import { useStores, useStoreMenu, useSearchStores } from '@/hooks/api';

function StoresPage() {
  const { data: stores, isLoading } = useStores({ page: 1, limit: 10 });
  const { data: menu } = useStoreMenu('store-id');

  if (isLoading) return <div>Loading...</div>;

  return <div>{stores?.data?.map(store => ...)}</div>;
}
```

### Order Hooks

```typescript
import { useMyOrders, useCreateOrder, useOrder } from '@/hooks/api';

function OrdersPage() {
  const { data: orders } = useMyOrders();
  const createOrder = useCreateOrder();

  const handleCreateOrder = async () => {
    await createOrder.mutateAsync({
      items: [{ menuItemId: '123', quantity: 2 }],
      finalPrice: 500,
      deliveryAddress: { street: '123 Main St', city: 'Jaipur', pincode: '302001' },
    });
  };

  return <div>...</div>;
}
```

### Store Owner Hooks

```typescript
import { useMyStores, useCreateStore, useStoreMenu } from '@/hooks/api';

function StoreManagementPage() {
  const { data: stores } = useMyStores();
  const createStore = useCreateStore();

  const handleCreateStore = async () => {
    await createStore.mutateAsync({
      storeName: 'My Store',
      address: '123 Main St',
      phone: '1234567890',
      licenseNumber: 'LIC123',
      licenseType: 'FSSAI',
      category: 'Restaurant',
    });
  };

  return <div>...</div>;
}
```

### Admin Hooks

```typescript
import { useUsers, usePendingStores, useApproveStore } from '@/hooks/api';

function AdminDashboard() {
  const { data: users } = useUsers({ limit: 50 });
  const { data: pendingStores } = usePendingStores();
  const approveStore = useApproveStore();

  const handleApprove = async (storeId: string) => {
    await approveStore.mutateAsync(storeId);
  };

  return <div>...</div>;
}
```

## Available Hooks

### Auth Hooks
- `useAuthMe()` - Get current user
- `useRegister()` - Register mutation
- `useLogin()` - Login mutation
- `useLogout()` - Logout mutation
- `useGoogleLogin()` - Google login mutation
- `useUpdateProfile()` - Update profile mutation
- `useChangePassword()` - Change password mutation
- `useDeleteAccount()` - Delete account mutation

### Public Hooks
- `useStores(params?)` - Get stores
- `useStoreMenu(storeId, enabled?)` - Get store menu
- `useSearchStores(params?, enabled?)` - Search stores

### Order Hooks
- `useCreateOrder()` - Create order mutation
- `useMyOrders()` - Get customer orders
- `useOrder(id, enabled?)` - Get order by ID
- `useUpdateOrderStatus()` - Update order status mutation
- `useAllOrders(params?)` - Get all orders (admin)

### Store Owner Hooks
- `useStoreOwnerProfile()` - Get store owner profile
- `useMyStores()` - Get owner's stores
- `useStore(id, enabled?)` - Get store by ID
- `useCreateStore()` - Create store mutation
- `useUpdateStore()` - Update store mutation
- `useDeleteStore()` - Delete store mutation
- `useToggleStoreStatus()` - Toggle store status mutation
- `useStoreMenu(storeId, enabled?)` - Get store menu
- `useCreateMenuItem()` - Create menu item mutation
- `useUpdateMenuItem()` - Update menu item mutation
- `useDeleteMenuItem()` - Delete menu item mutation
- `useToggleMenuItemAvailability()` - Toggle availability mutation
- `useStoreOwnerOrders()` - Get store owner orders
- `useStoreOwnerUpdateOrderStatus()` - Update order status mutation

### Admin Hooks
- `useUsers(params?)` - Get users
- `useSuspendUser()` - Suspend user mutation
- `useReactivateUser()` - Reactivate user mutation
- `useResetUserPassword()` - Reset password mutation
- `useUserOrderHistory(id, enabled?)` - Get user order history
- `useUserTransactions(id, enabled?)` - Get user transactions
- `usePendingStores()` - Get pending stores
- `useApproveStore()` - Approve store mutation
- `useRejectStore()` - Reject store mutation
- `useSuspendStore()` - Suspend store mutation
- `useUpdateStoreMetadata()` - Update store metadata mutation
- `useUpdateStoreCommission()` - Update commission mutation

## Query Keys

All hooks use structured query keys for efficient cache invalidation:

```typescript
// Auth
authKeys.me()

// Public
publicKeys.stores(params)
publicKeys.storeMenu(storeId)
publicKeys.search(params)

// Orders
ordersKeys.myOrders()
ordersKeys.detail(id)
ordersKeys.allOrders(params)

// Store Owner
storeOwnerKeys.stores()
storeOwnerKeys.store(id)
storeOwnerKeys.menu(storeId)

// Admin
adminKeys.users(params)
adminKeys.user(id)
adminKeys.pendingStores()
```

## Automatic Cache Management

All mutations automatically invalidate related queries:

- `useCreateOrder()` invalidates `ordersKeys.myOrders()`
- `useUpdateStore()` invalidates `storeOwnerKeys.store(id)` and `storeOwnerKeys.stores()`
- `useApproveStore()` invalidates `adminKeys.pendingStores()`

This ensures the UI stays in sync with the server state automatically.






