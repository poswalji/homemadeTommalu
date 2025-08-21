  import { useState,useEffect } from 'react'
  import reactLogo from './assets/react.svg'
  import viteLogo from '/vite.svg'
  import './index.css';

  import './App.css'
import CartModal from "./components/cartModal/CartModal";
import Header from "./components/header/Header";
import MenuModal from "./components/menuModal/MenuModal";
import MobileMenu from "./components/mobileMenu/MobileMenu";
import MyOrdersPage from "./components/myOrderPage/MyOrdersPage";
import Notification from "./components/notifications/Notification";
import OrderTrackingModal from "./components/orderTrakingModel/OrderTrackingModal";
import ProfileDropdown from "./components/profileDropdown/ProfileDropdown";
import ProfileModal from "./components/profileModel/ProfileModal";
import RestaurantCard from "./components/restaurantCard/RestaurantCard";
import SignInModal from "./components/signInModel/SignInModal";
import FeaturesSection from "./pages/featuresSection/FeaturesSection";
import Footer from "./pages/footer/Footer";
import NewsletterSection from "./pages/newsletterSection/NewsletterSection";
import StatsSection from "./pages/statsSection/StatsSection";
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
              const [cartCount, setCartCount] = useState(0);
              const [cartItems, setCartItems] = useState([]);
              const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
              const [selectedRestaurant, setSelectedRestaurant] = useState(null);
              const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
              const [isCartModalOpen, setIsCartModalOpen] = useState(false);
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
              const [userLocations, setUserLocations] = useState({}); // Store locations per user
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

              

  // Verify token on page load
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/auth/verify", {
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

              // Sample orders data
              const [orders, setOrders] = useState([
                  {
                      id: 'ORD001',
                      restaurant: 'Spice Garden',
                      status: 'preparing',
                      date: 'Today',
                      time: '2:15 PM',
                      total: '24.99',
                      items: [
                          { name: 'Butter Chicken', price: '16.99', quantity: 1 },
                          { name: 'Garlic Naan', price: '3.99', quantity: 2 }
                      ],
                      confirmedTime: '2:15 PM',
                      preparingTime: '2:25 PM'
                  },
                  {
                      id: 'ORD002',
                      restaurant: 'Pizza Palace',
                      status: 'on-way',
                      date: 'Today',
                      time: '1:30 PM',
                      total: '18.99',
                      items: [
                          { name: 'Margherita Pizza', price: '12.99', quantity: 1 },
                          { name: 'Garlic Bread', price: '5.99', quantity: 1 }
                      ],
                      confirmedTime: '1:30 PM',
                      preparingTime: '1:40 PM',
                      onWayTime: '2:00 PM'
                  },
                  {
                      id: 'ORD003',
                      restaurant: 'Curry House',
                      status: 'delivered',
                      date: 'Yesterday',
                      time: '7:45 PM',
                      total: '32.50',
                      items: [
                          { name: 'Chicken Biryani', price: '18.99', quantity: 1 },
                          { name: 'Dal Tadka', price: '8.99', quantity: 1 },
                          { name: 'Basmati Rice', price: '4.99', quantity: 1 }
                      ],
                      confirmedTime: '7:45 PM',
                      preparingTime: '7:55 PM',
                      onWayTime: '8:20 PM',
                      deliveredTime: '8:35 PM'
                  },
                  {
                      id: 'ORD004',
                      restaurant: 'Tandoor Express',
                      status: 'delivered',
                      date: '2 days ago',
                      time: '6:20 PM',
                      total: '28.75',
                      items: [
                          { name: 'Tandoori Chicken', price: '19.99', quantity: 1 },
                          { name: 'Mint Chutney', price: '2.99', quantity: 1 },
                          { name: 'Roti', price: '2.99', quantity: 2 }
                      ],
                      confirmedTime: '6:20 PM',
                      preparingTime: '6:30 PM',
                      onWayTime: '6:55 PM',
                      deliveredTime: '7:10 PM'
                  }
              ]);

              // Category data for circular items
              const categories = [
                  { name: 'Pizza', icon: '🍕', color: 'from-red-400 to-orange-500' },
                  { name: 'Burgers', icon: '🍔', color: 'from-yellow-400 to-red-500' },
                  { name: 'Indian', icon: '🍛', color: 'from-orange-400 to-red-600' },
                  { name: 'Sushi', icon: '🍣', color: 'from-purple-400 to-pink-500' },
                  { name: 'Groceries', icon: '🛒', color: 'from-green-400 to-blue-500' },
                  { name: 'Desserts', icon: '🍰', color: 'from-pink-400 to-purple-500' },
                  { name: 'Drinks', icon: '🥤', color: 'from-blue-400 to-cyan-500' },
                  { name: 'Chinese', icon: '🥡', color: 'from-orange-400 to-red-500' }
              ];

              // Food restaurants data with Indian restaurants
              const foodRestaurants = [
                  {
                      name: 'Spice Garden',
                      category: 'Indian • Authentic • Spicy',
                      rating: 4.8,
                      deliveryTime: '25-30 min',
                      type: 'restaurant',
                      menuItems: [
                          { name: 'Butter Chicken', price: '₹299', icon: '🍛', description: 'Creamy tomato-based curry with tender chicken' },
                          { name: 'Chicken Biryani', price: '₹349', icon: '🍚', description: 'Fragrant basmati rice with spiced chicken' },
                          { name: 'Palak Paneer', price: '₹249', icon: '🥬', description: 'Spinach curry with cottage cheese cubes' },
                          { name: 'Garlic Naan', price: '₹79', icon: '🫓', description: 'Fresh baked bread with garlic and herbs' },
                          { name: 'Mango Lassi', price: '₹89', icon: '🥤', description: 'Sweet yogurt drink with mango' }
                      ]
                  },
                  {
                      name: 'Curry House',
                      category: 'Indian • Vegetarian • Traditional',
                      rating: 4.6,
                      deliveryTime: '20-25 min',
                      type: 'restaurant',
                      menuItems: [
                          { name: 'Dal Tadka', price: '₹159', icon: '🍲', description: 'Yellow lentils tempered with spices' },
                          { name: 'Chole Bhature', price: '₹229', icon: '🫘', description: 'Spiced chickpeas with fried bread' },
                          { name: 'Aloo Gobi', price: '₹199', icon: '🥔', description: 'Potato and cauliflower curry' },
                          { name: 'Basmati Rice', price: '₹89', icon: '🍚', description: 'Fragrant long-grain rice' },
                          { name: 'Gulab Jamun', price: '₹99', icon: '🍯', description: 'Sweet milk dumplings in syrup' }
                      ]
                  },
                  {
                      name: 'Tandoor Express',
                      category: 'Indian • Grilled • Fast Food',
                      rating: 4.7,
                      deliveryTime: '15-20 min',
                      type: 'restaurant',
                      menuItems: [
                          { name: 'Tandoori Chicken', price: '₹359', icon: '🍗', description: 'Clay oven grilled chicken with spices' },
                          { name: 'Seekh Kebab', price: '₹279', icon: '🍢', description: 'Spiced minced meat skewers' },
                          { name: 'Chicken Tikka', price: '₹319', icon: '🍖', description: 'Marinated chicken chunks grilled to perfection' },
                          { name: 'Mint Chutney', price: '₹49', icon: '🌿', description: 'Fresh mint and coriander sauce' },
                          { name: 'Roti', price: '₹49', icon: '🫓', description: 'Whole wheat flatbread' }
                      ]
                  },
                  {
                      name: 'Biryani Palace',
                      category: 'Indian • Biryani • Royal',
                      rating: 4.9,
                      deliveryTime: '30-35 min',
                      type: 'restaurant',
                      menuItems: [
                          { name: 'Hyderabadi Biryani', price: '₹399', icon: '👑', description: 'Royal style biryani with aromatic spices' },
                          { name: 'Mutton Biryani', price: '₹449', icon: '🍖', description: 'Tender mutton with fragrant basmati rice' },
                          { name: 'Veg Biryani', price: '₹299', icon: '🥕', description: 'Mixed vegetables with saffron rice' },
                          { name: 'Raita', price: '₹69', icon: '🥒', description: 'Cooling yogurt with cucumber and spices' },
                          { name: 'Shorba', price: '₹99', icon: '🍲', description: 'Traditional spiced soup' }
                      ]
                  },
                  {
                      name: 'Pizza Palace',
                      category: 'Italian • Pizza • Fast Food',
                      rating: 4.5,
                      deliveryTime: '25-30 min',
                      type: 'restaurant',
                      menuItems: [
                          { name: 'Margherita', price: '₹229', icon: '🍕', description: 'Fresh tomatoes, mozzarella, and basil' },
                          { name: 'Pepperoni', price: '₹269', icon: '🍕', description: 'Classic pepperoni with cheese' },
                          { name: 'Veggie Supreme', price: '₹249', icon: '🍕', description: 'Bell peppers, mushrooms, olives' },
                          { name: 'Garlic Bread', price: '₹99', icon: '🥖', description: 'Crispy bread with garlic butter' },
                          { name: 'Caesar Salad', price: '₹159', icon: '🥗', description: 'Fresh romaine with caesar dressing' }
                      ]
                  },
                  {
                      name: 'Burger Hub',
                      category: 'American • Burgers • Fast Food',
                      rating: 4.3,
                      deliveryTime: '20-25 min',
                      type: 'restaurant',
                      menuItems: [
                          { name: 'Classic Burger', price: '₹179', icon: '🍔', description: 'Beef patty with lettuce and tomato' },
                          { name: 'Cheese Burger', price: '₹199', icon: '🍔', description: 'Classic burger with melted cheese' },
                          { name: 'Chicken Burger', price: '₹219', icon: '🍔', description: 'Grilled chicken breast with mayo' },
                          { name: 'French Fries', price: '₹89', icon: '🍟', description: 'Crispy golden potato fries' },
                          { name: 'Milkshake', price: '₹109', icon: '🥤', description: 'Creamy vanilla milkshake' }
                      ]
                  },
                  {
                      name: 'Sushi Zen',
                      category: 'Japanese • Sushi • Asian',
                      rating: 4.8,
                      deliveryTime: '30-35 min',
                      type: 'restaurant',
                      menuItems: [
                          { name: 'California Roll', price: '₹159', icon: '🍣', description: 'Crab, avocado, and cucumber roll' },
                          { name: 'Salmon Nigiri', price: '₹229', icon: '🍣', description: 'Fresh salmon over seasoned rice' },
                          { name: 'Tuna Sashimi', price: '₹279', icon: '🍣', description: 'Premium grade tuna slices' },
                          { name: 'Miso Soup', price: '₹69', icon: '🍜', description: 'Traditional soybean soup' },
                          { name: 'Edamame', price: '₹89', icon: '🫘', description: 'Steamed and salted soybeans' }
                      ]
                  }
              ];

              // Grocery stores data
              const groceryStores = [
                  {
                      name: 'Sharma Kirana Store',
                      category: 'Indian Grocery • Spices • Traditional Items',
                      rating: 4.8,
                      deliveryTime: '15-20 min',
                      type: 'grocery',
                      menuItems: [
                          { name: 'Basmati Rice (5kg)', price: '₹450', icon: '🍚', description: 'Premium quality basmati rice' },
                          { name: 'Atta (Wheat Flour 10kg)', price: '₹380', icon: '🌾', description: 'Fresh ground wheat flour' },
                          { name: 'Toor Dal (1kg)', price: '₹120', icon: '🫘', description: 'Yellow split pigeon peas' },
                          { name: 'Turmeric Powder', price: '₹45', icon: '🟡', description: 'Pure turmeric powder 100g' },
                          { name: 'Garam Masala', price: '₹65', icon: '🌶️', description: 'Homemade spice blend 50g' },
                          { name: 'Ghee (500ml)', price: '₹280', icon: '🧈', description: 'Pure cow ghee' },
                          { name: 'Onions (1kg)', price: '₹35', icon: '🧅', description: 'Fresh red onions' },
                          { name: 'Potatoes (1kg)', price: '₹25', icon: '🥔', description: 'Fresh potatoes' }
                      ]
                  },
                  {
                      name: 'Fresh Market',
                      category: 'Groceries • Fresh Produce • Dairy',
                      rating: 4.7,
                      deliveryTime: '15-20 min',
                      type: 'grocery',
                      menuItems: [
                          { name: 'Fresh Apples', price: '₹180/kg', icon: '🍎', description: 'Crisp and sweet red apples' },
                          { name: 'Organic Milk', price: '₹65', icon: '🥛', description: 'Fresh organic whole milk' },
                          { name: 'Whole Wheat Bread', price: '₹45', icon: '🍞', description: 'Healthy whole grain bread' },
                          { name: 'Fresh Spinach', price: '₹30', icon: '🥬', description: 'Organic baby spinach leaves' },
                          { name: 'Free Range Eggs', price: '₹90', icon: '🥚', description: 'Farm fresh free range eggs' }
                      ]
                  },
                  {
                      name: 'Organic Plus',
                      category: 'Organic • Health Foods • Supplements',
                      rating: 4.6,
                      deliveryTime: '20-25 min',
                      type: 'grocery',
                      menuItems: [
                          { name: 'Organic Bananas', price: '₹60/kg', icon: '🍌', description: 'Certified organic bananas' },
                          { name: 'Almond Milk', price: '₹180', icon: '🥛', description: 'Unsweetened almond milk' },
                          { name: 'Quinoa', price: '₹320', icon: '🌾', description: 'Organic quinoa grain' },
                          { name: 'Greek Yogurt', price: '₹150', icon: '🥛', description: 'Plain Greek yogurt' },
                          { name: 'Chia Seeds', price: '₹450', icon: '🌱', description: 'Organic chia seeds' }
                      ]
                  },
                  {
                      name: 'Gupta General Store',
                      category: 'Indian Kirana • Daily Essentials • Household',
                      rating: 4.5,
                      deliveryTime: '10-15 min',
                      type: 'grocery',
                      menuItems: [
                          { name: 'Maggi Noodles (12 pack)', price: '₹144', icon: '🍜', description: 'Instant noodles family pack' },
                          { name: 'Parle-G Biscuits', price: '₹20', icon: '🍪', description: 'Classic glucose biscuits' },
                          { name: 'Amul Butter', price: '₹52', icon: '🧈', description: 'Fresh salted butter 100g' },
                          { name: 'Tata Tea (1kg)', price: '₹420', icon: '☕', description: 'Premium black tea' },
                          { name: 'Surf Excel (1kg)', price: '₹180', icon: '🧼', description: 'Washing powder' },
                          { name: 'Colgate Toothpaste', price: '₹85', icon: '🦷', description: 'Total advanced health' },
                          { name: 'Coconut Oil (500ml)', price: '₹120', icon: '🥥', description: 'Pure coconut oil' },
                          { name: 'Chana Dal (1kg)', price: '₹90', icon: '🫘', description: 'Split chickpeas' }
                      ]
                  }
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

              const handleNavigate = (page) => {
                  setCurrentPage(page);
                  if (page === 'orders' && !isSignedIn) {
                      // Auto sign in for demo with sample user data
                      const sampleUser = {
                          name: 'John Doe',
                          email: 'john.doe@example.com',
                          phone: '+1 (555) 123-4567',
                          memberSince: 'January 2023',
                          totalOrders: 47,
                          favoriteRestaurant: 'Spice Garden',
                          address: '123 Main Street, Apartment 4B, New York, NY 10001'
                      };
                      setIsSignedIn(true);
                      setUser(sampleUser);

                      // Set demo user's saved location
                      const demoLocation = 'NIMS University';
                      setSelectedLocation(demoLocation);
                      setUserLocations(prev => ({
                          ...prev,
                          [sampleUser.email]: demoLocation
                      }));
                  }
              };

              const openRestaurantMenu = (restaurant) => {
                  setSelectedRestaurant(restaurant);
                  setIsMenuModalOpen(true);
              };

              const closeMenuModal = () => {
                  setIsMenuModalOpen(false);
                  setSelectedRestaurant(null);
              };

              const addToCart = (item, restaurantName) => {
                  const cartItem = {
                      id: Date.now() + Math.random(),
                      name: item.name,
                      price: item.price,
                      restaurant: restaurantName,
                      quantity: 1
                  };

                  setCartItems(prevItems => [...prevItems, cartItem]);
                  setCartCount(prevCount => prevCount + 1);

                  // Show notification
                  setNotification({
                      message: `${item.name} added to cart!`,
                      isVisible: true
                  });
              };

              const handleSearchChange = (query) => {
                  setSearchQuery(query);
                  setSelectedCategory(''); // Clear category filter when searching
              };

              const handleCategoryClick = (categoryName) => {
                  if (selectedCategory === categoryName) {
                      setSelectedCategory(''); // Deselect if already selected
                  } else {
                      setSelectedCategory(categoryName);
                      setSearchQuery(''); // Clear search when selecting category
                  }
              };

              const getFilteredRestaurants = () => {
                  // When searching, show both restaurants and grocery stores
                  if (searchQuery) {
                      const allStores = [...foodRestaurants, ...groceryStores];
                      return allStores.filter(restaurant => {
                          // Search in restaurant name, category, and menu items
                          const searchLower = searchQuery.toLowerCase();
                          const nameMatch = restaurant.name.toLowerCase().includes(searchLower);
                          const categoryMatch = restaurant.category.toLowerCase().includes(searchLower);
                          const menuMatch = restaurant.menuItems.some(item =>
                              item.name.toLowerCase().includes(searchLower)
                          );
                          return nameMatch || categoryMatch || menuMatch;
                      });
                  }

                  // When filtering by category, also show both types
                  if (selectedCategory) {
                      const allStores = [...foodRestaurants, ...groceryStores];
                      return allStores.filter(restaurant => {
                          const categoryLower = selectedCategory.toLowerCase();
                          const nameMatch = restaurant.name.toLowerCase().includes(categoryLower);
                          const categoryMatch = restaurant.category.toLowerCase().includes(categoryLower);
                          const menuMatch = restaurant.menuItems.some(item =>
                              item.name.toLowerCase().includes(categoryLower)
                          );
                          return nameMatch || categoryMatch || menuMatch;
                      });
                  }

                  // Otherwise show based on active section
                  return activeSection === 'food' ? foodRestaurants : groceryStores;
              };

              const removeFromCart = (itemId) => {
                  const itemToRemove = cartItems.find(item => item.id === itemId);
                  if (itemToRemove) {
                      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
                      setCartCount(prevCount => Math.max(0, prevCount - itemToRemove.quantity));
                  }
              };

              const updateCartQuantity = (itemId, newQuantity) => {
                  if (newQuantity <= 0) {
                      removeFromCart(itemId);
                      return;
                  }

                  setCartItems(prevItems =>
                      prevItems.map(item => {
                          if (item.id === itemId) {
                              const quantityDiff = newQuantity - item.quantity;
                              setCartCount(prevCount => prevCount + quantityDiff);
                              return { ...item, quantity: newQuantity };
                          }
                          return item;
                      })
                  );
              };

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
                      <Header
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

                      {/* Main Content */}
                      {currentPage === 'home' ? (
                          <>
                              <main className="container mx-auto px-4 py-8">
                                  {/* Hero Section */}
                                  <section className="text-center mb-12">
                                      <h2 className="text-4xl font-bold text-gray-800 mb-4">Delicious Food & Fresh Groceries</h2>
                                      <p className="text-xl text-gray-600 mb-8">Delivered to your doorstep in minutes</p>

                                      {/* Section Toggle Buttons */}
                                      <div className="flex justify-center gap-4 mb-8">
                                          <button
                                              onClick={() => setActiveSection('food')}
                                              className={`px-8 py-3 rounded-full font-semibold transition-all ${activeSection === 'food'
                                                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                  }`}
                                          >
                                              🍕 Food Delivery
                                          </button>
                                          <button
                                              onClick={() => setActiveSection('grocery')}
                                              className={`px-8 py-3 rounded-full font-semibold transition-all ${activeSection === 'grocery'
                                                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                  }`}
                                          >
                                              🛒 Grocery Shopping
                                          </button>
                                      </div>

                                      <div className="flex flex-wrap justify-center gap-4">
                                          <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-medium">🍕 Fast Food</span>
                                          <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">🥬 Fresh Groceries</span>
                                          <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">🚚 Quick Delivery</span>
                                          <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium">🍛 Indian Cuisine</span>
                                      </div>
                                  </section>

                                  {/* Categories Section */}
                                  <section className="mb-12">
                                      <h3 className="text-2xl font-bold text-gray-800 mb-6">Browse Categories</h3>
                                      <div className="circular-scroll">
                                          {categories.map((category, index) => (
                                              <div
                                                  key={index}
                                                  className={`circular-item bg-gradient-to-br ${category.color} ${selectedCategory === category.name ? 'ring-4 ring-white ring-opacity-50' : ''
                                                      }`}
                                                  onClick={() => handleCategoryClick(category.name)}
                                              >
                                                  <div className="text-3xl mb-2">{category.icon}</div>
                                                  <div className="text-sm font-medium text-center">{category.name}</div>
                                              </div>
                                          ))}
                                      </div>
                                  </section>

                                  {/* Popular Restaurants & Stores */}
                                  <section className="mb-12">
                                      <h3 className="text-2xl font-bold text-gray-800 mb-6">
                                          {searchQuery ? `Search Results for "${searchQuery}"` :
                                              selectedCategory ? `${selectedCategory} Options` :
                                                  activeSection === 'food' ? 'Popular Restaurants' : 'Popular Grocery Stores'}
                                      </h3>
                                      {(searchQuery || selectedCategory) && (
                                          <button
                                              onClick={() => {
                                                  setSearchQuery('');
                                                  setSelectedCategory('');
                                              }}
                                              className="mb-4 text-purple-600 hover:text-purple-800 font-medium"
                                          >
                                              ← Clear filters
                                          </button>
                                      )}
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                          {getFilteredRestaurants().length > 0 ? (
                                              getFilteredRestaurants().map((restaurant, index) => (
                                                  <RestaurantCard
                                                      key={index}
                                                      restaurant={restaurant}
                                                      onClick={openRestaurantMenu}
                                                  />
                                              ))
                                          ) : (
                                              <div className="col-span-full text-center py-12">
                                                  <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
                                                  <p className="text-gray-500 text-lg">No results found</p>
                                                  <p className="text-gray-400">Try searching for something else or browse categories</p>
                                              </div>
                                          )}
                                      </div>
                                  </section>
                              </main>

                              {/* Features Section */}
                              <FeaturesSection />

                              {/* Stats Section */}
                              <StatsSection />

                              {/* Newsletter Section */}
                              <NewsletterSection />
                          </>
                      ) : (
                          <MyOrdersPage
                              orders={orders}
                              onReorder={handleReorder}
                              onTrackOrder={handleTrackOrder}
                          />
                      )}

                      {/* Footer */}
                      <Footer />

                      {/* Menu Modal */}
                      <MenuModal
                          isOpen={isMenuModalOpen}
                          restaurant={selectedRestaurant}
                          onClose={closeMenuModal}
                          onAddToCart={addToCart}
                      />

                      {/* Cart Modal */}
                      <CartModal
                          isOpen={isCartModalOpen}
                          onClose={closeCart}
                          cartItems={cartItems}
                          onRemoveFromCart={removeFromCart}
                          onUpdateQuantity={updateCartQuantity}
                          onCheckout={handleCheckout}
                      />

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
          };
  export default App
