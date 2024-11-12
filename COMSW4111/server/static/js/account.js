const { useState, useEffect } = React;
const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [accountsData, setAccountsData] = useState(null);
  const [buyerData, setBuyerData] = useState(null);
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [paymentType, setPaymentType] = useState(null);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [paymentFormData, setPaymentFormData] = useState({
    type: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    accountNumber: '',
    routingNumber: '',
    billingAddress: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchBuyerSeller = async () => {
    await fetchSellerStatus();
    await fetchPaymentData();
    await fetchAccountsData();
    await fetchBuyerStatus();
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    try {
      const response = await fetch('/api/account/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

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

  const fetchAccountsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/account');
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      setAccountsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuyerStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/account/buyer_status');
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      setBuyerData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/account/payment-methods');
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      setPaymentFormData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/account/seller_status');
      if (!response.ok) throw new Error('Failed to fetch seller status');
      const data = await response.json();
      setSellerData(data);
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

  const addPaymentMethod = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/account/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentFormData)
      });

      const result = await response.json();
      if (!result.ok) throw new Error('Failed to add payment method');
      showToastMessage('Payment method added successfully');
      // paymentFormData.clear();
      setIsAddingPayment(false);
      await fetchUserData();
    } catch (err) {
      showToastMessage('Failed to add payment method', 'error');
    }
  };

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
              {activeTab === 'payment' && <PaymentMethodsTab />}
              {/*{activeTab === 'payment' && (*/}
              {/*    <div className="bg-white rounded-lg shadow p-6">*/}
              {/*      <div className="flex justify-between items-center mb-6">*/}
              {/*        <h2 className="text-xl font-semibold">Payment Methods</h2>*/}
              {/*        <button*/}
              {/*            onClick={() => setIsEditing(!isEditing)}*/}
              {/*            className="text-blue-600 hover:text-blue-700"*/}
              {/*        >*/}
              {/*          {isEditing ? 'Cancel' : 'Add Payment Method'}*/}
              {/*        </button>*/}
              {/*      </div>*/}

              {/*      {!isEditing ? (*/}
              {/*          <div className="space-y-4">*/}
              {/*            /!* View existing payment methods *!/*/}
              {/*          </div>*/}
              {/*      ) : (*/}
              {/*          <form onSubmit={addPaymentMethod} className="space-y-4">*/}
              {/*            <div>*/}
              {/*              <label className="block text-sm font-medium text-gray-700 mb-1">*/}
              {/*                Payment Type*/}
              {/*              </label>*/}
              {/*              <select*/}
              {/*                  name="account_type"*/}
              {/*                  value={paymentFormData.account_type}*/}
              {/*                  onChange={handlePaymentInputChange}*/}
              {/*                  className="w-full px-3 py-2 border rounded-lg"*/}
              {/*              >*/}
              {/*                <option value="credit_card">Credit Card</option>*/}
              {/*                <option value="bank_account">Bank Account</option>*/}
              {/*              </select>*/}
              {/*            </div>*/}

              {/*            {paymentFormData.account_type === 'credit_card' ? (*/}
              {/*                <>*/}
              {/*                  <div>*/}
              {/*                    <label className="block text-sm font-medium text-gray-700 mb-1">*/}
              {/*                      Card Number*/}
              {/*                    </label>*/}
              {/*                    <input*/}
              {/*                        type="text"*/}
              {/*                        name="cc_num"*/}
              {/*                        value={paymentFormData.cc_num || ''}*/}
              {/*                        onChange={handlePaymentInputChange}*/}
              {/*                        className="w-full px-3 py-2 border rounded-lg"*/}
              {/*                        placeholder="**** **** **** ****"*/}
              {/*                        maxLength="16"*/}
              {/*                    />*/}
              {/*                  </div>*/}
              {/*                  <div>*/}
              {/*                    <label className="block text-sm font-medium text-gray-700 mb-1">*/}
              {/*                      Expiry Date*/}
              {/*                    </label>*/}
              {/*                    <input*/}
              {/*                        type="date"*/}
              {/*                        name="exp_date"*/}
              {/*                        value={paymentFormData.exp_date || ''}*/}
              {/*                        onChange={handlePaymentInputChange}*/}
              {/*                        className="w-full px-3 py-2 border rounded-lg"*/}
              {/*                        min={new Date().toISOString().split('T')[0]}*/}
              {/*                    />*/}
              {/*                  </div>*/}
              {/*                </>*/}
              {/*            ) : (*/}
              {/*                <>*/}
              {/*                  <div>*/}
              {/*                    <label className="block text-sm font-medium text-gray-700 mb-1">*/}
              {/*                      Account Number*/}
              {/*                    </label>*/}
              {/*                    <input*/}
              {/*                        type="text"*/}
              {/*                        name="bank_acc_num"*/}
              {/*                        value={paymentFormData.bank_acc_num || ''}*/}
              {/*                        onChange={handlePaymentInputChange}*/}
              {/*                        className="w-full px-3 py-2 border rounded-lg"*/}
              {/*                        placeholder="Enter account number"*/}
              {/*                        maxLength="30"*/}
              {/*                    />*/}
              {/*                  </div>*/}
              {/*                  <div>*/}
              {/*                    <label className="block text-sm font-medium text-gray-700 mb-1">*/}
              {/*                      Routing Number*/}
              {/*                    </label>*/}
              {/*                    <input*/}
              {/*                        type="text"*/}
              {/*                        name="routing_num"*/}
              {/*                        value={paymentFormData.routing_num || ''}*/}
              {/*                        onChange={handlePaymentInputChange}*/}
              {/*                        className="w-full px-3 py-2 border rounded-lg"*/}
              {/*                        placeholder="Enter routing number"*/}
              {/*                        maxLength="50"*/}
              {/*                    />*/}
              {/*                  </div>*/}
              {/*                </>*/}
              {/*            )}*/}

              {/*            <div>*/}
              {/*              <label className="block text-sm font-medium text-gray-700 mb-1">*/}
              {/*                Billing Address*/}
              {/*              </label>*/}
              {/*              <textarea*/}
              {/*                  name="billing_address"*/}
              {/*                  value={paymentFormData.billing_address || ''}*/}
              {/*                  onChange={handlePaymentInputChange}*/}
              {/*                  rows="3"*/}
              {/*                  className="w-full px-3 py-2 border rounded-lg"*/}
              {/*                  placeholder="Enter billing address"*/}
              {/*                  required*/}
              {/*              />*/}
              {/*            </div>*/}

              {/*            <div className="pt-4 flex justify-end space-x-4">*/}
              {/*              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-gray-700 hover:text-gray-800">*/}
              {/*                Cancel*/}
              {/*              </button>*/}
              {/*              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">*/}
              {/*                Save Changes*/}
              {/*              </button>*/}
              {/*            </div>*/}
              {/*          </form>*/}
              {/*      )}*/}
              {/*    </div>*/}
              {/*)}*/}

              {activeTab === 'security' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Security Information</h2>
                      <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="text-blue-600 hover:text-blue-700"
                      >
                        {isEditing ? 'Cancel' : 'Edit'}
                      </button>
                    </div>
                    {isEditing ? (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Current Password
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter current password"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter new password"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Confirm new password"
                            />
                          </div>

                          {error && (
                              <div className="text-red-600 text-sm">
                                {error}
                              </div>
                          )}

                          {success && (
                              <div className="text-green-600 text-sm">
                                Password successfully updated!
                              </div>
                          )}

                          <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              Update Password
                            </button>
                          </div>
                        </form>
                    ) : (
                        <div className="text-gray-600">
                          <p>Your password was last changed on: {new Date().toLocaleDateString()}</p>
                          <p className="mt-2">Click "Change Password" to update your password.</p>
                        </div>
                    )}
                  </div>
              )}
              {activeTab === 'seller' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Seller Dashboard</h2>
                    </div>
                  </div>
              )}
              {activeTab === 'buyer' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Buyer Dashboard</h2>
                    </div>
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
ReactDOM.render(<AccountPage/>, domContainer);