import React from "react";
import ProfileDropdown from "../profileDropdown/ProfileDropdown";
import logo from "../../assets/logo.jpg"

import { useState,useEffect, } from "react";
import { NavLink,useLocation,useNavigate } from "react-router-dom";

  const Header = ({
            isSignedIn,
            onSignIn,
            onLogout,
            cartCount,
            isMobileMenuOpen,
            onToggleMobileMenu,
            onCartClick,
            searchQuery,
            onSearchChange,
            onNavigate,
            deleveryLocation,
            currentPage,
            user,
            onOpenProfile,
            selectedLocation,
            onLocationChange,
        }) => {
            const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
            const [language, setLanguage] = useState('EN');
              const location = useLocation();
            const toggleProfileDropdown = () => {
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
            };
            const navigate = useNavigate();

            const handleLogout = () => {
                onLogout();
                setIsProfileDropdownOpen(false);
            };

            const handleNavigate = (page) => {
                onNavigate(page);
                setIsProfileDropdownOpen(false);
            };

            const handleOpenProfile = () => {
                onOpenProfile();
                setIsProfileDropdownOpen(false);
            };
             const handleSearchInput = (e) => {
                onSearchChange(e.target.value);
            };

            const handleSearchKeyPress = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    onSearchChange(e.target.value);
                    ;
                }
              }

            // Close dropdown when clicking outside
            useEffect(() => {
                const handleClickOutside = (event) => {
                    if (!event.target.closest('.profile-container')) {
                        setIsProfileDropdownOpen(false);
                    }
                };

                document.addEventListener('click', handleClickOutside);
                return () => document.removeEventListener('click', handleClickOutside);
            }, []);
            

            return (
                <header className="gradient-bg text-black shadow-lg sticky top-0 z-30">
                  

                    <div className="container mx-auto px-4">
                        {/* Desktop Header */}
                        <div className="hidden md:flex items-center justify-between py-4">
                            <div className="flex items-center space-x-8">
                                <NavLink to="/" className="text-3xl font-bold hover:text-[#ff6931] transition-colors">
  <img src={logo} alt="Tommalu Logo" className="h-6 w-auto object-fill"/>
                                </NavLink>
                               <nav className="flex space-x-6">
                                    <NavLink
    to="/"
    className={({ isActive }) =>
      `font-medium transition-colors ${
        isActive ? "text-[#ff6931]" : "hover:text-[#ff6931]"
      }`
    }
  >
    Home
  </NavLink>
               <NavLink
    to="/food"
    className={({ isActive }) =>
      `font-medium transition-colors ${
        isActive ? "text-[#ff6931]" : "hover:text-[#ff6931]"
      }`
    }
  >
    Food
  </NavLink>
  <NavLink
    to="/grocery"
    className={({ isActive }) =>
      `font-medium transition-colors ${
        isActive ? "text-[#ff6931]" : "hover:text-[#ff6931]"
      }`
    }
  >
    Grocery
  </NavLink>
  {isSignedIn && (
    <NavLink
      to="/orders"
      className={({ isActive }) =>
        `font-medium transition-colors ${
          isActive ? "text-[#ff6931]" : "hover:text-[#ff6931]"
        }`
      }
    >
      My Orders
    </NavLink>
)}

                               </nav>
                            </div>

                            <div className="flex items-center space-x-6">
                              {/* Search Bar */}
                              

  <div className="relative">
    <input
      type="text"
      placeholder="Search for food or groceries..."
      value={searchQuery}
                                        onChange={handleSearchInput}
                                        onKeyPress={handleSearchKeyPress}
      
      className="w-96 px-4 py-2 pr-12 rounded-full text-gray-800
                 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff6931] 
                 transition-all duration-200"
    />
    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 
                       hover:text-[#ff6931] transition-colors duration-200">
      <i className="fas fa-search"></i>
    </button>
    
  </div>



                                {/* Delivery Locations */}
                               {/* Delivery Locations */}
<div className="relative group">
  <button className=" bg-opacity-20 text-black border border-[#ff6931] border-opacity-30 rounded px-3 py-2 focus:outline-none hover:bg-opacity-30 transition-colors flex items-center space-x-2">
    <i className="fas fa-map-marker-alt"></i>
    <span>{selectedLocation || 'Detecting Location...'}</span>
    <i className="fas fa-chevron-down text-sm"></i>
  </button>

  {/* Dropdown */}
  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
    <div className="px-4 py-2 border-b">
      <h4 className="font-semibold text-gray-800 flex items-center">
        <i className="fas fa-shipping-fast text-green-500 mr-2"></i>
        Delivery Available In
      </h4>
      <p className="text-sm text-gray-600">Limited locations currently served</p>
    </div>

    <div className="max-h-64 overflow-y-auto">
      {deleveryLocation.map((location, index) => (
        <div
          key={index}
          className={`w-full px-4 py-3 text-left flex items-center justify-between 
            ${location.status === 'coming' ? 'opacity-60' : ''}`}
        >
          <div className="flex items-center space-x-3">
            <i className={`fas fa-map-marker-alt ${
              location.status === 'active' ? 'text-green-500' : 'text-gray-400'
            }`}></i>
            <div>
              <div className="font-medium text-gray-800">{location.name}</div>
              <div className={`text-sm ${
                location.status === 'active' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {location.status === 'active' ? `🚚 ${location.time}` : location.time}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="px-4 py-3 border-t bg-gray-50">
      <p className="text-xs text-gray-600 mb-2">
        <i className="fas fa-info-circle mr-1"></i>
        Don't see your area? We're expanding soon!
      </p>
      <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">
        Request New Location →
      </button>
    </div>
  </div>
</div>

                                        
                                {/* Language Toggle */}
                                {/* <GoogleTranslate /> */}

                                {/* Sign In Button / User Profile */}
                                {!isSignedIn ? (
                                    <button
                                        onClick={onSignIn}
                                        className="bg-[#ff6931] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#ff6a32] transition-colors"
                                    >
                                        Sign In
                                    </button>
                                ) : (
                                    <div className="relative profile-container">
                                        <button
                                            onClick={toggleProfileDropdown}
                                            className="w-10 h-10 border-2 bg-opacity-20 rounded-full flex items-center justify-center hover:border-yellow-300 hover:text-[#ff6931] transition-colors"
                                        >
                                            <i className="fas fa-user"></i>
                                        </button>
                                        <ProfileDropdown
                                            isOpen={isProfileDropdownOpen}
                                            onLogout={handleLogout}
                                            onNavigate={handleNavigate}
                                            onOpenProfile={handleOpenProfile}
                                            user={user}
                                        />
                                    </div>
                                )}

                               
                               <NavLink
  to="/cart"
  className={({ isActive }) =>
    `relative font-medium transition-colors ${
      isActive ? "text-[#ff6931]" : "hover:text-[#ff6931]"
    }`
  }
>
  <i className="fas fa-shopping-cart text-xl"></i>
  {cartCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {cartCount}
    </span>
  )}
</NavLink>
                              
                            </div>
                        </div>

                        {/* Mobile Header */}
                      <div className="md:hidden flex items-center justify-between py-4">
  <button onClick={onToggleMobileMenu} className="text-black hover:text-[#ff6931] transition-colors">
    <i className="fas fa-bars text-xl"></i>
  </button>
  <NavLink to="/" className="text-2xl font-bold"> <img src={logo} alt="Tommalu Logo" className="h-6 w-auto object-fill"/></NavLink>
  <NavLink to="/cart" className="relative">
    <i className="fas fa-shopping-cart text-xl"></i>
    {cartCount > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {cartCount}
      </span>
    )}
  </NavLink>
</div>
                    </div>

                    {/* Mobile Search Bar (Below Header) */}
                  {(location.pathname === '/' || location.pathname === '/search') && (
  <div className="md:hidden px-4 py-3 bg-white shadow-md rounded-b-xl sticky top-16 z-20">
    <div className="relative">
      <input
        type="text"
        placeholder="Search for food or groceries..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-4 pr-12 py-3 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff6931] focus:border-[#ff6a31] placeholder-gray-400 text-gray-800 transition-all duration-200"
      />
      <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#ff6932] transition-colors">
        <i className="fas fa-search text-lg"></i>
      </button>
    </div>

   
  </div>
)}


                </header>
            );
        }
export default Header;