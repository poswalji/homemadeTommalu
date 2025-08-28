  import { useState,useEffect,useCallback } from 'react'
  import reactLogo from './assets/react.svg'
  import {TommaluCheckout, DeliveryAddress, Payment, OrderConfirmation, CheckoutHeader, SAMPLE_ADDRESSES, SAMPLE_CART} from './pages/checkout/TommaluCheckout';
 import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Grocery from './pages/grocery/Grocery';
 import Food from './pages/food/Food';
  import './index.css';
import Home from './pages/home/Home';
  import './App.css'
// import CartModal from "./components/cartModal/CartModal";
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

import Footer from "./pages/footer/Footer";
import RestaurantItemsPage from './pages/restaurantItems/RestaurantItemsPage';
import SearchResults from './components/searchResult/SearchResults';
import CartPage from './pages/cart/CartPage';
import ItemCard from './components/itemsCard/ItemCard';
import CategoryProducts from './pages/category/CategoryProducts';
  const App = () => {
  
    
              // Load saved user locations from localStorage on app start
              useEffect(() => {
                  const savedLocations = localStorage.getItem('tommaluUserLocations');
                  if (savedLocations) {
                      try {
                          setUserLocations(JSON.parse(savedLocations));
                      } catch (error) {
                          console.log('Error loading saved locations');
                      }
                  }
              }, []);

              const [isSignedIn, setIsSignedIn] = useState(false);
              const [user, setUser] = useState(null);
              
              const [cartItems, setCartItems] = useState([]);
              const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
              const [selectedRestaurant, setSelectedRestaurant] = useState(null);
             (false);
             
              const [activeSection, setActiveSection] = useState('food'); // 'food' or 'grocery'
              const [searchQuery, setSearchQuery] = useState('');
              const [selectedCategory, setSelectedCategory] = useState('');
              const [notification, setNotification] = useState({ message: '', isVisible: false });
              const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'orders'
              const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
              const [selectedOrder, setSelectedOrder] = useState(null);
              const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
              const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
              const [selectedLocation, setSelectedLocation] = useState('');
              const [userLocations, setUserLocations] = useState({});
              
               const [currentStep, setCurrentStep] = useState(1);
          
            const [selectedAddress, setSelectedAddress] = useState(SAMPLE_ADDRESSES[0]);
            const [deliveryTime, setDeliveryTime] = useState('standard');
            const [instructions, setInstructions] = useState('');
            const [paymentMethod, setPaymentMethod] = useState('');
            const [orderDetails, setOrderDetails] = useState(null);

            const handleNext = () => {
                if (currentStep < 3) {
                    setCurrentStep(currentStep + 1);
                    if (currentStep === 2) {
                        // Place order
                        const subtotal = cart.reduce((sum, item) => {
                            const itemPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
                            return sum + (itemPrice * item.quantity);
                        }, 0);
                        const deliveryFee = deliveryTime === 'express' ? 25 : 40;
                        const total = subtotal + deliveryFee + Math.round(subtotal * 0.05);
                        
                        setOrderDetails({
                            total: Math.round(total),
                            paymentMethod,
                            deliveryTime,
                            address: selectedAddress,
                            items: cart,
                            instructions
                        });
                    }
                }
            };


              // Store locations per user
    const [isSignInOpen, setIsSignInOpen] = useState(false);
              // Save user locations to localStorage whenever it changes
              useEffect(() => {
                const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsSignedIn(true)}
                  if (Object.keys(userLocations).length > 0) {
                      localStorage.setItem('tommaluUserLocations', JSON.stringify(userLocations));
                  }
              }, [userLocations]);

                // Load cart from localStorage on component mount
            const [cart, setCart] = useState(() => {
  try {
    const savedCart = localStorage.getItem("tommaluCart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Error parsing cart from localStorage:", error);
    return [];
  }
});

