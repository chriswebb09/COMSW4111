const { useState, useEffect } = React;

// Sample data matching the Listing model

const sampleListing = {
  listing_id: 1,
  seller_id: 101,
  title: "Modern Apartment in Downtown",
  description: "Beautiful 2-bedroom apartment featuring stunning city views, modern appliances, and an open floor plan. This recently renovated space includes hardwood floors throughout, a gourmet kitchen with stainless steel appliances, and a spacious master suite. The building offers 24/7 security, a fitness center, and a rooftop terrace.\n\nAmenities include:\n- In-unit washer and dryer\n- Central air conditioning\n- Underground parking\n- Pet-friendly\n- Storage unit included",
  price: 2500.00,
  list_image: "/api/placeholder/800/500",
  location_id: 1,
  meta_tag: "apartment, downtown, modern, luxury, pet-friendly",
  t_created: "2024-03-01T12:00:00",
  t_last_edit: "2024-03-01T14:30:00",
  // Additional sample data for the page
  seller: {
    name: "John Smith",
    rating: 4.8,
    responseTime: "within 1 hour",
    listings: 15
  },
  location: {
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zip: "10001"
  },
  additionalImages: [
    "/api/placeholder/400/300",
    "/api/placeholder/400/300",
    "/api/placeholder/400/300",
    "/api/placeholder/400/300"
  ]
};

const ListingPage = () => {
  const [selectedImage, setSelectedImage] = useState(sampleListing.list_image);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="text-sm text-gray-600">
            <span className="hover:text-gray-900 cursor-pointer">Home</span>
            <span className="mx-2">›</span>
            <span className="hover:text-gray-900 cursor-pointer">Listings</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{sampleListing.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
              <img
                src={selectedImage}
                alt={sampleListing.title}
                className="w-full h-96 object-cover"
              />
              {/* Thumbnail Gallery */}
              <div className="p-4 grid grid-cols-4 gap-2">
                <img
                  src={sampleListing.list_image}
                  alt="Main view"
                  onClick={() => setSelectedImage(sampleListing.list_image)}
                  className={`w-full h-24 object-cover rounded cursor-pointer ${
                    selectedImage === sampleListing.list_image ? 'ring-2 ring-blue-500' : ''
                  }`}
                />
                {sampleListing.additionalImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`View ${index + 1}`}
                    onClick={() => setSelectedImage(img)}
                    className={`w-full h-24 object-cover rounded cursor-pointer ${
                      selectedImage === img ? 'ring-2 ring-blue-500' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{sampleListing.title}</h1>
              <div className="flex items-center justify-between mb-6">
                <div className="text-2xl font-bold text-blue-600">
                  ${sampleListing.price.toFixed(2)}/month
                </div>
                <div className="text-gray-500 text-sm">
                  Listed on {new Date(sampleListing.t_created).toLocaleDateString()}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {sampleListing.description}
                </p>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {sampleListing.meta_tag.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Location</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    {sampleListing.location.address}<br />
                    {sampleListing.location.city}, {sampleListing.location.state} {sampleListing.location.zip}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Seller Info & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              {/* Seller Information */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                    {sampleListing.seller.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold">{sampleListing.seller.name}</h3>
                    <div className="text-sm text-gray-500">
                      ★ {sampleListing.seller.rating} · {sampleListing.seller.listings} listings
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Typically responds {sampleListing.seller.responseTime}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                >
                  Contact Seller
                </button>
                <button className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition duration-200 font-medium">
                  Save to Favorites
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <div className="mb-2">Listing ID: {sampleListing.listing_id}</div>
                  <div>Last updated: {new Date(sampleListing.t_last_edit).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Contact Seller</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Your Message"
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const domContainer = document.querySelector('#root');
ReactDOM.render(<ListingPage/>, domContainer);