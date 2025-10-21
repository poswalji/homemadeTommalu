import { useState, useEffect, useCallback } from 'react'
import reactLogo from './assets/react.svg'
import { TommaluCheckout, DeliveryAddress, Payment, OrderConfirmation, CheckoutHeader, SAMPLE_ADDRESSES, SAMPLE_CART } from './pages/checkout/TommaluCheckout';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Grocery from './pages/grocery/Grocery';
import Food from './pages/food/Food';
import './index.css';
import Home from './pages/home/Home';
import './App.css'
import PrivacyPolicy from './links/PrivacyPolicy';
import TermsOfService from './links/TermsOfService';
import CookiePolicy from './links/CookiePolicy';
import CheckOut from './pages/checkout/CheckOut';
import Header from "./components/header/Header";
import MenuModal from "./components/menuModal/MenuModal";
import MobileMenu from "./components/mobileMenu/MobileMenu";
import MyOrdersPage from "./pages/myOrderPage/MyOrdersPage";
import Notification from "./components/notifications/Notification";
import OrderTrackingModal from "./components/orderTrakingModel/OrderTrackingModal";
import ProfileDropdown from "./components/profileDropdown/ProfileDropdown";
import ProfileModal from "./components/profileModel/ProfileModal";
import SignInModal from "./components/signInModel/SignInModal";
import { cookieService } from './utills/cookies';

// Service API
import { 
  authService, 
  storeService, 
  menuService, 
  orderService,
  cartService,

  setAuthData,
  clearAuthData,
  getCurrentUser
} from './services/api';

import Footer from "./pages/footer/Footer";
import RestaurantItemsPage from './pages/restaurantItems/RestaurantItemsPage';
import SearchResults from './components/searchResult/SearchResults';
import CartPage from './pages/cart/CartPage';
import ItemCard from './components/itemsCard/ItemCard';
import CategoryProducts from './pages/category/CategoryProducts';
import ScrollToTop from './components/scrollTop/ScrollTop';

// Asset files
import indianIcon from './assets/indian.jpg';
import pizzaIcon from './assets/pizza.jpg';
import burgerIcon from './assets/burger.jpg';
import italianIcon from './assets/italian.jpg';
import fastFoodIcon from './assets/fastfood.jpg';
import fruitsIcon from './assets/fruits.jpg';
import vegetablesIcon from './assets/vegetables.jpg';
import dairyIcon from './assets/Dairy.jpg';
import grainsIcon from './assets/grains.jpg';
import bakeryIcon from './assets/bakery.jpg';
import meatIcon from './assets/meat.jpg';


