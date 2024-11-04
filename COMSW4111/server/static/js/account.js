const { useState, useEffect } = React;

const sampleUserData = {
  user: {
    user_id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    address: "123 Main St, Apt 4B",
    phone_number: "1234567890",
    t_created: "2024-01-01T00:00:00",
    t_last_act: "2024-03-15T14:30:00",
    acc_status: "active"
  },
  accounts: [
    {
      account_id: 1,
      account_type: "bank_account",
      billing_address: "123 Main St, Apt 4B",
      bank_account: {
        bank_acc_num: "****4321",
        routing_num: "****5678"
      }
    },
    {
      account_id: 2,
      account_type: "credit_card",
      billing_address: "123 Main St, Apt 4B",
      credit_card: {
        cc_num: "****9876",
        exp_date: "12/25"
      }
    }
  ],
  roles: {
    seller: {
      seller_id: 1,
      listings: 5,
      total_sales: 10,
      rating: 4.8
    },
    buyer: {
      buyer_id: 1,
      purchases: 3,
      saved_listings: 8
    },
    admin: null
  }
};

const AccountPage = () => {
  // Main State
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [paymentType, setPaymentType] = useState('credit_card');
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });

  // Payment Form State
  const [paymentFormData, setPaymentFormData] = useState({
    type: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    accountNumber: '',
    routingNumber: '',
    billingAddress: ''
  });

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Update form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        phone: userData.phone_number,
        address: userData.address
      });
    }
  }, [userData]);

  // API Calls
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/account/profile');
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      showToastMessage('Profile updated successfully');
      await fetchUserData();
    } catch (err) {
      showToastMessage('Failed to update profile', 'error');
    }
  };

  const addPaymentMethod = async (paymentData) => {
    try {
      const response = await fetch('/api/account/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) throw new Error('Failed to add payment method');

      showToastMessage('Payment method added successfully');
      setIsAddingPayment(false);
      await fetchUserData();
    } catch (err) {
      showToastMessage('Failed to add payment method', 'error');
    }
  };

  // Event Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
    setIsEditing(false);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    await addPaymentMethod(paymentFormData);
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <div className="text-sm text-gray-500">
              Member since {new Date(userData.t_created).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64">
            <div className="bg-white rounded-lg shadow p-4">
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile' },
                  { id: 'payment', label: 'Payment Methods' },
                  { id: 'security', label: 'Security' },
                  userData.roles.is_seller && { id: 'seller', label: 'Seller Dashboard' },
                  userData.roles.is_buyer && { id: 'buyer', label: 'Buyer Activity' }
                ].filter(Boolean).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full px-4 py-2 text-left rounded-lg ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Profile Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                <form onSubmit={handleProfileSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows="3"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  {isEditing && (
                    <div className="mt-6 flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Add other tabs here */}
          </div>
        </div>
      </div>

      {/* Toast Message */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

const domContainer = document.querySelector('#root');
ReactDOM.render(<AccountPage userData={}/>, domContainer);