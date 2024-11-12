const {useState, useEffect} = React;

const PaymentMethodsList = ({paymentMethods, onDelete}) => {
    const getLastFourDigits = (number) => {
        console.log(number);
        if (!number) return '****';
        return number.slice(-4);
    };

    const formatExpiryDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {month: '2-digit', year: 'numeric'});
    };

    return (
        <div className="space-y-4">
            {paymentMethods && paymentMethods.length > 0 ? (
                paymentMethods.map((method) => (
                    <div
                        key={method.account_id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                        <div className="flex items-center space-x-4">
                            <div className={`text-md ${method.account_type === 'credit_card' ? 'text-grey-600' : 'text-black'}`}>
                                {method.account_type}
                            </div>

                            <div>
                                <div className="font-medium">
                                    {method.account_type === 'credit_card' ? (
                                        `Credit Card ending in ${getLastFourDigits(method.details?.cc_num)}`
                                    ) : (
                                        `Bank Account ending in ${getLastFourDigits(method.details?.bank_acc_num)}`
                                    )}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {method.account_type === 'credit_card' ? (
                                        `Expires: ${formatExpiryDate(method.details?.exp_date)}`
                                    ) : (
                                        `Routing: ****${getLastFourDigits(method.details?.routing_num)}`
                                    )}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {method.billing_address}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => onDelete(method.account_id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                            aria-label="Delete payment method"
                        >
                            ✕
                        </button>
                    </div>
                ))
            ) : (
                <div className="text-center py-6 text-gray-500">
                    No payment methods added yet.
                </div>
            )}
        </div>
    );
};

// PaymentForm sub-component
const PaymentForm = ({onSubmit, onCancel}) => {
    const [formData, setFormData] = useState({
        account_type: 'credit_card',
        billing_address: '',
        cc_num: '',
        exp_date: '',
        bank_acc_num: '',
        routing_num: ''
    });

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const paymentData = {
            account_type: formData.account_type,
            billing_address: formData.billing_address
        };

        if (formData.account_type === 'credit_card') {
            paymentData.cc_num = formData.cc_num;
            paymentData.exp_date = formData.exp_date;
        } else {
            paymentData.bank_acc_num = formData.bank_acc_num;
            paymentData.routing_num = formData.routing_num;
        }

        try {
            const response = await fetch('/api/account/payment-methods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                throw new Error('Failed to add payment method');
            }

            const result = await response.json();
            // onSubmit(result);
        } catch (error) {
            console.error('Error adding payment method:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Type
                </label>
                <select
                    name="account_type"
                    value={formData.account_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                >
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_account">Bank Account</option>
                </select>
            </div>

            {formData.account_type === 'credit_card' ? (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number
                        </label>
                        <input
                            type="text"
                            name="cc_num"
                            value={formData.cc_num}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="**** **** **** ****"
                            maxLength="16"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date
                        </label>
                        <input
                            type="date"
                            name="exp_date"
                            value={formData.exp_date}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Number
                        </label>
                        <input
                            type="text"
                            name="bank_acc_num"
                            value={formData.bank_acc_num}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Enter account number"
                            maxLength="30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Routing Number
                        </label>
                        <input
                            type="text"
                            name="routing_num"
                            value={formData.routing_num}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Enter routing number"
                            maxLength="50"
                        />
                    </div>
                </>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Address
                </label>
                <textarea
                    name="billing_address"
                    value={formData.billing_address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter billing address"
                    required
                />
            </div>

            <div className="pt-4 flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-800"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Save Payment Method
                </button>
            </div>
        </form>
    );
};

// Main PaymentMethodsTab component
const PaymentMethodsTab = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/account/payment-methods');
            if (!response.ok) throw new Error('Failed to fetch payment methods');
            const data = await response.json();
            setPaymentMethods(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePaymentMethod = async (accountId) => {
        try {
            const response = await fetch(`/api/account/payment-methods/${accountId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete payment method');
            }
            fetchPaymentMethods();
        } catch (err) {
            setError(err.message);
        }
    };

    const handlePaymentMethodAdded = () => {
        setIsEditing(false);
        fetchPaymentMethods();
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    if (loading) return <div className="flex justify-center py-6">Loading...</div>;
    if (error) return <div className="text-red-600 py-6">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Payment Methods</h2>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-blue-600 hover:text-blue-700"
                >
                    {isEditing ? 'Cancel' : 'Add Payment Method'}
                </button>
            </div>

            {isEditing ? (
                <PaymentForm
                    onSubmit={handlePaymentMethodAdded}
                    onCancel={() => setIsEditing(false)}
                />
            ) : (
                <PaymentMethodsList
                    paymentMethods={paymentMethods}
                    onDelete={handleDeletePaymentMethod}
                />
            )}
        </div>
    );
};
