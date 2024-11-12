const {useState, useEffect} = React;

const validateForm = (formData) => {
    const errors = {};

    if (!formData.title.trim()) {
        errors.title = 'Title is required';
    }

    if (!formData.price || isNaN(parseFloat(formData.price))) {
        errors.price = 'Valid price is required';
    }

    if (!formData.description.trim()) {
        errors.description = 'Description is required';
    }

    if (!formData.location.address.trim()) {
        errors.address = 'Address is required';
    }

    if (!formData.location.city.trim()) {
        errors.city = 'City is required';
    }

    if (!formData.location.state.trim()) {
        errors.state = 'State is required';
    }

    if (!formData.location.zip.trim()) {
        errors.zip = 'ZIP is required';
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
        location: {
            address: '',
            city: '',
            state: '',
            zip: ''
        }
    });

    const [previewImages, setPreviewImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}));
        }
    };

    const handleLocationChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                [name]: value
            }
        }));
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            setErrors(prev => ({
                ...prev,
                images: 'Maximum 5 images allowed'
            }));
            return;
        }

        const newPreviewImages = files.map(file => URL.createObjectURL(file));

        // Cleanup old preview URLs
        previewImages.forEach(url => URL.revokeObjectURL(url));

        setPreviewImages(newPreviewImages);
        setFormData(prev => ({...prev, images: files}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // Validate form
        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price.toString()); // Ensure price is string
            formDataToSend.append('meta_tags', JSON.stringify(formData.meta_tag.split(',').map(tag => tag.trim())));

            // Log each image being appended
            formData.images.forEach((image, index) => {
                console.log(`Appending image ${index}:`, image);
                formDataToSend.append('images', image); // Changed to use consistent key name
            });

            formDataToSend.append('location', JSON.stringify(formData.location));
            formDataToSend.append('status', 'active');

            // Debug: Log the FormData contents
            for (let pair of formDataToSend.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            const response = await fetch('/api/listings/create', {
                method: 'POST',
                headers: {
                    'mime-type': 'multipart/form-data',
                    'Accept': 'application/json'
                },
                body: formDataToSend
            }).then(res => {
                res.json().then(json => {
                    alert('Listing created successfully!');
                    console.log(json)
                    let dataResponse = json
                    window.location.href = `/listing/${dataResponse.listing_id}`;
                    //Do stuff with json here
                });
            });

            if (!response.ok) {
                const errorData = await response.json().catch(e => null);
                console.log('Response status:', response.status);
                console.log('Error data:', errorData);
            }

            previewImages.forEach(url => URL.revokeObjectURL(url));


        } catch (error) {
            setErrors({
                submit: error.message || 'Failed to create listing. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
                    <p className="mt-2 text-gray-600">Fill out the form below to create your property listing</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

                        {/* Title */}
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter listing title"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                            )}
                        </div>

                        {/* Price */}
                        <div className="mb-4">
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                Price
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.price ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="0.00"
                                />
                            </div>
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows="6"
                                value={formData.description}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Describe your property..."
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Images Section */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Images (Max 5)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                                id="images"
                            />
                            <label
                                htmlFor="images"
                                className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors"
                            >
                                <span className="text-gray-600">Click to upload images</span>
                            </label>
                            {errors.images && (
                                <p className="mt-1 text-sm text-red-500">{errors.images}</p>
                            )}
                        </div>

                        {/* Image Previews */}
                        {previewImages.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                {previewImages.map((url, index) => (
                                    <div key={index} className="relative aspect-video">
                                        <img
                                            src={url}
                                            alt={`Preview ${index + 1}`}
                                            className="rounded-lg object-cover w-full h-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Location Section */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Address */}
                            <div className="md:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.location.address}
                                    onChange={handleLocationChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.address ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Street address"
                                />
                                {errors.address && (
                                    <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                                )}
                            </div>

                            {/* City */}
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.location.city}
                                    onChange={handleLocationChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="City"
                                />
                            </div>

                            {/* State */}
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                    State
                                </label>
                                <input
                                    type="text"
                                    id="state"
                                    name="state"
                                    value={formData.location.state}
                                    onChange={handleLocationChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="State"
                                />
                            </div>

                            {/* ZIP Code */}
                            <div>
                                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                                    ZIP Code
                                </label>
                                <input
                                    type="text"
                                    id="zip"
                                    name="zip"
                                    value={formData.location.zip}
                                    onChange={handleLocationChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="ZIP Code"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Meta Tags Section */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Features & Tags</h2>

                        <div>
                            <label htmlFor="meta_tag" className="block text-sm font-medium text-gray-700 mb-1">
                                Tags (comma-separated)
                            </label>
                            <input
                                type="text"
                                id="meta_tag"
                                name="meta_tag"
                                value={formData.meta_tag}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., modern, pet-friendly, furnished"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Add relevant tags to help users find your listing
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-medium ${
                                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                            }`}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Listing'}
                        </button>
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <p className="mt-4 text-center text-red-500">{errors.submit}</p>
                    )}
                </form>
            </div>
        </div>
    );
};

const domContainer = document.querySelector('#root');
ReactDOM.render(<CreateListingPage/>, domContainer);