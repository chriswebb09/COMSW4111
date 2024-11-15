const { useState, useEffect } = React;

const FormInput = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...props}
        />
    </div>
);

const ProfileForm = ({ formData, isEditing, onInputChange, onSubmit }) => (
    <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={onInputChange}
                disabled={!isEditing}
            />
            <FormInput
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={onInputChange}
                disabled={!isEditing}
            />
            <FormInput
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={onInputChange}
                disabled={!isEditing}
            />
            <FormInput
                label="Phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={onInputChange}
                disabled={!isEditing}
            />
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                </label>
                <textarea
                    name="address"
                    value={formData.address}
                    onChange={onInputChange}
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Save Changes
                </button>
            </div>
        )}
    </form>
);

// Security Form Component
const SecurityForm = ({ passwordData, error, onPasswordChange, onSubmit, onCancel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
        <FormInput
            label="Current Password"
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={onPasswordChange}
            placeholder="Enter current password"
        />
        <FormInput
            label="New Password"
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={onPasswordChange}
            placeholder="Enter new password"
        />
        <FormInput
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={onPasswordChange}
            placeholder="Confirm new password"
        />
        {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
            </div>
        )}
        <div className="flex justify-end space-x-4">
            <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-800"
            >
                Cancel
            </button>
            <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Update Password
            </button>
        </div>
    </form>
);


const AccountPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [userData, setUserData] = useState(null);
    const [buyerData] = useState(null);
    const [sellerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
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

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/account/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to update profile');

            setShowToast(true);
            setToastMessage('Profile updated successfully');
            setTimeout(() => setShowToast(false), 3000);
            await fetchUserData();
        } catch (err) {
            setShowToast(true);
            setToastMessage('Failed to update profile');
            setTimeout(() => setShowToast(false), 3000);
        }
        setIsEditing(false);
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;
    if (!userData) return null;

    return (
        <div className="min-h-[670px] bg-gray-50">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-5">
                    <div className="flex items-center justify-between">
                        <h1 className="text2xl font-bold text-gray-900">Account Settings</h1>
                        <div className="text-sm text-gray-500">
                            Member since {new Date(userData.t_created).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-64">
                        <div className="bg-white rounded-lg shadow p-4 rounded-lg">
                            <nav className="space-y-2">
                                {[
                                    { id: 'profile', label: 'Profile' },
                                    { id: 'payment', label: 'Payment Methods' },
                                    { id: 'security', label: 'Security' },
                                    userData.roles.is_seller && { id: 'seller', label: 'Seller Dashboard' },
                                    userData.roles.is_buyer && { id: 'buyer', label: 'Buyer Dashboard' }
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

                    <div className="flex-1">
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-lg shadow p-14 mb-10">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold">Profile Information</h2>
                                    <button onClick={() => setIsEditing(!isEditing)} className="text-blue-600 hover:text-blue-700">
                                        {isEditing ? 'Cancel' : 'Edit'}
                                    </button>
                                </div>

                                <ProfileForm
                                    formData={formData}
                                    isEditing={isEditing}
                                    onInputChange={handleInputChange}
                                    onSubmit={handleProfileSubmit}
                                />
                            </div>
                        )}
                        {activeTab === 'payment' && <PaymentMethodsTab />}

                        {activeTab === 'security' && (
                            <div className="bg-white rounded-lg shadow p-10">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold">Security Information</h2>
                                    <button onClick={() => setIsEditing(!isEditing)} className="text-blue-600 hover:text-blue-700">
                                        {isEditing ? 'Cancel' : 'Edit'}
                                    </button>
                                </div>
                                {isEditing ? (
                                    <SecurityForm
                                        passwordData={passwordData}
                                        error={error}
                                        onPasswordChange={handlePasswordChange}
                                        onSubmit={handlePasswordSubmit}
                                        onCancel={() => setIsEditing(false)}
                                    />
                                ) : (
                                    <div className="text-gray-600">
                                        <p>Your password was last changed on: {new Date().toLocaleDateString()}</p>
                                        <p className="mt-2">Click "Change Password" to update your password.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'seller' && (
                            <div className="bg-white rounded-lg shadow p-10 mb-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold">Seller Dashboard</h2>
                                </div>
                                <SellerDashboard sellerData={sellerData} />
                            </div>
                        )}
                        {activeTab === 'buyer' && (
                            <div className="bg-white rounded-lg shadow p-10 mb-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold">Buyer Dashboard</h2>
                                </div>
                                <BuyerDashboard buyerData={buyerData} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showToast && (
                <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

const domContainer = document.querySelector('#root');
ReactDOM.render(<AccountPage />, domContainer);