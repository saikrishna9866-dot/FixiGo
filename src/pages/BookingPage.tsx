import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Calendar, Clock, FileText, User, CreditCard, 
  CheckCircle, ArrowRight, ArrowLeft, Star, ShieldCheck, AlertCircle, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const TIME_SLOTS = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM'
];

import { bookingService } from '../services/bookingService';

export const BookingPage: React.FC = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    address: '',
    landmark: '',
    city: '',
    pincode: '',
    date: '',
    time: '',
    serviceType: 'repair',
    itemCount: 1,
    description: '',
    problemImage: '',
    isUrgent: false,
    providerId: '',
    paymentMethod: 'cash'
  });

  useEffect(() => {
    fetchServiceDetails();
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    if (!serviceId) return;
    
    // Check if serviceId is a valid UUID
    const isUuid = bookingService.isUuid(serviceId || '');
    
    if (!isUuid) {
      // If not a UUID, use fallback data
      const { fallbackServices } = await import('../data/fallbackData');
      const service = fallbackServices.find(s => s.id === serviceId);
      if (service) {
        setService(service);
        setProviders([
          { id: 'mock-1', name: 'Alex Johnson', rating: 4.8, experience: '5 years', phone: '+1234567890' },
          { id: 'mock-2', name: 'Sarah Williams', rating: 4.9, experience: '7 years', phone: '+1987654321' },
          { id: 'mock-3', name: 'David Chen', rating: 4.6, experience: '3 years', phone: '+1122334455' }
        ]);
        setLoading(false);
        return;
      }
    }

    try {
      // Fetch service
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*, categories(name)')
        .eq('id', serviceId)
        .single();

      if (serviceError) throw serviceError;
      setService(serviceData);

      // Fetch providers
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('service_id', serviceId);

      if (providerError) throw providerError;
      
      // If no providers, mock some for demo purposes
      if (!providerData || providerData.length === 0) {
        setProviders([
          { id: 'mock-1', name: 'Alex Johnson', rating: 4.8, experience: '5 years', phone: '+1234567890' },
          { id: 'mock-2', name: 'Sarah Williams', rating: 4.9, experience: '7 years', phone: '+1987654321' },
          { id: 'mock-3', name: 'David Chen', rating: 4.6, experience: '3 years', phone: '+1122334455' }
        ]);
      } else {
        setProviders(providerData);
      }
    } catch (error: any) {
      console.error('BookingPage fetch error:', error);
      toast.error('Failed to load service details');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, problemImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.address || !formData.city || !formData.pincode) {
          toast.error('Please fill in all required location details');
          return false;
        }
        return true;
      case 2:
        if (!formData.date || !formData.time) {
          toast.error('Please select a date and time');
          return false;
        }
        return true;
      case 3:
        if (!formData.providerId) {
          toast.error('Please select a service provider');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const submitBooking = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to confirm booking');
        navigate('/login');
        return;
      }

      // Ensure user profile exists
      await bookingService.ensureUserProfile(user);

      // Calculate price
      const basePrice = 499;
      const urgentFee = formData.isUrgent ? 200 : 0;
      const totalPrice = basePrice + urgentFee;

      // Submit booking using service
      const result = await bookingService.createBooking({
        serviceId: serviceId || '',
        providerId: formData.providerId,
        userId: user.id,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        bookingDate: formData.date,
        bookingTime: formData.time,
        problemDescription: formData.description,
        totalPrice: totalPrice
      });
      
      setBookingId(result.id);
      setStep(5); // Confirmation step
      toast.success('Booking confirmed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm booking');
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-yellow-500" size={48} />
      </div>
    );
  }

  if (!service) return null;

  const basePrice = 499; // Mock base price
  const urgentFee = formData.isUrgent ? 200 : 0;
  const totalPrice = basePrice + urgentFee;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Bar */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
              <div 
                className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-yellow-500 -z-10 transition-all duration-500"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              ></div>
              
              {[
                { num: 1, label: 'Location', icon: MapPin },
                { num: 2, label: 'Schedule', icon: Calendar },
                { num: 3, label: 'Provider', icon: User },
                { num: 4, label: 'Payment', icon: CreditCard }
              ].map((s) => (
                <div key={s.num} className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                    step >= s.num ? "bg-yellow-500 text-white shadow-md" : "bg-white text-gray-400 border-2 border-gray-200"
                  )}>
                    <s.icon size={18} />
                  </div>
                  <span className={cn(
                    "text-xs font-bold mt-2 uppercase tracking-wider",
                    step >= s.num ? "text-gray-900" : "text-gray-400"
                  )}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Header */}
        {step < 5 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 flex items-center">
            <img 
              src={service.image_url || `https://picsum.photos/seed/${service.title}/200/200`} 
              alt={service.title} 
              className="w-20 h-20 rounded-xl object-cover mr-6"
            />
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-yellow-600 mb-1 block">
                {service.categories?.name}
              </span>
              <h1 className="text-2xl font-serif font-bold text-gray-900">{service.title}</h1>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Star size={14} className="text-yellow-400 mr-1" fill="currentColor" />
                <span className="font-medium mr-4">4.9 (120+ reviews)</span>
                <span className="font-bold text-black">Starts at ₹{basePrice}</span>
              </div>
            </div>
          </div>
        )}

        {/* Form Steps */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: LOCATION */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <MapPin className="mr-3 text-yellow-500" /> Service Location
                </h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="House/Flat No., Building Name, Street"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none h-24"
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Landmark (Optional)</label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      placeholder="e.g. Near Apollo Hospital"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="6-digit Pincode"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DATE & TIME */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Calendar className="mr-3 text-yellow-500" /> Schedule & Details
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Select Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Select Time Slot *</label>
                      <select
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all bg-white"
                        required
                      >
                        <option value="">Choose a slot</option>
                        {TIME_SLOTS.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Service Type *</label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all bg-white"
                        required
                      >
                        <option value="repair">Repair</option>
                        <option value="installation">Installation</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inspection">Inspection</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Number of Items *</label>
                      <input
                        type="number"
                        name="itemCount"
                        min="1"
                        max="20"
                        value={formData.itemCount}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <FileText size={16} className="mr-2" /> Problem Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Please describe the issue or what exactly needs to be done..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none h-24"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Upload Image (Optional)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-yellow-400 transition-colors bg-gray-50">
                      <div className="space-y-1 text-center">
                        {formData.problemImage ? (
                          <div className="relative inline-block">
                            <img src={formData.problemImage} alt="Problem preview" className="h-32 w-auto rounded-lg object-cover" />
                            <button 
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, problemImage: '' }))}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <AlertCircle size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600 justify-center">
                              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="urgent"
                        name="isUrgent"
                        type="checkbox"
                        checked={formData.isUrgent}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="urgent" className="font-bold text-red-800 cursor-pointer flex items-center">
                        <AlertCircle size={16} className="mr-1" /> Urgent Booking (Within 2 hours)
                      </label>
                      <p className="text-red-600 mt-1">An additional fee of ₹200 applies for urgent bookings.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PROVIDER */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                  <User className="mr-3 text-yellow-500" /> Select Professional
                </h2>
                <p className="text-gray-500 mb-6">Choose from our verified experts available in your area.</p>
                
                <div className="space-y-4">
                  {providers.map((provider) => (
                    <div 
                      key={provider.id}
                      onClick={() => setFormData({...formData, providerId: provider.id})}
                      className={cn(
                        "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center",
                        formData.providerId === provider.id 
                          ? "border-yellow-500 bg-yellow-50" 
                          : "border-gray-100 hover:border-gray-200 bg-white"
                      )}
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden mr-4 flex-shrink-0">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.name}`} 
                          alt={provider.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg text-gray-900">{provider.name}</h3>
                          {formData.providerId === provider.id && (
                            <CheckCircle className="text-yellow-500" size={24} />
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                          <span className="flex items-center text-yellow-600 font-bold">
                            <Star size={14} fill="currentColor" className="mr-1" /> {provider.rating || '4.8'}
                          </span>
                          <span className="flex items-center">
                            <ShieldCheck size={14} className="mr-1 text-green-500" /> Verified
                          </span>
                          <span>{provider.experience || '3+ years'} exp</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: PAYMENT */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="mr-3 text-yellow-500" /> Summary & Payment
                </h2>
                
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                  <h3 className="font-bold text-lg mb-4 border-b border-gray-200 pb-2">Booking Summary</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Service</span>
                      <span className="font-bold text-gray-900">{service.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Service Details</span>
                      <span className="font-bold text-gray-900 capitalize">
                        {formData.serviceType} ({formData.itemCount} {formData.itemCount > 1 ? 'items' : 'item'})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date & Time</span>
                      <span className="font-bold text-gray-900">{formData.date} | {formData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Professional</span>
                      <span className="font-bold text-gray-900">
                        {providers.find(p => p.id === formData.providerId)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Address</span>
                      <span className="font-bold text-gray-900 text-right max-w-[200px] truncate">
                        {formData.address}, {formData.city}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Base Service Charge</span>
                      <span className="font-bold">₹{basePrice}</span>
                    </div>
                    {formData.isUrgent && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Urgent Booking Fee</span>
                        <span className="font-bold">+₹{urgentFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold mt-4 pt-2 border-t border-gray-200">
                      <span>Total Amount</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-4">Select Payment Method</h3>
                <div className="space-y-3">
                  {[
                    { id: 'cash', label: 'Cash on Service', desc: 'Pay after the service is completed' },
                    { id: 'online', label: 'Pay Online Now', desc: 'Credit/Debit Card, UPI, Netbanking' },
                    { id: 'advance', label: 'Pay Advance (₹100)', desc: 'Pay ₹100 now to confirm, rest later' }
                  ].map((method) => (
                    <label 
                      key={method.id}
                      className={cn(
                        "flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all",
                        formData.paymentMethod === method.id 
                          ? "border-yellow-500 bg-yellow-50" 
                          : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <div className="flex items-center h-5 mt-0.5">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                        />
                      </div>
                      <div className="ml-3">
                        <span className="block text-sm font-bold text-gray-900">{method.label}</span>
                        <span className="block text-xs text-gray-500 mt-0.5">{method.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 5: CONFIRMATION */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 text-center"
              >
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-green-500" size={48} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed! 🎉</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Your service has been successfully booked. The professional will arrive at the scheduled time.
                </p>
                
                <div className="bg-gray-50 rounded-2xl p-6 inline-block text-left mb-8 border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                  <p className="font-mono font-bold text-lg text-black tracking-wider">
                    {bookingId?.split('-')[0].toUpperCase() || 'FXG-8923'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
                  >
                    Track Order
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Back to Home
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Buttons */}
          {step < 5 && (
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              {step > 1 ? (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 text-gray-600 font-bold hover:text-black transition-colors flex items-center"
                >
                  <ArrowLeft size={18} className="mr-2" /> Back
                </button>
              ) : <div></div>}
              
              {step < 4 ? (
                <button
                  onClick={nextStep}
                  className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center shadow-lg"
                >
                  Continue <ArrowRight size={18} className="ml-2" />
                </button>
              ) : (
                <button
                  onClick={submitBooking}
                  disabled={submitting}
                  className="px-8 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition-all flex items-center shadow-lg disabled:opacity-70"
                >
                  {submitting ? (
                    <><Loader2 className="animate-spin mr-2" size={18} /> Processing...</>
                  ) : (
                    <><CheckCircle size={18} className="mr-2" /> Confirm Booking</>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