const App = () => {
  const navigate = useNavigate();
  
  // State Management
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [activeSection, setActiveSection] = useState('food');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [notification, setNotification] = useState({ message: '', isVisible: false });
  const [currentPage, setCurrentPage] = useState('home');
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [userLocations, setUserLocations] = useState({});
  
  // Backend Data States
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularRestaurants, setPopularRestaurants] = useState([]);
  const [popularGroceryStores, setPopularGroceryStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED: Load initial data from backend
  useEffect(() => {
   
    loadInitialData();
    loadUserData();
  }, []);

  // ✅ FIXED: Save cart to localStorage
  useEffect(() => {
  const savedCart = JSON.parse(localStorage.getItem("tommaluCart") || "[]");
  if (savedCart.length > 0) {
    setCart(savedCart);
   
  } else {
    // Optionally, load from backend if user is signed in
    if (isSignedIn) loadCartFromBackend();
  }
}, []);




  // Load stores and categories from backend
  // ✅ UPDATED: Load categories from stores' menuItems
const loadInitialData = async () => {
  try {
    setLoading(true);
    
    // Load all stores
    const storesResponse = await storeService.getStores();
    

    // ✅ FIXED: Flexible response handling
    let storesArray = [];
    
    if (Array.isArray(storesResponse)) {
      storesArray = storesResponse;
    } else if (storesResponse?.success && storesResponse.data?.stores) {
      storesArray = storesResponse.data.stores;
    } else if (storesResponse?.success && Array.isArray(storesResponse.data)) {
      storesArray = storesResponse.data;
    } else if (storesResponse?.stores) {
      storesArray = storesResponse.stores;
    } else if (Array.isArray(storesResponse?.data)) {
      storesArray = storesResponse.data;
    } else if (storesResponse?.status === 'success' && storesResponse.data?.stores) {
      storesArray = storesResponse.data.stores;
    } else {
      storesArray = [];
    }

    setStores(storesArray);
    
    // ✅ FIXED: Categorize stores with new array
    const restaurants = storesArray.filter(store => 
      store.category === 'Restaurant' || store.timesOrdered > 10
    );
    const groceryStores = storesArray.filter(store => 
      store.category === 'Grocery Store' || store.timesOrdered > 5
    );
    
    setPopularRestaurants(restaurants);
    setPopularGroceryStores(groceryStores);

    // ✅ UPDATED: Extract categories from stores' menuItems
    const backendCategories = await extractCategoriesFromMenuItems(storesArray);
   
    
    const mappedCategories = mapCategories(backendCategories);
    setCategories(mappedCategories);

  } catch (error) {
    console.error('Error loading initial data:', error);
    setNotification({
      message: 'Error loading data. Please try again.',
      isVisible: true
    });
  } finally {
    setLoading(false);
  }
};

// ✅ NEW: Extract categories from stores' menuItems
const extractCategoriesFromMenuItems = async (stores) => {
  const categoriesSet = new Set();
  
  // Har store ke menuItems fetch karna
  for (const store of stores) {
    try {
      // Store ka menu fetch karna
      const menuResponse = await menuService.getMenuByStoreId(store._id || store.id);
      
      if (menuResponse.success && menuResponse.data) {
        const menuItems = menuResponse.data.menuItems || menuResponse.data;
        
        // Har menu item ki category extract karna
        menuItems.forEach(item => {
          if (item.category && item.category.trim() !== '') {
            categoriesSet.add(item.category);
          }
        });
      }
    } catch (menuError) {
      console.warn(`⚠️ Menu fetch failed for store ${store.name}:`, menuError);
      // Continue with next store
    }
  }

  // Common categories ensure karna
  const commonCategories = [
    "Veg Food", "Non-Veg Food", "Snacks", "Drinks", 
    "Dairy", "Groceries", "Fruits", "Vegetables",
    "Sweets", "Fast Food", "Bakery", "Grains", "Meat"
  ];

  commonCategories.forEach(cat => categoriesSet.add(cat));
  
  const categoriesArray = Array.from(categoriesSet).filter(cat => cat);
  
  return categoriesArray;
};

// ✅ UPDATED: Map backend categories to frontend categories
const mapCategories = (backendCategories) => {
  // Frontend categories ka base structure - aapke menuItem categories ke according
  const categoryMap = [
    { 
      id: 'all', 
      name: 'All', 
      icon: '🏠', 
      color: 'from-gray-400 to-gray-600',
      backendCategory: null
    },
    { 
      id: 'veg-food', 
      name: 'Veg Food', 
      icon: indianIcon,
      color: 'from-green-400 to-green-600',
      backendCategory: 'Veg Food'
    },
    { 
      id: 'non-veg-food', 
      name: 'Non-Veg Food', 
      icon: meatIcon, 
      color: 'from-red-400 to-red-600',
      backendCategory: 'Non-Veg Food'
    },
    { 
      id: 'snacks', 
      name: 'Snacks', 
      icon: fastFoodIcon, 
      color: 'from-yellow-400 to-orange-500',
      backendCategory: 'Snacks'
    },
    { 
      id: 'drinks', 
      name: 'Drinks', 
      icon: '🥤', 
      color: 'from-blue-400 to-cyan-500',
      backendCategory: 'Drinks'
    },
    { 
      id: 'dairy', 
      name: 'Dairy', 
      icon: dairyIcon, 
      color: 'from-blue-300 to-blue-500',
      backendCategory: 'Dairy'
    },
    { 
      id: 'fruits', 
      name: 'Fruits', 
      icon: fruitsIcon, 
      color: 'from-green-400 to-emerald-500',
      backendCategory: 'Fruits'
    },
    { 
      id: 'vegetables', 
      name: 'Vegetables', 
      icon: vegetablesIcon, 
      color: 'from-green-500 to-teal-500',
      backendCategory: 'Vegetables'
    },
    { 
      id: 'sweets', 
      name: 'Sweets', 
      icon: '🍰', 
      color: 'from-pink-400 to-rose-500',
      backendCategory: 'Sweets'
    },
    { 
      id: 'fast-food', 
      name: 'Fast Food', 
      icon: burgerIcon, 
      color: 'from-orange-400 to-red-500',
      backendCategory: 'Fast Food'
    },
    { 
      id: 'bakery', 
      name: 'Bakery', 
      icon: bakeryIcon, 
      color: 'from-amber-400 to-orange-500',
      backendCategory: 'Bakery'
    },
    { 
      id: 'grains', 
      name: 'Grains', 
      icon: grainsIcon, 
      color: 'from-yellow-500 to-amber-500',
      backendCategory: 'Grains'
    },
    { 
      id: 'meat', 
      name: 'Meat', 
      icon: meatIcon, 
      color: 'from-red-500 to-pink-500',
      backendCategory: 'Meat'
    }
  ];

  // ✅ Dynamic categories jo menuItems se aayi hain
  const dynamicCategories = backendCategories
    .filter(backendCat => {
      // Pehle se defined categories ko exclude karna
      const isAlreadyMapped = categoryMap.some(frontendCat => 
        frontendCat.backendCategory === backendCat
      );
      return !isAlreadyMapped;
    })
    .map((backendCat, index) => ({
      id: `dynamic-${index}-${backendCat.toLowerCase().replace(/\s+/g, '-')}`,
      name: backendCat,
      icon: '🍽️', // Default icon
      color: getDynamicColor(index),
      backendCategory: backendCat
    }));

  console.log('🎯 All Mapped Categories:', [...categoryMap, ...dynamicCategories]);
  
  return [...categoryMap, ...dynamicCategories];
};

// ✅ NEW: Dynamic colors for new categories
const getDynamicColor = (index) => {
  const colors = [
    'from-purple-400 to-indigo-500',
    'from-teal-400 to-cyan-500',
    'from-rose-400 to-pink-500',
    'from-violet-400 to-purple-500',
    'from-amber-400 to-yellow-500',
    'from-emerald-400 to-green-500',
    'from-blue-400 to-indigo-500',
    'from-orange-400 to-red-500'
  ];
  return colors[index % colors.length];
};
  // Geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
            );
            const data = await res.json();

            const areaName = data.address?.neighbourhood ||
              data.address?.suburb ||
              data.address?.quarter ||
              data.address?.locality ||
              data.address?.hamlet ||
              data.address?.village ||
              data.address?.town ||
              data.address?.district ||
              "Unknown Area";

            const city = data.address?.city ||
              data.address?.state_district ||
              data.address?.state ||
              "Unknown City";

            const finalLocation = areaName === "Unknown Area" ? city : areaName;
            setSelectedLocation(finalLocation);

          } catch (error) {
            console.error("Geolocation error:", error);
          }
        },
        (error) => {
          if (error.code === 1) {
            return true;
          }
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

 
  // Navigation Handlers
  const handleNavigate = (page) => {
    setCurrentPage(page);
    if (page !== 'search') {
      setSearchQuery('');
    }
    setSelectedRestaurant(null);
    setSelectedCategory(null);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigate("/search");
    } else {
      navigate("/");
    }
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setCurrentPage('restaurant-items');
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCurrentPage('category-products');
    setSearchQuery('');
    setSelectedRestaurant(null);
  };
 const handleCartClick = () => {
    setCurrentPage('cart');
    setSearchQuery('');
    setSelectedRestaurant(null);
    setSelectedCategory(null);
  };
  // ✅ FIXED: Cart Handlers - Updated for backend integration
  

  // App.jsx - OPTIMIZED CART HANDLERS

