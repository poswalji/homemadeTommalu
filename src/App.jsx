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
import ComingSoonTimer from './components/comingSoon/ComingSoonTimer';

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
    console.log('🚀 App mounted - loading initial data');
    loadInitialData();
    loadUserData();
  }, []);

  // ✅ FIXED: Save cart to localStorage
  useEffect(() => {
    console.log('💾 Saving cart to localStorage:', cart);
    try {
      localStorage.setItem("tommaluCart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }, [cart]);

  // ✅ FIXED: Debug states
  useEffect(() => {
    console.log('🔍 State Debug:', {
      isSignedIn,
      user: user ? `${user.name || user.email} (${user._id})` : 'null',
      cartItems: cart.length,
      guestId: localStorage.getItem('guestId'),
      token: localStorage.getItem('token') ? 'exists' : 'null'
    });
  }, [isSignedIn, user, cart]);

  // ✅ FIXED: Load user data from localStorage and verify token
  

  // Load stores and categories from backend
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load all stores
      const storesResponse = await storeService.getStores();
      console.log('🔍 Stores Response:', storesResponse);

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

      console.log('📦 Stores Array:', storesArray);
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

      // Load categories from backend and map to frontend
      const backendCategories = [
        "North Indian", "South Indian", "Chinese", "Italian", "Mexican", "Desserts",
        "Dairy & Eggs", "Fruits", "Vegetables", "Bakery", "Beverages", "Snacks",
        "Kitchen Essentials", "Personal Care", "Household", "Frozen Foods"
      ];
      
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

  // Map backend categories to frontend categories
  const mapCategories = (backendCategories) => {
    const categoryMap = [
      { 
        id: 'all', 
        name: 'All', 
        icon: '🏠', 
        color: 'from-gray-400 to-gray-600',
        backendCategory: null
      },
      { 
        id: 'indian', 
        name: 'Indian', 
        icon: indianIcon, 
        color: 'from-orange-400 to-red-500',
        backendCategory: ['North Indian', 'South Indian']
      },
      { 
        id: 'pizza', 
        name: 'Pizza', 
        icon: pizzaIcon, 
        color: 'from-red-400 to-pink-500',
        backendCategory: 'Italian'
      },
      { 
        id: 'burgers', 
        name: 'Burgers', 
        icon: burgerIcon, 
        color: 'from-yellow-400 to-orange-500',
        backendCategory: 'Fast Food'
      },
      { 
        id: 'italian', 
        name: 'Italian', 
        icon: italianIcon, 
        color: 'from-green-400 to-blue-500',
        backendCategory: 'Italian'
      },
      { 
        id: 'fast-food', 
        name: 'Fast Food', 
        icon: fastFoodIcon, 
        color: 'from-purple-400 to-pink-500',
        backendCategory: 'Snacks'
      },
      { 
        id: 'fruits', 
        name: 'Fruits', 
        icon: fruitsIcon, 
        color: 'from-green-400 to-green-600',
        backendCategory: 'Fruits'
      },
      { 
        id: 'vegetables', 
        name: 'Vegetables', 
        icon: vegetablesIcon, 
        color: 'from-green-500 to-emerald-600',
        backendCategory: 'Vegetables'
      },
      { 
        id: 'dairy', 
        name: 'Dairy', 
        icon: dairyIcon, 
        color: 'from-blue-400 to-blue-600',
        backendCategory: 'Dairy & Eggs'
      },
      { 
        id: 'grains', 
        name: 'Grains', 
        icon: grainsIcon, 
        color: 'from-yellow-500 to-amber-600',
        backendCategory: 'Kitchen Essentials'
      },
      { 
        id: 'bakery', 
        name: 'Bakery', 
        icon: bakeryIcon, 
        color: 'from-amber-400 to-orange-500',
        backendCategory: 'Bakery'
      },
      { 
        id: 'meat', 
        name: 'Meat', 
        icon: meatIcon, 
        color: 'from-red-500 to-red-700',
        backendCategory: 'Non-Veg Food'
      }
    ];
    
    return categoryMap;
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

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

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

  // ✅ FIXED: Cart Handlers - Updated for backend integration
  

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

  const handleCartClick = () => {
    setCurrentPage('cart');
    setSearchQuery('');
    setSelectedRestaurant(null);
    setSelectedCategory(null);
  };

  // ✅ FIXED: Authentication Handlers
 // App.jsx - FIXED handleAddToCart

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

    const cartData = {
      menuItemId: item._id || item.id,
      quantity: 1
    };

    if (restaurant?._id || restaurant?.id) {
      cartData.storeId = restaurant._id || restaurant.id;
    }

    console.log('🛒 Sending to backend:', cartData);

    // ✅ ONLY backend call - frontend state will be updated via loadCartFromBackend
    const response = await cartService.addToCart(cartData);
    
    if (response.success) {
      // ✅ IMPORTANT: Don't update frontend state manually
      // Instead, reload cart from backend to get consistent state
      await loadCartFromBackend();
      
      // ✅ Success message
      const itemName = item.selectedWeight ? 
        `${item.name} (${item.selectedWeight.label})` : 
        item.name;
      
      setNotification({
        isVisible: true,
        message: `${itemName} added to cart!`,
        type: 'success'
      });

    } else {
      throw new Error(response.message || 'Failed to add to cart');
    }

  } catch (error) {
    console.error('❌ Cart error:', error);
    setNotification({
      isVisible: true,
      message: error.message || 'Error adding item to cart',
      type: 'error'
    });
  }
};
  // ✅ SIMPLIFIED: Load cart from backend
  // App.jsx - FIXED loadCartFromBackend

const loadCartFromBackend = async () => {
  try {
    console.log('🔄 Loading cart from backend...');
    
    const response = await cartService.getCart();
    console.log('📦 Backend cart response:', response);

    if (response.success && response.data) {
      if (response.data.items && response.data.items.length > 0) {
        // ✅ PROPERLY format cart items with ALL required fields
        const backendCart = response.data.items.map(item => {
          const menuItem = item.menuItemId || item;
          return {
            _id: menuItem._id || item.menuItemId,
            id: menuItem._id || item.menuItemId,
            name: menuItem.name || item.itemName,
            price: menuItem.price || item.price,
            image: menuItem.image ,
            quantity: item.quantity,
            restaurant: item.storeId || item.restaurantId || menuItem.storeId,
            // Add other necessary fields
            description: menuItem.description,
            category: menuItem.category
          };
        });
        
        setCart(backendCart);
        localStorage.setItem("tommaluCart", JSON.stringify(backendCart));
        console.log('✅ Cart loaded with images:', backendCart);
      } else {
        setCart([]);
        localStorage.setItem("tommaluCart", JSON.stringify([]));
        console.log('🛒 Cart is empty');
      }
    }
  } catch (error) {
    console.error('❌ Error loading cart:', error);
    // Fallback to localStorage
    const localCart = JSON.parse(localStorage.getItem('tommaluCart') || '[]');
    setCart(localCart);
  }
};
  // ✅ SIMPLIFIED: Authentication handler
  const handleSignIn = async (userData, token) => {
    console.log('🎯 SignIn with cookies');
    
    try {
      // Set auth data
      setAuthData(token, userData);
      setIsSignedIn(true);
      setUser(userData);
      
      // ✅ Auto-merge happens via cookies - no manual merge needed
      console.log('🔄 Auto-merging cart via cookies...');
      
      // Load updated cart
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

  // ✅ Remove guest ID related code from loadUserData
  const loadUserData = async () => {
    try {
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");

      console.log('🔄 Loading user data...');

      if (savedUser && savedToken) {
        try {
          const userData = await authService.getProfile();
          if (userData.status === 'success' || userData.success) {
            const user = userData.data?.user || userData.data;
            setUser(user);
            setIsSignedIn(true);
            console.log('✅ User authenticated');
          }
        } catch (error) {
          console.log('❌ Token verification failed:', error.message);
          // Fallback to localStorage
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setIsSignedIn(true);
          } catch (parseError) {
            clearAuthData();
          }
        }
      }
      
      // ✅ Always load cart (cookies handle anonymous vs logged-in)
      await loadCartFromBackend();

    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };
  const handleLogout = async () => {
    try {
      // ✅ Backend logout call karo
      await authService.logout();
    } catch (error) {
      console.log('⚠️ Backend logout failed:', error.message);
    } finally {
      // ✅ Frontend state clear karo
      setIsSignedIn(false);
      setUser(null);
      setCart([]);
      setCurrentPage('home');
      
      // ✅ Clear all auth data
      clearAuthData();
      
      // ✅ Create new guest ID for anonymous browsing
      const newGuestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('guestId', newGuestId);
      
      setNotification({
        message: 'Logged out successfully',
        isVisible: true
      });
      
      console.log('✅ Logout completed, new guest ID:', newGuestId);
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

  // ✅ Temporary: Check localStorage on page load
  useEffect(() => {
    console.log('📋 Initial localStorage state:', {
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
      guestId: localStorage.getItem('guestId'),
      cart: localStorage.getItem('tommaluCart')
    });
  }, []);

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
      
      <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} user={user} onUpdateProfile={handleUpdateProfile} />
      <Notification message={notification.message} isVisible={notification.isVisible} onClose={() => setNotification({ message: '', isVisible: false })} />
    </div>
  );
};

export default App;