useEffect(() => {
  try {
    localStorage.setItem("tommaluCart", JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart:", error);
  }
}, [cart]);     

            const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
                    setCurrentPage('search');
                } else if (currentPage === 'search') {
                    setCurrentPage('home');
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

            const handleAddToCart = (item, restaurant) => {
                setCart(prevCart => {
                    // For items with weight options, check both item ID and selected weight
                    const existingItemIndex = prevCart.findIndex(
                        cartItem => cartItem.id === item.id && 
                        cartItem.restaurant.id === restaurant.id &&
                        (item.selectedWeight ? 
                            cartItem.selectedWeight?.label === item.selectedWeight.label : 
                            !cartItem.selectedWeight)
                    );

                    if (existingItemIndex >= 0) {
                        // Item with same weight already exists, increase quantity
                        const updatedCart = [...prevCart];
                        updatedCart[existingItemIndex].quantity += 1;
                        return updatedCart;
                    } else {
                        // New item or different weight, add to cart
                        return [...prevCart, {
                            ...item,
                            restaurant: restaurant,
                            quantity: 1
                        }];
                    }
                });
                
                const itemName = item.selectedWeight ? 
                    `${item.name} (${item.selectedWeight.label})` : 
                    item.name;
                setNotification(`${itemName} added to cart!`);
            };

            const handleUpdateQuantity = (restaurantId, itemId, newQuantity, selectedWeight = null) => {
                if (newQuantity <= 0) {
                    handleRemoveItem(restaurantId, itemId, selectedWeight);
                    return;
                }

                setCart(prevCart => 
                    prevCart.map(item => 
                        item.id === itemId && 
                        item.restaurant.id === restaurantId &&
                        (selectedWeight ? 
                            item.selectedWeight?.label === selectedWeight.label : 
                            !item.selectedWeight)
                            ? { ...item, quantity: newQuantity }
                            : item
                    )
                );
            };

            const handleRemoveItem = (restaurantId, itemId, selectedWeight = null) => {
                setCart(prevCart => 
                    prevCart.filter(item => 
                        !(item.id === itemId && 
                          item.restaurant.id === restaurantId &&
                          (selectedWeight ? 
                            item.selectedWeight?.label === selectedWeight.label : 
                            !item.selectedWeight))
                    )
                );
            };

            const handleCartClick = () => {
                setCurrentPage('cart');
                setSearchQuery('');
                setSelectedRestaurant(null);
                setSelectedCategory(null);
            };


  // Verify token on page load
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch("https://backend-tommalu.onrender.com/api/auth/verify", {
          method: "GET",
          credentials: "include", // include HttpOnly cookie
        });
        const data = await res.json();
        if (data.success) setUser(data.user);
      } catch (err) {
        console.log("Not logged in");
      }
    };
    verifyUser();
  }, []);

    

        // Delivery fee calculation based on distance
        const calculateDeliveryFee = (distance) => {
            if (distance <= 2) return 15;
            if (distance <= 3) return 25;
            if (distance <= 5) return 35;
            return 45;
        };

        // Available coupons
        const AVAILABLE_COUPONS = [
            { code: 'SAVE50', discount: 50, minOrder: 149, type: 'fixed', description: 'Save ₹50 on orders above ₹149' },
            { code: 'FIRST20', discount: 20, minOrder: 99, type: 'percentage', description: '20% off on orders above ₹99 (max ₹100)' },
            { code: 'WELCOME30', discount: 30, minOrder: 199, type: 'fixed', description: 'Save ₹30 on orders above ₹199' }
        ];

        // Sample Data
        const RESTAURANTS_DATA = [
            {
                id: 1,
                slug: 'spice-garden',
                name: "Spice Garden",
                type: "restaurant",
                cuisine: "Indian",
                rating: 4.8,
                deliveryTime: "25-30 min",
                distance: 2.5,
                image: "🍛",
                items: [
                    { id: 101, name: "Butter Chicken", price: 280, category: "Indian", description: "Creamy tomato-based chicken curry", image: "🍛", popular: true },
                    { id: 102, name: "Paneer Tikka", price: 220, category: "Indian", description: "Grilled cottage cheese with spices", image: "🧀", popular: true },
                    { id: 103, name: "Chicken Biryani", price: 320, category: "Indian", description: "Fragrant basmati rice with chicken", image: "🍚", popular: true },
                    { id: 104, name: "Garlic Naan", price: 45, category: "Indian", description: "Fresh baked Indian bread", image: "🫓" },
                    { id: 105, name: "Dal Makhani", price: 180, category: "Indian", description: "Rich black lentil curry", image: "🍲" }
                ]
            },
            {
                id: 2,
                slug: 'pizza-corner',
                name: "Pizza Corner",
                type: "restaurant",
                cuisine: "Italian",
                rating: 4.6,
                deliveryTime: "20-25 min",
                distance: 3.2,
                image: "🍕",
                items: [
                    { id: 201, name: "Margherita Pizza", price: 250, category: "Pizza", description: "Classic tomato and mozzarella", image: "🍕", popular: true },
                    { id: 202, name: "Pepperoni Pizza", price: 320, category: "Pizza", description: "Spicy pepperoni with cheese", image: "🍕", popular: true },
                    { id: 203, name: "Chicken Pasta Alfredo", price: 280, category: "Italian", description: "Creamy white sauce pasta", image: "🍝" },
                    { id: 204, name: "Garlic Bread", price: 120, category: "Italian", description: "Buttery garlic bread sticks", image: "🥖" }
                ]
            },
            {
                id: 3,
                slug: 'burger-hub',
                name: "Burger Hub",
                type: "restaurant",
                cuisine: "Fast Food",
                rating: 4.7,
                deliveryTime: "15-20 min",
                distance: 1.8,
                image: "🍔",
                items: [
                    { id: 301, name: "Classic Chicken Burger", price: 180, category: "Burgers", description: "Beef patty with lettuce and tomato", image: "🍔", popular: true },
                    { id: 302, name: "Chicken Burger Deluxe", price: 200, category: "Burgers", description: "Grilled chicken breast burger", image: "🍔", popular: true },
                    { id: 303, name: "French Fries", price: 80, category: "Fast Food", description: "Crispy golden potato fries", image: "🍟", popular: true },
                    { id: 304, name: "Chicken Wings", price: 220, category: "Fast Food", description: "Spicy buffalo chicken wings", image: "🍗" }
                ]
            }
        ];

        const GROCERY_DATA = [
            {
                id: 4,
                slug: 'fresh-mart',
                name: "Fresh Mart",
                type: "grocery",
                category: "Supermarket",
                rating: 4.5,
                deliveryTime: "30-40 min",
                distance: 2.1,
                image: "🛒",
                items: [
                    { id: 401, name: "Basmati Rice", price: 120, category: "Grains", description: "Premium quality basmati rice 1kg", image: "🌾", popular: true },
                    { id: 402, name: "Fresh Milk", price: 60, category: "Dairy", description: "Full cream fresh milk 1L", image: "🥛", popular: true },
                    { id: 403, name: "Whole Wheat Bread", price: 40, category: "Bakery", description: "Fresh whole wheat bread loaf", image: "🍞" },
                    { 
                        id: 404, 
                        name: "Fresh Bananas", 
                        basePrice: 100, 
                        category: "Fruits", 
                        description: "Fresh ripe bananas", 
                        image: "🍌", 
                        popular: true,
                        hasWeightOptions: true,
                        weightOptions: [
                            { weight: 0.25, label: "250g", price: 25 },
                            { weight: 0.5, label: "500g", price: 50 },
                            { weight: 1, label: "1kg", price: 100 },
                            { weight: 2, label: "2kg", price: 190 }
                        ]
                    },
                    { 
                        id: 405, 
                        name: "Organic Tomatoes", 
                        basePrice: 60, 
                        category: "Vegetables", 
                        description: "Fresh red tomatoes", 
                        image: "🍅",
                        hasWeightOptions: true,
                        weightOptions: [
                            { weight: 0.25, label: "250g", price: 15 },
                            { weight: 0.5, label: "500g", price: 30 },
                            { weight: 1, label: "1kg", price: 60 },
                            { weight: 2, label: "2kg", price: 110 }
                        ]
                    },
                    { 
                        id: 406, 
                        name: "Red Onions", 
                        basePrice: 40, 
                        category: "Vegetables", 
                        description: "Fresh red onions", 
                        image: "🧅",
                        hasWeightOptions: true,
                        weightOptions: [
                            { weight: 0.5, label: "500g", price: 20 },
                            { weight: 1, label: "1kg", price: 40 },
                            { weight: 2, label: "2kg", price: 75 }
                        ]
                    },
                    { 
                        id: 407, 
                        name: "Potatoes", 
                        basePrice: 30, 
                        category: "Vegetables", 
                        description: "Fresh potatoes", 
                        image: "🥔",
                        hasWeightOptions: true,
                        weightOptions: [
                            { weight: 0.5, label: "500g", price: 15 },
                            { weight: 1, label: "1kg", price: 30 },
                            { weight: 2, label: "2kg", price: 55 },
                            { weight: 5, label: "5kg", price: 125 }
                        ]
                    },
                    { id: 408, name: "Chicken Breast", price: 250, category: "Meat", description: "Fresh chicken breast 500g", image: "🍗" }
                ]
            },
            {
                id: 5,
                slug: 'organic-store',
                name: "Organic Store",
                type: "grocery",
                category: "Organic",
                rating: 4.3,
                deliveryTime: "35-45 min",
                distance: 4.1,
                image: "🌱",
                items: [
                    { 
                        id: 501, 
                        name: "Organic Apples", 
                        basePrice: 180, 
                        category: "Fruits", 
                        description: "Certified organic red apples", 
                        image: "🍎", 
                        popular: true,
                        hasWeightOptions: true,
                        weightOptions: [
                            { weight: 0.25, label: "250g", price: 45 },
                            { weight: 0.5, label: "500g", price: 90 },
                            { weight: 1, label: "1kg", price: 180 },
                            { weight: 2, label: "2kg", price: 340 }
                        ]
                    },
                    { id: 502, name: "Quinoa Seeds", price: 320, category: "Grains", description: "Organic quinoa seeds 500g", image: "🌾" },
                    { id: 503, name: "Almond Milk", price: 150, category: "Dairy", description: "Unsweetened almond milk 1L", image: "🥛" },
                    { 
                        id: 504, 
                        name: "Fresh Spinach", 
                        basePrice: 160, 
                        category: "Vegetables", 
                        description: "Fresh organic spinach", 
                        image: "🥬", 
                        popular: true,
                        hasWeightOptions: true,
                        weightOptions: [
                            { weight: 0.25, label: "250g", price: 40 },
                            { weight: 0.5, label: "500g", price: 80 },
                            { weight: 1, label: "1kg", price: 160 }
                        ]
                    },
                    { 
                        id: 505, 
                        name: "Organic Carrots", 
                        basePrice: 80, 
                        category: "Vegetables", 
                        description: "Fresh organic carrots", 
                        image: "🥕",
                        hasWeightOptions: true,
                        weightOptions: [
                            { weight: 0.5, label: "500g", price: 40 },
                            { weight: 1, label: "1kg", price: 80 },
                            { weight: 2, label: "2kg", price: 150 }
                        ]
                    },
                    { id: 506, name: "Organic Chicken", price: 350, category: "Meat", description: "Free-range organic chicken 1kg", image: "🍗" }
                ]
            }
        ];

         const CATEGORIES_DATA = [
            { id: 'all', name: 'All', icon: '🏠', color: 'from-gray-400 to-gray-600' },
            { id: 'indian', name: 'Indian', icon: '🍛', color: 'from-orange-400 to-red-500' },
            { id: 'pizza', name: 'Pizza', icon: '🍕', color: 'from-red-400 to-pink-500' },
            { id: 'burgers', name: 'Burgers', icon: '🍔', color: 'from-yellow-400 to-orange-500' },
            { id: 'italian', name: 'Italian', icon: '🍝', color: 'from-green-400 to-blue-500' },
            { id: 'fast-food', name: 'Fast Food', icon: '🍟', color: 'from-purple-400 to-pink-500' },
            { id: 'fruits', name: 'Fruits', icon: '🍎', color: 'from-green-400 to-green-600' },
            { id: 'vegetables', name: 'Vegetables', icon: '🥬', color: 'from-green-500 to-emerald-600' },
            { id: 'dairy', name: 'Dairy', icon: '🥛', color: 'from-blue-400 to-blue-600' },
            { id: 'grains', name: 'Grains', icon: '🌾', color: 'from-yellow-500 to-amber-600' },
            { id: 'bakery', name: 'Bakery', icon: '🍞', color: 'from-amber-400 to-orange-500' },
            { id: 'meat', name: 'Meat', icon: '🍗', color: 'from-red-500 to-red-700' }
        ];
              const handleSignIn = (userData) => {
                  setIsSignedIn(true);
                  setUser(userData);
                  setIsSignInModalOpen(false);
                   localStorage.setItem("user", JSON.stringify(userData));
 
                  // Load user's saved location
                  const savedLocation = userLocations[userData.email];
                  if (savedLocation) {
                      setSelectedLocation(savedLocation);
                      setNotification({
                          message: `Welcome back! Delivery set to ${savedLocation}`,
                          isVisible: true
                      });
                  }
              };

              const handleLogout = () => {
                  setIsSignedIn(false);
                  setUser(null);
                  setCurrentPage('home');
                localStorage.removeItem('user')
                  setSelectedLocation(''); // Clear location on logout
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

              const handleUpdateProfile = (updatedData) => {
                  setUser(prevUser => ({
                      ...prevUser,
                      ...updatedData
                  }));
                  setNotification({
                      message: 'Profile updated successfully!',
                      isVisible: true
                  });
              };

              const toggleMobileMenu = () => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
              };

              const closeMobileMenu = () => {
                  setIsMobileMenuOpen(false);
              };

              
                      
              

              

            

            //   const addToCart = (item, restaurantName) => {
            //       const cartItem = {
            //           id: Date.now() + Math.random(),
            //           name: item.name,
            //           price: item.price,
            //           restaurant: restaurantName,
            //           quantity: 1
            //       };

            //       setCartItems(prevItems => [...prevItems, cartItem]);
            //       setCartCount(prevCount => prevCount + 1);

            //       // Show notification
            //       setNotification({
            //           message: `${item.name} added to cart!`,
            //           isVisible: true
            //       });
            //   };

              

              const openCart = () => {
                  setIsCartModalOpen(true);
              };

              const closeCart = () => {
                  setIsCartModalOpen(false);
              };

              const handleCheckout = () => {
                  // Create a new order from cart items
                  const newOrder = {
                      id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
                      restaurant: cartItems[0]?.restaurant || 'Mixed Order',
                      status: 'preparing',
                      date: 'Today',
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      total: cartItems.reduce((total, item) => {
                          const price = parseFloat(item.price.replace('$', '').replace('/lb', ''));
                          return total + (price * item.quantity);
                      }, 0).toFixed(2),
                      items: cartItems.map(item => ({
                          name: item.name,
                          price: item.price,
                          quantity: item.quantity
                      })),
                      confirmedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  };

                  setOrders(prevOrders => [newOrder, ...prevOrders]);
                  setCartItems([]);
                  setCartCount(0);
                  setIsCartModalOpen(false);

                  // Show success notification
                  setNotification({
                      message: 'Order placed successfully!',
                      isVisible: true
                  });

                  // Navigate to orders page
                  setCurrentPage('orders');
              };
               const handleOrder = (orderData) => {
  console.log("Order Placed:", orderData);
  // yaha backend API call ya cart clear karna add kar sakte ho
  alert("Order Placed Successfully ✅");
};

              const handleReorder = (order) => {
                  // Add all items from the order back to cart
                  order.items.forEach(item => {
                      const cartItem = {
                          id: Date.now() + Math.random(),
                          name: item.name,
                          price: item.price,
                          restaurant: order.restaurant,
                          quantity: item.quantity
                      };
                      setCartItems(prevItems => [...prevItems, cartItem]);
                      setCartCount(prevCount => prevCount + item.quantity);
                  });

                  setNotification({
                      message: 'Items added to cart for reorder!',
                      isVisible: true
                  });
              };

              const handleTrackOrder = (order) => {
                  setSelectedOrder(order);
                  setIsTrackingModalOpen(true);
              };

              const closeTrackingModal = () => {
                  setIsTrackingModalOpen(false);
                  setSelectedOrder(null);
              };

              const handleLocationChange = (location) => {
                  setSelectedLocation(location);

                  // Save location for signed-in users
                  if (isSignedIn && user && location) {
                      setUserLocations(prev => ({
                          ...prev,
                          [user.email]: location
                      }));

                      setNotification({
                          message: `Delivery location set to ${location}`,
                          isVisible: true
                      });
                  } else if (location) {
                      setNotification({
                          message: `Delivery location set to ${location}`,
                          isVisible: true
                      });
                  }
              };
              const [orders, setOrders] = useState([]);
