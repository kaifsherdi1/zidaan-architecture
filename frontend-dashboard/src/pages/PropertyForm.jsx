import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import axiosClient from "../axios-client";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/api$/, '');

const CATEGORIES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'shop', label: 'Shop' },
  { value: 'single_floor', label: 'Single Floor' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'double_floor', label: 'Double Floor' },
  { value: 'third_floor', label: 'Third Floor' },
];

export default function PropertyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [agents, setAgents] = useState([]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      type: 'sale',
      category: 'apartment',
      status: 'available',
      price: '',
      bedrooms: '',
      bathrooms: '',
      garages: '',
      area: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      zip_code: '',
      agent_id: '',
      features: []
    }
  });

  useEffect(() => {
    axiosClient.get('/agents', { params: { per_page: 100 } })
      .then(({ data }) => setAgents(data.data || []))
      .catch(() => setAgents([]));
  }, []);

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

          const fields = [
            'title', 'description', 'type', 'category', 'status', 'price',
            'bedrooms', 'bathrooms', 'garages', 'area',
          ];
          fields.forEach((key) => setValue(key, property[key]));
          setValue('address', property.location?.address || '');
          setValue('city', property.location?.city || '');
          setValue('state', property.location?.state || '');
          setValue('country', property.location?.country || 'India');
          setValue('zip_code', property.location?.zip_code || '');
          setValue('agent_id', property.agent?.id || '');

          setExistingImages(property.images || []);
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
                    label="Price (₹)"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select
                    {...register('category', { required: 'Choose a category' })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
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

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Listing Agent</label>
                  <select
                    {...register('agent_id', { required: 'Choose an agent' })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="">Select an agent…</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  {errors.agent_id && <p className="text-red-500 text-xs mt-1">{errors.agent_id.message}</p>}
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

              {existingImages.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Current images</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                        <img src={`${API_ROOT}${img.url}`} alt="" className="w-full h-full object-cover" />
                        {img.is_main && (
                          <span className="absolute bottom-1 left-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded">Main</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Uploading new photos below adds to this listing's gallery.</p>
                </div>
              )}

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

