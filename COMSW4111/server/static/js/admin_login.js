const { useState, useEffect } = React;

const AdminSignupForm = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: '',
        address: '',
        phone_number: '',
        admin_role: 'manager'
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        if (!formData.first_name || !formData.last_name || !formData.email ||
            !formData.password || !formData.confirm_password || !formData.address ||
            !formData.phone_number || !formData.admin_role) {
            setError('All fields are required');
            return false;
        }

        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/admin/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  // Make sure this header is present
            },
            body: JSON.stringify(formData)  // Ensure formData is serialized to JSON
        });


        } catch (err) {
            console.log(err);
            setError('Failed to create admin account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 px-4">
            <div className="max-w-md w-full mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                    Create Admin Account
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8">
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                First Name
                            </label>
                            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                        </div>
                        <div className="flex-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Last Name
                            </label>
                            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Email
                        </label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Password
                        </label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Confirm Password
                        </label>
                        <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Address
                        </label>
                        <textarea name="address" value={formData.address} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows="3"/>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Phone Number
                        </label>
                        <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Admin Role
                        </label>
                        <select name="admin_role" value={formData.admin_role} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="manager">Manager</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="support">Support</option>
                        </select>
                    </div>

                    <button type="submit" className={`w-full bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                            }`}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};


const domContainer = document.querySelector('#root');
ReactDOM.render(<AdminSignupForm />, domContainer);
