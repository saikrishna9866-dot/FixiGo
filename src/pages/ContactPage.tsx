import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Zap, Clock4, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from '../components/BackButton';
import { supabase } from '../lib/supabase';

export function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    serviceType: '',
    message: ''
  });
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: "How quickly can a professional reach my location?",
      answer: "For most services, we can have a professional at your doorstep within 2 hours of booking. For specialized services, it might take up to 24 hours."
    },
    {
      question: "Are your professionals verified?",
      answer: "Yes, 100% of our professionals undergo a strict background check, skill verification, and training process before they are allowed to take bookings."
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer: "We offer a 30-day service guarantee. If you're not satisfied, we will rework the service for free or provide a full refund."
    },
    {
      question: "How do I cancel or reschedule a booking?",
      answer: "You can easily cancel or reschedule your booking through the 'My Bookings' section in your account up to 2 hours before the scheduled time without any penalty."
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          email: formData.email,
          service_type: formData.serviceType,
          message: formData.message,
          status: 'pending'
        }]);

      if (error) throw error;

      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        serviceType: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error.message || 'Failed to send message. Please try again.';
      if (errorMessage.includes('relation "contact_messages" does not exist')) {
        toast.error('Database table "contact_messages" is missing. Please run the SQL schema in your Supabase dashboard.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <BackButton variant="ghost" className="px-0 hover:bg-transparent" />
      </div>
      {/* Hero Section */}
      <div className="bg-white py-16 md:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            We're here to help you with all your service needs. Reach out to us and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-yellow-50 py-8 border-b border-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="font-semibold text-gray-900">Verified Professionals</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                <Zap className="w-6 h-6" />
              </div>
              <span className="font-semibold text-gray-900">Fast Service</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                <Clock4 className="w-6 h-6" />
              </div>
              <span className="font-semibold text-gray-900">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 md:p-10 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-colors outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-colors outline-none"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-colors outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  required
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-colors outline-none bg-white"
                >
                  <option value="">Select a service</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrician">Electrician</option>
                  <option value="carpenter">Carpenter</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="appliance">Appliance Repair</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-colors outline-none resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 md:p-10 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-50 p-3 rounded-xl text-yellow-600 mt-1">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600">+1 (800) 123-4567</p>
                    <p className="text-gray-500 text-sm mt-1">Mon-Fri from 8am to 8pm</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-50 p-3 rounded-xl text-yellow-600 mt-1">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">support@fixigo.com</p>
                    <p className="text-gray-500 text-sm mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-50 p-3 rounded-xl text-yellow-600 mt-1">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Office</h3>
                    <p className="text-gray-600">123 Service Street, Suite 400<br />Tech District, NY 10001</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-yellow-50 p-3 rounded-xl text-yellow-600 mt-1">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Working Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 8:00 AM - 8:00 PM</p>
                    <p className="text-gray-600">Saturday - Sunday: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Find quick answers to common questions about our services.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-200 hover:border-yellow-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === index ? 'max-h-48 py-4 border-t border-gray-100' : 'max-h-0'
                  }`}
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
