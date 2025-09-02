// Home.jsx
import React from "react";
import FeaturesSection from "../featuresSection/FeaturesSection";
import NewsletterSection from "../newsletterSection/NewsletterSection";
import StatsSection from "../statsSection/StatsSection";
import RestaurantCard from "../../components/restaurantCard/RestaurantCard";
import HeroSection from "../../components/hero/HeroSection";
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
<HeroSection />


    


       {/* Categories Section */}
<div className="mb-12">
  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
    Browse by Category
  </h2>

  <div className="flex space-x-4 overflow-x-auto pb-4 pt-2 scrollbar-hide px-2">
    {CATEGORIES_DATA.map((category) => (
  <Link
    to={`/category/${category.name.toLowerCase()}`}
    key={category.id}
    className="flex-shrink-0 text-center group"
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
      <img
        src={category.icon}
        alt={category.name}
        className="w-full h-full object-cover rounded-full"
      />
    </div>
    <p className="text-sm md:text-base font-medium text-gray-700 group-hover:text-purple-600 transition-colors w-20 sm:w-24 md:w-28 truncate">
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
                            <NavLink 
                               to={'/food'}
                                className="text-purple-600 hover:text-purple-800 font-medium"
                            >
                                View All <i className="fas fa-arrow-right ml-1"></i>
                            </NavLink>
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
                            <NavLink
                               to={'/grocery'}
                                className="text-green-600 hover:text-green-800 font-medium"
                            >
                                View All <i className="fas fa-arrow-right ml-1"></i>
                            </NavLink>
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

                              
                              {/* <NewsletterSection /> */}
                              </>
  );
};

export default Home;
