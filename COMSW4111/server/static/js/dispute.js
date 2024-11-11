const { useState, useEffect } = React;

function DisputePage() {
  const [formData, setFormData] = useState({
    transaction_id: '',
    description: '',
    status: 'unsolved'
  });

  const [dispute, setDispute] = useState({
    dispute_id: '',
    transaction_id: '',
    admin_id: '',
    description: '',
    status: 'unsolved',
    resolution_date: null
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // Fetch user's transactions on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions');
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        setTransactions(data);
      } catch (err) {
        setError('Failed to load transactions');
      }
    };

    fetchTransactions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/dispute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create dispute');
      }

      const data = await response.json();
      setSuccess(true);
      setDispute(data);

      // Reset form after successful submission
      setFormData({
        transaction_id: '',
        description: '',
        status: 'unsolved'
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Dispute</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <p>Dispute created successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Transaction:</label>
          <select
            name="transaction_id"
            value={formData.transaction_id}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a transaction</option>
            {transactions.map(transaction => (
              <option key={transaction.transaction_id} value={transaction.transaction_id}>
                Transaction {transaction.transaction_id} - ${transaction.agreed_price}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded h-32"
            required
            placeholder="Please describe the issue in detail..."
          />
        </div>

        <div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit Dispute
          </button>
        </div>
      </form>

      {success && dispute.dispute_id && (
        <div className="mt-4 p-4 border rounded">
          <h2 className="text-xl font-bold mb-2">Dispute Details</h2>
          <div className="space-y-2">
            <p><span className="font-semibold">Dispute ID:</span> {dispute.dispute_id}</p>
            <p><span className="font-semibold">Transaction ID:</span> {dispute.transaction_id}</p>
            <p><span className="font-semibold">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded ${
                dispute.status === 'solved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {dispute.status}
              </span>
            </p>
            {dispute.admin_id && (
              <p><span className="font-semibold">Assigned Admin:</span> {dispute.admin_id}</p>
            )}
            {dispute.resolution_date && (
              <p><span className="font-semibold">Resolution Date:</span> {dispute.resolution_date}</p>
            )}
            <div>
              <span className="font-semibold">Description:</span>
              <p className="mt-1 p-2 bg-gray-50 rounded">{dispute.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Section - Only shown if user is admin */}
      {dispute.admin_id === 'current_user_admin_id' && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-bold mb-2">Admin Actions</h3>
          <div className="space-y-4">
            <select
              className="w-full p-2 border rounded"
              value={dispute.status}
              onChange={(e) => {
                // Handle status update logic
              }}
            >
              <option value="unsolved">Unsolved</option>
              <option value="solved">Solved</option>
            </select>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={() => {
                // Handle resolution logic
              }}
            >
              Update Dispute Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const domContainer = document.querySelector('#root');
ReactDOM.render(<DisputePage />, domContainer);