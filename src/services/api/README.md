# API Services Documentation

This directory contains all API service files organized by feature domain.

## Structure

```
src/services/api/
├── auth.api.ts          # Authentication endpoints
├── public.api.ts        # Public endpoints (stores, menus)
├── orders.api.ts        # Order management endpoints
├── store-owner.api.ts   # Store owner endpoints
├── admin.api.ts         # Admin endpoints
└── index.ts             # Re-exports all services
```

## Usage

### Direct API Calls

```typescript
import { authApi, publicApi, ordersApi } from '@/services/api';

// Register user
const response = await authApi.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'customer',
});

// Get stores
const stores = await publicApi.getStores({ page: 1, limit: 10 });

// Create order
const order = await ordersApi.createOrder({
  items: [{ menuItemId: '123', quantity: 2 }],
  finalPrice: 500,
  deliveryAddress: { street: '123 Main St', city: 'Jaipur', pincode: '302001' },
});
```

### With TanStack Query Hooks

```typescript
import { useAuthMe, useStores, useCreateOrder } from '@/hooks/api';

function MyComponent() {
  const { data: user } = useAuthMe();
  const { data: stores } = useStores({ limit: 10 });
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

## API Endpoints

### Auth API (`auth.api.ts`)

- `register(data)` - Register a new user
- `login(data)` - Login with email/password
- `logout()` - Logout current user
- `googleLogin(data)` - Login/Register via Google
- `getMe()` - Get current user profile
- `updateProfile(data)` - Update user details
- `changePassword(data)` - Change password
- `deleteAccount()` - Delete account

### Public API (`public.api.ts`)

- `getStores(params?)` - List available stores
- `getStoreMenu(storeId)` - Get menu for a store
- `searchStores(params?)` - Search stores

### Orders API (`orders.api.ts`)

- `createOrder(data)` - Create an order (customer)
- `getMyOrders()` - Get customer's order history
- `getOrderById(id)` - Get order details
- `updateOrderStatus(id, data)` - Update order status (admin/delivery)
- `getAllOrders(params?)` - List all orders (admin)

### Store Owner API (`store-owner.api.ts`)

- `getProfile()` - Get store owner profile
- `getMyStores()` - List owner's stores
- `createStore(data)` - Create a new store
- `getStoreById(id)` - Get store details
- `updateStore(id, data)` - Update store
- `deleteStore(id)` - Delete store
- `toggleStoreStatus(id)` - Toggle store open/closed
- `getStoreMenu(storeId)` - Get store menu items
- `createMenuItem(storeId, data)` - Add menu item
- `updateMenuItem(menuItemId, data)` - Update menu item
- `deleteMenuItem(menuItemId)` - Delete menu item
- `toggleMenuItemAvailability(menuItemId)` - Toggle availability
- `getOrders()` - List store owner orders
- `updateOrderStatus(orderId, data)` - Update order status

### Admin API (`admin.api.ts`)

- `getUsers(params?)` - List users with filters
- `suspendUser(id)` - Suspend a user (superAdmin)
- `reactivateUser(id)` - Reactivate a user (superAdmin)
- `resetUserPassword(id, data)` - Reset password (superAdmin)
- `getUserOrderHistory(id)` - Get user order history
- `getUserTransactions(id)` - Get user transactions
- `getPendingStores()` - List pending stores
- `approveStore(id)` - Approve store (superAdmin)
- `rejectStore(id, data?)` - Reject store (superAdmin)
- `suspendStore(id)` - Suspend store (superAdmin)
- `updateStoreMetadata(id, data)` - Update store metadata (superAdmin)
- `updateStoreCommission(id, data)` - Update commission (superAdmin)

## Error Handling

All API calls use the axios instance from `@/lib/axios` which includes:
- Automatic token injection
- Error handling with interceptors
- Automatic logout on 401 errors
- Network error handling

Use the `handleApiError` utility function for user-friendly error messages:

```typescript
import { handleApiError } from '@/lib/axios';

try {
  await authApi.login({ email, password });
} catch (error) {
  const message = handleApiError(error);
  console.error(message);
}
```

