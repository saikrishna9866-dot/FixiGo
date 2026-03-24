import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, safeGetSession } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Phone, Wrench, MapPin, Upload, Calendar, 
  Loader2, ArrowRight, ArrowLeft, CheckCircle, Briefcase, FileText,
  Clock, Star, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useData } from '../context/DataContext';

import { professionalService } from '../services/professionalService';

const steps = [
  { label: 'Basic', icon: User },
  { label: 'Professional', icon: Briefcase },
  { label: 'Address', icon: MapPin },
  { label: 'Documents', icon: FileText },
  { label: 'Availability', icon: Calendar }
];

export const ProfessionalRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { categories, services } = useData();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    category_id: '', service_id: '', service_type: '', experience: '', skills: '',
    address: '', city: '', pincode: '',
    working_days: [] as string[], time_slots: '09:00 AM - 06:00 PM',
    id_proof: null as File | null,
    profile_photo: null as File | null
  });

  const [isChecking, setIsChecking] = useState(true);
  const [alreadyProfessional, setAlreadyProfessional] = useState(false);

  useEffect(() => {
    const checkProfessionalStatus = async () => {
      try {
        const { data } = await safeGetSession();
        const session = data?.session;
        if (session?.user) {
          // Check if already a professional
          const isProf = await professionalService.isProfessional(session.user.id);
          if (isProf) {
            setAlreadyProfessional(true);
            setIsChecking(false);
            return;
          }

          // Pre-fill data from profile
          const { data: profileData } = await supabase.from('users_profile')
            .select('full_name, email, phone')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileData) {
            setFormData(prev => ({
              ...prev,
              name: profileData.full_name || '',
              email: profileData.email || '',
              phone: profileData.phone || ''
            }));
          }
        } else {
          // Not logged in - redirect to login
          toast.error('Please login to register as a professional');
          navigate('/login?redirect=/register-professional');
          return;
        }
      } catch (err) {
        console.error('Error checking professional status:', err);
      } finally {
        setIsChecking(false);
      }
    };

    checkProfessionalStatus();
  }, [navigate]);

  const categoryServices = formData.category_id 
    ? (services || []).filter(s => s.category_id === formData.category_id)
    : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'category_id') {
        newData.service_id = '';
      }
      return newData;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'id_proof' | 'profile_photo') => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [field]: file }));
    if (file) {
      toast.success(`${field === 'id_proof' ? 'ID Proof' : 'Profile Photo'} selected`);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.email)) {
      toast.error('Please fill in all basic details');
      return;
    }
    if (step === 2 && (!formData.category_id || !formData.service_id)) {
      toast.error('Please select a category and service');
      return;
    }
    if (step === 3 && (!formData.address || !formData.city || !formData.pincode)) {
      toast.error('Please fill in your address details');
      return;
    }
    if (step === 4 && (!formData.id_proof || !formData.profile_photo)) {
      toast.error('Please upload both ID Proof and Profile Photo');
      return;
    }
    setStep(prev => Math.min(prev + 1, 5));
  };
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (formData.working_days.length === 0) {
      toast.error('Please select at least one working day');
      return;
    }

    setLoading(true);
    try {
      const { data } = await safeGetSession();
      const session = data?.session;
      if (!session?.user) throw new Error('You must be logged in to register');

      const userId = session.user.id;

      // 1. Upload Documents to Storage if present
      let idProofUrl = '';
      let profilePhotoUrl = '';

      if (formData.id_proof) {
        const fileExt = formData.id_proof.name.split('.').pop();
        const fileName = `${userId}-id-proof.${fileExt}`;
        const filePath = `professionals/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('services')
          .upload(filePath, formData.id_proof, { upsert: true });
          
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('services')
            .getPublicUrl(filePath);
          idProofUrl = publicUrl;
        }
      }

      if (formData.profile_photo) {
        const fileExt = formData.profile_photo.name.split('.').pop();
        const fileName = `${userId}-profile.${fileExt}`;
        const filePath = `professionals/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('services')
          .upload(filePath, formData.profile_photo, { upsert: true });
          
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('services')
            .getPublicUrl(filePath);
          profilePhotoUrl = publicUrl;
        }
      }

      // 2. Update users_profile with professional details
      await supabase.from('users_profile').upsert({
        id: userId,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar_url: profilePhotoUrl || undefined
      });

      // 3. Register Professional using service
      await professionalService.registerProfessional({
        userId: userId,
        serviceId: formData.service_id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        experience: formData.experience ? `${formData.experience} years` : '0 years',
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        availability: { 
          days: formData.working_days, 
          slots: [formData.time_slots] 
        }
      });

      toast.success('Professional registration successful!');
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  if (isChecking) {
    return (
      <div className="pt-32 pb-12 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-yellow-500 mx-auto mb-4" size={48} />
          <p className="text-gray-500 font-medium tracking-tight">Verifying your status...</p>
        </div>
      </div>
    );
  }

  if (alreadyProfessional) {
    return (
      <div className="pt-32 pb-12 min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl border border-gray-100 text-center"
        >
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-yellow-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-black mb-4 tracking-tight">Already a Professional</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            You are already registered as a professional on FixiGo. You can manage your services and bookings from your dashboard.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
          >
            Go to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Details</h2>
              <p className="text-gray-500 text-sm">Tell us who you are</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" name="name" placeholder="Full Name" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" name="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all" value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="tel" name="phone" placeholder="Phone Number" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all" value={formData.phone} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Details</h2>
              <p className="text-gray-500 text-sm">What services do you offer?</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select name="category_id" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all appearance-none" value={formData.category_id} onChange={handleInputChange}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {formData.category_id && (
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select name="service_id" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all appearance-none" value={formData.service_id} onChange={handleInputChange}>
                    <option value="">Select Specific Service</option>
                    {categoryServices.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
              )}
              <div className="relative">
                <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="number" name="experience" placeholder="Years of Experience" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all" value={formData.experience} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Address Details</h2>
              <p className="text-gray-500 text-sm">Where are you located?</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" name="address" placeholder="Full Address" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all" value={formData.address} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="city" placeholder="City" className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all" value={formData.city} onChange={handleInputChange} />
                <input type="text" name="pincode" placeholder="Pincode" className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all" value={formData.pincode} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents</h2>
              <p className="text-gray-500 text-sm">Verification is required for trust</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <label className={cn(
                "group relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all",
                formData.id_proof ? "border-green-500 bg-green-50/30" : "border-gray-200 hover:border-yellow-500 hover:bg-yellow-50/30"
              )}>
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all",
                  formData.id_proof ? "bg-green-100 scale-110" : "bg-gray-50 group-hover:bg-yellow-100 group-hover:scale-110"
                )}>
                  {formData.id_proof ? (
                    <CheckCircle className="text-green-600" size={24} />
                  ) : (
                    <Upload className="text-gray-400 group-hover:text-yellow-600" size={24} />
                  )}
                </div>
                <span className="text-sm font-bold text-gray-600">
                  {formData.id_proof ? formData.id_proof.name : 'ID Proof'}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
                  {formData.id_proof ? 'File selected' : 'PDF or Image'}
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, 'id_proof')}
                  accept="image/*,.pdf"
                />
              </label>
              
              <label className={cn(
                "group relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all",
                formData.profile_photo ? "border-green-500 bg-green-50/30" : "border-gray-200 hover:border-yellow-500 hover:bg-yellow-50/30"
              )}>
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all",
                  formData.profile_photo ? "bg-green-100 scale-110" : "bg-gray-50 group-hover:bg-yellow-100 group-hover:scale-110"
                )}>
                  {formData.profile_photo ? (
                    <CheckCircle className="text-green-600" size={24} />
                  ) : (
                    <User className="text-gray-400 group-hover:text-yellow-600" size={24} />
                  )}
                </div>
                <span className="text-sm font-bold text-gray-600">
                  {formData.profile_photo ? formData.profile_photo.name : 'Profile Photo'}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
                  {formData.profile_photo ? 'File selected' : 'JPG or PNG'}
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, 'profile_photo')}
                  accept="image/*"
                />
              </label>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Availability</h2>
              <p className="text-gray-500 text-sm">When can you work?</p>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-widest">Working Days</p>
              <div className="flex flex-wrap gap-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <label key={day} className="cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="hidden peer"
                      checked={formData.working_days.includes(day)}
                      onChange={e => setFormData({
                        ...formData, 
                        working_days: e.target.checked 
                          ? [...formData.working_days, day] 
                          : formData.working_days.filter(d => d !== day)
                      })} 
                    />
                    <div className="px-5 py-3 rounded-xl border-2 border-gray-100 font-bold text-sm peer-checked:bg-yellow-500 peer-checked:border-yellow-500 peer-checked:text-black transition-all">
                      {day}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-widest">Time Slots</p>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select 
                  name="time_slots" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all appearance-none"
                  value={formData.time_slots}
                  onChange={handleInputChange}
                >
                  <option value="09:00 AM - 06:00 PM">09:00 AM - 06:00 PM (Standard)</option>
                  <option value="08:00 AM - 08:00 PM">08:00 AM - 08:00 PM (Extended)</option>
                  <option value="10:00 AM - 04:00 PM">10:00 AM - 04:00 PM (Short)</option>
                  <option value="24x7">24x7 Emergency</option>
                </select>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join FixiGo as a Professional</h1>
          <p className="text-gray-600">Grow your business and reach more customers in your area.</p>
        </div>

        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-yellow-500 -z-10 transition-all duration-500"
              style={{ width: `${((step - 1) / 4) * 100}%` }}
            ></div>
            
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                  step >= i + 1 ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/30 scale-110" : "bg-white text-gray-400 border-2 border-gray-200"
                )}>
                  <s.icon size={20} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold mt-3 uppercase tracking-widest",
                  step >= i + 1 ? "text-gray-900" : "text-gray-400"
                )}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="p-8 sm:p-12">
            <form onSubmit={(e) => e.preventDefault()}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={prevStep} 
                  disabled={step === 1} 
                  className="flex items-center px-8 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
                >
                  <ArrowLeft className="mr-2" size={18} />
                  Back
                </button>
                
                {step < 5 ? (
                  <button 
                    type="button"
                    onClick={nextStep} 
                    className="flex items-center px-10 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                  >
                    Continue
                    <ArrowRight className="ml-2" size={18} />
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={handleSubmit} 
                    disabled={loading} 
                    className="flex items-center px-10 py-4 bg-yellow-500 text-black rounded-2xl font-bold hover:bg-yellow-600 transition-all shadow-xl shadow-yellow-500/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={18} />
                        Processing...
                      </>
                    ) : (
                      <>
                        Complete Registration
                        <CheckCircle className="ml-2" size={18} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
