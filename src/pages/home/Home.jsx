import React from "react";
import FeaturesSection from "../featuresSection/FeaturesSection";
import StatsSection from "../statsSection/StatsSection";
import RestaurantCard from "../../components/restaurantCard/RestaurantCard";
import HeroSection from "../../components/hero/HeroSection";
import { Link, NavLink } from "react-router-dom";

const Home = ({
  onRestaurantClick,
  onCategoryClick,
  onNavigate,
  stores = [], // ✅ Backend stores array
  activeSection,
  setActiveSection,
  categories = []
}) => {
  
  // ✅ STEP 3.1: Category ke hisab se filter karo
  const restaurants = stores.filter(store => 
    store.category === 'Restaurant' || store.category === 'restaurant'
  );
  
  const groceryStores = stores.filter(store => 
    store.category === 'Grocery Store' || store.category === 'grocery'
  );

  // ✅ STEP 3.2: Limit for home page
  const displayRestaurants = restaurants.slice(0, 6);
  const displayGroceryStores = groceryStores.slice(0, 6);

  return (
    <>
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <HeroSection />

        {/* Categories Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Browse by Category
          </h2>

          <div className="flex space-x-4 overflow-x-auto pb-4 pt-2 scrollbar-hide px-2">
            {categories.map((category) => (
              <Link
                to={`/category/${category.name.toLowerCase()}`}
                key={category.id}
                className="flex-shrink-0 text-center group"
                onClick={() => onCategoryClick && onCategoryClick(category)}
              >
                <div
                  className={`
                    w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
                    bg-gradient-to-r ${category.color} 
                    rounded-full flex items-center justify-center
                    mb-2
                    group-hover:scale-110 transition-all duration-300
                    shadow-lg cursor-pointer
                    border-4 border-transparent hover:border-purple-500
                  `}
                >
                  {category.icon.startsWith('http') || category.icon.includes('/') ? (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-2xl">{category.icon}</span>
                  )}
                </div>
                <p className="text-sm md:text-base font-medium text-gray-700 group-hover:text-purple-600 transition-colors w-20 sm:w-24 md:w-28 truncate">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Restaurants Section */}
        {displayRestaurants.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Popular Restaurants</h2>
              <NavLink 
                to={'/food'}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                View All <i className="fas fa-arrow-right ml-1"></i>
              </NavLink>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayRestaurants.map(restaurant => (
                <RestaurantCard
                  key={restaurant._id || restaurant.id}
                  restaurant={restaurant}
                  onRestaurantClick={onRestaurantClick}
                  type="restaurant"
                />
              ))}
            </div>
          </div>
        )}

        {/* Popular Grocery Stores Section */}
        {displayGroceryStores.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Popular Grocery Stores</h2>
              <NavLink
                to={'/grocery'}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                View All <i className="fas fa-arrow-right ml-1"></i>
              </NavLink>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayGroceryStores.map(store => (
                <RestaurantCard
                  key={store._id || store.id}
                  restaurant={store}
                  onRestaurantClick={onRestaurantClick}
                  type="grocery"
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {displayRestaurants.length === 0 && displayGroceryStores.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Stores Available Yet
            </h3>
            <p className="text-gray-500">
              We're working on bringing stores to your area!
            </p>
          </div>
        )}
      </main>

      <FeaturesSection />
      <StatsSection />
    </>
  );
};

export default Home;