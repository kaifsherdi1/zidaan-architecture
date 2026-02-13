import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import axiosClient from "../axios-client";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

export default function PropertyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      type: 'sale',
      status: 'available',
      price: '',
      bedrooms: '',
      bathrooms: '',
      garages: '',
      area: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zip_code: '',
      features: []
    }
  });

  const onDrop = useCallback(acceptedFiles => {
    setImageFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });

  const removeFile = (file) => {
    setImageFiles(prev => prev.filter(f => f !== file));
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient.get(`/properties/${id}`)
        .then(({ data }) => {
          setLoading(false);
          const property = data.data;

          Object.keys(property).forEach(key => {
            setValue(key, property[key]);
          });

          // If the API returns existing images, set them here
          // setExistingImages(property.images || []);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id, setValue]);

  const onSubmit = (data) => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    imageFiles.forEach(file => {
      formData.append('images[]', file);
    });

    if (id) {
      formData.append('_method', 'PUT');
    }

    const url = id ? `/manager/properties/${id}` : '/manager/properties';

    axiosClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        navigate('/properties');
      })
      .catch(err => {
        const response = err.response;
        if (response && response.status === 422) {
          console.error(response.data.errors);
          // Could manually set errors here if needed
        }
      });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{id ? 'Edit Property' : 'New Property'}</h1>
      </div>

      <Card className="p-6">
        {loading && <div className="text-center py-4">Loading property data...</div>}

        {!loading && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Property Title"
                  placeholder="Luxury Villa in Beverly Hills"
                  error={errors.title?.message}
                  {...register('title', { required: 'Title is required' })}
                  className="md:col-span-2"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price"
                    type="number"
                    placeholder="0.00"
                    error={errors.price?.message}
                    step="0.01"
                    {...register('price', { required: 'Price is required' })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                    <select
                      {...register('type')}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                  <select
                    {...register('status')}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  {...register('description')}
                  rows="4"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  placeholder="Describe the property..."
                ></textarea>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Property Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input label="Bedrooms" type="number" {...register('bedrooms')} />
                <Input label="Bathrooms" type="number" {...register('bathrooms')} />
                <Input label="Garages" type="number" {...register('garages')} />
                <Input label="Area (sqft)" type="number" {...register('area')} />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Address" {...register('address')} className="md:col-span-2" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" {...register('city')} />
                  <Input label="State" {...register('state')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Country" {...register('country')} />
                  <Input label="Zip Code" {...register('zip_code')} />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Property Images</h3>

              <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary hover:bg-slate-50'
                }`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <FaCloudUploadAlt className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                </div>
              </div>

              {imageFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                  {imageFiles.map((file, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                      <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(file)}
                        className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <Button variant="secondary" onClick={() => navigate('/properties')}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving Property...' : 'Save Property'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}

