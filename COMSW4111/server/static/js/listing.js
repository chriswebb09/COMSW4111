const { useState, useEffect } = React;

const ListingPage  = (reportDataElems) => {
  const [selectedImage, setSelectedImage] = useState("");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [listingData, setListingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const results = reportDataElems;
    printData(results);
  }, [reportDataElems]);

  function printData(reportDataElems) {
    const obj = JSON.parse(JSON.stringify(reportDataElems));
    setListingData(obj["reportDataElems"]);
  }

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
              <span className="text-gray-900">{listingData.title}</span>
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
                    src="../static/img/placeholder.png"
                    alt={listing.title}
                    className="w-full h-96 object-cover"
                />
                {/* Thumbnail Gallery */}
                <div className="p-4 grid grid-cols-4 gap-2">
                  <img
                      src="../static/img/placeholder.png"
                      alt="Main view"
                      onClick={() => setSelectedImage("../static/img/placeholder.png")}
                      className={`w-full h-24 object-cover rounded cursor-pointer ${
                          selectedImage === listingData.list_image ? 'ring-2 ring-blue-500' : ''
                      }`}
                  />
                  {/*{listingData.additionalImages.map((img, index) => (*/}
                  {/*  <img*/}
                  {/*    key={index}*/}
                  {/*    src={img}*/}
                  {/*    alt={`View ${index + 1}`}*/}
                  {/*    onClick={() => setSelectedImage(img)}*/}
                  {/*    className={`w-full h-24 object-cover rounded cursor-pointer ${*/}
                  {/*      selectedImage === img ? 'ring-2 ring-blue-500' : ''*/}
                  {/*    }`}*/}
                  {/*  />*/}
                  {/*))}*/}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden my-6">
                <div className="m-6">
                  <a href="/transaction">
                    <button
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 shadow-lg transition duration-200 font-medium">
                      Start Transaction
                    </button>
                  </a>
                </div>
              </div>

              {/* Property Details */}


              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{listingData.title}</h1>
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-2xl font-bold text-blue-600">
                      {/*{listingData}*/}
                      ${listingData.price?.toFixed(2)}
                    </div>
                    <div className="text-gray-500 text-sm">
                      Listed on {new Date(listingData.t_created).toLocaleDateString()}
                    </div>
                  </div>


                  {/* Description */}
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Description</h2>
                    <p className="text-gray-700 whitespace-pre-line">
                      {listingData.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Features</h2>
                    <div className="flex flex-wrap gap-2">
                      {listingData.meta_tag && (
                          <div className="flex flex-wrap gap-2">
                            {listingData.meta_tag.split(',').map((tag, index) => (
                                <span key={index}
                                      className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                                  {tag.trim().replace("[", "").replace("]", "").replace('"', "").replace('"', "")}
                                </span>
                            ))}
                          </div>
                      )}
                    </div>
                  </div>
                  {/* Location */}
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Location</h2>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">
                        {/*{listingData.location.address}<br />*/}
                        {/*{listingData.location.city}, {listingData.location.state} {listingData.location.zip}*/}
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
                      <div
                          className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                        {/*{listingData.seller.name.charAt(0)}*/}
                      </div>
                      <div className="ml-3">
                        {/*<h3 className="font-semibold">s{listingData.seller.name}</h3>*/}
                        <div className="text-sm text-gray-500">
                          {/*★ {listingData.seller.rating} · {listingData.seller.listings} listings*/}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {/*Typically responds {listingData.seller.responseTime}*/}
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
                    <button
                        className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition duration-200 font-medium">
                      Save to Favorites
                    </button>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      <div className="mb-2">Listing ID: {listingData.listing_id}</div>
                      <div>Last updated: {new Date(listingData.t_last_edit).toLocaleDateString()}</div>
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