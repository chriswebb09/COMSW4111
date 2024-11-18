const { useState, useEffect } = React;

const TransactionPage = (passedListingId) => {
  const [formData, setFormData] = useState({
    listing_id:'',
    agreed_price: '',
    serv_fee: '',
  });

  const [transaction, setTransaction] = useState({
    transaction_id: '',
    buyer_id: '',
    seller_id: '',
    listing_id: '',
    t_date: new Date().toISOString().split('T')[0],
    agreed_price: '',
    serv_fee: '',
    status: 'pending'
  });

  const loadDataOnlyOnce = (listingId) => {
     setFormData(prevState => ({
      ...prevState,
      listing_id: listingId
    }));
     setTransaction(prevState => ({
        ...prevState,
        listing_id: listingId
     }));
  console.log("loadDataOnlyOnce");
};

  useEffect(() => {
    loadDataOnlyOnce(passedListingId.passedListingId);
  }, [passedListingId]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const calculateServiceFee = (price) => (parseFloat(price) * 0.05).toFixed(2);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransaction(prevState => {
      const newState = { ...prevState, [name]: value };
      if (name === 'agreed_price') newState.serv_fee = calculateServiceFee(value);
      return newState;
    });
    setFormData(prevState => {
      const newState = { ...prevState, [name]: value };
      if (name === 'agreed_price') newState.serv_fee = calculateServiceFee(value);
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const response = await fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(transaction)
      });
      if (!response.ok) throw new Error('Failed to create transaction');
      const transactionResult = await response.json();
      await fetch(`/api/listings/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: transaction.listing_id, status: "pending" }),
        credentials: 'include'
      });
      setSuccess(true);
      setTransaction(transactionResult);
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <div className="container mx-auto p-4 pb-10">
      <h1 className="text-2xl font-bold mb-4">Create Transaction</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <p>Transaction created successfully!</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 pb-10">
        <div>
          <label className="block mb-2">Listing ID:</label>
          <input type="text" name="listing_id" value={formData.listing_id} onChange={handleInputChange} className="w-full p-2 border rounded" required/>
        </div>
        <div>
          <label className="block mb-2">Agreed Price ($):</label>
          <input type="number" name="agreed_price" value={formData.agreed_price} onChange={handleInputChange} className="w-full p-2 border rounded" step="0.01" min="0" required/>
        </div>
        <div>
          <label className="block mb-2">Service Fee ($):</label>
          <input type="number" name="serv_fee" value={formData.serv_fee} className="w-full p-2 border rounded bg-gray-100" readOnly/>
        </div>
        <div>
          <label className="block mb-2">Transaction Date:</label>
          <input type="date" name="t_date" value={transaction.t_date} onChange={handleInputChange} className="w-full p-2 border rounded" required/>
        </div>
        <div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Create Transaction
          </button>
        </div>
      </form>
      {success && transaction.transaction_id && (
        <div className="mt-4 p-4 border rounded">
          <h2 className="text-xl font-bold mb-2">Transaction Details</h2>
          <p>Transaction ID: {transaction.transaction_id}</p>
          <p>Status: {transaction.status}</p>
          <p>Buyer ID: {transaction.buyer_id}</p>
          <p>Seller ID: {transaction.seller_id}</p>
          <p>Total Amount: ${(parseFloat(transaction.agreed_price) + parseFloat(transaction.serv_fee)).toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}