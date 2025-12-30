'use client';

import { useEffect, useState } from 'react';
import { useProducts, useCategories } from '@/hooks/api';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { STORE_CATEGORY_MAPPING, MENU_CATEGORIES } from '@/config/categories.config';

export default function BrowsePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial values from URL params
  const initialCategory = searchParams?.get('category') || '';
  const initialType = searchParams?.get('type') || '';
  const initialSearch = searchParams?.get('search') || '';
  const initialPage = parseInt(searchParams?.get('page') || '1', 10);
  const initialSortBy = searchParams?.get('sortBy') || 'name';
  const initialSortOrder = (searchParams?.get('sortOrder') || 'asc') as 'asc' | 'desc';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedFoodType, setSelectedFoodType] = useState<string>(initialType);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // This helps us track if the user has explicitly started searching/browsing
  const hasActiveFilters = !!(selectedCategory || selectedFoodType || searchQuery);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const [showFilters, setShowFilters] = useState(false);

  // CATEGORY DATA with Icons
  const MENU_CATEGORY_DETAILS: Record<string, { emoji: string; color: string }> = {
    'Veg Main Course': { emoji: '🥗', color: 'bg-green-50 text-green-700' },
    'Non-Veg Main Course': { emoji: '🍗', color: 'bg-orange-50 text-orange-700' },
    'Starters & Snacks': { emoji: '🍟', color: 'bg-yellow-50 text-yellow-700' },
    'Breads & Rice': { emoji: '🥖', color: 'bg-stone-50 text-stone-700' },
    'Drinks & Beverages': { emoji: '🥤', color: 'bg-blue-50 text-blue-700' },
    'Dairy & Eggs': { emoji: '🥛', color: 'bg-cyan-50 text-cyan-700' },
    'Groceries & Essentials': { emoji: '🛒', color: 'bg-emerald-50 text-emerald-700' },
    'Fruits & Vegetables': { emoji: '🍎', color: 'bg-red-50 text-red-700' },
    'Sweets & Desserts': { emoji: '🧁', color: 'bg-pink-50 text-pink-700' },
    'Fast Food': { emoji: '🍔', color: 'bg-orange-100 text-orange-800' },
    'Bakery Items': { emoji: '🥐', color: 'bg-amber-50 text-amber-700' },
    'Grains & Pulses': { emoji: '🌾', color: 'bg-lime-50 text-lime-700' },
    'Meat & Seafood': { emoji: '🍤', color: 'bg-red-100 text-red-800' },
    'Combo': { emoji: '🍱', color: 'bg-purple-50 text-purple-700' },
    'Other': { emoji: '📦', color: 'bg-gray-50 text-gray-700' },
  };

  const { data: categoriesData } = useCategories();
  const allCategories = categoriesData?.data || [];

  // Only fetch products if we are actually browsing (filters active)
  const { data: productsData, isLoading, isError } = useProducts({
    category: selectedCategory || undefined,
    foodType: selectedFoodType || undefined,
    search: searchQuery || undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: 20,
    available: 'true',
  }, hasActiveFilters);

  const products = productsData?.data || [];
  const pagination = productsData?.pagination;

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedFoodType) params.set('type', selectedFoodType);
    if (searchQuery) params.set('search', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (sortBy !== 'name') params.set('sortBy', sortBy);
    if (sortOrder !== 'asc') params.set('sortOrder', sortOrder);

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    const currentSearch = window.location.search || '';
    const newSearch = queryString ? `?${queryString}` : '';

    if (currentSearch !== newSearch) {
      // Using replace to avoid clogging history
      router.replace(newUrl || '', { scroll: false });
    }
  }, [selectedCategory, selectedFoodType, searchQuery, currentPage, sortBy, sortOrder]);

  // Sync state with URL params on mount/change
  useEffect(() => {
    const category = searchParams?.get('category') || '';
    const type = searchParams?.get('type') || '';
    const search = searchParams?.get('search') || '';
    const page = parseInt(searchParams?.get('page') || '1', 10);
    const sort = searchParams?.get('sortBy') || 'name';
    const order = (searchParams?.get('sortOrder') || 'asc') as 'asc' | 'desc';

    if (category !== selectedCategory) setSelectedCategory(category);
    if (type !== selectedFoodType) setSelectedFoodType(type);
    if (search !== searchQuery) setSearchQuery(search);
    if (page !== currentPage) setCurrentPage(page);
    if (sort !== sortBy) setSortBy(sort);
    if (order !== sortOrder) setSortOrder(order);
  }, [searchParams]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setCurrentPage(1);
    setSearchQuery(''); // Clear search on category select for cleaner view
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedFoodType('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">

        {/* Search Header */}
        <div className="mb-10 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">
              {hasActiveFilters ? "Search Results" : "What are you looking for?"}
            </h1>
            <p className="text-stone-500">
              {hasActiveFilters ? "Find exactly what you need" : "Explore our wide range of categories"}
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for biryani, cake, or groceries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-full shadow-sm border-stone-200 focus:border-orange-500 focus:ring-orange-500 text-lg bg-white"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-transparent"
              >
                <X className="w-5 h-5 text-stone-400" />
              </Button>
            )}
          </form>
        </div>

        {/* View Switcher: Categories vs Products */}
        {!hasActiveFilters ? (
          // CATEGORY GRID View
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {MENU_CATEGORIES.map((category) => {
              const details = MENU_CATEGORY_DETAILS[category] || { emoji: '🍽️', color: 'bg-gray-50' };
              return (
                <div
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`
                             group cursor-pointer rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center
                             transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-transparent hover:border-stone-100
                             bg-white shadow-sm
                           `}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${details.color} bg-opacity-50 group-hover:scale-110 transition-transform`}>
                    {details.emoji}
                  </div>
                  <span className="font-semibold text-stone-700 group-hover:text-orange-600">
                    {category}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          // PRODUCT LIST View
          <>
            {/* Active Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-stone-100">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-stone-500 hover:text-stone-900">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to Categories
                </Button>
                <div className="h-6 w-px bg-stone-200 mx-2" />

                {selectedCategory && (
                  <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
                    {MENU_CATEGORY_DETAILS[selectedCategory]?.emoji} {selectedCategory}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
                  </div>
                )}

                {/* Food Type Toggles */}
                <div className="flex items-center gap-1 sm:ml-4">
                  {['veg', 'non-veg'].map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedFoodType(selectedFoodType === type ? '' : type)}
                      className={`
                                        px-3 py-1 rounded-full text-xs font-bold border transition-colors
                                        ${selectedFoodType === type
                          ? (type === 'veg' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200')
                          : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'}
                                    `}
                    >
                      {type === 'veg' ? 'VEG' : 'NON-VEG'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorting */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border-stone-200 rounded-lg focus:ring-orange-500 focus:border-orange-500 bg-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Spinner size="lg" />
                <p className="mt-4 text-stone-500 animate-pulse">Finding best items for you...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <p className="text-red-500 mb-4">Something went wrong while loading products.</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-stone-300" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-1">No products found</h3>
                <p className="text-stone-500">
                  Try changing your filters or search term.
                </p>
                <Button variant="link" onClick={clearFilters} className="mt-2 text-orange-600">
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isStoreOpen={product.isStoreOpen}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm font-medium text-stone-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage === pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