// 

              return (

                  <div className="min-h-screen bg-gray-50">
                      {/* Mobile Menu */}
                      <MobileMenu
                          isOpen={isMobileMenuOpen}
                          isSignedIn={isSignedIn}
                          onSignIn={openSignInModal}
                          onLogout={handleLogout}
                          onClose={closeMobileMenu}
                          onOpenProfile={openProfileModal}
                          selectedLocation={selectedLocation}
                          onLocationChange={handleLocationChange}
                          onNavigate={handleNavigate}
                          user={user}
    
                      />

                      {/* Header */}
                      <Header RESTAURANTS_DATA={RESTAURANTS_DATA} GROCERY_DATA={GROCERY_DATA} 
                          isSignedIn={isSignedIn}
                          onSignIn={openSignInModal}
                          onLogout={handleLogout}
                          cartCount={cartCount}
                          isMobileMenuOpen={isMobileMenuOpen}
                          onToggleMobileMenu={toggleMobileMenu}
                          onCartClick={openCart}
                          searchQuery={searchQuery}
                          onSearchChange={handleSearchChange}
                          onNavigate={handleNavigate}
                          currentPage={currentPage}
                          user={user}
                          onOpenProfile={openProfileModal}
                          selectedLocation={selectedLocation}
                          onLocationChange={handleLocationChange}
                      />

   <Routes>
  {/* ✅ Home */}
  <Route
    path="/"
    element={
       <Home
      onRestaurantClick={handleRestaurantClick}
      onCategoryClick={handleCategoryClick}
      onNavigate={handleNavigate}
      RESTAURANTS_DATA={RESTAURANTS_DATA}
      GROCERY_DATA={GROCERY_DATA}
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      CATEGORIES_DATA={CATEGORIES_DATA}   // ✅ make sure yeh exist karta hai
    />
    }
  />

  {/* ✅ Orders */}
  <Route
    path="/orders"
    element={
      <MyOrdersPage
        orders={orders}
        onReorder={handleReorder}
        onTrackOrder={handleTrackOrder}
      />
    }
  />

  {/* ✅ Cart */}
  <Route
    path="/cart"
    element={
      <CartPage calculateDeliveryFee={calculateDeliveryFee}
                                AVAILABLE_COUPONS={AVAILABLE_COUPONS}

       cart={cart}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemoveItem={handleRemoveItem}
                                onBack={() => handleNavigate('home')}
        onCheckout={handleCheckout}
      />
    }
  />
  {/* <Route path='/cart/checkout'element={<CheckOut cartItems={cart} userData={user} onPlaceOrder={handleOrder}/>}/> */}
  <Route path='/grocery' element={<Grocery GROCERY_DATA={GROCERY_DATA}  onAddToCart={handleAddToCart} ItemCard={ItemCard} />}/>
  <Route path='/food' element={<Food RESTAURANTS_DATA={RESTAURANTS_DATA} onAddToCart={handleAddToCart} ItemCard={ItemCard} />}/>
 {/* Restaurant Items */}
       <Route path="/items/:type/:slug" element={<RestaurantItemsPage GROCERY_DATA={GROCERY_DATA} RESTAURANTS_DATA={RESTAURANTS_DATA} onAddToCart={handleAddToCart} />} />
        <Route path="/category/:categoryName" element={<CategoryProducts GROCERY_DATA={GROCERY_DATA} RESTAURANTS_DATA={RESTAURANTS_DATA} CATEGORIES_DATA={CATEGORIES_DATA} onAddToCart={handleAddToCart} />} />
        <Route path="/search" element={<SearchResults GROCERY_DATA={GROCERY_DATA} RESTAURANTS_DATA={RESTAURANTS_DATA} searchQuery={searchQuery} onAddToCart={handleAddToCart} />} />
        <Route path='/checkout'element={<TommaluCheckout cart={cart} user={user} onOrder={handleOrder} calculateDeliveryFee={calculateDeliveryFee} AVAILABLE_COUPONS={AVAILABLE_COUPONS}/>}/>
{/* <Route path='/grocery/:itemId' element={<GroceryItemDetail groceryData={groceryData} onAddToCart={addToCart}/>}/> */}
  {/* ✅ 404 Fallback */}
  <Route
    path="*"
    element={
      <h1 className="mt-8 mb-22 text-center text-3xl">404 Page Not Found</h1>
    }
  />
</Routes>
<Footer/>
            
           {/* Menu Modal */}
                     


                      {/* Order Tracking Modal */}
                      <OrderTrackingModal
                          isOpen={isTrackingModalOpen}
                          order={selectedOrder}
                          onClose={closeTrackingModal}
                      />

                      {/* Sign In Modal */}
                      <SignInModal
                          isOpen={isSignInModalOpen}
                          onClose={closeSignInModal}
                          onSignIn={handleSignIn}
                      />

                      {/* Profile Modal */}
                      <ProfileModal
                          isOpen={isProfileModalOpen}
                          onClose={closeProfileModal}
                          user={user}
                          onUpdateProfile={handleUpdateProfile}
                      />

                      {/* Notification */}
                      <Notification
                          message={notification.message}
                          isVisible={notification.isVisible}
                          onClose={() => setNotification({ message: '', isVisible: false })}
                      />
                  </div>
              );
          }
        ;
  export default App
