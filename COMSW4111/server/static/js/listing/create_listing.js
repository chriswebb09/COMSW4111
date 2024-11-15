const { useState, useEffect } = React;

const validateForm = (formData) => {
    const errors = {};
    const requiredFields = ['title', 'price', 'description', 'location.address', 'location.city', 'location.state', 'location.zip'];

    requiredFields.forEach(field => {
        const [key, subKey] = field.split('.');
        if (subKey ? !formData[key][subKey].trim() : !formData[key].trim()) {
            errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
        }
    });

    if (isNaN(parseFloat(formData.price))) {
        errors.price = 'Valid price is required';
    }

    return errors;
};

const CreateListingPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        meta_tag: '',
        images: [],
        location: { address: '', city: '', state: '', zip: '' }
    });
    const [previewImages, setPreviewImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, location: { ...prev.location, [name]: value } }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
            return;
        }

        // Create preview URLs for the images
        const newPreviewImages = files.map(file => URL.createObjectURL(file));
        previewImages.forEach(url => URL.revokeObjectURL(url)); // Cleanup old previews
        setPreviewImages(newPreviewImages);
        setFormData(prev => ({ ...prev, images: files }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            const formDataToSend = new FormData();

            // Append basic form fields
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);

            // Append location data as JSON string
            formDataToSend.append('location', JSON.stringify(formData.location));

            // Append meta tags
            if (formData.meta_tag) {
                formDataToSend.append('meta_tags', JSON.stringify(formData.meta_tag.split(',').map(tag => tag.trim())));
            }

            // Append each image file individually
            formData.images.forEach((image, index) => {
                formDataToSend.append('images', image);
            });

            // Send to the Flask endpoint
            const response = await fetch('/create_listing', {
                method: 'POST',
                body: formDataToSend,
                // Don't set Content-Type header - let the browser set it with the boundary
                credentials: 'same-origin' // Include cookies if using session authentication
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create listing');
            }

            // Clean up preview URLs
            previewImages.forEach(url => URL.revokeObjectURL(url));

            // Show success message and redirect
            alert('Listing created successfully!');
            window.location.href = '/'; // Adjust redirect path as needed
        } catch (error) {
            console.error('Error creating listing:', error);
            setErrors({ submit: error.message || 'Failed to create listing. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Clean up preview URLs when component unmounts
    useEffect(() => {
        return () => {
            previewImages.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    // Rest of the component remains the same...
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
                    <p className="mt-2 text-gray-600">Fill out the form below to create your property listing</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
                    {/* Basic Information Section */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter listing title"/>
                            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input type="number" id="price" name="price" min="0" step="0.01" value={formData.price} onChange={handleInputChange} className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'}`} placeholder="0.00"/>
                            </div>
                            {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea id="description" name="description" rows="6" value={formData.description} onChange={handleInputChange} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`} placeholder="Describe your property..."/>
                            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                        </div>
                    </div>

                    {/* Images Section */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (Max 5)</label>
                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="images" name="images"/>
                            <label htmlFor="images" className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors">
                                <span className="text-gray-600">Click to upload images</span>
                            </label>
                            {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}
                        </div>
                        {previewImages.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                {previewImages.map((url, index) => (
                                    <div key={index} className="relative aspect-video">
                                        <img src={url} alt={`Preview ${index + 1}`} className="rounded-lg object-cover w-full h-full" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Location Section */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input type="text" id="address" name="address" value={formData.location.address} onChange={handleLocationChange} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`} placeholder="Street address"/>
                                {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input type="text" id="city" name="city" value={formData.location.city} onChange={handleLocationChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="City"/>
                            </div>
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input type="text" id="state" name="state" value={formData.location.state} onChange={handleLocationChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="State"/>
                            </div>
                            <div>
                                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                                <input type="text" id="zip" name="zip" value={formData.location.zip} onChange={handleLocationChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ZIP Code"/>
                            </div>
                        </div>
                    </div>

                    {/* Features & Tags Section */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Features & Tags</h2>
                        <div>
                            <label htmlFor="meta_tag" className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                            <input type="text" id="meta_tag" name="meta_tag" value={formData.meta_tag} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., modern, pet-friendly, furnished"/>
                            <p className="mt-1 text-sm text-gray-500">Add relevant tags to help users find your listing</p>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4">
                        <button type="button" className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium" onClick={() => window.history.back()}>Cancel</button>
                        <button type="submit" disabled={isSubmitting} className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-medium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}>
                            {isSubmitting ? 'Creating...' : 'Create Listing'}
                        </button>
                    </div>
                    {errors.submit && <p className="mt-4 text-center text-red-500">{errors.submit}</p>}
                </form>
            </div>
        </div>
    );
};

const domContainer = document.querySelector('#root');
ReactDOM.render(<CreateListingPage />, domContainer);