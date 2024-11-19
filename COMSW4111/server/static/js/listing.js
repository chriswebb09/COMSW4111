const { useState, useEffect } = React;

const ListingPage  = (reportDataElems) => {
  const [selectedImage, setSelectedImage] = useState("");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [listingData, setListingData] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const results = reportDataElems;
    printData(results);
  }, [reportDataElems]);

  function printData(reportDataElems) {
    const obj = JSON.parse(JSON.stringify(reportDataElems));
    setListingData(obj["reportDataElems"]);
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/listings/${listingData.listing_id}`, {
        method: 'DELETE',
      });
      console.log(response)
      if (response.ok) {
        window.location.href = '/'; // Redirect to home after deletion
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  return (
      <div className="min-h-[800px] bg-gray-50 pb-20">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="text-sm text-gray-600">
              <a href="/">
                <span className="hover:text-gray-900 cursor-pointer">Home</span>
              </a>
              <span className="mx-2">›</span>
              <a href="/search">
                <span className="hover:text-gray-900 cursor-pointer">Listings</span>
              </a>
              <span className="mx-2">›</span>
              <span className="text-gray-900">{listingData.title}</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                <img src={`/api/get-images/${listingData.list_image}`} alt={listing.title}
                     className="w-full h-96 object-cover"/>
                <div className="p-4 grid grid-cols-4 gap-2">
                  <img src={`/api/get-images/${listingData.list_image}`} alt={listing.title}
                       className="w-full h-40 object-cover"/>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden my-6">
                {(listingData.status == "active" && listingData.your_listing == false) && (
                    <div className="m-6">
                      <a href={`/transaction?listing_id=${listingData.listing_id}`}>
                        <button
                            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 shadow-lg transition duration-200 font-medium">
                          Start Transaction
                        </button>
                      </a>
                    </div>
                )}
                {listingData.status !== "active" && (
                    <div className="m-6">
                      <h2 className="text-xl font-semibold mb-3">Sale status is {listingData.status}</h2>
                    </div>
                )}
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{listingData.title}</h1>
                <div className="flex items-center justify-between mb-6">
                  <div className="text-2xl font-bold text-blue-600">
                    ${listingData.price?.toFixed(2)}
                  </div>
                  <div className="text-gray-500 text-sm">
                    Listed on {new Date(listingData.t_created).toLocaleDateString()}
                  </div>
                </div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {listingData.description}
                  </p>
                </div>
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
                <div>
                  <h2 className="text-xl font-semibold mb-3">Location</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div
                        className="w-20 h-20 bg-blue-100 rounded-full text-center flex items-center text-blue-600 font-bold text-xl">
                      {listingData.seller_name}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold">{listingData.seller_name}</h3>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {listingData.your_listing == false && (
                      <button onClick={() => setIsContactModalOpen(true)}
                              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium">
                        Contact Seller
                      </button>
                  )}
                  {listingData.your_listing == false && (
                      <button
                          className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition duration-200 font-medium">
                        Save to Favorites
                      </button>
                  )}
                  {listingData.your_listing && (
                      <button onClick={() => setShowDeleteConfirm(true)}
                              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition duration-200 font-medium">
                        Delete Listing
                      </button>
                  )}
                </div>
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
        {isContactModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-xl font-semibold mb-4">Contact Seller</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Your Name" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  <input type="email" placeholder="Your Email" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  <textarea placeholder="Your Message" rows="4" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                  <div className="flex justify-end space-x-3">
                    <button onClick={() => setIsContactModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
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