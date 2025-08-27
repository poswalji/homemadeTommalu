// Home.jsx
import React from "react";
import FeaturesSection from "../featuresSection/FeaturesSection";
import NewsletterSection from "../newsletterSection/NewsletterSection";
import StatsSection from "../statsSection/StatsSection";
import RestaurantCard from "../../components/restaurantCard/RestaurantCard";
import ItemCard from "../../components/itemsCard/ItemCard";
import { Link ,NavLink} from "react-router-dom";

const Home = ({
  onRestaurantClick,
  onCategoryClick,
  onNavigate,
  RESTAURANTS_DATA,
  GROCERY_DATA,
  activeSection,
  setActiveSection,
  CATEGORIES_DATA
}) => {
  return (
    <>
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Delicious Food & Fresh Groceries
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Delivered to your doorstep in minutes
        </p>

        {/* Section Toggle Buttons */}
        <div className="flex justify-center gap-4 mb-8">
    <NavLink
  to="/food"
  className={({ isActive }) =>
    `px-8 py-3 rounded-full font-semibold transition-all ${
      isActive
        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
        : "bg-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 hover:text-white hover:shadow-lg"
    }`
  }
>
  🍕 Food Delivery
</NavLink>

  <NavLink
  to="/grocery"
  onClick={() => setActiveSection("grocery")}
  className={({ isActive }) =>
    `px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
      isActive || activeSection === "grocery"
        ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg"
        : "bg-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500 hover:text-white"
    }`
  }
>
  🛒 Grocery Shopping
</NavLink>

        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-medium">
            🍕 Fast Food
          </span>
          <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
            🥬 Fresh Groceries
          </span>
          <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
            🚚 Quick Delivery
          </span>
          <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium">
            🍛 Indian Cuisine
          </span>
        </div>
      </section>

        {/* Categories Section */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Browse by Category</h2>
                        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide px-2">
                            {CATEGORIES_DATA.map(category => (
                                <Link to={`/category/${category.name.toLowerCase()}`} 
                                    key={category.id}
                                    
                                    className="flex-shrink-0 text-center group"
                                >
                                    <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-full flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform shadow-lg`}>
                                        {category.icon}
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors w-16 truncate">
                                        {category.name}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Popular Restaurants Section */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Popular Restaurants</h2>
                            <button 
                                onClick={() => onNavigate('food')}
                                className="text-purple-600 hover:text-purple-800 font-medium"
                            >
                                View All <i className="fas fa-arrow-right ml-1"></i>
                            </button>
                        </div>
                        
                        <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                            {RESTAURANTS_DATA.map(restaurant => (
                                <RestaurantCard
                                    key={restaurant.id}
                                    restaurant={restaurant}
                                    onRestaurantClick={onRestaurantClick}
                                    type="restaurant"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Popular Grocery Stores Section */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Popular Grocery Stores</h2>
                            <button 
                                onClick={() => onNavigate('grocery')}
                                className="text-green-600 hover:text-green-800 font-medium"
                            >
                                View All <i className="fas fa-arrow-right ml-1"></i>
                            </button>
                        </div>
                        
                        <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                            {GROCERY_DATA.map(store => (
                                <RestaurantCard
                                    key={store.id}
                                    restaurant={store}
                                    onRestaurantClick={onRestaurantClick}
                                     type="grocery" 
                                />
                            ))}
                        </div>
                    </div>
     </main>
     <FeaturesSection />

                              {/* Stats Section */}
                              <StatsSection />

                              {/* Newsletter Section */}
                              <NewsletterSection />
                              </>
  );
};

export default Home;