const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

// ✅ UPDATED: Cart Handlers - Only frontend state management
const handleUpdateQuantity = (restaurantId, itemId, newQuantity) => {
  if (newQuantity <= 0) {
    handleRemoveItem(restaurantId, itemId);
    return;
  }

  setCart(prevCart => 
    prevCart.map(item => 
      (item._id === itemId || item.id === itemId) && 
      (item.restaurant?._id === restaurantId || item.restaurant?.id === restaurantId)
        ? { ...item, quantity: newQuantity }
        : item
    )
  );
};

const handleRemoveItem = (restaurantId, itemId) => {
  setCart(prevCart => 
    prevCart.filter(item => 
      !((item._id === itemId || item.id === itemId) && 
        (item.restaurant?._id === restaurantId || item.restaurant?.id === restaurantId))
    )
  );
};
// Save cart

// ✅ UPDATED: Add to Cart with immediate frontend feedback
const handleAddToCart = async (item, restaurant) => {
  try {
    // Check availability
    if (item.available === false || item.isAvailable === false) {
      setNotification({
        isVisible: true,
        message: 'This item is currently unavailable',
        type: 'error'
      });
      return;
    }

    console.log('🎯 ADD TO CART - User:', isSignedIn ? 'Logged In' : 'Guest');

    // ✅ IMMEDIATE frontend update for better UX
    const newCartItem = {
      _id: item._id || item.id,
      id: item._id || item.id,
      name: item.name,
      price: item.price,
      image: item.image || item.images?.[0],
      quantity: 1,
      restaurant: restaurant,
      description: item.description,
      category: item.category
    };

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(cartItem => 
      cartItem._id === newCartItem._id && 
      cartItem.restaurant?._id === restaurant?._id
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      setCart(prevCart => 
        prevCart.map((cartItem, index) => 
          index === existingItemIndex 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      // Add new item to cart
      setCart(prevCart => [...prevCart, newCartItem]);
    }

    // ✅ Backend sync (non-blocking)
    const cartData = {
      menuItemId: item._id || item.id,
      quantity: 1
    };

    if (restaurant?._id || restaurant?.id) {
      cartData.storeId = restaurant._id || restaurant.id;
    }

    console.log('🛒 Syncing with backend:', cartData);

    // Backend call - don't wait for response for immediate UX
    cartService.addToCart(cartData)
      .then(response => {
        if (response.success) {
          console.log('✅ Backend cart updated successfully');
          // Refresh cart from backend to ensure consistency
          loadCartFromBackend();
        }
      })
      .catch(error => {
        console.error('❌ Backend sync failed:', error);
        // Don't show error to user - frontend state is already updated
      });

    // ✅ Success message
    const itemName = item.selectedWeight ? 
      `${item.name} (${item.selectedWeight.label})` : 
      item.name;
    
    setNotification({
      isVisible: true,
      message: `${itemName} added to cart!`,
      type: 'success'
    });

  } catch (error) {
    console.error('❌ Cart error:', error);
    setNotification({
      isVisible: true,
      message: 'Error adding item to cart',
      type: 'error'
    });
  }
};

// ✅ UPDATED: Load cart from backend with better error handling
const loadCartFromBackend = async () => {
  try {
    console.log('🔄 Loading cart from backend...');
    
    const response = await cartService.getCart();
    

    if (response.success && response.data) {
      if (response.data.items && response.data.items.length > 0) {
        // ✅ IMPROVED: Better item mapping
        const backendCart = response.data.items.map(item => {
          const menuItem = item.menuItemId || item;
          return {
            _id: menuItem._id || item.menuItemId,
            id: menuItem._id || item.menuItemId,
            name: menuItem.name || item.itemName,
            price: menuItem.price || item.price,
            image: menuItem.image || menuItem.images?.[0] || item.image,
            quantity: item.quantity || 1,
            restaurant: item.storeId || item.restaurantId || menuItem.storeId,
            description: menuItem.description,
            category: menuItem.category
          };
        });
        
        setCart(backendCart);
        localStorage.setItem("tommaluCart", JSON.stringify(backendCart));
        
      } else {
        // Clear cart if backend returns empty
        setCart([]);
        localStorage.setItem("tommaluCart", JSON.stringify([]));
        console.log('🛒 Cart is empty');
      }
    }
  } catch (error) {
    console.error('❌ Error loading cart from backend:', error);
    // Fallback to localStorage
    try {
      const localCart = JSON.parse(localStorage.getItem('tommaluCart') || '[]');
      setCart(localCart);
      console.log('🔄 Using local storage cart:', localCart.length, 'items');
    } catch (parseError) {
      console.error('❌ Error parsing local cart:', parseError);
      setCart([]);
    }
  }
};

// ✅ NEW: Clear cart function
const handleClearCart = async () => {
  try {
    setCart([]);
    localStorage.setItem("tommaluCart", JSON.stringify([]));
    
    // Clear backend cart if user is signed in
    if (isSignedIn) {
      await cartService.clearCart();
    }
    
    setNotification({
      isVisible: true,
      message: 'Cart cleared successfully',
      type: 'success'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
};  // ✅ SIMPLIFIED: Authentication handler
  const handleSignIn = async (userData, token) => {
  console.log('🎯 SignIn with cookies');

  try {
    // ✅ Save token & user to cookies
    cookieService.set('token', token, { path: '/', expires: 7 }); // 7 days
    cookieService.set('user', JSON.stringify(userData), { path: '/', expires: 7 });

    // ✅ Update states
    setAuthData(token, userData);
    setIsSignedIn(true);
    setUser(userData);

    console.log('🔄 Auto-merging cart via cookies...');
    await loadCartFromBackend();

    setNotification({
      message: `Welcome ${userData.name || userData.email}!`,
      isVisible: true,
      type: 'success'
    });

  } catch (error) {
    console.error('❌ SignIn error:', error);
  }
};


 const loadUserData = async () => {
  const savedUser = cookieService.get('user');
  const savedToken = cookieService.get('token');

  if (savedUser && savedToken) {
    try {
      // Parse saved cookie
      const userFromCookie = JSON.parse(savedUser);
      setUser(userFromCookie);
      setIsSignedIn(true);

      // Optional: Refresh from backend
      const userData = await authService.getProfile();
      if (userData?.data?.user) {
        setUser(userData.data.user);
      }
    } catch (error) {
      console.error('Error loading user data from cookie or backend:', error);
    }
  }
};


 const handleLogout = async () => {
  try {
    await authService.logout();
  } catch (error) {
    console.log('⚠️ Backend logout failed:', error.message);
  } finally {
    setIsSignedIn(false);
    setUser(null);
    setCart([]);
    setCurrentPage('home');

    clearAuthData();
    cookieService.remove('user');
    cookieService.remove('token');

    const newGuestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('guestId', newGuestId);

    setNotification({
      message: 'Logged out successfully',
      isVisible: true
    });
  }
};

  const openSignInModal = () => {
    setIsSignInModalOpen(true);
  };

  const closeSignInModal = () => {
    setIsSignInModalOpen(false);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      const response = await authService.updateProfile(updatedData);
      // ✅ SUPPORT BOTH RESPONSE FORMATS
      if (response.status === 'success' || response.success) {
        const updatedUser = response.data?.user || response.data;
        setUser(prevUser => ({
          ...prevUser,
          ...updatedUser
        }));
        setNotification({
          message: 'Profile updated successfully!',
          isVisible: true
        });
      }
    } catch (error) {
      setNotification({
        message: 'Error updating profile',
        isVisible: true
      });
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // ✅ FIXED: Order Handlers
  const handleOrder = async (orderData) => {
    try {
      const response = await orderService.createOrderFromCart(orderData);
      // ✅ SUPPORT BOTH RESPONSE FORMATS
      if (response.status === 'success' || response.success) {
        setNotification({
          message: 'Order placed successfully!',
          isVisible: true
        });
        setCart([]); // Clear cart after successful order
        
        // Clear backend cart as well
        await cartService.clearCart();
        
        navigate('/orders');
      }
    } catch (error) {
      setNotification({
        message: error.message || 'Error placing order',
        isVisible: true
      });
    }
  };

  // Location data
  const deliveryLocation = [
    { name: "Achrol", time: "15-20 min", status: "active" },
    { name: "Talamod", time: "20-25 min", status: "active" },
    { name: "NIMS University", time: "10-15 min", status: "active" },
    { name: "Amity University", time: "12-18 min", status: "active" },
    { name: "Chandwaji", time: "25-30 min", status: "active" },
    { name: "Syari", time: "8-12 min", status: "active" },
    { name: "Udaipur", time: "8-12 min", status: "active" },
    { name: "Jaipur City Center", time: "Coming Soon", status: "coming" },
    { name: "Malviya Nagar", time: "Coming Soon", status: "coming" },
  ];

  useEffect(() => {
    if (!selectedLocation) return;

    const matchedLocation = deliveryLocation.find(
      (loc) => loc.name.toLowerCase() === selectedLocation.toLowerCase()
    );

    if (matchedLocation) {
      if (matchedLocation.status === "active") {
        setNotification({
          message: `🎉 Congratulations! We Are Available at your Area ${matchedLocation.name}`,
          isVisible: true,
        });
      } else {
        setNotification({
          message: `⏳ ${matchedLocation.name} is Coming Soon!`,
          isVisible: true,
        });
      }
    } else {
      setNotification({
        message: `❌ Sorry! We Are not Available at your Area ${selectedLocation}`,
        isVisible: true,
      });
    }
  }, [selectedLocation]);

  const [orders, setOrders] = useState([]);

 

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu */}
      <MobileMenu
        notification={notification}
        isOpen={isMobileMenuOpen}
        isSignedIn={isSignedIn}
        onSignIn={openSignInModal}
        onLogout={handleLogout}
        onClose={closeMobileMenu}
        onOpenProfile={openProfileModal}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        onNavigate={handleNavigate}
        user={user}
      />

      {/* Header */}
      <Header
        stores={stores}
        deliveryLocation={deliveryLocation}
        isSignedIn={isSignedIn}
        onSignIn={openSignInModal}
        onLogout={handleLogout}
        cartCount={cartCount}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={toggleMobileMenu}
        onCartClick={handleCartClick}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        user={user}
        onOpenProfile={openProfileModal}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
      />

      <ScrollToTop />
      
      <Routes>
        {/* Home with real data from backend */}
        <Route
          path="/"
          element={
            <Home
              onRestaurantClick={handleRestaurantClick}
              onCategoryClick={handleCategoryClick}
              onNavigate={handleNavigate}
              stores={stores}
              popularRestaurants={popularRestaurants}
              popularGroceryStores={popularGroceryStores}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              categories={categories}
            />
          }
        />

        {/* Other routes */}
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/cart" element={
          <CartPage 
            cart={cart} 
            onUpdateQuantity={handleUpdateQuantity} 
            onRemoveItem={handleRemoveItem} 
            user={user}
          />} 
        />
        <Route path='/grocery' element={
          <Grocery 
            stores={stores} 
            onAddToCart={handleAddToCart} 
          />} 
        />
        <Route path='/food' element={
          <Food 
             stores={stores} 
            onAddToCart={handleAddToCart} 
          />} 
        />
        <Route path="/items/:type/:slug" element={
          <RestaurantItemsPage 
            onAddToCart={handleAddToCart}
            stores={stores}
          />} 
        />
        <Route path="/category/:categoryName" element={
          <CategoryProducts  
          stores={stores}
            categories={categories} 
            onAddToCart={handleAddToCart} 
          />} 
        />
        <Route path="/search" element={
          <SearchResults 
          stores={stores}
            searchQuery={searchQuery} 
            onAddToCart={handleAddToCart} 
          />} 
        />
        <Route path='/checkout' element={
          <TommaluCheckout 
            cart={cart} 
            user={user} 
            onOrder={handleOrder} 
          />} 
        />
        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="*" element={<h1 className="mt-8 mb-22 text-center text-3xl">404 Page Not Found</h1>} />
      </Routes>

      <Footer />

      {/* Modals */}
      <OrderTrackingModal isOpen={isTrackingModalOpen} order={selectedOrder} onClose={() => setIsTrackingModalOpen(false)} />
      
      {/* ✅ UPDATED: SignInModal with proper handlers */}
      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={closeSignInModal} 
        onSignIn={handleSignIn}
      />
      
      <ProfileModal isOpen={isProfileModalOpen} user={user} onClose={closeProfileModal} updateProfile={handleUpdateProfile} />
      <Notification message={notification.message} isVisible={notification.isVisible} onClose={() => setNotification({ message: '', isVisible: false })} />
    </div>
  );
};

export default App;