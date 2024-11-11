const { useState, useEffect } = React;

const ListingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');
   const [listingsData, setListingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
    fetchListingData();
  }, []);
      const fetchListingData = async () => {
    try {
      const response = await fetch('/api/listing/search');
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      console.log(data);
      setListingsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  // Filter and sort functions
  const filteredListings = listingsData.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = priceRange === 'all' ||
                        (priceRange === 'under1000' && listing.price < 1000) ||
                        (priceRange === '1000to2000' && listing.price >= 1000 && listing.price <= 2000) ||
                        (priceRange === 'over2000' && listing.price > 2000);
    return matchesSearch && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.t_created) - new Date(a.t_created);
    if (sortBy === 'oldest') return new Date(a.t_created) - new Date(b.t_created);
    if (sortBy === 'priceLow') return a.price - b.price;
    if (sortBy === 'priceHigh') return b.price - a.price;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Property Listings</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search listings..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-gray-400">
              🔍
            </span>
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <select
              className="bg-white rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>

            <select
              className="bg-white rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            >
              <option value="all">All Prices</option>
              <option value="under1000">Under $1,000</option>
              <option value="1000to2000">$1,000 - $2,000</option>
              <option value="over2000">Over $2,000</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <div key={listing.listing_id} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-200 hover:scale-105">
              <img
                src={listing.list_image}
                alt={listing.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{listing.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>

                <div className="space-y-3">
                  {/* Price */}
                  <div className="flex items-center text-gray-900">
                    <span className="font-bold text-lg">
                      ${listing.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="text-gray-500 text-sm">
                    Listed on {new Date(listing.t_created).toLocaleDateString()}
                  </div>

                  {/* Tags */}
                  {listing.meta_tag && (
                    <div className="flex flex-wrap gap-2">
                      {listing.meta_tag.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <a href={`listing/${listing.listing_id}`} className="w-full">
                  <button
                      className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium">
                    View Details
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredListings.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow mt-6">
            <p className="text-gray-500 text-lg">No listings found matching your criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setPriceRange('all');
                setSortBy('newest');
              }}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};



const domContainer = document.querySelector('#root');
ReactDOM.render(<ListingsPage />, domContainer);
