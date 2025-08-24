// Home.jsx
import React from "react";
import FeaturesSection from "../featuresSection/FeaturesSection";
import NewsletterSection from "../newsletterSection/NewsletterSection";
import StatsSection from "../statsSection/StatsSection";
import RestaurantCard from "../../components/restaurantCard/RestaurantCard";

const Home = ({
  activeSection,
  setActiveSection,
  categories,
  selectedCategory,
  handleCategoryClick,
  searchQuery,
  setSearchQuery,
  getFilteredRestaurants,
  openRestaurantMenu,
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
          <button
            onClick={() => setActiveSection("food")}
            className={`px-8 py-3 rounded-full font-semibold transition-all ${
              activeSection === "food"
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🍕 Food Delivery
          </button>
          <button
            onClick={() => setActiveSection("grocery")}
            className={`px-8 py-3 rounded-full font-semibold transition-all ${
              activeSection === "grocery"
                ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🛒 Grocery Shopping
          </button>
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
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          Browse Categories
        </h3>
        <div className="circular-scroll">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`circular-item bg-gradient-to-br ${category.color} ${
                selectedCategory === category.name
                  ? "ring-4 ring-white ring-opacity-50"
                  : ""
              }`}
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className="text-sm font-medium text-center">
                {category.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Restaurants & Stores */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : selectedCategory
            ? `${selectedCategory} Options`
            : activeSection === "food"
            ? "Popular Restaurants"
            : "Popular Grocery Stores"}
        </h3>
        {(searchQuery || selectedCategory) && (
          <button
            onClick={() => {
              setSearchQuery("");
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
              <p className="text-gray-400">
                Try searching for something else or browse categories
              </p>
            </div>
          )}
        </div>
      </section>
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
