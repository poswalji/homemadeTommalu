'use client';

import { useEffect, useState } from 'react';
import { useProducts, useCategories } from '@/hooks/api';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function CustomerDashboard() {
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
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const [showFilters, setShowFilters] = useState(false);

  const { data: categoriesData } = useCategories();
  const categories: Array<{ name: string }> = categoriesData?.data || [];

  const { data: productsData, isLoading, isError } = useProducts({
    category: selectedCategory || undefined,
    foodType: selectedFoodType || undefined,
    search: searchQuery || undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: 20,
    available: 'true',
  });

  const products = productsData?.data || [];
  const pagination = productsData?.pagination;

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedFoodType) params.set('type', selectedFoodType);
    if (searchQuery) params.set('search', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (sortBy !== 'name') params.set('sortBy', sortBy);
    if (sortOrder !== 'asc') params.set('sortOrder', sortOrder);
    
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname || ''}?${queryString}` : (pathname || '');
    
    // Only update URL if it's different to avoid infinite loops
    const currentSearch = window.location.search || '';
    const newSearch = queryString ? `?${queryString}` : '';
    if (currentSearch !== newSearch && newUrl) {
      router.replace(newUrl, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedFoodType, searchQuery, currentPage, sortBy, sortOrder]);

  // Sync state with URL params on mount or when URL changes
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setCurrentPage(1);
  };

  const handleFoodTypeSelect = (foodType: string) => {
    setSelectedFoodType(foodType === selectedFoodType ? '' : foodType);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleSortByChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const handleSortOrderChange = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedFoodType('');
    setSearchQuery('');
    setCurrentPage(1);
    setSortBy('name');
    setSortOrder('asc');
  };

  const hasActiveFilters = selectedCategory || selectedFoodType || searchQuery;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse Products</h1>
        <p className="text-gray-600 mt-2">Discover and order from your favorite stores</p>
      </div>

      {/* Search and Filters Section */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </form>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategory && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCategory('')}
                className="flex items-center gap-1"
              >
                {selectedCategory}
                <X className="w-3 h-3" />
              </Button>
            )}
            {selectedFoodType && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedFoodType('')}
                className="flex items-center gap-1"
              >
                {selectedFoodType}
                <X className="w-3 h-3" />
              </Button>
            )}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>
        )}

        {/* Expanded Filters */}
        {showFilters && (
          <Card className="p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategorySelect('')}
                  >
                    All
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat.name}
                      variant={selectedCategory === cat.name ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleCategorySelect(cat.name)}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Food Type</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedFoodType === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFoodTypeSelect('')}
                  >
                    All
                  </Button>
                  {['veg', 'non-veg', 'egg', 'vegan'].map((type) => (
                    <Button
                      key={type}
                      variant={selectedFoodType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFoodTypeSelect(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortByChange(e.target.value)}
                    className="border rounded px-3 py-2 flex-1"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSortOrderChange}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="text-center py-20">
          <p className="text-red-500">Error loading products. Please try again.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">No products found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm">
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
    </div>
  );
}
