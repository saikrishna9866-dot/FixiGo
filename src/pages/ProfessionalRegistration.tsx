import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Phone, Lock, Wrench, MapPin, Upload, Calendar, 
  Loader2, ArrowRight, ArrowLeft, CheckCircle, Briefcase, FileText,
  Clock, Star, ShieldCheck, Award, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useCategories } from '../context/useData';

export const ProfessionalRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    category_id: '', service_type: '', experience: '', skills: '',
    address: '', city: '', pincode: '',
    working_days: [] as string[], time_slots: '09:00 AM - 06:00 PM'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.email || !formData.password)) {
      toast.error('Please fill in all basic details');
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
      // 1. Auth Signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { 
          data: { 
            name: formData.name, 
            role: 'provider' 
          } 
        }
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // 2. Insert into users_profile
      const { error: profileError } = await supabase.from('users_profile').insert({
        id: authData.user.id,
        full_name: formData.name,
        email: formData.email,
        // avatar_url is optional
      });
      
      if (profileError) {
        console.warn('Profile insertion error (may already exist):', profileError);
      }

      // 3. Insert into service_providers
      const { error: providerError } = await supabase.from('service_providers').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service_id: formData.category_id || null,
        experience: formData.experience ? `${formData.experience} years` : '0 years',
        address: `${formData.address}, ${formData.city}, ${formData.pincode}`,
        availability: { 
          days: formData.working_days, 
          slots: [formData.time_slots] 
        }
      });

      if (providerError) throw providerError;

      toast.success('Registration submitted successfully! You can now log in.');
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: 'Basic', icon: User },
    { label: 'Professional', icon: Briefcase },
    { label: 'Address', icon: MapPin },
    { label: 'Documents', icon: FileText },
    { label: 'Availability', icon: Calendar }
  ];

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
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
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
                      <input type="email" name="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all" value={formData.email} onChange={handleInputChange} />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="tel" name="phone" placeholder="Phone Number" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all" value={formData.phone} onChange={handleInputChange} />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="password" name="password" placeholder="Create Password" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all" value={formData.password} onChange={handleInputChange} />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
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
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="text" name="service_type" placeholder="Specific Service (e.g. Kitchen Plumbing)" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all" value={formData.service_type} onChange={handleInputChange} />
                    </div>
                    <div className="relative">
                      <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="number" name="experience" placeholder="Years of Experience" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all" value={formData.experience} onChange={handleInputChange} />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
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
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Documents</h2>
                      <p className="text-gray-500 text-sm">Help us verify your identity and skills</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center">
                      <ShieldCheck size={14} className="mr-2" /> Secure Upload
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="p-6 border-2 border-gray-100 rounded-3xl bg-gray-50/50">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm">
                            <FileText className="text-yellow-600" size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">Government ID Proof</h4>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Aadhar, PAN, or Voter ID</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black bg-yellow-100 text-yellow-700 px-2 py-1 rounded uppercase">Required</span>
                      </div>
                      <label className="group relative flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-yellow-500 hover:bg-white transition-all bg-white/50">
                        <Upload className="text-gray-300 group-hover:text-yellow-500 mb-2 transition-colors" size={32} />
                        <span className="text-sm font-bold text-gray-600">Click to upload or drag & drop</span>
                        <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">PDF, JPG, PNG (Max 5MB)</span>
                        <input type="file" className="hidden" />
                      </label>
                    </div>

                    <div className="p-6 border-2 border-gray-100 rounded-3xl bg-gray-50/50">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-4 shadow-sm">
                            <Award className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">Skill Certificate</h4>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Any relevant certification</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase">Optional</span>
                      </div>
                      <label className="group relative flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-yellow-500 hover:bg-white transition-all bg-white/50">
                        <Upload className="text-gray-300 group-hover:text-yellow-500 mb-2 transition-colors" size={32} />
                        <span className="text-sm font-bold text-gray-600">Click to upload or drag & drop</span>
                        <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">PDF, JPG, PNG (Max 5MB)</span>
                        <input type="file" className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex items-start">
                    <AlertCircle className="text-yellow-600 mr-3 shrink-0" size={20} />
                    <p className="text-xs text-yellow-800 leading-relaxed">
                      Your documents are encrypted and used only for verification purposes. We never share your personal data with third parties.
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div 
                  key="step5" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
              <button 
                onClick={prevStep} 
                disabled={step === 1} 
                className="flex items-center px-8 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
              >
                <ArrowLeft className="mr-2" size={18} />
                Back
              </button>
              
              {step < 5 ? (
                <button 
                  onClick={nextStep} 
                  className="flex items-center px-10 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                >
                  Continue
                  <ArrowRight className="ml-2" size={18} />
                </button>
              ) : (
                <button 
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
          </div>
        </div>
      </div>
    </div>
  );
};
