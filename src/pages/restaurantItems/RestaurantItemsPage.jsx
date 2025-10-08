import React, { useState, useEffect } from 'react';
import ItemCard from '../../components/itemsCard/ItemCard';
import { Link, useParams } from "react-router-dom";
import { menuService } from '../../services/api';

const RestaurantItemsPage = ({ stores = [], onAddToCart }) => {
  const { type, slug } = useParams();
  const [selectedStore, setSelectedStore] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeStatus, setStoreStatus] = useState('open');

  useEffect(() => {
    loadStoreAndMenu();
  }, [slug, stores]);

  const loadStoreAndMenu = async () => {
    try {
      setLoading(true);
      
      // Find store from stores list
      const store = stores.find(store => {
        const storeSlug = store.storeName?.toLowerCase().replace(/\s+/g, "-");
        return storeSlug === slug;
      });

      console.log('🔍 Found store:', store);

      if (store) {
        setSelectedStore(store);
        
        const status = determineStoreStatus(store);
        console.log('🏪 Store status:', status);
        setStoreStatus(status);
        
        try {
          const menuResponse = await menuService.getMenuByStoreId(store._id);
          console.log('📋 Menu Response:', menuResponse);
          
          const items = menuResponse.data?.menu || 
                       menuResponse.menu || 
                       menuResponse.data || 
                       menuResponse || 
                       [];
          
          setMenuItems(Array.isArray(items) ? items : []);
        } catch (menuError) {
          console.error('Error loading menu:', menuError);
          setMenuItems([]);
        }
      }
    } catch (error) {
      console.error('Error loading store:', error);
    } finally {
      setLoading(false);
    }
  };

  const determineStoreStatus = (store) => {
    if (store.isOpen === false) return 'closed';
    if (store.isOpen === true) return 'open';
    if (store.status === 'closed') return 'closed';
    if (store.status === 'open') return 'open';
    if (store.available === false) return 'closed';
    if (store.openingHours) {
      const isOpen = checkStoreHours(store.openingHours);
      return isOpen ? 'open' : 'closed';
    }
    return 'open';
  };

  const checkStoreHours = (openingHours) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const openTime = 8 * 60;
    const closeTime = 22 * 60;
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const isStoreOpen = () => {
    return storeStatus === 'open';
  };

  // ✅ NEW: License badge with icon
  const getLicenseBadge = (store) => {
    if (!store.licenseType || !store.licenseNumber) return null;

    const licenseIcons = {
      'FSSAI': '📋',
      'GST': '🏢', 
      'Shop Act': '🏪',
      'Trade License': '📄',
      'Other': '📝'
    };

    const icon = licenseIcons[store.licenseType] || '📄';
    
    return (
      <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
        <span className="text-blue-600">{icon}</span>
        <span className="text-blue-700 text-xs font-medium">
          {store.licenseType}: {store.licenseNumber}
        </span>
      </div>
    );
  };

  // ✅ NEW: Trust badges section
  const TrustBadges = ({ store }) => {
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {/* ✅ License Badge */}
        {getLicenseBadge(store)}
        
        {/* ✅ Verified Store Badge */}
        {store.isVerified && (
          <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-3 py-1">
            <span className="text-green-600">✅</span>
            <span className="text-green-700 text-xs font-medium">Verified Store</span>
          </div>
        )}
        
        {/* ✅ Popular Store Badge */}
        {store.timesOrdered > 50 && (
          <div className="flex items-center space-x-2 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
            <span className="text-orange-600">🔥</span>
            <span className="text-orange-700 text-xs font-medium">Popular</span>
          </div>
        )}
        
        {/* ✅ Operating Since Badge */}
        {store.operatingSince && (
          <div className="flex items-center space-x-2 bg-purple-50 border border-purple-200 rounded-full px-3 py-1">
            <span className="text-purple-600">🏆</span>
            <span className="text-purple-700 text-xs font-medium">Since {store.operatingSince}</span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Store Not Found</h1>
        <p className="text-gray-600 mb-6">The store you're looking for doesn't exist.</p>
        <Link 
          to="/"
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to='/'
        className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 mb-6"
      >
        <i className="fas fa-arrow-left"></i>
        <span>Back to Home</span>
      </Link>

      {/* Store Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
            {selectedStore.image ? (
              <img 
                src={selectedStore.image} 
                alt={selectedStore.storeName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{selectedStore.storeName?.charAt(0) || 'S'}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedStore.storeName}</h1>
            <p className="text-gray-600 mb-3">{selectedStore.category} • {selectedStore.address}</p>
            
            {/* ✅ UPDATED: Store Metrics with License Info */}
            <div className="flex items-center space-x-4 text-sm mb-3">
              {/* Store Status */}
              <span className={`font-medium px-3 py-1 rounded-full text-sm ${
                isStoreOpen() 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {isStoreOpen() ? '🟢 OPEN NOW' : '🔴 CLOSED'}
              </span>
              
              {/* Rating */}
              <span className="text-green-600 font-medium">
                ⭐ {selectedStore.rating || '4.0'}
              </span>
              
              {/* Delivery Time */}
              <span className="text-gray-500">
                🚚 {selectedStore.deliveryTime || '25-35 min'}
              </span>
              
              {/* Order Count */}
              {selectedStore.timesOrdered > 0 && (
                <span className="text-gray-500">
                  📦 {selectedStore.timesOrdered} orders
                </span>
              )}
            </div>

            {/* ✅ TRUST BADGES SECTION */}
            <TrustBadges store={selectedStore} />

            
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {isStoreOpen() ? `Menu (${menuItems.length} items)` : 'Store Closed'}
        </h2>
        
        {/* Store Closed Message */}
        {!isStoreOpen() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-yellow-600 text-lg mr-3">⚠️</span>
              <div>
                <p className="text-yellow-800 font-medium">This store is currently closed</p>
                <p className="text-yellow-600 text-sm">
                  {selectedStore.openingHours || 'Will open soon'}
                </p>
                <p className="text-yellow-600 text-xs mt-1">
                  You can still browse the menu, but ordering will be available when the store opens.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      {menuItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map(item => (
            <ItemCard
              key={item._id || item.id}
              item={item}
              restaurant={selectedStore}
              onAddToCart={isStoreOpen() ? onAddToCart : null}
              disabled={!isStoreOpen()}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {isStoreOpen() ? 'Menu Coming Soon' : 'Store Closed - Menu Unavailable'}
          </h3>
          <p className="text-gray-500">
            {isStoreOpen() 
              ? "This store is setting up their menu. Check back later!"
              : "The menu will be available when the store opens."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default RestaurantItemsPage;