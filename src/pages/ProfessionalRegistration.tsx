import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Phone, Lock, Wrench, MapPin, Upload, Calendar, 
  Loader2, ArrowRight, ArrowLeft, CheckCircle, Briefcase, FileText 
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export const ProfessionalRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    category_id: '', service_type: '', experience: '', skills: '',
    address: '', city: '', pincode: '',
    working_days: [] as string[], time_slots: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    setCategories(data || []);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Auth Signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { name: formData.name, role: 'provider' } }
      });
      if (authError) throw authError;

      // 2. Insert into users_profile
      await supabase.from('users_profile').insert({
        id: authData.user?.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      });

      // 3. Insert into service_providers
      await supabase.from('service_providers').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service_id: formData.category_id,
        experience: formData.experience,
        address: `${formData.address}, ${formData.city}, ${formData.pincode}`,
        availability: JSON.stringify({ days: formData.working_days, slots: formData.time_slots })
      });

      toast.success('Registration submitted successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
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
        
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-yellow-500 -z-10 transition-all duration-500"
              style={{ width: `${((step - 1) / 4) * 100}%` }}
            ></div>
            
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                  step >= i + 1 ? "bg-yellow-500 text-white shadow-md" : "bg-white text-gray-400 border-2 border-gray-200"
                )}>
                  <s.icon size={18} />
                </div>
                <span className={cn(
                  "text-xs font-bold mt-2 uppercase tracking-wider",
                  step >= i + 1 ? "text-gray-900" : "text-gray-400"
                )}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6">Basic Details</h2>
                <div className="space-y-4">
                  <input type="text" name="name" placeholder="Full Name" className="w-full p-4 border rounded-xl" value={formData.name} onChange={handleInputChange} />
                  <input type="email" name="email" placeholder="Email" className="w-full p-4 border rounded-xl" value={formData.email} onChange={handleInputChange} />
                  <input type="tel" name="phone" placeholder="Phone Number" className="w-full p-4 border rounded-xl" value={formData.phone} onChange={handleInputChange} />
                  <input type="password" name="password" placeholder="Password" className="w-full p-4 border rounded-xl" value={formData.password} onChange={handleInputChange} />
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6">Professional Details</h2>
                <div className="space-y-4">
                  <select name="category_id" className="w-full p-4 border rounded-xl bg-white" value={formData.category_id} onChange={handleInputChange}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input type="text" name="service_type" placeholder="Service Type" className="w-full p-4 border rounded-xl" value={formData.service_type} onChange={handleInputChange} />
                  <input type="number" name="experience" placeholder="Experience (years)" className="w-full p-4 border rounded-xl" value={formData.experience} onChange={handleInputChange} />
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6">Address Details</h2>
                <div className="space-y-4">
                  <input type="text" name="address" placeholder="Address" className="w-full p-4 border rounded-xl" value={formData.address} onChange={handleInputChange} />
                  <input type="text" name="city" placeholder="City" className="w-full p-4 border rounded-xl" value={formData.city} onChange={handleInputChange} />
                  <input type="text" name="pincode" placeholder="Pincode" className="w-full p-4 border rounded-xl" value={formData.pincode} onChange={handleInputChange} />
                </div>
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6">Documents</h2>
                <div className="space-y-4">
                  <label className="block p-8 border-2 border-dashed rounded-xl text-center cursor-pointer hover:border-yellow-500">
                    <Upload className="mx-auto mb-2" /> Upload ID Proof (PDF/Image)
                    <input type="file" className="hidden" />
                  </label>
                  <label className="block p-8 border-2 border-dashed rounded-xl text-center cursor-pointer hover:border-yellow-500">
                    <Upload className="mx-auto mb-2" /> Upload Profile Photo
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </motion.div>
            )}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6">Availability</h2>
                <div className="space-y-4">
                  <p className="font-bold">Select Working Days</p>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <label key={day} className="flex items-center gap-2">
                      <input type="checkbox" onChange={e => setFormData({...formData, working_days: e.target.checked ? [...formData.working_days, day] : formData.working_days.filter(d => d !== day)})} /> {day}
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button onClick={prevStep} disabled={step === 1} className="px-6 py-3 border rounded-xl font-bold disabled:opacity-50">Previous</button>
            {step < 5 ? (
              <button onClick={nextStep} className="px-6 py-3 bg-black text-white rounded-xl font-bold">Next</button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold">
                {loading ? <Loader2 className="animate-spin" /> : 'Submit'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
