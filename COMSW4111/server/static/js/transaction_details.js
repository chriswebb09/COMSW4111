
const { useState, useEffect } = React;

const TransactionDetail = ({ transactionId }) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchTransactionDetails().then(r => console.log("Transaction details fetched"));
  }, [transactionId]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/account/transaction/${transactionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transaction details');
      }
      const data = await response.json();
      setTransaction(data);
      setNewStatus(data.status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch('/api/account/transaction/status', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          status: newStatus
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      setTransaction(prev => ({
        ...prev,
        status: newStatus
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading transaction details...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }
  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Transaction not found</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-900">Transaction Details</h1>
              <div className="text-sm text-gray-500">#{transaction.transaction_id}</div>
            </div>
          </div>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} disabled={isUpdating} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <button onClick={handleStatusUpdate} disabled={isUpdating || newStatus === transaction.status} className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
          <div className="px-6 py-4 grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-3">Transaction Information</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Date</div>
                  <div className="text-sm text-gray-900">{transaction.date}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Amount</div>
                  <div className="text-sm text-gray-900">${transaction.total_amount}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Payment Method</div>
                  <div className="text-sm text-gray-900">{transaction.payment_method}</div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-3">Customer Information</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Name</div>
                  <div className="text-sm text-gray-900">{transaction.buyer_name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="text-sm text-gray-900">{transaction.buyer_email}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-200">
            <h2 className="text-sm font-medium text-gray-500 mb-3">Transaction Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="text-sm text-gray-500">Subtotal</div>
                <div className="text-sm text-gray-900">${transaction.agreed_price}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-gray-500">Service Fee</div>
                <div className="text-sm text-gray-900">${transaction.service_fee}</div>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-900">Total</div>
                <div className="text-sm font-medium text-gray-900">${transaction.total_amount}</div>
              </div>
            </div>
          </div>
          {transaction.notes && (
            <div className="px-6 py-4 border-t border-gray-200">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Notes</h2>
              <p className="text-sm text-gray-600">{transaction.notes}</p>
            </div>
          )}
        </div>
        <button onClick={() => window.history.back()} className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Transactions
        </button>
      </div>
    </div>
  );
};
const pathname = window.location.pathname;
const paths = pathname.split("/");
const domContainer = document.querySelector('#root');
ReactDOM.render(<TransactionDetail transactionId={paths.pop()}/>, domContainer);