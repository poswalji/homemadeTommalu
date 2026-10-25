# 🍲 Homemade Food Admin Section - Complete File Map & Documentation

Ye document Tommalu ke **Homemade Food Section (Admin)** ki sabhi frontend, backend, components aur models ka complete roadmap hai:

---

## 🖥️ 1. Frontend Files (Admin)

### 📌 Main Page Route:
- **URL Route:** `/admin/homemade-food`
- **File:** [`src/app/admin/homemade-food/page.tsx`](file:///c:/Users/Malu%20ram%20gurjar/Downloads/homemade%20Tommalu/tommalu_react/src/app/admin/homemade-food/page.tsx)
  - Ye admin homemade food ka main entry point page hai jo `DailyMenuEditor` ko render karta hai.

### 🧩 Components (`src/components/admin/homemade/`):
1. **[`DailyMenuEditor.tsx`](file:///c:/Users/Malu%20ram%20gurjar/Downloads/homemade%20Tommalu/tommalu_react/src/components/admin/homemade/DailyMenuEditor.tsx)** (Main Editor Component)
   - Date selector (aaj ya aane wale dino ka menu)
   - Lunch / Dinner Sabji aur items configuration
   - Three Thalis Setup:
     - **Regular Thali (₹99)**
     - **Desi Special Thali (₹119)**
     - **Paneer Special Thali (₹199)**
   - Sunday special items, delivery charges aur service on/off switch.
2. **[`AiThaliImageModal.tsx`](file:///c:/Users/Malu%20ram%20gurjar/Downloads/homemade%20Tommalu/tommalu_react/src/components/admin/homemade/AiThaliImageModal.tsx)** (Photo Studio & Uploader)
   - 1-Click AI Thali Photo Generation (menu items match karke photorealistic image lagata hai)
   - Curated Studio Presets Gallery
   - Custom Photo Upload from Phone/PC
   - Direct Web Image URL support
3. **[`SubscriptionManager.tsx`](file:///c:/Users/Malu%20ram%20gurjar/Downloads/homemade%20Tommalu/tommalu_react/src/components/admin/homemade/SubscriptionManager.tsx)**
   - Tiffin & monthly meal subscription plans management.
4. **[`ActiveSubscriptions.tsx`](file:///c:/Users/Malu%20ram%20gurjar/Downloads/homemade%20Tommalu/tommalu_react/src/components/admin/homemade/ActiveSubscriptions.tsx)**
   - Active customer subscriptions aur status.
5. **[`SubscriberRequests.tsx`](file:///c:/Users/Malu%20ram%20gurjar/Downloads/homemade%20Tommalu/tommalu_react/src/components/admin/homemade/SubscriberRequests.tsx)**
   - Nayi subscription requests approve/reject karne ke liye.

### 🌐 Frontend API Services:
- **[`homemade-food.api.ts`](file:///c:/Users/Malu%20ram%20gurjar/Downloads/homemade%20Tommalu/tommalu_react/src/services/api/homemade-food.api.ts)**: Admin API calls (`getAdminDailyMenu`, `updateDailyMenu`, `getOrders`).
- **[`homemadeService.ts`](file:///c:/Users/Malu%20ram%20gurjar/Downloads/homemade%20Tommalu/tommalu_react/src/services/homemadeService.ts)**: Customer side homemade food API integration.

---

## ⚙️ 2. Backend Files

### 🗄️ Database Model (Schema):
- **[`dailyMenu.js`](file:///c:/Users/Malu%20ram%20gurjar/Downloads/homemade%20Tommalu/newFullBackendTommalu/models/dailyMenu.js)**
  - Database schema jisme `date`, `dayOfWeek`, `isServiceOff`, `weekdayMenu`, `thalis` (Regular, Desi, Paneer), aur `sundayMenu` save hota hai.

### 🕹️ Controller:
- **[`dailyMenuController.js`](file:///c:/Users/Malu%20ram%20gurjar/Downloads/homemade%20Tommalu/newFullBackendTommalu/controllers/dailyMenuController.js)**
  - `getTodayMenu`: Customer ke liye current menu & slots fetch karta hai.
  - `updateMenu`: Admin se naya menu, sabji, prices aur photos update karta hai.
  - `placeOrder`: Homemade thali order place karta hai aur Admin/Customer ko FCM push notification bhejta hai.

### 🛣️ Routes:
- **[`homemadeFoodRoutes.js`](file:///c:/Users/Malu%20ram%20gurjar/Downloads/homemade%20Tommalu/newFullBackendTommalu/routes/homemadeFoodRoutes.js)**
  - `/api/homemade/today` (Public menu)
  - `/api/homemade/order` (Order place)
  - `/api/homemade/update` (Admin menu update)
  - `/api/admin/homemade-food/*`
