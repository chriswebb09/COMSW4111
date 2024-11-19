const { useState, useEffect } = React;
const TransactionListingPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 't_date',
    direction: 'desc'
  });
  useEffect(() => {
    fetchTransactions();
  }, []);
  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions', { headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirming: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-orange-800',
      completed: 'bg-gray-100 text-green-600',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
    const sortedTransactions = [...transactions].sort((a, b) => {
      if (key === 't_date') {
        return sortConfig.direction === 'asc'
            ? new Date(b[key]) - new Date(a[key])
            : new Date(a[key]) - new Date(b[key]);
      }
      if (key === 'agreed_price' || key === 'serv_fee') {
        return sortConfig.direction === 'asc'
            ? parseFloat(b[key]) - parseFloat(a[key])
            : parseFloat(a[key]) - parseFloat(b[key]);
      }
      return sortConfig.direction === 'asc'
          ? b[key].localeCompare(a[key])
          : a[key].localeCompare(b[key]);
    });
    setTransactions(sortedTransactions);
  };
  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );
  }
  return (
      <div className="max-w-6xl mx-auto p-4 bg-white rounded-lg shadow mb-10 pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Transaction History</h1>
        </div>
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <p>{error}</p>
            </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('transaction_id')}>
                Transaction ID
              </th>
              <th className="p-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('t_date')}>
                Date
              </th>
              <th className="p-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('buyer_id')}>
                Buyer
              </th>
              <th className="p-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('seller_id')}>
                Seller
              </th>
              <th className="p-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('listing_id')}>
                Listing
              </th>
              <th className="p-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('agreed_price')}>
                Price
              </th>
              <th className="p-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('serv_fee')}>
                Service Fee
              </th>
              <th className="p-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                Status
              </th>
            </tr>
            </thead>
            <tbody>
            {transactions.map((transaction) => (
                <tr key={transaction.transaction_id} className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.location.href = `/account/transaction/${transaction.transaction_id}`}>
                  <td className="p-3">{transaction.transaction_id}</td>
                  <td className="p-3">{new Date(transaction.t_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</td>
                  <td className="p-3">{transaction.buyer_id}</td>
                  <td className="p-3">{transaction.seller_id}</td>
                  <td className="p-3">{transaction.listing_id}</td>
                  <td className="p-3">{formatCurrency(transaction.agreed_price)}</td>
                  <td className="p-3">{formatCurrency(transaction.serv_fee)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transactions found
            </div>
        )}
      </div>
  );
};
const domContainer = document.querySelector('#root');
ReactDOM.render(<TransactionListingPage/>, domContainer);
