const {useState, useEffect} = React;

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const response = await fetch('/api/admin/disputes');
      if (!response.ok) {
        throw new Error('Failed to fetch disputes');
      }
      const data = await response.json();
      setDisputes(data.disputes);
    } catch (err) {
      setError('Failed to load disputed transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (disputeId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/disputes/${disputeId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update dispute status');
      }

      const data = await response.json();

      // Update local state
      setDisputes(disputes.map(dispute =>
        dispute.dispute_id === disputeId
          ? { ...dispute, status: newStatus, resolution_date: data.resolution_date }
          : dispute
      ));

      setSelectedDispute(null);
    } catch (err) {
      setError('Failed to update dispute status');
    }
  };

  const filteredDisputes = filterStatus === 'all'
    ? disputes
    : disputes.filter(dispute => dispute.status === filterStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Disputed Transactions</h1>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="all">All Disputes</option>
            <option value="solved">Resolved</option>
            <option value="unsolved">Unresolved</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDisputes.map((dispute) => (
                <tr key={dispute.dispute_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dispute.transaction_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dispute.filed_by}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${dispute.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${dispute.status === 'unsolved' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${dispute.status === 'solved' ? 'bg-green-100 text-green-800' : ''}
                    `}>
                      {dispute.status === 'solved' ? 'Resolved' : 'Unresolved'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dispute.transaction_status.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setSelectedDispute(dispute)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dispute Detail Modal */}
        {selectedDispute && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Dispute Details</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium">{selectedDispute.transaction_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">${selectedDispute.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Filed By</p>
                  <p className="font-medium">{selectedDispute.filed_by}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaction Status</p>
                  <p className="font-medium">{selectedDispute.transaction_status}</p>
                </div>
                {selectedDispute.resolution_date && (
                  <div>
                    <p className="text-sm text-gray-500">Resolution Date</p>
                    <p className="font-medium">{selectedDispute.resolution_date}</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Dispute Description</p>
                <p className="text-sm">{selectedDispute.description}</p>
              </div>

              {selectedDispute.status !== 'solved' && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Update Status</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedDispute.dispute_id, 'solved')}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedDispute(null)}
                className="mt-6 text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const domContainer = document.querySelector('#root');
ReactDOM.render(<AdminDisputes />, domContainer);